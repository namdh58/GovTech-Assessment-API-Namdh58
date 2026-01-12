import { DataSource } from 'typeorm';
import { Teacher } from '../entities/Teacher';
import { Student } from '../entities/Student';
import dotenv from 'dotenv';

dotenv.config();

const isSocket = process.env.DB_HOST && process.env.DB_HOST.startsWith('/');

export const AppDataSource = new DataSource({
    type: 'mysql',
    ...(isSocket ? {
        socketPath: process.env.DB_HOST
    } : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
    }),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'school_admin',
    synchronize: false, // Changed from auto-sync to false for migrations
    logging: false,
    entities: [Teacher, Student],
    migrations: ['src/migrations/*.ts'],
});
