import cloudinaryModule from "cloudinary";
import multer from "multer";
import { createRequire } from "module";

// Keep both root and v2 clients:
// - multer-storage-cloudinary expects `cloudinary.v2` internally.
// - direct upload/delete helpers use the v2 API directly.
const cloudinaryRoot = cloudinaryModule;
const cloudinary = cloudinaryRoot.v2;

// Use require for CommonJS module - get the default export
const require = createRequire(import.meta.url);
const multerStorageCloudinary = require("multer-storage-cloudinary");

// The package might export CloudinaryStorage as default or as a named export
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;

/**
 * CLOUDINARY CONFIG
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



/**
 * FILE FILTER
 */
const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

/**
 * STORAGE FACTORY - for multer-storage-cloudinary
 */
const generateStorage = (folder) => {
  // Only create storage if CloudinaryStorage is a valid constructor
  if (typeof CloudinaryStorage !== 'function') {
    return null;
  }

  try {
    return new CloudinaryStorage({
      cloudinary: cloudinaryRoot,
      params: {
        folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
      }
    });
  } catch (err) {
    return null;
  }
};

// Create multer instances - they may be null if CloudinaryStorage failed
const profileStorage = generateStorage("artvpp/profiles");
const artworksStorage = generateStorage("artvpp/artworks");
const productsStorage = generateStorage("artvpp/products");
const servicesStorage = generateStorage("artvpp/services");
const workshopsStorage = generateStorage("artvpp/workshops");
const artistAppStorage = generateStorage("artvpp/artist-applications");

// Memory storage fallback
const memoryStorage = multer.memoryStorage();

export const uploadProfile = multer({
  storage: profileStorage || memoryStorage,
  fileFilter: imageFileFilter
});

export const uploadArtworks = multer({
  storage: artworksStorage || memoryStorage,
  fileFilter: imageFileFilter
});

export const uploadProductImages = multer({
  storage: productsStorage || memoryStorage,
  fileFilter: imageFileFilter
});

export const uploadServiceImages = multer({
  storage: servicesStorage || memoryStorage,
  fileFilter: imageFileFilter
});

export const uploadServiceImagesMemory = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter
});

export const uploadWorkshopImages = multer({
  storage: workshopsStorage || memoryStorage,
  fileFilter: imageFileFilter
});

// Combined upload for artist application (profile + artworks in same folder for simplicity)
export const uploadArtistApplication = multer({
  storage: artistAppStorage || memoryStorage,
  fileFilter: imageFileFilter
});

/**
 * DELETE SINGLE IMAGE
 */
export const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

/**
 * DELETE MULTIPLE IMAGES
 */
export const deleteMultipleImages = async (publicIds) => {
  return await cloudinary.api.delete_resources(publicIds);
};

/**
 * DIRECT UPLOAD TO CLOUDINARY (backup method)
 * Use this if multer-storage-cloudinary fails
 */
export const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export { cloudinary };
