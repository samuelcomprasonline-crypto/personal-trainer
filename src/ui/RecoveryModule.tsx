import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from './theme';
import type { RecoveryMetrics } from '../domain/types';

interface RecoveryModuleProps {
  metrics?: RecoveryMetrics;
}

export const defaultRecoveryMetrics: RecoveryMetrics = {
  readinessScore: 88,
  sleepHours: 7.8,
  sleepQualityPerc: 92,
  hrvMs: 64,
  restingHeartRateBpm: 52,
  muscleSoreness: 'baixa',
  systemicFatigue: 'baixa',
  lastUpdated: 'Hoje, 07:15 (Apple Watch & Oura Ring)',
};

export function RecoveryModule({ metrics = defaultRecoveryMetrics }: RecoveryModuleProps) {
  // Diagnóstico automático baseado no algoritmo de prontidão
  const getReadinessStatus = (score: number) => {
    if (score >= 85) {
      return {
        label: 'Prontidão Ótima',
        color: colors.primary,
        recommendation: 'Sistema nervoso central e muscular 100% recuperados. Pronto para cargas máximas e progressão de tensão.',
      };
    }
    if (score >= 70) {
      return {
        label: 'Prontidão Moderada',
        color: '#FFD93D',
        recommendation: 'Recuperação estável. Treine com intensidade habitual mantendo 1-2 repetições na reserva (RIR 1-2).',
      };
    }
    return {
      label: 'Fadiga Elevada / Deload',
      color: '#FF6B6B',
      recommendation: 'HRV abaixo da linha de base. Recomenda-se reduzir o volume em 30% ou sessão de mobilidade/cardio regenerativo.',
    };
  };

  const status = getReadinessStatus(metrics.readinessScore);

  return (
    <View style={styles.container}>
      {/* Card Principal de Prontidão & Wearables */}
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>BIOFEEDBACK & RECUPERAÇÃO</Text>
            <Text style={styles.syncMeta}>Sincronizado: {metrics.lastUpdated}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: `${status.color}22` }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Círculo / Score de Prontidão */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: status.color }]}>{metrics.readinessScore}</Text>
            <Text style={styles.scoreScale}>/100</Text>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Recomendação do Treinador AI:</Text>
            <Text style={styles.recommendationText}>{status.recommendation}</Text>
          </View>
        </View>

        {/* Grid de 4 Biomarcadores Clínicos */}
        <View style={styles.grid}>
          {/* Sono */}
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>🌙</Text>
            <Text style={styles.gridLabel}>SONO TOTAL</Text>
            <Text style={styles.gridValue}>{metrics.sleepHours}h</Text>
            <Text style={styles.gridSub}>Eficiência {metrics.sleepQualityPerc}%</Text>
          </View>

          {/* HRV / VFC */}
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>📈</Text>
            <Text style={styles.gridLabel}>HRV (VFC)</Text>
            <Text style={[styles.gridValue, { color: colors.primary }]}>{metrics.hrvMs} ms</Text>
            <Text style={styles.gridSub}>+8ms vs média semanal</Text>
          </View>

          {/* Frequência de Repouso */}
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>❤️</Text>
            <Text style={styles.gridLabel}>FC REPOUSO</Text>
            <Text style={styles.gridValue}>{metrics.restingHeartRateBpm} bpm</Text>
            <Text style={styles.gridSub}>Excelente padrão atlético</Text>
          </View>

          {/* Dor & Fadiga */}
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>⚡</Text>
            <Text style={styles.gridLabel}>DOR MUSCULAR</Text>
            <Text style={[styles.gridValue, { textTransform: 'capitalize' }]}>{metrics.muscleSoreness}</Text>
            <Text style={styles.gridSub}>Fadiga: {metrics.systemicFatigue}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLabel: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  syncMeta: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: typography.micro,
    fontWeight: '800',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
  },
  scoreScale: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  recommendationBox: {
    flex: 1,
  },
  recommendationTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '800',
    marginBottom: 2,
  },
  recommendationText: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  gridLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  gridValue: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: '900',
    marginTop: 2,
  },
  gridSub: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    marginTop: 2,
  },
});
