import { describe, it, expect } from 'vitest';

import { initOnfidoCheck, parseOnfidoEvent } from './onfido';

describe('onfido adapter', () => {
  describe('initOnfidoCheck (stub mode)', () => {
    it('returns onfido_stub_* ID when no API key', async () => {
      delete process.env.ONFIDO_API_KEY;
      const r = await initOnfidoCheck({
        userId: '00000000-0000-0000-0000-000000000002',
        documentType: 'passport',
        country: 'GBR',
      });
      expect(r.id).toMatch(/^onfido_stub_[0-9a-f]+$/);
      expect(r.redirectUrl).toMatch(/^https:\/\/stub\.onfido\//);
      expect(r.status).toBe('pending');
    });
  });

  describe('parseOnfidoEvent', () => {
    it('maps complete+clear → approved', () => {
      const ev = parseOnfidoEvent({
        payload: {
          object: {
            reference_id: 'usr-u',
            id: 'chk_a',
            status: 'complete',
            result: 'clear',
          },
        },
      });
      expect(ev.decision).toBe('approved');
      expect(ev.tier).toBe(2);
    });

    it('maps complete+consider → declined', () => {
      const ev = parseOnfidoEvent({
        payload: {
          object: { reference_id: 'u', id: 'c', status: 'complete', result: 'consider' },
        },
      });
      expect(ev.decision).toBe('declined');
    });

    it('maps complete+rejected → declined', () => {
      const ev = parseOnfidoEvent({
        payload: {
          object: { reference_id: 'u', id: 'c', status: 'complete', result: 'rejected' },
        },
      });
      expect(ev.decision).toBe('declined');
    });

    it('maps in_progress → pending', () => {
      const ev = parseOnfidoEvent({
        payload: {
          object: { reference_id: 'u', id: 'c', status: 'in_progress' },
        },
      });
      expect(ev.decision).toBe('pending');
    });
  });
});
