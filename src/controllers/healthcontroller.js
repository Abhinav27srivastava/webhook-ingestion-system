const pool = require('../config/db');



const healthCheck = async (req,res) =>{

  try {
    await pool.query("select 1")
    res.status(200).json({
        status: "healthy",
        databse: "connected"
    });
    }

  catch(err)
  {
   res.status(503).json({   // 503 means server is running but some dependecy is not availaible
    status: "unhealthy",
    database: "disconnected"
   })
  }  
  
} ;

module.exports = {healthCheck};