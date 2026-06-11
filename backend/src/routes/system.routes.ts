import { Router } from 'express';
import * as systemController from '../controllers/system.controller.js';

const router = Router();

// Base System health endpoints
router.get('/system/health', systemController.getHealth);

// Analytic metrics and resources limits endpoints
router.get('/analytics/metrics', systemController.getMetrics);
router.get('/analytics/limits', systemController.getLimits);

export default router;
