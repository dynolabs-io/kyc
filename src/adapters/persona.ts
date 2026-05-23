import crypto from 'node:crypto';
import { getConfig } from '../config';
import { logger } from '../utils/logger';

const config = getConfig();

export interface PersonaInquiry {
  id: string;
  redirectUrl: string;
  status: 'pending' | 'completed' | 'failed';
}

export async function initPersonaInquiry(input: {
  userId: string;
  phone: string;
  country: string;
}): Promise<PersonaInquiry> {
  if (!config.PERSONA_API_KEY) {
    const id = `persona_stub_${crypto.randomBytes(8).toString('hex')}`;
    logger.warn({ id, input }, '[STUB] Persona inquiry created (no API key)');
    return { id, redirectUrl: `https://stub.persona/${id}`, status: 'pending' };
  }
  throw new Error('Persona live mode not implemented in scaffold');
}

export async function getPersonaInquiry(id: string): Promise<PersonaInquiry> {
  if (!config.PERSONA_API_KEY) {
    return { id, redirectUrl: `https://stub.persona/${id}`, status: 'pending' };
  }
  throw new Error('Persona live mode not implemented in scaffold');
}

export function verifyPersonaSignature(rawBody: string, signature?: string): boolean {
  if (!config.PERSONA_WEBHOOK_SECRET) {
    logger.warn('PERSONA_WEBHOOK_SECRET unset — accepting all signatures in stub mode');
    return true;
  }
  if (!signature) return false;
  const expected = crypto
    .createHmac('sha256', config.PERSONA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export interface PersonaEvent {
  userId: string;
  inquiryId: string;
  decision: 'pending' | 'approved' | 'declined';
  tier: 1;
  provider: 'persona';
}

export function parsePersonaEvent(body: unknown): PersonaEvent {
  const b = body as Record<string, any>;
  return {
    userId: b?.data?.attributes?.['reference-id'] ?? '',
    inquiryId: b?.data?.id ?? '',
    decision: mapPersonaStatus(b?.data?.attributes?.status),
    tier: 1,
    provider: 'persona',
  };
}

function mapPersonaStatus(s: string | undefined): PersonaEvent['decision'] {
  if (s === 'approved' || s === 'passed') return 'approved';
  if (s === 'declined' || s === 'failed') return 'declined';
  return 'pending';
}
