const winston = require('winston');
const _ = require('lodash');

const logger = winston.createLogger({
    level: _.get(process, 'env.LOG_LEVEL', 'info'),
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.colorize({ all: true }),
        winston.format.simple()
    ),
    // format: winston.format.json(),
    transports: [new winston.transports.Console({stderrLevels: ['error']})]
    //transports: [new winston.transports.Console({ format: winston.format.colorize({all:true}), stderrLevels: ['error']})]
})


module.exports = logger;