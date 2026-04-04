const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const oc = require('../controllers/orderController');

// Specific routes first (before /:id)
router.get('/artist/orders', auth, oc.getArtistOrders);
router.post('/payment', auth, oc.processPayment);

// Generic routes
router.get('/', auth, oc.getUserOrders);
router.post('/', auth, oc.createOrder);
router.get('/:id', auth, oc.getOrderDetail);
router.put('/:id/status', auth, oc.updateOrderStatus);

module.exports = router;
