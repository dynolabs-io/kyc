import { describe, it, expect } from 'vitest';

import { recordKyc, applyKycDecision, getKycState } from './state.service';

describe('state.service', () => {
  it('record + getState returns 0 tier for new user', async () => {
    const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const s = await getKycState(userId);
    expect(s.kycTier).toBe(0);
    expect(s.records).toHaveLength(0);
  });

  it('approved tier-1 lifts kycTier to 1', async () => {
    const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const externalId = `inq_${Math.random().toString(36).slice(2)}`;
    await recordKyc({
      userId,
      provider: 'persona',
      externalId,
      decision: 'pending',
      tier: 1,
    });
    await applyKycDecision({
      provider: 'persona',
      userId,
      inquiryId: externalId,
      decision: 'approved',
      tier: 1,
    });
    const s = await getKycState(userId);
    expect(s.kycTier).toBe(1);
    expect(s.verifiedAt).toBeDefined();
  });

  it('approved tier-2 lifts kycTier to 2', async () => {
    const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const externalId = `chk_${Math.random().toString(36).slice(2)}`;
    await recordKyc({
      userId,
      provider: 'onfido',
      externalId,
      decision: 'pending',
      tier: 2,
    });
    await applyKycDecision({
      provider: 'onfido',
      userId,
      checkId: externalId,
      decision: 'approved',
      tier: 2,
    });
    const s = await getKycState(userId);
    expect(s.kycTier).toBe(2);
  });

  it('declined decision keeps kycTier at 0', async () => {
    const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const externalId = `inq_${Math.random().toString(36).slice(2)}`;
    await recordKyc({
      userId,
      provider: 'persona',
      externalId,
      decision: 'pending',
      tier: 1,
    });
    await applyKycDecision({
      provider: 'persona',
      userId,
      inquiryId: externalId,
      decision: 'declined',
      tier: 1,
    });
    const s = await getKycState(userId);
    expect(s.kycTier).toBe(0);
  });

  it('multiple approvals — highest tier wins', async () => {
    const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tier1Id = `inq_${Math.random().toString(36).slice(2)}`;
    const tier2Id = `chk_${Math.random().toString(36).slice(2)}`;
    await recordKyc({
      userId,
      provider: 'persona',
      externalId: tier1Id,
      decision: 'pending',
      tier: 1,
    });
    await recordKyc({
      userId,
      provider: 'onfido',
      externalId: tier2Id,
      decision: 'pending',
      tier: 2,
    });
    await applyKycDecision({
      provider: 'persona',
      userId,
      inquiryId: tier1Id,
      decision: 'approved',
      tier: 1,
    });
    await applyKycDecision({
      provider: 'onfido',
      userId,
      checkId: tier2Id,
      decision: 'approved',
      tier: 2,
    });
    const s = await getKycState(userId);
    expect(s.kycTier).toBe(2);
  });
});
