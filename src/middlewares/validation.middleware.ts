import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validate = (schema: Joi.Schema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        // eslint-disable-next-line security/detect-object-injection
        const data = req[source];
        const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

        if (error) {
            const message = error.details.map(x => x.message).join(', ');
            const err: any = new Error(message);
            err.statusCode = 400;
            return next(err);
        }

        if (source === 'query' || source === 'params') {
            Object.defineProperty(req, source, {
                value: value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        } else {
            req[source] = value;
        }
        next();
    };
};

export default validate;
