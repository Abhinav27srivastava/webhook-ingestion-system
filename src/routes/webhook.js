// routes ka kaam itna hai req aayi usai controller ke pass bhej dena.
const express = require('express');
const router = express.Router();
const { receiveWebhook } = require('../controllers/webhookcontroller'); // Import the controller function   
const validate = require('../middleware/validate');
const webhookSchema = require('../validation/webhookSchema');


router.post('/',validate(webhookSchema), (req, res, next) => {
    console.log('Webhook route POST handler called');
    console.log('Request body:', req.body);
    next();
}, receiveWebhook); // Use the controller function to handle the POST request

module.exports = router;
// agar server.js me /webhook route pe request aati hai to ye router use karega aur ye router receiveWebhook function ko call karega jo ki webhookcontroller.js me defined hai.




