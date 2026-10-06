import { generateInviteCode, normalizeInviteCode, validateInvite } from '../invite';
import type { StudentInvite } from '../types';

describe('invite domain', () => {
  it('generateInviteCode produces prefixed uppercase code', () => {
    const code = generateInviteCode('TREINO');
    expect(code).toMatch(/^TREINO-[2-9A-HJ-NP-Z]{4}$/);
  });

  it('normalizeInviteCode trims and uppercases input', () => {
    expect(normalizeInviteCode(' treino-a1b2 ')).toBe('TREINO-A1B2');
    expect(normalizeInviteCode('fit-8899')).toBe('FIT-8899');
  });

  it('validateInvite returns not_found for null/undefined', () => {
    expect(validateInvite(null)).toEqual({ valid: false, reason: 'not_found' });
    expect(validateInvite(undefined)).toEqual({ valid: false, reason: 'not_found' });
  });

  it('validateInvite detects already accepted or expired status', () => {
    const accepted: StudentInvite = {
      id: 'inv-1',
      trainerId: 'tr-1',
      studentEmail: 'aluno@teste.com',
      code: 'TREINO-1234',
      status: 'accepted',
      createdAt: '2026-10-01T10:00:00Z',
    };
    expect(validateInvite(accepted)).toEqual({ valid: false, reason: 'already_accepted' });

    const expiredStatus: StudentInvite = {
      ...accepted,
      status: 'expired',
    };
    expect(validateInvite(expiredStatus)).toEqual({ valid: false, reason: 'expired' });
  });

  it('validateInvite verifies expiresAt date', () => {
    const now = new Date('2026-10-06T12:00:00Z');
    const pastInvite: StudentInvite = {
      id: 'inv-2',
      trainerId: 'tr-1',
      studentEmail: 'aluno@teste.com',
      code: 'TREINO-5678',
      status: 'pending',
      createdAt: '2026-10-01T10:00:00Z',
      expiresAt: '2026-10-05T12:00:00Z',
    };
    expect(validateInvite(pastInvite, now)).toEqual({ valid: false, reason: 'expired' });

    const validInvite: StudentInvite = {
      ...pastInvite,
      expiresAt: '2026-10-07T12:00:00Z',
    };
    expect(validateInvite(validInvite, now)).toEqual({ valid: true });
  });
});
