import express from 'express';
import SchoolController from '../controllers/SchoolController';
import validate from '../middlewares/validation.middleware';
import { registerDto, suspendDto, notificationDto, commonStudentsDto } from '../dtos/school.dto';

const router = express.Router();

router.post(
    '/register',
    validate(registerDto),
    SchoolController.register
);

router.get(
    '/commonstudents',
    validate(commonStudentsDto, 'query'),
    SchoolController.getCommonStudents
);

router.post(
    '/suspend',
    validate(suspendDto),
    SchoolController.suspend
);

router.post(
    '/retrievefornotifications',
    validate(notificationDto),
    SchoolController.retrieveForNotifications
);

export default router;
