import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import {
    generateTokens,
    generateVerificationToken,
    verifyRefreshToken
} from "../utils/generateToken.js";
import {
    sendVerificationEmail,
    sendOtpEmail,
    sendWelcomeEmail
} from "../utils/sendEmail.js";

/**
 * Auth Controller
 * Handles user authentication: register, login, logout, password reset
 */

// ===========================================
// REGISTER
// ===========================================

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
    try {
        const { username, displayName, email, password, phone } = req.body;
        const cleanDisplayName = String(displayName || "").trim() || username;

        // Validate phone if provided
        let cleanPhone = null;
        if (phone) {
            // Remove all non-digits
            cleanPhone = phone.replace(/\D/g, '');
            // Keep last 10 digits
            cleanPhone = cleanPhone.slice(-10);

            if (cleanPhone.length !== 10) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number must be 10 digits"
                });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            // Check if they registered but never verified
            if (!existingUser.isVerified && existingUser.password) {
                // Allow re-registration: delete old unverified account
                // This handles cases where verification link expired
                await User.deleteOne({ _id: existingUser._id });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Email is already registered"
                });
            }
        }

        // Create new user (password is hashed in model pre-save hook)
        const newUser = await User.create({
            username,
            displayName: cleanDisplayName,
            email: email.toLowerCase(),
            password,
            phone: cleanPhone, // Save phone number
            role: "user" // Default role
        });

        // Generate verification token
        const verificationToken = generateVerificationToken(newUser);

        // Store token in user document
        newUser.verificationToken = verificationToken;
        newUser.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await newUser.save();

        // Send verification email
        await sendVerificationEmail(email, verificationToken, cleanDisplayName);

        return res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email to verify your account.",
            data: {
                email: newUser.email,
                username: newUser.username,
                displayName: newUser.displayName
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
};

// ===========================================
// VERIFY EMAIL
// ===========================================

/**
 * @desc    Verify user email
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required"
            });
        }

        // Find user with this token
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: new Date() }
        }).select("+verificationToken +verificationTokenExpiry");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification link"
            });
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        // Send welcome email (non-blocking)
        sendWelcomeEmail(user.email, user.username).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now login."
        });
    } catch (error) {
        console.error("Verify email error:", error);
        return res.status(500).json({
            success: false,
            message: "Verification failed. Please try again."
        });
    }
};

// ===========================================
// RESEND VERIFICATION EMAIL
// ===========================================

/**
 * @desc    Resend verification email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if email exists (security)
            return res.status(200).json({
                success: true,
                message: "If the email exists, a verification link has been sent."
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified. Please login."
            });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken(user);
        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, verificationToken, user.username);

        return res.status(200).json({
            success: true,
            message: "Verification email sent! Please check your inbox."
        });
    } catch (error) {
        console.error("Resend verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send verification email. Please try again."
        });
    }
};

// ===========================================
// LOGIN
// ===========================================

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if user has a password (might be Google-only user)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "Please login with Google"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
                code: "EMAIL_NOT_VERIFIED"
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated"
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Create session (delete old sessions for this user first - single device login)
        // If you want multi-device login, remove the deleteMany line
        await Session.deleteMany({ userId: user._id });

        await Session.create({
            userId: user._id,
            refreshToken,
            userAgent: req.headers["user-agent"],
            ipAddress: req.ip || req.connection.remoteAddress,
            deviceType: req.headers["x-device-type"] || "unknown",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.username}!`,
            data: {
                user: user.toSafeObject(),
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
};

// ===========================================
// REFRESH TOKEN
// ===========================================

/**
 * @desc    Get new access token using refresh token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        // Check if session exists
        const session = await Session.findOne({
            userId: decoded.id,
            isActive: true
        }).select("+refreshToken");

        if (!session || session.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Session not found or token mismatch"
            });
        }

        // Get user
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive"
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        // Update session with new refresh token
        session.refreshToken = tokens.refreshToken;
        session.lastActivity = new Date();
        await session.save();

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to refresh token"
        });
    }
};

// ===========================================
// LOGOUT
// ===========================================

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
    try {
        // Delete user's session
        await Session.deleteMany({ userId: req.userId });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};

// ===========================================
// FORGOT PASSWORD
// ===========================================

/**
 * @desc    Send OTP for password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If the email exists, an OTP has been sent."
            });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash OTP before storing (security best practice)
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Store OTP with expiry (10 minutes)
        user.otp = hashedOtp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Send OTP email
        await sendOtpEmail(email, otp, user.username);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email. Valid for 10 minutes."
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again."
        });
    }
};

// ===========================================
// VERIFY OTP
// ===========================================

/**
 * @desc    Verify OTP for password reset
 * @route   POST /api/v1/auth/verify-otp/:email
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
    try {
        const { email } = req.params;
        const { otp } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() }).select("+otp +otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if OTP exists and not expired
        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "No OTP request found. Please request a new one."
            });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        // Verify OTP (compare with hashed version)
        const isOtpValid = await bcrypt.compare(otp, user.otp);

        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // OTP is valid - clear it but allow password change window
        // We keep otpExpiry to check in changePassword
        user.otp = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now reset your password."
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "OTP verification failed"
        });
    }
};

// ===========================================
// CHANGE PASSWORD (After OTP verification)
// ===========================================

/**
 * @desc    Reset password after OTP verification
 * @route   POST /api/v1/auth/reset-password/:email
 * @access  Public
 */
export const resetPassword = async (req, res) => {
    try {
        const { email } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() }).select("+otpExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if OTP was recently verified (within the expiry window)
        if (!user.otpExpiry || user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Password reset session expired. Please request a new OTP."
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Logout from all devices (security measure)
        await Session.deleteMany({ userId: user._id });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please login with your new password."
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Password reset failed"
        });
    }
};

// ===========================================
// GET CURRENT USER
// ===========================================

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: {
                user: user.toSafeObject()
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });
    }
};

