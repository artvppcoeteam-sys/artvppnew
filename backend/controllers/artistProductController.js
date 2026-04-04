const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { PassThrough } = require("stream");

/* Get artist's products */
exports.getArtistProducts = async (req, res) => {
  try {
    console.log("✓ Getting products for artist:", req.user.id);

    const result = await pool.query(
      `SELECT p.*, c.name as category_name,
              COALESCE(
                (SELECT media_url FROM product_media WHERE product_id = p.id LIMIT 1),
                (SELECT vm.media_url FROM variant_media vm JOIN product_variants pv ON vm.variant_id = pv.id WHERE pv.product_id = p.id LIMIT 1),
                (SELECT preview_url FROM digital_assets WHERE product_id = p.id LIMIT 1)
              ) as image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.artist_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    console.log("✓ Retrieved", result.rows.length, "products");
    res.json(result.rows);

  } catch (err) {
    console.error("✗ Error getting artist products:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Update product discount */
exports.updateProductDiscount = async (req, res) => {
  try {
    const { productId } = req.params;
    const { discount } = req.body;

    console.log("✓ Updating discount for product:", productId);

    const result = await pool.query(
      `UPDATE products SET discount = $1 WHERE id = $2 AND artist_id = $3 RETURNING *`,
      [discount || null, productId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✓ Discount updated");
    res.json(result.rows[0]);

  } catch (err) {
    console.error("✗ Error updating discount:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Update product details */
exports.updateProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, price, category_id, status } = req.body;

    console.log("✓ Updating product details:", productId);

    const result = await pool.query(
      `UPDATE products 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category_id = COALESCE($4, category_id),
           status = COALESCE($5, status)
       WHERE id = $6 AND artist_id = $7
       RETURNING *`,
      [title, description, price, category_id, status, productId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✓ Product updated");
    res.json(result.rows[0]);

  } catch (err) {
    console.error("✗ Error updating product:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Delete product */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log("✓ Deleting product:", productId);

    // Delete associated data
    await pool.query(`DELETE FROM product_media WHERE product_id = $1`, [productId]);
    await pool.query(`DELETE FROM product_variants WHERE product_id = $1`, [productId]);
    await pool.query(`DELETE FROM digital_assets WHERE product_id = $1`, [productId]);
    
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 AND artist_id = $2 RETURNING id`,
      [productId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✓ Product deleted");
    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    console.error("✗ Error deleting product:", err.message);
    res.status(500).json({ error: err.message });
  }
};
