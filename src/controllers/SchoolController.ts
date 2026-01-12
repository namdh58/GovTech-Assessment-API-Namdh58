import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import SchoolService from '../services/SchoolService';
import asyncHandler from '../utils/async-handler';
import { RegisterRequest, SuspendRequest, NotificationRequest, CommonStudentsRequest } from '../dtos/school.dto';

class SchoolController {

    register = asyncHandler(async (req: Request, res: Response) => {
        const body = req.body as RegisterRequest;
        await SchoolService.register(body.teacher, body.students);
        return { statusCode: StatusCodes.NO_CONTENT };
    });

    getCommonStudents = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as unknown as CommonStudentsRequest;
        const result = await SchoolService.getCommonStudents(query.teacher);
        return { statusCode: StatusCodes.OK, data: result };
    });

    suspend = asyncHandler(async (req: Request, res: Response) => {
        const body = req.body as SuspendRequest;
        await SchoolService.suspend(body.student);
        return { statusCode: StatusCodes.NO_CONTENT };
    });

    retrieveForNotifications = asyncHandler(async (req: Request, res: Response) => {
        const body = req.body as NotificationRequest;
        const result = await SchoolService.retrieveForNotifications(body.teacher, body.notification);
        return { statusCode: StatusCodes.OK, data: result };
    });
}

export default new SchoolController();
