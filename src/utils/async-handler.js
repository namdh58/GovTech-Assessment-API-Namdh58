const { StatusCodes } = require('http-status-codes');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .then((result) => {
            if (result !== undefined) {
                if (result && result.statusCode) {
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

module.exports = asyncHandler;
