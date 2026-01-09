const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'school_admin',
    synchronize: process.env.DB_AUTO_SYNCHRONIZE === 'true', // Auto create tables
    logging: false,
    entities: [
        require('../entities/Teacher'),
        require('../entities/Student')
    ],
});

module.exports = AppDataSource;
