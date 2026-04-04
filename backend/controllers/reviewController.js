import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Notification } from "../models/Notification.js";

/**
 * Review Controller
 */

/**
 * @desc    Create a new review
 * @route   POST /api/v1/reviews
 * @access  Private
 */
export const createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment, images } = req.body;

        // Validation
        if (!productId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Product ID, rating, and comment are required"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
            user: req.userId,
            product: productId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        // Check if user has purchased this product (verified purchase)
        const hasPurchased = await Review.hasUserPurchased(req.userId, productId);

        // Create review
        const review = await Review.create({
            user: req.userId,
            product: productId,
            rating,
            title,
            comment,
            images: images || [],
            isVerifiedPurchase: hasPurchased,
            status: "pending" // Requires admin approval
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully. It will be visible after admin approval.",
            data: { review: review.toSafeObject() }
        });
    } catch (error) {
        console.error("Create review error:", error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create review"
        });
    }
};

/**
 * @desc    Get user's reviews
 * @route   GET /api/v1/reviews/my-reviews
 * @access  Private
 */
export const getMyReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ user: req.userId })
            .populate("product", "title slug images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ user: req.userId });

        return res.status(200).json({
            success: true,
            data: {
                reviews: reviews.map(r => r.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get my reviews error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
};

/**
 * @desc    Get product reviews (public)
 * @route   GET /api/v1/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = "recent" } = req.query;
        const skip = (page - 1) * limit;

        // Build sort object
        let sortObj = { createdAt: -1 }; // Default: recent
        if (sort === "helpful") {
            sortObj = { "helpful.count": -1 };
        } else if (sort === "rating_high") {
            sortObj = { rating: -1 };
        } else if (sort === "rating_low") {
            sortObj = { rating: 1 };
        }

        const reviews = await Review.find({
            product: productId,
            status: "approved"
        })
            .populate("user", "username avatar")
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({
            product: productId,
            status: "approved"
        });

        // Get rating statistics
        const stats = await Review.getProductRatingStats(productId);

        return res.status(200).json({
            success: true,
            data: {
                reviews: reviews.map(r => r.toSafeObject()),
                stats,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get product reviews error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
};

/**
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment, images } = req.body;

        const review = await Review.findOne({ _id: id, user: req.userId });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check if review can be edited (within 30 days)
        if (!review.canEdit()) {
            return res.status(400).json({
                success: false,
                message: "Reviews can only be edited within 30 days of creation"
            });
        }

        // Update fields
        if (rating) review.rating = rating;
        if (title !== undefined) review.title = title;
        if (comment) review.comment = comment;
        if (images) review.images = images;

        review.isEdited = true;
        review.editedAt = new Date();
        review.status = "pending"; // Re-submit for approval

        await review.save();

        return res.status(200).json({
            success: true,
            message: "Review updated. It will be visible after admin re-approval.",
            data: { review: review.toSafeObject() }
        });
    } catch (error) {
        console.error("Update review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update review"
        });
    }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findOne({ _id: id, user: req.userId });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        await review.deleteOne();

        // Update product rating
        const product = await Product.findById(review.product);
        if (product) {
            const stats = await Review.getProductRatingStats(review.product);
            product.rating = {
                average: stats.averageRating,
                count: stats.totalReviews
            };
            await product.save();
        }

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete review"
        });
    }
};

/**
 * @desc    Mark review as helpful
 * @route   POST /api/v1/reviews/:id/helpful
 * @access  Private
 */
export const markReviewHelpful = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findOne({ _id: id, status: "approved" });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Can't vote on own review
        if (review.user.toString() === req.userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot vote on your own review"
            });
        }

        const added = await review.markHelpful(req.userId);

        return res.status(200).json({
            success: true,
            message: added ? "Marked as helpful" : "Removed helpful vote",
            data: {
                helpfulCount: review.helpful.count,
                voted: added
            }
        });
    } catch (error) {
        console.error("Mark helpful error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update review"
        });
    }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/v1/admin/reviews
 * @access  Admin
 */
export const adminGetAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = "pending" } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status !== "all") {
            query.status = status;
        }

        const reviews = await Review.find(query)
            .populate("user", "username email")
            .populate("product", "title slug images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Admin get reviews error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
};

/**
 * @desc    Approve review (admin)
 * @route   POST /api/v1/admin/reviews/:id/approve
 * @access  Admin
 */
export const adminApproveReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        review.status = "approved";
        review.moderatedBy = req.userId;
        review.moderatedAt = new Date();
        await review.save();

        // Update product rating
        const product = await Product.findById(review.product);
        if (product) {
            const stats = await Review.getProductRatingStats(review.product);
            product.rating = {
                average: stats.averageRating,
                count: stats.totalReviews
            };
            await product.save();
        }

        // Send notification to user
        await Notification.createNotification(
            review.user,
            "review_approved",
            "Review Approved",
            "Your review has been approved and is now visible.",
            `/product/${product?.slug || review.product}`
        );

        return res.status(200).json({
            success: true,
            message: "Review approved successfully"
        });
    } catch (error) {
        console.error("Admin approve review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve review"
        });
    }
};

/**
 * @desc    Reject review (admin)
 * @route   POST /api/v1/admin/reviews/:id/reject
 * @access  Admin
 */
export const adminRejectReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        review.status = "rejected";
        review.moderatedBy = req.userId;
        review.moderatedAt = new Date();
        review.rejectionReason = reason || "Review does not meet our guidelines";
        await review.save();

        // Send notification to user
        await Notification.createNotification(
            review.user,
            "review_rejected",
            "Review Not Approved",
            `Your review was not approved. Reason: ${review.rejectionReason}`,
            null
        );

        return res.status(200).json({
            success: true,
            message: "Review rejected"
        });
    } catch (error) {
        console.error("Admin reject review error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject review"
        });
    }
};

