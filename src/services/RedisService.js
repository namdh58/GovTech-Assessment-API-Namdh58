const redisClient = require('../config/redis');

class RedisService {
    constructor() {
        this.client = redisClient;
        this.isEnabled = !!redisClient;
    }

    async get(key) {
        if (!this.isEnabled) return null;
        return await this.client.get(key);
    }

    async set(key, value, ttlSeconds) {
        if (!this.isEnabled) return;
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key) {
        if (!this.isEnabled) return;
        await this.client.del(key);
    }

    async flushPattern(pattern) {
        if (!this.isEnabled) return;
        // Simple implementation for pattern deletion
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(keys);
        }
    }

    isRedisActive() {
        return this.isEnabled;
    }
}

module.exports = new RedisService();
