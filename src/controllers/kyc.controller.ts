import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { initPersonaInquiry, getPersonaInquiry } from '../adapters/persona';
import { initOnfidoCheck } from '../adapters/onfido';
import { getKycState, recordKyc } from '../services/state.service';

const Tier1Body = z.object({
  userId: z.string().uuid(),
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/),
  country: z.string().length(3),
});
const Tier2Body = z.object({
  userId: z.string().uuid(),
  documentType: z.enum(['passport', 'national_id', 'driving_license']),
  country: z.string().length(3),
});
const StateParams = z.object({ userId: z.string().uuid() });

export async function kycRoutes(fastify: FastifyInstance) {
  fastify.post('/tier1/init', async (req: FastifyRequest, reply) => {
    const body = Tier1Body.parse(req.body);
    const inquiry = await initPersonaInquiry(body);
    await recordKyc({
      userId: body.userId,
      provider: 'persona',
      externalId: inquiry.id,
      decision: 'pending',
      tier: 1,
    });
    return reply.status(202).send({ inquiryId: inquiry.id, redirectUrl: inquiry.redirectUrl });
  });

  fastify.post('/tier2/init', async (req: FastifyRequest, reply) => {
    const body = Tier2Body.parse(req.body);
    const check = await initOnfidoCheck(body);
    await recordKyc({
      userId: body.userId,
      provider: 'onfido',
      externalId: check.id,
      decision: 'pending',
      tier: 2,
    });
    return reply.status(202).send({ checkId: check.id, redirectUrl: check.redirectUrl });
  });

  fastify.get('/users/:userId/state', async (req: FastifyRequest<{ Params: { userId: string } }>, reply) => {
    const { userId } = StateParams.parse(req.params);
    const state = await getKycState(userId);
    return reply.status(200).send(state);
  });

  fastify.get('/inquiry/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const inquiry = await getPersonaInquiry(req.params.id);
    return reply.status(200).send(inquiry);
  });
}
