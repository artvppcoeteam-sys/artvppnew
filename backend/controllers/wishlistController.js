import { Wishlist } from "../models/Wishlist.js";
import { Product } from "../models/Product.js";

/**
 * Wishlist Controller
 */

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.getOrCreate(req.userId);

        // Populate product details
        await wishlist.populate({
            path: "products.product",
            select: "title slug images price comparePrice stock artist category verification",
            populate: {
                path: "artist",
                select: "username"
            }
        });

        // Filter out any products that are no longer available or approved
        const validProducts = wishlist.products.filter(item =>
            item.product &&
            item.product.verification?.status === "approved" &&
            item.product.stock > 0
        );

        return res.status(200).json({
            success: true,
            data: {
                wishlist: {
                    _id: wishlist._id,
                    products: validProducts,
                    count: validProducts.length
                }
            }
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist"
        });
    }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist/add
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Verify product exists and is approved
        const product = await Product.findOne({
            _id: productId,
            "verification.status": "approved"
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or not available"
            });
        }

        const wishlist = await Wishlist.getOrCreate(req.userId);

        // Check if already in wishlist
        if (wishlist.hasProduct(productId)) {
            return res.status(400).json({
                success: false,
                message: "Product is already in your wishlist"
            });
        }

        await wishlist.addProduct(productId);

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            data: {
                productId,
                wishlistCount: wishlist.products.length
            }
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist"
        });
    }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/remove/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        if (!wishlist.hasProduct(productId)) {
            return res.status(400).json({
                success: false,
                message: "Product is not in your wishlist"
            });
        }

        await wishlist.removeProduct(productId);

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            data: {
                productId,
                wishlistCount: wishlist.products.length
            }
        });
    } catch (error) {
        console.error("Remove from wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove product from wishlist"
        });
    }
};

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/v1/wishlist/clear
 * @access  Private
 */
export const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        await wishlist.clear();

        return res.status(200).json({
            success: true,
            message: "Wishlist cleared successfully"
        });
    } catch (error) {
        console.error("Clear wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to clear wishlist"
        });
    }
};

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/v1/wishlist/check/:productId
 * @access  Private
 */
export const checkWishlistItem = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.userId });
        const isInWishlist = wishlist ? wishlist.hasProduct(productId) : false;

        return res.status(200).json({
            success: true,
            data: {
                productId,
                isInWishlist
            }
        });
    } catch (error) {
        console.error("Check wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to check wishlist"
        });
    }
};

/**
 * @desc    Toggle product in wishlist (add if not exists, remove if exists)
 * @route   POST /api/v1/wishlist/toggle
 * @access  Private
 */
export const toggleWishlistItem = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Verify product exists and is approved
        const product = await Product.findOne({
            _id: productId,
            "verification.status": "approved"
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or not available"
            });
        }

        const wishlist = await Wishlist.getOrCreate(req.userId);
        const wasInWishlist = wishlist.hasProduct(productId);

        if (wasInWishlist) {
            await wishlist.removeProduct(productId);
        } else {
            await wishlist.addProduct(productId);
        }

        return res.status(200).json({
            success: true,
            message: wasInWishlist ? "Removed from wishlist" : "Added to wishlist",
            data: {
                productId,
                isInWishlist: !wasInWishlist,
                wishlistCount: wishlist.products.length
            }
        });
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update wishlist"
        });
    }
};

