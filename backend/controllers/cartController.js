import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

/**
 * GET CART
 */
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.userId);

    return res.status(200).json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
};

/**
 * ADD TO CART
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // ✅ Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (product.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Product is not available"
      });
    }

    if (!product.isDigital && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    await cart.addItem(productId, Number(quantity), product.price);

    cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "title images price stock status artist"
    });

    return res.status(200).json({
      success: true,
      message: "Added to cart",
      data: { cart }
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add to cart"
    });
  }
};

/**
 * UPDATE CART ITEM
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id"
      });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    if (quantity > 0) {
      const product = await Product.findById(productId);

      if (!product.isDigital && product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available`
        });
      }
    }

    await cart.updateItemQuantity(productId, Number(quantity));

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "title images price stock status artist"
    });

    return res.status(200).json({
      success: true,
      message: quantity <= 0 ? "Item removed" : "Cart updated",
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart"
    });
  }
};

/**
 * REMOVE FROM CART
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id"
      });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    await cart.removeItem(productId);

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "title images price stock status artist"
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error("Remove cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item"
    });
  }
};

/**
 * CLEAR CART
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    await cart.clearCart();

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: { cart }
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart"
    });
  }
};
