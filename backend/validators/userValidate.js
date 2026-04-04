import { body, param, query, validationResult } from "express-validator";

/**
 * Validation Middleware using express-validator
 * More secure than yup for server-side validation
 */

/**
 * Process validation results
 * Call this after validation rules
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

/**
 * Registration Validation Rules
 */
export const registerValidation = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

    body("displayName")
        .trim()
        .notEmpty().withMessage("Display name is required")
        .isLength({ min: 2, max: 60 }).withMessage("Display name must be 2-60 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain at least one uppercase, one lowercase, and one number"),

    validate
];

/**
 * Login Validation Rules
 */
export const loginValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),

    body("password")
        .notEmpty().withMessage("Password is required"),

    validate
];

/**
 * Forgot Password Validation
 */
export const forgotPasswordValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),

    validate
];

/**
 * OTP Validation
 */
export const otpValidation = [
    param("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email"),

    body("otp")
        .trim()
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
        .isNumeric().withMessage("OTP must contain only numbers"),

    validate
];

/**
 * Change Password Validation
 */
export const changePasswordValidation = [
    param("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email"),

    body("newPassword")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain at least one uppercase, one lowercase, and one number"),

    body("confirmPassword")
        .notEmpty().withMessage("Confirm password is required")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    validate
];

/**
 * Update Profile Validation
 */
export const updateProfileValidation = [
    body("username")
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

    body("bio")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters"),

    body("phone")
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/).withMessage("Phone must be 10 digits"),

    body("college")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("College name cannot exceed 100 characters"),

    validate
];

/**
 * Artist Application Validation
 * Note: File uploads are handled by upload middleware, not validated here
 */
export const artistApplicationValidation = [
    body("fullName")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ min: 3, max: 100 }).withMessage("Full name must be 3-100 characters"),

    body("bio")
        .trim()
        .notEmpty().withMessage("Bio is required")
        .isLength({ min: 50, max: 1000 }).withMessage("Bio must be 50-1000 characters")
        .custom((value) => {
            const wordCount = value.trim().split(/\s+/).length;
            if (wordCount < 15) {
                throw new Error(`Bio must have at least 15 words. Current: ${wordCount} words`);
            }
            return true;
        }),

    body("secondaryPhone")
        .trim()
        .notEmpty().withMessage("Secondary phone number is required")
        .custom((value) => {
            // Remove non-digits and check length
            const cleaned = value.replace(/\D/g, '');
            const phoneNumber = cleaned.length > 10 ? cleaned.slice(-10) : cleaned;
            if (phoneNumber.length !== 10) {
                throw new Error("Phone number must be 10 digits");
            }
            return true;
        }),

    body("secondaryEmail")
        .trim()
        .notEmpty().withMessage("Secondary email is required")
        .isEmail().withMessage("Please provide a valid secondary email")
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),

    // Address validation
    body("street")
        .trim()
        .notEmpty().withMessage("Street address is required")
        .isLength({ max: 200 }).withMessage("Street address cannot exceed 200 characters"),

    body("city")
        .trim()
        .notEmpty().withMessage("City is required")
        .isLength({ max: 100 }).withMessage("City cannot exceed 100 characters"),

    body("state")
        .trim()
        .notEmpty().withMessage("State is required")
        .isLength({ max: 100 }).withMessage("State cannot exceed 100 characters"),

    body("pincode")
        .trim()
        .notEmpty().withMessage("Pincode is required")
        .matches(/^[0-9]{6}$/).withMessage("Pincode must be 6 digits"),

    body("country")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Country cannot exceed 100 characters"),

    // Social media (all optional)
    body("instagram")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Instagram URL cannot exceed 200 characters"),

    body("twitter")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Twitter URL cannot exceed 200 characters"),

    body("facebook")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Facebook URL cannot exceed 200 characters"),

    body("linkedin")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("LinkedIn URL cannot exceed 200 characters"),

    body("youtube")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("YouTube URL cannot exceed 200 characters"),

    body("behance")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Behance URL cannot exceed 200 characters"),

    body("dribbble")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Dribbble URL cannot exceed 200 characters"),

    body("otherSocial")
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage("Other social URL cannot exceed 200 characters"),

    body("portfolioWebsite")
        .optional()
        .trim()
        .isURL().withMessage("Please provide a valid portfolio website URL"),

    validate
];

