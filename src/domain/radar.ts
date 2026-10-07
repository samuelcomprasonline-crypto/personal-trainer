import { consistency } from './schedule';
import type { SessionLog } from './types';

export type RadarKind = 'video' | 'adherence' | 'stalled' | 'rpe';

export type RadarItem = { kind: RadarKind; studentId: string; refId?: string; label: string };

export type StudentSnapshot = {
  studentId: string;
  name: string;
  consistency: number;
  recentRpes: number[]; // mais antigo → mais recente
  loadHistory: Record<string, { exerciseName: string; loads: number[] }>; // mais antigo → mais recente
  pendingVideoIds: string[];
  monthlyPrice?: number; // Valor da consultoria em R$
  planType?: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  dueDay?: number; // Dia de vencimento (ex: 10)
  paymentStatus?: 'pago' | 'pendente' | 'atrasado';
  assignedProgramName?: string;
};

const ORDER: RadarKind[] = ['video', 'adherence', 'stalled', 'rpe'];

// "Sem aumento de carga em 3 sessões seguidas": as 3 últimas não passam da anterior a elas.
export function isStalled(loads: number[]): boolean {
  if (loads.length < 4) return false;
  const before = loads[loads.length - 4];
  return loads.slice(-3).every((l) => l <= before);
}

export function buildRadar(students: StudentSnapshot[]): RadarItem[] {
  const items: RadarItem[] = [];
  for (const s of students) {
    for (const videoId of s.pendingVideoIds) {
      items.push({ kind: 'video', studentId: s.studentId, refId: videoId, label: `${s.name} enviou um vídeo para avaliação` });
    }
    if (s.consistency < 0.5) {
      items.push({
        kind: 'adherence',
        studentId: s.studentId,
        label: `${s.name}: consistência de ${Math.round(s.consistency * 100)}% nas últimas 4 semanas`,
      });
    }
    for (const [exerciseId, history] of Object.entries(s.loadHistory)) {
      if (isStalled(history.loads)) {
        items.push({
          kind: 'stalled',
          studentId: s.studentId,
          refId: exerciseId,
          label: `${s.name}: ${history.exerciseName} sem aumento de carga há 3 sessões`,
        });
      }
    }
    const lastRpes = s.recentRpes.slice(-3);
    if (lastRpes.length === 3 && lastRpes.every((r) => r >= 9)) {
      items.push({ kind: 'rpe', studentId: s.studentId, label: `${s.name}: esforço 9+ nas últimas 3 sessões` });
    }
  }
  return items.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
}

export function snapshotFromLogs(
  studentId: string,
  name: string,
  logs: SessionLog[],
  sessionsPerWeek: number,
  now: Date,
  exerciseNames: Record<string, string>,
): StudentSnapshot {
  const ordered = [...logs].sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
  const loadHistory: StudentSnapshot['loadHistory'] = {};
  for (const log of ordered) {
    const maxByExercise = new Map<string, number>();
    for (const set of log.sets) {
      maxByExercise.set(set.exerciseId, Math.max(maxByExercise.get(set.exerciseId) ?? 0, set.loadKg));
    }
    for (const [exerciseId, load] of maxByExercise) {
      loadHistory[exerciseId] ??= { exerciseName: exerciseNames[exerciseId] ?? exerciseId, loads: [] };
      loadHistory[exerciseId].loads.push(load);
    }
  }
  return {
    studentId,
    name,
    consistency: consistency(logs, sessionsPerWeek, now),
    recentRpes: ordered.flatMap((l) => (l.rpe === undefined ? [] : [l.rpe])),
    loadHistory,
    pendingVideoIds: [], // vídeos entram no Plano 4
  };
}
