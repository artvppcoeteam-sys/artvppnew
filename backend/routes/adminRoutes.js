const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { listPendingServices, approveService, rejectService } = require('../controllers/adminController');

// Service approval endpoints removed (service feature deleted)

module.exports = router;
