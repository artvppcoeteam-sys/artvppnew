const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

/* Get all merchandise products for artist */
exports.getMerchandiseProducts = async (req, res) => {
  try {
    console.log("✓ Getting merchandise products for user ID:", req.user.id);
    
    // Debug: Get all merchandise in DB
    const debugAll = await pool.query(
      `SELECT id, title, artist_id, product_type FROM products WHERE product_type = 'merchandise' LIMIT 5`
    );
    console.log("📋 All merchandise products in DB:", debugAll.rows);
    
    const result = await pool.query(
      `SELECT p.*, json_agg(json_build_object(
        'id', pv.id, 'color', pv.color, 'size', pv.size, 
        'price', pv.price, 'quantity', pv.quantity
      ) ORDER BY pv.id) as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.artist_id = $1 AND p.product_type = 'merchandise'
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    console.log("✓ Found", result.rows.length, "merchandise products for user", req.user.id);
    res.json(result.rows);
  } catch (err) {
    console.error("✗ Error getting merchandise products:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Create Merchandise Parent Product */
exports.createMerchandiseProduct = async (req, res) => {
  try {
    const { title, description, category_id } = req.body;
    
    console.log("✓ Creating merchandise product for user:", req.user.id);
    console.log("  Title:", title, "Category:", category_id);

    const result = await pool.query(
      `INSERT INTO products
       (artist_id, category_id, title, description, product_type)
       VALUES ($1,$2,$3,$4,'merchandise')
       RETURNING id`,
      [req.user.id, category_id, title, description]
    );

    console.log("✓ Merchandise product created with ID:", result.rows[0].id);
    res.json({ productId: result.rows[0].id });

  } catch (err) {
    console.error("✗ Error creating merchandise product:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Add Variant */
exports.addVariant = async (req, res) => {
  try {
    const { product_id, color, size, price, quantity } = req.body;

    // Verify product is merchandise
    const p = await pool.query(
      "SELECT product_type FROM products WHERE id=$1",
      [product_id]
    );

    if (p.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    if (p.rows[0].product_type !== "merchandise")
      return res.status(400).json({ message: "Variants only for merchandise" });

    const variant = await pool.query(
      `INSERT INTO product_variants
       (product_id,color,size,price,quantity)
       VALUES($1,$2,$3,$4,$5)
       RETURNING id`,
      [product_id, color, size, price, quantity]
    );

    const variantId = variant.rows[0].id;

    for (const file of req.files.images) {
      const stream = Readable.from(file.buffer);
      const upload = await new Promise((resolve, reject) => {
        const uploader = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.pipe(uploader);
      });

      await pool.query(
        `INSERT INTO variant_media
         (variant_id,media_url,media_type)
         VALUES($1,$2,'image')`,
        [variantId, upload.secure_url]
      );
    }

    res.json({ message: "Variant added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
