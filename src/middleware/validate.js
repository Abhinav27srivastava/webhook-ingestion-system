const validate = schema => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);  // trying to validate the incoming json data

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.issues });
        }

        next();
    }
} // why are we using validating in middleware? 
// kyuki jab bhi hum webhook route pe request bhejte hai to hum chahte hai ki jo data hum receive kar rahe hai wo valid ho. 
// agar data invalid hai to hum usko process nahi karenge aur error response bhejenge. isliye hum validation middleware ka use karte hai.
// agar valid hai toh controller ke pass jaayega
module.exports = validate;
