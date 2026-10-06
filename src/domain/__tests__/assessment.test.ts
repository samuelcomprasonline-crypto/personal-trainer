import { bodyMassComponents, calculatePollock3, calculatePollock7, processSkinfolds } from '../assessment';

describe('calculatePollock7', () => {
  it('calcula densidade e % de gordura para homens adultos', () => {
    const skinfolds = {
      peitoralMm: 12,
      axilarMediaMm: 14,
      subescapularMm: 16,
      tricipitalMm: 11,
      abdominalMm: 22,
      suprailiacaMm: 18,
      coxaMm: 15,
    };
    const res = calculatePollock7(skinfolds, 37, 'M');
    expect(res.somaMm).toBe(108);
    expect(res.densidadeCorporal).toBeGreaterThan(1.04);
    expect(res.densidadeCorporal).toBeLessThan(1.08);
    expect(res.percGordura).toBeGreaterThan(10);
    expect(res.percGordura).toBeLessThan(25);
  });
});

describe('calculatePollock3', () => {
  it('calcula 3 dobras para homens (Peitoral, Abdominal, Coxa)', () => {
    const res = calculatePollock3({ dobra1Mm: 10, dobra2Mm: 18, dobra3Mm: 14 }, 30, 'M');
    expect(res.somaMm).toBe(42);
    expect(res.percGordura).toBeGreaterThan(5);
    expect(res.percGordura).toBeLessThan(20);
  });
});

describe('bodyMassComponents', () => {
  it('separa corretamente massa gorda e massa magra', () => {
    const { massaGordaKg, massaMagraKg } = bodyMassComponents(90, 20);
    expect(massaGordaKg).toBe(18);
    expect(massaMagraKg).toBe(72);
  });
});

describe('processSkinfolds', () => {
  it('preenche automaticamente soma e % estimado quando todas as 7 dobras existem', () => {
    const input = {
      protocolo: 'pollock_7' as const,
      peitoralMm: 10,
      axilarMediaMm: 10,
      subescapularMm: 10,
      tricipitalMm: 10,
      abdominalMm: 20,
      suprailiacaMm: 15,
      coxaMm: 15,
    };
    const output = processSkinfolds(input, 35, 'M');
    expect(output.somaDobrasMm).toBe(90);
    expect(output.percGorduraEstimado).toBeDefined();
    expect(output.densidadeCorporal).toBeDefined();
  });
});
