import { Workshop, WorkshopRegistration } from "../models/Workshop.js";
import { Notification } from "../models/Notification.js";

/**
 * Workshop Controller
 */

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * @desc    Get all approved workshops
 * @route   GET /api/v1/workshops
 * @access  Public
 */
export const getWorkshops = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            level,
            locationType,
            upcoming = "true",
            search,
            sort = "date"
        } = req.query;
        const skip = (page - 1) * limit;

        const query = {
            "verification.status": "approved",
            status: { $in: ["upcoming", "ongoing"] }
        };

        if (upcoming === "true") {
            query.startDate = { $gte: new Date() };
        }

        if (category) query.category = category;
        if (level) query.level = level;
        if (locationType) query.locationType = locationType;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        let sortObj = { startDate: 1 };
        if (sort === "price_low") sortObj = { price: 1 };
        if (sort === "price_high") sortObj = { price: -1 };
        if (sort === "popular") sortObj = { bookedSpots: -1 };

        const workshops = await Workshop.find(query)
            .populate("instructor", "username avatar")
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Workshop.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                workshops: workshops.map(w => w.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get workshops error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch workshops"
        });
    }
};

/**
 * @desc    Get workshop by slug
 * @route   GET /api/v1/workshops/slug/:slug
 * @access  Public
 */
export const getWorkshopBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const workshop = await Workshop.findOne({
            slug,
            "verification.status": "approved"
        }).populate("instructor", "username avatar bio");

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }

        // Increment views
        await workshop.incrementViews();

        return res.status(200).json({
            success: true,
            data: {
                workshop: workshop.toSafeObject(),
                availableSpots: workshop.maxSpots - workshop.bookedSpots,
                isFull: workshop.bookedSpots >= workshop.maxSpots
            }
        });
    } catch (error) {
        console.error("Get workshop error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch workshop"
        });
    }
};

/**
 * @desc    Get workshop by ID
 * @route   GET /api/v1/workshops/:id
 * @access  Public
 */
export const getWorkshopById = async (req, res) => {
    try {
        const { id } = req.params;

        const workshop = await Workshop.findOne({
            _id: id,
            "verification.status": "approved"
        }).populate("instructor", "username avatar bio");

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                workshop: workshop.toSafeObject(),
                availableSpots: workshop.maxSpots - workshop.bookedSpots,
                isFull: workshop.bookedSpots >= workshop.maxSpots
            }
        });
    } catch (error) {
        console.error("Get workshop error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch workshop"
        });
    }
};

/**
 * @desc    Get workshop categories
 * @route   GET /api/v1/workshops/categories
 * @access  Public
 */
export const getWorkshopCategories = async (req, res) => {
    try {
        const categories = await Workshop.aggregate([
            {
                $match: {
                    "verification.status": "approved",
                    status: { $in: ["upcoming", "ongoing"] }
                }
            },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        console.error("Get categories error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};

// ============================================
// USER ENDPOINTS (Registration)
// ============================================

/**
 * @desc    Register for a workshop
 * @route   POST /api/v1/workshops/:id/register
 * @access  Private
 */
export const registerForWorkshop = async (req, res) => {
    try {
        const { id } = req.params;
        const { contactInfo, specialRequirements } = req.body;

        const workshop = await Workshop.findOne({
            _id: id,
            "verification.status": "approved",
            status: { $in: ["upcoming", "ongoing"] }
        });

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found or not available"
            });
        }

        // Check if workshop is full
        if (workshop.bookedSpots >= workshop.maxSpots) {
            return res.status(400).json({
                success: false,
                message: "Workshop is fully booked"
            });
        }

        // Check if user is already registered
        const existingRegistration = await WorkshopRegistration.findOne({
            workshop: id,
            user: req.userId,
            status: { $ne: "cancelled" }
        });

        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: "You are already registered for this workshop"
            });
        }

        // Validate contact info
        if (!contactInfo || !contactInfo.name || !contactInfo.email || !contactInfo.phone) {
            return res.status(400).json({
                success: false,
                message: "Contact information (name, email, phone) is required"
            });
        }

        // Create registration
        const registration = await WorkshopRegistration.create({
            workshop: workshop._id,
            user: req.userId,
            contactInfo,
            specialRequirements,
            payment: {
                amount: workshop.price,
                status: workshop.price === 0 ? "completed" : "pending"
            },
            status: workshop.price === 0 ? "confirmed" : "pending"
        });

        // Increment booked spots
        await workshop.incrementBookings();

        // Notify instructor
        await Notification.createNotification(
            workshop.instructor,
            "new_message",
            "New Workshop Registration",
            `Someone registered for your workshop "${workshop.title}"`,
            `/dashboard/vendor/workshops/${workshop._id}/participants`
        );

        return res.status(201).json({
            success: true,
            message: workshop.price === 0
                ? "Successfully registered for the workshop!"
                : "Registration created. Please complete payment to confirm.",
            data: {
                registration: registration.toSafeObject(),
                paymentRequired: workshop.price > 0
            }
        });
    } catch (error) {
        console.error("Register for workshop error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You are already registered for this workshop"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to register for workshop"
        });
    }
};

