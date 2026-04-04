import mongoose from "mongoose";

/**
 * Product Model
 *
 * Products are artworks/items that artists sell on the platform
 */

const productSchema = new mongoose.Schema(
    {
        // Artist who owns this product
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Basic Info
        title: {
            type: String,
            required: [true, "Product title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [100, "Title cannot exceed 100 characters"]
        },
        displayName: {
            type: String,
            trim: true,
            maxlength: [120, "Display name cannot exceed 120 characters"],
            default: null
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            minlength: [20, "Description must be at least 20 characters"],
            maxlength: [2000, "Description cannot exceed 2000 characters"]
        },

        // Images (stored in Cloudinary)
        images: {
            type: [{
                url: { type: String, required: true },
                publicId: { type: String, required: true }
            }],
            validate: {
                validator: function(v) {
                    return v && v.length >= 1 && v.length <= 5;
                },
                message: "Products must have 1-5 images"
            }
        },

        // Pricing
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [1, "Price must be at least ₹1"]
        },

        comparePrice: {
            type: Number,
            default: null // Original price for showing discounts
        },

        // Category
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "painting",
                "sketch",
                "digital-art",
                "photography",
                "sculpture",
                "crafts",
                "prints",
                "merchandise",
                "other"
            ]
        },

        // Tags for search
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        // Inventory
        stock: {
            type: Number,
            required: true,
            min: [0, "Stock cannot be negative"],
            default: 1
        },

        // Product type
        isDigital: {
            type: Boolean,
            default: false // Physical product by default
        },

        // Digital product file (if isDigital: true)
        digitalFile: {
            url: { type: String },
            publicId: { type: String }
        },

        // Dimensions (for physical products)
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number },
            unit: { type: String, enum: ["cm", "inch"], default: "cm" }
        },

        // Weight (for shipping calculation)
        weight: {
            value: { type: Number },
            unit: { type: String, enum: ["g", "kg"], default: "g" }
        },

        // Status
        status: {
            type: String,
            enum: ["draft", "active", "inactive", "sold_out"],
            default: "draft"
        },

        // Stats
        views: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        likesCount: { type: Number, default: 0 },

        // SEO
        slug: {
            type: String,
            unique: true,
            lowercase: true
        },

        // Featured/Promoted
        isFeatured: { type: Boolean, default: false },

        // Ratings (calculated from reviews)
        rating: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 }
        },

        // ============================================
        // ADMIN VERIFICATION (Required for all products)
        // ============================================

        // Verification status
        verification: {
            status: {
                type: String,
                enum: ["pending", "approved", "rejected"],
                default: "pending"
            },
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            },
            reviewedAt: {
                type: Date,
                default: null
            },
            rejectionReason: {
                type: String,
                maxlength: 500,
                default: null
            }
        },

        // Track if product was created by admin directly
        createdByAdmin: {
            type: Boolean,
            default: false
        },

        // Source channel for marketplace visibility controls
        submissionChannel: {
            type: String,
            enum: ["standard", "student_link"],
            default: "standard",
            index: true
        },

        // Deletion request (artists can't delete directly)
        deletionRequest: {
            isPending: { type: Boolean, default: false },
            reason: { type: String, maxlength: 500 },
            requestedAt: { type: Date },
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            reviewedAt: { type: Date },
            status: {
                type: String,
                enum: ["none", "pending", "approved", "rejected"],
                default: "none"
            },
            rejectionReason: { type: String, maxlength: 500 }
        }
    },
    {
        timestamps: true
    }
);

// Indexes
productSchema.index({ title: "text", displayName: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ "rating.average": -1 });

// Generate slug before saving
productSchema.pre("save", function(next) {
    if ((!this.displayName || !this.displayName.trim()) && this.title) {
        this.displayName = this.title;
    }

    if (this.isModified("title") || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
            "-" + Date.now().toString(36);
    }
    next();
});

// Update likesCount when likes array changes
productSchema.pre("save", function(next) {
    if (this.isModified("likes")) {
        this.likesCount = this.likes.length;
    }
    next();
});

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function() {
    if (this.comparePrice && this.comparePrice > this.price) {
        return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
    }
    return 0;
});

// Instance method: Check if in stock
productSchema.methods.isInStock = function() {
    return this.stock > 0 || this.isDigital;
};

// Instance method: Safe object for response
productSchema.methods.toSafeObject = function() {
    const obj = this.toObject({ virtuals: true });
    delete obj.__v;
    return obj;
};

// Static: Get products by artist
productSchema.statics.getByArtist = async function(artistId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const query = { artist: artistId };
    if (status) query.status = status;

    return this.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

export const Product = mongoose.model("Product", productSchema);

