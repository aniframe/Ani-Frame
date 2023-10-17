const express = require("express");
const router = express.Router();
const basic_controller = require("../controllers/basic_controller");
const jwt_middleware = require('../middleware/jwt_middleware');
const user_middleware = require('../middleware/userMiddleware');

const BasicClass = new basic_controller();

router.get("/", (req, res) => BasicClass.base_url(req, res));
router.post("/login", (req, res) => BasicClass.login(req, res));
router.post("/register", (req, res) => BasicClass.register(req, res));
router.post("/changePassword", jwt_middleware, user_middleware, (req, res) => BasicClass.changePassword(req, res));
router.post("/forgotPassword", (req, res) => BasicClass.forgotPassword(req, res));
router.post("/resetPassword", (req, res) => BasicClass.resetPassword(req, res));

module.exports = router;