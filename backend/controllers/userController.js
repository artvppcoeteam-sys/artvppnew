import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import { PendingAction } from "../models/PendingAction.js";
import { sendArtistStatusEmail, sendArtistActionEmail } from "../utils/sendEmail.js";

/**
 * User Controller
 * Handles user profile, artist applications, and admin user management
 *
 * IMPORTANT: Artists cannot directly change their:
 * - name, phone number, email, location
 * All these changes must go through admin approval
 */

// ===========================================
// PROFILE MANAGEMENT
// ===========================================

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/user/profile
 * @access  Private
 *
 * NOTE: Artists cannot update name, phone, email, location directly
 * They must use /api/v1/user/request-profile-edit
 */
export const updateProfile = async (req, res) => {
    try {
        const { username, firstName, lastName, gender, bio, phone, college } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // IMPORTANT: Artists cannot change sensitive fields directly
        if (user.role === "artist") {
            // Artists can only update bio and college directly
            if (username || firstName || lastName || phone) {
                return res.status(403).json({
                    success: false,
                    message: "Artists cannot change name or phone directly. Please submit a profile edit request."
                });
            }

            // Update only allowed fields for artists
            if (bio !== undefined) user.bio = bio;
            if (college !== undefined) user.college = college;
            if (gender !== undefined) user.gender = gender;
        } else {
            // Regular users can update all fields
            if (username) user.username = username;
            if (firstName !== undefined) user.firstName = firstName;
            if (lastName !== undefined) user.lastName = lastName;
            if (gender !== undefined) user.gender = gender;
            if (bio !== undefined) user.bio = bio;
            if (phone !== undefined) user.phone = phone;
            if (college !== undefined) user.college = college;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: user.toSafeObject()
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

/**
 * @desc    Artist: Request profile edit (goes to admin for approval)
 * @route   POST /api/v1/user/request-profile-edit
 * @access  Private/Artist
 */
export const requestProfileEdit = async (req, res) => {
    try {
        const artistId = req.userId;
        const { fullName, phone, email, street, city, state, pincode, artistNote } = req.body;

        const user = await User.findById(artistId);
        if (!user || user.role !== "artist") {
            return res.status(403).json({
                success: false,
                message: "Only artists can request profile edits"
            });
        }

        // Check for existing pending request
        const existingRequest = await PendingAction.findOne({
            artist: artistId,
            actionType: "edit_profile",
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending profile edit request"
            });
        }

        // Build changes object
        const changes = {};
        if (fullName && fullName !== user.username) changes.fullName = fullName;
        if (phone && phone !== user.phone) changes.phone = phone;
        if (email && email !== user.email) changes.email = email;

        // Address changes (if user has artist application)
        if (street || city || state || pincode) {
            changes.address = { street, city, state, pincode };
        }

        if (Object.keys(changes).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No changes detected"
            });
        }

        const pendingAction = await PendingAction.create({
            artist: artistId,
            actionType: "edit_profile",
            status: "pending",
            data: {
                changes,
                originalData: {
                    fullName: user.username,
                    phone: user.phone,
                    email: user.email
                }
            },
            artistNote: artistNote || null
        });

        return res.status(200).json({
            success: true,
            message: "Profile edit request submitted for admin review",
            data: {
                requestId: pendingAction._id,
                status: "pending"
            }
        });
    } catch (error) {
        console.error("Request profile edit error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit profile edit request"
        });
    }
};

/**
 * @desc    Change password (when logged in)
 * @route   PUT /api/v1/user/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.userId).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user has password (might be Google-only)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "Cannot change password for Google-only accounts"
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Logout from all other devices
        await Session.deleteMany({ userId: user._id });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please login again."
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to change password"
        });
    }
};

// ===========================================
// ARTIST APPLICATION
// ===========================================

/**
 * @desc    Apply to become an artist
 * @route   POST /api/v1/user/apply-artist
 * @access  Private
 */
export const applyForArtist = async (req, res) => {
    try {
        const { portfolio } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if already an artist
        if (user.role === "artist") {
            return res.status(400).json({
                success: false,
                message: "You are already an artist"
            });
        }

        // Check if already has pending application
        if (user.artistRequest.status === "pending") {
            return res.status(400).json({
                success: false,
                message: "You already have a pending application"
            });
        }

        // Update artist request
        user.artistRequest = {
            status: "pending",
            requestedAt: new Date(),
            portfolio,
            reviewedAt: null,
            reviewedBy: null,
            rejectionReason: null
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Artist application submitted successfully. We'll review it soon!",
            data: {
                status: user.artistRequest.status,
                requestedAt: user.artistRequest.requestedAt
            }
        });
    } catch (error) {
        console.error("Apply for artist error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit application"
        });
    }
};

