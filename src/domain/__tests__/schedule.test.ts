import { buildQueue, consistency, nextSlot, shouldRest } from '../schedule';
import type { SessionLog, Template } from '../types';

const template: Template = {
  id: 't',
  name: 'T',
  weeks: 2,
  sessions: [
    { id: 'B', name: 'B', position: 2, items: [] },
    { id: 'A', name: 'A', position: 1, items: [] },
  ],
};

const HOUR = 60 * 60 * 1000;
const now = new Date('2026-09-22T12:00:00Z');
const ago = (hours: number) => new Date(now.getTime() - hours * HOUR).toISOString();
const log = (weekN: number, sessionId: string, completedAt: string): SessionLog => ({
  id: `${weekN}-${sessionId}-${completedAt}`,
  templateSessionId: sessionId,
  weekN,
  completedAt,
  sets: [],
});

describe('buildQueue', () => {
  it('ordena sessões por posição, semana a semana', () => {
    expect(buildQueue(template)).toEqual([
      { weekN: 1, sessionId: 'A' },
      { weekN: 1, sessionId: 'B' },
      { weekN: 2, sessionId: 'A' },
      { weekN: 2, sessionId: 'B' },
    ]);
  });
});

describe('nextSlot', () => {
  it('começa pela primeira sessão', () => {
    expect(nextSlot(template, [])).toEqual({ weekN: 1, sessionId: 'A' });
  });

  it('segue a fila independentemente de quantos dias passaram', () => {
    expect(nextSlot(template, [log(1, 'A', ago(24 * 10))])).toEqual({ weekN: 1, sessionId: 'B' });
  });

  it('retorna null quando o bloco acabou', () => {
    const all = buildQueue(template).map((s) => log(s.weekN, s.sessionId, ago(48)));
    expect(nextSlot(template, all)).toBeNull();
  });
});

describe('shouldRest', () => {
  it('sugere descanso se o último treino foi há menos de 24 h', () => {
    expect(shouldRest([log(1, 'A', ago(10))], now)).toBe(true);
  });

  it('não sugere descanso depois de 24 h', () => {
    expect(shouldRest([log(1, 'A', ago(30))], now)).toBe(false);
  });

  it('não sugere descanso sem histórico', () => {
    expect(shouldRest([], now)).toBe(false);
  });
});

describe('consistency', () => {
  it('conta só as últimas 4 semanas', () => {
    const logs = [ago(24), ago(48), ago(24 * 10), ago(24 * 20), ago(24 * 40)].map((d, i) => log(1, String(i), d));
    expect(consistency(logs, 2, now)).toBe(0.5); // 4 de 8
  });

  it('limita a 100%', () => {
    const logs = Array.from({ length: 12 }, (_, i) => log(1, String(i), ago(24 * (i + 1))));
    expect(consistency(logs, 2, now)).toBe(1);
  });

  it('é 0 sem sessões planejadas', () => {
    expect(consistency([], 0, now)).toBe(0);
  });
});
