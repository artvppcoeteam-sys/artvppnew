const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { createDigitalProduct, downloadAsset } = require("../controllers/digitalController");

router.post(
  "/",
  auth,
  upload.fields([
    { name:"preview", maxCount:1 },
    { name:"file", maxCount:1 }
  ]),
  createDigitalProduct
);

// Download proxy for digital product asset (auth required)
router.get('/download/:productId', auth, downloadAsset);

module.exports = router;
