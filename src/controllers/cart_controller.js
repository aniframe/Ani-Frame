const { default: mongoose } = require('mongoose');
const User = require('../models/user_model');
const Cart = require('../models/cart_model'); // Import the Cart model
const update_path = require('../utilities/response_image_url');
const fs = require('fs');
const path = require('path');

module.exports = class CartController {
    async addToCart(req, res) {
        try {
            const productId = req.query.productId;
            const quantity = req.query.quantity || 1; // Default to 1 if quantity is not provided in the query
            const userId = req.userData.userId;
    
            // Find the user
            const user = await User.findById(userId);
    
            // Find the user's cart or create one if it doesn't exist
            let cart = await Cart.findOne({ user: userId });
    
            if (!cart) {
                cart = new Cart({ user: userId, items: [] });
            }
    
            // Find the product in the cart
            const cartProduct = cart.items.find(item => item.product.equals(productId));
    
            if (cartProduct) {
                // Product already in cart, increase quantity
                cartProduct.quantity += Number(quantity);
            } else {
                // Product not in cart, add it with the specified quantity
                cart.items.push({ product: productId, quantity: Number(quantity) });
            }
    
            await cart.save();
    
            res.status(200).json({ message: 'Product added to cart successfully' });
        } catch (error) {
            console.error('Error adding product to cart:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }    

    async getCart(req, res) {
        const userId = req.userData.userId; // Extract the user ID from the decoded JWT

        try {
            // Find the user's cart
            const cart = await Cart.findOne({ user: userId }).populate({
                path: 'items.product',
                model: 'Product'
            });

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            if (cart.items.length === 0) {
                return res.status(200).json({ message: 'Cart is empty' });
            }

            const result = {
                username: cart.user.username,
                email: cart.user.email,
                cart: cart.items.map(item => ({
                    product: item.product,
                    quantity: item.quantity
                }))
            };

            // console.log(result.cart[0].product.images);

            for (let i = 0; i < result.cart.length; i++) {
                for(let j = 0; j < result.cart[i].product.images.length; j++) {
                    console.log(result.cart[i].product.images[j]);
                    result.cart[i].product.images[j] = await update_path("product", result.cart[i].product.images[j])
                }
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
            // Delete the user's cart
            const result = await Cart.deleteOne({ user: userId });

            if (result.deletedCount > 0) {
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

            // Find and update the user's cart
            const result = await Cart.findOneAndUpdate(
                { user: userId },
                { $pull: { items: { product: productId } } },
                { new: true }
            );

            if (result) {
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

            // Find and update the user's cart
            const result = await Cart.findOneAndUpdate(
                { user: userId, 'items.product': productId },
                { $inc: { 'items.$.quantity': 1 } },
                { new: true }
            );

            if (result) {
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
            // Find and update the user's cart
            const result = await Cart.findOneAndUpdate(
                { user: userId, 'items.product': productId, 'items.quantity': { $gt: 1 } },
                { $inc: { 'items.$.quantity': -1 } },
                { new: true }
            );

            if (result) {
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
