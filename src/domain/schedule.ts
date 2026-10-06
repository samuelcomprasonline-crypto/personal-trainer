import type { SessionLog, Template } from './types';

export type Slot = { weekN: number; sessionId: string };

const HOUR_MS = 60 * 60 * 1000;

export function buildQueue(template: Template): Slot[] {
  const ordered = [...template.sessions].sort((a, b) => a.position - b.position);
  const queue: Slot[] = [];
  for (let weekN = 1; weekN <= template.weeks; weekN++) {
    for (const session of ordered) queue.push({ weekN, sessionId: session.id });
  }
  return queue;
}

// O treino de hoje é sempre o próximo da fila: faltar não gera atraso.
export function nextSlot(template: Template, logs: SessionLog[]): Slot | null {
  const done = new Set(logs.map((l) => `${l.weekN}:${l.templateSessionId}`));
  return buildQueue(template).find((s) => !done.has(`${s.weekN}:${s.sessionId}`)) ?? null;
}

export function shouldRest(logs: SessionLog[], now: Date, minRestHours = 24): boolean {
  if (logs.length === 0) return false;
  const last = Math.max(...logs.map((l) => Date.parse(l.completedAt)));
  return now.getTime() - last < minRestHours * HOUR_MS;
}

export function consistency(logs: SessionLog[], sessionsPerWeek: number, now: Date): number {
  if (sessionsPerWeek <= 0) return 0;
  const since = now.getTime() - 28 * 24 * HOUR_MS;
  const recent = logs.filter((l) => Date.parse(l.completedAt) >= since).length;
  return Math.min(1, recent / (sessionsPerWeek * 4));
}
