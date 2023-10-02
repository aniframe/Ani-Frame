const express = require("express");
const router = express.Router();
const order_controller = require("../controllers/order_controller");
const user_middleware = require('../middleware/userMiddleware');
const admin_middleware = require('../middleware/adminMiddleware');
const jwt_middleware = require('../middleware/jwt_middleware');

const OrderClass = new order_controller();


router.post("/", jwt_middleware, user_middleware, (req, res) => OrderClass.createOrder(req, res));
router.get("/", jwt_middleware, user_middleware, (req, res) => OrderClass.getOrder(req, res));
router.get("/all", jwt_middleware, admin_middleware, (req, res) => OrderClass.getAllOrders(req, res));
router.put("/", jwt_middleware, admin_middleware, (req, res) => OrderClass.updateOrderStatus(req, res));
router.get('/byId', (req, res) => OrderClass.getOrderById(req, res));
router.get('/pending', jwt_middleware, admin_middleware, (req, res) => OrderClass.getPendingOrders(req, res));
router.get('/delivered', jwt_middleware, admin_middleware, (req, res) => OrderClass.getDeliveredOrders(req, res));

module.exports = router;
