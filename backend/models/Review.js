import mongoose from "mongoose";

/**
 * Review Model
 *
 * Product reviews and ratings system
 */

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null // Optional: link to order for verified purchase
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"]
        },
        title: {
            type: String,
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"]
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            trim: true,
            minlength: [10, "Comment must be at least 10 characters"],
            maxlength: [1000, "Comment cannot exceed 1000 characters"]
        },
        images: [{
            url: { type: String },
            publicId: { type: String }
        }],

        // Verified purchase badge
        isVerifiedPurchase: {
            type: Boolean,
            default: false
        },

        // Helpful votes
        helpful: {
            count: { type: Number, default: 0 },
            users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
        },

        // Admin moderation
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        moderatedAt: {
            type: Date,
            default: null
        },
        rejectionReason: {
            type: String,
            maxlength: 500,
            default: null
        },

        // Edit tracking
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Indexes
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per product per user
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1, createdAt: -1 }); // For admin moderation queue

// Instance Methods
reviewSchema.methods.canEdit = function() {
    // Can edit within 30 days of creation
    const daysSinceCreated = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 30 && this.status === "approved";
};

reviewSchema.methods.markHelpful = async function(userId) {
    const userIdStr = userId.toString();
    const hasVoted = this.helpful.users.some(u => u.toString() === userIdStr);

    if (hasVoted) {
        // Remove vote
        this.helpful.users = this.helpful.users.filter(u => u.toString() !== userIdStr);
        this.helpful.count = Math.max(0, this.helpful.count - 1);
    } else {
        // Add vote
        this.helpful.users.push(userId);
        this.helpful.count += 1;
    }

    await this.save();
    return !hasVoted; // Returns true if vote was added
};

reviewSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    // Remove users array from helpful (just show count)
    if (obj.helpful) {
        delete obj.helpful.users;
    }
    delete obj.__v;
    return obj;
};

// Static Methods
reviewSchema.statics.getProductRatingStats = async function(productId) {
    const stats = await this.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId),
                status: "approved"
            }
        },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                    $push: "$rating"
                }
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    // Calculate distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratingDistribution.forEach(r => {
        distribution[r] = (distribution[r] || 0) + 1;
    });

    return {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        distribution
    };
};

reviewSchema.statics.hasUserReviewed = async function(userId, productId) {
    const review = await this.findOne({ user: userId, product: productId });
    return !!review;
};

reviewSchema.statics.hasUserPurchased = async function(userId, productId) {
    const Order = mongoose.model("Order");
    const order = await Order.findOne({
        user: userId,
        "items.product": productId,
        status: { $in: ["confirmed", "processing", "shipped", "delivered"] }
    });
    return !!order;
};

export const Review = mongoose.model("Review", reviewSchema);

