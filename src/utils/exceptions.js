const { StatusCodes } = require('http-status-codes');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource Not Found') {
        super(message, StatusCodes.NOT_FOUND);
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
        super(message, StatusCodes.BAD_REQUEST);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, StatusCodes.UNAUTHORIZED);
    }
}

class ServiceUnavailableError extends AppError {
    constructor(message = 'Service Unavailable') {
        super(message, StatusCodes.SERVICE_UNAVAILABLE);
    }
}

module.exports = {
    AppError,
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ServiceUnavailableError
};
