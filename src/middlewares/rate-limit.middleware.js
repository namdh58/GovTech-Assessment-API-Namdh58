const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: async (req, res) => {
        return { message: "Too many requests, please try again later." };
    },
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

module.exports = limiter;
