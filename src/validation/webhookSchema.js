const { z } = require('zod');  // webhookschema will check request is valid or invalid

const webhookSchema = z.object({
// schema format will change according to api request format 
    name: z.string().trim().min(1, { message: "Name is required" }),  //.min(1) means no empty string allowed. { message: "Name is required" } means if name is empty then show this message
    last_name: z.string().trim().min(1, { message: "Last name is required" }),
    roll_no: z.string().trim().min(1, { message: "Roll number is required" }),
    email: z.string().trim().email({ message: "Invalid email address" }),


});


module.exports = webhookSchema;
 // isko router mai import karenge 
 