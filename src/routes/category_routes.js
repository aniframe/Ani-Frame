const express = require("express");
const router = express.Router();
const category_controller = require("../controllers/category_controller");
const admin_middleware = require('../middleware/adminMiddleware');
const jwt_middleware = require('../middleware/jwt_middleware');

const CategoryClass = new category_controller();

router.get("/", (req, res) => CategoryClass.getAllCategories(req, res));
router.get("/byid", (req, res) => CategoryClass.getCategoryById(req, res));
router.post("/", jwt_middleware, admin_middleware, (req, res) => CategoryClass.createCategory(req, res));
router.put("/", jwt_middleware, admin_middleware, (req, res) => CategoryClass.updateCategory(req, res));
router.delete("/", jwt_middleware, admin_middleware, (req, res) => CategoryClass.deleteCategory(req, res));

module.exports = router;