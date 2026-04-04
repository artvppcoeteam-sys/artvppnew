import { Coupon, CouponUsage } from "../models/Coupon.js";
import { User } from "../models/User.js";

/**
 * Coupon Controller
 */

/**
 * @desc    Validate a coupon code
 * @route   POST /api/v1/coupons/validate
 * @access  Private
 */
export const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal, cartItems } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required"
            });
        }

        // Find valid coupon
        const coupon = await Coupon.findValidByCode(code);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired coupon code"
            });
        }

        // Check minimum order value
        if (cartTotal < coupon.minOrderValue) {
            return res.status(400).json({
                success: false,
                message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
            });
        }

        // Check user-specific restrictions
        if (coupon.applicableUsers.users.length > 0) {
            const isUserAllowed = coupon.applicableUsers.users.some(
                u => u.toString() === req.userId.toString()
            );
            if (!isUserAllowed) {
                return res.status(400).json({
                    success: false,
                    message: "This coupon is not available for your account"
                });
            }
        }

        // Check new users only
        if (coupon.applicableUsers.newUsersOnly) {
            const user = await User.findById(req.userId);
            const isNewUser = (Date.now() - user.createdAt) < (7 * 24 * 60 * 60 * 1000); // 7 days
            if (!isNewUser) {
                return res.status(400).json({
                    success: false,
                    message: "This coupon is only for new users"
                });
            }
        }

        // Check user usage limit
        const userUsageCount = await CouponUsage.getUserUsageCount(coupon._id, req.userId);
        if (userUsageCount >= coupon.userUsageLimit) {
            return res.status(400).json({
                success: false,
                message: "You have already used this coupon the maximum number of times"
            });
        }

        // Calculate discount
        const discount = coupon.calculateDiscount(cartTotal);

        return res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            data: {
                coupon: {
                    code: coupon.code,
                    description: coupon.description,
                    type: coupon.type,
                    value: coupon.value,
                    maxDiscount: coupon.maxDiscount
                },
                discount,
                finalTotal: cartTotal - discount
            }
        });
    } catch (error) {
        console.error("Validate coupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to validate coupon"
        });
    }
};

/**
 * @desc    Get available coupons for user
 * @route   GET /api/v1/coupons/available
 * @access  Private
 */
export const getAvailableCoupons = async (req, res) => {
    try {
        const now = new Date();

        // Get all active, valid coupons
        const coupons = await Coupon.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        }).select("-applicableUsers.users -applicableFor.products -applicableFor.artists");

        // Filter coupons based on usage limits and user eligibility
        const availableCoupons = [];
        for (const coupon of coupons) {
            // Check if coupon has reached total usage limit
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                continue;
            }

            // Check if user is eligible (if user restriction exists)
            if (coupon.applicableUsers.users && coupon.applicableUsers.users.length > 0) {
                const isEligible = coupon.applicableUsers.users.some(
                    userId => userId.toString() === req.userId.toString()
                );
                if (!isEligible) continue;
            }

            // Check user's usage count
            const userUsageCount = await CouponUsage.getUserUsageCount(coupon._id, req.userId);

            if (userUsageCount < coupon.userUsageLimit) {
                availableCoupons.push({
                    ...coupon.toSafeObject(),
                    remainingUses: coupon.userUsageLimit - userUsageCount
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: { coupons: availableCoupons }
        });

    } catch (error) {
        console.error("Get available coupons error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch coupons"
        });
    }
};


// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @desc    Get all coupons (admin)
 * @route   GET /api/v1/admin/coupons
 * @access  Admin
 */
export const adminGetAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "all" } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status === "active") {
            const now = new Date();
            query.isActive = true;
            query.validFrom = { $lte: now };
            query.validUntil = { $gte: now };
        } else if (status === "expired") {
            query.validUntil = { $lt: new Date() };
        } else if (status === "inactive") {
            query.isActive = false;
        }

        const coupons = await Coupon.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Coupon.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                coupons,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Admin get coupons error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch coupons"
        });
    }
};

/**
 * @desc    Create coupon (admin)
 * @route   POST /api/v1/admin/coupons
 * @access  Admin
 */
export const adminCreateCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            type,
            value,
            minOrderValue,
            maxDiscount,
            usageLimit,
            userUsageLimit,
            validFrom,
            validUntil,
            applicableFor,
            applicableUsers
        } = req.body;

        // Validation
        if (!code || !description || !type || !value || !validFrom || !validUntil) {
            return res.status(400).json({
                success: false,
                message: "Code, description, type, value, validFrom, and validUntil are required"
            });
        }

        // Check for duplicate code
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        // Validate percentage discount
        if (type === "percentage" && value > 100) {
            return res.status(400).json({
                success: false,
                message: "Percentage discount cannot exceed 100%"
            });
        }

        const coupon = await Coupon.create({
            code,
            description,
            type,
            value,
            minOrderValue: minOrderValue || 0,
            maxDiscount,
            usageLimit,
            userUsageLimit: userUsageLimit || 1,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            applicableFor: applicableFor || {},
            applicableUsers: applicableUsers || {},
            createdBy: req.userId
        });

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: { coupon: coupon.toSafeObject() }
        });
    } catch (error) {
        console.error("Admin create coupon error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create coupon"
        });
    }
};

/**
 * @desc    Update coupon (admin)
 * @route   PUT /api/v1/admin/coupons/:id
 * @access  Admin
 */
export const adminUpdateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        // Don't allow changing the code
        delete updates.code;
        delete updates.createdBy;
        delete updates.usedCount;

        // Update fields
        Object.keys(updates).forEach(key => {
            if (key === "validFrom" || key === "validUntil") {
                coupon[key] = new Date(updates[key]);
            } else {
                coupon[key] = updates[key];
            }
        });

        await coupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: { coupon: coupon.toSafeObject() }
        });
    } catch (error) {
        console.error("Admin update coupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update coupon"
        });
    }
};

/**
 * @desc    Delete coupon (admin)
 * @route   DELETE /api/v1/admin/coupons/:id
 * @access  Admin
 */
export const adminDeleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        await coupon.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully"
        });
    } catch (error) {
        console.error("Admin delete coupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete coupon"
        });
    }
};

/**
 * @desc    Get coupon usage stats (admin)
 * @route   GET /api/v1/admin/coupons/:id/usage
 * @access  Admin
 */
export const adminGetCouponUsage = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        const usage = await CouponUsage.find({ coupon: id })
            .populate("user", "username email")
            .populate("order", "orderNumber total")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CouponUsage.countDocuments({ coupon: id });
        const totalDiscount = await CouponUsage.aggregate([
            { $match: { coupon: coupon._id } },
            { $group: { _id: null, total: { $sum: "$discountApplied" } } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                coupon: coupon.toSafeObject(),
                usage,
                stats: {
                    totalUses: total,
                    totalDiscountGiven: totalDiscount[0]?.total || 0
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Admin get coupon usage error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch coupon usage"
        });
    }
};

