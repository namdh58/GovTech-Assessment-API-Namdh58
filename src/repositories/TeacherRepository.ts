import { AppDataSource } from '../config/data-source';
import { Teacher } from '../entities/Teacher';

export const TeacherRepository = AppDataSource.getRepository(Teacher).extend({
    async findByEmails(emails: string[]): Promise<Teacher[]> {
        return this.createQueryBuilder('teacher')
            .where('teacher.email IN (:...emails)', { emails })
            .select(['teacher.email'])
            .getMany();
    }
});
