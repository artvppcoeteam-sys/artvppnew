import mongoose from "mongoose";

/**
 * Order Model
 *
 * Stores completed orders
 */

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true }
}, { _id: true });

const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ART${year}${month}${random}`;
};

const orderSchema = new mongoose.Schema(
    {
        // Order number (readable)
        orderNumber: {
            type: String,
            unique: true,
            required: true,
            default: generateOrderNumber
        },

        // Customer
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // Items
        items: [orderItemSchema],

        // Pricing
        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true },

        // Coupon applied
        coupon: {
            code: { type: String },
            discountType: { type: String, enum: ["percentage", "fixed"] },
            discountValue: { type: Number },
            discountApplied: { type: Number, default: 0 }
        },

        // Shipping Address
        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, default: "India" }
        },

        // Order Status
        status: {
            type: String,
            enum: [
                "pending",        // Order created, payment pending
                "confirmed",      // Payment successful
                "processing",     // Being prepared
                "shipped",        // Handed to courier
                "delivered",      // Delivered to customer
                "cancelled",      // Cancelled
                "refunded"        // Refunded
            ],
            default: "pending",
            index: true
        },

        // Payment
        payment: {
            method: {
                type: String,
                enum: ["razorpay", "cod", "upi"],
                required: true
            },
            status: {
                type: String,
                enum: ["pending", "completed", "failed", "refunded"],
                default: "pending"
            },
            razorpayOrderId: { type: String },
            razorpayPaymentId: { type: String },
            razorpaySignature: { type: String },
            paidAt: { type: Date }
        },

        // Shipping/Tracking
        shipping: {
            courier: { type: String },
            trackingNumber: { type: String },
            trackingUrl: { type: String },
            shippedAt: { type: Date },
            deliveredAt: { type: Date }
        },

        // Notes
        customerNote: { type: String, maxlength: 500 },
        adminNote: { type: String, maxlength: 500 },

        // Cancellation
        cancellation: {
            reason: { type: String },
            cancelledBy: { type: String, enum: ["user", "admin", "artist"] },
            cancelledAt: { type: Date }
        }
    },
    {
        timestamps: true
    }
);

// Indexes (orderNumber is already indexed via unique:true)
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "items.artist": 1, status: 1 }); // For artist order queries

// Instance methods
orderSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

// Static: Get orders for artist
orderSchema.statics.getArtistOrders = async function(artistId, options = {}) {
    const { page = 1, limit = 10, status } = options;

    const query = { "items.artist": artistId };
    if (status) query.status = status;

    return this.find(query)
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

export const Order = mongoose.model("Order", orderSchema);

