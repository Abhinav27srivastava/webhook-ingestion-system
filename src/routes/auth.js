const express = require("express");
const router = express.Router();

const { register } = require("../controllers/authcontroller");
const {login} = require("../controllers/authcontroller");
const { profile } = require("../controllers/authcontroller");
const authenticate = require("../middleware/authMiddleware");
const {authorize} = require("../middleware/authorize");

router.post("/register", register);
router.post("/login", login);
router.get('/profile', authenticate, profile);
router.get('/admin',authenticate,authorize('admin'),(req,res)=>{
    return res.status(200).json({
        success: true,
        message: "welcome  admin",
       
    });
});
module.exports = router;