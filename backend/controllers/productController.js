import { Product } from "../models/Product.js";
import { PendingAction } from "../models/PendingAction.js";
import { Category } from "../models/Category.js";
import { Content } from "../models/Content.js";
import { deleteMultipleImages } from "../config/cloudinary.js";
import { sendArtistActionEmail } from "../utils/sendEmail.js";

const STUDENT_PUBLISHING_SETTINGS_KEY = "student_artwork_publishing";

const ALLOWED_PRODUCT_CATEGORIES = new Set([
    "painting",
    "sketch",
    "digital-art",
    "photography",
    "sculpture",
    "crafts",
    "prints",
    "merchandise",
    "other"
]);

const CATEGORY_ALIAS_MAP = {
    "original-art": "painting",
    "paintings": "painting",
    "digital": "digital-art",
    "digital-artwork": "digital-art",
    "print": "prints",
    "prints-reproductions": "prints",
    "prints-and-reproductions": "prints",
    "art-merchandise": "merchandise",
    "handcrafted-items": "crafts",
    "handicrafts": "crafts"
};

const normalizeProductCategory = (category) => {
    if (!category) return undefined;
    const slug = String(category)
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (ALLOWED_PRODUCT_CATEGORIES.has(slug)) return slug;
    if (CATEGORY_ALIAS_MAP[slug]) return CATEGORY_ALIAS_MAP[slug];
    return "other";
};

const normalizeDisplayName = (displayName, fallbackTitle = "") => {
    const cleanDisplayName = String(displayName || "").trim();
    if (cleanDisplayName) return cleanDisplayName;

    const cleanFallbackTitle = String(fallbackTitle || "").trim();
    return cleanFallbackTitle || undefined;
};

const formatValidationErrors = (error) =>
    Object.fromEntries(
        Object.entries(error.errors || {}).map(([field, err]) => [field, err.message])
    );

const isStudentArtworkPublishingEnabled = async () => {
    const setting = await Content.findOne({
        key: STUDENT_PUBLISHING_SETTINGS_KEY,
        type: "settings"
    }).select("data.enabled");

    return Boolean(setting?.data?.enabled);
};

/**
 * Product Controller
 *
 * IMPORTANT:
 * - Artists can only REQUEST to create/edit/delete products
 * - All artist actions go through admin approval
 * - Only approved products are visible to customers
 * - Admin can create products directly (bypass approval)
 */

// ============================================
// PUBLIC: GET PRODUCTS (Only approved products)
// ============================================

/**
 * @desc    Get all approved products (public)
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            minPrice,
            maxPrice,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
            artist
        } = req.query;

        // Only show approved and active products to public
        const query = {
            status: "active",
            "verification.status": "approved"
        };

        const studentPublishingEnabled = await isStudentArtworkPublishingEnabled();
        if (!studentPublishingEnabled) {
            query.$or = [
                { submissionChannel: { $exists: false } },
                { submissionChannel: { $ne: "student_link" } }
            ];
        }

        if (category) query.category = category;
        if (artist) query.artist = artist;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate("artist", "username avatar")
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                products: products.map(p => p.toSafeObject()),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

/**
 * @desc    Get single product by slug (only approved)
 * @route   GET /api/v1/products/:slug
 * @access  Public
 */
export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const studentPublishingEnabled = await isStudentArtworkPublishingEnabled();
        const visibilityFilter = studentPublishingEnabled
            ? {}
            : {
                $or: [
                    { submissionChannel: { $exists: false } },
                    { submissionChannel: { $ne: "student_link" } }
                ]
            };

        const product = await Product.findOne({
            slug,
            status: "active",
            "verification.status": "approved",
            ...visibilityFilter
        }).populate("artist", "username avatar bio");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        product.views += 1;
        await product.save();

        return res.status(200).json({
            success: true,
            data: { product: product.toSafeObject() }
        });
    } catch (error) {
        console.error("Get product error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch product" });
    }
};

/**
 * @desc    Get product categories
 * @route   GET /api/v1/products/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 });

        return res.status(200).json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        console.error("Get categories error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch categories" });
    }
};

// ============================================
// ARTIST: REQUEST PRODUCT ACTIONS
// ============================================

/**
 * @desc    Request to create new product (goes to admin for approval)
 * @route   POST /api/v1/products/request
 * @access  Private/Artist
 */
