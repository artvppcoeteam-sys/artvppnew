const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  getMyProfile,
  upsertProfile,
  addPortfolioItem,
  markPortfolioComplete
} = require('../controllers/artistProfileController');

router.get('/me', auth, getMyProfile);
router.post('/me', auth, upsertProfile);
router.post('/me/portfolio', auth, addPortfolioItem);
router.post('/me/portfolio/complete', auth, markPortfolioComplete);

module.exports = router;
