const SchoolService = require('../services/SchoolService');
const { StatusCodes } = require('http-status-codes');

const asyncHandler = require('../utils/async-handler');

class SchoolController {

    register = asyncHandler(async (req, res) => {
        await SchoolService.register(req.body.teacher, req.body.students);
        return { statusCode: StatusCodes.NO_CONTENT };
    })

    getCommonStudents = asyncHandler(async (req, res) => {
        const teachers = req.query.teacher;
        const teacherList = Array.isArray(teachers) ? teachers : [teachers];

        const result = await SchoolService.getCommonStudents(teacherList);
        return { statusCode: StatusCodes.OK, data: result };
    })

    suspend = asyncHandler(async (req, res) => {
        await SchoolService.suspend(req.body.student);
        return { statusCode: StatusCodes.NO_CONTENT };
    })

    retrieveForNotifications = asyncHandler(async (req, res) => {
        const result = await SchoolService.retrieveForNotifications(req.body.teacher, req.body.notification);
        return { statusCode: StatusCodes.OK, data: result };
    })
}

module.exports = new SchoolController();
