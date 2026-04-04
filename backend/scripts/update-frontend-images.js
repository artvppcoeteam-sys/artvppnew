import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the image mapping
const mappingPath = path.join(__dirname, "../../image-mapping.json");
const imageMapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));

console.log(`Loaded ${Object.keys(imageMapping).length} image mappings`);

/**
 * Convert Windows path to relative path for matching
 * @param {string} windowsPath - Windows path from mapping
 * @returns {string} Relative path
 */
function convertToRelativePath(windowsPath) {
    // Convert Windows path separators and normalize
    return windowsPath.replace(/\\/g, "/").replace("../../frontart/public/", "");
}

/**
 * Create a simple mapping for replacement
 */
const simpleMapping = {};
Object.entries(imageMapping).forEach(([key, value]) => {
    const relativePath = convertToRelativePath(key);
    simpleMapping[`/images/${path.basename(relativePath)}`] = value;
});

console.log("Sample mappings:");
console.log(Object.entries(simpleMapping).slice(0, 5));

/**
 * Recursively find all TypeScript/React files
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of file paths
 */
function findFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !["node_modules", ".git", "dist", "build"].includes(item)) {
            files.push(...findFiles(fullPath));
        } else if (stat.isFile() && (item.endsWith(".tsx") || item.endsWith(".ts") || item.endsWith(".jsx") || item.endsWith(".js"))) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Update image paths in a file
 * @param {string} filePath - Path to the file
 */
function updateFile(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    let updated = false;

    Object.entries(simpleMapping).forEach(([localPath, cloudinaryUrl]) => {
        // Look for various patterns of image references
        const patterns = [
            new RegExp(`"${localPath}"`, "g"),
            new RegExp(`'${localPath}'`, "g"),
            new RegExp(`\`${localPath}\``, "g"),
            new RegExp(`\\(${localPath}\\)`, "g"),
            new RegExp(`\\[${localPath}\\]`, "g")
        ];

        patterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, `"${cloudinaryUrl}"`);
                updated = true;
                console.log(`✅ Updated ${localPath} in ${path.relative(process.cwd(), filePath)}`);
            }
        });
    });

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`📄 Updated file: ${path.relative(process.cwd(), filePath)}`);
    }
}

/**
 * Main update function
 */
function updateAllFiles() {
    console.log("🔍 Finding frontend files...");

    const frontendDir = path.join(__dirname, "../../../frontart/src");
    const files = findFiles(frontendDir);

    console.log(`📁 Found ${files.length} files to check`);

    let updatedFiles = 0;
    files.forEach(file => {
        try {
            updateFile(file);
            updatedFiles++;
        } catch (error) {
            console.error(`❌ Error updating ${file}:`, error.message);
        }
    });

    console.log(`\n🎉 Update complete!`);
    console.log(`📊 Checked ${files.length} files`);
    console.log(`📝 Updated ${updatedFiles} files`);
}

// Run the update
updateAllFiles();