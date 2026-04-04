import { Service, ServiceBooking } from "../models/Service.js";
import { StudioHireBooking } from "../models/StudioHireBooking.js";
import { PlatformServiceBooking } from "../models/PlatformServiceBooking.js";
import { StudioServiceConfig } from "../models/StudioServiceConfig.js";
import { Notification } from "../models/Notification.js";

/**
 * Service Controller
 */

const DEFAULT_STUDIO_SERVICE_CONFIG = {
    key: "studio_hire",
    serviceName: "Studio Hire",
    title: "Studio Hire",
    subtitle: "Update this content from the admin editor.",
    city: "Nagpur",
    heroImage: null,
    galleryImages: [],
    whatWeOffer: [],
    perfectFor: [],
    equipmentCategories: [],
    pricingOptions: [],
    responseTimeText: "",
    discountRules: {
        fiveDayDiscountPerDay: 0
    },
    isActive: true
};

const titleFromKey = (key = "") =>
    String(key || "")
        .trim()
        .replace(/[_-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const getPlatformDefaults = (key) => ({
    key,
    serviceName: titleFromKey(key) || "Service",
    title: titleFromKey(key) || "Service",
    subtitle: "Update this content from the admin editor.",
    city: "Nagpur",
    heroImage: null,
    galleryImages: [],
    whatWeOffer: [],
    perfectFor: [],
    equipmentCategories: [],
    pricingOptions: [],
    responseTimeText: "",
    discountRules: {
        fiveDayDiscountPerDay: 0
    },
    isActive: true
});

const toImage = (value) => {
    if (!value || typeof value !== "object" || !value.url) return null;
    return {
        url: String(value.url).trim(),
        publicId: value.publicId ? String(value.publicId).trim() : null
    };
};

const getStudioConfig = async () => StudioServiceConfig.findOne({ key: "studio_hire" });
const getPlatformConfig = async (key) => StudioServiceConfig.findOne({ key });

const toPricingId = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const normalizeStudioPayload = (body = {}, defaults = DEFAULT_STUDIO_SERVICE_CONFIG) => {
    const normalized = {
        serviceName: String(body.serviceName || defaults.serviceName).trim(),
        title: String(body.title || defaults.title).trim(),
        subtitle: String(body.subtitle || defaults.subtitle).trim(),
        city: String(body.city || defaults.city).trim(),
        heroImage: toImage(body.heroImage),
        galleryImages: Array.isArray(body.galleryImages)
            ? body.galleryImages.map(toImage).filter(Boolean)
            : [],
        whatWeOffer: Array.isArray(body.whatWeOffer)
            ? body.whatWeOffer
                .map((item) => ({
                    title: String(item?.title || "").trim(),
                    description: String(item?.description || "").trim(),
                    image: toImage(item?.image)
                }))
                .filter((item) => item.title || item.description || item.image)
            : [],
        perfectFor: Array.isArray(body.perfectFor)
            ? body.perfectFor.map((item) => String(item || "").trim()).filter(Boolean)
            : [],
        equipmentCategories: Array.isArray(body.equipmentCategories)
            ? body.equipmentCategories
                .map((category) => ({
                    name: String(category?.name || "").trim(),
                    image: toImage(category?.image),
                    items: Array.isArray(category?.items)
                        ? category.items.map((item) => String(item || "").trim()).filter(Boolean)
                        : []
                }))
                .filter((category) => category.name || category.image || category.items.length > 0)
            : [],
        pricingOptions: Array.isArray(body.pricingOptions)
            ? body.pricingOptions
                .map((option) => {
                    const name = String(option?.name || "").trim();
                    const price = Number(option?.price ?? 0);
                    const billingUnit = option?.billingUnit === "hour" ? "hour" : "day";

                    return {
                        id: toPricingId(option?.id || name),
                        name,
                        price: Number.isFinite(price) && price >= 0 ? price : 0,
                        billingUnit,
                        description: String(option?.description || "").trim()
                    };
                })
                .filter((option) => option.id && option.name)
            : [],
        responseTimeText: String(body.responseTimeText || defaults.responseTimeText).trim(),
        discountRules: {
            fiveDayDiscountPerDay: Number(body?.discountRules?.fiveDayDiscountPerDay ?? defaults.discountRules.fiveDayDiscountPerDay)
        },
        isActive: body.isActive !== false
    };

    if (!Number.isFinite(normalized.discountRules.fiveDayDiscountPerDay) || normalized.discountRules.fiveDayDiscountPerDay < 0) {
        normalized.discountRules.fiveDayDiscountPerDay = defaults.discountRules.fiveDayDiscountPerDay;
    }

    return normalized;
};

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * @desc    Get all approved services
 * @route   GET /api/v1/services
 * @access  Public
 */
export const getServices = async (req, res) => {
    try {
        const { page = 1, limit = 12, category, search, sort = "recent" } = req.query;
        const skip = (page - 1) * limit;

        const query = {
            "verification.status": "approved",
            isAvailable: true
        };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        let sortObj = { createdAt: -1 };
        if (sort === "price_low") sortObj = { startingPrice: 1 };
        if (sort === "price_high") sortObj = { startingPrice: -1 };
        if (sort === "popular") sortObj = { "stats.bookings": -1 };

        const services = await Service.find(query)
            .populate("artist", "username avatar")
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Service.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                services: services.map(s => s.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get services error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch services"
        });
    }
};

/**
 * @desc    Get service by slug
 * @route   GET /api/v1/services/slug/:slug
 * @access  Public
 */
export const getServiceBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const service = await Service.findOne({
            slug,
            "verification.status": "approved"
        }).populate("artist", "username avatar bio");

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Increment views
        await service.incrementViews();

        return res.status(200).json({
            success: true,
            data: { service: service.toSafeObject() }
        });
    } catch (error) {
        console.error("Get service error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch service"
        });
    }
};

