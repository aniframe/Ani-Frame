const Product = require("../models/product_model");
const update_path = require('../utilities/response_image_url');

module.exports = class ProductController {
    async createProduct(req, res) {
        try {
            // Similar authentication and role check logic here
            const { name, description, price, category, stock } = req.body;
            const product = {
                name,
                description,
                price,
                category,
                images: req.files.map((file) => file.filename),
                stock,
            };
            const newProduct = new Product(product);
            const savedProduct = await newProduct.save();
            if (!savedProduct) {
                return res.status(500).json({
                    message: "Product not saved! Please insert again",
                });
            }
            return res.status(201).json({
                message: "Product Created Successfully!",
                length: 1,
                data: savedProduct,
            });
        } catch (error) {
            return res.status(500).json({
                message: "An error occurred while creating the product",
                error: error.message,
            });
        }
    }

    async getAllProducts(req, res) {
        try {
            const products = await Product.find({}); // Fetch products from the database

            for (let i = 0; i < products.length; i++) {
                for (let j = 0; j < products[i].images.length; j++) {
                    products[i].images[j] = await update_path("product", products[i].images[j]);
                }
            }

            return res.status(200).json({
                message: "Successfully fetched products!",
                length: products.length,
                data: products
            });
        } catch (error) {
            return res.status(500).json({
                message: "An error occurred while fetching products",
                error: error.message
            });
        }
    }

    async getProductById(req, res) {
        try {
            const productId = req.query.id; // Assuming you're passing the product ID as a route parameter
            console.log(productId);
            const product = await Product.findById(productId); // Fetch product by ID from the database
            console.log(product);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            // Apply image_url logic to product photos
            for (let j = 0; j < product.images.length; j++) {
                product.images[j] = await update_path("product", product.images[j]);
            }

            return res.status(200).json({
                message: "Successfully fetched product by ID!",
                data: product
            });
        } catch (error) {
            return res.status(500).json({
                message: "An error occurred while fetching the product by ID",
                error: error.message
            });
        }
    }

    async updateProduct(req, res) {
        try {
            // Similar authentication and role check logic here
            const productId = req.query._id;
            const { name, description, price, category, stock } = req.body;
            const product = {
                name,
                description,
                price,
                category,
                stock,
            };
            if (req.files && req.files.length > 0) {
                product.images = req.files.map((file) => file.filename);
            }
            const updatedProduct = await Product.findByIdAndUpdate(productId, product, { new: true });
            if (!updatedProduct) {
                return res.status(404).json({
                    message: "Product not found for update",
                });
            }
            // Similar image_url logic here
            return res.status(200).json({
                message: "Product updated successfully!",
                length: 1,
                data: updatedProduct,
            });
        } catch (error) {
            return res.status(500).json({
                message: "An error occurred while updating the product",
                error: error.message,
            });
        }
    }

    async deleteProduct(req, res) {
        try {
            // Similar authentication and role check logic here
            const productId = req.query._id;
            const deletedProduct = await Product.findByIdAndDelete(productId);
            if (!deletedProduct) {
                return res.status(404).json({
                    message: "Product not found for delete",
                });
            }
            // Similar image_url logic here
            return res.status(200).json({
                message: "Product deleted successfully!",
                length: 1,
                data: deletedProduct,
            });
        } catch (error) {
            return res.status(500).json({
                message: "An error occurred while deleting the product",
                error: error.message,
            });
        }
    }
};