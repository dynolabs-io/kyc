import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import type { Config } from './config';
import { logger } from './utils/logger';
import { healthRoutes } from './controllers/health.controller';
import { kycRoutes } from './controllers/kyc.controller';
import { webhookRoutes } from './controllers/webhook.controller';

export async function buildApp(config: Config) {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL ?? 'info' },
    trustProxy: true,
  });
  void logger;

  await app.register(helmet);
  await app.register(cors, { origin: true });

  await app.register(healthRoutes);
  await app.register(kycRoutes, { prefix: '/kyc' });
  await app.register(webhookRoutes, { prefix: '/kyc/webhook' });

  app.setErrorHandler((err, _req, reply) => {
    logger.error({ err }, 'unhandled');
    reply
      .status(err.statusCode ?? 500)
      .send({ error: { code: (err as any).code ?? 'INTERNAL', message: err.message } });
  });

  return app;
}
