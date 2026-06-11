import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as proxyController from '../controllers/proxy.controller.js';

const router = Router();

const tronAddressSchema = z.string().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, {
  message: 'Must be a valid Base58 TRON address starting with T'
});

const upgradeSchema = z.object({
  body: z.object({
    newImplementationAddress: tronAddressSchema
  })
});

router.post('/upgrade', validate(upgradeSchema), proxyController.upgrade);

export default router;
