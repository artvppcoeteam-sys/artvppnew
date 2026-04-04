/**
 * Global Error Handler Middleware
 * Catches all errors and sends consistent JSON responses
 */

/**
 * Handle 404 - Route Not Found
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Global Error Handler
 * All errors pass through here
 */
export const errorHandler = (err, req, res, next) => {
    // Log error for debugging (in development)
    if (process.env.NODE_ENV === "development") {
        console.error("Error:", err);
    }

    // Default status code
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    // Handle specific error types

    // Mongoose Bad ObjectId (CastError)
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        const errors = Object.values(err.errors).map((e) => e.message);
        message = errors.join(", ");
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

/**
 * Async Handler Wrapper
 * Wraps async functions to catch errors without try-catch in every controller
 *
 * Usage:
 * router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

