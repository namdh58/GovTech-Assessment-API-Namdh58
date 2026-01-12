import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: async (req: any, res: any) => {
        return { message: "Too many requests, please try again later." };
    }, // Types for 'message' in express/rate-limit have varied, but this matches usage.
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

export default limiter;
