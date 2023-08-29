const express = require("express");
const router = express.Router();
const cart_controller = require("../controllers/cart_controller");
const user_middleware = require('../middleware/userMiddleware');
const jwt_middleware = require('../middleware/jwt_middleware');

const CartClass = new cart_controller();

router.get("/", jwt_middleware, user_middleware, (req, res) => CartClass.getCart(req, res));
router.post("/", jwt_middleware, user_middleware, (req, res) => CartClass.addToCart(req, res));
router.delete("/", jwt_middleware, user_middleware, (req, res) => CartClass.deleteCart(req, res));
router.delete("/deleteproduct", jwt_middleware, user_middleware, (req, res) => CartClass.deleteProductFromCart(req, res));
router.put("/increase", jwt_middleware, user_middleware, (req, res) => CartClass.increaseProductQuantity(req, res));
router.put("/decrease", jwt_middleware, user_middleware, (req, res) => CartClass.decreaseProductQuantity(req, res));

module.exports = router;