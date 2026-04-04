import express from "express";
import {
    createOrder,
    verifyPayment,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getArtistOrders,
    updateOrderStatus,
    adminGetAllOrders,
    adminUpdateOrderStatus
} from "../controllers/orderController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isArtist, isAdmin } from "../middleware/roleCheck.js";

const router = express.Router();

/**
 * ORDER ROUTES
 * Base: /api/v1/orders
 */

// All routes require authentication
router.use(isAuthenticated);

// ============================================
// USER ROUTES
// ============================================

// Create order from cart
router.post("/", createOrder);

// Get user's orders
router.get("/", getMyOrders);

// Get single order
router.get("/:orderId", getOrderById);

// Verify Razorpay payment
router.post("/:orderId/verify-payment", verifyPayment);

// Cancel order
router.put("/:orderId/cancel", cancelOrder);

// ============================================
// ARTIST ROUTES
// ============================================

// Get orders containing artist's products
router.get("/artist/orders", isArtist, getArtistOrders);

// Update order status (processing, shipped, delivered)
router.put("/artist/:orderId/status", isArtist, updateOrderStatus);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all orders (admin view)
router.get("/admin/all", isAuthenticated, isAdmin, adminGetAllOrders);
router.put("/admin/:orderId/status", isAuthenticated, isAdmin, adminUpdateOrderStatus);

export default router;

