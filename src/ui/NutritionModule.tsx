import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { colors, radius, spacing, typography } from './theme';
import type { DietPlan, FoodItem, Meal } from '../domain/types';

// Banco de referência nutricional por 100g de alimento
export const foodDatabase100g = [
  { name: 'Peito de Frango Grelhado', cal: 165, prot: 31, carb: 0, fat: 3.6 },
  { name: 'Arroz Branco Cozido', cal: 130, prot: 2.7, carb: 28.2, fat: 0.3 },
  { name: 'Ovo Inteiro Cozido', cal: 155, prot: 13, carb: 1.1, fat: 11 },
  { name: 'Aveia em Flocos', cal: 389, prot: 16.9, carb: 66.3, fat: 6.9 },
  { name: 'Whey Protein Isolado (pó)', cal: 390, prot: 82, carb: 4, fat: 2 },
  { name: 'Batata Doce Cozida', cal: 86, prot: 1.6, carb: 20.1, fat: 0.1 },
  { name: 'Azeite de Oliva Extra Virgem', cal: 884, prot: 0, carb: 0, fat: 100 },
  { name: 'Salmão Grelhado', cal: 208, prot: 20, carb: 0, fat: 13 },
  { name: 'Banana Prata', cal: 89, prot: 1.1, carb: 22.8, fat: 0.3 },
  { name: 'Pasta de Amendoim Integral', cal: 588, prot: 25, carb: 20, fat: 50 },
  { name: 'Iogurte Natural Desnatado', cal: 41, prot: 4.1, carb: 5.8, fat: 0.2 },
  { name: 'Castanha-do-Pará', cal: 656, prot: 14.3, carb: 12.3, fat: 66.4 },
];

export function calculateFoodMacros(name: string, grams: number): Omit<FoodItem, 'id' | 'name' | 'quantityGrams'> {
  const ref = foodDatabase100g.find((f) => f.name.toLowerCase() === name.toLowerCase()) || {
    cal: 150,
    prot: 10,
    carb: 15,
    fat: 5,
  };
  const factor = grams / 100;
  return {
    caloriesKcal: Math.round(ref.cal * factor),
    proteinG: Math.round(ref.prot * factor * 10) / 10,
    carbsG: Math.round(ref.carb * factor * 10) / 10,
    fatG: Math.round(ref.fat * factor * 10) / 10,
  };
}

export const defaultDietPlan: DietPlan = {
  id: 'diet-01',
  studentId: 'aluno-1',
  targetCalories: 2450,
  targetProteinG: 185,
  targetCarbsG: 260,
  targetFatG: 65,
  waterTargetMl: 3500,
  tmbKcal: 1780,
  tdeeKcal: 2620,
  supplements: [
    'Creatina Monohidratada 5g (Pós-treino)',
    'Ômega 3 Ultra Concentrado 2000mg (com almoço)',
    'Vitamina D3 5000 UI + K2 MK-7 (manhã)',
    'Magnésio Quelato 350mg (antes de dormir)',
  ],
  meals: [
    {
      id: 'm1',
      name: 'Café da Manhã & Desjejum',
      time: '07:30',
      vitamins: ['Vitamina D3 + K2', 'Multivitamínico'],
      foods: [
        { id: 'f1', name: 'Ovo Inteiro Cozido', quantityGrams: 150, caloriesKcal: 232, proteinG: 19.5, carbsG: 1.6, fatG: 16.5 },
        { id: 'f2', name: 'Aveia em Flocos', quantityGrams: 60, caloriesKcal: 233, proteinG: 10.1, carbsG: 39.8, fatG: 4.1 },
        { id: 'f3', name: 'Banana Prata', quantityGrams: 100, caloriesKcal: 89, proteinG: 1.1, carbsG: 22.8, fatG: 0.3 },
      ],
    },
    {
      id: 'm2',
      name: 'Almoço Anabólico',
      time: '12:30',
      vitamins: ['Ômega 3 2000mg'],
      foods: [
        { id: 'f4', name: 'Peito de Frango Grelhado', quantityGrams: 200, caloriesKcal: 330, proteinG: 62.0, carbsG: 0.0, fatG: 7.2 },
        { id: 'f5', name: 'Arroz Branco Cozido', quantityGrams: 200, caloriesKcal: 260, proteinG: 5.4, carbsG: 56.4, fatG: 0.6 },
        { id: 'f6', name: 'Azeite de Oliva Extra Virgem', quantityGrams: 10, caloriesKcal: 88, proteinG: 0.0, carbsG: 0.0, fatG: 10.0 },
      ],
    },
    {
      id: 'm3',
      name: 'Lanche Pré-Treino & Força',
      time: '16:00',
      foods: [
        { id: 'f7', name: 'Batata Doce Cozida', quantityGrams: 150, caloriesKcal: 129, proteinG: 2.4, carbsG: 30.1, fatG: 0.2 },
        { id: 'f8', name: 'Whey Protein Isolado (pó)', quantityGrams: 35, caloriesKcal: 136, proteinG: 28.7, carbsG: 1.4, fatG: 0.7 },
      ],
    },
    {
      id: 'm4',
      name: 'Jantar Reparador & Pós-Treino',
      time: '20:30',
      vitamins: ['Creatina 5g', 'Magnésio Quelato 350mg'],
      foods: [
        { id: 'f9', name: 'Salmão Grelhado', quantityGrams: 180, caloriesKcal: 374, proteinG: 36.0, carbsG: 0.0, fatG: 23.4 },
        { id: 'f10', name: 'Arroz Branco Cozido', quantityGrams: 180, caloriesKcal: 234, proteinG: 4.9, carbsG: 50.8, fatG: 0.5 },
      ],
    },
  ],
};

