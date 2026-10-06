import { buildRadar, isStalled, snapshotFromLogs, type StudentSnapshot } from '../radar';
import type { SessionLog } from '../types';

const base: StudentSnapshot = {
  studentId: 's',
  name: 'Ana',
  consistency: 0.8,
  recentRpes: [],
  loadHistory: {},
  pendingVideoIds: [],
};

describe('isStalled', () => {
  it('detecta 3 sessões sem aumento', () => {
    expect(isStalled([50, 60, 60, 60, 60])).toBe(true);
  });

  it('não marca quando houve aumento recente', () => {
    expect(isStalled([60, 60, 60, 62.5])).toBe(false);
  });

  it('precisa de pelo menos 4 sessões', () => {
    expect(isStalled([60, 60, 60])).toBe(false);
  });
});

describe('buildRadar', () => {
  it('não gera nada para aluno em dia', () => {
    expect(buildRadar([base])).toEqual([]);
  });

  it('consistência de exatamente 50% não é alerta', () => {
    expect(buildRadar([{ ...base, consistency: 0.5 }])).toEqual([]);
  });

  it('marca RPE ≥ 9 nas 3 últimas sessões', () => {
    expect(buildRadar([{ ...base, recentRpes: [6, 9, 9, 10] }]).map((i) => i.kind)).toEqual(['rpe']);
    expect(buildRadar([{ ...base, recentRpes: [9, 9, 8] }])).toEqual([]);
  });

  it('ordena: vídeo → aderência → carga → esforço', () => {
    const items = buildRadar([
      { ...base, studentId: 'a', recentRpes: [9, 9, 9] },
      { ...base, studentId: 'b', loadHistory: { supino: { exerciseName: 'Supino', loads: [60, 60, 60, 60] } } },
      { ...base, studentId: 'c', consistency: 0.2 },
      { ...base, studentId: 'd', pendingVideoIds: ['v1'] },
    ]);
    expect(items.map((i) => i.kind)).toEqual(['video', 'adherence', 'stalled', 'rpe']);
    expect(items[2].refId).toBe('supino');
  });
});

describe('snapshotFromLogs', () => {
  it('monta histórico de carga e RPE em ordem cronológica', () => {
    const logs: SessionLog[] = [
      { id: '2', templateSessionId: 'A', weekN: 2, completedAt: '2026-09-10T10:00:00Z', rpe: 9, sets: [{ exerciseId: 'hack', setN: 1, reps: 10, loadKg: 90 }] },
      { id: '1', templateSessionId: 'A', weekN: 1, completedAt: '2026-09-03T10:00:00Z', rpe: 7, sets: [{ exerciseId: 'hack', setN: 1, reps: 10, loadKg: 80 }, { exerciseId: 'hack', setN: 2, reps: 8, loadKg: 85 }] },
    ];
    const snap = snapshotFromLogs('s', 'Ana', logs, 2, new Date('2026-09-12T10:00:00Z'), { hack: 'Hack Machine' });
    expect(snap.loadHistory).toEqual({ hack: { exerciseName: 'Hack Machine', loads: [85, 90] } });
    expect(snap.recentRpes).toEqual([7, 9]);
    expect(snap.consistency).toBe(0.25);
    expect(snap.pendingVideoIds).toEqual([]);
  });
});
