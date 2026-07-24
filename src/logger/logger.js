const pino = require('pino'); // what is pino ? 

const logger = pino({               // create one logger object and export it so that we can use it anywhere in the project
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,      // make the terminal output colorful
            levelFirst: true,    // show the log level first in the output
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname' // ignore pid and hostname in the output
        }
    }
});
module.exports = logger;