const pool = require('../config/db');
const redisClient = require('../config/redis');
const logger = require('../logger/logger');


const healthCheck = async (req,res) =>{

  try {
    await pool.query("select 1") // check postgre
    const redisStatus = redisClient.isReady
      ? "connected"
      : "disconnected";

    if(!redisClient.isReady){
        return res.status(503).json({
            status: "unhealthy",
            databse: "connected",
            redis: "redisStatus"
        });
    }
      
    res.status(200).json({
        status: "healthy",
        databse: "connected",
        redis: "redisStatus",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
    }

  catch(err)
  {
   res.status(503).json({   // 503 means server is running but some dependecy is not availaible
    status: "unhealthy",
    database: "disconnected",
    redis : redisClient.isReady ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
   })
  }  
  
} ;

module.exports = {healthCheck};