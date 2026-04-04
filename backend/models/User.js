import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User Model
 *
 * Roles:
 * - user: Regular buyer (default)
 * - artist: Can sell artworks (needs admin approval)
 * - admin: Full access
 *
 * Artist Request Status:
 * - none: User hasn't applied
 * - pending: User has applied, waiting for admin approval
 * - approved: User is now an artist
 * - rejected: Admin rejected the application
 */

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"]
        },
        displayName: {
            type: String,
            trim: true,
            minlength: [2, "Display name must be at least 2 characters"],
            maxlength: [60, "Display name cannot exceed 60 characters"],
            default: null
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email"
            ]
        },
        password: {
            type: String,
            minlength: [8, "Password must be at least 8 characters"],
            select: false // Don't include password in queries by default
        },
        googleId: {
            type: String,
            sparse: true // Allows null values while maintaining uniqueness
        },
        avatar: {
            type: String,
            default: null
        },

        // Role-based access control
        role: {
            type: String,
            enum: ["user", "artist", "admin"],
            default: "user"
        },

        // Artist application tracking
        artistRequest: {
            status: {
                type: String,
                enum: ["none", "pending", "approved", "rejected"],
                default: "none"
            },
            requestedAt: {
                type: Date,
                default: null
            },
            reviewedAt: {
                type: Date,
                default: null
            },
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            },
            rejectionReason: {
                type: String,
                default: null
            },
            // Artist's portfolio/reason for applying
            portfolio: {
                type: String,
                default: null
            }
        },

        // Account verification
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            type: String,
            default: null,
            select: false
        },
        verificationTokenExpiry: {
            type: Date,
            default: null,
            select: false
        },

        // Password reset (OTP-based)
        otp: {
            type: String,
            default: null,
            select: false
        },
        otpExpiry: {
            type: Date,
            default: null,
            select: false
        },

        // Session management
        refreshToken: {
            type: String,
            default: null,
            select: false
        },

        // Account status
        isActive: {
            type: Boolean,
            default: true
        },
        lastLogin: {
            type: Date,
            default: null
        },

        // Profile info
        firstName: {
            type: String,
            trim: true,
            default: null
        },
        lastName: {
            type: String,
            trim: true,
            default: null
        },
        gender: {
            type: String,
            enum: ["male", "female", "other", null],
            default: null
        },
        phone: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: [500, "Bio cannot exceed 500 characters"],
            default: null
        },
        college: {
            type: String,
            default: null
        },

        // Saved addresses for shipping
        addresses: [{
            type: {
                type: String,
                enum: ["home", "office", "other"],
                default: "home"
            },
            fullName: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            street: {
                type: String,
                required: true
            },
            landmark: {
                type: String,
                default: null
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            country: {
                type: String,
                default: "India"
            },
            pincode: {
                type: String,
                required: true
            },
            isDefault: {
                type: Boolean,
                default: false
            }
        }],

        // Saved payment methods
        savedPaymentMethods: {
            cards: [{
                token: String,        // Razorpay card token (never store full number)
                last4: String,
                brand: String,        // Visa, Mastercard, etc.
                expiryMonth: Number,
                expiryYear: Number,
                holderName: String,
                isDefault: { type: Boolean, default: false }
            }],
            upiIds: [{
                vpa: String,          // UPI ID (user@bank)
                provider: String,     // Google Pay, PhonePe, etc.
                isDefault: { type: Boolean, default: false }
            }]
        },

        // Featured flag (for artists)
        isFeatured: {
            type: Boolean,
            default: false
        },
        featuredOrder: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

// ===========================================
// INDEXES FOR BETTER QUERY PERFORMANCE
// ===========================================

// Email is already indexed via unique: true
// googleId is already indexed via sparse: true
// Role for filtering users by type
userSchema.index({ role: 1 });
// Artist request status for admin dashboard queries
userSchema.index({ "artistRequest.status": 1 });

// ===========================================
// INSTANCE METHODS
// ===========================================

/**
 * Compare password for login
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    // Password is not selected by default, so we need to explicitly get it
    const user = await User.findById(this._id).select("+password");
    if (!user.password) return false;
    return bcrypt.compare(candidatePassword, user.password);
};

/**
 * Check if user can perform artist actions
 * @returns {boolean}
 */
userSchema.methods.isArtist = function () {
    return this.role === "artist" || this.role === "admin";
};

/**
 * Check if user is admin
 * @returns {boolean}
 */
userSchema.methods.isAdmin = function () {
    return this.role === "admin";
};

/**
 * Safe user object to return in responses (excludes sensitive data)
 * @returns {Object}
 */
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.otp;
    delete obj.otpExpiry;
    delete obj.verificationToken;
    delete obj.verificationTokenExpiry;
    delete obj.refreshToken;
    delete obj.__v;
    return obj;
};

// ===========================================
// PRE-SAVE MIDDLEWARE
// ===========================================

/**
 * Hash password before saving
 */
userSchema.pre("save", async function (next) {
    // Only hash if password is modified
    if (!this.isModified("password")) return next();

    // Skip if password is null (Google OAuth users)
    if (!this.password) return next();

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

export const User = mongoose.model("User", userSchema);

