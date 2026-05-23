import crypto from 'node:crypto';
import { getConfig } from '../config';
import { logger } from '../utils/logger';

const config = getConfig();

export interface OnfidoCheck {
  id: string;
  redirectUrl: string;
  status: 'pending' | 'completed' | 'failed';
}

export async function initOnfidoCheck(input: {
  userId: string;
  documentType: string;
  country: string;
}): Promise<OnfidoCheck> {
  if (!config.ONFIDO_API_KEY) {
    const id = `onfido_stub_${crypto.randomBytes(8).toString('hex')}`;
    logger.warn({ id, input }, '[STUB] Onfido check created (no API key)');
    return { id, redirectUrl: `https://stub.onfido/${id}`, status: 'pending' };
  }
  throw new Error('Onfido live mode not implemented in scaffold');
}

export function verifyOnfidoSignature(rawBody: string, signature?: string): boolean {
  if (!config.ONFIDO_WEBHOOK_TOKEN) {
    logger.warn('ONFIDO_WEBHOOK_TOKEN unset — accepting all signatures in stub mode');
    return true;
  }
  if (!signature) return false;
  const expected = crypto
    .createHmac('sha256', config.ONFIDO_WEBHOOK_TOKEN)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export interface OnfidoEvent {
  userId: string;
  checkId: string;
  decision: 'pending' | 'approved' | 'declined';
  tier: 2;
  provider: 'onfido';
}

export function parseOnfidoEvent(body: unknown): OnfidoEvent {
  const b = body as Record<string, any>;
  return {
    userId: b?.payload?.object?.reference_id ?? '',
    checkId: b?.payload?.object?.id ?? '',
    decision: mapOnfidoStatus(b?.payload?.object?.status, b?.payload?.object?.result),
    tier: 2,
    provider: 'onfido',
  };
}

function mapOnfidoStatus(
  status: string | undefined,
  result: string | undefined
): OnfidoEvent['decision'] {
  if (status === 'complete') {
    if (result === 'clear') return 'approved';
    if (result === 'consider' || result === 'rejected') return 'declined';
  }
  return 'pending';
}
