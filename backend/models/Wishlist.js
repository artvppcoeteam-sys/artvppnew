import mongoose from "mongoose";

/**
 * Wishlist Model
 *
 * Stores user's saved products (favorites)
 */

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One wishlist per user
            index: true
        },
        products: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    {
        timestamps: true
    }
);

// Index for faster product lookup within wishlist
wishlistSchema.index({ user: 1, "products.product": 1 });

// Instance Methods
wishlistSchema.methods.addProduct = async function(productId) {
    const exists = this.products.some(
        item => item.product.toString() === productId.toString()
    );

    if (!exists) {
        this.products.push({ product: productId });
        await this.save();
    }
    return this;
};

wishlistSchema.methods.removeProduct = async function(productId) {
    this.products = this.products.filter(
        item => item.product.toString() !== productId.toString()
    );
    await this.save();
    return this;
};

wishlistSchema.methods.hasProduct = function(productId) {
    return this.products.some(
        item => item.product.toString() === productId.toString()
    );
};

wishlistSchema.methods.clear = async function() {
    this.products = [];
    await this.save();
    return this;
};

// Static Methods
wishlistSchema.statics.getOrCreate = async function(userId) {
    let wishlist = await this.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await this.create({ user: userId, products: [] });
    }
    return wishlist;
};

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);

