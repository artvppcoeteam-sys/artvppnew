const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  applyArtist,
  getPendingArtists,
  approveArtist
} = require("../controllers/artistController");

router.post("/apply", auth, applyArtist);
router.get("/pending", auth, getPendingArtists);
router.put("/approve/:userId", auth, approveArtist);

module.exports = router;