export const requestCreateProduct = async (req, res) => {
    try {
        const artistId = req.userId;
        const {
            title, displayName, description, price, comparePrice, category,
            tags, stock, isDigital, dimensions, weight, artistNote
        } = req.body;
        const normalizedCategory = normalizeProductCategory(category);
        const normalizedDisplayName = normalizeDisplayName(displayName, title);

        if (!req.uploadedImages || req.uploadedImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required"
            });
        }

        const parsedTags = typeof tags === "string"
            ? tags.split(",").map(t => t.trim().toLowerCase())
            : tags || [];

        const pendingAction = await PendingAction.create({
            artist: artistId,
            actionType: "create_product",
            status: "pending",
            data: {
                title,
                displayName: normalizedDisplayName,
                description,
                price: Number(price),
                comparePrice: comparePrice ? Number(comparePrice) : null,
                category: normalizedCategory,
                tags: parsedTags,
                stock: Number(stock) || 1,
                isDigital: isDigital === "true" || isDigital === true,
                dimensions: dimensions ? JSON.parse(dimensions) : undefined,
                weight: weight ? JSON.parse(weight) : undefined
            },
            images: req.uploadedImages,
            artistNote: artistNote || null
        });

        return res.status(201).json({
            success: true,
            message: "Product submitted for admin review. You'll be notified once reviewed.",
            data: {
                requestId: pendingAction._id,
                status: "pending"
            }
        });
    } catch (error) {
        console.error("Request create product error:", error);
        if (req.uploadedImages) {
            const publicIds = req.uploadedImages.map(img => img.publicId);
            await deleteMultipleImages(publicIds).catch(console.error);
        }
        return res.status(500).json({ success: false, message: "Failed to submit product" });
    }
};

/**
 * @desc    Request to edit product (goes to admin for approval)
 * @route   PUT /api/v1/products/:productId/request-edit
 * @access  Private/Artist
 */
export const requestEditProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const artistId = req.userId;

        const product = await Product.findOne({ _id: productId, artist: artistId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or you don't have permission"
            });
        }

        const existingRequest = await PendingAction.findOne({
            artist: artistId,
            productId,
            actionType: "edit_product",
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending edit request for this product"
            });
        }

        const {
            title, displayName, description, price, comparePrice, category,
            tags, stock, isDigital, dimensions, weight, artistNote
        } = req.body;

        const changes = {};
        if (title && title !== product.title) changes.title = title;
        if (displayName !== undefined) {
            const normalizedDisplayName = normalizeDisplayName(displayName, title || product.title);
            if (normalizedDisplayName && normalizedDisplayName !== product.displayName) {
                changes.displayName = normalizedDisplayName;
            }
        }
        if (description && description !== product.description) changes.description = description;
        if (price && Number(price) !== product.price) changes.price = Number(price);
        if (comparePrice !== undefined) changes.comparePrice = comparePrice ? Number(comparePrice) : null;
        if (category) {
            const normalizedCategory = normalizeProductCategory(category);
            if (normalizedCategory !== product.category) changes.category = normalizedCategory;
        }
        if (tags) {
            const parsedTags = typeof tags === "string"
                ? tags.split(",").map(t => t.trim().toLowerCase())
                : tags;
            changes.tags = parsedTags;
        }
        if (stock !== undefined && Number(stock) !== product.stock) changes.stock = Number(stock);
        if (isDigital !== undefined) changes.isDigital = isDigital === "true" || isDigital === true;
        if (dimensions) changes.dimensions = JSON.parse(dimensions);
        if (weight) changes.weight = JSON.parse(weight);

        if (Object.keys(changes).length === 0 && (!req.uploadedImages || req.uploadedImages.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "No changes detected"
            });
        }

        const pendingAction = await PendingAction.create({
            artist: artistId,
            actionType: "edit_product",
            productId,
            status: "pending",
            data: {
                changes,
                originalData: {
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    category: product.category
                }
            },
            images: req.uploadedImages || [],
            artistNote: artistNote || null
        });

        return res.status(200).json({
            success: true,
            message: "Edit request submitted for admin review",
            data: {
                requestId: pendingAction._id,
                status: "pending"
            }
        });
    } catch (error) {
        console.error("Request edit product error:", error);
        if (req.uploadedImages) {
            const publicIds = req.uploadedImages.map(img => img.publicId);
            await deleteMultipleImages(publicIds).catch(console.error);
        }
        return res.status(500).json({ success: false, message: "Failed to submit edit request" });
    }
};

