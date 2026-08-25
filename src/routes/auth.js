const express = require("express");
const router = express.Router();

const { register } = require("../controllers/authcontroller");
const {login} = require("../controllers/authcontroller");
const { profile } = require("../controllers/authcontroller");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: User Registered Successfully
 *
 *       409:
 *         description: Email already exists
 *
 *       400:
 *         description: Validation Error
 */
router.post("/register", register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login User
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *
 *               password:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Login Successful
 *
 *       401:
 *         description: Invalid Credentials
 */
router.post("/login", login);
/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get User Profile
 *
 *     tags:
 *       - User
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: User Profile
 *
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, profile);
/**
 * @swagger
 * /auth/admin:
 *   get:
 *     summary: Admin Dashboard
 *
 *     tags:
 *       - Admin
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Welcome Admin
 *
 *       403:
 *         description: Forbidden
 */
router.get('/admin',authenticate,authorize('admin'),(req,res)=>{
    return res.status(200).json({
        success: true,
        message: "welcome  admin",
       
    });
});
module.exports = router;