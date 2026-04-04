import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cartController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

/**
 * CART ROUTES
 * Base: /api/v1/cart
 */

// All cart routes require authentication
router.use(isAuthenticated);

// Get cart
router.get("/", getCart);

// Add item to cart
router.post("/add", addToCart);

// Update item quantity
router.put("/update", updateCartItem);

// Remove item from cart
router.delete("/remove/:productId", removeFromCart);

// Clear cart
router.delete("/clear", clearCart);

export default router;

