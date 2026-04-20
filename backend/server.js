import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "./config/passport.js";

// Import database connection
import connectDB from "./config/db.js";

// Import routes
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import artistRoute from "./routes/artist.routes.js";
import productRoute from "./routes/product.routes.js";
import cartRoute from "./routes/cart.routes.js";
import orderRoute from "./routes/order.routes.js";
import wishlistRoute from "./routes/wishlist.routes.js";
import reviewRoute from "./routes/review.routes.js";
import couponRoute from "./routes/coupon.routes.js";
import notificationRoute from "./routes/notification.routes.js";
import serviceRoute from "./routes/service.routes.js";
import workshopRoute from "./routes/workshop.routes.js";
import featuredArtistRoute from "./routes/featuredArtistRoutes.js";

// Import error handler middleware
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ===========================================
// CORS CONFIGURATION (MUST BE FIRST)
// ===========================================

// CORS - Only allow requests from your frontend domains
const defaultDevOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://artvpp-new.vercel.app",
    "https://artvpp-new-seven.vercel.app"
];

const allowedOrigins = [
    process.env.CLIENT_URL, // Web frontend
    process.env.MOBILE_APP_URL, // Mobile app (if needed)
    ...(process.env.NODE_ENV !== "production" ? defaultDevOrigins : [])
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Allow any vercel.app subdomains in production or dev
        const isVercel = /\.vercel\.app$/.test(origin);

        if (allowedOrigins.includes(origin) || isVercel) {
            callback(null, true);
        } else if (process.env.NODE_ENV !== "production" && /localhost|127\.0\.0\.1/.test(origin)) {
            // Keep local development flexible even if .env wasn't loaded from expected path.
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ===========================================
// CUSTOM SANITIZER (Express 5 compatible)
// ===========================================
// Prevents NoSQL injection by removing $ and . from keys
const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const key of Object.keys(obj)) {
        // Skip keys starting with $ or containing .
        if (key.startsWith('$') || key.includes('.')) continue;
        sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
};

const mongoSanitize = (req, res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.params) req.params = sanitizeObject(req.params);
    // Note: req.query is read-only in Express 5, so we sanitize differently
    next();
};

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet - Sets various HTTP headers for security
app.use(helmet());

// Rate limiting - Prevents brute force attacks
// General rate limit for all routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 100 : 1000, // Much higher limit in development
    message: {
        success: false,
        message: "Too many requests, please try again later"
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(generalLimiter);

// Stricter rate limit for auth routes (login, register, forgot-password)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 10 : 100, // Higher limit in development
    message: {
        success: false,
        message: "Too many authentication attempts, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ===========================================
// BODY PARSING MIDDLEWARE
// ===========================================

// Parse JSON bodies
app.use(express.json({ limit: "10mb" })); // Increased for file uploads

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitize data - Prevents NoSQL injection (custom middleware for Express 5)
app.use(mongoSanitize);


// ===========================================
// API ROUTES
// ===========================================

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        data: {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development"
        }
    });
});

// Auth routes (with stricter rate limiting)
app.use("/api/v1/auth", authLimiter, authRoute);

// User routes
app.use("/api/v1/user", userRoute);

// Artist application routes
app.use("/api/v1/artist", artistRoute);

// Product routes
app.use("/api/v1/products", productRoute);

// Cart routes
app.use("/api/v1/cart", cartRoute);

// Order routes
app.use("/api/v1/orders", orderRoute);

// Wishlist routes
app.use("/api/v1/wishlist", wishlistRoute);

// Review routes
app.use("/api/v1/reviews", reviewRoute);

// Coupon routes
app.use("/api/v1/coupons", couponRoute);

// Notification routes
app.use("/api/v1/notifications", notificationRoute);

// Service routes
app.use("/api/v1/services", serviceRoute);

// Workshop routes
app.use("/api/v1/workshops", workshopRoute);

// Featured Artist routes
app.use("/api/v1/featured-artists", featuredArtistRoute);

// ===========================================
// ERROR HANDLING
// ===========================================

// Handle 404 - Route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ===========================================
// START SERVER
// ===========================================

const startServer = async () => {
    try {
        await connectDB();

        // Only run local server (NOT on Vercel)
        if (process.env.NODE_ENV !== "production") {
            app.listen(PORT, () => {
                console.log(`
╔════════════════════════════════════════════╗
║     🎨 ArtVPP Server Started Successfully  ║
╠════════════════════════════════════════════╣
║  Port: ${PORT}                             ║
║  Mode: ${process.env.NODE_ENV || "development"}                   ║
║  Time: ${new Date().toLocaleTimeString()}                        ║
╚════════════════════════════════════════════╝
                `);
            });
        }

    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== "production") {
    startServer();
}

// export app for Vercel
export default app;