const Order = require('../models/order_model');
const User = require('../models/user_model');
const Product = require('../models/product_model');
const { default: mongoose } = require('mongoose');

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
                address: orderData.address
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
        try {
            const userId = req.userData.userId;

            // Find the user by their ID and populate the 'orders' field
            const user = await User.findOne({ _id: userId }).populate('orders');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Extract the populated orders data (including addresses)
            const ordersWithAddresses = [];

            // Iterate through each order
            for (const order of user.orders) {
                const addressId = order.address;

                // Find the matching address from user's addresses
                const address = user.addresses.find((a) => a._id.toString() === addressId.toString());

                if (address) {
                    // Create a new object with the updated 'address' property
                    const updatedOrder = { ...order._doc, address };

                    // Populate the 'products' field in the order
                    const populatedOrder = await Order.populate(updatedOrder, {
                        path: 'products.product',
                        model: 'Product', // Replace 'Product' with your actual model name
                    });


                    // Add the updated order to the array
                    ordersWithAddresses.push(populatedOrder);
                }
            }

            res.status(200).json(ordersWithAddresses);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getAllOrders(req, res) {
        try {
            const orders = await Order.find();

            if (!orders) {
                return res.status(404).json({ message: 'No orders found' });
            }

            // Create an array to store orders with addresses
            const ordersWithAddresses = [];

            // Iterate through each order
            for (const order of orders) {
                // Find the user by their ID using the user field in the order
                const user = await User.findById(order.user);

                if (!user) {
                    continue; // Skip this order if the user is not found
                }

                // Find the matching address from user's addresses
                const address = user.addresses.find((a) => a._id.toString() === order.address.toString());

                if (!address) {
                    continue; // Skip this order if the address is not found
                }

                // Create an object that includes the order and its associated address
                const orderWithAddress = {
                    order,
                    address,
                };

                ordersWithAddresses.push(orderWithAddress);
            }

            res.status(200).json(ordersWithAddresses);
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
        try {
            const orderId = req.query.orderId; // Extract the orderId from the request parameters

            // Find the order by its ID
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Find the user by their ID using the user field in the order
            const user = await User.findById(order.user);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find the matching address from user's addresses
            const address = user.addresses.find((a) => a._id.toString() === order.address.toString());

            if (!address) {
                return res.status(404).json({ message: 'Address not found' });
            }

            res.status(200).json({ order, address });
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getPendingOrders(req, res) {
        try {
            const pendingOrders = await Order.find({ status: 'pending' });
    
            if (!pendingOrders) {
                return res.status(404).json({ message: 'No pending orders found' });
            }
    
            // Create an array to store pending orders with addresses
            const pendingOrdersWithAddresses = [];
    
            // Iterate through each pending order
            for (const order of pendingOrders) {
                // Find the user by their ID using the user field in the order
                const user = await User.findById(order.user);
    
                if (!user) {
                    continue; // Skip this order if the user is not found
                }
    
                // Find the matching address from user's addresses
                const address = user.addresses.find((a) => a._id.toString() === order.address.toString());
    
                if (!address) {
                    continue; // Skip this order if the address is not found
                }
    
                // Create an object that includes the pending order and its associated address
                const pendingOrderWithAddress = {
                    order,
                    address,
                };
    
                pendingOrdersWithAddresses.push(pendingOrderWithAddress);
            }
    
            res.status(200).json(pendingOrdersWithAddresses);
        } catch (error) {
            console.error('Error fetching pending orders:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    async getDeliveredOrders(req, res) {
        try {
            const deliveredOrders = await Order.find({ status: 'delivered' });
    
            if (!deliveredOrders) {
                return res.status(404).json({ message: 'No delivered orders found' });
            }
    
            // Create an array to store delivered orders with addresses
            const deliveredOrdersWithAddresses = [];
    
            // Iterate through each delivered order
            for (const order of deliveredOrders) {
                // Find the user by their ID using the user field in the order
                const user = await User.findById(order.user);
    
                if (!user) {
                    continue; // Skip this order if the user is not found
                }
    
                // Find the matching address from user's addresses
                const address = user.addresses.find((a) => a._id.toString() === order.address.toString());
    
                if (!address) {
                    continue; // Skip this order if the address is not found
                }
    
                // Create an object that includes the delivered order and its associated address
                const deliveredOrderWithAddress = {
                    order,
                    address,
                };
    
                deliveredOrdersWithAddresses.push(deliveredOrderWithAddress);
            }
    
            res.status(200).json(deliveredOrdersWithAddresses);
        } catch (error) {
            console.error('Error fetching delivered orders:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};