const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  getMerchandiseProducts,
  createMerchandiseProduct,
  addVariant
} = require("../controllers/merchandiseController");

router.get("/", auth, getMerchandiseProducts);
router.post("/", auth, createMerchandiseProduct);

router.post(
  "/variant",
  auth,
  upload.fields([{ name: "images", maxCount: 4 }]),
  addVariant
);

module.exports = router;
