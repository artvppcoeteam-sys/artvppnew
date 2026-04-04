import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload all images from a directory to Cloudinary
 * @param {string} localDir - Local directory path
 * @param {string} cloudinaryFolder - Cloudinary folder name
 * @returns {Promise<Array>} Array of upload results
 */
async function uploadDirectoryToCloudinary(localDir, cloudinaryFolder) {
    console.log(`Checking directory: ${localDir}`);

    // Check if directory exists
    if (!fs.existsSync(localDir)) {
        throw new Error(`Directory does not exist: ${localDir}`);
    }

    const files = fs.readdirSync(localDir);
    console.log(`Found ${files.length} files in directory`);

    const results = [];

    console.log(`📁 Uploading ${files.length} images from ${localDir} to Cloudinary folder: ${cloudinaryFolder}`);

    for (const file of files) {
        const filePath = path.join(localDir, file);
        const stat = fs.statSync(filePath);

        // Skip directories and non-image files
        if (stat.isDirectory()) continue;

        const ext = path.extname(file).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) continue;

        try {
            console.log(`⬆️  Uploading: ${file}`);

            const result = await cloudinary.uploader.upload(filePath, {
                folder: cloudinaryFolder,
                public_id: path.parse(file).name, // Use filename without extension as public_id
                resource_type: "image",
                transformation: [
                    { width: 1920, crop: "limit", quality: 85 }
                ]
            });

            results.push({
                localPath: filePath,
                cloudinaryUrl: result.secure_url,
                publicId: result.public_id,
                originalFilename: file
            });

            console.log(`✅ Uploaded: ${file} → ${result.secure_url}`);

        } catch (error) {
            console.error(`❌ Failed to upload ${file}:`, error.message);
            results.push({
                localPath: filePath,
                error: error.message,
                originalFilename: file
            });
        }
    }

    return results;
}

/**
 * Generate a mapping file for the uploaded images
 * @param {Array} results - Upload results
 * @param {string} outputPath - Path to save the mapping file
 */
function generateMappingFile(results, outputPath) {
    const mapping = {};

    results.forEach(result => {
        if (result.cloudinaryUrl) {
            const relativePath = path.relative(path.join(__dirname, "../../frontart/public"), result.localPath);
            mapping[relativePath] = result.cloudinaryUrl;
        }
    });

    fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
    console.log(`📄 Mapping file saved to: ${outputPath}`);
}

/**
 * Main upload function
 */
async function uploadAllImages() {
    try {
        console.log("🚀 Starting bulk image upload to Cloudinary...\n");

        // Upload images from frontart/public/images
        const imagesDir = path.join(__dirname, "../../../frontart/public/images");
        const imageResults = await uploadDirectoryToCloudinary(imagesDir, "artvpp/frontend/images");

        // Upload images from frontart/public/videos (if any images exist)
        const videosDir = path.join(__dirname, "../../frontart/public/videos");
        let videoImageResults = [];
        if (fs.existsSync(videosDir)) {
            videoImageResults = await uploadDirectoryToCloudinary(videosDir, "artvpp/frontend/videos");
        }

        // Combine all results
        const allResults = [...imageResults, ...videoImageResults];

        // Generate mapping file
        const mappingPath = path.join(__dirname, "../../image-mapping.json");
        generateMappingFile(allResults, mappingPath);

        // Summary
        const successful = allResults.filter(r => r.cloudinaryUrl).length;
        const failed = allResults.filter(r => r.error).length;

        console.log("\n🎉 Upload complete!");
        console.log(`✅ Successful uploads: ${successful}`);
        console.log(`❌ Failed uploads: ${failed}`);
        console.log(`📄 Mapping file: ${mappingPath}`);

        // Save detailed results
        const resultsPath = path.join(__dirname, "../../upload-results.json");
        fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
        console.log(`📄 Detailed results: ${resultsPath}`);

    } catch (error) {
        console.error("💥 Upload failed:", error);
        process.exit(1);
    }
}

// Run the upload
uploadAllImages();