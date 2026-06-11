import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { getContractInstance } from './services/tron.service.js';

/**
 * Service Start Entrypoint
 * Verifies TRON contract connections prior to opening the web server ports.
 */
const startServer = async () => {
  try {
    logger.info('Warming up TRON network node interfaces...');
    // Establish contract abstraction instances
    await getContractInstance();
    
    // Bind server listener to port
    app.listen(env.PORT, () => {
      logger.info(`🚀 TRON Admin API server online on port ${env.PORT}`);
      logger.info(`Connecting to TRON Node: ${env.TRON_FULL_NODE}`);
    });
  } catch (error) {
    logger.error('Backend startup aborted due to service errors:', error);
    process.exit(1);
  }
};

startServer();