/**
 * @desc    Request to delete product (goes to admin for approval)
 * @route   DELETE /api/v1/products/:productId/request-delete
 * @access  Private/Artist
 */
export const requestDeleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const artistId = req.userId;
        const { reason } = req.body;

        const product = await Product.findOne({ _id: productId, artist: artistId });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or you don't have permission"
            });
        }

        if (product.deletionRequest.status === "pending") {
            return res.status(400).json({
                success: false,
                message: "Delete request already pending for this product"
            });
        }

        product.deletionRequest = {
            isPending: true,
            reason: reason || null,
            requestedAt: new Date(),
            status: "pending"
        };
        await product.save();

        await PendingAction.create({
            artist: artistId,
            actionType: "delete_product",
            productId,
            status: "pending",
            data: {
                productTitle: product.title,
                reason: reason || null
            },
            artistNote: reason || null
        });

        return res.status(200).json({
            success: true,
            message: "Delete request submitted for admin review",
            data: {
                productId,
                status: "pending"
            }
        });
    } catch (error) {
        console.error("Request delete product error:", error);
        return res.status(500).json({ success: false, message: "Failed to submit delete request" });
    }
};

/**
 * @desc    Get artist's own products
 * @route   GET /api/v1/products/my-products
 * @access  Private/Artist
 */
