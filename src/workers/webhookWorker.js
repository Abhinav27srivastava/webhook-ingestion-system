const { Worker } = require('bullmq'); // use Worker class from bullmq
const deadletterqueue = require('../queue/deadletterqueue');
const pool =require('../config/db');
// helper fucntion to process the jobs in the queue it pauses the job to the worker and the worker will process the job and return the result
function sleep(ms = 5000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// 
const worker = new Worker(
  'webhook-queue',
  async (job) => {
     const{webhookEventId,
            eventId,
            payload,
        } = job.data;  // initially job.data contain payload

    console.log("job_id:", job.id);
    console.log("job_name:", job.name);
    console.log("job_data:", job.data);
    console.log('Processing webhook job:');
   
   
   // mark event as processing
    await pool.query(
      `
       UPDATE webhook_events
       SET status ='processing'
       WHERE id =$1 `, [webhookEventId]
    );
  // after processed if we have error create then... so we are going to use try and catch for this..
   try{
    console.log(`Processing webhook event ${eventId}`);

    // If processing succeeds:
            await pool.query(
                `
                UPDATE webhook_events
                SET status = 'processed'
                WHERE id = $1
                `,
                [webhookEventId]
            );
              console.log(
                `Webhook event ${webhookEventId} processed successfully`
            );
    return {
      success:true,
      webhookEventId,
      eventId
    };
  
  } catch (error) {
            // Mark current attempt as failed
            await pool.query(
                `
                UPDATE webhook_events
                SET status = 'failed'
                WHERE id = $1
                `,
                [webhookEventId]
            );

            throw error;
        }
    },
  {
    connection: {   // why this connection is needed because we are using redis to store the jobs in the queue and the worker needs to connect to redis to get the jobs from the queue
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
    concurrency: 5, // how many jobs can be processed in parallel by the worker
  }
);

worker.on('failed', async (job,err)=>{
    console.log(`Job ${job.id} failed with error ${err.message}`);
    // move the failed job to dead letter queue
    await deadletterqueue.add('failed-job',{
        payload: job.data,
        jobid: job.id,
        error: err.message,
        failedAt: new Date().toISOString()
    });
});
console.log("Worker is working");



// ab jo wroker ko alag terminal pe run karenge kyunki woh process kr rha job ko ..
// server,js woh request ko receive kr rha hai aur database me insert kr rha hai aur job ko queue me dal rha hai .. worker woh job ko process kr rha hai .. isliye alag terminal pe run karenge ..
