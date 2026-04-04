const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { 
  getAllProducts, 
  getProductDetail, 
  getArtistProfile 
} = require("../controllers/customerController");

// Public routes
router.get("/products", getAllProducts);
router.get("/products/:productId", getProductDetail);
router.get("/artist/:artistId", getArtistProfile);

module.exports = router;
