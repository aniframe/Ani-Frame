const express = require("express");
const router = express.Router();
const multer = require("multer");
const ProductController = require("../controllers/product_controller");
const admin_middleware = require('../middleware/adminMiddleware');
const jwt_middleware = require('../middleware/jwt_middleware');
const optionaljwt_middleware = require('../middleware/optional_jwtMiddleware');
const fs = require('fs');
const path = require('path');

const product_controller = new ProductController();

// Ensure the directory for file uploads exists or create it
const uploadDirectory = "src/public/uploads/images/product";
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, (Date.now() + file.originalname).replace(/\s+/g, "")); // Set a unique filename for the uploaded file
    }
});

// Set the upload limits for files
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload a valid image file"));
        }
        cb(null, true);
    }
});

router.post("/", jwt_middleware, admin_middleware, upload.array("product_photo"), (req, res) => product_controller.createProduct(req, res));
router.get("/", optionaljwt_middleware, (req, res) => product_controller.getAllProducts(req, res));
router.get("/byid", optionaljwt_middleware, (req, res) => product_controller.getProductById(req, res));
router.put("/", jwt_middleware, admin_middleware, upload.array("product_photo"), (req, res) => product_controller.updateProduct(req, res));
router.delete("/", jwt_middleware, admin_middleware, (req, res) => product_controller.deleteProduct(req, res));

module.exports = router;