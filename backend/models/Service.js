import mongoose from "mongoose";

/**
 * Service Model
 *
 * Creative services offered by artists (Photography, Videography, etc.)
 */

const servicePricingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Basic, Standard, Premium
        enum: ["Basic", "Standard", "Premium", "Custom"]
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    features: [{
        type: String
    }],
    deliveryTime: {
        type: String
    }
}, { _id: true });

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Service title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [100, "Title cannot exceed 100 characters"]
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            minlength: [20, "Description must be at least 20 characters"],
            maxlength: [2000, "Description cannot exceed 2000 characters"]
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Media Services",      // Photography, Videography
                "Display Art",         // Miniature Display
                "3D Art",              // Sculptures
                "Rental",              // Studio on Hire
                "Wall Art",            // Wall Painting
                "Design Services",     // Logo, Branding
                "Educational",         // Workshops, Classes
                "Other"
            ]
        },
        icon: {
            type: String, // Emoji or icon name
            default: "🎨"
        },
        images: [{
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }],

        // Service provider (artist)
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Pricing
        startingPrice: {
            type: Number,
            required: [true, "Starting price is required"],
            min: 1
        },
        pricing: [servicePricingSchema],

        // Delivery
        deliveryTime: {
            type: String, // "2-4 weeks"
            required: true
        },

        // Features
        features: [{
            type: String
        }],

        // Customization
        customizable: {
            type: Boolean,
            default: true
        },

        // Availability
        isAvailable: {
            type: Boolean,
            default: true
        },

        // Admin verification
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

        // Stats
        stats: {
            views: { type: Number, default: 0 },
            bookings: { type: Number, default: 0 },
            rating: {
                average: { type: Number, default: 0 },
                count: { type: Number, default: 0 }
            }
        }
    },
    {
        timestamps: true
    }
);

// Indexes (note: slug already indexed via unique:true, artist via index:true)
serviceSchema.index({ category: 1, "verification.status": 1 });
serviceSchema.index({ "verification.status": 1 });

// Pre-save: Generate slug
serviceSchema.pre("save", async function(next) {
    if (this.isModified("title") || !this.slug) {
        let baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Ensure uniqueness
        let slug = baseSlug;
        let counter = 1;
        while (await mongoose.model("Service").findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        this.slug = slug;
    }
    next();
});

// Instance Methods
serviceSchema.methods.incrementViews = async function() {
    this.stats.views += 1;
    await this.save();
};

serviceSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

// Static Methods
serviceSchema.statics.getApprovedServices = async function(filters = {}) {
    const query = { "verification.status": "approved", isAvailable: true };

    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.artist) {
        query.artist = filters.artist;
    }

    return this.find(query)
        .populate("artist", "username avatar")
        .sort({ createdAt: -1 });
};

export const Service = mongoose.model("Service", serviceSchema);

/**
 * Service Booking Model
 *
 * Bookings for services
 */

const serviceBookingSchema = new mongoose.Schema(
    {
        bookingNumber: {
            type: String,
            required: true,
            unique: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Selected package
        package: {
            name: { type: String, required: true }, // Basic/Standard/Premium/Custom
            price: { type: Number, required: true }
        },

        // Customer requirements
        requirements: {
            type: String,
            maxlength: 2000
        },
        attachments: [{
            url: { type: String },
            publicId: { type: String },
            name: { type: String }
        }],

        // Contact info
        contactInfo: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String }
        },

        // Status
        status: {
            type: String,
            enum: [
                "pending",      // Waiting for artist confirmation
                "confirmed",    // Artist accepted
                "in_progress",  // Work started
                "completed",    // Work completed
                "cancelled",    // Cancelled by either party
                "disputed"      // Issue raised
            ],
            default: "pending"
        },

        // Payment
        payment: {
            method: { type: String, enum: ["razorpay", "cod", "upi", "bank_transfer"] },
            status: { type: String, enum: ["pending", "partial", "completed", "refunded"], default: "pending" },
            totalAmount: { type: Number, required: true },
            advanceAmount: { type: Number, default: 0 },
            advancePaid: { type: Boolean, default: false },
            razorpayOrderId: { type: String },
            razorpayPaymentId: { type: String }
        },

        // Timeline
        timeline: {
            requestedAt: { type: Date, default: Date.now },
            confirmedAt: { type: Date },
            startedAt: { type: Date },
            completedAt: { type: Date },
            expectedDelivery: { type: Date }
        },

        // Notes
        customerNote: { type: String, maxlength: 500 },
        artistNote: { type: String, maxlength: 500 },

        // Cancellation
        cancellation: {
            reason: { type: String },
            cancelledBy: { type: String, enum: ["user", "artist", "admin"] },
            cancelledAt: { type: Date }
        }
    },
    {
        timestamps: true
    }
);

// Indexes (note: bookingNumber already indexed via unique:true, user/artist via index:true)
serviceBookingSchema.index({ user: 1, status: 1 });
serviceBookingSchema.index({ artist: 1, status: 1 });

// Pre-save: Generate booking number
serviceBookingSchema.pre("save", async function(next) {
    if (!this.bookingNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.bookingNumber = `SRV${year}${month}${random}`;
    }
    next();
});

// Instance Methods
serviceBookingSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

export const ServiceBooking = mongoose.model("ServiceBooking", serviceBookingSchema);

