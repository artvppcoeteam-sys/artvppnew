import express from "express";
import {
    getProducts,
    getProductBySlug,
    getCategories,
    requestCreateProduct,
    requestEditProduct,
    requestDeleteProduct,
    getMyProducts,
    getMyRequests,
    markRequestSeen,
    toggleLike,
    adminCreateProduct,
    adminGetPendingRequests,
    adminGetRequestDetails,
    adminApproveRequest,
    adminRejectRequest,
    adminEditProduct,
    adminDeleteProduct,
    adminGetAllProducts,
    adminCreateCategory,
    adminUpdateCategory,
    adminDeleteCategory,
    adminGetCategories
} from "../controllers/productController.js";
import { isAuthenticated, optionalAuth } from "../middleware/auth.js";
import { isArtist, isAdmin } from "../middleware/roleCheck.js";
import { uploadProductImages } from "../config/cloudinary.js";

const router = express.Router();

/**
 * PRODUCT ROUTES
 * Base: /api/v1/products
 *
 * FLOW:
 * - Artists can only REQUEST to create/edit/delete
 * - All requests go to admin for approval
 * - Admin can create/edit/delete directly
 */

// Middleware to handle product image uploads
const handleProductImageUpload = (req, res, next) => {
    uploadProductImages.array("images", 5)(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "Each image must be less than 10MB"
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || "Error uploading images"
            });
        }

        if (req.files && req.files.length > 0) {
            req.uploadedImages = req.files.map(file => ({
                url: file.path || file.secure_url,
                publicId: file.filename || file.public_id
            }));
        }
        next();
    });
};

// ============================================
// PUBLIC ROUTES
// ============================================

// Get categories
router.get("/categories", getCategories);

// Get all approved products
router.get("/", optionalAuth, getProducts);

// Get single product by slug
router.get("/slug/:slug", optionalAuth, getProductBySlug);

// ============================================
// AUTHENTICATED USER ROUTES
// ============================================

// Like/unlike product
router.post("/:productId/like", isAuthenticated, toggleLike);

// ============================================
// ARTIST ROUTES (All actions require admin approval)
// ============================================

// Get artist's own products
router.get("/my-products", isAuthenticated, isArtist, getMyProducts);

// Get artist's pending requests
router.get("/my-requests", isAuthenticated, isArtist, getMyRequests);

// Mark request as seen
router.put("/requests/:requestId/seen", isAuthenticated, isArtist, markRequestSeen);

// REQUEST to create product (goes to admin)
router.post("/request", isAuthenticated, isArtist, handleProductImageUpload, requestCreateProduct);

// REQUEST to edit product (goes to admin)
router.put("/:productId/request-edit", isAuthenticated, isArtist, handleProductImageUpload, requestEditProduct);

// REQUEST to delete product (goes to admin)
router.delete("/:productId/request-delete", isAuthenticated, isArtist, requestDeleteProduct);

// ============================================
// ADMIN ROUTES (Direct actions)
// ============================================

// Get all categories (including inactive)
router.get("/admin/categories", isAuthenticated, isAdmin, adminGetCategories);

// Create category
router.post("/admin/categories", isAuthenticated, isAdmin, adminCreateCategory);

// Update category
router.put("/admin/categories/:categoryId", isAuthenticated, isAdmin, adminUpdateCategory);

// Delete category
router.delete("/admin/categories/:categoryId", isAuthenticated, isAdmin, adminDeleteCategory);

// Get pending requests for approval
router.get("/admin/pending", isAuthenticated, isAdmin, adminGetPendingRequests);

// Get request details
router.get("/admin/pending/:requestId", isAuthenticated, isAdmin, adminGetRequestDetails);

// Approve request
router.put("/admin/pending/:requestId/approve", isAuthenticated, isAdmin, adminApproveRequest);

// Reject request
router.put("/admin/pending/:requestId/reject", isAuthenticated, isAdmin, adminRejectRequest);

// Get all products (admin view)
router.get("/admin/all", isAuthenticated, isAdmin, adminGetAllProducts);

// Create product directly (bypass approval)
router.post("/admin/create", isAuthenticated, isAdmin, handleProductImageUpload, adminCreateProduct);

// Edit product directly
router.put("/admin/:productId", isAuthenticated, isAdmin, handleProductImageUpload, adminEditProduct);

// Delete product directly
router.delete("/admin/:productId", isAuthenticated, isAdmin, adminDeleteProduct);

export default router;

