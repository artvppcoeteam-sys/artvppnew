import mongoose from "mongoose";

/**
 * Cart Model
 *
 * Shopping cart for users
 */

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
        default: 1
    },
    price: {
        type: Number,
        required: true // Store price at time of adding (in case price changes)
    }
}, { _id: false });

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        items: [cartItemSchema],

        // Calculated totals
        totalItems: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Calculate totals before saving
cartSchema.pre("save", function(next) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

// Instance methods
cartSchema.methods.addItem = async function(productId, quantity, price) {
    const existingItem = this.items.find(item =>
        item.product.toString() === productId.toString()
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({ product: productId, quantity, price });
    }

    return this.save();
};

cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
    const item = this.items.find(item =>
        item.product.toString() === productId.toString()
    );

    if (!item) throw new Error("Item not in cart");

    if (quantity <= 0) {
        this.items = this.items.filter(item =>
            item.product.toString() !== productId.toString()
        );
    } else {
        item.quantity = quantity;
    }

    return this.save();
};

cartSchema.methods.removeItem = async function(productId) {
    this.items = this.items.filter(item =>
        item.product.toString() !== productId.toString()
    );
    return this.save();
};

cartSchema.methods.clearCart = async function() {
    this.items = [];
    return this.save();
};

// Static: Get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
    let cart = await this.findOne({ user: userId }).populate({
        path: "items.product",
        select: "title images price stock status artist"
    });

    if (!cart) {
        cart = await this.create({ user: userId, items: [] });
    }

    return cart;
};

export const Cart = mongoose.model("Cart", cartSchema);