export const getMyProducts = async (req, res) => {
    try {
        const artistId = req.userId;
        const { page = 1, limit = 10, status, verificationStatus } = req.query;

        const query = { artist: artistId };
        if (status) query.status = status;
        if (verificationStatus) query["verification.status"] = verificationStatus;

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                products: products.map(p => p.toSafeObject()),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error("Get my products error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

/**
 * @desc    Get artist's pending requests
 * @route   GET /api/v1/products/my-requests
 * @access  Private/Artist
 */
export const getMyRequests = async (req, res) => {
    try {
        const artistId = req.userId;
        const { page = 1, limit = 10, status } = req.query;

        const query = { artist: artistId };
        if (status) query.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [requests, total] = await Promise.all([
            PendingAction.find(query)
                .populate("productId", "title images slug")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            PendingAction.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                requests: requests.map(r => r.toSafeObject()),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error("Get my requests error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
};

/**
 * @desc    Mark notification as seen by artist
 * @route   PUT /api/v1/products/requests/:requestId/seen
 * @access  Private/Artist
 */
export const markRequestSeen = async (req, res) => {
    try {
        const { requestId } = req.params;
        const artistId = req.userId;

        const request = await PendingAction.findOne({ _id: requestId, artist: artistId });
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        request.artistSeenAt = new Date();
        await request.save();

        return res.status(200).json({
            success: true,
            message: "Marked as seen"
        });
    } catch (error) {
        console.error("Mark seen error:", error);
        return res.status(500).json({ success: false, message: "Failed to update" });
    }
};

// ============================================
// USER: LIKE/UNLIKE PRODUCT
// ============================================

/**
 * @desc    Toggle like on product
 * @route   POST /api/v1/products/:productId/like
 * @access  Private
 */
export const toggleLike = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.userId;

        const product = await Product.findOne({
            _id: productId,
            "verification.status": "approved"
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const likeIndex = product.likes.indexOf(userId);

        if (likeIndex > -1) {
            product.likes.splice(likeIndex, 1);
        } else {
            product.likes.push(userId);
        }

        await product.save();

        return res.status(200).json({
            success: true,
            message: likeIndex > -1 ? "Unliked" : "Liked",
            data: {
                liked: likeIndex === -1,
                likesCount: product.likesCount
            }
        });
    } catch (error) {
        console.error("Toggle like error:", error);
        return res.status(500).json({ success: false, message: "Failed to update like" });
    }
};

// ============================================
// ADMIN: PRODUCT MANAGEMENT
// ============================================

/**
 * @desc    Admin: Create product directly (bypass approval)
 * @route   POST /api/v1/products/admin/create
 * @access  Private/Admin
 */
export const adminCreateProduct = async (req, res) => {
    try {
        const adminId = req.userId;
        const {
            title, displayName, description, price, comparePrice, category,
            tags, stock, isDigital, dimensions, weight, artistId
        } = req.body;
        const normalizedCategory = normalizeProductCategory(category);
        const normalizedDisplayName = normalizeDisplayName(displayName, title);

        if (!req.uploadedImages || req.uploadedImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required"
            });
        }

        const parsedTags = typeof tags === "string"
            ? tags.split(",").map(t => t.trim().toLowerCase())
            : tags || [];

        const product = await Product.create({
            artist: artistId || adminId,
            title,
            displayName: normalizedDisplayName,
            description,
            images: req.uploadedImages,
            price: Number(price),
            comparePrice: comparePrice ? Number(comparePrice) : null,
            category: normalizedCategory,
            tags: parsedTags,
            stock: Number(stock) || 1,
            isDigital: isDigital === "true" || isDigital === true,
            dimensions: dimensions ? JSON.parse(dimensions) : undefined,
            weight: weight ? JSON.parse(weight) : undefined,
            status: "active",
            createdByAdmin: true,
            verification: {
                status: "approved",
                reviewedBy: adminId,
                reviewedAt: new Date()
            }
        });

        return res.status(201).json({
            success: true,
            message: "Product created and published",
            data: { product: product.toSafeObject() }
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            if (req.uploadedImages) {
                const publicIds = req.uploadedImages.map(img => img.publicId);
                await deleteMultipleImages(publicIds).catch(console.error);
            }
            return res.status(400).json({
                success: false,
                message: "Invalid product data",
                errors: formatValidationErrors(error)
            });
        }

        console.error("Admin create product error:", error);
        if (req.uploadedImages) {
            const publicIds = req.uploadedImages.map(img => img.publicId);
            await deleteMultipleImages(publicIds).catch(console.error);
        }
        return res.status(500).json({ success: false, message: "Failed to create product" });
    }
};

/**
 * @desc    Admin: Get all pending product requests
 * @route   GET /api/v1/products/admin/pending
 * @access  Private/Admin
 */
export const adminGetPendingRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, actionType } = req.query;

        const query = {
            status: "pending",
            actionType: { $in: ["create_product", "edit_product", "delete_product"] }
        };
        if (actionType) query.actionType = actionType;

        const skip = (Number(page) - 1) * Number(limit);

        const [requests, total, counts] = await Promise.all([
            PendingAction.find(query)
                .populate("artist", "username email avatar")
                .populate("productId", "title images slug")
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(Number(limit)),
            PendingAction.countDocuments(query),
            PendingAction.getPendingCounts()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                requests: requests.map(r => r.toSafeObject()),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                },
                counts
            }
        });
    } catch (error) {
        console.error("Admin get pending error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
};

/**
 * @desc    Admin: Get single pending request details
 * @route   GET /api/v1/products/admin/pending/:requestId
 * @access  Private/Admin
 */
export const adminGetRequestDetails = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await PendingAction.findById(requestId)
            .populate("artist", "username email avatar phone")
            .populate("productId")
            .populate("reviewedBy", "username email");

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        return res.status(200).json({
            success: true,
            data: { request: request.toSafeObject() }
        });
    } catch (error) {
        console.error("Admin get request details error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch request" });
    }
};

/**
 * @desc    Admin: Approve product request
 * @route   PUT /api/v1/products/admin/pending/:requestId/approve
 * @access  Private/Admin
 */
