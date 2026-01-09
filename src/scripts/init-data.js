const mysql = require('mysql2/promise');
require('dotenv').config();
const AppDataSource = require('./src/config/data-source');
const { StudentRepository, TeacherRepository } = require('./src/repositories');

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

const createDbAndSeed = async () => {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;
    const dbName = DB_NAME || 'school_admin';

    // Step 1: Create Database if not exists
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

    // Step 2: Initialize TypeORM and Seed Data
    try {
        await AppDataSource.initialize();
        console.log('DataSource initialized.');

        // Verify Schema Sync (TypeORMize handles this with synchronize: true in config)

        // Seed Teachers
        console.log('Seeding Teachers...');
        for (const email of mockTeachers) {
            const exists = await TeacherRepository.findOneBy({ email });
            if (!exists) {
                await TeacherRepository.save({ email });
            }
        }

        // Seed Students
        console.log('Seeding Students...');
        for (const email of mockStudents) {
            const exists = await StudentRepository.findOneBy({ email });
            if (!exists) {
                await StudentRepository.save({ email });
            }
        }

        // Seed Relationships
        console.log('Seeding Relationships...');
        // Ken has Jon, Hon, Common1, Common2
        // Joe has Common1, Common2

        const teacherKen = await TeacherRepository.findOne({ where: { email: 'teacherken@gmail.com' }, relations: ['students'] });
        const teacherJoe = await TeacherRepository.findOne({ where: { email: 'teacherjoe@gmail.com' }, relations: ['students'] });

        const studentsForKey = await StudentRepository.find({
            where: [
                { email: 'studentjon@gmail.com' },
                { email: 'studenthon@gmail.com' },
                { email: 'commonstudent1@gmail.com' },
                { email: 'commonstudent2@gmail.com' }
            ]
        });

        const studentsForJoe = await StudentRepository.find({
            where: [
                { email: 'commonstudent1@gmail.com' },
                { email: 'commonstudent2@gmail.com' }
            ]
        });

        // Add students to teachers
        // Note: In ManyToMany, adding to the array and saving the owner side (Teacher) works if cascade is true
        // Teacher entity has cascade: true on students.

        teacherKen.students = [...teacherKen.students, ...studentsForKey];
        // Deduplicate just in case
        teacherKen.students = [...new Set(teacherKen.students.map(s => s.email))].map(email => studentsForKey.find(s => s.email === email) || teacherKen.students.find(s => s.email === email));

        await TeacherRepository.save(teacherKen);

        teacherJoe.students = [...teacherJoe.students, ...studentsForJoe];
        teacherJoe.students = [...new Set(teacherJoe.students.map(s => s.email))].map(email => studentsForJoe.find(s => s.email === email) || teacherJoe.students.find(s => s.email === email));

        await TeacherRepository.save(teacherJoe);

        console.log('Seeding Completed Successfully.');

    } catch (err) {
        console.error('Seeding Failed:', err);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
};

createDbAndSeed();
