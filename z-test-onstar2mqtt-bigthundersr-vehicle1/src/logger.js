const winston = require('winston');
const _ = require('lodash');

const logger = winston.createLogger({
    level: _.get(process, 'env.LOG_LEVEL', 'info'),
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf((info) => {
          const {
            timestamp, level, message, ...args
          } = info;
    
          const ts = timestamp.slice(0, 19).replace('T', ' ');
          return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        }),
          ),
    // format: winston.format.json(),
    transports: [new winston.transports.Console({stderrLevels: ['error']})]
})


module.exports = logger;