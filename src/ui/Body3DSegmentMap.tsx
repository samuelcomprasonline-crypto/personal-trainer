import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import type { BioimpedanceAssessment } from '../domain/types';
import { Body, Card, Chip, Label, Title } from './components';
import { useTheme } from './theme';

type LayerMode = 'musculo' | 'gordura' | 'postura';
type GenderMode = 'female' | 'male';

type BodyPartFocus = {
  id: string;
  name: string;
  anatomicalName: string;
  category: 'prioridade_alta' | 'simetria' | 'postura' | 'articulacao';
  reason: string;
  recommendedExercises: string[];
  topPercent: number; // % vertical no corpo
  leftPercent: number; // % horizontal no corpo
  side: 'left' | 'right';
  badgeColor: string;
};

interface Body3DSegmentMapProps {
  bio: BioimpedanceAssessment;
  onSelectArea?: (area: string) => void;
}

export function Body3DSegmentMap({ bio, onSelectArea }: Body3DSegmentMapProps) {
  const t = useTheme();
  // Inicialização inteligente respeitando o sexo cadastrado na bioimpedância
  const defaultGender: GenderMode = bio?.sexo === 'M' ? 'male' : 'female';
  const [gender, setGender] = useState<GenderMode>(defaultGender);
  const [viewMode, setViewMode] = useState<'clinical' | 'hologram'>('clinical');
  const [layer, setLayer] = useState<LayerMode>('musculo');
  const [selectedFocusId, setSelectedFocusId] = useState<string | null>('peito');

  // Paleta estética futurista dos prints de referência médica
  const themeColors = {
    cyan: '#00F0FF',
    neonLime: '#C6F432',
    coralRed: '#FF4D6D',
    amber: '#FFB703',
    purple: '#A855F7',
    darkBg: '#050811',
    cardDark: '#0B1220',
    borderDark: 'rgba(0, 240, 255, 0.2)',
  };

  // Imagens ultra-realistas em 3D por sexo
  const femaleClinicalImage = require('../../assets/belat_female_ref.jpg');
  const maleClinicalImage = require('../../assets/vitality_male_ref.jpg');
  const femaleHoloImage = require('../../assets/aurora_3d_female.jpg');
  const maleHoloImage = require('../../assets/aurora_3d_male.jpg');

  const currentDisplayImage =
    viewMode === 'clinical'
      ? gender === 'female'
        ? femaleClinicalImage
        : maleClinicalImage
      : gender === 'female'
      ? femaleHoloImage
      : maleHoloImage;

  // 1. MOTOR INTELIGENTE DE PRESCRIÇÃO E FOCO DE TREINO POR SEXO
  const armL = bio?.segmentar?.musculo?.bracoEsquerdo?.kg ?? (gender === 'female' ? 2.6 : 3.8);
  const armR = bio?.segmentar?.musculo?.bracoDireito?.kg ?? (gender === 'female' ? 2.7 : 3.9);
  const legL = bio?.segmentar?.musculo?.pernaEsquerda?.kg ?? (gender === 'female' ? 7.2 : 9.8);
  const legR = bio?.segmentar?.musculo?.pernaDireita?.kg ?? (gender === 'female' ? 7.4 : 9.9);
  const trunkFat = bio?.segmentar?.gordura?.tronco?.proporcaoPadraoPerc ?? 115;
  const armDelta = Math.abs(armR - armL);
  const legDelta = Math.abs(legR - legL);

  const focusPoints: BodyPartFocus[] =
    gender === 'female'
      ? [
          {
            id: 'ombro',
            name: 'Deltoides & Postura Escapular',
            anatomicalName: 'Deltoideus & Trapezius Superior',
            category: 'postura',
            reason: 'Alinhamento da cintura escapular para postura ereta e desenho harmônico dos ombros.',
            recommendedExercises: ['Elevação Lateral Halteres', 'Crucifixo Invertido na Polia', 'Desenvolvimento Arnold'],
            topPercent: 22,
            leftPercent: 36,
            side: 'left',
            badgeColor: themeColors.coralRed,
          },
          {
            id: 'core_fem',
            name: 'Core & Cintura',
            anatomicalName: 'Transversus Abdominis & Obliquus',
            category: 'prioridade_alta',
            reason: 'Ativação do transverso para afinar a linha de cintura e proteger a lombar em agachamentos.',
            recommendedExercises: ['Vacuum Abdominal', 'Prancha Lateral Isométrica', 'Abdominal Infra Suspenso'],
            topPercent: 38,
            leftPercent: 54,
            side: 'right',
            badgeColor: themeColors.amber,
          },
          {
            id: 'gluteo_coxa',
            name: 'Glúteos & Isquiotibiais',
            anatomicalName: 'Gluteus Maximus & Biceps Femoris',
            category: legDelta > 0.15 ? 'simetria' : 'prioridade_alta',
            reason:
              legDelta > 0.15
                ? `Desvio de ${(legDelta * 1000).toFixed(0)}g entre membros. Indispensável elevação pélvica e búlgaro unilateral.`
                : 'Foco em hipertrofia de cadeia posterior para densidade, curvas e suporte pélvico.',
            recommendedExercises: ['Elevação Pélvica com Barra', 'Stiff com Halteres', 'Agachamento Búlgaro'],
            topPercent: 54,
            leftPercent: 44,
            side: 'left',
            badgeColor: themeColors.neonLime,
          },
          {
            id: 'quadriceps_fem',
            name: 'Quadríceps & Joelho',
            anatomicalName: 'Rectus Femoris & Vasto Medial',
            category: 'articulacao',
            reason: 'Fortalecimento do vasto medial para rastreamento patelar perfeito e firmeza nas coxas.',
            recommendedExercises: ['Leg Press 45° Pés Médios', 'Agachamento Sumô Halter', 'Cadeira Extensora'],
            topPercent: 68,
            leftPercent: 52,
            side: 'right',
            badgeColor: themeColors.cyan,
          },
        ]
      : [
          {
            id: 'peito',
            name: 'Peitoral & Deltoide',
            anatomicalName: 'Pectoralis Major & Deltoideus',
            category: 'prioridade_alta',
            reason: 'Foco prioritário em porção clavicular (superior) para densidade e postura escapular.',
            recommendedExercises: ['Supino Inclinado com Halteres', 'Crucifixo Máquina', 'Flexões no Solo'],
            topPercent: 24,
            leftPercent: 44,
            side: 'left',
            badgeColor: themeColors.coralRed,
          },
          {
            id: 'bracos',
            name: 'Bíceps & Antebraço',
            anatomicalName: 'Biceps Brachii & Flexores',
            category: armDelta > 0.1 ? 'simetria' : 'prioridade_alta',
            reason:
              armDelta > 0.1
                ? `Assimetria funcional detectada (${(armDelta * 1000).toFixed(0)}g de diferença bilateral). Priorizar rosca unilateral iniciando pelo braço mais fraco.`
                : 'Excelente simetria de força. Manter sobrecarga progressiva com pesos livres.',
            recommendedExercises: ['Rosca Alternada com Giro', 'Rosca Direta Barra W', 'Rosca Martelo'],
            topPercent: 35,
            leftPercent: 68,
            side: 'right',
            badgeColor: themeColors.cyan,
          },
          {
            id: 'core',
            name: 'Reto Abdominal & Core',
            anatomicalName: 'Rectus Abdominis & Transversus',
            category: trunkFat > 100 ? 'prioridade_alta' : 'postura',
            reason:
              trunkFat > 100
                ? 'Gordura abdominal em 115%. Prescrever circuito metabólico e estabilização isométrica para queima calórica e suporte lombar.'
                : 'Excelente tônus da musculatura profunda do abdômen. Foco em estabilidade lombar.',
            recommendedExercises: ['Prancha Frontal Isométrica', 'Abdominal Infra na Paralela', 'Vacuum Abdominal'],
            topPercent: 42,
            leftPercent: 50,
            side: 'left',
            badgeColor: themeColors.amber,
          },
          {
            id: 'quadriceps',
            name: 'Quadríceps & Glúteos',
            anatomicalName: 'Quadriceps Femoris & Gluteus',
            category: legDelta > 0.2 ? 'simetria' : 'prioridade_alta',
            reason:
              legDelta > 0.2
                ? `Desvio de ${(legDelta * 1000).toFixed(0)}g entre coxas. Indicação imediata de leg press e agachamento búlgaro unilateral.`
                : 'Pernas bem desenvolvidas e equilibradas. Estimular volume para manutenção da taxa metabólica basal.',
            recommendedExercises: ['Agachamento Búlgaro com Halteres', 'Leg Press 45°', 'Cadeira Extensora'],
            topPercent: 62,
            leftPercent: 43,
            side: 'right',
            badgeColor: themeColors.neonLime,
          },
          {
            id: 'panturrilha',
            name: 'Gastrocnêmio & Sóleo',
            anatomicalName: 'Gastrocnemius & Soleus',
            category: 'articulacao',
            reason: 'Estabilidade essencial para o complexo tornozelo-joelho em agachamentos e corrida.',
            recommendedExercises: ['Elevação de Panturrilha em Pé', 'Gêmeos Sentado na Máquina', 'Salto com Corda'],
            topPercent: 82,
            leftPercent: 55,
            side: 'right',
            badgeColor: themeColors.cyan,
          },
        ];

  const activeFocus = focusPoints.find((f) => f.id === selectedFocusId) || focusPoints[0];

  return (
    <Card style={{ backgroundColor: themeColors.darkBg, borderColor: themeColors.borderDark, borderWidth: 1, padding: 18, gap: 16 }}>
      {/* 1. TOPO: TÍTULO, SELETOR DE SEXO ULTRA-REALISTA E MODO DE VISÃO */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: themeColors.cyan, shadowColor: themeColors.cyan, shadowOpacity: 1, shadowRadius: 6 }} />
            <Label style={{ color: themeColors.cyan, fontWeight: '800', letterSpacing: 1 }}>
              ESCANEAMENTO BIOMÉTRICO 3D ULTRA-REALISTA
            </Label>
          </View>
          <Title size={24} style={{ color: '#FFFFFF', marginTop: 4 }}>
            {gender === 'female' ? '♀ Modelo Anatômico Feminino (Belat 3D)' : '♂ Modelo Anatômico Masculino (Vitality 3D)'}
          </Title>
          <Body muted style={{ fontSize: 13 }}>
            Renderização fotorrealista da biomecânica, telemetria muscular e prescrição corretiva.
          </Body>
        </View>

        {/* SELETOR ULTRA-REALISTA POR SEXO (MASCULINO / FEMININO) COM DESTAQUE TOTAL */}
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: themeColors.cardDark,
              borderRadius: 12,
              padding: 4,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.12)',
              gap: 4,
            }}
          >
            <Pressable
              onPress={() => {
                setGender('female');
                setSelectedFocusId(null);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 9,
                backgroundColor: gender === 'female' ? 'rgba(255, 77, 109, 0.25)' : 'transparent',
                borderWidth: 1,
                borderColor: gender === 'female' ? themeColors.coralRed : 'transparent',
              }}
            >
              <Text style={{ fontSize: 15 }}>♀</Text>
              <Text style={{ color: gender === 'female' ? '#FF4D6D' : '#94A3B8', fontSize: 13, fontWeight: '800' }}>
                Feminino
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setGender('male');
                setSelectedFocusId(null);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 9,
                backgroundColor: gender === 'male' ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
                borderWidth: 1,
                borderColor: gender === 'male' ? themeColors.cyan : 'transparent',
              }}
            >
              <Text style={{ fontSize: 15 }}>♂</Text>
              <Text style={{ color: gender === 'male' ? '#00F0FF' : '#94A3B8', fontSize: 13, fontWeight: '800' }}>
                Masculino
              </Text>
            </Pressable>
          </View>

          {/* ALTERNÂNCIA DE VISÃO: CLÍNICA COMPLETA VS HOLOGRAMA FOCADO */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#070E1B',
              borderRadius: 10,
              padding: 3,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              gap: 2,
            }}
          >
            <Pressable
              onPress={() => setViewMode('clinical')}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 7,
                backgroundColor: viewMode === 'clinical' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              }}
            >
              <Text style={{ color: viewMode === 'clinical' ? '#FFFFFF' : '#64748B', fontSize: 11, fontWeight: '700' }}>
                Painel Completo
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setViewMode('hologram')}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 7,
                backgroundColor: viewMode === 'hologram' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
              }}
            >
              <Text style={{ color: viewMode === 'hologram' ? themeColors.cyan : '#64748B', fontSize: 11, fontWeight: '700' }}>
                Holograma Focado
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* SELETOR DE CAMADAS: MÚSCULO / GORDURA / POSTURA */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Chip
          label="⚡ Densidade Muscular"
          selected={layer === 'musculo'}
          onPress={() => setLayer('musculo')}
        />
        <Chip
          label="🔥 Adiposidade Segmentar"
          selected={layer === 'gordura'}
          onPress={() => setLayer('gordura')}
        />
        <Chip
          label="⚖️ Equilíbrio & Postura"
          selected={layer === 'postura'}
          onPress={() => setLayer('postura')}
        />
      </View>

      {/* 2. PAINEL DE TELEMETRIA E BALANÇO POR SEXO */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryLabel}>ÍNDICE DE FORÇA</Text>
          <Text style={[styles.telemetryValue, { color: themeColors.neonLime }]}>
            {gender === 'female' ? '79%' : '82%'}
          </Text>
          <Text style={styles.telemetrySub}>Potência & Tônus</Text>
        </View>

        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryLabel}>EQUILÍBRIO (D/E)</Text>
          <Text style={[styles.telemetryValue, { color: themeColors.cyan }]}>
            {gender === 'female' ? '97.5%' : '98.2%'}
          </Text>
          <Text style={styles.telemetrySub}>Simetria Ativa</Text>
        </View>

        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryLabel}>SAÚDE ARTICULAR</Text>
          <Text style={[styles.telemetryValue, { color: themeColors.amber }]}>
            {gender === 'female' ? '94%' : '92%'}
          </Text>
          <Text style={styles.telemetrySub}>Cartilagem Protegida</Text>
        </View>

        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryLabel}>FREQ. CARDÍACA</Text>
          <Text style={[styles.telemetryValue, { color: themeColors.coralRed }]}>
            {gender === 'female' ? '68 BPM' : '72 BPM'}
          </Text>
          <Text style={styles.telemetrySub}>Repouso Estável</Text>
        </View>
      </View>

      {/* 3. VISOR 3D ULTRA-REALISTA COM IMAGEM DE ALTA DEFINIÇÃO & CALLOUTS */}
      <View style={[styles.hologramViewport, viewMode === 'clinical' && { height: 580 }]}>
        {/* Imagem Ultra-Realista do Sexo Selecionado */}
        <Image
          source={currentDisplayImage}
          style={styles.hologramImage}
          resizeMode={viewMode === 'clinical' ? 'contain' : 'cover'}
        />

        {/* Efeito de Grade Cibernética e Radar de Fundo */}
        <View style={styles.gridOverlay} pointerEvents="none" />

        {/* Linhas de Telemetria e Pontos de Foco Interativos no Modo Holograma */}
        {viewMode === 'hologram' &&
          focusPoints.map((pt) => {
            const isSelected = pt.id === selectedFocusId;
            return (
              <Pressable
                key={pt.id}
                onPress={() => setSelectedFocusId(pt.id)}
                style={[
                  styles.calloutNode,
                  {
                    top: `${pt.topPercent}%` as any,
                    left: `${pt.leftPercent}%` as any,
                    transform: [{ translateX: -14 }, { translateY: -14 }],
                  },
                ]}
              >
                {/* Círculo com pulso neon */}
                <View
                  style={[
                    styles.calloutPulseRing,
                    {
                      borderColor: pt.badgeColor,
                      backgroundColor: isSelected ? `${pt.badgeColor}40` : `${pt.badgeColor}20`,
                    },
                  ]}
                >
                  <View style={[styles.calloutCenterDot, { backgroundColor: pt.badgeColor }]} />
                </View>

                {/* Tag / Badge Flutuante */}
                <View
                  style={[
                    styles.calloutBadge,
                    isSelected && styles.calloutBadgeActive,
                    pt.side === 'left' ? { right: 28 } : { left: 28 },
                  ]}
                >
                  <Text style={[styles.calloutBadgeTitle, { color: pt.badgeColor }]}>{pt.name}</Text>
                  <Text style={styles.calloutBadgeSub}>{pt.anatomicalName}</Text>
                </View>
              </Pressable>
            );
          })}
      </View>

      {/* 4. CARD DETALHADO DO PONTO DE FOCO SELECIONADO & PRESCRIÇÃO AUTOMÁTICA */}
      {activeFocus && (
        <View
          style={{
            backgroundColor: themeColors.cardDark,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: activeFocus.badgeColor,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <View>
              <Text style={{ color: activeFocus.badgeColor, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                FOCO PRESCRITO PELO MOTOR AURORA ({gender === 'female' ? 'FEMININO' : 'MASCULINO'}):
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>
                {activeFocus.name} ({activeFocus.anatomicalName})
              </Text>
            </View>

            <View
              style={{
                backgroundColor: `${activeFocus.badgeColor}20`,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: activeFocus.badgeColor,
              }}
            >
              <Text style={{ color: activeFocus.badgeColor, fontSize: 11, fontWeight: '800' }}>
                {activeFocus.category === 'simetria'
                  ? '⚖️ CORREÇÃO DE SIMETRIA'
                  : activeFocus.category === 'postura'
                  ? '🛡️ ALINHAMENTO POSTURAL'
                  : '⚡ HIPERTROFIA PRIORITÁRIA'}
              </Text>
            </View>
          </View>

          <Text style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 19 }}>
            {activeFocus.reason}
          </Text>

          <View style={{ marginTop: 6, gap: 4 }}>
            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>
              EXERCÍCIOS RECOMENDADOS NA BIBLIOTECA AURORA:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {activeFocus.recommendedExercises.map((ex, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>• {ex}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* 5. SEÇÃO EDUCATIVA COMPLETA: EXPLICAÇÃO DETALHADA DA AUTOAVALIAÇÃO PARA O ALUNO */}
      <View
        style={{
          backgroundColor: '#070D1A',
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(0, 240, 255, 0.15)',
          gap: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 22 }}>🧠</Text>
          <View>
            <Title size={18} style={{ color: '#FFFFFF' }}>
              Guia da Avaliação 360° para o Aluno
            </Title>
            <Body muted style={{ fontSize: 12 }}>
              Entenda como cada indicador reflete sua saúde, força e estética.
            </Body>
          </View>
        </View>

        {/* PONTO 1: ASSIMETRIA BILATERAL */}
        <View style={styles.guideBlock}>
          <Text style={[styles.guideTitle, { color: themeColors.cyan }]}>
            1. Por que analisamos as Assimetrias Musculares (Direita vs Esquerda)?
          </Text>
          <Text style={styles.guideText}>
            Todo ser humano possui um lado dominante decorrente do uso diário (escrever, carregar peso, postura ao sentar). Quando um braço ou uma perna tem mais massa ou força do que o outro, o cérebro transfere a sobrecarga para esse membro durante exercícios com barra.
            {'\n\n'}
            <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Como o estúdio corrige:</Text> Prescrevemos exercícios bilaterais independentes (halteres e polias unilaterais), sempre iniciando a contagem de repetições pelo lado com menor massa até equalizar os dois lados.
          </Text>
        </View>

        {/* PONTO 2: MASSA MUSCULAR ESQUELÉTICA */}
        <View style={styles.guideBlock}>
          <Text style={[styles.guideTitle, { color: themeColors.neonLime }]}>
            2. Massa Muscular Esquelética: O verdadeiro motor do seu metabolismo
          </Text>
          <Text style={styles.guideText}>
            Diferente da gordura corporal que apenas armazena energia, o músculo esquelético é um tecido contrátil e metabolicamente ativo. Cada quilograma de músculo que você constrói aumenta sua Taxa Metabólica Basal (BMR), fazendo com que seu corpo queime calorias 24 horas por dia, inclusive enquanto você dorme.
          </Text>
        </View>

        {/* PONTO 3: GORDURA VISCERAL E TRONCO */}
        <View style={styles.guideBlock}>
          <Text style={[styles.guideTitle, { color: themeColors.coralRed }]}>
            3. Gordura do Tronco e Gordura Visceral
          </Text>
          <Text style={styles.guideText}>
            A gordura acumulada na região do tronco e órgãos internos influencia a inflamação corporal e a sensibilidade à insulina. Ao combinar o protocolo de força de alta intensidade com o planejamento de macros na aba Nutrição, eliminamos a gordura visceral enquanto preservamos suas curvas e tônus muscular.
          </Text>
        </View>

        {/* PONTO 4: SAÚDE ARTICULAR */}
        <View style={styles.guideBlock}>
          <Text style={[styles.guideTitle, { color: themeColors.amber }]}>
            4. Proteção Articular e Prevenção de Dores
          </Text>
          <Text style={styles.guideText}>
            O índice de saúde articular reflete o alinhamento das forças nos joelhos, ombros e coluna. Fortalecer os músculos estabilizadores (manguito rotador, glúteo médio e transverso abdominal) protege sua cartilagem contra desgastes precoces e elimina dores no dia a dia.
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  telemetryCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#0B1220',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  telemetryLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  telemetryValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  telemetrySub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  hologramViewport: {
    width: '100%',
    height: 440,
    backgroundColor: '#02050E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hologramImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
  },
  calloutNode: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  calloutPulseRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutCenterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  calloutBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(11, 18, 32, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 110,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  calloutBadgeActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#0C1628',
  },
  calloutBadgeTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  calloutBadgeSub: {
    color: '#94A3B8',
    fontSize: 9,
  },
  guideBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    gap: 6,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  guideText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
  },
});
