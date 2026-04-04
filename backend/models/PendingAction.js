import mongoose from "mongoose";

/**
 * Pending Action Model
 *
 * All artist actions must be approved by admin:
 * - Create product
 * - Edit product
 * - Delete product
 * - Edit profile (name, phone, email, location)
 *
 * Flow:
 * 1. Artist submits request
 * 2. Admin sees in dashboard
 * 3. Admin approves/rejects
 * 4. Artist gets email + dashboard notification
 */

const pendingActionSchema = new mongoose.Schema(
    {
        // Who submitted the request
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Type of action
        actionType: {
            type: String,
            enum: [
                "create_product",
                "edit_product",
                "delete_product",
                "edit_profile"
            ],
            required: true,
            index: true
        },

        // Current status
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true
        },

        // For product actions - reference to existing product (edit/delete)
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null
        },

        // The actual data being submitted
        // For create_product: full product data
        // For edit_product: only changed fields
        // For delete_product: reason for deletion
        // For edit_profile: only changed fields
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        // Images uploaded with this request (stored temporarily)
        images: [{
            url: { type: String },
            publicId: { type: String }
        }],

        // Artist's reason/note for the request
        artistNote: {
            type: String,
            maxlength: 500,
            default: null
        },

        // Admin who reviewed
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        // Admin's reason for rejection (optional)
        rejectionReason: {
            type: String,
            maxlength: 500,
            default: null
        },

        // Admin's internal notes
        adminNote: {
            type: String,
            maxlength: 500,
            default: null
        },

        // Track if artist has seen the result
        artistNotified: {
            type: Boolean,
            default: false
        },

        artistSeenAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient queries
pendingActionSchema.index({ status: 1, createdAt: -1 });
pendingActionSchema.index({ artist: 1, status: 1 });
pendingActionSchema.index({ actionType: 1, status: 1 });

// Instance method: Safe object for response
pendingActionSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

// Static: Get pending count for admin dashboard
pendingActionSchema.statics.getPendingCounts = async function() {
    const counts = await this.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: "$actionType", count: { $sum: 1 } } }
    ]);

    const result = {
        create_product: 0,
        edit_product: 0,
        delete_product: 0,
        edit_profile: 0,
        total: 0
    };

    counts.forEach(item => {
        result[item._id] = item.count;
        result.total += item.count;
    });

    return result;
};

export const PendingAction = mongoose.model("PendingAction", pendingActionSchema);

