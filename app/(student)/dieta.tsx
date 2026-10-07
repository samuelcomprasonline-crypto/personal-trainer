import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Title, Label, Body } from '../../src/ui/components';
import { NutritionModule } from '../../src/ui/NutritionModule';
import { colors, spacing, typography } from '../../src/ui/theme';

export default function DietaScreen() {
  return (
    <Screen>
      {/* Cabeçalho Minimalista de Nutrição */}
      <View style={styles.header}>
        <View>
          <Label style={{ color: colors.primary }}>NUTRIÇÃO DE ALTO RENDIMENTO</Label>
          <Title size={28}>Plano Alimentar & Dieta</Title>
          <Body muted style={{ fontSize: 13, marginTop: 2 } as any}>
            Ajuste a quantidade em gramas para cálculo automático de calorias, macronutrientes, hidratação e vitaminas.
          </Body>
        </View>
      </View>

      {/* Módulo de Nutrição Completo */}
      <NutritionModule />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xs,
  },
});
