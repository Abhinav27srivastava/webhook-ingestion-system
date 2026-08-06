const {ExpressAdapter} = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { Queue } = require('bullmq');
const { redisClient } = require('../config/redis');

const webhookQueue = require('../queues/webhookQueue');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(webhookQueue)],
  serverAdapter: serverAdapter,
});
module.exports = serverAdapter.getRouter();