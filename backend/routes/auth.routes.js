import express from "express";
import passport from "passport";
import { generateTokens } from "../utils/generateToken.js";
import { Session } from "../models/Session.js";
import {
    register,
    verifyEmail,
    resendVerification,
    login,
    refreshAccessToken,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getMe
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/auth.js";
import {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    otpValidation,
    changePasswordValidation
} from "../validators/userValidate.js";

const router = express.Router();

/**
 * AUTH ROUTES
 * Base path: /api/v1/auth
 */

// ===========================================
// EMAIL/PASSWORD AUTHENTICATION
// ===========================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", registerValidation, register);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify user email with token
 * @access  Public
 */
router.post("/verify-email", verifyEmail);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post("/resend-verification", forgotPasswordValidation, resendVerification);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginValidation, login);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Get new access token using refresh token
 * @access  Public
 */
router.post("/refresh-token", refreshAccessToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", isAuthenticated, logout);

// ===========================================
// PASSWORD RESET
// ===========================================

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

/**
 * @route   POST /api/v1/auth/verify-otp/:email
 * @desc    Verify OTP
 * @access  Public
 */
router.post("/verify-otp/:email", otpValidation, verifyOtp);

/**
 * @route   POST /api/v1/auth/reset-password/:email
 * @desc    Reset password after OTP verification
 * @access  Public
 */
router.post("/reset-password/:email", changePasswordValidation, resetPassword);

// ===========================================
// GET CURRENT USER
// ===========================================

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get("/me", isAuthenticated, getMe);

// ===========================================
// GOOGLE OAUTH
// ===========================================

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`
    }),
    async (req, res) => {
        try {
            const { accessToken, refreshToken } = generateTokens(req.user);

            // Keep single active session per user (same pattern as email/password login)
            await Session.deleteMany({ userId: req.user._id });
            await Session.create({
                userId: req.user._id,
                refreshToken,
                userAgent: req.headers["user-agent"],
                ipAddress: req.ip || req.connection.remoteAddress,
                deviceType: req.headers["x-device-type"] || "web",
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            req.user.lastLogin = new Date();
            await req.user.save();

            const params = new URLSearchParams({
                token: accessToken,
                refreshToken
            });

            // Redirect to frontend with access + refresh token
            res.redirect(`${process.env.CLIENT_URL}/auth-success?${params.toString()}`);
        } catch (error) {
            console.error("Google callback error:", error);
            res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
        }
    }
);

export default router;

