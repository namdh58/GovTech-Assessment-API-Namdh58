const app = require('./app');
const AppDataSource = require('./config/data-source');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected via TypeORM');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

startServer();
