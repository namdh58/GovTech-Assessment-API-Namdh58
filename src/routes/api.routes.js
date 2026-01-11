const express = require('express');
const router = express.Router();
const SchoolController = require('../controllers/SchoolController');
const SeedController = require('../controllers/SeedController');
const validate = require('../middlewares/validation.middleware');
const { registerDto, suspendDto, notificationDto } = require('../dtos/school.dto');

router.post('/init-data', SeedController.seed);

router.post(
    '/register',
    validate(registerDto),
    SchoolController.register);
router.get(
    '/commonstudents',
    SchoolController.getCommonStudents);
router.post(
    '/suspend',
    validate(suspendDto),
    SchoolController.suspend);
router.post(
    '/retrievefornotifications',
    validate(notificationDto),
    SchoolController.retrieveForNotifications
);

module.exports = router;
