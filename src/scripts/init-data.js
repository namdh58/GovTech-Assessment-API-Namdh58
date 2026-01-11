const mysql = require('mysql2/promise');
require('dotenv').config();
const AppDataSource = require('../config/data-source');
const { StudentRepository, TeacherRepository } = require('../repositories');

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

const seedData = async (dataSource) => {
    const studentRepo = dataSource.getRepository('Student');
    const teacherRepo = dataSource.getRepository('Teacher');

    console.log('Seeding Teachers...');
    for (const email of mockTeachers) {
        const exists = await teacherRepo.findOneBy({ email });
        if (!exists) {
            await teacherRepo.save({ email });
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
        const studentsForKey = await studentRepo.find({
            where: [
                { email: 'studentjon@gmail.com' },
                { email: 'studenthon@gmail.com' },
                { email: 'commonstudent1@gmail.com' },
                { email: 'commonstudent2@gmail.com' }
            ]
        });

        const studentsForJoe = await studentRepo.find({
            where: [
                { email: 'commonstudent1@gmail.com' },
                { email: 'commonstudent2@gmail.com' }
            ]
        });

        teacherKen.students = [...teacherKen.students, ...studentsForKey];
        teacherKen.students = [...new Set(teacherKen.students.map(s => s.email))].map(email => studentsForKey.find(s => s.email === email) || teacherKen.students.find(s => s.email === email));
        await teacherRepo.save(teacherKen);

        teacherJoe.students = [...teacherJoe.students, ...studentsForJoe];
        teacherJoe.students = [...new Set(teacherJoe.students.map(s => s.email))].map(email => studentsForJoe.find(s => s.email === email) || teacherJoe.students.find(s => s.email === email));
        await teacherRepo.save(teacherJoe);
    }

    console.log('Seeding Completed Successfully.');
};

const createDbAndSeed = async () => {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;
    const dbName = DB_NAME || 'school_admin';

    const connection = await mysql.createConnection({
        host: DB_HOST || 'localhost',
        port: DB_PORT || 3306,
        user: DB_USER || 'root',
        password: DB_PASSWORD || 'root'
    });

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        console.log(`Database '${dbName}' created (or exists).`);
    } catch (err) {
        console.error('Failed to create database:', err.message);
        process.exit(1);
    } finally {
        await connection.end();
    }

    try {
        await AppDataSource.initialize();
        await seedData(AppDataSource);
    } catch (err) {
        console.error('Seeding Failed:', err);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
};

if (require.main === module) {
    createDbAndSeed();
}

module.exports = { seedData };
