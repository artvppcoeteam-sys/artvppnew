const pool = require("../config/db");

/* Get all products for customers with filters */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, productType, sortBy } = req.query;
    
    let query = `
      SELECT p.*, 
             COALESCE(p.price, 0) as price,
             COALESCE(p.discount, 0) as discount,
             u.name as artist_name, u.id as artist_id, c.name as category_name,
             COALESCE(
               (SELECT media_url FROM product_media pm WHERE pm.product_id = p.id AND (pm.media_type IS NULL OR pm.media_type != 'video') ORDER BY pm.id LIMIT 1),
               (SELECT vm.media_url FROM variant_media vm JOIN product_variants pv ON vm.variant_id = pv.id WHERE pv.product_id = p.id ORDER BY vm.id LIMIT 1),
               (SELECT preview_url FROM digital_assets da WHERE da.product_id = p.id LIMIT 1)
             ) as image
      FROM products p
      JOIN users u ON p.artist_id = u.id
      JOIN categories c ON p.category_id = c.id
    `;
    
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` WHERE (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      query += search ? ` AND` : ` WHERE`;
      query += ` c.id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (minPrice) {
      query += search || category ? ` AND` : ` WHERE`;
      query += ` p.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      query += search || category || minPrice ? ` AND` : ` WHERE`;
      query += ` p.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (productType) {
      query += search || category || minPrice || maxPrice ? ` AND` : ` WHERE`;
      query += ` p.product_type = $${paramIndex}`;
      params.push(productType);
      paramIndex++;
    }

    // Removed GROUP BY since we're not aggregating reviews

    if (sortBy === "price-low") {
      query += ` ORDER BY p.price ASC`;
    } else if (sortBy === "price-high") {
      query += ` ORDER BY p.price DESC`;
    } else if (sortBy === "newest") {
      query += ` ORDER BY p.created_at DESC`;
    } else if (sortBy === "rating") {
      query += ` ORDER BY avg_rating DESC`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    query += ` LIMIT 50`;

    const result = await pool.query(query, params);
    
    console.log("✓ Fetched", result.rows.length, "products");
    res.json(result.rows);

  } catch (err) {
    console.error("✗ Error fetching products:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Get single product with variants and similar products */
exports.getProductDetail = async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log("🔍 Getting product details for ID:", productId);

    // Get product
    const productResult = await pool.query(
      `SELECT p.*, COALESCE(p.price,0) as price, COALESCE(p.discount,0) as discount, u.name as artist_name, u.id as artist_id, c.name as category_name
       FROM products p
       JOIN users u ON p.artist_id = u.id
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productResult.rows[0];

    // Get variants based on product type
    let variants = [];
    if (product.product_type === "merchandise") {
      try {
        const variantResult = await pool.query(
          `SELECT pv.id, pv.product_id, pv.color, pv.size, 
                  COALESCE(pv.price, 0) as price, 
                  pv.quantity,
                  (SELECT media_url FROM variant_media vm WHERE vm.variant_id = pv.id LIMIT 1) as image
           FROM product_variants pv
           WHERE pv.product_id = $1
           ORDER BY pv.id`,
          [productId]
        );
        variants = variantResult.rows;
        console.log("  ✓ Merchandise variants:", variants.length);
      } catch (err) {
        console.log("⚠ Variants error:", err.message);
        variants = [];
      }
    } else if (product.product_type === "digital") {
      try {
        const digitalResult = await pool.query(
          `SELECT id, product_id, preview_url FROM digital_assets WHERE product_id = $1`,
          [productId]
        );
        variants = digitalResult.rows;
        console.log("  ✓ Digital assets:", variants.length);
      } catch (err) {
        console.log("⚠ Digital assets error:", err.message);
        variants = [];
      }
    }

    // Get media - for merchandise, fetch variant media; for digital, use preview; for physical art, use product_media
    let mediaResult;
    if (product.product_type === "merchandise") {
      try {
        mediaResult = await pool.query(
          `SELECT vm.id, vm.media_url, 'image' as media_type
           FROM variant_media vm
           JOIN product_variants pv ON vm.variant_id = pv.id
           WHERE pv.product_id = $1
           UNION ALL
           SELECT pm.id, pm.media_url, pm.media_type
           FROM product_media pm
           WHERE pm.product_id = $1 AND pm.media_type = 'video'
           ORDER BY id`,
          [productId]
        );
      } catch (err) {
        console.log("⚠ Error fetching merchandise media:", err.message);
        mediaResult = { rows: [] };
      }
    } else if (product.product_type === "digital") {
      try {
        mediaResult = await pool.query(
          `SELECT id, preview_url as media_url, 'image' as media_type, created_at FROM digital_assets WHERE product_id = $1`,
          [productId]
        );
      } catch (err) {
        console.log("⚠ Error fetching digital assets:", err.message);
        mediaResult = { rows: [] };
      }
    } else {
      // Physical art - just product_media
      mediaResult = await pool.query(
        `SELECT id, product_id, media_url, media_type FROM product_media WHERE product_id = $1
         ORDER BY CASE WHEN media_type = 'video' THEN 1 ELSE 0 END, id`,
        [productId]
      );
    }

    // If no media rows and product has variants with preview_url, use those as media fallback
    let mediaRows = mediaResult.rows || [];
    if ((mediaRows.length === 0 || !mediaRows) && variants && variants.length > 0) {
      const fallback = variants
        .map(v => v.preview_url)
        .filter(Boolean)
        .map(url => ({ id: null, product_id: productId, media_url: url }));
      if (fallback.length > 0) mediaRows = fallback;
    }

    // Get similar products (same category, different artist)
    const similarResult = await pool.query(
      `SELECT p.id, p.title, p.price, p.product_type,
              u.name as artist_name
       FROM products p
       JOIN users u ON p.artist_id = u.id
       WHERE p.category_id = $1 AND p.id != $2
       LIMIT 4`,
      [product.category_id, productId]
    );

    console.log("✓ Product details retrieved");
    console.log("  Media items:", mediaRows.length, mediaRows.map(m => m.media_type).join(", "));
    console.log("  Variants:", variants.length);
    res.json({
      product,
      variants,
      media: mediaRows,
      similarProducts: similarResult.rows
    });

  } catch (err) {
    console.error("✗ Error getting product detail:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Get artist profile */
exports.getArtistProfile = async (req, res) => {
  try {
    const { artistId } = req.params;
    
    console.log("✓ Getting artist profile for ID:", artistId);

    const artistResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at, ap.bio, ap.profile_photo
       FROM users u
       LEFT JOIN artist_profiles ap ON u.id = ap.user_id
       WHERE u.id = $1 AND u.role = 'artist'`,
      [artistId]
    );

    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const artist = artistResult.rows[0];

    // Get artist products
    const productsResult = await pool.query(
      `SELECT id, title, price, product_type, status
       FROM products
       WHERE artist_id = $1 AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 20`,
      [artistId]
    );

    // Get artist stats
    const statsResult = await pool.query(
      `SELECT 
        COUNT(p.id) as total_products,
        COUNT(DISTINCT o.id) as total_sales,
        SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END) as total_revenue
       FROM users u
       LEFT JOIN products p ON u.id = p.artist_id
       LEFT JOIN orders o ON p.id = o.product_id
       WHERE u.id = $1`,
      [artistId]
    );

    console.log("✓ Artist profile retrieved");
    res.json({
      artist,
      products: productsResult.rows,
      stats: statsResult.rows[0]
    });

  } catch (err) {
    console.error("✗ Error getting artist profile:", err.message);
    res.status(500).json({ error: err.message });
  }
};
