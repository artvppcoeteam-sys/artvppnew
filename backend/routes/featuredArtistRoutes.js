import express from "express";
import { 
    getFeaturedArtists, 
    createFeaturedArtist, 
    updateFeaturedArtist, 
    deleteFeaturedArtist, 
    getArtistArtworks, 
    updateFeaturedArtworks,
    getAllFeaturedArtistsAdmin,
    getFeaturedArtworksPublic
} from "../controllers/featuredArtistController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";

const router = express.Router();

// Public route for homepage
router.get("/", getFeaturedArtists);
router.get("/artists/:id/public-featured-artworks", getFeaturedArtworksPublic);

// Admin management routes
router.get("/admin/list", isAuthenticated, authorize("admin"), getAllFeaturedArtistsAdmin);
router.post("/", isAuthenticated, authorize("admin"), createFeaturedArtist);
router.put("/:id", isAuthenticated, authorize("admin"), updateFeaturedArtist);
router.delete("/:id", isAuthenticated, authorize("admin"), deleteFeaturedArtist);

// Artwork control routes for specific artist
router.get("/artists/:id/artworks", isAuthenticated, authorize("admin"), getArtistArtworks);
router.put("/artists/:id/featured-artworks", isAuthenticated, authorize("admin"), updateFeaturedArtworks);

export default router;
