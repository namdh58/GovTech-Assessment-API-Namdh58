import Joi from 'joi';

export const registerDto = Joi.object({
    teacher: Joi.string().email().required(),
    students: Joi.array().items(Joi.string().email()).min(1).required()
});

export const commonStudentsDto = Joi.object({
    teacher: Joi.array().items(Joi.string().email()).single().required()
});

export const suspendDto = Joi.object({
    student: Joi.string().email().required()
});

export const notificationDto = Joi.object({
    teacher: Joi.string().email().required(),
    notification: Joi.string().required()
});

export interface RegisterRequest {
    teacher: string;
    students: string[];
}

export interface SuspendRequest {
    student: string;
}

export interface NotificationRequest {
    teacher: string;
    notification: string;
}

export interface CommonStudentsRequest {
    teacher: string[];
}
