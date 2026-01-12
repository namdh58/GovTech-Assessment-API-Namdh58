import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/exceptions';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({ message });
};
