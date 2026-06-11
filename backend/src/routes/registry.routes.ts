import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as registryController from '../controllers/registry.controller.js';

const router = Router();

const tronAddressSchema = z.string().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, {
  message: 'Must be a valid Base58 TRON address starting with T'
});

const identityHashSchema = z.string().regex(/^[0-9a-fA-F]{64}$/, {
  message: 'identityHash must be a valid 64-character sha256 hex string'
});

const registerSchema = z.object({
  body: z.object({
    walletAddress: tronAddressSchema,
    identityHash: identityHashSchema
  })
});

const revokeSchema = z.object({
  body: z.object({
    walletAddress: tronAddressSchema
  })
});

const statusSchema = z.object({
  params: z.object({
    address: tronAddressSchema
  })
});

router.post('/register', validate(registerSchema), registryController.register);
router.post('/revoke', validate(revokeSchema), registryController.revoke);
router.get('/status/:address', validate(statusSchema), registryController.getStatus);

export default router;
