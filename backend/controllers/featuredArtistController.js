import { FeaturedArtist } from "../models/FeaturedArtist.js";
import { FeaturedArtwork } from "../models/FeaturedArtwork.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";

/**
 * @desc    Get featured artists for homepage
 * @route   GET /api/v1/featured-artists
 * @access  Public
 */
export const getFeaturedArtists = async (req, res) => {
    try {
        const artists = await FeaturedArtist.find({ status: "active" })
            .sort({ displayOrder: 1 })
            .limit(8)
            .populate({
                path: "artist",
                select: "username displayName avatar followers followersCount bio role specialty"
            });

        // Map to include follower count and specialty if needed
        const formattedArtists = artists.map(item => {
            const artist = item.artist;
            return {
                id: item._id,
                artistId: artist?._id || null,
                name: item.name || artist?.displayName || artist?.username,
                avatar: item.avatar || artist?.avatar,
                specialty: item.category, // Use the category set in featured artist
                followers: artist?.followersCount || artist?.followers?.length || 0,
                artworks: 0, // Will be filled below
                bio: artist?.bio,
                displayOrder: item.displayOrder,
                status: item.status
            };
        });

        // Get artwork count for each artist
        for (let artist of formattedArtists) {
            if (artist.artistId) {
                artist.artworks = await Product.countDocuments({ artist: artist.artistId, status: "active" });
            }
        }

        res.status(200).json({
            success: true,
            data: formattedArtists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured artists",
            error: error.message
        });
    }
};

/**
 * @desc    Add new featured artist
 * @route   POST /api/v1/featured-artists
 * @access  Admin
 */
export const createFeaturedArtist = async (req, res) => {
    try {
        const { name, category, displayOrder, status, avatar } = req.body;

        // Auto-link artist by name if possible
        let artistId = null;
        if (name) {
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const user = await User.findOne({ 
                $or: [
                    { displayName: name }, 
                    { username: { $regex: new RegExp(`^${escapedName}$`, "i") } }
                ] 
            });
            if (user) artistId = user._id;
        }

        // Validate count
        const activeCount = await FeaturedArtist.countDocuments({ status: "active" });
        if (status === "active" && activeCount >= 8) {
            return res.status(400).json({ success: false, message: "Only 8 artists can be active at a time" });
        }

        const featuredArtist = await FeaturedArtist.create({
            artist: artistId,
            name,
            avatar,
            category,
            displayOrder,
            status
        });

        res.status(201).json({
            success: true,
            data: featuredArtist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating featured artist",
            error: error.message
        });
    }
};

/**
 * @desc    Update featured artist
 * @route   PUT /api/v1/featured-artists/:id
 * @access  Admin
 */
export const updateFeaturedArtist = async (req, res) => {
    try {
        const { name, category, displayOrder, status, avatar } = req.body;
        const { id } = req.params;

        const featuredArtist = await FeaturedArtist.findById(id);
        if (!featuredArtist) {
            return res.status(404).json({ success: false, message: "Featured artist not found" });
        }

        // Auto-link/re-link artist if name changed
        if (name && name !== featuredArtist.name) {
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const user = await User.findOne({ 
                $or: [
                    { displayName: name }, 
                    { username: { $regex: new RegExp(`^${escapedName}$`, "i") } }
                ] 
            });
            featuredArtist.artist = user?._id || null;
        }

        // Validate active count if changing status to active
        if (status === "active" && featuredArtist.status !== "active") {
            const activeCount = await FeaturedArtist.countDocuments({ status: "active" });
            if (activeCount >= 8) {
                return res.status(400).json({ success: false, message: "Only 8 artists can be active at a time" });
            }
        }

        featuredArtist.name = name || featuredArtist.name;
        featuredArtist.avatar = avatar !== undefined ? avatar : featuredArtist.avatar;
        featuredArtist.category = category || featuredArtist.category;
        featuredArtist.displayOrder = displayOrder || featuredArtist.displayOrder;
        featuredArtist.status = status || featuredArtist.status;

        await featuredArtist.save();

        res.status(200).json({
            success: true,
            data: featuredArtist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating featured artist",
            error: error.message
        });
    }
};

/**
 * @desc    Remove featured artist
 * @route   DELETE /api/v1/featured-artists/:id
 * @access  Admin
 */
export const deleteFeaturedArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const featuredArtist = await FeaturedArtist.findByIdAndDelete(id);

        if (!featuredArtist) {
            return res.status(404).json({ success: false, message: "Featured artist not found" });
        }

        // Also cleanup featured artworks for this artist
        await FeaturedArtwork.deleteMany({ artist: featuredArtist.artist });

        res.status(200).json({
            success: true,
            message: "Featured artist removed"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting featured artist",
            error: error.message
        });
    }
};

/**
 * @desc    Get all artworks of an artist
 * @route   GET /api/v1/featured-artists/artists/:id/artworks
 * @access  Admin
 */
export const getArtistArtworks = async (req, res) => {
    try {
        const { id } = req.params; // artist id
        const artworks = await Product.find({ artist: id });
        
        // Find which ones are currently featured
        const featuredArtworks = await FeaturedArtwork.find({ artist: id });
        const featuredIds = featuredArtworks.map(fa => fa.artwork.toString());

        const data = artworks.map(art => ({
            ...art.toObject(),
            isFeatured: featuredIds.includes(art._id.toString())
        }));

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching artist artworks",
            error: error.message
        });
    }
};

/**
 * @desc    Save selected artworks for profile display
 * @route   PUT /api/v1/featured-artists/artists/:id/featured-artworks
 * @access  Admin
 */
export const updateFeaturedArtworks = async (req, res) => {
    try {
        const { id } = req.params; // artist id
        const { artworkIds } = req.body; // array of artwork ids

        // Remove old featured artworks
        await FeaturedArtwork.deleteMany({ artist: id });

        // Add new ones
        const newFeatured = artworkIds.map(artworkId => ({
            artist: id,
            artwork: artworkId,
            isFeatured: true
        }));

        await FeaturedArtwork.insertMany(newFeatured);

        res.status(200).json({
            success: true,
            message: "Featured artworks updated"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating featured artworks",
            error: error.message
        });
    }
};

/**
 * @desc    Get all featured artists (Admin version - including inactive)
 * @route   GET /api/v1/featured-artists/admin/list
 * @access  Admin
 */
/**
 * @desc    Get featured artworks for an artist (Public)
 * @route   GET /api/v1/featured-artists/artists/:id/public-featured-artworks
 * @access  Public
 */
export const getFeaturedArtworksPublic = async (req, res) => {
    try {
        const { id } = req.params; // artist id
        const featured = await FeaturedArtwork.find({ artist: id, isFeatured: true })
            .populate("artwork");

        const artworks = featured.map(f => f.artwork).filter(a => a !== null);

        res.status(200).json({
            success: true,
            data: artworks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured artworks",
            error: error.message
        });
    }
};

export const getAllFeaturedArtistsAdmin = async (req, res) => {
    try {
        const artists = await FeaturedArtist.find()
            .sort({ displayOrder: 1 })
            .populate({
                path: "artist",
                select: "username displayName email avatar followers followersCount specialty"
            });

        res.status(200).json({
            success: true,
            data: artists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured artists list",
            error: error.message
        });
    }
};
