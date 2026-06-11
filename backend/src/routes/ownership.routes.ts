import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as ownershipController from '../controllers/ownership.controller.js';

const router = Router();

const tronAddressSchema = z.string().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, {
  message: 'Must be a valid Base58 TRON address starting with T'
});

const transferSchema = z.object({
  body: z.object({
    proposedOwner: tronAddressSchema
  })
});

// Transfer ownership proposal (Owner restricted in smart contract)
router.post('/transfer', validate(transferSchema), ownershipController.transferOwnership);

// Claim ownership acceptance (Pending proposed owner restricted in smart contract)
router.post('/claim', ownershipController.claimOwnership);

export default router;
