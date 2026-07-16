
const logger = require('../logger/logger');

const errorHandler = (err,req,res,next) =>{  // express automatically identifies this as an error middlerware because it has 4 parameters

    logger.error(err);   

    res.status(err.status || 500).json({
       
        success: false,
        message: err.message || "Internal server error"

    });

};

module.exports = errorHandler;