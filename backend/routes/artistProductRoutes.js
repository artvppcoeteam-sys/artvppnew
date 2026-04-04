const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getArtistProducts,
  updateProductDiscount,
  updateProductDetails,
  deleteProduct
} = require("../controllers/artistProductController");

router.get("/", auth, getArtistProducts);
router.put("/:productId/discount", auth, updateProductDiscount);
router.put("/:productId", auth, updateProductDetails);
router.delete("/:productId", auth, deleteProduct);

module.exports = router;
