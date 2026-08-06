const express = require("express");
const router = express.Router();

const {
  getFailedJobs,
  retryFailedJob,
} = require("../controllers/dlqController");

// GET /webhook/failed
router.get("/failed", getFailedJobs);

// POST /webhook/retry/:jobId
router.post("/retry/:jobId", retryFailedJob);

module.exports = router;