const deadletterqueue = require('../queue/deadletterqueue');
const webhookQueue = require('../queue/webhookQueue');
//GET /webhook/failed
const deadletterqueue = require("../queue/deadletterqueue");
const webhookQueue = require("../queue/webhookQueue");

// GET /webhook/failed
exports.getFailedJobs = async (req, res, next) => {
  try {
    const jobs = await deadletterqueue.getJobs([
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    ]);

    const failedJobs = jobs.map((job) => ({
      jobId: job.id,
      name: job.name,
      payload: job.data.payload,
      error: job.data.error,
      failedAt: job.data.failedAt,
    }));

    res.status(200).json({
      success: true,
      count: failedJobs.length,
      jobs: failedJobs,
    });
  } catch (err) {
    next(err);
  }
};

// POST /webhook/retry/:jobId
exports.retryFailedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await deadletterqueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found in DLQ",
      });
    }

    // Move job back to main queue
    await webhookQueue.add("process-webhook", job.data.payload);

    // Remove from DLQ
    await job.remove();

    res.status(200).json({
      success: true,
      message: "Job moved back to main queue",
    });
  } catch (err) {
    next(err);
  }
};