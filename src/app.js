const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/api.routes');
const { errorHandler } = require('./middlewares/response.middleware');
const rateLimit = require('./middlewares/rate-limit.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit);

// Routes
app.use('/api', apiRoutes);

// Error Handler
app.use(errorHandler);

// 404
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

module.exports = app;
