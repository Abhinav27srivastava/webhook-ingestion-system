const { Worker } = require('bullmq');
const dlqworker = new Worker('deadletter-queue', async (job) => {
    // Process failed jobs from the dead letter queue
    console.log("prcessing failed job from dead letter queue");
    console.log(`Processing failed job ${job.id}:`, job.data);


        // In future:
        // Send Email Again
        // Generate PDF Again
        // Call API Again
   console.log("Failed job processed successfully");
},
{ connection:{
    host : 'redis',
    port :6379,
}

});
console.log("dlqworker is working");