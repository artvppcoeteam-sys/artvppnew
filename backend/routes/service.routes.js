import express from "express";
import { uploadServiceImages, uploadServiceImagesMemory, uploadToCloudinary } from "../config/cloudinary.js";
import {
    // Public
    getServices,
    getServiceBySlug,
    getServiceCategories,
    getStudioHireConfig,
    getPlatformServiceConfig,
    bookStudioHire,
    bookPlatformService,
    adminUpsertStudioHireConfig,
    adminUpsertPlatformServiceConfig,
    // User
    bookService,
    getMyBookings,
    cancelMyBooking,
    // Artist
    artistCreateService,
    artistGetMyServices,
    artistUpdateService,
    artistGetServiceBookings,
    artistUpdateBookingStatus,
    // Admin
    adminGetAllServices,
    adminApproveService,
    adminRejectService
} from "../controllers/serviceController.js";
import { isAuthenticated, optionalAuth } from "../middleware/auth.js";
import { isArtist, isAdmin } from "../middleware/roleCheck.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/v1/services
 * @desc    Get all approved services
 * @access  Public
 */
router.get("/", getServices);

/**
 * @route   GET /api/v1/services/categories
 * @desc    Get service categories
 * @access  Public
 */
router.get("/categories", getServiceCategories);

/**
 * @route   GET /api/v1/services/slug/:slug
 * @desc    Get service by slug
 * @access  Public
 */
router.get("/slug/:slug", getServiceBySlug);

/**
 * @route   GET /api/v1/services/studio-hire
 * @desc    Get studio hire configuration
 * @access  Public
 */
router.get("/studio-hire", getStudioHireConfig);

/**
 * @route   GET /api/v1/services/platform/:key
 * @desc    Get platform service landing configuration
 * @access  Public
 */
router.get("/platform/:key", getPlatformServiceConfig);

// ============================================
// USER ROUTES (Require Authentication)
// ============================================

/**
 * @route   POST /api/v1/services/studio-hire/book
 * @desc    Submit studio hire booking request
 * @access  Public (auth optional)
 */
router.post("/studio-hire/book", optionalAuth, bookStudioHire);

/**
 * @route   POST /api/v1/services/platform/:key/book
 * @desc    Submit platform service booking request
 * @access  Public (auth optional)
 */
router.post("/platform/:key/book", optionalAuth, bookPlatformService);

/**
 * @route   POST /api/v1/services/:id/book
 * @desc    Book a service
 * @access  Private
 */
router.post("/:id/book", isAuthenticated, bookService);

/**
 * @route   GET /api/v1/services/my-bookings
 * @desc    Get my service bookings
 * @access  Private
 */
router.get("/my-bookings", isAuthenticated, getMyBookings);

/**
 * @route   POST /api/v1/services/bookings/:id/cancel
 * @desc    Cancel my booking
 * @access  Private
 */
router.post("/bookings/:id/cancel", isAuthenticated, cancelMyBooking);

// ============================================
// ARTIST ROUTES
// ============================================

/**
 * @route   POST /api/v1/services/artist/upload-images
 * @desc    Upload service images (artist)
 * @access  Artist
 */
router.post("/artist/upload-images", isAuthenticated, isArtist, uploadServiceImages.array("images", 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images uploaded"
            });
        }

        const images = req.files.map(file => ({
            url: file.path || file.secure_url,
            publicId: file.filename || file.public_id
        }));

        return res.status(200).json({
            success: true,
            data: { images }
        });
    } catch (error) {
        console.error("Upload service images error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload images"
        });
    }
});

/**
 * @route   POST /api/v1/services/artist
 * @desc    Create a service (artist)
 * @access  Artist
 */
router.post("/artist", isAuthenticated, isArtist, artistCreateService);

/**
 * @route   GET /api/v1/services/artist/my-services
 * @desc    Get my services (artist)
 * @access  Artist
 */
router.get("/artist/my-services", isAuthenticated, isArtist, artistGetMyServices);

