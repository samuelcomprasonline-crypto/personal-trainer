import { plannedLoad, suggestNextLoad } from '../progression';

describe('plannedLoad', () => {
  it('semana 1 usa a carga base', () => {
    expect(plannedLoad(40, 2, 1)).toBe(40);
  });

  it('soma o incremento a cada semana', () => {
    expect(plannedLoad(40, 2, 4)).toBe(46);
  });
});

describe('suggestNextLoad', () => {
  const target = { sets: 3, repMax: 12 };

  it('sobe a carga quando todas as séries batem o topo da faixa', () => {
    expect(suggestNextLoad(target, 40, 2.5, [{ reps: 12 }, { reps: 12 }, { reps: 13 }])).toBe(42.5);
  });

  it('mantém a carga quando alguma série fica abaixo do topo', () => {
    expect(suggestNextLoad(target, 40, 2.5, [{ reps: 12 }, { reps: 11 }, { reps: 12 }])).toBe(40);
  });

  it('mantém a carga quando faltaram séries', () => {
    expect(suggestNextLoad(target, 40, 2.5, [{ reps: 12 }, { reps: 12 }])).toBe(40);
  });
});
