import mongoose from "mongoose";

/**
 * Content Model
 *
 * Platform content management (banners, featured sections, etc.)
 */

const contentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: [true, "Content key is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        type: {
            type: String,
            enum: [
                "banner",              // Homepage banners
                "text",                // Simple text content
                "html",                // Rich HTML content
                "image",               // Single image
                "gallery",             // Image gallery
                "video",               // Video content
                "featured_products",   // Featured products section
                "featured_artists",    // Featured artists section
                "announcement",        // Site-wide announcement
                "settings"             // Platform settings
            ],
            required: true
        },
        title: {
            type: String,
            maxlength: 200
        },
        description: {
            type: String,
            maxlength: 1000
        },
        data: {
            type: mongoose.Schema.Types.Mixed, // Flexible content data
            default: {}
        },

        // For banners/images
        media: [{
            url: { type: String },
            publicId: { type: String },
            alt: { type: String },
            link: { type: String }
        }],

        // For featured products/artists
        items: [{
            type: mongoose.Schema.Types.ObjectId,
            refPath: "itemsModel"
        }],
        itemsModel: {
            type: String,
            enum: ["Product", "User", "Service", "Workshop"]
        },

        // Display settings
        isActive: {
            type: Boolean,
            default: true
        },
        displayOrder: {
            type: Number,
            default: 0
        },

        // Scheduling
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },

        // Metadata
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        metadata: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

// Indexes
contentSchema.index({ key: 1 });
contentSchema.index({ type: 1, isActive: 1 });

// Instance Methods
contentSchema.methods.isVisible = function() {
    if (!this.isActive) return false;

    const now = new Date();
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;

    return true;
};

contentSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

// Static Methods
contentSchema.statics.getByKey = async function(key) {
    return this.findOne({ key: key.toLowerCase(), isActive: true });
};

contentSchema.statics.getActiveByType = async function(type) {
    const now = new Date();
    return this.find({
        type,
        isActive: true,
        $or: [
            { startDate: null },
            { startDate: { $lte: now } }
        ],
        $or: [
            { endDate: null },
            { endDate: { $gte: now } }
        ]
    }).sort({ displayOrder: 1 });
};

// Pre-defined content keys
contentSchema.statics.KEYS = {
    HOMEPAGE_HERO: "homepage_hero",
    HOMEPAGE_BANNERS: "homepage_banners",
    FEATURED_PRODUCTS: "featured_products",
    FEATURED_ARTISTS: "featured_artists",
    ANNOUNCEMENT_BAR: "announcement_bar",
    ABOUT_US: "about_us",
    TERMS_OF_SERVICE: "terms_of_service",
    PRIVACY_POLICY: "privacy_policy",
    REFUND_POLICY: "refund_policy",
    CONTACT_INFO: "contact_info",
    SOCIAL_LINKS: "social_links",
    PLATFORM_SETTINGS: "platform_settings"
};

export const Content = mongoose.model("Content", contentSchema);

