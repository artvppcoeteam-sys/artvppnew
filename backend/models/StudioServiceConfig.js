import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String, default: null }
    },
    { _id: false }
);

const offeringSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, required: true, trim: true, maxlength: 400 },
        image: imageSchema
    },
    { _id: false }
);

const equipmentCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        image: imageSchema,
        items: [{ type: String, trim: true, maxlength: 300 }]
    },
    { _id: false }
);

const pricingOptionSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, trim: true, lowercase: true },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        price: { type: Number, required: true, min: 0 },
        billingUnit: { type: String, enum: ["hour", "day"], required: true },
        description: { type: String, trim: true, maxlength: 250, default: "" }
    },
    { _id: false }
);

const studioServiceConfigSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: "studio_hire"
        },
        serviceName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 180
        },
        subtitle: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        heroImage: imageSchema,
        galleryImages: [imageSchema],
        whatWeOffer: [offeringSchema],
        perfectFor: [{ type: String, trim: true, maxlength: 200 }],
        equipmentCategories: [equipmentCategorySchema],
        pricingOptions: [pricingOptionSchema],
        responseTimeText: {
            type: String,
            trim: true,
            maxlength: 180,
            default: "We'll confirm your booking within 24 hours."
        },
        discountRules: {
            fiveDayDiscountPerDay: { type: Number, default: 200, min: 0 }
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

studioServiceConfigSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

export const StudioServiceConfig = mongoose.model("StudioServiceConfig", studioServiceConfigSchema);
