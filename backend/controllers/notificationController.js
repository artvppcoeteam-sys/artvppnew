import { Notification } from "../models/Notification.js";

/**
 * Notification Controller
 */

/**
 * @desc    Get user's notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const skip = (page - 1) * limit;

        const query = { user: req.userId };
        if (unreadOnly === "true") {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.getUnreadCount(req.userId);

        return res.status(200).json({
            success: true,
            data: {
                notifications: notifications.map(n => n.toSafeObject()),
                unreadCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.userId);

        return res.status(200).json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread count"
        });
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            user: req.userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        await notification.markAsRead();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        console.error("Mark as read error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update notification"
        });
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.markAllAsRead(req.userId);

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notifications marked as read`
        });
    } catch (error) {
        console.error("Mark all as read error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update notifications"
        });
    }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            user: req.userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        await notification.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        console.error("Delete notification error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete notification"
        });
    }
};

/**
 * @desc    Clear all notifications
 * @route   DELETE /api/v1/notifications/clear
 * @access  Private
 */
export const clearAllNotifications = async (req, res) => {
    try {
        const result = await Notification.deleteMany({ user: req.userId });

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} notifications cleared`
        });
    } catch (error) {
        console.error("Clear notifications error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to clear notifications"
        });
    }
};

// ============================================
// UTILITY - Send notification helper
// ============================================

/**
 * Helper function to send notification
 * Usage: await sendNotification(userId, "order_shipped", "Order Shipped", "Your order has been shipped!")
 */
export const sendNotification = async (userId, type, title, message, link = null, data = {}) => {
    try {
        return await Notification.createNotification(userId, type, title, message, link, data);
    } catch (error) {
        console.error("Send notification error:", error);
        return null;
    }
};