interface NutritionModuleProps {
  initialPlan?: DietPlan;
  onPlanChange?: (plan: DietPlan) => void;
  isTrainer?: boolean;
}

export function NutritionModule({
  initialPlan = defaultDietPlan,
  onPlanChange,
  isTrainer = false,
}: NutritionModuleProps) {
  const [dietPlan, setDietPlan] = useState<DietPlan>(initialPlan);
  const [waterConsumedMl, setWaterConsumedMl] = useState(2250);
  const [selectedMealId, setSelectedMealId] = useState<string>(dietPlan.meals[0]?.id || '');
  const [editingGrams, setEditingGrams] = useState<{ [foodId: string]: string }>({});

  // Cálculos consolidados em tempo real
  const totalCalories = dietPlan.meals.reduce(
    (acc, m) => acc + m.foods.reduce((sum, f) => sum + f.caloriesKcal, 0),
    0
  );
  const totalProtein = Math.round(
    dietPlan.meals.reduce(
      (acc, m) => acc + m.foods.reduce((sum, f) => sum + f.proteinG, 0),
      0
    )
  );
  const totalCarbs = Math.round(
    dietPlan.meals.reduce(
      (acc, m) => acc + m.foods.reduce((sum, f) => sum + f.carbsG, 0),
      0
    )
  );
  const totalFat = Math.round(
    dietPlan.meals.reduce(
      (acc, m) => acc + m.foods.reduce((sum, f) => sum + f.fatG, 0),
      0
    )
  );

  const updateFoodGrams = (mealId: string, foodId: string, newGrams: number) => {
    if (newGrams < 0 || isNaN(newGrams)) return;
    const updatedMeals = dietPlan.meals.map((meal) => {
      if (meal.id !== mealId) return meal;
      const updatedFoods = meal.foods.map((food) => {
        if (food.id !== foodId) return food;
        const newMacros = calculateFoodMacros(food.name, newGrams);
        return {
          ...food,
          quantityGrams: newGrams,
          ...newMacros,
        };
      });
      return { ...meal, foods: updatedFoods };
    });

    const updatedPlan = { ...dietPlan, meals: updatedMeals };
    setDietPlan(updatedPlan);
    if (onPlanChange) onPlanChange(updatedPlan);
  };

  const addWater = (amount: number) => {
    setWaterConsumedMl((prev) => Math.max(0, prev + amount));
  };

  const activeMeal = dietPlan.meals.find((m) => m.id === selectedMealId) || dietPlan.meals[0];

  return (
    <View style={styles.container}>
      {/* Cabeçalho de Metas Nutricionais & Gasto Calórico */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.labelMuted}>BALANÇO ENERGÉTICO DIÁRIO</Text>
            <View style={styles.calRow}>
              <Text style={styles.calValue}>{totalCalories}</Text>
              <Text style={styles.calTarget}> / {dietPlan.targetCalories} kcal</Text>
            </View>
          </View>
          <View style={styles.badgeTdee}>
            <Text style={styles.badgeTdeeText}>TMB: {dietPlan.tmbKcal} | TDEE: {dietPlan.tdeeKcal}</Text>
          </View>
        </View>

        {/* Barra de Progresso Calórico */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.round((totalCalories / dietPlan.targetCalories) * 100))}%` },
            ]}
          />
        </View>

        {/* Grid de 3 Macronutrientes */}
        <View style={styles.macrosGrid}>
          <View style={styles.macroCol}>
            <View style={[styles.macroPill, { backgroundColor: '#FF6B6B22' }]}>
              <Text style={[styles.macroPillText, { color: '#FF6B6B' }]}>PROTEÍNA</Text>
            </View>
            <Text style={styles.macroValue}>{totalProtein}g</Text>
            <Text style={styles.macroTarget}>meta {dietPlan.targetProteinG}g</Text>
          </View>

          <View style={styles.macroCol}>
            <View style={[styles.macroPill, { backgroundColor: '#4D96FF22' }]}>
              <Text style={[styles.macroPillText, { color: '#4D96FF' }]}>CARBOIDRATO</Text>
            </View>
            <Text style={styles.macroValue}>{totalCarbs}g</Text>
            <Text style={styles.macroTarget}>meta {dietPlan.targetCarbsG}g</Text>
          </View>

          <View style={styles.macroCol}>
            <View style={[styles.macroPill, { backgroundColor: '#FFD93D22' }]}>
              <Text style={[styles.macroPillText, { color: '#FFD93D' }]}>GORDURA</Text>
            </View>
            <Text style={styles.macroValue}>{totalFat}g</Text>
            <Text style={styles.macroTarget}>meta {dietPlan.targetFatG}g</Text>
          </View>
        </View>
      </View>

      {/* Hidratação Rápida */}
      <View style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <View>
            <Text style={styles.waterTitle}>💧 Hidratação Celular</Text>
            <Text style={styles.waterSubtitle}>
              {waterConsumedMl} ml consumidos de {dietPlan.waterTargetMl} ml (
              {Math.round((waterConsumedMl / dietPlan.waterTargetMl) * 100)}%)
            </Text>
          </View>
          <View style={styles.waterActions}>
            <TouchableOpacity style={styles.waterBtn} onPress={() => addWater(250)}>
              <Text style={styles.waterBtnText}>+250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterBtn} onPress={() => addWater(500)}>
              <Text style={styles.waterBtnText}>+500ml</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: '#38BDF8',
                width: `${Math.min(100, Math.round((waterConsumedMl / dietPlan.waterTargetMl) * 100))}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Protocolo de Vitaminas e Suplementação */}
      <View style={styles.vitaminsCard}>
        <Text style={styles.sectionTitle}>💊 Vitaminas & Micronutrientes Prescritos</Text>
        <View style={styles.vitaminsList}>
          {dietPlan.supplements.map((sup, idx) => (
            <View key={idx} style={styles.vitaminBadge}>
              <Text style={styles.vitaminIcon}>✓</Text>
              <Text style={styles.vitaminText}>{sup}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Seletor de Refeições com Cálculo em Tempo Real */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>🍽️ Refeições Estruturadas & Gramas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealTabsRow}>
        {dietPlan.meals.map((meal) => {
          const isSelected = meal.id === selectedMealId;
          const mealCals = meal.foods.reduce((acc, f) => acc + f.caloriesKcal, 0);
          return (
            <TouchableOpacity
              key={meal.id}
              style={[styles.mealTab, isSelected && styles.mealTabActive]}
              onPress={() => setSelectedMealId(meal.id)}
            >
              <Text style={[styles.mealTabTime, isSelected && styles.mealTabTimeActive]}>{meal.time}</Text>
              <Text style={[styles.mealTabName, isSelected && styles.mealTabNameActive]} numberOfLines={1}>
                {meal.name}
              </Text>
              <Text style={[styles.mealTabCals, isSelected && styles.mealTabCalsActive]}>{mealCals} kcal</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detalhes da Refeição Selecionada */}
      {activeMeal && (
        <View style={styles.activeMealCard}>
          <View style={styles.activeMealHeader}>
            <View>
              <Text style={styles.activeMealTitle}>{activeMeal.name}</Text>
              <Text style={styles.activeMealTime}>Horário sugerido: {activeMeal.time}</Text>
            </View>
            <View style={styles.activeMealTotals}>
              <Text style={styles.activeMealCals}>
                {activeMeal.foods.reduce((acc, f) => acc + f.caloriesKcal, 0)} kcal
              </Text>
              <Text style={styles.activeMealMacros}>
                P: {Math.round(activeMeal.foods.reduce((acc, f) => acc + f.proteinG, 0))}g | C:{' '}
                {Math.round(activeMeal.foods.reduce((acc, f) => acc + f.carbsG, 0))}g | G:{' '}
                {Math.round(activeMeal.foods.reduce((acc, f) => acc + f.fatG, 0))}g
              </Text>
            </View>
          </View>

          {activeMeal.vitamins && activeMeal.vitamins.length > 0 && (
            <View style={styles.mealVitaminsBox}>
              <Text style={styles.mealVitaminsLabel}>Vitaminas com esta refeição:</Text>
              <Text style={styles.mealVitaminsValue}>{activeMeal.vitamins.join(' • ')}</Text>
            </View>
          )}

          {/* Lista de Alimentos com Quantidade em Gramas Editável */}
          <View style={styles.foodsList}>
            {activeMeal.foods.map((food) => {
              const currentInput =
                editingGrams[food.id] !== undefined
                  ? editingGrams[food.id]
                  : String(food.quantityGrams);

              return (
                <View key={food.id} style={styles.foodRow}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodMacrosDetail}>
                      {food.proteinG}g Prot • {food.carbsG}g Carb • {food.fatG}g Gord
                    </Text>
                  </View>

                  {/* Campo de Gramas com Recálculo Instantâneo */}
                  <View style={styles.foodGramsControl}>
                    <TouchableOpacity
                      style={styles.gramStepBtn}
                      onPress={() => updateFoodGrams(activeMeal.id, food.id, Math.max(10, food.quantityGrams - 10))}
                    >
                      <Text style={styles.gramStepBtnText}>-</Text>
                    </TouchableOpacity>

                    <View style={styles.gramInputWrapper}>
                      <TextInput
                        style={styles.gramInput}
                        keyboardType="numeric"
                        value={currentInput}
                        onChangeText={(txt) => {
                          setEditingGrams({ ...editingGrams, [food.id]: txt });
                          const parsed = parseFloat(txt);
                          if (!isNaN(parsed) && parsed > 0) {
                            updateFoodGrams(activeMeal.id, food.id, parsed);
                          }
                        }}
                      />
                      <Text style={styles.gramUnit}>g</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.gramStepBtn}
                      onPress={() => updateFoodGrams(activeMeal.id, food.id, food.quantityGrams + 10)}
                    >
                      <Text style={styles.gramStepBtnText}>+</Text>
                    </TouchableOpacity>

                    <Text style={styles.foodTotalKcal}>{food.caloriesKcal} kcal</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  labelMuted: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  calRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  calValue: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '900',
  },
  calTarget: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '600',
  },
  badgeTdee: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeTdeeText: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  macroCol: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  macroPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  macroValue: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: '800',
  },
  macroTarget: {
    color: colors.textMuted,
    fontSize: typography.micro,
    fontWeight: '500',
  },
  waterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  waterTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  waterSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  waterActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  waterBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  waterBtnText: {
    color: '#38BDF8',
    fontSize: typography.small,
    fontWeight: '700',
  },
  vitaminsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  vitaminsList: {
    gap: spacing.xs,
  },
  vitaminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vitaminIcon: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '900',
    marginRight: spacing.xs,
  },
  vitaminText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: '500',
  },
  mealTabsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  mealTab: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
  },
  mealTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTabTime: {
    color: colors.textMuted,
    fontSize: typography.micro,
    fontWeight: '700',
  },
  mealTabTimeActive: {
    color: colors.black,
  },
  mealTabName: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '700',
    marginTop: 2,
  },
  mealTabNameActive: {
    color: colors.black,
  },
  mealTabCals: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '800',
    marginTop: 4,
  },
  mealTabCalsActive: {
    color: colors.black,
  },
  activeMealCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  activeMealTitle: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: '800',
  },
  activeMealTime: {
    color: colors.textMuted,
    fontSize: typography.small,
  },
  activeMealTotals: {
    alignItems: 'flex-end',
  },
  activeMealCals: {
    color: colors.primary,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  activeMealMacros: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    fontWeight: '600',
  },
  mealVitaminsBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  mealVitaminsLabel: {
    color: colors.primary,
    fontSize: typography.micro,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mealVitaminsValue: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '500',
    marginTop: 2,
  },
  foodsList: {
    gap: spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  foodName: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '700',
  },
  foodMacrosDetail: {
    color: colors.textMuted,
    fontSize: typography.micro,
    marginTop: 2,
  },
  foodGramsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gramStepBtn: {
    width: 26,
    height: 26,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gramStepBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  gramInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    height: 28,
  },
  gramInput: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '800',
    minWidth: 32,
    textAlign: 'center',
    padding: 0,
  },
  gramUnit: {
    color: colors.textMuted,
    fontSize: typography.micro,
    fontWeight: '600',
  },
  foodTotalKcal: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: '700',
    minWidth: 54,
    textAlign: 'right',
  },
});
