
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import transportRoutes from './routes/transport.routes.js';
import serviceRoutes from './routes/service.routes.js';

import gapRoutes from './routes/gap.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';

import facilityRoutes from './routes/facility.routes.js';
import areaRoutes from './routes/area.routes.js';
const app = express();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// Routes
app.get('/', (req, res) => {
  res.send('TransitEquity API is running...');
});

// Public Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'Server is awake' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transports', transportRoutes);
app.use('/api/services', serviceRoutes);

// 2. REGISTER YOUR ROUTE HERE
app.use('/api/facilities', facilityRoutes);
app.use('/api/areas', areaRoutes);

app.use('/api/gap', gapRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

export default app;