/**
 * @desc    Get my workshop registrations
 * @route   GET /api/v1/workshops/my-registrations
 * @access  Private
 */
export const getMyRegistrations = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const query = { user: req.userId };
        if (status) {
            query.status = status;
        }

        const registrations = await WorkshopRegistration.find(query)
            .populate({
                path: "workshop",
                select: "title slug images startDate endDate duration level locationType location instructor",
                populate: {
                    path: "instructor",
                    select: "username avatar"
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await WorkshopRegistration.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                registrations: registrations.map(r => r.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get my registrations error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch registrations"
        });
    }
};

/**
 * @desc    Cancel my registration
 * @route   POST /api/v1/workshops/registrations/:id/cancel
 * @access  Private
 */
export const cancelMyRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const registration = await WorkshopRegistration.findOne({
            _id: id,
            user: req.userId
        }).populate("workshop", "title instructor startDate");

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            });
        }

        if (registration.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Registration is already cancelled"
            });
        }

        // Check if workshop has already started
        if (new Date() >= registration.workshop.startDate) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel registration after workshop has started"
            });
        }

        registration.status = "cancelled";
        registration.cancellation = {
            reason: reason || "Cancelled by user",
            cancelledAt: new Date(),
            refundStatus: registration.payment.status === "completed" ? "pending" : "na"
        };
        await registration.save();

        // Decrement workshop booked spots
        await Workshop.findByIdAndUpdate(registration.workshop._id, {
            $inc: { bookedSpots: -1 }
        });

        // Notify instructor
        await Notification.createNotification(
            registration.workshop.instructor,
            "order_cancelled",
            "Workshop Registration Cancelled",
            `A participant cancelled their registration for "${registration.workshop.title}"`,
            `/dashboard/vendor/workshops/${registration.workshop._id}/participants`
        );

        return res.status(200).json({
            success: true,
            message: "Registration cancelled successfully"
        });
    } catch (error) {
        console.error("Cancel registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel registration"
        });
    }
};

// ============================================
// ARTIST/INSTRUCTOR ENDPOINTS
// ============================================

/**
 * @desc    Create a workshop (artist)
 * @route   POST /api/v1/artist/workshops
 * @access  Artist
 */
export const artistCreateWorkshop = async (req, res) => {
    try {
        const {
            title,
            description,
            images,
            price,
            originalPrice,
            duration,
            totalHours,
            level,
            startDate,
            endDate,
            schedule,
            maxSpots,
            includes,
            requirements,
            locationType,
            location,
            category,
            tags
        } = req.body;

        // Validation
        if (!title || !description || !level || !startDate || !endDate || !maxSpots || !locationType || !category || !duration) {
            return res.status(400).json({
                success: false,
                message: "Required fields: title, description, level, startDate, endDate, maxSpots, locationType, category, duration"
            });
        }

        // Validate dates
        if (new Date(startDate) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Start date must be in the future"
            });
        }

        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date"
            });
        }

        const workshop = await Workshop.create({
            title,
            description,
            instructor: req.userId,
            instructorName: req.user.username,
            images: images || [],
            price: price || 0,
            originalPrice,
            duration,
            totalHours,
            level,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            schedule: schedule || [],
            maxSpots,
            includes: includes || [],
            requirements: requirements || [],
            locationType,
            location: location || {},
            category,
            tags: tags || [],
            status: "draft",
            verification: { status: "pending" }
        });

        return res.status(201).json({
            success: true,
            message: "Workshop submitted for approval. You'll be notified once reviewed.",
            data: { workshop: workshop.toSafeObject() }
        });
    } catch (error) {
        console.error("Create workshop error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create workshop"
        });
    }
};

