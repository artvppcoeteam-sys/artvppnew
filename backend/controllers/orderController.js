import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay (will be configured when keys are set)
let razorpay;
try {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} catch (e) {
    console.warn("Razorpay not configured");
}

/**
 * Order Controller
 */

/**
 * @desc    Create order from cart
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = "razorpay", customerNote, razorpayPaymentId } = req.body;

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
            !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || 
            !shippingAddress.pincode) {
            return res.status(400).json({
                success: false,
                message: "Complete shipping address is required"
            });
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: req.userId }).populate({
            path: "items.product",
            populate: { path: "artist", select: "_id" }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Validate stock and build order items
        const orderItems = [];
        let subtotal = 0;

        for (const item of cart.items) {
            const product = item.product;

            if (!product || product.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message: `Product "${item.product?.title || 'Unknown'}" is no longer available`
                });
            }

            if (!product.isDigital && product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} of "${product.title}" available`
                });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                artist: product.artist._id || product.artist,
                title: product.title,
                image: product.images[0]?.url,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });
        }

        // Calculate totals
        const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
        const tax = 0; // Add GST calculation if needed
        const total = subtotal + shippingCost + tax;

        // Create order
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const generatedOrderNumber = `ART${year}${month}${random}`;

        const order = new Order({
            orderNumber: generatedOrderNumber,
            user: req.userId,
            items: orderItems,
            subtotal,
            shippingCost,
            tax,
            total,
            shippingAddress,
            payment: {
                method: paymentMethod,
                status: razorpayPaymentId ? "completed" : "pending",
                ...(razorpayPaymentId && { razorpayPaymentId, paidAt: new Date() })
            },
            customerNote,
            status: razorpayPaymentId ? "confirmed" : "pending"
        });

        await order.save();

        // If payment was already done client-side (demo/test mode), update stock and skip Razorpay order creation
        if (razorpayPaymentId) {
            for (const item of orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
            // Clear user's cart
            await Cart.findOneAndUpdate({ user: req.userId }, { items: [], totalItems: 0, totalPrice: 0 });
        }

        // Create Razorpay order if using Razorpay and no client-side payment yet
        let razorpayOrder = null;
        if (!razorpayPaymentId && paymentMethod === "razorpay" && razorpay) {
            try {
                razorpayOrder = await razorpay.orders.create({
                    amount: total * 100, // Razorpay expects paise
                    currency: "INR",
                    receipt: order.orderNumber,
                    notes: {
                        orderId: order._id.toString()
                    }
                });

                order.payment.razorpayOrderId = razorpayOrder.id;
                await order.save();
            } catch (rzpError) {
                // Do not fail full order creation if gateway is temporarily unavailable.
                console.error("Razorpay order creation failed:", rzpError?.message || rzpError);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Order created",
            data: {
                order: order.toSafeObject(),
                razorpayOrder: razorpayOrder ? {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency
                } : null,
                razorpayKeyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error("Create order error:", error);
        return res.status(500).json({ success: false, message: "Failed to create order" });
    }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/v1/orders/:orderId/verify-payment
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { razorpayPaymentId, razorpaySignature } = req.body;

        const order = await Order.findOne({ _id: orderId, user: req.userId });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.payment.status === "completed") {
            return res.status(400).json({ success: false, message: "Payment already verified" });
        }

        // Verify signature
        const sign = order.payment.razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (razorpaySignature !== expectedSign) {
            order.payment.status = "failed";
            await order.save();
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Update order
        order.payment.razorpayPaymentId = razorpayPaymentId;
        order.payment.razorpaySignature = razorpaySignature;
        order.payment.status = "completed";
        order.payment.paidAt = new Date();
        order.status = "confirmed";
        await order.save();

        // Update product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear cart
        await Cart.findOneAndUpdate(
            { user: req.userId },
            { $set: { items: [], totalItems: 0, totalPrice: 0 } }
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: { order: order.toSafeObject() }
        });
    } catch (error) {
        console.error("Verify payment error:", error);
        return res.status(500).json({ success: false, message: "Failed to verify payment" });
    }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/v1/orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { user: req.userId };
        if (status) query.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Order.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                orders: orders.map(o => o.toSafeObject()),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

/**
 * @desc    Get single order
 * @route   GET /api/v1/orders/:orderId
 * @access  Private
 */
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, user: req.userId })
            .populate("items.product", "title images slug");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({
            success: true,
            data: { order: order.toSafeObject() }
        });
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch order" });
    }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/v1/orders/:orderId/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await Order.findOne({ _id: orderId, user: req.userId });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!["pending", "confirmed"].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled at this stage"
            });
        }

        order.status = "cancelled";
        order.cancellation = {
            reason: reason || "Cancelled by user",
            cancelledBy: "user",
            cancelledAt: new Date()
        };
        await order.save();

        // Restore stock if payment was completed
        if (order.payment.status === "completed") {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
            // TODO: Initiate refund via Razorpay
        }

        return res.status(200).json({
            success: true,
            message: "Order cancelled",
            data: { order: order.toSafeObject() }
        });
    } catch (error) {
        console.error("Cancel order error:", error);
        return res.status(500).json({ success: false, message: "Failed to cancel order" });
    }
};

