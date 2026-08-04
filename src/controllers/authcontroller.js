const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const registerSchema = require("../validation/authSchema");
const loginSchema = require("../validation/authSchema");
const register = async (req, res) => {
    try {
        // Validate request body
        const validatedData = registerSchema.parse(req.body); // 

        const { username, email, password } = validatedData; // why a

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1", 
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const result = await pool.query(
            `INSERT INTO users(username, email, password)
             VALUES($1, $2, $3)
             RETURNING id, username, email, created_at`,
            [username, email, hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {

        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                errors: error.errors
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
const login = async (req, res) => {
    try {

        // Validate request
        const validatedData = loginSchema.parse(req.body);

        const { email, password } = validatedData;

        // Find user by email
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        // Check if user exists
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {

        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                errors: error.errors
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    register,
    login
};






