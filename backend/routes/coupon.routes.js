import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
    validateCoupon,
    getAvailableCoupons,
    adminGetAllCoupons,
    adminCreateCoupon,
    adminUpdateCoupon,
    adminDeleteCoupon,
    adminGetCouponUsage
} from "../controllers/couponController.js";

const router = express.Router();

// ============================================
// USER ROUTES (Require Authentication)
// ============================================

/**
 * @route   POST /api/v1/coupons/validate
 * @desc    Validate a coupon code
 * @access  Private
 */
router.post("/validate", isAuthenticated, validateCoupon);

/**
 * @route   GET /api/v1/coupons/available
 * @desc    Get available coupons for user
 * @access  Private
 */
router.get("/available", isAuthenticated, getAvailableCoupons);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/v1/coupons/admin/all
 * @desc    Get all coupons
 * @access  Admin
 */
router.get("/admin/all", isAuthenticated, isAdmin, adminGetAllCoupons);

/**
 * @route   POST /api/v1/coupons/admin
 * @desc    Create coupon
 * @access  Admin
 */
router.post("/admin", isAuthenticated, isAdmin, adminCreateCoupon);

/**
 * @route   PUT /api/v1/coupons/admin/:id
 * @desc    Update coupon
 * @access  Admin
 */
router.put("/admin/:id", isAuthenticated, isAdmin, adminUpdateCoupon);

/**
 * @route   DELETE /api/v1/coupons/admin/:id
 * @desc    Delete coupon
 * @access  Admin
 */
router.delete("/admin/:id", isAuthenticated, isAdmin, adminDeleteCoupon);

/**
 * @route   GET /api/v1/coupons/admin/:id/usage
 * @desc    Get coupon usage stats
 * @access  Admin
 */
router.get("/admin/:id/usage", isAuthenticated, isAdmin, adminGetCouponUsage);

export default router;