/**
 * @desc    Get service categories
 * @route   GET /api/v1/services/categories
 * @access  Public
 */
export const getServiceCategories = async (req, res) => {
    try {
        const categories = await Service.aggregate([
            { $match: { "verification.status": "approved", isAvailable: true } },
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

/**
 * @desc    Get studio-hire configuration
 * @route   GET /api/v1/services/studio-hire
 * @access  Public
 */
export const getStudioHireConfig = async (req, res) => {
    try {
        const config = await getStudioConfig();

        return res.status(200).json({
            success: true,
            data: { studio: config ? config.toSafeObject() : null }
        });
    } catch (error) {
        console.error("Get studio config error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch studio configuration"
        });
    }
};

/**
 * @desc    Get platform service landing configuration (Photography, Calligraphy, etc.)
 * @route   GET /api/v1/services/platform/:key
 * @access  Public
 */
export const getPlatformServiceConfig = async (req, res) => {
    try {
        const key = String(req.params.key || "").trim().toLowerCase();
        if (!key) {
            return res.status(400).json({ success: false, message: "Service key is required" });
        }

        const config = await getPlatformConfig(key);
        return res.status(200).json({
            success: true,
            data: { service: config ? config.toSafeObject() : null }
        });
    } catch (error) {
        console.error("Get platform service config error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch service configuration"
        });
    }
};

/**
 * @desc    Admin create/update studio-hire configuration
 * @route   PUT /api/v1/services/studio-hire
 * @access  Private/Admin
 */
export const adminUpsertStudioHireConfig = async (req, res) => {
    try {
        const payload = normalizeStudioPayload(req.body);

        const config = await StudioServiceConfig.findOneAndUpdate(
            { key: "studio_hire" },
            { $set: payload },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            success: true,
            message: "Studio configuration updated successfully",
            data: { studio: config.toSafeObject() }
        });
    } catch (error) {
        console.error("Update studio config error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update studio configuration"
        });
    }
};

