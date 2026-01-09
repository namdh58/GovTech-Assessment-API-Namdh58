const express = require('express');
const router = express.Router();
const SchoolController = require('../controllers/SchoolController');
const ApiKeyController = require('../controllers/ApiKeyController');
const validate = require('../middlewares/validation.middleware');
const { registerDto, suspendDto, notificationDto } = require('../dtos/school.dto');
const authMiddleware = require('../middlewares/auth.middleware');

// Public
router.get('/generate-key', ApiKeyController.generateKey);

// Protected
router.use(authMiddleware);

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
