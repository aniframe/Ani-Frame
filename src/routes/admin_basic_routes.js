const express = require("express");
const router = express.Router();
const admin_basic_controller = require("../controllers/admin_basic_controller");
const admin_middleware = require('../middleware/adminMiddleware');
const jwt_middleware = require('../middleware/jwt_middleware');

const AdminBasicClass = new admin_basic_controller();

router.get("/getalluser", jwt_middleware, admin_middleware, (req, res) => AdminBasicClass.get_all_user(req, res));
router.get("/getuserbyid", jwt_middleware, admin_middleware, (req, res) => AdminBasicClass.get_user_by_id(req, res));

module.exports = router;