/**
 * @desc    Get artist application status
 * @route   GET /api/v1/user/artist-status
 * @access  Private
 */
export const getArtistStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Artist status fetched",
            data: {
                role: user.role,
                artistRequest: user.artistRequest
            }
        });
    } catch (error) {
        console.error("Get artist status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch status"
        });
    }
};

// ===========================================
// ADMIN: USER MANAGEMENT
// ===========================================

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/v1/user/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;

        // Build query
        const query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(query)
            .select("-password -otp -otpExpiry -verificationToken")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get all users error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

/**
 * @desc    Get pending artist applications (admin only)
 * @route   GET /api/v1/user/admin/artist-applications
 * @access  Private/Admin
 */
export const getPendingArtistApplications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const users = await User.find({ "artistRequest.status": "pending" })
            .select("username email avatar artistRequest createdAt")
            .sort({ "artistRequest.requestedAt": 1 }) // Oldest first
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments({ "artistRequest.status": "pending" });

        return res.status(200).json({
            success: true,
            message: "Pending applications fetched",
            data: {
                applications: users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get pending applications error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch applications"
        });
    }
};

/**
 * @desc    Review artist application (approve/reject)
 * @route   PUT /api/v1/user/admin/review-artist/:userId
 * @access  Private/Admin
 */
export const reviewArtistApplication = async (req, res) => {
    try {
        const { userId } = req.params;
        const { action, rejectionReason } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.artistRequest.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "No pending application found for this user"
            });
        }

        if (action === "approve") {
            user.role = "artist";
            user.artistRequest.status = "approved";
            user.artistRequest.reviewedAt = new Date();
            user.artistRequest.reviewedBy = req.userId;
        } else if (action === "reject") {
            user.artistRequest.status = "rejected";
            user.artistRequest.reviewedAt = new Date();
            user.artistRequest.reviewedBy = req.userId;
            user.artistRequest.rejectionReason = rejectionReason;
        }

        await user.save();

        // Send email notification (non-blocking)
        sendArtistStatusEmail(
            user.email,
            user.username,
            action === "approve" ? "approved" : "rejected",
            rejectionReason
        ).catch(console.error);

        return res.status(200).json({
            success: true,
            message: `Application ${action}d successfully`,
            data: {
                userId: user._id,
                role: user.role,
                artistRequest: user.artistRequest
            }
        });
    } catch (error) {
        console.error("Review application error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to review application"
        });
    }
};

/**
 * @desc    Update user role (admin only)
 * @route   PUT /api/v1/user/admin/role/:userId
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        // Validate role
        if (!["user", "artist", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // Prevent admin from changing their own role
        if (userId === req.userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own role"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.role = role;

        // If promoted to artist, update artist request
        if (role === "artist" && user.artistRequest.status !== "approved") {
            user.artistRequest.status = "approved";
            user.artistRequest.reviewedAt = new Date();
            user.artistRequest.reviewedBy = req.userId;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: {
                user: user.toSafeObject()
            }
        });
    } catch (error) {
        console.error("Update role error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update role"
        });
    }
};

/**
 * @desc    Deactivate/Activate user account (admin only)
 * @route   PUT /api/v1/user/admin/status/:userId
 * @access  Private/Admin
 */
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deactivating themselves
        if (userId === req.userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        // If deactivated, logout from all sessions
        if (!user.isActive) {
            await Session.deleteMany({ userId: user._id });
        }

        return res.status(200).json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
            data: {
                userId: user._id,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error("Toggle status error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user status"
        });
    }
};

// ===========================================
// ADMIN: PROFILE EDIT REQUESTS
// ===========================================

/**
 * @desc    Admin: Get pending profile edit requests
 * @route   GET /api/v1/user/admin/profile-requests
 * @access  Private/Admin
 */
export const adminGetProfileRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = "pending" } = req.query;

        const query = { actionType: "edit_profile" };
        if (status !== "all") query.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [requests, total] = await Promise.all([
            PendingAction.find(query)
                .populate("artist", "username email avatar role")
                .populate("reviewedBy", "username")
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(Number(limit)),
            PendingAction.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                requests: requests.map(r => r.toSafeObject()),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error("Admin get profile requests error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch requests"
        });
    }
};

/**
 * @desc    Admin: Approve profile edit request
 * @route   PUT /api/v1/user/admin/profile-requests/:requestId/approve
 * @access  Private/Admin
 */
