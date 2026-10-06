import type { StudentInvite } from './types';

/**
 * Gera um código legível para convite de aluno (ex: TREINO-A8F3).
 */
export function generateInviteCode(prefix = 'TREINO'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sem caracteres ambíguos (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    code += chars[idx];
  }
  return `${prefix}-${code}`;
}

/**
 * Normaliza o código de convite para busca consistente.
 */
export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Valida se um convite está elegível para aceitação.
 */
export function validateInvite(
  invite: StudentInvite | null | undefined,
  now: Date = new Date()
): { valid: boolean; reason?: 'not_found' | 'already_accepted' | 'expired' } {
  if (!invite) {
    return { valid: false, reason: 'not_found' };
  }

  if (invite.status === 'accepted') {
    return { valid: false, reason: 'already_accepted' };
  }

  if (invite.status === 'expired') {
    return { valid: false, reason: 'expired' };
  }

  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < now.getTime()) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true };
}
