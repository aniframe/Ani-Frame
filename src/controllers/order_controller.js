const Order = require('../models/order_model');
const User = require('../models/user_model');
const Product = require('../models/product_model');

module.exports = class OrderController {
    async createOrder(req, res) {
        const userId = req.userData.userId;
        const orderData = req.body;

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const productsExist = await Product.find({ _id: { $in: orderData.products.map(item => item.product) } });

            if (productsExist.length !== orderData.products.length) {
                return res.status(400).json({ message: 'Some products do not exist' });
            }

            const order = new Order({
                user: userId,
                products: orderData.products,
                totalPrice: orderData.totalPrice,
                status: orderData.status,
            });

            await order.save();

            user.orders.push(order._id);
            await user.save();

            res.status(201).json({ message: 'Order created successfully' });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getOrder(req, res) {
        const userId = req.userData.userId;

        try {
            const orders = await Order.find({ user: userId });

            if (!orders) {
                return res.status(404).json({ message: 'Orders not found' });
            }

            res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getAllOrders(req, res) {
        // Implement getAllOrders method to retrieve all orders for admin
        try {
            const orders = await Order.find();

            if (!orders) {
                return res.status(404).json({ message: 'No orders found' });
            }

            res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching all orders:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async updateOrderStatus(req, res) {
        const orderId = req.query.orderId;
        const newStatus = req.body.status;

        try {
            const order = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.status(200).json({ message: 'Order status updated successfully', order });
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getOrderById(req, res) {
        const orderId = req.query.orderId; // Extract the order ID from the URL parameter

        try {
            const order = await Order.findById(orderId).populate('products.product', 'name price'); // Populate the product details

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.status(200).json(order);
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};