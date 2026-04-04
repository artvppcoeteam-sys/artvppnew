import mongoose from "mongoose";

/**
 * Artist Application Model
 *
 * Stores detailed artist application data separately from User model
 * This keeps User model clean and allows storing rich application data
 *
 * Flow:
 * 1. User submits application with all required details
 * 2. Application status = "pending"
 * 3. Admin reviews in dashboard
 * 4. Admin approves/rejects
 * 5. Email sent to artist
 * 6. If approved, User.role changes to "artist"
 */

const artistApplicationSchema = new mongoose.Schema(
    {
        // Reference to the user applying
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // ============================================
        // PERSONAL INFORMATION
        // ============================================

        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [3, "Full name must be at least 3 characters"],
            maxlength: [100, "Full name cannot exceed 100 characters"]
        },

        profilePicture: {
            url: {
                type: String,
                required: [true, "Profile picture is required"]
            },
            publicId: {
                type: String,
                required: true // Cloudinary public_id for deletion
            }
        },

        bio: {
            type: String,
            required: [true, "Bio is required"],
            trim: true,
            minlength: [15, "Bio must be at least 15 words"], // We'll validate word count in controller
            maxlength: [1000, "Bio cannot exceed 1000 characters"]
        },

        // ============================================
        // CONTACT INFORMATION
        // ============================================

        // Primary phone (from user's account - non-editable in form)
        primaryPhone: {
            type: String,
            trim: true,
            default: null
        },

        // Secondary phone (required for application)
        secondaryPhone: {
            number: {
                type: String,
                required: [true, "Secondary phone number is required"],
                match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
            },
            isVerified: {
                type: Boolean,
                default: false
            },
            otp: {
                type: String,
                default: null,
                select: false
            },
            otpExpiry: {
                type: Date,
                default: null,
                select: false
            }
        },

        // Primary email (from user's verified account - non-editable in form)
        primaryEmail: {
            type: String,
            required: [true, "Primary email is required"],
            lowercase: true,
            trim: true
        },

        // Secondary email (required for business communications)
        secondaryEmail: {
            address: {
                type: String,
                required: [true, "Secondary email is required"],
                lowercase: true,
                trim: true
            },
            isVerified: {
                type: Boolean,
                default: false
            },
            otp: {
                type: String,
                default: null,
                select: false
            },
            otpExpiry: {
                type: Date,
                default: null,
                select: false
            }
        },

        // ============================================
        // ADDRESS / LOCATION
        // ============================================

        address: {
            street: {
                type: String,
                required: [true, "Street address is required"],
                trim: true
            },
            city: {
                type: String,
                required: [true, "City is required"],
                trim: true
            },
            state: {
                type: String,
                required: [true, "State is required"],
                trim: true
            },
            pincode: {
                type: String,
                required: [true, "Pincode is required"],
                match: [/^[0-9]{6}$/, "Pincode must be 6 digits"]
            },
            country: {
                type: String,
                default: "India",
                trim: true
            }
        },

        // ============================================
        // PORTFOLIO - 5 BEST ARTWORKS (Required)
        // ============================================

        artworks: {
            type: [{
                url: {
                    type: String,
                    required: true
                },
                publicId: {
                    type: String,
                    required: true // For Cloudinary deletion
                },
                title: {
                    type: String,
                    trim: true,
                    maxlength: [100, "Artwork title cannot exceed 100 characters"]
                },
                description: {
                    type: String,
                    trim: true,
                    maxlength: [500, "Artwork description cannot exceed 500 characters"]
                }
            }],
            validate: {
                validator: function(v) {
                    if (this.submissionChannel === "student_link") {
                        return Array.isArray(this.studentArtworkDetails) && this.studentArtworkDetails.length >= 1;
                    }
                    return v && v.length === 5;
                },
                message: "Standard flow requires exactly 5 artworks; student flow requires at least one artwork block"
            }
        },

        // ============================================
        // SOCIAL MEDIA & PORTFOLIO (Optional website)
        // ============================================

        socialMedia: {
            instagram: {
                type: String,
                trim: true,
                default: null
            },
            twitter: {
                type: String,
                trim: true,
                default: null
            },
            facebook: {
                type: String,
                trim: true,
                default: null
            },
            linkedin: {
                type: String,
                trim: true,
                default: null
            },
            youtube: {
                type: String,
                trim: true,
                default: null
            },
            behance: {
                type: String,
                trim: true,
                default: null
            },
            dribbble: {
                type: String,
                trim: true,
                default: null
            },
            other: {
                type: String,
                trim: true,
                default: null
            }
        },

        portfolioWebsite: {
            type: String,
            trim: true,
            default: null,
            match: [
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
                "Please provide a valid URL"
            ]
        },

        // Submission source metadata (used for permanent student-link flow)
        submissionChannel: {
            type: String,
            enum: ["standard", "student_link"],
            default: "standard",
            index: true
        },

        applicantType: {
            type: String,
            enum: ["regular", "student"],
            default: "regular",
            index: true
        },

        // Stores the richer student artwork blocks (category-specific metadata + images)
        studentArtworkDetails: {
            type: [{
                category: { type: String, required: true, trim: true },
                title: { type: String, required: true, trim: true, maxlength: 120 },
                size: { type: String, required: true, trim: true, maxlength: 80 },
                medium: { type: String, required: true, trim: true, maxlength: 100 },
                price: { type: Number, required: true, min: 0 },
                description: { type: String, trim: true, maxlength: 800, default: null },
                primaryImageIndex: { type: Number, default: 0 },
                images: [{
                    url: { type: String, required: true },
                    publicId: { type: String, required: true }
                }],
                categoryMeta: {
                    type: mongoose.Schema.Types.Mixed,
                    default: null
                }
            }],
            default: []
        },

        termsAccepted: {
            type: Boolean,
            default: false
        },

        // ============================================
        // APPLICATION STATUS
        // ============================================

        status: {
            type: String,
            enum: ["pending", "under_review", "approved", "rejected"],
            default: "pending",
            index: true
        },

        // Admin who reviewed the application
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        // Rejection reason (optional - admin can leave empty)
        rejectionReason: {
            type: String,
            trim: true,
            maxlength: [500, "Rejection reason cannot exceed 500 characters"],
            default: null
        },

        // Admin notes (internal, not shown to artist)
        adminNotes: {
            type: String,
            trim: true,
            maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
            default: null
        },

        // ============================================
        // TIMESTAMPS & METADATA
        // ============================================

        submittedAt: {
            type: Date,
            default: Date.now
        },

        // If rejected, user can reapply after cooldown
        canReapplyAfter: {
            type: Date,
            default: null
        },

        // Track application version (if user reapplies)
        applicationVersion: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true // createdAt, updatedAt
    }
);

