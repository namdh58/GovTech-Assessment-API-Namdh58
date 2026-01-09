const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            // DTO validation error
            const message = error.details.map(x => x.message).join(', ');
            // Pass to global error handler
            const err = new Error(message);
            err.statusCode = 400;
            return next(err);
        }

        // Replace req.body with validated value (coerced types etc)
        req.body = value;
        next();
    };
};

module.exports = validate;
