import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { getContractInstance } from './config/tron.js';

/**
 * Main Application Bootstrapper
 * Resolves blockchain node connectivity before launching Express listeners.
 */
const startServer = async (): Promise<void> => {
  try {
    logger.info('Warming up connection interfaces to TRON blockchain nodes...');
    // Warm up the lazy-loaded contract client
    await getContractInstance();
    
    app.listen(env.PORT, () => {
      logger.info(`🚀 TRON Custodian API server online in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`Full Node Connection: ${env.TRON_FULL_NODE}`);
    });
  } catch (error) {
    logger.error('Server process execution aborted due to initialization failure:', error);
    process.exit(1);
  }
};

startServer();
