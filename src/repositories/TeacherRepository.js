const AppDataSource = require('../config/data-source');

const TeacherRepository = AppDataSource.getRepository('Teacher').extend({
    async findByEmails(emails) {
        return this.createQueryBuilder('teacher')
            .where('teacher.email IN (:...emails)', { emails })
            .select(['teacher.email'])
            .getMany();
    }
});

module.exports = TeacherRepository;