/**
 * @desc    Admin create/update platform service landing configuration
 * @route   PUT /api/v1/services/platform/:key
 * @access  Private/Admin
 */
export const adminUpsertPlatformServiceConfig = async (req, res) => {
    try {
        const key = String(req.params.key || "").trim().toLowerCase();
        if (!key) {
            return res.status(400).json({ success: false, message: "Service key is required" });
        }

        const defaults = getPlatformDefaults(key);
        const payload = normalizeStudioPayload(req.body, defaults);

        const config = await StudioServiceConfig.findOneAndUpdate(
            { key },
            { $set: { ...payload, key } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            success: true,
            message: "Service configuration updated successfully",
            data: { service: config.toSafeObject() }
        });
    } catch (error) {
        console.error("Update platform service config error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update service configuration"
        });
    }
};

// ============================================
// USER ENDPOINTS (Booking)
// ============================================

/**
 * @desc    Submit studio-hire booking request
 * @route   POST /api/v1/services/studio-hire/book
 * @access  Public (auth optional)
 */
export const bookStudioHire = async (req, res) => {
    try {
        const { name, email, phone, date, durationValue, hours, pricingOptionId, purpose, message } = req.body;

        if (!name || !email || !phone || !date) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone, and date are required"
            });
        }

        const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
        if (cleanPhone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be 10 digits"
            });
        }

        const bookingDate = new Date(date);
        if (Number.isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking date"
            });
        }

        const parsedDuration = Number(durationValue ?? hours ?? 1);
        if (!Number.isFinite(parsedDuration) || parsedDuration < 1) {
            return res.status(400).json({
                success: false,
                message: "Duration must be at least 1"
            });
        }

        const studioConfig = await getStudioConfig();
        if (!studioConfig) {
            return res.status(400).json({
                success: false,
                message: "Studio configuration is not available yet"
            });
        }
        const selectedPricing = studioConfig.pricingOptions.find(
            (option) => option.id === String(pricingOptionId || "").trim()
        ) || studioConfig.pricingOptions[0];

        if (!selectedPricing) {
            return res.status(400).json({
                success: false,
                message: "No studio pricing option is configured"
            });
        }

        const subtotal = Number(selectedPricing.price) * parsedDuration;
        let discount = 0;
        if (parsedDuration >= 5) {
            const discountPerDay = Number(studioConfig.discountRules?.fiveDayDiscountPerDay || 0);
            discount = discountPerDay * parsedDuration;
        }
        const total = Math.max(subtotal - discount, 0);

        const booking = await StudioHireBooking.create({
            user: req.userId || null,
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: cleanPhone,
            bookingDate,
            durationValue: parsedDuration,
            pricingOption: {
                id: selectedPricing.id,
                name: selectedPricing.name,
                billingUnit: selectedPricing.billingUnit,
                price: Number(selectedPricing.price)
            },
            pricingBreakdown: {
                subtotal,
                discount,
                total
            },
            city: studioConfig.city,
            purpose: String(purpose || "").trim(),
            message: String(message || "").trim()
        });

        return res.status(201).json({
            success: true,
            message: "Booking request submitted! We will contact you shortly.",
            data: {
                booking: booking.toSafeObject(),
                pricing: {
                    option: selectedPricing,
                    subtotal,
                    discount,
                    total
                }
            }
        });
    } catch (error) {
        console.error("Studio-hire booking error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit booking request"
        });
    }
};

/**
 * @desc    Submit platform service booking request (Photography, Calligraphy, etc.)
 * @route   POST /api/v1/services/platform/:key/book
 * @access  Public (auth optional)
 */
