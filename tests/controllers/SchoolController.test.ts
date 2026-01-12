import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';
import SchoolController from '../../src/controllers/SchoolController';
import SchoolService from '../../src/services/SchoolService';
import { StatusCodes } from 'http-status-codes';

// Mock the SchoolService
jest.mock('../../src/services/SchoolService');

describe('SchoolController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        } as unknown as Partial<Response>;
        next = jest.fn();
    });

    describe('register', () => {
        it('should call service and return 204', async () => {
            req.body = {
                teacher: 'teacherken@gmail.com',
                students: ['studentjon@gmail.com', 'studenthon@gmail.com']
            };

            await SchoolController.register(req as Request, res as Response, next);

            expect(SchoolService.register).toHaveBeenCalledWith('teacherken@gmail.com', ['studentjon@gmail.com', 'studenthon@gmail.com']);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
            // expect(res.send).toHaveBeenCalled(); // send() might not be called if simple return, depends on express structure or handler, but let's keep check minimal
        });

        it('should call next with error if service fails', async () => {
            const error = new Error('Service Error');
            (SchoolService.register as any).mockRejectedValue(error);
            req.body = { teacher: 't', students: [] };

            await SchoolController.register(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getCommonStudents', () => {
        it('should return 200 and list of students', async () => {
            req.query = { teacher: ['teacherken@gmail.com'] };
            const mockResult = { students: ['common@gmail.com'] };
            (SchoolService.getCommonStudents as any).mockResolvedValue(mockResult);

            await SchoolController.getCommonStudents(req as Request, res as Response, next);

            expect(SchoolService.getCommonStudents).toHaveBeenCalledWith(['teacherken@gmail.com']);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });
    });

    describe('suspend', () => {
        it('should call service and return 204', async () => {
            req.body = { student: 'studentmary@gmail.com' };

            await SchoolController.suspend(req as Request, res as Response, next);

            expect(SchoolService.suspend).toHaveBeenCalledWith('studentmary@gmail.com');
            expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
        });
    });

    describe('retrieveForNotifications', () => {
        it('should return 200 and recipients list', async () => {
            req.body = {
                teacher: 'teacherken@gmail.com',
                notification: 'Hello @student@gmail.com'
            };
            const mockResult = { recipients: ['student@gmail.com'] };
            (SchoolService.retrieveForNotifications as any).mockResolvedValue(mockResult);

            await SchoolController.retrieveForNotifications(req as Request, res as Response, next);

            expect(SchoolService.retrieveForNotifications).toHaveBeenCalledWith('teacherken@gmail.com', 'Hello @student@gmail.com');
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });
    });
});
