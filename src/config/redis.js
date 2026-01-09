const Redis = require('ioredis');
require('dotenv').config();

let redisClient = null;

if (process.env.IS_REDIS_ENABLE === 'true') {
    redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        // Add logic to handle connection errors gracefully if optional
        retryStrategy: (times) => {
            // If redis is down, we don't want to crash.
            // But ioredis retries by default.
            return Math.min(times * 50, 2000);
        }
    });

    redisClient.on('error', (err) => {
        console.error('Redis Error:', err);
    });
}

module.exports = redisClient;