// ============================================
// ARTIST: MANAGE ORDERS
// ============================================

/**
 * @desc    Get orders for artist's products
 * @route   GET /api/v1/orders/artist/orders
 * @access  Private/Artist
 */
export const getArtistOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const query = { "items.artist": req.userId };
        if (status) query.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate("user", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Order.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                orders: orders.map(o => o.toSafeObject()),
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error("Get artist orders error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

/**
 * @desc    Update order status (Artist)
 * @route   PUT /api/v1/orders/artist/:orderId/status
 * @access  Private/Artist
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber, courier, trackingUrl } = req.body;

        const order = await Order.findOne({ 
            _id: orderId, 
            "items.artist": req.userId 
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Validate status transition
        const validTransitions = {
            pending: ["processing"],
            confirmed: ["processing"],
            processing: ["shipped"],
            shipped: ["delivered"]
        };

        if (!validTransitions[order.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${order.status} to ${status}`
            });
        }

        order.status = status;

        if (status === "shipped") {
            order.shipping = order.shipping || {};
            order.shipping = {
                courier: courier || order.shipping.courier,
                trackingNumber: trackingNumber || order.shipping.trackingNumber,
                trackingUrl: trackingUrl || order.shipping.trackingUrl,
                shippedAt: new Date()
            };
        }

        if (status === "delivered") {
            order.shipping = order.shipping || {};
            order.shipping.deliveredAt = new Date();
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order marked as ${status}`,
            data: { order: order.toSafeObject() }
        });
    } catch (error) {
        console.error("Update order status error:", error);
        return res.status(500).json({ success: false, message: "Failed to update order" });
    }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/v1/orders/admin/:orderId/status
 * @access  Private/Admin
 */
export const adminUpdateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber, courier, trackingUrl, adminNote } = req.body;

        const validStatuses = new Set([
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded"
        ]);

        if (!validStatuses.has(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status provided"
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.status = status;

        if (typeof adminNote === "string") {
            order.adminNote = adminNote.trim().slice(0, 500);
        }

        if (status === "shipped") {
            order.shipping = order.shipping || {};
            order.shipping.courier = courier || order.shipping.courier;
            order.shipping.trackingNumber = trackingNumber || order.shipping.trackingNumber;
            order.shipping.trackingUrl = trackingUrl || order.shipping.trackingUrl;
            order.shipping.shippedAt = order.shipping.shippedAt || new Date();
        }

        if (status === "delivered") {
            order.shipping = order.shipping || {};
            order.shipping.deliveredAt = new Date();
        }

        if (status === "cancelled") {
            order.cancellation = order.cancellation || {};
            order.cancellation.cancelledBy = "admin";
            order.cancellation.cancelledAt = new Date();
            order.cancellation.reason = order.cancellation.reason || "Cancelled by admin";
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order marked as ${status}`,
            data: { order: order.toSafeObject() }
        });
    } catch (error) {
        console.error("Admin update order status error:", error);
        return res.status(500).json({ success: false, message: "Failed to update order status" });
    }
};

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/v1/orders/admin/all
 * @access  Private/Admin
 */
export const adminGetAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;

        const query = {};

        // Filter by status if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        // Search by order ID or customer name
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate('user', 'username email')
            .populate('items.product', 'title images')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                orders: orders.map(order => order.toSafeObject()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Get all orders error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

