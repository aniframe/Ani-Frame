const express = require("express");
const router = express.Router();
const address_controller = require("../controllers/address_controller"); // Import the AddressController
const user_middleware = require('../middleware/userMiddleware');
const jwt_middleware = require('../middleware/jwt_middleware');

const AddressController = new address_controller(); // Create an instance of the AddressController

// Routes for Address Management
router.post("/", jwt_middleware, user_middleware, (req, res) => AddressController.createAddress(req, res)); // Create a new address
router.get("/", jwt_middleware, user_middleware, (req, res) => AddressController.getAddress(req, res)); // Get all addresses
router.get("/getById", jwt_middleware, user_middleware, (req, res) => AddressController.getAddressById(req, res)); // Get an address by ID
router.put("/", jwt_middleware, user_middleware, (req, res) => AddressController.updateAddress(req, res)); // Update an address
router.delete("/", jwt_middleware, user_middleware, (req, res) => AddressController.deleteAddress(req, res)); // Delete an address

module.exports = router;