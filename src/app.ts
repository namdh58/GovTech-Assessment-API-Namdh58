import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes/api.routes';
import { errorHandler } from './middlewares/response.middleware';
import limiter from './middlewares/rate-limit.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(limiter);

// Routes
app.use('/api', apiRoutes);

// Error Handler
app.use(errorHandler);

// 404
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Not Found' });
});

export default app;
