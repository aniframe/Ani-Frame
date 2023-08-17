const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
    }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    addresses: [{
        fullName: String,
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        phone: String,
    }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;