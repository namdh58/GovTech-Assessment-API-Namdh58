const { DataSource } = require('typeorm');
require('dotenv').config();

const isSocket = process.env.DB_HOST && process.env.DB_HOST.startsWith('/');

console.log(process.env.DB_AUTO_SYNCHRONIZE === 'true');
const AppDataSource = new DataSource({
    type: 'mysql',
    ...(isSocket ? {
        socketPath: process.env.DB_HOST
    } : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
    }),
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
