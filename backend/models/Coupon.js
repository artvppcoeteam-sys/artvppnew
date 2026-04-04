import mongoose from "mongoose";

/**
 * Coupon Model
 *
 * Discount codes system
 */

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [3, "Code must be at least 3 characters"],
            maxlength: [20, "Code cannot exceed 20 characters"]
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: 200
        },
        type: {
            type: String,
            enum: ["percentage", "fixed"],
            required: [true, "Discount type is required"]
        },
        value: {
            type: Number,
            required: [true, "Discount value is required"],
            min: [1, "Value must be at least 1"]
        },
        minOrderValue: {
            type: Number,
            default: 0
        },
        maxDiscount: {
            type: Number, // For percentage coupons: max discount cap
            default: null
        },

        // Usage limits
        usageLimit: {
            type: Number, // Total uses allowed (null = unlimited)
            default: null
        },
        usedCount: {
            type: Number,
            default: 0
        },
        userUsageLimit: {
            type: Number, // Per user limit
            default: 1
        },

        // Validity period
        validFrom: {
            type: Date,
            required: [true, "Valid from date is required"]
        },
        validUntil: {
            type: Date,
            required: [true, "Valid until date is required"]
        },

        // Applicability restrictions
        applicableFor: {
            // Empty arrays mean applicable to all
            categories: [{
                type: String
            }],
            products: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }],
            artists: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }]
        },

        // User restrictions
        applicableUsers: {
            // Empty means all users
            users: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }],
            newUsersOnly: {
                type: Boolean,
                default: false
            }
        },

        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// Indexes (note: code already indexed via unique: true)
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Instance Methods
couponSchema.methods.isValid = function() {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (this.usageLimit === null || this.usedCount < this.usageLimit)
    );
};

couponSchema.methods.calculateDiscount = function(cartTotal) {
    if (!this.isValid()) return 0;
    if (cartTotal < this.minOrderValue) return 0;

    let discount = 0;

    if (this.type === "percentage") {
        discount = (cartTotal * this.value) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        discount = this.value;
    }

    // Discount cannot exceed cart total
    return Math.min(discount, cartTotal);
};

couponSchema.methods.incrementUsage = async function() {
    this.usedCount += 1;
    await this.save();
};

couponSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

// Static Methods
couponSchema.statics.findValidByCode = async function(code) {
    const now = new Date();
    return this.findOne({
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
        ]
    });
};

export const Coupon = mongoose.model("Coupon", couponSchema);

/**
 * Coupon Usage Model
 *
 * Tracks which users have used which coupons
 */

const couponUsageSchema = new mongoose.Schema(
    {
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        discountApplied: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

couponUsageSchema.index({ coupon: 1, user: 1 });
couponUsageSchema.index({ user: 1 });

// Static: Check if user has exceeded usage limit
couponUsageSchema.statics.getUserUsageCount = async function(couponId, userId) {
    return this.countDocuments({ coupon: couponId, user: userId });
};

export const CouponUsage = mongoose.model("CouponUsage", couponUsageSchema);

