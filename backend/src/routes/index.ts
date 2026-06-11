import { Router } from 'express';
import tokenRoutes from './token.routes.js';
import registryRoutes from './registry.routes.js';
import proxyRoutes from './proxy.routes.js';
import ownershipRoutes from './ownership.routes.js';
import adminRoutes from './admin.routes.js';
import systemRoutes from './system.routes.js';

const router = Router();

// Mount modules under respective path roots
router.use('/token', tokenRoutes);
router.use('/registry', registryRoutes);
router.use('/proxy', proxyRoutes);
router.use('/ownership', ownershipRoutes);
router.use('/admin', adminRoutes);

// Mount system, health, and analytics routers
router.use(systemRoutes);

export default router;