export const bookPlatformService = async (req, res) => {
    try {
        const key = String(req.params.key || "").trim().toLowerCase();
        if (!key) {
            return res.status(400).json({ success: false, message: "Service key is required" });
        }

        const { name, email, phone, date, durationValue, hours, pricingOptionId, purpose, message } = req.body;

        if (!name || !email || !phone || !date) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone, and date are required"
            });
        }

        const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
        if (cleanPhone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be 10 digits"
            });
        }

        const bookingDate = new Date(date);
        if (Number.isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking date"
            });
        }

        const parsedDuration = Number(durationValue ?? hours ?? 1);
        if (!Number.isFinite(parsedDuration) || parsedDuration < 1) {
            return res.status(400).json({
                success: false,
                message: "Duration must be at least 1"
            });
        }

        const serviceConfig = await getPlatformConfig(key);
        if (!serviceConfig) {
            return res.status(400).json({
                success: false,
                message: "Service configuration is not available yet"
            });
        }

        const selectedPricing = serviceConfig.pricingOptions.find(
            (option) => option.id === String(pricingOptionId || "").trim()
        ) || serviceConfig.pricingOptions[0];

        if (!selectedPricing) {
            return res.status(400).json({
                success: false,
                message: "No pricing option is configured"
            });
        }

        const subtotal = Number(selectedPricing.price) * parsedDuration;
        let discount = 0;
        if (parsedDuration >= 5) {
            const discountPerDay = Number(serviceConfig.discountRules?.fiveDayDiscountPerDay || 0);
            discount = discountPerDay * parsedDuration;
        }
        const total = Math.max(subtotal - discount, 0);

        const booking = await PlatformServiceBooking.create({
            serviceKey: key,
            user: req.userId || null,
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: cleanPhone,
            bookingDate,
            durationValue: parsedDuration,
            pricingOption: {
                id: selectedPricing.id,
                name: selectedPricing.name,
                billingUnit: selectedPricing.billingUnit,
                price: Number(selectedPricing.price)
            },
            pricingBreakdown: {
                subtotal,
                discount,
                total
            },
            city: serviceConfig.city,
            purpose: String(purpose || "").trim(),
            message: String(message || "").trim()
        });

        return res.status(201).json({
            success: true,
            message: "Booking request submitted! We will contact you shortly.",
            data: {
                booking: booking.toSafeObject(),
                pricing: {
                    option: selectedPricing,
                    subtotal,
                    discount,
                    total
                }
            }
        });
    } catch (error) {
        console.error("Platform booking error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit booking request"
        });
    }
};

/**
 * @desc    Book a service
 * @route   POST /api/v1/services/:id/book
 * @access  Private
 */
export const bookService = async (req, res) => {
    try {
        const { id } = req.params;
        const { packageName, requirements, contactInfo, attachments } = req.body;

        const service = await Service.findOne({
            _id: id,
            "verification.status": "approved",
            isAvailable: true
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found or not available"
            });
        }

        // Find selected package
        let selectedPackage = service.pricing.find(p => p.name === packageName);
        if (!selectedPackage && (!service.pricing || service.pricing.length === 0)) {
            selectedPackage = {
                name: packageName || "Basic",
                price: Number(service.startingPrice || 0)
            };
        }
        if (!selectedPackage) {
            return res.status(400).json({
                success: false,
                message: "Invalid package selected"
            });
        }

        // Validate contact info
        if (!contactInfo || !contactInfo.name || !contactInfo.email || !contactInfo.phone) {
            return res.status(400).json({
                success: false,
                message: "Contact information (name, email, phone) is required"
            });
        }

        // Create booking
        const booking = await ServiceBooking.create({
            user: req.userId,
            service: service._id,
            artist: service.artist,
            package: {
                name: selectedPackage.name,
                price: selectedPackage.price
            },
            requirements,
            contactInfo,
            attachments: attachments || [],
            payment: {
                totalAmount: selectedPackage.price,
                status: "pending"
            }
        });

        // Update service stats
        service.stats.bookings += 1;
        await service.save();

        // Notify artist
        await Notification.createNotification(
            service.artist,
            "new_message",
            "New Service Booking",
            `You have a new booking for ${service.title}`,
            `/dashboard/vendor/service-bookings/${booking._id}`
        );

        return res.status(201).json({
            success: true,
            message: "Service booked successfully. The artist will contact you soon.",
            data: { booking: booking.toSafeObject() }
        });
    } catch (error) {
        console.error("Book service error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to book service"
        });
    }
};

