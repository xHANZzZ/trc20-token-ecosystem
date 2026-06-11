import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as tokenController from '../controllers/token.controller.js';

const router = Router();

// Zod schemas inline for robust and self-contained endpoints check
const tronAddressSchema = z.string().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, {
  message: 'Must be a valid Base58 TRON address starting with T'
});

const amountSchema = z.string().regex(/^\d+$/, {
  message: 'Amount must be a numeric integer string to protect uint256 precision'
}).refine((val) => {
  try {
    return BigInt(val) > 0n;
  } catch {
    return false;
  }
}, 'Amount must be greater than zero');

const transferSchema = z.object({
  body: z.object({
    recipient: tronAddressSchema,
    amount: amountSchema
  })
});

const approveSchema = z.object({
  body: z.object({
    spender: tronAddressSchema,
    amount: z.string().regex(/^\d+$/, { message: 'Amount must be an integer string' })
  })
});

const balanceSchema = z.object({
  params: z.object({
    address: tronAddressSchema
  })
});

router.post('/transfer', validate(transferSchema), tokenController.transfer);
router.post('/approve', validate(approveSchema), tokenController.approve);
router.get('/balance/:address', validate(balanceSchema), tokenController.getBalance);

export default router;
