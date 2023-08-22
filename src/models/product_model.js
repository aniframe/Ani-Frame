const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [String],
    stock: Number,
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;