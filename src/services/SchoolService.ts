import { StudentRepository } from '../repositories/StudentRepository';
import { TeacherRepository } from '../repositories/TeacherRepository';
import { AppDataSource } from '../config/data-source';
import { NotFoundError, BadRequestError } from '../utils/exceptions';
import { REGEX } from '../utils/constants';
import { Teacher } from '../entities/Teacher';
import { Student } from '../entities/Student';
import { In } from 'typeorm';
import { extractEmails } from '../utils/helpers';

class SchoolService {
    async register(teacherEmail: string, studentEmails: string[]): Promise<void> {
        // Deduplicate input emails
        const uniqueStudentEmails = [...new Set(studentEmails)];

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const teacher = await queryRunner.manager.findOne(Teacher, {
                where: { email: teacherEmail },
                relations: ['students']
            });

            if (!teacher) {
                throw new NotFoundError('Teacher Not Found');
            }

            // 1. Batch find existing students
            const existingStudents = await queryRunner.manager.findBy(Student, {
                email: In(uniqueStudentEmails)
            });
            const existingStudentEmails = new Set(existingStudents.map(s => s.email));

            // 2. Filter new students and batch insert
            const newStudentEmails = uniqueStudentEmails.filter(email => !existingStudentEmails.has(email));

            if (newStudentEmails.length > 0) {
                await queryRunner.manager.insert(Student,
                    newStudentEmails.map(email => ({ email }))
                );
            }

            // 3. To avoid duplicate entry errors in the join table (teacher_students),
            // we find which of these students are ALREADY linked to this teacher.
            const teacherWithExistingStudents = await queryRunner.manager.createQueryBuilder(Teacher, 'teacher')
                .leftJoinAndSelect('teacher.students', 'student')
                .where('teacher.email = :teacherEmail', { teacherEmail })
                .andWhere('student.email IN (:...studentEmails)', { studentEmails: uniqueStudentEmails })
                .getOne();

            const linkedStudentEmails = new Set(teacherWithExistingStudents?.students.map(s => s.email) || []);

            // 4. Filter out students who are already linked
            const studentsToLink = uniqueStudentEmails.filter(email => !linkedStudentEmails.has(email));

            // 5. Batch add relationships
            if (studentsToLink.length > 0) {
                await queryRunner.manager.createQueryBuilder()
                    .relation(Teacher, 'students')
                    .of(teacher)
                    .add(studentsToLink);
            }

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getCommonStudents(teachers: string[]): Promise<{ students: string[] }> {
        const uniqueTeachers = [...new Set(teachers)];
        const existingTeachers = await TeacherRepository.findByEmails(uniqueTeachers);
        const existingEmails = existingTeachers.map(t => t.email);
        const missingTeachers = uniqueTeachers.filter(email => !existingEmails.includes(email));

        if (missingTeachers.length > 0) {
            throw new NotFoundError(`Teachers not found: ${missingTeachers.join(', ')}`);
        }

        const students = await StudentRepository.findCommonStudents(uniqueTeachers);
        return { students: students.map(s => s.email) };
    }

    async suspend(studentEmail: string): Promise<void> {
        const student = await StudentRepository.findOneBy({ email: studentEmail });

        if (!student) {
            throw new NotFoundError('Student Not Found');
        }
        if (student.isSuspended) {
            throw new BadRequestError('Student is already suspended');
        }

        await StudentRepository.update({ email: studentEmail }, { isSuspended: true });
    }

    async retrieveForNotifications(teacherEmail: string, notificationText: string): Promise<{ recipients: string[]; studentNotFound?: string[] }> {
        const mentions = extractEmails(notificationText);
        const uniqueMentions = [...new Set(mentions)];

        const recipients = await StudentRepository.findRecipients(teacherEmail, uniqueMentions);
        const uniqueRecipients = new Set(recipients.map(s => s.email));

        let studentNotFound: string[] = [];
        if (uniqueMentions.length > 0) {
            // Check which mentions exist
            const existingMentions = await StudentRepository.findByEmails(uniqueMentions);
            const existingEmails = new Set(existingMentions.map(s => s.email));
            // Filter mentions that are NOT in existingEmails
            studentNotFound = [...new Set(uniqueMentions.filter(email => !existingEmails.has(email)))];
        }

        return {
            recipients: Array.from(uniqueRecipients),
            ...(studentNotFound.length > 0 ? { studentNotFound } : { studentNotFound: [] })
        };
    }
}

export default new SchoolService();
