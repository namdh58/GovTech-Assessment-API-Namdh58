import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import { Student } from '../entities/Student';
import { Teacher } from '../entities/Teacher';

/**
 * Seed script to initialize database with mock data
 * This script can be run independently using: npm run seed
 */
async function seedDatabase() {
    try {
        console.log('Initializing database connection...');
        await AppDataSource.initialize();
        console.log('Database connection established.');

        const teacherRepo = AppDataSource.getRepository(Teacher);
        const studentRepo = AppDataSource.getRepository(Student);

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
                await teacherRepo.save({ email, students: [] });
                console.log(`  ✓ Created teacher: ${email}`);
            } else {
                console.log(`  - Teacher already exists: ${email}`);
            }
        }

        console.log('\nSeeding Students...');
        for (const email of mockStudents) {
            const exists = await studentRepo.findOneBy({ email });
            if (!exists) {
                await studentRepo.save({ email });
                console.log(`  ✓ Created student: ${email}`);
            } else {
                console.log(`  - Student already exists: ${email}`);
            }
        }

        console.log('\nSeeding Relationships...');
        const teacherKen = await teacherRepo.findOne({
            where: { email: 'teacherken@gmail.com' },
            relations: ['students']
        });
        const teacherJoe = await teacherRepo.findOne({
            where: { email: 'teacherjoe@gmail.com' },
            relations: ['students']
        });

        if (teacherKen && teacherJoe) {
            // Helper to find student entities by email
            const findStudents = async (emails: string[]): Promise<Student[]> => {
                const students: Student[] = [];
                for (const email of emails) {
                    const student = await studentRepo.findOneBy({ email });
                    if (student) students.push(student);
                }
                return students;
            };

            const studentsForKen = await findStudents([
                'studentjon@gmail.com',
                'studenthon@gmail.com',
                'commonstudent1@gmail.com',
                'commonstudent2@gmail.com'
            ]);

            const studentsForJoe = await findStudents([
                'commonstudent1@gmail.com',
                'commonstudent2@gmail.com'
            ]);

            // Assign students to TeacherKen
            const existingKenEmails = new Set(teacherKen.students.map(s => s.email));
            let kenAdded = 0;
            for (const student of studentsForKen) {
                if (!existingKenEmails.has(student.email)) {
                    teacherKen.students.push(student);
                    existingKenEmails.add(student.email);
                    kenAdded++;
                }
            }
            await teacherRepo.save(teacherKen);
            console.log(`  ✓ Assigned ${kenAdded} students to teacherken@gmail.com`);

            // Assign students to TeacherJoe
            const existingJoeEmails = new Set(teacherJoe.students.map(s => s.email));
            let joeAdded = 0;
            for (const student of studentsForJoe) {
                if (!existingJoeEmails.has(student.email)) {
                    teacherJoe.students.push(student);
                    existingJoeEmails.add(student.email);
                    joeAdded++;
                }
            }
            await teacherRepo.save(teacherJoe);
            console.log(`  ✓ Assigned ${joeAdded} students to teacherjoe@gmail.com`);
        }

        console.log('\n✅ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Run the seed function
seedDatabase();
