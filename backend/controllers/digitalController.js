const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { PassThrough } = require("stream");
const http = require("http");
const https = require("https");
const path = require("path");
const { URL } = require("url");

exports.createDigitalProduct = async (req,res)=>{
  try{
    console.log("✓ Creating digital product for user:", req.user.id);

    const {
      title,
      description,
      price,
      category_id,
      asset_type,
      nft_chain,
      nft_contract,
      nft_token_id
    } = req.body;

    console.log("  Title:", title, "Type:", asset_type);

    const product = await pool.query(
      `INSERT INTO products
       (artist_id,category_id,title,description,price,product_type)
       VALUES($1,$2,$3,$4,$5,'digital')
       RETURNING id`,
      [req.user.id,category_id,title,description,price]
    );

    console.log("✓ Product created with ID:", product.rows[0].id);

    // Helper function for stream uploads
    const uploadStream = (buffer, resourceType) => {
      return new Promise((resolve, reject) => {
        const passThrough = new PassThrough();
        
        const upload = cloudinary.uploader.upload_stream(
          { resource_type: resourceType },
          (error, result) => {
            if (error) {
              console.error("✗ Cloudinary upload error:", error.message);
              reject(error);
            } else {
              console.log("✓ Uploaded to Cloudinary:", result.secure_url);
              resolve(result);
            }
          }
        );
        
        // Pipe the buffer through PassThrough stream to Cloudinary
        passThrough.pipe(upload);
        passThrough.end(buffer);
      });
    };

    // Upload preview image
    console.log("✓ Uploading preview image...");
    if (!req.files?.preview?.[0]) {
      throw new Error("Preview image is required");
    }
    const previewUpload = await uploadStream(req.files.preview[0].buffer, "image");

    let assetUrl = null;

    if(asset_type !== "nft"){
      console.log("✓ Uploading asset file...");
      if (!req.files?.file?.[0]) {
        throw new Error("Asset file is required for non-NFT products");
      }
      const fileUpload = await uploadStream(req.files.file[0].buffer, "raw");
      assetUrl = fileUpload.secure_url;
      console.log("✓ Asset uploaded:", assetUrl);
      // preserve original filename when available
      var originalFilename = req.files.file[0].originalname;
    } else {
      console.log("✓ NFT type - skipping file upload");
    }

    console.log("✓ Saving digital asset to database...");
    // ensure column for original filename exists
    await pool.query("ALTER TABLE digital_assets ADD COLUMN IF NOT EXISTS original_filename TEXT");

    await pool.query(
      `INSERT INTO digital_assets
       (product_id,asset_url,preview_url,asset_type,
        nft_chain,nft_contract,nft_token_id, original_filename)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        product.rows[0].id,
        assetUrl,
        previewUpload.secure_url,
        asset_type,
        nft_chain || null,
        nft_contract || null,
        nft_token_id || null,
        originalFilename || null
      ]
    );

    console.log("✓ Digital product created successfully!");
    res.json({ message:"Digital product created", productId: product.rows[0].id });

  }catch(err){
    console.error("✗ Error creating digital product:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Download proxy for digital asset - forces attachment download */
exports.downloadAsset = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("✓ Download requested for product:", productId, "by user:", req.user.id);

    const da = await pool.query(
      `SELECT da.asset_url, da.preview_url, da.original_filename, da.asset_type, p.title
       FROM digital_assets da
       JOIN products p ON p.id = da.product_id
       WHERE da.product_id = $1
       LIMIT 1`,
      [productId]
    );

    if (!da.rows || da.rows.length === 0) {
      return res.status(404).json({ error: "Digital asset not found" });
    }

    const row = da.rows[0];
    const assetUrl = row.asset_url || row.preview_url;
    if (!assetUrl) return res.status(404).json({ error: "No asset URL available" });

    const fileUrl = new URL(assetUrl);

    const sanitize = (s) => (s || 'asset').replace(/[^a-z0-9\.\-_ ]+/gi, '').replace(/\s+/g, '-').slice(0,120);

    const proxyGet = (targetUrl, redirectsLeft = 5) => {
      if (redirectsLeft < 0) return res.status(502).json({ error: 'Too many redirects' });

      const u = new URL(targetUrl);
      const getterLocal = u.protocol === 'https:' ? https : http;

      getterLocal.get(u.href, (remoteRes) => {
        // handle redirects
        if (remoteRes.statusCode >= 300 && remoteRes.statusCode < 400 && remoteRes.headers.location) {
          const next = new URL(remoteRes.headers.location, u).href;
          remoteRes.resume(); // consume to free socket
          return proxyGet(next, redirectsLeft - 1);
        }

        if (remoteRes.statusCode && remoteRes.statusCode >= 400) {
          console.error('✗ Remote fetch failed', remoteRes.statusCode);
          return res.status(502).json({ error: 'Failed to fetch remote asset' });
        }

        // Determine filename: prefer DB original, then remote Content-Disposition, then infer from title+asset_type, then fallback to path basename
        let filename = null;
        if (row.original_filename) filename = row.original_filename;

        const remoteCd = remoteRes.headers['content-disposition'];
        if (!filename && remoteCd) {
          const m = /filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i.exec(remoteCd);
          if (m && m[1]) filename = decodeURIComponent(m[1]);
        }

        // infer extension from stored asset_type (what artist uploaded) and use title
        if (!filename) {
          const mimeExt = {
            'zip': '.zip',
            'pdf': '.pdf',
            'epub': '.epub',
            'nft': ''
          }[row.asset_type] || '';

          const base = sanitize(row.title || path.basename(u.pathname) || 'asset');
          filename = mimeExt ? `${base}${mimeExt}` : path.basename(u.pathname) || `${base}`;
        }

        // Map asset_type to correct Content-Type header
        const assetTypeToMime = {
          'zip': 'application/zip',
          'pdf': 'application/pdf',
          'epub': 'application/epub+zip'
        };
        const contentType = assetTypeToMime[row.asset_type] || remoteRes.headers['content-type'] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        if (remoteRes.headers['content-length']) res.setHeader('Content-Length', remoteRes.headers['content-length']);

        remoteRes.pipe(res);
      }).on('error', (err) => {
        console.error('✗ Error proxying asset:', err.message);
        res.status(500).json({ error: 'Error downloading asset' });
      });
    };

    proxyGet(fileUrl.href);

  } catch (err) {
    console.error('✗ Error in downloadAsset:', err.message);
    res.status(500).json({ error: err.message });
  }
};
