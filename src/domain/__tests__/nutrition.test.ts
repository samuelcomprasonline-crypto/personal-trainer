import { calculateFoodMacros, foodDatabase100g } from '../../ui/NutritionModule';

describe('Cálculos Nutricionais e Macronutrientes', () => {
  it('deve calcular corretamente os macros de 200g de Frango Grelhado', () => {
    const macros = calculateFoodMacros('Peito de Frango Grelhado', 200);
    // 165 kcal / 100g * 2 = 330 kcal
    // 31g prot / 100g * 2 = 62g
    expect(macros.caloriesKcal).toBe(330);
    expect(macros.proteinG).toBe(62);
    expect(macros.carbsG).toBe(0);
    expect(macros.fatG).toBe(7.2);
  });

  it('deve calcular corretamente os macros de 150g de Arroz Branco Cozido', () => {
    const macros = calculateFoodMacros('Arroz Branco Cozido', 150);
    // 130 * 1.5 = 195 kcal
    // 2.7 * 1.5 = 4.05g ~ 4.1g
    // 28.2 * 1.5 = 42.3g
    expect(macros.caloriesKcal).toBe(195);
    expect(macros.proteinG).toBe(4.1);
    expect(macros.carbsG).toBe(42.3);
  });

  it('deve ter alimentos essenciais cadastrados no banco de dados', () => {
    const names = foodDatabase100g.map((f) => f.name);
    expect(names).toContain('Peito de Frango Grelhado');
    expect(names).toContain('Arroz Branco Cozido');
    expect(names).toContain('Ovo Inteiro Cozido');
    expect(names).toContain('Aveia em Flocos');
    expect(names).toContain('Whey Protein Isolado (pó)');
    expect(names).toContain('Salmão Grelhado');
  });
});
