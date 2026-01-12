import { AppDataSource } from '../config/data-source';
import { Student } from '../entities/Student';

export const StudentRepository = AppDataSource.getRepository(Student).extend({
    async findCommonStudents(teacherEmails: string[]): Promise<Student[]> {
        const count = teacherEmails.length;

        return this.createQueryBuilder('student')
            .innerJoin('student.teachers', 'teacher')
            .where('teacher.email IN (:...teacherEmails)', { teacherEmails })
            .groupBy('student.email')
            .having('COUNT(DISTINCT teacher.email) = :count', { count })
            .select('student.email')
            .getMany();
    },

    async findRecipients(teacherEmail: string, mentions: string[], isSuspended = false): Promise<Student[]> {
        const qb = this.createQueryBuilder('student')
            .leftJoin('student.teachers', 'teacher')
            .where('student.isSuspended = :suspended', { suspended: isSuspended })
            .andWhere(
                '(teacher.email = :teacherEmail OR student.email IN (:...mentions))',
                { teacherEmail, mentions: mentions.length ? mentions : [''] }
            );

        return qb.getMany();
    },

    async findByEmails(emails: string[]): Promise<Student[]> {
        if (!emails || emails.length === 0) return [];
        // Using mapping to emulate OR conditions if needed, 
        // but standard In(...) is better if exact match.
        // However, existing code used mapping in where clause which TypeORM supports for OR checks on objects
        return this.find({
            where: emails.map(email => ({ email })),
            select: ['email'] // In TypeORM 0.3 select should be object or array of keys if Entity uses it
        });
    }
});
