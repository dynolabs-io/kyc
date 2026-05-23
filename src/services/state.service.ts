import { logger } from '../utils/logger';
import type { PersonaEvent } from '../adapters/persona';
import type { OnfidoEvent } from '../adapters/onfido';

interface KycRecord {
  userId: string;
  provider: 'persona' | 'onfido';
  externalId: string;
  decision: 'pending' | 'approved' | 'declined';
  tier: 1 | 2;
  decidedAt?: string;
}

const store = new Map<string, KycRecord>();

export interface KycState {
  userId: string;
  kycTier: 0 | 1 | 2;
  verifiedAt?: string;
  records: KycRecord[];
}

export async function recordKyc(input: Omit<KycRecord, 'decidedAt'>): Promise<void> {
  store.set(input.externalId, input);
  logger.info({ input }, 'KYC record stored');
}

export async function applyKycDecision(event: PersonaEvent | OnfidoEvent): Promise<void> {
  const externalId = 'inquiryId' in event ? event.inquiryId : event.checkId;
  const record = store.get(externalId);
  if (!record) {
    logger.warn({ event }, 'no record for event — ignoring');
    return;
  }
  record.decision = event.decision;
  record.decidedAt = new Date().toISOString();
  logger.info({ record }, 'KYC decision applied');
}

export async function getKycState(userId: string): Promise<KycState> {
  const records = Array.from(store.values()).filter(r => r.userId === userId);
  const approved = records.filter(r => r.decision === 'approved');
  const maxTier = approved.reduce<0 | 1 | 2>((acc, r) => (r.tier > acc ? (r.tier as 1 | 2) : acc), 0);
  const verifiedAt = approved.length > 0 ? approved[approved.length - 1].decidedAt : undefined;
  return { userId, kycTier: maxTier, verifiedAt, records };
}
