import mongoose from "mongoose";

/**
 * Session Model
 * Stores user sessions for better session management
 * Allows us to:
 * - Track active sessions
 * - Implement "logout from all devices"
 * - Detect suspicious login activity
 */

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        refreshToken: {
            type: String,
            required: true,
            select: false
        },
        userAgent: {
            type: String,
            default: null
        },
        ipAddress: {
            type: String,
            default: null
        },
        deviceType: {
            type: String,
            enum: ["web", "mobile", "unknown"],
            default: "unknown"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastActivity: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
            // TTL index created below for auto-cleanup
        }
    },
    {
        timestamps: true
    }
);

// Automatically delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model("Session", sessionSchema);

