import { MigrationInterface, QueryRunner } from "typeorm";
import { Student } from "../entities/Student";
import { Teacher } from "../entities/Teacher";

export class SeedInitialData1768188679817 implements MigrationInterface {
    name = 'SeedInitialData1768188679817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Use TypeORM queryRunner which is part of the migration transaction
        const teacherRepo = queryRunner.manager.getRepository(Teacher);
        const studentRepo = queryRunner.manager.getRepository(Student);

        // Mock Data Configuration
        const mockTeachers = [
            'teacherken@gmail.com',
            'teacherjoe@gmail.com'
        ];

        const mockStudents = [
            'studentjon@gmail.com',
            'studenthon@gmail.com',
            'commonstudent1@gmail.com',
            'commonstudent2@gmail.com',
            'studentmary@gmail.com'
        ];

        console.log('Seeding Teachers...');
        for (const email of mockTeachers) {
            const exists = await teacherRepo.findOneBy({ email });
            if (!exists) {
                // Must explicitly create instance or object that matches entity structure
                await teacherRepo.save({ email, students: [] });
            }
        }

        console.log('Seeding Students...');
        for (const email of mockStudents) {
            const exists = await studentRepo.findOneBy({ email });
            if (!exists) {
                await studentRepo.save({ email });
            }
        }

        console.log('Seeding Relationships...');
        const teacherKen = await teacherRepo.findOne({ where: { email: 'teacherken@gmail.com' }, relations: ['students'] });
        const teacherJoe = await teacherRepo.findOne({ where: { email: 'teacherjoe@gmail.com' }, relations: ['students'] });

        if (teacherKen && teacherJoe) {
            // Helper to find student entity by email within this transaction context
            const findStudentsCheck = async (emails: string[]) => {
                const students: Student[] = [];
                for (const e of emails) {
                    const s = await studentRepo.findOneBy({ email: e });
                    if (s) students.push(s);
                }
                return students;
            }

            const studentsForKey = await findStudentsCheck([
                'studentjon@gmail.com',
                'studenthon@gmail.com',
                'commonstudent1@gmail.com',
                'commonstudent2@gmail.com'
            ]);

            const studentsForJoe = await findStudentsCheck([
                'commonstudent1@gmail.com',
                'commonstudent2@gmail.com'
            ]);

            // Merge and deduplicate logic
            // TeacherKen
            const existingKenEmails = new Set(teacherKen.students.map(s => s.email));
            for (const s of studentsForKey) {
                if (!existingKenEmails.has(s.email)) {
                    teacherKen.students.push(s);
                    existingKenEmails.add(s.email);
                }
            }
            await teacherRepo.save(teacherKen);

            // TeacherJoe
            const existingJoeEmails = new Set(teacherJoe.students.map(s => s.email));
            for (const s of studentsForJoe) {
                if (!existingJoeEmails.has(s.email)) {
                    teacherJoe.students.push(s);
                    existingJoeEmails.add(s.email);
                }
            }
            await teacherRepo.save(teacherJoe);
        }

        console.log('Seeding Completed Successfully.');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Optional: Clean up seeded data
        // For production, you might not want to delete data in down(), but for dev it can be useful.
        // We will remove the exact data we added.
        const teacherRepo = queryRunner.manager.getRepository(Teacher);
        const studentRepo = queryRunner.manager.getRepository(Student);

        const mockTeachers = [
            'teacherken@gmail.com',
            'teacherjoe@gmail.com'
        ];

        await teacherRepo.delete(mockTeachers);

        const mockStudents = [
            'studentjon@gmail.com',
            'studenthon@gmail.com',
            'commonstudent1@gmail.com',
            'commonstudent2@gmail.com',
            'studentmary@gmail.com'
        ];

        await studentRepo.delete(mockStudents);
    }
}
