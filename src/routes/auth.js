const express = require("express");
const router = express.Router();

const { register } = require("../controllers/authcontroller");
const {login} = require("../controllers/authcontroller");
const { profile } = require("../controllers/authcontroller");
const authenticate = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get('/profile', authenticate, profile);
module.exports = router;