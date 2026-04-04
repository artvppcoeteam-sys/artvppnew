import mongoose from "mongoose";

/**
 * Workshop Model
 *
 * Art workshops and classes
 */

const workshopScheduleSchema = new mongoose.Schema({
    day: { type: String }, // "Day 1", "March 15"
    time: { type: String }, // "10:00 AM - 1:00 PM"
    topics: [{ type: String }]
}, { _id: false });

const workshopSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Workshop title is required"],
            trim: true,
            minlength: [5, "Title must be at least 5 characters"],
            maxlength: [150, "Title cannot exceed 150 characters"]
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
            minlength: [50, "Description must be at least 50 characters"],
            maxlength: [3000, "Description cannot exceed 3000 characters"]
        },

        // Instructor (artist)
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        instructorName: {
            type: String // Display name
        },

        // Media
        images: [{
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }],

        // Pricing
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: 0 // 0 for free workshops
        },
        originalPrice: {
            type: Number, // For showing discounts
            default: null
        },

        // Duration
        duration: {
            type: String,
            required: true // "2 days (6 hours)", "4 weeks"
        },
        totalHours: {
            type: Number
        },

        // Skill level
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
            required: true
        },

        // Schedule
        startDate: {
            type: Date,
            required: [true, "Start date is required"]
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"]
        },
        schedule: [workshopScheduleSchema],

        // Capacity
        maxSpots: {
            type: Number,
            required: [true, "Maximum spots is required"],
            min: 1
        },
        bookedSpots: {
            type: Number,
            default: 0
        },

        // What's included
        includes: [{
            type: String // "All materials", "Certificate", "Lunch"
        }],

        // Requirements (what students need)
        requirements: [{
            type: String // "Laptop with Photoshop", "Basic drawing skills"
        }],

        // Location
        locationType: {
            type: String,
            enum: ["online", "offline", "hybrid"],
            required: true
        },
        location: {
            venue: { type: String },
            address: { type: String },
            city: { type: String },
            state: { type: String },
            meetingLink: { type: String }, // For online/hybrid
            meetingPassword: { type: String, select: false }
        },

        // Workshop status
        status: {
            type: String,
            enum: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
            default: "draft"
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

        // Category/Tags
        category: {
            type: String,
            enum: [
                "Painting",
                "Drawing",
                "Digital Art",
                "Sculpture",
                "Photography",
                "Mixed Media",
                "Traditional Art",
                "Crafts",
                "Other"
            ],
            required: true
        },
        tags: [{
            type: String,
            lowercase: true
        }],

        // Stats
        stats: {
            views: { type: Number, default: 0 },
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

// Indexes (note: slug already indexed via unique:true, instructor via index:true)
workshopSchema.index({ status: 1, startDate: 1 });
workshopSchema.index({ "verification.status": 1 });
workshopSchema.index({ category: 1 });

// Virtual: Available spots
workshopSchema.virtual("availableSpots").get(function() {
    return this.maxSpots - this.bookedSpots;
});

workshopSchema.virtual("isFull").get(function() {
    return this.bookedSpots >= this.maxSpots;
});

// Pre-save: Generate slug
workshopSchema.pre("save", async function(next) {
    if (this.isModified("title") || !this.slug) {
        let baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Ensure uniqueness
        let slug = baseSlug;
        let counter = 1;
        while (await mongoose.model("Workshop").findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        this.slug = slug;
    }
    next();
});

// Instance Methods
workshopSchema.methods.incrementViews = async function() {
    this.stats.views += 1;
    await this.save();
};

workshopSchema.methods.incrementBookings = async function() {
    if (this.bookedSpots < this.maxSpots) {
        this.bookedSpots += 1;
        await this.save();
        return true;
    }
    return false;
};

workshopSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    if (obj.location) {
        delete obj.location.meetingPassword;
    }
    delete obj.__v;
    return obj;
};

// Static Methods
workshopSchema.statics.getUpcoming = async function(filters = {}) {
    const query = {
        "verification.status": "approved",
        status: { $in: ["upcoming", "ongoing"] },
        startDate: { $gte: new Date() }
    };

    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.level) {
        query.level = filters.level;
    }
    if (filters.locationType) {
        query.locationType = filters.locationType;
    }

    return this.find(query)
        .populate("instructor", "username avatar")
        .sort({ startDate: 1 });
};

export const Workshop = mongoose.model("Workshop", workshopSchema);

/**
 * Workshop Registration Model
 *
 * Tracks workshop registrations
 */

const workshopRegistrationSchema = new mongoose.Schema(
    {
        registrationNumber: {
            type: String,
            required: true,
            unique: true
        },
        workshop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workshop",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Contact info (in case different from user profile)
        contactInfo: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true }
        },

        // Payment
        payment: {
            amount: { type: Number, required: true },
            status: {
                type: String,
                enum: ["pending", "completed", "refunded"],
                default: "pending"
            },
            razorpayOrderId: { type: String },
            razorpayPaymentId: { type: String },
            paidAt: { type: Date }
        },

        // Registration status
        status: {
            type: String,
            enum: [
                "pending",     // Payment pending
                "confirmed",   // Payment successful
                "attended",    // Attended the workshop
                "missed",      // Did not attend
                "cancelled"    // Cancelled registration
            ],
            default: "pending"
        },

        // Certificate
        certificate: {
            issued: { type: Boolean, default: false },
            issuedAt: { type: Date },
            url: { type: String },
            certificateId: { type: String }
        },

        // Cancellation
        cancellation: {
            reason: { type: String },
            cancelledAt: { type: Date },
            refundAmount: { type: Number, default: 0 },
            refundStatus: {
                type: String,
                enum: ["pending", "processed", "na"],
                default: "na"
            }
        },

        // Notes
        specialRequirements: { type: String, maxlength: 500 }
    },
    {
        timestamps: true
    }
);

// Indexes (note: registrationNumber already indexed via unique:true)
workshopRegistrationSchema.index({ workshop: 1, user: 1 }, { unique: true }); // One registration per workshop per user
workshopRegistrationSchema.index({ user: 1, status: 1 });

// Pre-save: Generate registration number
workshopRegistrationSchema.pre("save", async function(next) {
    if (!this.registrationNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.registrationNumber = `WRK${year}${month}${random}`;
    }
    next();
});

// Instance Methods
workshopRegistrationSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

export const WorkshopRegistration = mongoose.model("WorkshopRegistration", workshopRegistrationSchema);

