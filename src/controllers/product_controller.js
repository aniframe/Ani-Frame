const { default: mongoose } = require("mongoose");
const Product = require("../models/product_model");
const update_path = require('../utilities/response_image_url');
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');

async function uploadFile(file) {
    const client = new ftp.Client();
    try {
        console.log('accessing ftp server');
        await client.access({
            host: "aniframes.in",
            user: "u614400033",
            password: "Ani@Frame*20",
            secure: false, // Set to true if you're using FTPS
        });

        console.log('got access to ftp server');

        // Add a timestamp to the original file name
        const timestamp = Date.now();
        const remoteFileName = `${timestamp}_${file.originalname}`;

        // Set the remote path where you want to store the file on the FTP server
        const remotePath = '/public_html/product/' + remoteFileName;

        // Check if the remote directory exists, and create it if it doesn't
        const remoteDir = remotePath.substr(0, remotePath.lastIndexOf('/'));
        await client.ensureDir(remoteDir);

        console.log('uploading file to ftp');

        // Upload the file
        await client.uploadFrom(file.path, remotePath);

        console.log('succesfully uploaded to ftp server');

        return remotePath;
    } catch (error) {
        console.error('Error uploading file:', file.originalname);
        throw error;
    } finally {
        client.close();
    }
}

module.exports = class ProductController {

    async createProduct(req, res) {
        try {
            console.log("Start createProduct API");
            console.log(req.files);
            const myfiles = req.files;
            let uploadedFiles;
            if (myfiles && myfiles.length > 0) {
                console.log(`Uploading ${myfiles.length} files to FTP server`);
                // Upload files to FTP server and collect the remote file paths
                uploadedFiles = await Promise.all(myfiles.map(uploadFile));
                console.log("Files uploaded successfully");
            }

            // Similar authentication and role check logic here
            const { name, description, price, category, stock } = req.body;
            const product = {
                name,
                description,
                price,
                category,
                images: uploadedFiles.map(filename => {
                    // Extract the file name from the full path
                    return path.basename(filename);
                }),
                stock
            };
            console.log("Saving the product to the database");
            const newProduct = new Product(product);
            const savedProduct = await newProduct.save();
            if (!savedProduct) {
                return res.status(500).json({
                    message: "Product not saved! Please insert again",
                });
            }
            console.log("Product Created Successfully!");
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
            const userRole = req.userData ? req.userData.role : null;

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
            if (userRole === "customer" || userRole === null) {
                pipeline.unshift({
                    $match: { status: true }
                });
            }

            const products = await Product.aggregate(pipeline);

            for (let i = 0; i < products.length; i++) {
                for (let j = 0; j < products[i].images.length; j++) {
                    products[i].images[j] = await update_path("product", products[i].images[j]);
                }
            }

            // Now, update the category image path for all products
            for (let i = 0; i < products.length; i++) {
                products[i].category[0].image = await update_path("category", products[i].category[0].image);
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

            // Check the user's role from the token
            const userRole = req.userData ? req.userData.role : null;

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
            if (userRole === "customer" || userRole === null) {
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

            const updatedCategoryImage = await update_path("category", product[0].category[0].image);

            // Apply image_url logic to product photos
            for (let j = 0; j < product[0].images.length; j++) {
                product[0].images[j] = await update_path("product", product[0].images[j]);
            }

            product[0].category[0].image = updatedCategoryImage;

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