// ============================================
// INDEXES
// ============================================

// Compound index for efficient admin queries
artistApplicationSchema.index({ status: 1, submittedAt: -1 });

// Index for user lookup
artistApplicationSchema.index({ userId: 1, status: 1 });

// Index to help admin filter student submissions quickly
artistApplicationSchema.index({ submissionChannel: 1, status: 1, submittedAt: -1 });

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Check if application can be modified
 */
artistApplicationSchema.methods.canModify = function() {
    return this.status === "pending";
};

/**
 * Check if user can reapply
 */
artistApplicationSchema.methods.canReapply = function() {
    if (this.status !== "rejected") return false;
    if (!this.canReapplyAfter) return true;
    return new Date() >= this.canReapplyAfter;
};

/**
 * Safe object for API response (exclude sensitive data)
 */
artistApplicationSchema.methods.toSafeObject = function() {
    const obj = this.toObject();

    // Remove OTP data from secondaryPhone
    if (obj.secondaryPhone) {
        delete obj.secondaryPhone.otp;
        delete obj.secondaryPhone.otpExpiry;
    }
    // Remove OTP data from secondaryEmail
    if (obj.secondaryEmail) {
        delete obj.secondaryEmail.otp;
        delete obj.secondaryEmail.otpExpiry;
    }

    delete obj.__v;
    return obj;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get pending applications count (for admin dashboard)
 */
artistApplicationSchema.statics.getPendingCount = async function() {
    return this.countDocuments({ status: "pending" });
};

/**
 * Get applications by status with pagination
 */
artistApplicationSchema.statics.getByStatus = async function(status, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
        this.find({ status })
            .populate("userId", "username email avatar")
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit),
        this.countDocuments({ status })
    ]);

    return {
        applications,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasMore: page * limit < total
        }
    };
};

export const ArtistApplication = mongoose.model("ArtistApplication", artistApplicationSchema);

