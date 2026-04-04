import mongoose from "mongoose";

/**
 * Category Model
 *
 * Product categories managed by admin
 */

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: true,
            trim: true,
            minlength: [2, "Category name must be at least 2 characters"],
            maxlength: [50, "Category name cannot exceed 50 characters"]
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: [200, "Description cannot exceed 200 characters"]
        },

        image: {
            url: { type: String },
            publicId: { type: String }
        },

        // Parent category for subcategories (optional)
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },

        // Display order
        sortOrder: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        // Stats
        productCount: {
            type: Number,
            default: 0
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Generate slug before saving
categorySchema.pre("save", function(next) {
    if (this.isModified("name") || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

// Index for quick lookups (slug is already indexed via unique:true)
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

export const Category = mongoose.model("Category", categorySchema);