/**
 * @desc    Get my service bookings
 * @route   GET /api/v1/services/my-bookings
 * @access  Private
 */
export const getMyBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const query = { user: req.userId };
        if (status) {
            query.status = status;
        }

        const bookings = await ServiceBooking.find(query)
            .populate("service", "title slug images category")
            .populate("artist", "username avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ServiceBooking.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                bookings: bookings.map(b => b.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get my bookings error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
};

/**
 * @desc    Cancel my booking
 * @route   POST /api/v1/services/bookings/:id/cancel
 * @access  Private
 */
export const cancelMyBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const booking = await ServiceBooking.findOne({
            _id: id,
            user: req.userId
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (!["pending", "confirmed"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: "This booking cannot be cancelled"
            });
        }

        booking.status = "cancelled";
        booking.cancellation = {
            reason: reason || "Cancelled by user",
            cancelledBy: "user",
            cancelledAt: new Date()
        };
        await booking.save();

        // Notify artist
        await Notification.createNotification(
            booking.artist,
            "order_cancelled",
            "Booking Cancelled",
            `A booking for your service has been cancelled`,
            `/dashboard/vendor/service-bookings/${booking._id}`
        );

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        });
    } catch (error) {
        console.error("Cancel booking error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel booking"
        });
    }
};

// ============================================
// ARTIST ENDPOINTS
// ============================================

/**
 * @desc    Create a service (artist)
 * @route   POST /api/v1/artist/services
 * @access  Artist
 */
export const artistCreateService = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            icon,
            images,
            startingPrice,
            pricing,
            deliveryTime,
            features,
            customizable
        } = req.body;

        // Validation
        if (!title || !description || !category || !startingPrice || !deliveryTime) {
            return res.status(400).json({
                success: false,
                message: "Title, description, category, startingPrice, and deliveryTime are required"
            });
        }

        const service = await Service.create({
            title,
            description,
            category,
            icon: icon || "🎨",
            images: images || [],
            artist: req.userId,
            startingPrice,
            pricing: pricing || [],
            deliveryTime,
            features: features || [],
            customizable: customizable !== false,
            verification: { status: "pending" }
        });

        return res.status(201).json({
            success: true,
            message: "Service submitted for approval. You'll be notified once reviewed.",
            data: { service: service.toSafeObject() }
        });
    } catch (error) {
        console.error("Create service error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create service"
        });
    }
};

/**
 * @desc    Get my services (artist)
 * @route   GET /api/v1/artist/services
 * @access  Artist
 */
export const artistGetMyServices = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const query = { artist: req.userId };
        if (status) {
            query["verification.status"] = status;
        }

        const services = await Service.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Service.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                services: services.map(s => s.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get my services error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch services"
        });
    }
};

/**
 * @desc    Update my service (artist)
 * @route   PUT /api/v1/artist/services/:id
 * @access  Artist
 */
export const artistUpdateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const service = await Service.findOne({
            _id: id,
            artist: req.userId
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Don't allow changing certain fields
        delete updates.artist;
        delete updates.verification;
        delete updates.stats;
        delete updates.slug;

        // Update fields
        Object.keys(updates).forEach(key => {
            service[key] = updates[key];
        });

        // Re-submit for approval if key fields changed
        if (updates.title || updates.description || updates.pricing) {
            service.verification.status = "pending";
        }

        await service.save();

        return res.status(200).json({
            success: true,
            message: service.verification.status === "pending"
                ? "Service updated and submitted for re-approval"
                : "Service updated successfully",
            data: { service: service.toSafeObject() }
        });
    } catch (error) {
        console.error("Update service error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update service"
        });
    }
};