/**
 * Email OTP Validation for Artist Application
 */
export const artistEmailOtpValidation = [
    body("otp")
        .trim()
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
        .isNumeric().withMessage("OTP must contain only numbers"),

    validate
];

/**
 * Admin: Review Artist Application Validation
 */
export const reviewArtistValidation = [
    param("applicationId")
        .notEmpty().withMessage("Application ID is required")
        .isMongoId().withMessage("Invalid application ID"),

    validate
];

/**
 * Admin: Reject Application Validation
 * cooldownDays: Days before artist can reapply (default: 3, range: 0-365)
 */
export const rejectApplicationValidation = [
    param("applicationId")
        .notEmpty().withMessage("Application ID is required")
        .isMongoId().withMessage("Invalid application ID"),

    body("rejectionReason")
        .optional() // Rejection reason is optional
        .trim()
        .isLength({ max: 500 }).withMessage("Rejection reason cannot exceed 500 characters"),

    body("cooldownDays")
        .optional()
        .isInt({ min: 0, max: 365 }).withMessage("Cooldown days must be between 0 and 365 (default: 3)"),

    validate
];

/**
 * Public student submission availability check
 */
export const studentAvailabilityValidation = [
    query("username")
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

    query("email")
        .optional()
        .trim()
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),

    validate
];

/**
 * Public student submission validation
 */
export const studentSubmissionValidation = [
    body("displayName")
        .trim()
        .notEmpty().withMessage("Display name is required")
        .isLength({ min: 2, max: 60 }).withMessage("Display name must be 2-60 characters"),

    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),

    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .custom((value) => {
            const cleaned = value.replace(/\D/g, '').slice(-10);
            if (cleaned.length !== 10) {
                throw new Error("Phone number must be 10 digits");
            }
            return true;
        }),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase, and a number"),

    body("confirmPassword")
        .notEmpty().withMessage("Confirm password is required")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    body("fullName")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ min: 3, max: 100 }).withMessage("Full name must be 3-100 characters"),

    body("bio")
        .trim()
        .notEmpty().withMessage("Bio is required")
        .isLength({ min: 50, max: 1000 }).withMessage("Bio must be 50-1000 characters")
        .custom((value) => {
            const wordCount = value.trim().split(/\s+/).length;
            if (wordCount < 15) {
                throw new Error(`Bio must have at least 15 words. Current: ${wordCount} words`);
            }
            return true;
        }),

    body("street")
        .trim()
        .notEmpty().withMessage("Street address is required")
        .isLength({ max: 200 }).withMessage("Street address cannot exceed 200 characters"),

    body("city")
        .trim()
        .notEmpty().withMessage("City is required")
        .isLength({ max: 100 }).withMessage("City cannot exceed 100 characters"),

    body("state")
        .trim()
        .notEmpty().withMessage("State is required")
        .isLength({ max: 100 }).withMessage("State cannot exceed 100 characters"),

    body("pincode")
        .trim()
        .notEmpty().withMessage("Pincode is required")
        .matches(/^[0-9]{6}$/).withMessage("Pincode must be 6 digits"),

    body("country")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Country cannot exceed 100 characters"),

    body("termsAccepted")
        .custom((value) => {
            const asString = String(value).toLowerCase();
            if (!["true", "1", "yes", "on"].includes(asString)) {
                throw new Error("You must accept Terms & Conditions");
            }
            return true;
        }),

    body("artworksMeta")
        .trim()
        .notEmpty().withMessage("Artwork data is required")
        .custom((value) => {
            let parsed;
            try {
                parsed = JSON.parse(value);
            } catch {
                throw new Error("Invalid artworks metadata");
            }
            if (!Array.isArray(parsed) || parsed.length < 1) {
                throw new Error("At least one artwork block is required");
            }
            if (parsed.length > 20) {
                throw new Error("Maximum 20 artwork blocks are allowed");
            }

            for (let i = 0; i < parsed.length; i += 1) {
                const item = parsed[i] || {};
                const price = Number(item.price);
                if (!Number.isFinite(price) || price <= 0) {
                    throw new Error(`Artwork #${i + 1}: valid price is required`);
                }
            }
            return true;
        }),

    validate
];
