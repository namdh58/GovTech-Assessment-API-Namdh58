const AppDataSource = require('../config/data-source');

const StudentRepository = AppDataSource.getRepository('Student').extend({
    async findCommonStudents(teacherEmails) {
        const count = teacherEmails.length;

        return this.createQueryBuilder('student')
            .innerJoin('student.teachers', 'teacher')
            .where('teacher.email IN (:...teacherEmails)', { teacherEmails })
            .groupBy('student.email')
            .having('COUNT(DISTINCT teacher.email) = :count', { count })
            .select('student.email')
            .getMany();
    },

    async findRecipients(teacherEmail, mentions, isSuspended = false) {
        const qb = this.createQueryBuilder('student')
            .leftJoin('student.teachers', 'teacher')
            .where('student.isSuspended = :suspended', { suspended: isSuspended })
            .andWhere(
                '(teacher.email = :teacherEmail OR student.email IN (:...mentions))',
                { teacherEmail, mentions: mentions.length ? mentions : [''] }
            );

        return qb.getMany();
    },

    async findByEmails(emails) {
        if (!emails || emails.length === 0) return [];
        return this.find({
            where: emails.map(email => ({ email })),
            select: ['email']
        });
    }
});

module.exports = StudentRepository;
