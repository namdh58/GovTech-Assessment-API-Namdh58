const RedisService = require('../services/RedisService');
const { UnauthorizedError } = require('../utils/exceptions');
const asyncHandler = require('../utils/async-handler');

const authMiddleware = asyncHandler(async (req, res, next) => {
    // If Redis is disabled, skip auth
    if (!RedisService.isRedisActive()) {
        return next();
    }

    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        throw new UnauthorizedError('Missing API Key');
    }

    const isValid = await RedisService.get(`apikey:${apiKey}`);
    if (!isValid) {
        throw new UnauthorizedError('Invalid or Expired API Key');
    }

    next();
});

module.exports = authMiddleware;
