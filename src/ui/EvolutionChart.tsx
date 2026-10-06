import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { Body, Card, Chip, Label, Title } from './components';
import { useTheme } from './theme';

type DataPoint = {
  data: string;
  pesoKg: number;
  musculoEsqueleticoKg: number;
  percGordura: number;
};

export function EvolutionChart({ history }: { history: DataPoint[] }) {
  const t = useTheme();
  const [metric, setMetric] = useState<'peso' | 'gordura' | 'musculo'>('peso');

  if (history.length === 0) return null;

  const metricConfig = {
    peso: {
      label: 'Peso Corporal (kg)',
      color: t.accent,
      getValue: (d: DataPoint) => d.pesoKg,
      unit: 'kg',
    },
    gordura: {
      label: '% Gordura Corporal',
      color: '#E11D48',
      getValue: (d: DataPoint) => d.percGordura,
      unit: '%',
    },
    musculo: {
      label: 'Massa Muscular Esquelética (kg)',
      color: '#10B981',
      getValue: (d: DataPoint) => d.musculoEsqueleticoKg,
      unit: 'kg',
    },
  }[metric];

  const values = history.map(metricConfig.getValue);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // Dimensões da ViewBox
  const width = 580;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = history.map((item, index) => {
    const x = paddingX + (index / (history.length - 1 || 1)) * (width - 2 * paddingX);
    const val = metricConfig.getValue(item);
    const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
    return { x, y, val, date: item.data };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <View>
          <Label>Curva de Tendência</Label>
          <Title size={20}>{metricConfig.label}</Title>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="Peso" selected={metric === 'peso'} onPress={() => setMetric('peso')} />
          <Chip label="% Gordura" selected={metric === 'gordura'} onPress={() => setMetric('gordura')} />
          <Chip label="Músculo" selected={metric === 'musculo'} onPress={() => setMetric('musculo')} />
        </View>
      </View>

      {/* SVG Canvas Nativo Responsivo para iOS, Android e Web */}
      <View style={{ width: '100%', marginVertical: 8, overflow: 'hidden' }}>
        <Svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={180}
        >
          <Defs>
            <LinearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={metricConfig.color} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={metricConfig.color} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Linhas de grade sutis */}
          <Line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke={t.border}
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <Line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke={t.border}
            strokeWidth="1"
          />

          {/* Área preenchida com gradiente suave */}
          <Path d={areaD} fill="url(#gradientArea)" />

          {/* Linha principal da curva */}
          <Path d={pathD} fill="none" stroke={metricConfig.color} strokeWidth="3" strokeLinecap="round" />

          {/* Pontos de dados com marcadores */}
          {points.map((p, idx) => (
            <G key={idx}>
              <Circle cx={p.x} cy={p.y} r="5" fill={metricConfig.color} stroke="#FFFFFF" strokeWidth="2" />
              <SvgText
                x={p.x}
                y={p.y - 10}
                fill={t.text}
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {p.val}
              </SvgText>
              <SvgText
                x={p.x}
                y={height - 8}
                fill={t.muted}
                fontSize="10"
                textAnchor="middle"
              >
                {p.date}
              </SvgText>
            </G>
          ))}
        </Svg>
      </View>

      <Body muted style={{ fontSize: 13 } as any}>
        * Dados extraídos diretamente das sessões registradas na balança e dobras cutâneas.
      </Body>
    </Card>
  );
}