export const adminApproveProfileEdit = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.userId;

        const request = await PendingAction.findById(requestId)
            .populate("artist", "email username");

        if (!request || request.actionType !== "edit_profile") {
            return res.status(404).json({
                success: false,
                message: "Profile edit request not found"
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status}`
            });
        }

        // Apply changes to user
        const user = await User.findById(request.artist._id);
        if (user) {
            const changes = request.data.changes;
            if (changes.fullName) user.username = changes.fullName;
            if (changes.phone) user.phone = changes.phone;
            if (changes.email) user.email = changes.email;
            await user.save();
        }

        // Update request
        request.status = "approved";
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        request.artistNotified = true;
        await request.save();

        // Send email
        await sendArtistActionEmail(
            request.artist.email,
            request.artist.username,
            "approved",
            "edit_profile",
            "Your profile update has been approved."
        ).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "Profile edit approved. Artist has been notified."
        });
    } catch (error) {
        console.error("Admin approve profile edit error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve request"
        });
    }
};

/**
 * @desc    Admin: Reject profile edit request
 * @route   PUT /api/v1/user/admin/profile-requests/:requestId/reject
 * @access  Private/Admin
 */
export const adminRejectProfileEdit = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.userId;
        const { rejectionReason } = req.body;

        const request = await PendingAction.findById(requestId)
            .populate("artist", "email username");

        if (!request || request.actionType !== "edit_profile") {
            return res.status(404).json({
                success: false,
                message: "Profile edit request not found"
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status}`
            });
        }

        // Update request
        request.status = "rejected";
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        request.rejectionReason = rejectionReason || null;
        request.artistNotified = true;
        await request.save();

        // Send email
        await sendArtistActionEmail(
            request.artist.email,
            request.artist.username,
            "rejected",
            "edit_profile",
            rejectionReason || "Your profile update request was not approved."
        ).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "Profile edit rejected. Artist has been notified."
        });
    } catch (error) {
        console.error("Admin reject profile edit error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject request"
        });
    }
};

// ===========================================
// ADDRESS MANAGEMENT
// ===========================================

/**
 * @desc    Get user's addresses
 * @route   GET /api/v1/user/addresses
 * @access  Private
 */
export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("addresses");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: { addresses: user.addresses || [] }
        });
    } catch (error) {
        console.error("Get addresses error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch addresses"
        });
    }
};

/**
 * @desc    Add new address
 * @route   POST /api/v1/user/addresses
 * @access  Private
 */
export const addAddress = async (req, res) => {
    try {
        const { type, fullName, phone, street, landmark, city, state, country, pincode, isDefault } = req.body;

        // Validation
        if (!fullName || !phone || !street || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "fullName, phone, street, city, state, and pincode are required"
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Initialize addresses array if needed
        if (!user.addresses) {
            user.addresses = [];
        }

        // If this is default or first address, unset other defaults
        if (isDefault || user.addresses.length === 0) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // Add new address
        const newAddress = {
            type: type || "home",
            fullName,
            phone,
            street,
            landmark: landmark || null,
            city,
            state,
            country: country || "India",
            pincode,
            isDefault: isDefault || user.addresses.length === 0
        };

        user.addresses.push(newAddress);
        await user.save();

        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            data: {
                address: user.addresses[user.addresses.length - 1],
                totalAddresses: user.addresses.length
            }
        });
    } catch (error) {
        console.error("Add address error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add address"
        });
    }
};

/**
 * @desc    Update address
 * @route   PUT /api/v1/user/addresses/:addressId
 * @access  Private
 */
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { type, fullName, phone, street, landmark, city, state, country, pincode, isDefault } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Update fields
        if (type) address.type = type;
        if (fullName) address.fullName = fullName;
        if (phone) address.phone = phone;
        if (street) address.street = street;
        if (landmark !== undefined) address.landmark = landmark;
        if (city) address.city = city;
        if (state) address.state = state;
        if (country) address.country = country;
        if (pincode) address.pincode = pincode;

        // Handle default flag
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = addr._id.toString() === addressId;
            });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: { address }
        });
    } catch (error) {
        console.error("Update address error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update address"
        });
    }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/user/addresses/:addressId
 * @access  Private
 */
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const wasDefault = address.isDefault;

        // Remove address
        user.addresses.pull(addressId);

        // If deleted address was default, set first address as default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Delete address error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete address"
        });
    }
};

/**
 * @desc    Set address as default
 * @route   POST /api/v1/user/addresses/:addressId/default
 * @access  Private
 */
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Unset all defaults, then set the selected one
        user.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Default address updated"
        });
    } catch (error) {
        console.error("Set default address error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update default address"
        });
    }
};
