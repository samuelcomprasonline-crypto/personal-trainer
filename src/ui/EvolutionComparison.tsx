import { useState } from 'react';
import { View } from 'react-native';
import { assessmentHistory } from '../data/seed';
import { Body, Card, Chip, Label, Title } from './components';
import { useTheme } from './theme';

export function EvolutionComparison() {
  const t = useTheme();
  const [initialIndex, setInitialIndex] = useState(0); // Primeira pesagem (07/03/2026)
  const [finalIndex, setFinalIndex] = useState(assessmentHistory.length - 1); // Última (19/09/2026)

  const initial = assessmentHistory[initialIndex];
  const final = assessmentHistory[finalIndex];

  if (!initial || !final) return null;

  const deltaPeso = Number((final.pesoKg - initial.pesoKg).toFixed(2));
  const deltaGordura = Number((final.percGordura - initial.percGordura).toFixed(1));
  const deltaMusculo = Number((final.musculoEsqueleticoKg - initial.musculoEsqueleticoKg).toFixed(1));

  // Estimativas de massa gorda e magra
  const gorduraInicialKg = (initial.pesoKg * initial.percGordura) / 100;
  const gorduraFinalKg = (final.pesoKg * final.percGordura) / 100;
  const deltaGorduraKg = Number((gorduraFinalKg - gorduraInicialKg).toFixed(1));

  const magraInicialKg = initial.pesoKg - gorduraInicialKg;
  const magraFinalKg = final.pesoKg - gorduraFinalKg;
  const deltaMagraKg = Number((magraFinalKg - magraInicialKg).toFixed(1));

  function DeltaCard({
    title,
    delta,
    unit,
    inverse = false,
  }: {
    title: string;
    delta: number;
    unit: string;
    inverse?: boolean;
  }) {
    const isPositive = delta > 0;
    const isZero = delta === 0;

    // Se inverse = true (ex: gordura), delta negativo é bom (verde) e positivo é atenção
    const isGood = inverse ? delta < 0 : delta > 0;
    const badgeColor = isZero ? t.muted : isGood ? '#10B981' : '#E11D48';

    return (
      <View style={{ flex: 1, minWidth: 150 }}>
        <Card>
          <Label>{title}</Label>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Title size={24} style={{ color: badgeColor } as any}>
              {isPositive ? `+${delta}` : `${delta}`} {unit}
            </Title>
          </View>
          <Body muted style={{ fontSize: 13 } as any}>
            De {inverse && title.includes('Gordura') ? initial.percGordura : initial.pesoKg} para{' '}
            {inverse && title.includes('Gordura') ? final.percGordura : final.pesoKg} {unit}
          </Body>
        </Card>
      </View>
    );
  }

  return (
    <Card>
      <View style={{ gap: 4 }}>
        <Label>Análise Comparativa de Resultados</Label>
        <Title size={22}>Antes vs Depois (Deltas de Evolução)</Title>
        <Body muted>Selecione duas avaliações para confrontar os resultados da periodização:</Body>
      </View>

      {/* SELETORES DE DATAS */}
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginVertical: 8 }}>
        <View style={{ flex: 1, minWidth: 200, gap: 6 }}>
          <Body muted style={{ fontWeight: '600' } as any}>Data Inicial:</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {assessmentHistory.map((item, idx) => (
              <Chip
                key={idx}
                label={item.data}
                selected={initialIndex === idx}
                onPress={() => setInitialIndex(idx)}
              />
            ))}
          </View>
        </View>

        <View style={{ flex: 1, minWidth: 200, gap: 6 }}>
          <Body muted style={{ fontWeight: '600' } as any}>Data Final:</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {assessmentHistory.map((item, idx) => (
              <Chip
                key={idx}
                label={item.data}
                selected={finalIndex === idx}
                onPress={() => setFinalIndex(idx)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* CARDS DE DELTAS */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
        <DeltaCard title="Variação de Peso" delta={deltaPeso} unit="kg" />
        <DeltaCard title="% Gordura" delta={deltaGordura} unit="%" inverse />
        <DeltaCard title="Músculo Esquelético" delta={deltaMusculo} unit="kg" />
        <DeltaCard title="Massa Gorda (kg)" delta={deltaGorduraKg} unit="kg" inverse />
        <DeltaCard title="Massa Magra (kg)" delta={deltaMagraKg} unit="kg" />
      </View>

      {/* RESUMO TÉCNICO DO PERÍODO */}
      <View
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 12,
          backgroundColor: `${t.accent}12`,
          borderWidth: 1,
          borderColor: `${t.accent}30`,
          gap: 4,
        }}
      >
        <Label>Diagnóstico do Período ({initial.data} → {final.data})</Label>
        <Body>
          {deltaMusculo >= 0 && deltaGordura <= 0
            ? '🏆 Recomposição Corporal Perfeita: Ganho de massa muscular com redução simultânea de gordura corporal!'
            : deltaMusculo >= 0
            ? `💪 Fase Anabólica / Hipertrofia: Ganho de ${deltaMusculo} kg de massa esquelética. Próximo passo sugerido: lapidação de gordura.`
            : '⚖️ Fase de Ajuste: Mantenha o foco na consistência semanal de treinos para acelerar a progressão de sobrecarga.'}
        </Body>
      </View>
    </Card>
  );
}
