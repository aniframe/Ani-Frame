const express = require("express");
const router = express.Router();
const admin_basic_controller = require("../controllers/admin_basic_controller");
const admin_middleware = require('../middleware/adminMiddleware');

const AdminBasicClass = new admin_basic_controller();

router.get("/getalluser", admin_middleware, (req, res) => AdminBasicClass.get_all_user(req, res));
router.get("/getuserbyid", admin_middleware, (req, res) => AdminBasicClass.get_user_by_id(req, res));

module.exports = router;