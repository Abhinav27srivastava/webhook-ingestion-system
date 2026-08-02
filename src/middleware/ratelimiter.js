const rateLimit = require("express-rate-limit");
const logger = require('../logger/logger');

const rateLimiter = rateLimit({
    windowMs: 60*1000,
    max: 100,

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req , res) =>{
     
    logger.warn(`rate limit exceeded for IP's ${req.ip}`)
    return res.status(429).json({
        success: false,
        message: "Too many request. please try again"

    });
    }
  
});
module.exports = rateLimiter;