import app from './app';
import { AppDataSource } from './config/data-source';
import dotenv from 'dotenv';
import 'reflect-metadata';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');

const startServer = async () => {
    // 1. Start listening immediately so Cloud Run health check passes (or we can see errors)
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });

    try {
        console.log('Attempting to connect to database...');
        await AppDataSource.initialize();
        console.log('Database connected via TypeORM');
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
};

startServer();
