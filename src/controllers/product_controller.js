const { default: mongoose } = require("mongoose");
const Product = require("../models/product_model");
const update_path = require('../utilities/response_image_url');
const fs = require('fs');
const path = require('path');

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
            // Check the user's role from the token
            const userRole = req.userData.role;

            // Define the aggregation pipeline stages
            const pipeline = [
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                }
            ];

            // Add a $match stage to filter products based on status if the user is a customer
            if (userRole === "customer") {
                pipeline.unshift({
                    $match: { status: true }
                });
            }

            const products = await Product.aggregate(pipeline);

            for (let i = 0; i < products.length; i++) {
                for (let j = 0; j < products[i].images.length; j++) {
                    products[i].images[j] = await update_path("product", products[i].images[j]);
                    products[i].category[0].image = await update_path("category", products[i].category[0].image);
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

            const userRole = req.userData.role;

            // Define the aggregation pipeline stages
            const pipeline = [
                {
                    $match: { _id: new mongoose.Types.ObjectId(productId) }
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                }
            ];

            // Add a $match stage to filter the product based on status if the user is a customer
            if (userRole === "customer") {
                pipeline.unshift({
                    $match: { status: true }
                });
            }

            const product = await Product.aggregate(pipeline); // Fetch product by ID from the database

            if (!product || product.length === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            // Apply image_url logic to product photos
            for (let j = 0; j < product[0].images.length; j++) {
                product[0].images[j] = await update_path("product", product[0].images[j]);
                product[0].category[0].image = await update_path("category", product[0].category[0].image);
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
            const { name, description, price, category, stock, status } = req.body;
            const product = {
                name,
                description,
                price,
                category,
                stock,
                status
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

            // Delete associated images from the server location
            if (deletedProduct.images && deletedProduct.images.length > 0) {
                const imageDir = path.join(__dirname, '..', '..', 'src', 'public', 'uploads', 'images', 'product');

                deletedProduct.images.forEach(imageFilename => {
                    const imagePath = path.join(imageDir, imageFilename);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                        console.log(`Deleted image: ${imagePath}`);
                    }
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