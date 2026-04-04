const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const requireArtist = require("../middleware/requireArtist");
const creativeServicesController = require("../controllers/creativeServicesController");

// ==========================================
// CREATIVE SERVICES ROUTES
// ==========================================

// Create new service
router.post("/", authenticateToken, requireArtist, creativeServicesController.createService);

// Get all active services (public browse)
router.get("/", creativeServicesController.getAllServices);

// Get all services for an artist
router.get("/artist/:artist_id", creativeServicesController.getArtistServices);

// Get service details with tiers
router.get("/:service_id", creativeServicesController.getServiceDetails);

// Update service
router.put("/:service_id", authenticateToken, creativeServicesController.updateService);

// Delete service
router.delete("/:service_id", authenticateToken, creativeServicesController.deleteService);

// ==========================================
// SERVICE ORDERS ROUTES
// ==========================================

// Create service order (request)
router.post("/orders/create", authenticateToken, creativeServicesController.createServiceOrder);

// Get artist service orders
router.get("/orders/artist/all", authenticateToken, creativeServicesController.getArtistServiceOrders);

// Get customer service orders
router.get("/orders/customer/all", authenticateToken, creativeServicesController.getCustomerServiceOrders);

// Update service order status
router.put("/orders/:order_id/status", authenticateToken, creativeServicesController.updateServiceOrderStatus);

// ==========================================
// PRE-RELEASE ORDERS ROUTES
// ==========================================

// Create pre-order
router.post("/preorders/create", authenticateToken, creativeServicesController.createPreorder);

// Get customer pre-orders
router.get("/preorders/customer/all", authenticateToken, creativeServicesController.getCustomerPreorders);

// ==========================================
// BOOKINGS ROUTES
// ==========================================

// Request booking
router.post("/bookings/request", authenticateToken, creativeServicesController.requestBooking);

// Approve booking
router.put("/bookings/:booking_id/approve", authenticateToken, creativeServicesController.approveBooking);

// Get artist bookings
router.get("/bookings/artist/all", authenticateToken, creativeServicesController.getArtistBookings);

// Get customer bookings
router.get("/bookings/customer/all", authenticateToken, creativeServicesController.getCustomerBookings);

module.exports = router;
