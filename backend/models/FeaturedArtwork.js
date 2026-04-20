import mongoose from "mongoose";

const featuredArtworkSchema = new mongoose.Schema(
    {
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        artwork: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        isFeatured: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Unique combination of artist and artwork
featuredArtworkSchema.index({ artist: 1, artwork: 1 }, { unique: true });

export const FeaturedArtwork = mongoose.model("FeaturedArtwork", featuredArtworkSchema);
