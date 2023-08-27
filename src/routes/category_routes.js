const express = require("express");
const router = express.Router();
const category_controller = require("../controllers/category_controller");
const admin_middleware = require('../middleware/adminMiddleware');
const jwt_middleware = require('../middleware/jwt_middleware');
const multer = require("multer");

const CategoryClass = new category_controller();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/public/uploads/images/category"); // Set the destination folder for uploaded files
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

router.get("/", (req, res) => CategoryClass.getAllCategories(req, res));
router.get("/byid", (req, res) => CategoryClass.getCategoryById(req, res));
router.post("/", jwt_middleware, admin_middleware, upload.single("category_photo"), (req, res) => CategoryClass.createCategory(req, res));
router.put("/", jwt_middleware, admin_middleware, upload.single("category_photo"), (req, res) => CategoryClass.updateCategory(req, res));
router.delete("/", jwt_middleware, admin_middleware, (req, res) => CategoryClass.deleteCategory(req, res));

module.exports = router;