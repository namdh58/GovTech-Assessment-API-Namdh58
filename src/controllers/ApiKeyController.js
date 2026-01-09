const RedisService = require('../services/RedisService');
const { v4: uuidv4 } = require('uuid');
const { ServiceUnavailableError } = require('../utils/exceptions');
const { StatusCodes } = require('http-status-codes');

const asyncHandler = require('../utils/async-handler');

class ApiKeyController {
    generateKey = asyncHandler(async (req, res) => {
        if (!RedisService.isRedisActive()) {
            throw new ServiceUnavailableError("Redis not enabled, cannot generate API Key");
        }

        // Check for existing key in "current_api_key"
        let apiKey = await RedisService.get('current_api_key');
        if (!apiKey) {
            apiKey = uuidv4();
            await RedisService.set('current_api_key', apiKey, 86400); // 1 day
            await RedisService.set(`apikey:${apiKey}`, 'valid', 86400);
        }

        return { statusCode: StatusCodes.OK, data: { apiKey } };
    })
}

module.exports = new ApiKeyController();
