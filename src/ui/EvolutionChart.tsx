import { useState } from 'react';
import { View } from 'react-native';
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

  // Dimensões do SVG
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

      {/* SVG Canvas Nativo Responsivo */}
      <View style={{ width: '100%', marginVertical: 8, overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', maxHeight: 200, display: 'block' }}
        >
          <defs>
            <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricConfig.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={metricConfig.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linhas de grade sutis */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke={t.border}
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke={t.border}
            strokeWidth="1"
          />

          {/* Área preenchida com gradiente suave */}
          <path d={areaD} fill="url(#gradientArea)" />

          {/* Linha principal da curva */}
          <path d={pathD} fill="none" stroke={metricConfig.color} strokeWidth="3" strokeLinecap="round" />

          {/* Pontos de dados com marcadores */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="5" fill={metricConfig.color} stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={p.x}
                y={p.y - 10}
                fill={t.text}
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {p.val}
              </text>
              <text
                x={p.x}
                y={height - 8}
                fill={t.muted}
                fontSize="10"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </View>

      <Body muted style={{ fontSize: 13 } as any}>
        * Dados extraídos diretamente das sessões registradas na balança e dobras cutâneas.
      </Body>
    </Card>
  );
}
