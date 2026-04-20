import mongoose from "mongoose";

const featuredArtistSchema = new mongoose.Schema(
    {
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            unique: false // Remove unique constraint if multiple entries can point to same artist or no artist
        },
        name: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: ""
        },
        category: {
            type: String,
            required: true
        },
        displayOrder: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

export const FeaturedArtist = mongoose.model("FeaturedArtist", featuredArtistSchema);

// Handle migration: drop old unique index on 'artist' if it exists (only after DB connection)
mongoose.connection.once("open", () => {
    FeaturedArtist.collection.dropIndex("artist_1").catch(() => {
        // Index might not exist or already dropped, which is fine
    });
});