export const adminApproveRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.userId;
        const { adminNote } = req.body;

        const request = await PendingAction.findById(requestId)
            .populate("artist", "email username");

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status}`
            });
        }

        let result = {};

        if (request.actionType === "create_product") {
            const normalizedCategory = normalizeProductCategory(request.data?.category);
            const normalizedDisplayName = normalizeDisplayName(request.data?.displayName, request.data?.title);
            const product = await Product.create({
                artist: request.artist._id,
                ...request.data,
                displayName: normalizedDisplayName,
                category: normalizedCategory,
                submissionChannel: request.data?.submissionChannel === "student_link"
                    ? "student_link"
                    : "standard",
                images: request.images,
                status: "active",
                verification: {
                    status: "approved",
                    reviewedBy: adminId,
                    reviewedAt: new Date()
                }
            });
            result.product = product.toSafeObject();
        }
        else if (request.actionType === "edit_product") {
            const product = await Product.findById(request.productId);
            if (product) {
                Object.assign(product, request.data.changes);

                if (request.images && request.images.length > 0) {
                    product.images.push(...request.images);
                    if (product.images.length > 5) {
                        const removed = product.images.splice(5);
                        await deleteMultipleImages(removed.map(img => img.publicId)).catch(console.error);
                    }
                }

                await product.save();
                result.product = product.toSafeObject();
            }
        }
        else if (request.actionType === "delete_product") {
            const product = await Product.findById(request.productId);
            if (product) {
                const publicIds = product.images.map(img => img.publicId);
                await deleteMultipleImages(publicIds).catch(console.error);
                await Product.deleteOne({ _id: request.productId });
                result.deletedProductId = request.productId;
            }
        }

        request.status = "approved";
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        request.adminNote = adminNote || null;
        request.artistNotified = true;
        await request.save();

        const actionMessages = {
            create_product: "Your product has been approved and is now live!",
            edit_product: "Your product edit has been approved.",
            delete_product: "Your product deletion request has been approved."
        };

        await sendArtistActionEmail(
            request.artist.email,
            request.artist.username,
            "approved",
            request.actionType,
            actionMessages[request.actionType]
        ).catch(console.error);

        return res.status(200).json({
            success: true,
            message: `Request approved. Artist has been notified.`,
            data: result
        });
    } catch (error) {
        console.error("Admin approve request error:", error);
        return res.status(500).json({ success: false, message: "Failed to approve request" });
    }
};

/**
 * @desc    Admin: Reject product request
 * @route   PUT /api/v1/products/admin/pending/:requestId/reject
 * @access  Private/Admin
 */
export const adminRejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.userId;
        const { rejectionReason, adminNote } = req.body;

        const request = await PendingAction.findById(requestId)
            .populate("artist", "email username");

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Request is already ${request.status}`
            });
        }

        if (request.actionType === "create_product" && request.images.length > 0) {
            const publicIds = request.images.map(img => img.publicId);
            await deleteMultipleImages(publicIds).catch(console.error);
        }

        if (request.actionType === "edit_product" && request.images.length > 0) {
            const publicIds = request.images.map(img => img.publicId);
            await deleteMultipleImages(publicIds).catch(console.error);
        }

        if (request.actionType === "delete_product" && request.productId) {
            await Product.findByIdAndUpdate(request.productId, {
                "deletionRequest.status": "rejected",
                "deletionRequest.isPending": false,
                "deletionRequest.reviewedBy": adminId,
                "deletionRequest.reviewedAt": new Date(),
                "deletionRequest.rejectionReason": rejectionReason || null
            });
        }

        request.status = "rejected";
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        request.rejectionReason = rejectionReason || null;
        request.adminNote = adminNote || null;
        request.artistNotified = true;
        await request.save();

        const actionMessages = {
            create_product: "Your product submission was not approved.",
            edit_product: "Your product edit request was not approved.",
            delete_product: "Your product deletion request was not approved."
        };

        await sendArtistActionEmail(
            request.artist.email,
            request.artist.username,
            "rejected",
            request.actionType,
            rejectionReason || actionMessages[request.actionType]
        ).catch(console.error);

        return res.status(200).json({
            success: true,
            message: "Request rejected. Artist has been notified.",
            data: { requestId, status: "rejected" }
        });
    } catch (error) {
        console.error("Admin reject request error:", error);
        return res.status(500).json({ success: false, message: "Failed to reject request" });
    }
};

/**
 * @desc    Admin: Edit product directly
 * @route   PUT /api/v1/products/admin/:productId
 * @access  Private/Admin
 */
