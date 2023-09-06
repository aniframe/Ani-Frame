const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    fullName: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    addresses: [addressSchema],
});

const User = mongoose.model('User', userSchema);

module.exports = User;