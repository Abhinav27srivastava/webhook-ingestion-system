const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { registerSchema } = require("../validation/authSchema");

const register = async (req, res) => {
    try {
        // Validate request body
        const validatedData = registerSchema.parse(req.body); // 

        const { name, email, password } = validatedData;

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
            `INSERT INTO users(name, email, password)
             VALUES($1, $2, $3)
             RETURNING id, username, email, created_at`,
            [name, email, hashedPassword]
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

module.exports = {
    register
};