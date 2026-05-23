import { buildApp } from './app';
import { getConfig } from './config';
import { logger } from './utils/logger';

async function main() {
  const config = getConfig();
  const app = await buildApp(config);

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info({ port: config.PORT }, 'kyc-service listening');
  } catch (err) {
    logger.error({ err }, 'failed to start');
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutting down');
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
