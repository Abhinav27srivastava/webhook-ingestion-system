const { z } = require('zod');

const registerSchema = z.object({
  username: z.string().min(8, { message: 'Username must be at least 8 characters long' }).max(100, { message: 'Username must be at most 100 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});


const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
});

module.exports = {
    registerSchema,
    loginSchema
};