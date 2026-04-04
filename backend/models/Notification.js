import mongoose from "mongoose";

/**
 * Notification Model
 *
 * In-app notifications for users
 */

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: [
                // Order notifications
                "order_placed",
                "order_confirmed",
                "order_shipped",
                "order_delivered",
                "order_cancelled",

                // Artist notifications
                "artist_approved",
                "artist_rejected",
                "product_approved",
                "product_rejected",
                "product_edit_approved",
                "product_edit_rejected",
                "product_delete_approved",
                "product_delete_rejected",

                // User notifications
                "review_request",
                "review_approved",
                "review_rejected",
                "wishlist_price_drop",
                "wishlist_back_in_stock",

                // General
                "new_message",
                "promotion",
                "system"
            ],
            required: true
        },
        title: {
            type: String,
            required: [true, "Notification title is required"],
            maxlength: 100
        },
        message: {
            type: String,
            required: [true, "Notification message is required"],
            maxlength: 500
        },
        link: {
            type: String, // URL to navigate to when clicked
            default: null
        },
        data: {
            type: Object, // Additional data (orderId, productId, etc.)
            default: {}
        },
        read: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Instance Methods
notificationSchema.methods.markAsRead = async function() {
    if (!this.read) {
        this.read = true;
        this.readAt = new Date();
        await this.save();
    }
    return this;
};

notificationSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

// Static Methods
notificationSchema.statics.createNotification = async function(userId, type, title, message, link = null, data = {}) {
    return this.create({
        user: userId,
        type,
        title,
        message,
        link,
        data
    });
};

notificationSchema.statics.getUnreadCount = async function(userId) {
    return this.countDocuments({ user: userId, read: false });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
    return this.updateMany(
        { user: userId, read: false },
        { $set: { read: true, readAt: new Date() } }
    );
};

notificationSchema.statics.deleteOldNotifications = async function(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.deleteMany({
        read: true,
        createdAt: { $lt: cutoffDate }
    });
};

export const Notification = mongoose.model("Notification", notificationSchema);

