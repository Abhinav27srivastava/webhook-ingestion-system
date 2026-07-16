const { Queue}  = require('bullmq'); 
// why dlq? because kyunki sometime temporaray issues hote hai databse down ho , email service down ho , etc ..
//  toh job ko retry karne ke baad bhi agar job fail ho jata hai toh woh job ko deadletter queue me dal dete hai taki hum usko later on process kar sake ..
const deadletterQueue = new Queue('deadletter-queue', {
    connection:  {
        host: "redis",
        port: 6379,
    }, // redis connection provide kar rahe hai
});   // deadletter queue dtore job even all retry attempts fail and job is moved to deadletter queue

module.exports = deadletterQueue;