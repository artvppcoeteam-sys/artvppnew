/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Roles hierarchy:
 * - admin: Can do everything
 * - artist: Can sell products + everything a user can do
 * - user: Can browse, buy, like products
 */

/**
 * Check if user has required role(s)
 * @param  {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 *
 * Usage:
 * router.get('/admin-only', isAuthenticated, authorize('admin'), controller)
 * router.get('/artist-or-admin', isAuthenticated, authorize('artist', 'admin'), controller)
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This action requires ${allowedRoles.join(" or ")} role.`
            });
        }

        next();
    };
};

/**
 * Check if user is an admin
 * Shortcut for authorize('admin')
 */
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }

    next();
};

/**
 * Check if user is an artist or admin
 * Artists and admins can create/manage products
 */
export const isArtist = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!["artist", "admin"].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Artist privileges required."
        });
    }

    next();
};

/**
 * Check if user is verified
 * Some actions require email verification
 */
export const isVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Please verify your email first"
        });
    }

    next();
};

