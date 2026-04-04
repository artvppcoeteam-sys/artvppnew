const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createPhysicalArtProduct
} = require("../controllers/productController");

router.post(
  "/physical-art",
  auth,
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "video", maxCount: 1 }
  ]),
  createPhysicalArtProduct
);

module.exports = router;
