export function plannedLoad(baseLoadKg: number, weeklyIncrementKg: number, weekN: number): number {
  return baseLoadKg + (weekN - 1) * weeklyIncrementKg;
}

// Dupla progressão: sobe a carga só quando todas as séries previstas bateram o topo da faixa.
export function suggestNextLoad(
  target: { sets: number; repMax: number },
  currentLoadKg: number,
  loadIncrement: number,
  lastSets: { reps: number }[],
): number {
  const hitTop = lastSets.length >= target.sets && lastSets.every((s) => s.reps >= target.repMax);
  return hitTop ? currentLoadKg + loadIncrement : currentLoadKg;
}
