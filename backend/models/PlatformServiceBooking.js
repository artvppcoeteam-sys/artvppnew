import mongoose from "mongoose";

/**
 * Platform Service Booking Model
 * Stores booking requests for platform-managed services (e.g. Photography, Calligraphy).
 */
const platformServiceBookingSchema = new mongoose.Schema(
    {
        serviceKey: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        bookingDate: {
            type: Date,
            required: true,
            index: true
        },
        durationValue: {
            type: Number,
            required: true,
            min: 1
        },
        pricingOption: {
            id: { type: String, required: true, trim: true, lowercase: true },
            name: { type: String, required: true, trim: true },
            billingUnit: { type: String, enum: ["hour", "day"], required: true },
            price: { type: Number, required: true, min: 0 }
        },
        pricingBreakdown: {
            subtotal: { type: Number, required: true, min: 0 },
            discount: { type: Number, default: 0, min: 0 },
            total: { type: Number, required: true, min: 0 }
        },
        city: {
            type: String,
            trim: true,
            default: ""
        },
        purpose: {
            type: String,
            trim: true,
            maxlength: 200,
            default: ""
        },
        message: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
            index: true
        }
    },
    {
        timestamps: true
    }
);

platformServiceBookingSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

export const PlatformServiceBooking = mongoose.model("PlatformServiceBooking", platformServiceBookingSchema);

