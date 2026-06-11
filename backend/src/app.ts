import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.js';

const app = express();

// Load standard cors and body parser middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount index API endpoints
app.use('/api/v1', routes);

// Central fallback route handler (404)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Target Route ${req.originalUrl} not found`
  });
});

// Centralized error interceptor middleware
app.use(errorHandler);

export default app;
