import express from "express";
import {
    updateProfile,
    changePassword,
    applyForArtist,
    getArtistStatus,
    getAllUsers,
    getPendingArtistApplications,
    reviewArtistApplication,
    updateUserRole,
    toggleUserStatus,
    requestProfileEdit,
    adminGetProfileRequests,
    adminApproveProfileEdit,
    adminRejectProfileEdit,
    // Address management
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin, isVerified, isArtist } from "../middleware/roleCheck.js";
import {
    updateProfileValidation,
    artistApplicationValidation,
    reviewArtistValidation
} from "../validators/userValidate.js";

const router = express.Router();

/**
 * USER ROUTES
 * Base path: /api/v1/user
 *
 * NOTE: Artists cannot directly edit name, phone, email, location
 * They must use the request-profile-edit endpoint
 */

// ===========================================
// PROFILE MANAGEMENT (Any authenticated user)
// ===========================================

/**
 * @route   PUT /api/v1/user/profile
 * @desc    Update user profile (artists: limited fields)
 * @access  Private
 */
router.put("/profile", isAuthenticated, updateProfileValidation, updateProfile);

/**
 * @route   PUT /api/v1/user/change-password
 * @desc    Change password (when logged in)
 * @access  Private
 */
router.put("/change-password", isAuthenticated, changePassword);

// ===========================================
// ADDRESS MANAGEMENT
// ===========================================

/**
 * @route   GET /api/v1/user/addresses
 * @desc    Get user's addresses
 * @access  Private
 */
router.get("/addresses", isAuthenticated, getAddresses);

/**
 * @route   POST /api/v1/user/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post("/addresses", isAuthenticated, addAddress);

/**
 * @route   PUT /api/v1/user/addresses/:addressId
 * @desc    Update address
 * @access  Private
 */
router.put("/addresses/:addressId", isAuthenticated, updateAddress);

/**
 * @route   DELETE /api/v1/user/addresses/:addressId
 * @desc    Delete address
 * @access  Private
 */
router.delete("/addresses/:addressId", isAuthenticated, deleteAddress);

/**
 * @route   POST /api/v1/user/addresses/:addressId/default
 * @desc    Set address as default
 * @access  Private
 */
router.post("/addresses/:addressId/default", isAuthenticated, setDefaultAddress);

// ===========================================
// ARTIST PROFILE EDIT REQUEST
// ===========================================

/**
 * @route   POST /api/v1/user/request-profile-edit
 * @desc    Artist: Request to edit profile (name, phone, email, location)
 * @access  Private/Artist
 */
router.post("/request-profile-edit", isAuthenticated, isArtist, requestProfileEdit);

// ===========================================
// ARTIST APPLICATION (Regular users)
// ===========================================

/**
 * @route   POST /api/v1/user/apply-artist
 * @desc    Apply to become an artist
 * @access  Private (verified users only)
 */
router.post(
    "/apply-artist",
    isAuthenticated,
    isVerified,
    artistApplicationValidation,
    applyForArtist
);

/**
 * @route   GET /api/v1/user/artist-status
 * @desc    Get artist application status
 * @access  Private
 */
router.get("/artist-status", isAuthenticated, getArtistStatus);

// ===========================================
// ADMIN ROUTES
// ===========================================

/**
 * @route   GET /api/v1/user/admin/users
 * @desc    Get all users (with pagination & filters)
 * @access  Private/Admin
 */
router.get("/admin/users", isAuthenticated, isAdmin, getAllUsers);

/**
 * @route   GET /api/v1/user/admin/artist-applications
 * @desc    Get pending artist applications
 * @access  Private/Admin
 */
router.get(
    "/admin/artist-applications",
    isAuthenticated,
    isAdmin,
    getPendingArtistApplications
);

/**
 * @route   PUT /api/v1/user/admin/review-artist/:userId
 * @desc    Approve or reject artist application
 * @access  Private/Admin
 */
router.put(
    "/admin/review-artist/:userId",
    isAuthenticated,
    isAdmin,
    reviewArtistValidation,
    reviewArtistApplication
);

/**
 * @route   PUT /api/v1/user/admin/role/:userId
 * @desc    Update user role
 * @access  Private/Admin
 */
router.put("/admin/role/:userId", isAuthenticated, isAdmin, updateUserRole);

/**
 * @route   PUT /api/v1/user/admin/status/:userId
 * @desc    Activate/Deactivate user account
 * @access  Private/Admin
 */
router.put("/admin/status/:userId", isAuthenticated, isAdmin, toggleUserStatus);

// ===========================================
// ADMIN: PROFILE EDIT REQUESTS
// ===========================================

/**
 * @route   GET /api/v1/user/admin/profile-requests
 * @desc    Get artist profile edit requests
 * @access  Private/Admin
 */
router.get("/admin/profile-requests", isAuthenticated, isAdmin, adminGetProfileRequests);

/**
 * @route   PUT /api/v1/user/admin/profile-requests/:requestId/approve
 * @desc    Approve profile edit request
 * @access  Private/Admin
 */
router.put("/admin/profile-requests/:requestId/approve", isAuthenticated, isAdmin, adminApproveProfileEdit);

/**
 * @route   PUT /api/v1/user/admin/profile-requests/:requestId/reject
 * @desc    Reject profile edit request
 * @access  Private/Admin
 */
router.put("/admin/profile-requests/:requestId/reject", isAuthenticated, isAdmin, adminRejectProfileEdit);

export default router;

