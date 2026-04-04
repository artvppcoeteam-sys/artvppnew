import express from "express";
import { uploadWorkshopImages } from "../config/cloudinary.js";
import {
    // Public
    getWorkshops,
    getWorkshopBySlug,
    getWorkshopById,
    getWorkshopCategories,
    // User
    registerForWorkshop,
    getMyRegistrations,
    cancelMyRegistration,
    // Artist
    artistCreateWorkshop,
    artistGetMyWorkshops,
    artistGetWorkshopParticipants,
    artistMarkAttendance,
    // Admin
    adminGetAllWorkshops,
    adminApproveWorkshop,
    adminRejectWorkshop
} from "../controllers/workshopController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isArtist, isAdmin } from "../middleware/roleCheck.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/v1/workshops
 * @desc    Get all approved workshops
 * @access  Public
 */
router.get("/", getWorkshops);

/**
 * @route   GET /api/v1/workshops/categories
 * @desc    Get workshop categories
 * @access  Public
 */
router.get("/categories", getWorkshopCategories);

/**
 * @route   GET /api/v1/workshops/slug/:slug
 * @desc    Get workshop by slug
 * @access  Public
 */
router.get("/slug/:slug", getWorkshopBySlug);

/**
 * @route   GET /api/v1/workshops/:id
 * @desc    Get workshop by ID
 * @access  Public
 */
router.get("/:id", getWorkshopById);

// ============================================
// USER ROUTES (Require Authentication)
// ============================================

/**
 * @route   POST /api/v1/workshops/:id/register
 * @desc    Register for workshop
 * @access  Private
 */
router.post("/:id/register", isAuthenticated, registerForWorkshop);

/**
 * @route   GET /api/v1/workshops/user/my-registrations
 * @desc    Get my workshop registrations
 * @access  Private
 */
router.get("/user/my-registrations", isAuthenticated, getMyRegistrations);

/**
 * @route   POST /api/v1/workshops/user/registrations/:id/cancel
 * @desc    Cancel my registration
 * @access  Private
 */
router.post("/user/registrations/:id/cancel", isAuthenticated, cancelMyRegistration);

// ============================================
// ARTIST ROUTES
// ============================================

/**
 * @route   POST /api/v1/workshops/artist/upload-images
 * @desc    Upload workshop images (artist)
 * @access  Artist
 */
router.post("/artist/upload-images", isAuthenticated, isArtist, uploadWorkshopImages.array("images", 5), (req, res) => {
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
        console.error("Upload workshop images error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload images"
        });
    }
});

/**
 * @route   POST /api/v1/workshops/artist
 * @desc    Create a workshop (artist)
 * @access  Artist
 */
router.post("/artist", isAuthenticated, isArtist, artistCreateWorkshop);

/**
 * @route   GET /api/v1/workshops/artist/my-workshops
 * @desc    Get my workshops (artist)
 * @access  Artist
 */
router.get("/artist/my-workshops", isAuthenticated, isArtist, artistGetMyWorkshops);

/**
 * @route   GET /api/v1/workshops/artist/:id/participants
 * @desc    Get workshop participants (artist)
 * @access  Artist
 */
router.get("/artist/:id/participants", isAuthenticated, isArtist, artistGetWorkshopParticipants);

/**
 * @route   PUT /api/v1/workshops/artist/registrations/:id/attendance
 * @desc    Mark attendance (artist)
 * @access  Artist
 */
router.put("/artist/registrations/:id/attendance", isAuthenticated, isArtist, artistMarkAttendance);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/v1/workshops/admin/all
 * @desc    Get all workshops (admin)
 * @access  Admin
 */
router.get("/admin/all", isAuthenticated, isAdmin, adminGetAllWorkshops);

/**
 * @route   POST /api/v1/workshops/admin/:id/approve
 * @desc    Approve workshop
 * @access  Admin
 */
router.post("/admin/:id/approve", isAuthenticated, isAdmin, adminApproveWorkshop);

/**
 * @route   POST /api/v1/workshops/admin/:id/reject
 * @desc    Reject workshop
 * @access  Admin
 */
router.post("/admin/:id/reject", isAuthenticated, isAdmin, adminRejectWorkshop);

export default router;

