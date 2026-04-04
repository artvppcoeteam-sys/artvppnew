const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ==========================================
// CREATIVE SERVICES CONTROLLER
// ==========================================

// Create a new service (commission, prerelease, or booking)
exports.createService = async (req, res) => {
  try {
    const {
      service_type,
      title,
      description,
      category,
      main_image_url,
      gallery_images,
      tiers,
      is_limited,
      max_orders_allowed,
      release_date,
      is_digital,
      product_type,
      event_date,
      event_time,
      total_seats,
      location_details,
      extra_revision_price
    } = req.body;

    // Use user's ID directly as the artist identifier (no artist_profiles table)
    const artist_id = req.user.id;

    // Sanitize timestamp fields: convert empty strings to NULL
    const sanitizedReleaseDate = release_date ? release_date : null;
    const sanitizedEventDate = event_date ? event_date : null;
    const sanitizedEventTime = event_time ? event_time : null;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Create service
      const serviceResult = await client.query(
        `INSERT INTO creative_services 
        (artist_id, service_type, title, description, category, main_image_url, 
         gallery_images, extra_revision_price, is_limited, max_orders_allowed, 
         release_date, is_digital, product_type, event_date, event_time, total_seats, 
         location_details, invite_link_token)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          artist_id,
          service_type,
          title,
          description,
          category,
          main_image_url,
          gallery_images || [],
          extra_revision_price,
          is_limited || false,
          max_orders_allowed,
          sanitizedReleaseDate,
          is_digital,
          product_type,
          sanitizedEventDate,
          sanitizedEventTime,
          total_seats,
          location_details,
          uuidv4() // Generate invite link token
        ]
      );

      const service = serviceResult.rows[0];

      // Add pricing tiers if it's a commission service
      if (service_type === "commission" && tiers && tiers.length > 0) {
        for (const tier of tiers) {
          await client.query(
            `INSERT INTO service_tiers 
            (service_id, tier_name, price, delivery_days, included_features, num_revisions)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              service.id,
              tier.tier_name,
              tier.price,
              tier.delivery_days,
              tier.included_features || [],
              tier.num_revisions || 1
            ]
          );
        }
      }

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Service created successfully",
        service
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all active services (public browse)
exports.getAllServices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cs.*, 
              COUNT(DISTINCT st.id) as tier_count,
              COUNT(DISTINCT so.id) as order_count
       FROM creative_services cs
       LEFT JOIN service_tiers st ON cs.id = st.service_id
       LEFT JOIN service_orders so ON cs.id = so.service_id
       WHERE cs.status = 'active'
       GROUP BY cs.id
       ORDER BY cs.created_at DESC`,
      []
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching all services:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all services for an artist
exports.getArtistServices = async (req, res) => {
  try {
    const { artist_id } = req.params;

    const result = await pool.query(
      `SELECT cs.*, 
              COUNT(DISTINCT st.id) as tier_count,
              COUNT(DISTINCT so.id) as order_count
       FROM creative_services cs
       LEFT JOIN service_tiers st ON cs.id = st.service_id
       LEFT JOIN service_orders so ON cs.id = so.service_id
       WHERE cs.artist_id = $1
       GROUP BY cs.id
       ORDER BY cs.created_at DESC`,
      [artist_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get service details with tiers and orders
exports.getServiceDetails = async (req, res) => {
  try {
    const { service_id } = req.params;

    const serviceResult = await pool.query(
      "SELECT * FROM creative_services WHERE id = $1",
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    const service = serviceResult.rows[0];

    // Get tiers if commission service
    let tiers = [];
    if (service.service_type === "commission") {
      const tiersResult = await pool.query(
        "SELECT * FROM service_tiers WHERE service_id = $1 ORDER BY price ASC",
        [service_id]
      );
      tiers = tiersResult.rows;
    }

    res.json({
      ...service,
      tiers
    });
  } catch (error) {
    console.error("Error fetching service details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { service_id } = req.params;
    const {
      title,
      description,
      category,
      main_image_url,
      gallery_images,
      is_limited,
      max_orders_allowed,
      status,
      total_seats
    } = req.body;

    const result = await pool.query(
      `UPDATE creative_services 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           main_image_url = COALESCE($4, main_image_url),
           gallery_images = COALESCE($5, gallery_images),
           is_limited = COALESCE($6, is_limited),
           max_orders_allowed = COALESCE($7, max_orders_allowed),
           status = COALESCE($8, status),
           total_seats = COALESCE($9, total_seats),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title,
        description,
        category,
        main_image_url,
        gallery_images,
        is_limited,
        max_orders_allowed,
        status,
        total_seats,
        service_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({
      message: "Service updated successfully",
      service: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { service_id } = req.params;

    const result = await pool.query(
      "DELETE FROM creative_services WHERE id = $1 RETURNING id",
      [service_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// SERVICE ORDERS CONTROLLER
// ==========================================

// Create service order (request)
exports.createServiceOrder = async (req, res) => {
  try {
    const { service_id, tier_id, requirements } = req.body;
    const customer_id = req.user.id;

    if (!customer_id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get service and tier details
    const serviceResult = await pool.query(
      "SELECT * FROM creative_services WHERE id = $1",
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    const service = serviceResult.rows[0];

    // Check if limited and slots available
    if (service.is_limited && service.current_orders >= service.max_orders_allowed) {
      return res.status(400).json({ error: "No slots available for this service" });
    }

    const tierResult = await pool.query(
      "SELECT * FROM service_tiers WHERE id = $1",
      [tier_id]
    );

    if (tierResult.rows.length === 0) {
      return res.status(404).json({ error: "Tier not found" });
    }

    const tier = tierResult.rows[0];

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Create order
      const orderResult = await client.query(
        `INSERT INTO service_orders 
        (service_id, tier_id, customer_id, artist_id, total_price, requirements, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '1 day' * $7)
        RETURNING *`,
        [
          service_id,
          tier_id,
          customer_id,
          service.artist_id,
          tier.price,
          requirements,
          tier.delivery_days
        ]
      );

      // Increment current orders if limited
      if (service.is_limited) {
        await client.query(
          "UPDATE creative_services SET current_orders = current_orders + 1 WHERE id = $1",
          [service_id]
        );
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: "Service order created successfully",
        order: orderResult.rows[0]
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating service order:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get service orders for artist
exports.getArtistServiceOrders = async (req, res) => {
  try {
    const artist_id = req.user.id;

    const result = await pool.query(
      `SELECT so.*, st.tier_name, st.price, cs.title, u.name as customer_name, u.email
       FROM service_orders so
       JOIN service_tiers st ON so.tier_id = st.id
       JOIN creative_services cs ON so.service_id = cs.id
       JOIN users u ON so.customer_id = u.id
       WHERE so.artist_id = $1
       ORDER BY so.created_at DESC`,
      [artist_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching artist orders:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get customer service orders
exports.getCustomerServiceOrders = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const result = await pool.query(
      `SELECT so.*, st.tier_name, cs.title, cs.main_image_url, u.artist_display_name as display_name
       FROM service_orders so
       JOIN service_tiers st ON so.tier_id = st.id
       JOIN creative_services cs ON so.service_id = cs.id
       JOIN users u ON so.artist_id = u.id
       WHERE so.customer_id = $1
       ORDER BY so.created_at DESC`,
      [customer_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update service order status
exports.updateServiceOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE service_orders 
       SET status = $1::varchar, 
           completed_at = CASE WHEN $1::varchar = 'completed' THEN NOW() ELSE completed_at END,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// PRE-RELEASE ORDERS CONTROLLER
// ==========================================

// Create pre-order
exports.createPreorder = async (req, res) => {
  try {
    const { service_id, tier_id, quantity } = req.body;
    const customer_id = req.user.id;

    const serviceResult = await pool.query(
      "SELECT * FROM creative_services WHERE id = $1",
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    const service = serviceResult.rows[0];

    let price = 0;
    if (tier_id) {
      const tierResult = await pool.query(
        "SELECT price FROM service_tiers WHERE id = $1",
        [tier_id]
      );
      if (tierResult.rows.length > 0) {
        price = tierResult.rows[0].price * (quantity || 1);
      }
    }

    const result = await pool.query(
      `INSERT INTO prerelease_orders (service_id, customer_id, tier_id, quantity, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [service_id, customer_id, tier_id, quantity || 1, price]
    );

    res.status(201).json({
      message: "Pre-order created successfully",
      order: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating pre-order:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get pre-orders for customer
exports.getCustomerPreorders = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const result = await pool.query(
      `SELECT po.*, cs.title, cs.main_image_url, cs.release_date, u.artist_display_name as display_name
       FROM prerelease_orders po
       JOIN creative_services cs ON po.service_id = cs.id
       JOIN users u ON cs.artist_id = u.id
       WHERE po.customer_id = $1
       ORDER BY po.created_at DESC`,
      [customer_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching pre-orders:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// BOOKINGS CONTROLLER
// ==========================================

// Request booking
exports.requestBooking = async (req, res) => {
  try {
    const { service_id, seats_booked, notes } = req.body;
    const customer_id = req.user.id;

    const serviceResult = await pool.query(
      "SELECT * FROM creative_services WHERE id = $1",
      [service_id]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    const service = serviceResult.rows[0];

    // Check if seats available
    if (service.booked_seats + seats_booked > service.total_seats) {
      return res.status(400).json({ error: "Not enough seats available" });
    }

    const result = await pool.query(
      `INSERT INTO bookings (service_id, customer_id, seats_booked, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [service_id, customer_id, seats_booked || 1, notes]
    );

    res.status(201).json({
      message: "Booking request created successfully",
      booking: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: error.message });
  }
};

// Approve booking
exports.approveBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Get booking details
      const bookingResult = await client.query(
        "SELECT * FROM bookings WHERE id = $1",
        [booking_id]
      );

      if (bookingResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Booking not found" });
      }

      const booking = bookingResult.rows[0];

      // Update booking status
      const updatedBooking = await client.query(
        `UPDATE bookings SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [booking_id]
      );

      // Update service seats
      await client.query(
        `UPDATE creative_services SET booked_seats = booked_seats + $1 WHERE id = $2`,
        [booking.seats_booked, booking.service_id]
      );

      await client.query("COMMIT");

      res.json({
        message: "Booking approved successfully",
        booking: updatedBooking.rows[0]
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get bookings for artist
exports.getArtistBookings = async (req, res) => {
  try {
    const artist_id = req.user.id;

    const result = await pool.query(
      `SELECT b.*, cs.title, cs.event_date, cs.event_time, u.name as customer_name, u.email
       FROM bookings b
       JOIN creative_services cs ON b.service_id = cs.id
       JOIN users u ON b.customer_id = u.id
       WHERE cs.artist_id = $1
       ORDER BY cs.event_date ASC`,
      [artist_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get bookings for customer
exports.getCustomerBookings = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const result = await pool.query(
      `SELECT b.*, cs.title, cs.event_date, cs.event_time, cs.location_details, cs.invite_link_token, u.artist_display_name as display_name
       FROM bookings b
       JOIN creative_services cs ON b.service_id = cs.id
       JOIN users u ON cs.artist_id = u.id
       WHERE b.customer_id = $1
       ORDER BY cs.event_date ASC`,
      [customer_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ error: error.message });
  }
};
