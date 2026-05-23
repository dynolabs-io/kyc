import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/healthz', async (_req, reply) => reply.status(200).send({ status: 'ok' }));
  fastify.get('/readyz', async (_req, reply) => reply.status(200).send({ status: 'ready' }));
}