export const adminEditProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const {
            title, displayName, description, price, comparePrice, category,
            tags, stock, isDigital, dimensions, weight, status
        } = req.body;

        if (title) product.title = title;
        if (displayName !== undefined) {
            product.displayName = normalizeDisplayName(displayName, title || product.title);
        }
        if (description) product.description = description;
        if (price) product.price = Number(price);
        if (comparePrice !== undefined) product.comparePrice = comparePrice ? Number(comparePrice) : null;
        if (category) product.category = normalizeProductCategory(category);
        if (tags) {
            product.tags = typeof tags === "string"
                ? tags.split(",").map(t => t.trim().toLowerCase())
                : tags;
        }
        if (stock !== undefined) product.stock = Number(stock);
        if (isDigital !== undefined) product.isDigital = isDigital === "true" || isDigital === true;
        if (dimensions) product.dimensions = JSON.parse(dimensions);
        if (weight) product.weight = JSON.parse(weight);
        if (status) product.status = status;

        if (req.uploadedImages && req.uploadedImages.length > 0) {
            product.images.push(...req.uploadedImages);
            if (product.images.length > 5) {
                const removed = product.images.splice(5);
                await deleteMultipleImages(removed.map(img => img.publicId)).catch(console.error);
            }
        }

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated",
            data: { product: product.toSafeObject() }
        });
    } catch (error) {
        console.error("Admin edit product error:", error);
        return res.status(500).json({ success: false, message: "Failed to update product" });
    }
};

/**
 * @desc    Admin: Delete product directly
 * @route   DELETE /api/v1/products/admin/:productId
 * @access  Private/Admin
 */
export const adminDeleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const publicIds = product.images.map(img => img.publicId);
        await deleteMultipleImages(publicIds).catch(console.error);

        await Product.deleteOne({ _id: productId });

        return res.status(200).json({
            success: true,
            message: "Product deleted"
        });
    } catch (error) {
        console.error("Admin delete product error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete product" });
    }
};

/**
 * @desc    Admin: Get all products (including pending/rejected)
 * @route   GET /api/v1/products/admin/all
 * @access  Private/Admin
 */
export const adminGetAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, verificationStatus, artist, search } = req.query;

        const query = {};
        if (status) query.status = status;
        if (verificationStatus) query["verification.status"] = verificationStatus;
        if (artist) query.artist = artist;
        if (search) query.$text = { $search: search };

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate("artist", "username email avatar")
                .populate("verification.reviewedBy", "username")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                products: products.map(p => p.toSafeObject()),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error("Admin get all products error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

// ============================================
// ADMIN: CATEGORY MANAGEMENT
// ============================================

/**
 * @desc    Admin: Create category
 * @route   POST /api/v1/products/admin/categories
 * @access  Private/Admin
 */
export const adminCreateCategory = async (req, res) => {
    try {
        const adminId = req.userId;
        const { name, description, parent, sortOrder } = req.body;

        const category = await Category.create({
            name,
            description,
            parent: parent || null,
            sortOrder: sortOrder || 0,
            createdBy: adminId,
            image: req.uploadedFile || null
        });

        return res.status(201).json({
            success: true,
            message: "Category created",
            data: { category }
        });
    } catch (error) {
        console.error("Create category error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }
        return res.status(500).json({ success: false, message: "Failed to create category" });
    }
};

/**
 * @desc    Admin: Update category
 * @route   PUT /api/v1/products/admin/categories/:categoryId
 * @access  Private/Admin
 */
export const adminUpdateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description, parent, sortOrder, isActive } = req.body;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (parent !== undefined) category.parent = parent || null;
        if (sortOrder !== undefined) category.sortOrder = sortOrder;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated",
            data: { category }
        });
    } catch (error) {
        console.error("Update category error:", error);
        return res.status(500).json({ success: false, message: "Failed to update category" });
    }
};

/**
 * @desc    Admin: Delete category
 * @route   DELETE /api/v1/products/admin/categories/:categoryId
 * @access  Private/Admin
 */
export const adminDeleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const productCount = await Product.countDocuments({ category: categoryId });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete: ${productCount} products are using this category`
            });
        }

        await Category.deleteOne({ _id: categoryId });

        return res.status(200).json({
            success: true,
            message: "Category deleted"
        });
    } catch (error) {
        console.error("Delete category error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete category" });
    }
};

/**
 * @desc    Admin: Get all categories (including inactive)
 * @route   GET /api/v1/products/admin/categories
 * @access  Private/Admin
 */
export const adminGetCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate("parent", "name slug")
            .populate("createdBy", "username")
            .sort({ sortOrder: 1, name: 1 });

        return res.status(200).json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        console.error("Admin get categories error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch categories" });
    }
};

