const Joi = require('joi');

const registerDto = Joi.object({
    teacher: Joi.string().email().required(),
    students: Joi.array().items(Joi.string().email()).min(1).required()
});

const suspendDto = Joi.object({
    student: Joi.string().email().required()
});

const notificationDto = Joi.object({
    teacher: Joi.string().email().required(),
    notification: Joi.string().required()
});

module.exports = {
    registerDto,
    suspendDto,
    notificationDto
};
