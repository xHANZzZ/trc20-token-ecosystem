import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// Validate query pagination parameters
const transfersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10)
  })
});

const pauseSchema = z.object({
  body: z.object({
    reason: z.string().min(5, { message: 'Reason must be at least 5 characters long' })
  })
});

router.get('/transfers', validate(transfersSchema), adminController.getTransfers);
router.post('/pause', validate(pauseSchema), adminController.pause);
router.post('/unpause', adminController.unpause);

export default router;
