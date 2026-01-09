const { StudentRepository, TeacherRepository } = require('../repositories');
const AppDataSource = require('../config/data-source');
const { NotFoundError, BadRequestError } = require('../utils/exceptions');
const { REGEX } = require('../utils/constants');

class SchoolService {
    async register(teacherEmail, studentEmails) {
        // Transactional consistency
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Ensure teacher exists or create
            let teacher = await queryRunner.manager.findOneBy('Teacher', { email: teacherEmail });
            if (!teacher) {
                teacher = queryRunner.manager.create('Teacher', { email: teacherEmail });

                await queryRunner.manager.save('Teacher', teacher);
            }

            for (const email of studentEmails) {
                let student = await queryRunner.manager.findOneBy('Student', { email });
                if (!student) {
                    student = queryRunner.manager.create('Student', { email });
                    await queryRunner.manager.save('Student', student);
                }

                await queryRunner.manager.createQueryBuilder()
                    .relation('Teacher', 'students')
                    .of(teacher)
                    .add(student)
                    .catch(() => { });
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getCommonStudents(teachers) {
        // Check if all teachers exist
        const existingTeachers = await TeacherRepository.findByEmails(teachers);

        const existingEmails = existingTeachers.map(t => t.email);
        const missingTeachers = teachers.filter(email => !existingEmails.includes(email));

        if (missingTeachers.length > 0) {
            throw new NotFoundError(`Teachers not found: ${missingTeachers.join(', ')}`);
        }

        // Using Repository
        const students = await StudentRepository.findCommonStudents(teachers);

        const result = { students: students.map(s => s.email) };

        return result;
    }

    async suspend(studentEmail) {
        let student = await StudentRepository.findOneBy({ email: studentEmail });
        if (!student) {
            throw new NotFoundError('Student Not Found');
        }
        if (student.isSuspended) {
            throw new BadRequestError('Student is already suspended');
        }
        student.isSuspended = true;
        await StudentRepository.save(student);
    }

    async retrieveForNotifications(teacherEmail, notificationText) {
        const mentionRegex = REGEX.MENTION;
        const mentions = [];
        let match;
        while ((match = mentionRegex.exec(notificationText)) !== null) {
            mentions.push(match[1]);
        }

        const recipients = await StudentRepository.findRecipients(teacherEmail, mentions);
        const uniqueRecipients = new Set(recipients.map(s => s.email));

        // valid mentions calculation
        let studentNotFound = [];
        if (mentions.length > 0) {
            const existingMentions = await StudentRepository.findByEmails(mentions);
            const existingEmails = new Set(existingMentions.map(s => s.email));
            studentNotFound = [...new Set(mentions.filter(email => !existingEmails.has(email)))];
        }

        return {
            recipients: Array.from(uniqueRecipients),
            studentNotFound
        };
    }
}

module.exports = new SchoolService();
