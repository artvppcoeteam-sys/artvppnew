const router = require('express').Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/authMiddleware');
const {
  uploadProfilePhoto,
  uploadPortfolioItem
} = require('../controllers/uploadController');

router.post('/profile-photo', auth, upload.single('file'), uploadProfilePhoto);
router.post('/portfolio', auth, upload.single('file'), uploadPortfolioItem);

module.exports = router;