/**
 * @desc    Get my workshops (artist)
 * @route   GET /api/v1/artist/workshops
 * @access  Artist
 */
export const artistGetMyWorkshops = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const query = { instructor: req.userId };
        if (status) {
            query["verification.status"] = status;
        }

        const workshops = await Workshop.find(query)
            .sort({ startDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Workshop.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                workshops: workshops.map(w => ({
                    ...w.toSafeObject(),
                    availableSpots: w.maxSpots - w.bookedSpots
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get my workshops error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch workshops"
        });
    }
};

/**
 * @desc    Get workshop participants (artist)
 * @route   GET /api/v1/artist/workshops/:id/participants
 * @access  Artist
 */
export const artistGetWorkshopParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        // Verify ownership
        const workshop = await Workshop.findOne({
            _id: id,
            instructor: req.userId
        });

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }

        const registrations = await WorkshopRegistration.find({
            workshop: id,
            status: { $in: ["confirmed", "attended"] }
        })
            .populate("user", "username email avatar")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await WorkshopRegistration.countDocuments({
            workshop: id,
            status: { $in: ["confirmed", "attended"] }
        });

        return res.status(200).json({
            success: true,
            data: {
                workshop: {
                    _id: workshop._id,
                    title: workshop.title,
                    maxSpots: workshop.maxSpots,
                    bookedSpots: workshop.bookedSpots
                },
                participants: registrations.map(r => r.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get participants error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch participants"
        });
    }
};

/**
 * @desc    Mark attendance (artist)
 * @route   PUT /api/v1/artist/workshops/registrations/:id/attendance
 * @access  Artist
 */
export const artistMarkAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { attended } = req.body;

        const registration = await WorkshopRegistration.findById(id)
            .populate("workshop", "instructor title");

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            });
        }

        // Verify ownership
        if (registration.workshop.instructor.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        registration.status = attended ? "attended" : "missed";
        await registration.save();

        return res.status(200).json({
            success: true,
            message: `Marked as ${attended ? "attended" : "missed"}`
        });
    } catch (error) {
        console.error("Mark attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark attendance"
        });
    }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @desc    Get all workshops (admin)
 * @route   GET /api/v1/admin/workshops
 * @access  Admin
 */
export const adminGetAllWorkshops = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "pending" } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status !== "all") {
            query["verification.status"] = status;
        }

        const workshops = await Workshop.find(query)
            .populate("instructor", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Workshop.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                workshops,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Admin get workshops error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch workshops"
        });
    }
};

/**
 * @desc    Approve workshop (admin)
 * @route   POST /api/v1/admin/workshops/:id/approve
 * @access  Admin
 */
export const adminApproveWorkshop = async (req, res) => {
    try {
        const { id } = req.params;

        const workshop = await Workshop.findById(id);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }

        workshop.verification.status = "approved";
        workshop.verification.reviewedBy = req.userId;
        workshop.verification.reviewedAt = new Date();
        workshop.status = "upcoming";
        await workshop.save();

        // Notify instructor
        await Notification.createNotification(
            workshop.instructor,
            "product_approved",
            "Workshop Approved",
            `Your workshop "${workshop.title}" has been approved and is now live!`,
            `/workshop/${workshop.slug}`
        );

        return res.status(200).json({
            success: true,
            message: "Workshop approved successfully"
        });
    } catch (error) {
        console.error("Admin approve workshop error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve workshop"
        });
    }
};

/**
 * @desc    Reject workshop (admin)
 * @route   POST /api/v1/admin/workshops/:id/reject
 * @access  Admin
 */
export const adminRejectWorkshop = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const workshop = await Workshop.findById(id);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: "Workshop not found"
            });
        }

        workshop.verification.status = "rejected";
        workshop.verification.reviewedBy = req.userId;
        workshop.verification.reviewedAt = new Date();
        workshop.verification.rejectionReason = reason || "Workshop does not meet our guidelines";
        await workshop.save();

        // Notify instructor
        await Notification.createNotification(
            workshop.instructor,
            "product_rejected",
            "Workshop Not Approved",
            `Your workshop "${workshop.title}" was not approved. Reason: ${workshop.verification.rejectionReason}`,
            null
        );

        return res.status(200).json({
            success: true,
            message: "Workshop rejected"
        });
    } catch (error) {
        console.error("Admin reject workshop error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject workshop"
        });
    }
};

