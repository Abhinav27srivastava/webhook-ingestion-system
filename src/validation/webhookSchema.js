const { z } = require('zod');  // webhookschema will check request is valid or invalid

const webhookSchema = z.object({
// schema format will change according to api request format 
   id: z.string().min(1,"Event id is required"),  //.min(1) means no empty string allowed. { message: "Name is required" } means if name is empty then show this message
   type: z.string().min(1,"Event type is required"),
   timestamp: z.number().int().positive('timestamp should be positive integer'),
   data: z.unknown(),

});


module.exports = webhookSchema;
 // isko router mai import karenge 
 