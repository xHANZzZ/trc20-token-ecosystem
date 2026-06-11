import express from 'express';
import { validate } from './middlewares/validate.js';
import { errorHandler } from './middlewares/error.js';

// Import Controllers
import * as tokenController from './controllers/token.controller.js';
import * as registryController from './controllers/registry.controller.js';
import * as adminController from './controllers/admin.controller.js';

// Import Zod Schema Validators
import * as tokenVal from './validators/token.validator.js';
import * as registryVal from './validators/registry.validator.js';
import * as adminVal from './validators/admin.validator.js';

const app = express();

// Load Standard Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- TRC20 Token Routes ---
app.get('/api/v1/token/details', tokenController.getDetails);

app.get(
  '/api/v1/token/balance/:address',
  validate(tokenVal.getBalanceSchema),
  tokenController.getBalance
);

app.get(
  '/api/v1/token/allowance',
  validate(tokenVal.getAllowanceSchema),
  tokenController.getAllowance
);

app.post(
  '/api/v1/token/transfer',
  validate(tokenVal.transferSchema),
  tokenController.transfer
);

app.post(
  '/api/v1/token/approve',
  validate(tokenVal.approveSchema),
  tokenController.approve
);

app.post(
  '/api/v1/token/transfer-from',
  validate(tokenVal.transferFromSchema),
  tokenController.transferFrom
);

app.post(
  '/api/v1/token/mint',
  validate(tokenVal.mintSchema),
  tokenController.mint
);

app.post(
  '/api/v1/token/burn',
  validate(tokenVal.burnSchema),
  tokenController.burn
);

// --- Wallet Registry Routes ---
app.post(
  '/api/v1/registry/register',
  validate(registryVal.registerWalletSchema),
  registryController.register
);

app.post(
  '/api/v1/registry/batch-register',
  validate(registryVal.batchRegisterWalletsSchema),
  registryController.batchRegister
);

app.get(
  '/api/v1/registry/profile/:address',
  validate(registryVal.getProfileSchema),
  registryController.getProfile
);

app.put(
  '/api/v1/registry/kyc',
  validate(registryVal.updateKYCSchema),
  registryController.updateKYC
);

app.put(
  '/api/v1/registry/metadata',
  validate(registryVal.updateMetadataSchema),
  registryController.updateMetadata
);

app.delete(
  '/api/v1/registry/:address',
  validate(registryVal.deregisterWalletSchema),
  registryController.deregister
);

// --- Admin System Routes ---
app.get('/api/v1/admin/compliance', adminController.getCompliance);

app.post(
  '/api/v1/admin/compliance',
  validate(adminVal.setComplianceSchema),
  adminController.setCompliance
);

// --- Global Fallback 404 Route ---
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found`
  });
});

// --- Mount Global Error Interceptor ---
app.use(errorHandler);

export default app;
