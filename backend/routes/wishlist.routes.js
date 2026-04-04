import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlistItem,
    toggleWishlistItem
} from "../controllers/wishlistController.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * @route   GET /api/v1/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get("/", getWishlist);

/**
 * @route   POST /api/v1/wishlist/add
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post("/add", addToWishlist);

/**
 * @route   POST /api/v1/wishlist/toggle
 * @desc    Toggle product in wishlist (add/remove)
 * @access  Private
 */
router.post("/toggle", toggleWishlistItem);

/**
 * @route   GET /api/v1/wishlist/check/:productId
 * @desc    Check if product is in wishlist
 * @access  Private
 */
router.get("/check/:productId", checkWishlistItem);

/**
 * @route   DELETE /api/v1/wishlist/remove/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete("/remove/:productId", removeFromWishlist);

/**
 * @route   DELETE /api/v1/wishlist/clear
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete("/clear", clearWishlist);

export default router;

