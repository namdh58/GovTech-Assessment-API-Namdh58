const { seedData } = require('../scripts/init-data');
const AppDataSource = require('../config/data-source');
const asyncHandler = require('../utils/async-handler');
const { StatusCodes } = require('http-status-codes');

class SeedController {
    seed = asyncHandler(async (req, res) => {
        try {
            await seedData(AppDataSource);
            return {
                statusCode: StatusCodes.OK,
                data: {
                    message: 'Data seeded successfully using init-data.js script logic'
                }
            };
        } catch (error) {
            return {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    message: 'Seeding failed',
                    error: error.message
                }
            };
        }
    });
}

module.exports = new SeedController();
