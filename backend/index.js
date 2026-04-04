// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const { Pool } = require("pg");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   },
//   family: 4
// });

// app.get("/", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT NOW()");
//     res.json({
//       message: "Database Connected Successfully",
//       time: result.rows[0].now
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Database connection failed" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log("Server running on port", PORT);
// });
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const artistRoutes = require("./routes/artistRoutes");
const artistProfileRoutes = require("./routes/artistProfileRoutes");
const artistProductRoutes = require("./routes/artistProductRoutes");
const merchandiseRoutes = require("./routes/merchandiseRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const cartRoutes = require("./routes/cartRoutes");
const customerRoutes = require("./routes/customerRoutes");
const creativeServicesRoutes = require("./routes/creativeServicesRoutes");
const digitalRoutes = require("./routes/digitalRoutes");
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/artist-profile", artistProfileRoutes);
app.use("/api/artist-products", artistProductRoutes);
app.use("/api/merchandise", merchandiseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/creative-services", creativeServicesRoutes);
app.use("/api/digital", digitalRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ArtVPP Backend Running", port: process.env.PORT });
});

app.listen(process.env.PORT, () => {
  console.log("\n✓ Server running on port", process.env.PORT);
});

module.exports = app;
