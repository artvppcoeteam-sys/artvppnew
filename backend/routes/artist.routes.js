import express from "express";
import rateLimit from "express-rate-limit";
import {
    submitApplication,
    sendEmailOtp,
    verifyEmailOtp,
    getMyApplication,
    getAllApplications,
    getApplicationDetails,
    approveApplication,
    rejectApplication,
    markUnderReview,
    deleteApplication,
    getApplicationStats,
    sendSuggestion,
    checkStudentAvailability,
    submitStudentApplication,
    getStudentArtworkPublishingSetting,
    updateStudentArtworkPublishingSetting
} from "../controllers/artistController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { isAdmin, isVerified } from "../middleware/roleCheck.js";
import { uploadArtistApplicationFiles } from "../middleware/upload.js";
import {
    artistApplicationValidation,
    artistEmailOtpValidation,
    reviewArtistValidation,
    rejectApplicationValidation,
    studentAvailabilityValidation,
    studentSubmissionValidation
} from "../validators/userValidate.js";
import { uploadStudentSubmissionFiles } from "../middleware/upload.js";

const studentSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 5 : 50,
    message: {
        success: false,
        message: "Too many student submissions from this IP. Please try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const router = express.Router();

/**
 * ARTIST APPLICATION ROUTES
 * Base path: /api/v1/artist
 */

// ============================================
// USER ROUTES (Authenticated users)
// ============================================

/**
 * @route   POST /api/v1/artist/apply
 * @desc    Submit artist application with files
 * @access  Private (verified users only)
 *
 * Form data fields:
 * - profilePicture: single image file (required)
 * - artworks: exactly 5 image files (required)
 * - fullName, bio, phone, email, street, city, state, pincode, country
 * - instagram, twitter, facebook, linkedin, youtube, behance, dribbble, otherSocial
 * - portfolioWebsite
 * - artworkTitles: JSON array or comma-separated
 * - artworkDescriptions: JSON array or comma-separated
 */
router.post(
    "/apply",
    isAuthenticated,
    isVerified,
    uploadArtistApplicationFiles,
    artistApplicationValidation,
    submitApplication
);

/**
 * @route   POST /api/v1/artist/send-email-otp
 * @desc    Send OTP to verify email in application
 * @access  Private
 */
router.post(
    "/send-email-otp",
    isAuthenticated,
    sendEmailOtp
);

/**
 * @route   POST /api/v1/artist/verify-email-otp
 * @desc    Verify email OTP
 * @access  Private
 */
router.post(
    "/verify-email-otp",
    isAuthenticated,
    artistEmailOtpValidation,
    verifyEmailOtp
);

/**
 * @route   GET /api/v1/artist/my-application
 * @desc    Get current user's application status
 * @access  Private
 */
router.get(
    "/my-application",
    isAuthenticated,
    getMyApplication
);

// ============================================
// PUBLIC STUDENT LINK ROUTES (No OTP account creation)
// ============================================

router.get(
    "/student/check-availability",
    studentAvailabilityValidation,
    checkStudentAvailability
);

router.post(
    "/student/submit",
    studentSubmissionLimiter,
    uploadStudentSubmissionFiles,
    studentSubmissionValidation,
    submitStudentApplication
);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/v1/artist/admin/stats
 * @desc    Get application statistics for dashboard
 * @access  Private/Admin
 */
router.get(
    "/admin/stats",
    isAuthenticated,
    isAdmin,
    getApplicationStats
);

router.get(
    "/admin/settings/student-artwork-publishing",
    isAuthenticated,
    isAdmin,
    getStudentArtworkPublishingSetting
);

router.put(
    "/admin/settings/student-artwork-publishing",
    isAuthenticated,
    isAdmin,
    updateStudentArtworkPublishingSetting
);

/**
 * @route   GET /api/v1/artist/admin/applications
 * @desc    Get all applications with filters & pagination
 * @access  Private/Admin
 *
 * Query params:
 * - status: pending | under_review | approved | rejected | all (default: pending)
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - sortBy: submittedAt | fullName | status (default: submittedAt)
 * - sortOrder: asc | desc (default: desc)
 */
router.get(
    "/admin/applications",
    isAuthenticated,
    isAdmin,
    getAllApplications
);

/**
 * @route   GET /api/v1/artist/admin/applications/:applicationId
 * @desc    Get single application details
 * @access  Private/Admin
 */
router.get(
    "/admin/applications/:applicationId",
    isAuthenticated,
    isAdmin,
    reviewArtistValidation,
    getApplicationDetails
);

/**
 * @route   PUT /api/v1/artist/admin/applications/:applicationId/review
 * @desc    Mark application as under review
 * @access  Private/Admin
 */
router.put(
    "/admin/applications/:applicationId/review",
    isAuthenticated,
    isAdmin,
    reviewArtistValidation,
    markUnderReview
);

/**
 * @route   PUT /api/v1/artist/admin/applications/:applicationId/approve
 * @desc    Approve artist application
 * @access  Private/Admin
 *
 * Body (optional):
 * - adminNotes: string
 */
router.put(
    "/admin/applications/:applicationId/approve",
    isAuthenticated,
    isAdmin,
    reviewArtistValidation,
    approveApplication
);

/**
 * @route   PUT /api/v1/artist/admin/applications/:applicationId/reject
 * @desc    Reject artist application
 * @access  Private/Admin
 *
 * Body:
 * - rejectionReason: string (optional)
 * - adminNotes: string (optional)
 * - cooldownDays: number (default: 30)
 */
router.put(
    "/admin/applications/:applicationId/reject",
    isAuthenticated,
    isAdmin,
    rejectApplicationValidation,
    rejectApplication
);

/**
 * @route   DELETE /api/v1/artist/admin/applications/:applicationId
 * @desc    Delete application and cleanup images
 * @access  Private/Admin
 */
router.delete(
    "/admin/applications/:applicationId",
    isAuthenticated,
    isAdmin,
    reviewArtistValidation,
    deleteApplication
);

/**
 * @route   POST /api/v1/artist/admin/applications/:applicationId/suggestion
 * @desc    Send suggestion/feedback to artist applicant
 * @access  Private/Admin
 */
router.post(
    "/admin/applications/:applicationId/suggestion",
    isAuthenticated,
    isAdmin,
    sendSuggestion
);

export default router;
