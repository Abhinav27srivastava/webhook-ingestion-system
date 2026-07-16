const express = require('express');
const pool = require('../config/db');
const webhookQueue = require('../queue/webhookQueue');


const router = express.Router();



async function receiveWebhook(req, res, next) {   // await isliye use kiya hai kyuki hum database me data insert kar rahe hai aur ye asynchronous operation hai. await ka use karne se ye ensure hota hai ki jab tak database me data insert nahi ho jata, tab tak agla code execute nahi hoga. isse humko ye bhi pata chal jata hai ki data successfully insert hua ya nahi.
    // Handle the incoming webhook data
    // why are we using try catch block? kyuki jab hum database me data insert karte hai to kabhi kabhi error aa sakta hai jaise ki database connection issue, invalid data format, etc. agar ye error aata hai to humko pata chal jaye aur hum usko handle kar sake. isliye hum try catch block ka use karte hai.
    try {
        
        const payload = req.body;
       
        await pool.query('INSERT INTO webhook_events (payload) VALUES ($1)', [payload]); // jab sql ko node.js me execute krte hai then pool.query use krte hai.
       
        await webhookQueue.add('process-webhook', { payload } , {  // add()isme arrow nhi lagya
            
                 attempts : 3, // agar job fail hota hai to 3 baar retry karega
                 backoff : {
                    type : 'fixed',
                    delay : 5000, // 5 seconds
                 }
            
        });
        console.log("4");
        console.log('Webhook data inserted into database');
         console.log('Webhook received:', req.body);
         return res.status(200).json({ 
            success: true,
            message: 'Webhook received and queued successfully' });

    } catch (error) {
      next(error);
    }
 
};

module.exports ={ receiveWebhook};