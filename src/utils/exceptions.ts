import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource Not Found') {
        super(message, StatusCodes.NOT_FOUND);
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, StatusCodes.BAD_REQUEST);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, StatusCodes.UNAUTHORIZED);
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message = 'Service Unavailable') {
        super(message, StatusCodes.SERVICE_UNAVAILABLE);
    }
}