/**
 * @desc    Get service bookings for artist
 * @route   GET /api/v1/artist/service-bookings
 * @access  Artist
 */
export const artistGetServiceBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const query = { artist: req.userId };
        if (status) {
            query.status = status;
        }

        const bookings = await ServiceBooking.find(query)
            .populate("service", "title slug")
            .populate("user", "username email avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ServiceBooking.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                bookings: bookings.map(b => b.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get service bookings error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
};

/**
 * @desc    Update booking status (artist)
 * @route   PUT /api/v1/artist/service-bookings/:id/status
 * @access  Artist
 */
export const artistUpdateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const validStatuses = ["confirmed", "in_progress", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const booking = await ServiceBooking.findOne({
            _id: id,
            artist: req.userId
        }).populate("service", "title");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const oldStatus = booking.status;
        booking.status = status;

        // Update timeline
        if (status === "confirmed") booking.timeline.confirmedAt = new Date();
        if (status === "in_progress") booking.timeline.startedAt = new Date();
        if (status === "completed") booking.timeline.completedAt = new Date();

        if (note) booking.artistNote = note;

        if (status === "cancelled") {
            booking.cancellation = {
                reason: note || "Cancelled by artist",
                cancelledBy: "artist",
                cancelledAt: new Date()
            };
        }

        await booking.save();

        // Notify user
        const notificationMessages = {
            confirmed: "Your service booking has been confirmed",
            in_progress: "Work has started on your service booking",
            completed: "Your service has been completed",
            cancelled: "Your service booking has been cancelled by the artist"
        };

        await Notification.createNotification(
            booking.user,
            status === "cancelled" ? "order_cancelled" : "order_confirmed",
            `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            notificationMessages[status],
            `/dashboard/user/service-bookings/${booking._id}`
        );

        return res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`,
            data: { booking: booking.toSafeObject() }
        });
    } catch (error) {
        console.error("Update booking status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update booking status"
        });
    }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @desc    Get all services (admin)
 * @route   GET /api/v1/admin/services
 * @access  Admin
 */
export const adminGetAllServices = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "pending" } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status !== "all") {
            query["verification.status"] = status;
        }

        const services = await Service.find(query)
            .populate("artist", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Service.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                services,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Admin get services error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch services"
        });
    }
};

/**
 * @desc    Approve service (admin)
 * @route   POST /api/v1/admin/services/:id/approve
 * @access  Admin
 */
export const adminApproveService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        service.verification.status = "approved";
        service.verification.reviewedBy = req.userId;
        service.verification.reviewedAt = new Date();
        await service.save();

        // Notify artist
        await Notification.createNotification(
            service.artist,
            "product_approved",
            "Service Approved",
            `Your service "${service.title}" has been approved and is now live!`,
            `/services/${service.slug}`
        );

        return res.status(200).json({
            success: true,
            message: "Service approved successfully"
        });
    } catch (error) {
        console.error("Admin approve service error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve service"
        });
    }
};

/**
 * @desc    Reject service (admin)
 * @route   POST /api/v1/admin/services/:id/reject
 * @access  Admin
 */
export const adminRejectService = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        service.verification.status = "rejected";
        service.verification.reviewedBy = req.userId;
        service.verification.reviewedAt = new Date();
        service.verification.rejectionReason = reason || "Service does not meet our guidelines";
        await service.save();

        // Notify artist
        await Notification.createNotification(
            service.artist,
            "product_rejected",
            "Service Not Approved",
            `Your service "${service.title}" was not approved. Reason: ${service.verification.rejectionReason}`,
            null
        );

        return res.status(200).json({
            success: true,
            message: "Service rejected"
        });
    } catch (error) {
        console.error("Admin reject service error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject service"
        });
    }
};


