const { default: mongoose } = require('mongoose');
const User = require('../models/user_model');
const update_path = require('../utilities/response_image_url');
const fs = require('fs');
const path = require('path');

module.exports = class CartController {
    async addToCart(req, res) {
        try {
            const productId = req.query.productId;
            const userId = req.userData.userId;

            const user = await User.findById(userId);

            // Find the product in the user's cart
            const cartProduct = user.cart.find(item => item.product.equals(productId));

            if (cartProduct) {
                // Product already in cart, increase quantity
                cartProduct.quantity += 1;
            } else {
                // Product not in cart, add it with quantity 1
                user.cart.push({ product: productId, quantity: 1 });
            }

            await user.save();

            res.status(200).json({ message: 'Product added to cart successfully' });
        } catch (error) {
            console.error('Error adding product to cart:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getCart(req, res) {
        const userId = req.userData.userId; // Extract the user ID from the decoded JWT

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.cart.length === 0) {
                return res.status(200).json({ message: 'Cart is empty' });
            }

            const result = await User.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(userId) }
                },
                {
                    $lookup: {
                        from: 'products', // Collection name of products
                        localField: 'cart.product',
                        foreignField: '_id',
                        as: 'cart.productDetails'
                    }
                },
                {
                    $unwind: '$cart.productDetails'
                },
                {
                    $lookup: {
                        from: 'categories', // Collection name of categories
                        localField: 'cart.productDetails.category',
                        foreignField: '_id',
                        as: 'cart.productDetails.category'
                    }
                },
                {
                    $project: {

                        username: 1,
                        email: 1,
                        cart: 1,
                        category: 1
                    }
                }
            ]);

            // Apply image_url logic to product and category images
            for (const userCartItem of result) {
                const productDetail = userCartItem.cart.productDetails;
                for (let i = 0; i < productDetail.images.length; i++) {
                    productDetail.images[i] = await update_path("product", productDetail.images[i]);
                }
                productDetail.category[0].image = await update_path("category", productDetail.category[0].image);
            }

            res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching user cart:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async deleteCart(req, res) {
        const userId = req.userData.userId; // Extract the user ID from the decoded JWT

        try {
            const result = await User.updateOne(
                { _id: userId },
                { $set: { cart: [] } }
            );

            if (result.modifiedCount > 0) {
                res.status(200).json({ message: 'Cart deleted successfully' });
            } else {
                res.status(404).json({ message: 'Cart not found or already empty' });
            }
        } catch (error) {
            console.error('Error deleting cart:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async deleteProductFromCart(req, res) {
        try {
            const productId = req.query.productId;
            const userId = req.userData.userId; // Extract the user ID from the decoded JWT

            const result = await User.updateOne(
                { _id: userId },
                { $pull: { cart: { product: productId } } }
            );

            if (result.modifiedCount > 0) {
                res.status(200).json({ message: 'Product removed from cart successfully' });
            } else {
                res.status(404).json({ message: 'Product not found in cart' });
            }
        } catch (error) {
            console.error('Error deleting product from cart:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async increaseProductQuantity(req, res) {
        try {
            const productId = req.query.productId;
            const userId = req.userData.userId;; // Extract the user ID from the decoded JWT
            const result = await User.updateOne(
                { _id: userId, 'cart.product': productId },
                { $inc: { 'cart.$.quantity': 1 } }
            );

            if (result.modifiedCount > 0) {
                res.status(200).json({ message: 'Product quantity increased successfully' });
            } else {
                res.status(404).json({ message: 'Product not found in cart' });
            }
        } catch (error) {
            console.error('Error increasing product quantity:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async decreaseProductQuantity(req, res) {
        const productId = req.query.productId;
        const userId = req.userData.userId;; // Extract the user ID from the decoded JWT

        try {
            const result = await User.updateOne(
                { _id: userId, 'cart.product': productId, 'cart.quantity': { $gt: 1 } },
                { $inc: { 'cart.$.quantity': -1 } }
            );

            if (result.modifiedCount > 0) {
                res.status(200).json({ message: 'Product quantity decreased successfully' });
            } else {
                res.status(404).json({ message: 'Product not found in cart or minimum quantity reached' });
            }
        } catch (error) {
            console.error('Error decreasing product quantity:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
