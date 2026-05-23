import { FastifyInstance, FastifyRequest } from 'fastify';
import { verifyPersonaSignature, parsePersonaEvent } from '../adapters/persona';
import { verifyOnfidoSignature, parseOnfidoEvent } from '../adapters/onfido';
import { applyKycDecision } from '../services/state.service';
import { logger } from '../utils/logger';

export async function webhookRoutes(fastify: FastifyInstance) {
  fastify.post('/persona', async (req: FastifyRequest, reply) => {
    const sig = req.headers['persona-signature'] as string | undefined;
    const raw = JSON.stringify(req.body);
    if (!verifyPersonaSignature(raw, sig)) {
      return reply.status(401).send({ error: { code: 'INVALID_SIGNATURE' } });
    }
    const event = parsePersonaEvent(req.body);
    logger.info({ event }, 'persona webhook');
    if (event.decision !== 'pending') {
      await applyKycDecision(event);
    }
    return reply.status(200).send({ ok: true });
  });

  fastify.post('/onfido', async (req: FastifyRequest, reply) => {
    const sig = req.headers['x-sha2-signature'] as string | undefined;
    const raw = JSON.stringify(req.body);
    if (!verifyOnfidoSignature(raw, sig)) {
      return reply.status(401).send({ error: { code: 'INVALID_SIGNATURE' } });
    }
    const event = parseOnfidoEvent(req.body);
    logger.info({ event }, 'onfido webhook');
    if (event.decision !== 'pending') {
      await applyKycDecision(event);
    }
    return reply.status(200).send({ ok: true });
  });
}
