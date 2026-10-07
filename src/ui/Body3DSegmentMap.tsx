import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { BioimpedanceAssessment } from '../domain/types';
import { Body, Card, Chip, Label, Title } from './components';
import { useTheme } from './theme';

type LayerMode = 'musculo' | 'gordura' | 'postura';
type BodyPartFocus = {
  id: string;
  name: string;
  anatomicalName: string;
  category: 'prioridade_alta' | 'simetria' | 'postura' | 'articulacao';
  reason: string;
  recommendedExercises: string[];
  cx: number;
  cy: number;
  calloutX: number;
  calloutY: number;
  align: 'left' | 'right';
  color: string;
};

interface Body3DSegmentMapProps {
  bio: BioimpedanceAssessment;
  onSelectArea?: (area: string) => void;
}

export function Body3DSegmentMap({ bio, onSelectArea }: Body3DSegmentMapProps) {
  const t = useTheme();
  const [layer, setLayer] = useState<LayerMode>('musculo');
  const [selectedFocusId, setSelectedFocusId] = useState<string | null>(null);

  // Paleta estética futurista com base nos prints de referência
  const themeColors = {
    cyan: '#00F0FF',
    neonLime: '#C6F432',
    coralRed: '#FF4D6D',
    amber: '#FFB703',
    purple: '#A855F7',
    darkBg: '#080C16',
    cardDark: '#0F172A',
    borderDark: '#1E293B',
  };

  const activeAccent = layer === 'musculo' ? themeColors.cyan : layer === 'gordura' ? themeColors.coralRed : themeColors.amber;

  // 1. MOTOR AUTOMÁTICO DE PRESCRIÇÃO E FOCO DE TREINO (AI Training Focus Engine)
  const calculateAutomaticFocus = (): BodyPartFocus[] => {
    const list: BodyPartFocus[] = [];

    // Cálculo das assimetrias
    const armL = bio.segmentar?.musculo?.bracoEsquerdo?.kg ?? 3.8;
    const armR = bio.segmentar?.musculo?.bracoDireito?.kg ?? 3.9;
    const legL = bio.segmentar?.musculo?.pernaEsquerda?.kg ?? 9.8;
    const legR = bio.segmentar?.musculo?.pernaDireita?.kg ?? 9.9;
    const trunkFat = bio.segmentar?.gordura?.tronco?.proporcaoPadraoPerc ?? 115;

    // Foco 1: Peitoral e Clavícula
    list.push({
      id: 'peito',
      name: 'Peitoral & Deltoide Anterior',
      anatomicalName: 'Pectoralis Major & Deltoideus',
      category: 'prioridade_alta',
      reason: 'Foco prioritário em porção clavicular (superior) para densidade e expansão torácica no estúdio.',
      recommendedExercises: ['Supino Inclinado no Smith', 'Crucifixo Inclinado c/ Halter', 'Flexões no Solo'],
      cx: 170,
      cy: 118,
      calloutX: 45,
      calloutY: 105,
      align: 'left',
      color: themeColors.coralRed,
    });

    // Foco 2: Bíceps e Braço (Assimetria)
    const armDelta = Math.abs(armR - armL);
    list.push({
      id: 'bracos',
      name: 'Bíceps & Antebraço',
      anatomicalName: 'Biceps Brachii & Brachioradialis',
      category: armDelta > 0.1 ? 'simetria' : 'prioridade_alta',
      reason:
        armDelta > 0.1
          ? `Assimetria funcional detectada (${(armDelta * 1000).toFixed(0)}g de diferença). Priorizar rosca alternada unilateral com início no braço esquerdo.`
          : 'Excelente equilíbrio de força. Manter sobrecarga progressiva com Barra W.',
      recommendedExercises: ['Rosca Alternada com Giro', 'Rosca Direta c/ Barra W', 'Rosca Inversa'],
      cx: 235,
      cy: 165,
      calloutX: 295,
      calloutY: 155,
      align: 'right',
      color: themeColors.cyan,
    });

    // Foco 3: Reto Abdominal & Core
    list.push({
      id: 'core',
      name: 'Reto Abdominal & Transverso',
      anatomicalName: 'Rectus Abdominis & Core',
      category: trunkFat > 100 ? 'prioridade_alta' : 'postura',
      reason:
        trunkFat > 100
          ? `Gordura no tronco em ${trunkFat}% do padrão. Fortalecer estabilidade com pranchas isométricas de 1 min associadas a déficit calórico.`
          : 'Estabilidade central sólida. Focar em flexão controlada no banco romano.',
      recommendedExercises: ['Prancha Abdominal (4x 1 min)', 'Abdominal Crunch Banco Reto'],
      cx: 170,
      cy: 185,
      calloutX: 45,
      calloutY: 195,
      align: 'left',
      color: themeColors.amber,
    });

    // Foco 4: Quadríceps & Estabilidade Patelar
    list.push({
      id: 'pernas',
      name: 'Quadríceps & Vasto Medial',
      anatomicalName: 'Quadriceps Femoris',
      category: 'articulacao',
      reason: 'Estabilidade patelar de joelho: reforçar extensão terminal na extensora e controle concêntrico no Leg Press.',
      recommendedExercises: ['Leg Press Pés Paralelos', 'Cadeira Extensora', 'Agachamento com Bola'],
      cx: 145,
      cy: 285,
      calloutX: 45,
      calloutY: 290,
      align: 'left',
      color: themeColors.neonLime,
    });

    // Foco 5: Panturrilhas & Sóleo
    list.push({
      id: 'panturrilhas',
      name: 'Gastrocnêmio & Sóleo',
      anatomicalName: 'Gastrocnemius & Soleus',
      category: 'prioridade_alta',
      reason: 'Músculo antigravitacional com necessidade de estímulo bi-semanal em pé (gastrocnêmio) e sentado (sóleo).',
      recommendedExercises: ['Panturrilha em Pé na Máquina', 'Panturrilha Sentado'],
      cx: 195,
      cy: 355,
      calloutX: 295,
      calloutY: 345,
      align: 'right',
      color: themeColors.cyan,
    });

    return list;
  };

  const focusList = calculateAutomaticFocus();
  const activeFocus = focusList.find((f) => f.id === selectedFocusId) || focusList[0];

  return (
    <Card style={{ backgroundColor: themeColors.darkBg, borderColor: themeColors.borderDark }}>
      {/* 1. CABEÇALHO DO SCANNER BIOMECÂNICO */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: activeAccent,
                shadowColor: activeAccent,
                shadowOpacity: 0.9,
                shadowRadius: 8,
              }}
            />
            <Text style={{ color: activeAccent, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
              ESCANEAMENTO BIOMECÂNICO 3D
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>
            Topografia Anatômica do Cliente
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
            Diagnóstico de assimetrias, pontos de tensão e prescrição automática de foco de treino.
          </Text>
        </View>

        {/* SELETOR DE CAMADAS VISUAIS */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip
            label="Músculos"
            selected={layer === 'musculo'}
            onPress={() => setLayer('musculo')}
          />
          <Chip
            label="Gordura"
            selected={layer === 'gordura'}
            onPress={() => setLayer('gordura')}
          />
          <Chip
            label="Postura"
            selected={layer === 'postura'}
            onPress={() => setLayer('postura')}
          />
        </View>
      </View>

      {/* 2. PAINEL DE TELEMETRIA E BALANÇO MUSCULAR (ESTILO DOS PRINTS DE REFERÊNCIA) */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <View
          style={{
            flex: 1,
            minWidth: 100,
            backgroundColor: themeColors.cardDark,
            padding: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: themeColors.borderDark,
          }}
        >
          <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700' }}>ÍNDICE DE FORÇA</Text>
          <Text style={{ color: '#10B981', fontSize: 18, fontWeight: '800' }}>87%</Text>
          <Text style={{ color: '#94A3B8', fontSize: 10 }}>Pontuação Ótima</Text>
        </View>

        <View
          style={{
            flex: 1,
            minWidth: 100,
            backgroundColor: themeColors.cardDark,
            padding: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: themeColors.borderDark,
          }}
        >
          <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700' }}>EQUILÍBRIO (D/E)</Text>
          <Text style={{ color: themeColors.cyan, fontSize: 18, fontWeight: '800' }}>98.2%</Text>
          <Text style={{ color: '#94A3B8', fontSize: 10 }}>Alta Simetria</Text>
        </View>

        <View
          style={{
            flex: 1,
            minWidth: 100,
            backgroundColor: themeColors.cardDark,
            padding: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: themeColors.borderDark,
          }}
        >
          <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700' }}>SAÚDE ARTICULAR</Text>
          <Text style={{ color: themeColors.amber, fontSize: 18, fontWeight: '800' }}>92%</Text>
          <Text style={{ color: '#94A3B8', fontSize: 10 }}>Proteção Cartilaginosa</Text>
        </View>
      </View>

      {/* 3. CANVAS 3D COM LINHAS VETORIAIS CONECTORAS (CALLOUT LINES) */}
      <View
        style={{
          width: '100%',
          backgroundColor: '#040711',
          borderRadius: 22,
          borderWidth: 1,
          borderColor: 'rgba(0, 240, 255, 0.25)',
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          marginVertical: 12,
        }}
      >
        <Svg viewBox="0 0 350 430" width="100%" height={400}>
          <Defs>
            {/* Gradiente Holográfico do Modelo Biomecânico */}
            <LinearGradient id="humanHoloGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={activeAccent} stopOpacity="0.55" />
              <Stop offset="40%" stopColor={activeAccent} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={activeAccent} stopOpacity="0.08" />
            </LinearGradient>

            {/* Gradiente de Ênfase Muscular Superior */}
            <LinearGradient id="chestHighlightGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={themeColors.coralRed} stopOpacity="0.7" />
              <Stop offset="100%" stopColor={themeColors.amber} stopOpacity="0.4" />
            </LinearGradient>

            {/* Gradiente de Ênfase no Quadríceps */}
            <LinearGradient id="legHighlightGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={themeColors.neonLime} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={themeColors.cyan} stopOpacity="0.2" />
            </LinearGradient>
          </Defs>

          {/* Grade Tecnológica Cibernética em Fundo */}
          {[-120, -80, -40, 0, 40, 80, 120].map((offset, i) => (
            <Line
              key={`grid-line-${i}`}
              x1="20"
              y1={215 + offset}
              x2="330"
              y2={215 + offset}
              stroke="#0D1527"
              strokeDasharray="2 6"
              strokeWidth="0.8"
            />
          ))}

          {/* Círculos de Radar de Postura (Inspirado no print 1 à esquerda) */}
          <Circle cx="175" cy="215" r="140" fill="none" stroke="#132038" strokeWidth="0.8" strokeDasharray="3 6" />
          <Circle cx="175" cy="215" r="95" fill="none" stroke="#172744" strokeWidth="0.8" />
          <Circle cx="175" cy="215" r="45" fill="none" stroke="#1D3155" strokeWidth="0.8" strokeDasharray="2 4" />

          {/* ================= MODELO BIOMECÂNICO ANATÔMICO ================= */}

          {/* CABEÇA & CRÂNIO HOLOGRÁFICO */}
          <Circle cx="175" cy="48" r="22" fill="none" stroke={activeAccent} strokeWidth="1.8" />
          <Circle cx="175" cy="48" r="15" fill="none" stroke={activeAccent} strokeDasharray="3 3" strokeWidth="1" opacity="0.4" />
          <Circle cx="175" cy="48" r="4" fill={activeAccent} opacity="0.8" />

          {/* PESCOÇO & COLUNA CERVICAL */}
          <Path d="M 168 70 L 168 85 L 182 85 L 182 70" fill="none" stroke={activeAccent} strokeWidth="1.5" />
          <Line x1="175" y1="70" x2="175" y2="230" stroke={themeColors.cyan} strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />

          {/* LINHA CLAVICULAR / ARTICULAÇÃO DOS OMBROS */}
          <Line x1="130" y1="92" x2="220" y2="92" stroke={activeAccent} strokeWidth="2" />
          <Circle cx="130" cy="92" r="5" fill={themeColors.cyan} />
          <Circle cx="220" cy="92" r="5" fill={themeColors.cyan} />

          {/* TRONCO / PEITORAL MAIOR / ABDÔMEN (COM DESTAQUE HOLOGRÁFICO) */}
          <Path
            d="M 135 92 L 120 135 L 130 215 L 175 235 L 220 215 L 230 135 L 215 92 Z"
            fill="url(#humanHoloGrad)"
            stroke={activeAccent}
            strokeWidth="1.8"
          />

          {/* Pectoralis Major - Fibras Iluminadas */}
          <Path
            d="M 138 98 Q 175 125 212 98 L 208 135 Q 175 150 142 135 Z"
            fill="url(#chestHighlightGrad)"
            stroke={themeColors.coralRed}
            strokeWidth="1.5"
            opacity="0.9"
          />
          {/* Fibras do Abdômen / Rectus Abdominis */}
          <Rect x="158" y="152" width="14" height="18" rx="3" fill={themeColors.amber} fillOpacity="0.4" stroke={themeColors.amber} strokeWidth="1" />
          <Rect x="178" y="152" width="14" height="18" rx="3" fill={themeColors.amber} fillOpacity="0.4" stroke={themeColors.amber} strokeWidth="1" />
          <Rect x="158" y="174" width="14" height="18" rx="3" fill={themeColors.amber} fillOpacity="0.4" stroke={themeColors.amber} strokeWidth="1" />
          <Rect x="178" y="174" width="14" height="18" rx="3" fill={themeColors.amber} fillOpacity="0.4" stroke={themeColors.amber} strokeWidth="1" />

          {/* MEMBRO SUPERIOR ESQUERDO (BÍCEPS/TRÍCEPS) */}
          <Path
            d="M 220 92 L 250 145 L 260 205 L 250 230 L 240 225 L 235 155 L 220 112"
            fill="url(#humanHoloGrad)"
            stroke={activeAccent}
            strokeWidth="1.5"
          />
          {/* Cotovelo & Pulso Esquerdo */}
          <Circle cx="250" cy="148" r="4" fill={themeColors.cyan} />
          <Circle cx="248" cy="226" r="3" fill={themeColors.cyan} />

          {/* MEMBRO SUPERIOR DIREITO */}
          <Path
            d="M 130 92 L 100 145 L 90 205 L 100 230 L 110 225 L 115 155 L 130 112"
            fill="url(#humanHoloGrad)"
            stroke={activeAccent}
            strokeWidth="1.5"
          />
          {/* Cotovelo & Pulso Direito */}
          <Circle cx="100" cy="148" r="4" fill={themeColors.cyan} />
          <Circle cx="102" cy="226" r="3" fill={themeColors.cyan} />

          {/* MEMBRO INFERIOR DIREITO (QUADRÍCEPS + PANTURRILHA) */}
          <Path
            d="M 130 215 L 170 235 L 160 315 L 152 390 L 130 390 L 125 315 L 120 235 Z"
            fill="url(#legHighlightGrad)"
            stroke={themeColors.neonLime}
            strokeWidth="1.6"
          />
          {/* Joelho Direito com Ponto Articular Neon */}
          <Circle cx="142" cy="315" r="5" fill={themeColors.amber} />
          <Circle cx="142" cy="315" r="9" fill="none" stroke={themeColors.amber} strokeWidth="1" strokeDasharray="2 3" />

          {/* MEMBRO INFERIOR ESQUERDO */}
          <Path
            d="M 220 215 L 180 235 L 190 315 L 198 390 L 220 390 L 225 315 L 230 235 Z"
            fill="url(#humanHoloGrad)"
            stroke={activeAccent}
            strokeWidth="1.6"
          />
          {/* Joelho Esquerdo com Ponto Articular Neon */}
          <Circle cx="208" cy="315" r="5" fill={themeColors.cyan} />
          <Circle cx="208" cy="315" r="9" fill="none" stroke={themeColors.cyan} strokeWidth="1" strokeDasharray="2 3" />

          {/* Pés & Base de Contato */}
          <Line x1="120" y1="400" x2="230" y2="400" stroke={themeColors.cyan} strokeWidth="1.5" strokeDasharray="4 2" />

          {/* ================= LINHAS EXPLICATIVAS (CALLOUTS DO PRINT) ================= */}

          {focusList.map((focus) => {
            const isSelected = selectedFocusId === focus.id;
            const lineColor = isSelected ? '#FFFFFF' : focus.color;

            // Linha quebrada angular conectando o ponto anatômico ao card lateral
            const midX = focus.align === 'left' ? focus.cx - 45 : focus.cx + 45;

            return (
              <G key={focus.id}>
                {/* Ponto no corpo anatômico com anel pulsante */}
                <Circle cx={focus.cx} cy={focus.cy} r={isSelected ? '6' : '4'} fill={lineColor} />
                <Circle cx={focus.cx} cy={focus.cy} r={isSelected ? '10' : '7'} fill="none" stroke={lineColor} strokeWidth="1" strokeDasharray="2 2" />

                {/* Linha angular (Diagonal ➔ Reta Horizontal) */}
                <Path
                  d={`M ${focus.cx} ${focus.cy} L ${midX} ${focus.calloutY} L ${focus.calloutX} ${focus.calloutY}`}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={isSelected ? '2' : '1.2'}
                  opacity={isSelected ? 1 : 0.85}
                />

                {/* Nó final do Callout */}
                <Circle cx={focus.calloutX} cy={focus.calloutY} r="3" fill={lineColor} />

                {/* Texto do Callout no Canvas */}
                <SvgText
                  x={focus.align === 'left' ? focus.calloutX + 4 : focus.calloutX - 4}
                  y={focus.calloutY - 6}
                  fill={lineColor}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor={focus.align === 'left' ? 'start' : 'end'}
                >
                  {focus.anatomicalName.split('&')[0].trim()}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* 4. MOTOR AUTOMÁTICO DE PRESCRIÇÃO: QUAIS PARTES DEVEMOS FOCAR PARA O TREINO */}
      <View style={{ gap: 10, marginTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: themeColors.cyan, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 }}>
              🎯 PRESCRIÇÃO INTELIGENTE DO ESTÚDIO
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
              O Que Devemos Focar no Treino
            </Text>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: 'rgba(0, 240, 255, 0.3)',
            }}
          >
            <Text style={{ color: themeColors.cyan, fontSize: 10, fontWeight: '700' }}>
              DIAGNÓSTICO AUTOMÁTICO
            </Text>
          </View>
        </View>

        {/* Pílulas de seleção de grupo de foco */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {focusList.map((f) => {
            const isSelected = (selectedFocusId || focusList[0].id) === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setSelectedFocusId(f.id)}
                style={{
                  backgroundColor: isSelected ? `${f.color}25` : themeColors.cardDark,
                  borderWidth: 1,
                  borderColor: isSelected ? f.color : themeColors.borderDark,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: f.color }} />
                <Text style={{ color: isSelected ? '#FFFFFF' : '#94A3B8', fontSize: 12, fontWeight: '700' }}>
                  {f.name.split('&')[0].trim()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Card em Destaque com a Justificativa e Exercícios Recomendados */}
        <View
          style={{
            backgroundColor: themeColors.cardDark,
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: activeFocus.color,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: activeFocus.color, fontSize: 11, fontWeight: '800' }}>
                FOCO PRIORITÁRIO SELECIONADO
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>
                {activeFocus.name}
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                {activeFocus.anatomicalName}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: `${activeFocus.color}20`,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: activeFocus.color, fontSize: 10, fontWeight: '800' }}>
                {activeFocus.category === 'simetria'
                  ? '⚖️ CORREÇÃO DE SIMETRIA'
                  : activeFocus.category === 'articulacao'
                  ? '🛡️ PROTEÇÃO ARTICULAR'
                  : '🔥 HIPERTROFIA PRIORITÁRIA'}
              </Text>
            </View>
          </View>

          {/* Diagnóstico Clínico do Módulo */}
          <View
            style={{
              backgroundColor: '#0B0F19',
              padding: 12,
              borderRadius: 12,
              borderLeftWidth: 3,
              borderLeftColor: activeFocus.color,
            }}
          >
            <Text style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 19 }}>
              {activeFocus.reason}
            </Text>
          </View>

          {/* Exercícios Prescritos com Foco Direto */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>
              EXERCÍCIOS PRESCRITOS PARA ESTE FOCO:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {activeFocus.recommendedExercises.map((exName, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: '#1E293B',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ color: activeFocus.color, fontSize: 11 }}>●</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>{exName}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Botão de Atalho para a Biblioteca de Exercícios */}
          {onSelectArea && (
            <Pressable
              onPress={() => onSelectArea(activeFocus.id)}
              style={{
                backgroundColor: activeFocus.color,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              <Text style={{ color: '#080C16', fontSize: 13, fontWeight: '800' }}>
                Ver Exercícios de {activeFocus.name.split('&')[0]} na Biblioteca ➔
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Card>
  );
}