/**
 * @route   PUT /api/v1/services/artist/:id
 * @desc    Update my service (artist)
 * @access  Artist
 */
router.put("/artist/:id", isAuthenticated, isArtist, artistUpdateService);

/**
 * @route   GET /api/v1/services/artist/bookings
 * @desc    Get service bookings (artist)
 * @access  Artist
 */
router.get("/artist/bookings", isAuthenticated, isArtist, artistGetServiceBookings);

/**
 * @route   PUT /api/v1/services/artist/bookings/:id/status
 * @desc    Update booking status (artist)
 * @access  Artist
 */
router.put("/artist/bookings/:id/status", isAuthenticated, isArtist, artistUpdateBookingStatus);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   POST /api/v1/services/studio-hire/upload-images
 * @desc    Upload studio hire images (admin)
 * @access  Admin
 */
router.post("/studio-hire/upload-images", isAuthenticated, isAdmin, (req, res) => {
    uploadServiceImagesMemory.array("images", 8)(req, res, async (uploadError) => {
        try {
            if (uploadError) {
                console.error("Studio upload middleware error:", uploadError);
                return res.status(400).json({
                    success: false,
                    message: uploadError.message || "Failed to process uploaded image"
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No images uploaded"
                });
            }

            const uploads = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadToCloudinary(file.buffer, "artvpp/services");
                    return {
                        url: result.secure_url,
                        publicId: result.public_id
                    };
                })
            );

            return res.status(200).json({
                success: true,
                data: { images: uploads }
            });
        } catch (error) {
            console.error("Upload studio images error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to upload studio images"
            });
        }
    });
});

/**
 * @route   POST /api/v1/services/platform/:key/upload-images
 * @desc    Upload platform service landing images (admin)
 * @access  Admin
 */
router.post("/platform/:key/upload-images", isAuthenticated, isAdmin, (req, res) => {
    const key = String(req.params.key || "").trim().toLowerCase();

    uploadServiceImagesMemory.array("images", 8)(req, res, async (uploadError) => {
        try {
            if (!key) {
                return res.status(400).json({
                    success: false,
                    message: "Service key is required"
                });
            }

            if (uploadError) {
                console.error("Platform upload middleware error:", uploadError);
                return res.status(400).json({
                    success: false,
                    message: uploadError.message || "Failed to process uploaded image"
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No images uploaded"
                });
            }

            const uploads = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadToCloudinary(file.buffer, `artvpp/services/${key}`);
                    return {
                        url: result.secure_url,
                        publicId: result.public_id
                    };
                })
            );

            return res.status(200).json({
                success: true,
                data: { images: uploads }
            });
        } catch (error) {
            console.error("Upload platform images error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to upload images"
            });
        }
    });
});

/**
 * @route   PUT /api/v1/services/studio-hire
 * @desc    Admin create/update studio hire configuration
 * @access  Admin
 */
router.put("/studio-hire", isAuthenticated, isAdmin, adminUpsertStudioHireConfig);

/**
 * @route   PUT /api/v1/services/platform/:key
 * @desc    Admin create/update platform service landing configuration
 * @access  Admin
 */
router.put("/platform/:key", isAuthenticated, isAdmin, adminUpsertPlatformServiceConfig);

/**
 * @route   GET /api/v1/services/admin/all
 * @desc    Get all services (admin)
 * @access  Admin
 */
router.get("/admin/all", isAuthenticated, isAdmin, adminGetAllServices);

/**
 * @route   POST /api/v1/services/admin/:id/approve
 * @desc    Approve service
 * @access  Admin
 */
router.post("/admin/:id/approve", isAuthenticated, isAdmin, adminApproveService);

/**
 * @route   POST /api/v1/services/admin/:id/reject
 * @desc    Reject service
 * @access  Admin
 */
router.post("/admin/:id/reject", isAuthenticated, isAdmin, adminRejectService);

export default router;

