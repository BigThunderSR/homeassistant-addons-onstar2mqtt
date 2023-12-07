const winston = require('winston');
const _ = require('lodash');

function stringify(obj) {
    let cache = [];
    let str = JSON.stringify(obj, function(key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    cache = null; // reset the cache
    return str;
  }

const logger = winston.createLogger({
    level: _.get(process, 'env.LOG_LEVEL', 'info'),
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.align(),
        winston.format.printf((info) => {
          const {
            timestamp, level, message, ...args
          } = info;
    
          //const ts = timestamp.slice(0, 19).replace('T', ' ');
          const ts = timestamp
          return `${ts} [${level}]: ${message} ${Object.keys(args).length ? stringify(args, null, 2) : ''}`;
        }),
          ),
    // format: winston.format.json(),
    transports: [new winston.transports.Console({stderrLevels: ['error']})]
})


module.exports = logger;