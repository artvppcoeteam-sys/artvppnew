const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { 
  getCart, 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  clearCart 
} = require("../controllers/cartController");

router.get("/", auth, getCart);
router.post("/", auth, addToCart);
router.delete("/:cartItemId", auth, removeFromCart);
router.put("/:cartItemId", auth, updateCartQuantity);
router.delete("/", auth, clearCart);

module.exports = router;
