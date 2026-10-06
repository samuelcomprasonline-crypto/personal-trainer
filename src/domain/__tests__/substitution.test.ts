import { lastLoadFor, suggestAlternatives } from '../substitution';
import type { Exercise, SessionLog } from '../types';

const ex = (id: string, movementPattern: string, primaryMuscle: string, equipment: string): Exercise => ({
  id,
  name: id,
  movementPattern,
  primaryMuscle,
  equipment,
  loadIncrement: 2.5,
});

const legPress = ex('legPress', 'squat', 'quads', 'machine');
const library = [
  legPress,
  ex('hack', 'squat', 'quads', 'machine'),
  ex('bulgaro', 'lunge', 'quads', 'dumbbell'),
  ex('extensora', 'knee_extension', 'quads', 'machine'),
  ex('supino', 'push', 'chest', 'barbell'),
  ex('goblet', 'squat', 'quads', 'dumbbell'),
];
const ids = (list: Exercise[]) => list.map((e) => e.id);

describe('suggestAlternatives', () => {
  it('coloca primeiro as alternativas aprovadas pelo treinador', () => {
    expect(ids(suggestAlternatives(legPress, library, ['bulgaro'], []))).toEqual(['bulgaro', 'hack', 'goblet']);
  });

  it('sem aprovadas: mesmo padrão + músculo, depois mesmo músculo', () => {
    expect(ids(suggestAlternatives(legPress, library, [], []))).toEqual(['hack', 'goblet', 'bulgaro']);
  });

  it('filtra pelo equipamento disponível', () => {
    expect(ids(suggestAlternatives(legPress, library, ['bulgaro'], ['machine']))).toEqual(['hack', 'extensora']);
  });

  it('nunca sugere o próprio exercício nem outro grupo muscular', () => {
    const result = ids(suggestAlternatives(legPress, library, [], [], 10));
    expect(result).not.toContain('legPress');
    expect(result).not.toContain('supino');
  });
});

describe('lastLoadFor', () => {
  const logs: SessionLog[] = [
    { id: '1', templateSessionId: 'A', weekN: 1, completedAt: '2026-09-01T10:00:00Z', sets: [{ exerciseId: 'hack', setN: 1, reps: 10, loadKg: 80 }] },
    { id: '2', templateSessionId: 'A', weekN: 2, completedAt: '2026-09-08T10:00:00Z', sets: [{ exerciseId: 'hack', setN: 1, reps: 10, loadKg: 90 }] },
  ];

  it('retorna a carga mais recente', () => {
    expect(lastLoadFor('hack', logs)).toBe(90);
  });

  it('retorna null sem histórico', () => {
    expect(lastLoadFor('goblet', logs)).toBeNull();
  });
});
