const express = require("express");
const router = express.Router();
const basic_controller = require("../controllers/basic_controller");

const BasicClass = new basic_controller();

router.get("/", (req, res) => BasicClass.base_url(req, res));
router.post("/login", (req, res) => BasicClass.login(req, res));
router.post("/register", (req, res) => BasicClass.register(req, res));

module.exports = router;