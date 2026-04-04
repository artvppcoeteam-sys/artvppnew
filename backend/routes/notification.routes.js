import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} from "../controllers/notificationController.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get("/", getNotifications);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get("/unread-count", getUnreadCount);

/**
 * @route   PUT /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put("/read-all", markAllAsRead);

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Private
 */
router.put("/:id/read", markAsRead);

/**
 * @route   DELETE /api/v1/notifications/clear
 * @desc    Clear all notifications
 * @access  Private
 */
router.delete("/clear", clearAllNotifications);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete single notification
 * @access  Private
 */
router.delete("/:id", deleteNotification);

export default router;

