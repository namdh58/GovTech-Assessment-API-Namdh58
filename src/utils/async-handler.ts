import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any) =>
    (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(fn(req, res, next))
            .then((result) => {
                if (result !== undefined) {
                    if (result && typeof result === 'object' && 'statusCode' in result) {
                        if (result.statusCode === StatusCodes.NO_CONTENT) {
                            return res.status(StatusCodes.NO_CONTENT).send();
                        }
                        return res.status(result.statusCode).json(result.data || {});
                    }

                    // Default Success
                    res.status(StatusCodes.OK).json(result);
                }
            })
            .catch(next);
    };

export default asyncHandler;
