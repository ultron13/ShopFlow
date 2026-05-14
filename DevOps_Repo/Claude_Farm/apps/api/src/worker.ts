import { startPayoutWorker } from './jobs/processPayment.job.js';
import { logger } from './lib/logger.js';

logger.info('FarmConnect worker starting');

const payoutWorker = startPayoutWorker();

async function shutdown() {
  logger.info('Worker shutting down');
  await payoutWorker.close();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
