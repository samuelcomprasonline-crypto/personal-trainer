import type { Exercise, SessionLog } from './types';

// Ordem: aprovadas pelo treinador → mesmo padrão + músculo → mesmo músculo.
// availableEquipment vazio significa "equipamento desconhecido": não filtra.
export function suggestAlternatives(
  target: Exercise,
  library: Exercise[],
  approvedIds: string[],
  availableEquipment: string[],
  limit = 3,
): Exercise[] {
  const usable = library.filter(
    (e) => e.id !== target.id && (availableEquipment.length === 0 || availableEquipment.includes(e.equipment)),
  );
  const approved = approvedIds
    .map((id) => usable.find((e) => e.id === id))
    .filter((e): e is Exercise => e !== undefined);
  const samePattern = usable.filter(
    (e) => e.movementPattern === target.movementPattern && e.primaryMuscle === target.primaryMuscle,
  );
  const sameMuscle = usable.filter((e) => e.primaryMuscle === target.primaryMuscle);
  const ranked = [...approved, ...samePattern, ...sameMuscle];
  return ranked.filter((e, i) => ranked.findIndex((x) => x.id === e.id) === i).slice(0, limit);
}

export function lastLoadFor(exerciseId: string, logs: SessionLog[]): number | null {
  const newestFirst = [...logs].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  for (const log of newestFirst) {
    const set = log.sets.find((s) => s.exerciseId === exerciseId);
    if (set) return set.loadKg;
  }
  return null;
}
