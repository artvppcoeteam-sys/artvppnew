import jwt from "jsonwebtoken";

/**
 * JWT Token Utilities
 *
 * We use two tokens for better security:
 * - Access Token: Short-lived (15 minutes), used for API requests
 * - Refresh Token: Long-lived (7 days), used to get new access tokens
 *
 * Why two tokens?
 * - If access token is stolen, attacker has limited time (15 min)
 * - Refresh token is stored securely and used less frequently
 */

/**
 * Generate Access Token (short-lived)
 * @param {Object} user - User object
 * @returns {string} JWT access token
 */
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
    );
};

/**
 * Generate Refresh Token (long-lived)
 * @param {Object} user - User object
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            type: "refresh" // Distinguish from access token
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
    );
};

/**
 * Generate Email Verification Token
 * @param {Object} user - User object
 * @returns {string} JWT verification token
 */
export const generateVerificationToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            type: "email_verification"
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "24h" } // Valid for 24 hours
    );
};

/**
 * Verify Access Token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Generate both tokens
 * @param {Object} user - User object
 * @returns {Object} Both tokens
 */
export const generateTokens = (user) => {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
    };
};

