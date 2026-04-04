import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin } from "../middleware/roleCheck.js";
import {
    createReview,
    getMyReviews,
    getProductReviews,
    updateReview,
    deleteReview,
    markReviewHelpful,
    adminGetAllReviews,
    adminApproveReview,
    adminRejectReview
} from "../controllers/reviewController.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/v1/reviews/product/:productId
 * @desc    Get product reviews (public)
 * @access  Public
 */
router.get("/product/:productId", getProductReviews);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

/**
 * @route   POST /api/v1/reviews
 * @desc    Create a review
 * @access  Private
 */
router.post("/", isAuthenticated, createReview);

/**
 * @route   GET /api/v1/reviews/my-reviews
 * @desc    Get user's reviews
 * @access  Private
 */
router.get("/my-reviews", isAuthenticated, getMyReviews);

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update review
 * @access  Private
 */
router.put("/:id", isAuthenticated, updateReview);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 * @access  Private
 */
router.delete("/:id", isAuthenticated, deleteReview);

/**
 * @route   POST /api/v1/reviews/:id/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
router.post("/:id/helpful", isAuthenticated, markReviewHelpful);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/v1/reviews/admin/all
 * @desc    Get all reviews (admin)
 * @access  Admin
 */
router.get("/admin/all", isAuthenticated, isAdmin, adminGetAllReviews);

/**
 * @route   POST /api/v1/reviews/admin/:id/approve
 * @desc    Approve review
 * @access  Admin
 */
router.post("/admin/:id/approve", isAuthenticated, isAdmin, adminApproveReview);

/**
 * @route   POST /api/v1/reviews/admin/:id/reject
 * @desc    Reject review
 * @access  Admin
 */
router.post("/admin/:id/reject", isAuthenticated, isAdmin, adminRejectReview);

export default router;

