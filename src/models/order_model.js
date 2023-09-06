const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
    }],
    totalPrice: Number,
    status: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;