import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { BioimpedanceAssessment, SkinfoldsData } from '../domain/types';
import { Body, Card, Chip, Label, Title } from './components';
import { useTheme } from './theme';

type LayerMode = 'musculo' | 'gordura' | 'postura';
type GenderMode = 'female' | 'male';

export type BodyPartFocus = {
  id: string;
  name: string;
  anatomicalRegion: string;
  category: 'prioridade_maxima' | 'simetria' | 'metabolico' | 'articulacao';
  severity: 'alerta' | 'atencao' | 'otimo';
  skinfoldValueMm?: number;
  skinfoldName?: string;
  bioValue: string;
  bioMetric: string;
  diagnosis: string;
  trainingPrescription: string;
  dietPrescription: string;
  targetGoal: string;
  recommendedExercises: string[];
  topPercent: number; // % vertical no corpo
  leftPercent: number; // % horizontal no corpo
  badgeColor: string;
};

export interface Body3DSegmentMapProps {
  bio: BioimpedanceAssessment;
  skinfolds?: SkinfoldsData;
  goal?: string;
  diet?: {
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    waterMl?: number;
  };
  onSelectArea?: (area: string) => void;
}

export function Body3DSegmentMap({
  bio,
  skinfolds,
  goal = 'Hipertrofia Limpa com Redução de Gordura Central',
  diet,
  onSelectArea,
}: Body3DSegmentMapProps) {
  const t = useTheme();
  const defaultGender: GenderMode = bio?.sexo === 'M' ? 'male' : 'female';
  const [gender, setGender] = useState<GenderMode>(defaultGender);
  const [viewMode, setViewMode] = useState<'clinical' | 'hologram'>('clinical');
  const [selectedFocusId, setSelectedFocusId] = useState<string>('core_abdomen');
  const [pulseTick, setPulseTick] = useState(0);

  // Efeito de "vida" e pulsação em tempo real no modelo biométrico
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 100);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const themeColors = {
    cyan: '#00F0FF',
    neonLime: '#10B981',
    coralRed: '#FF4D6D',
    amber: '#FFB703',
    purple: '#A855F7',
    darkBg: '#090D14',
    cardDark: '#121722',
    surfaceCard: '#171E2D',
    borderDark: 'rgba(255, 255, 255, 0.08)',
  };

  // Imagens ultra-realistas em 3D
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

  // DADOS REALISTAS DE ENTRADA (BIOIMPEDÂNCIA + DOBRAS + DIETA)
  const abdominalFold = skinfolds?.abdominalMm ?? 24;
  const suprailiacFold = skinfolds?.suprailiacaMm ?? 20;
  const subscapularFold = skinfolds?.subescapularMm ?? 18;
  const thighFold = skinfolds?.coxaMm ?? 19;
  const tricepsFold = skinfolds?.tricipitalMm ?? 12;

  const currentBf = bio?.percGordura ?? 21.2;
  const skeletalMuscleKg = bio?.massaMuscularEsqueleticaKg ?? 38.7;
  const visceralLevel = bio?.gorduraVisceralNivel ?? 8;
  const totalWaterKg = bio?.aguaTotalKg ?? 52.6;
  const weightKg = bio?.pesoKg ?? 91.2;
  const waterPercent = Math.round((totalWaterKg / weightKg) * 100 * 10) / 10 || 57.7;
  const trunkFatPerc = bio?.segmentar?.gordura?.tronco?.proporcaoPadraoPerc ?? 115;

  const armL = bio?.segmentar?.musculo?.bracoEsquerdo?.kg ?? (gender === 'female' ? 2.6 : 3.8);
  const armR = bio?.segmentar?.musculo?.bracoDireito?.kg ?? (gender === 'female' ? 2.7 : 3.9);
  const armDeltaGrams = Math.round(Math.abs(armR - armL) * 1000);

  const dailyCalories = diet?.calories ?? 2450;
  const dailyProtein = diet?.proteinG ?? 185;
  const dailyWaterMl = diet?.waterMl ?? 3500;
  const proteinPerKg = (dailyProtein / weightKg).toFixed(1);

  // MOTOR INTELIGENTE: PONTOS DE FOCO QUE O ALUNO DEVE TRABALHAR MAIS
  const focusPoints: BodyPartFocus[] = [
    {
      id: 'core_abdomen',
      name: 'Região Abdominal & Flancos',
      anatomicalRegion: 'Reto Abdominal, Oblíquos & Gordura Visceral',
      category: 'prioridade_maxima',
      severity: abdominalFold > 20 || visceralLevel > 6 ? 'alerta' : 'atencao',
      skinfoldName: 'Dobra Abdominal',
      skinfoldValueMm: abdominalFold,
      bioMetric: 'Gordura Visceral & Tronco',
      bioValue: `Nível ${visceralLevel} (Tronco ${trunkFatPerc}%)`,
      diagnosis: `Dobra abdominal em ${abdominalFold}mm associada a gordura visceral nível ${visceralLevel}. Acúmulo central acima do padrão estético de corte (meta < 14mm).`,
      trainingPrescription:
        'Adicionar 25 min de cardio contínuo em Zona 2 (125-135 bpm) 4x/semana pós-treino + 3 séries de vacuum abdominal e prancha anti-extensão ao acordar.',
      dietPrescription: `Déficit calórico de 300 kcal/dia. Concentrar 60% dos carboidratos no pré e pós-treino e manter proteína alta em ${proteinPerKg}g/kg para proteger a massa magra.`,
      targetGoal: 'Reduzir dobra abdominal de 24mm para 15mm e visceral para nível ≤ 5.',
      recommendedExercises: ['Prancha Frontal Isométrica', 'Vacuum Abdominal', 'Cardio LISS Zona 2', 'Abdominal Infra na Paralela'],
      topPercent: gender === 'female' ? 44 : 42,
      leftPercent: 50,
      badgeColor: themeColors.coralRed,
    },
    {
      id: 'membros_superiores',
      name: 'Simetria & Massa dos Membros Superiores',
      anatomicalRegion: 'Bíceps, Tríceps & Deltoides',
      category: 'simetria',
      severity: armDeltaGrams > 80 ? 'atencao' : 'otimo',
      skinfoldName: 'Dobra Tricipital',
      skinfoldValueMm: tricepsFold,
      bioMetric: 'Diferença Bilateral de Braços',
      bioValue: `${armDeltaGrams}g (E: ${armL.toFixed(1)}kg / D: ${armR.toFixed(1)}kg)`,
      diagnosis:
        armDeltaGrams > 80
          ? `Assimetria funcional de ${armDeltaGrams}g entre braço dominante e não-dominante. Braço esquerdo necessita de igualação de volume de treino.`
          : 'Excelente simetria de membros superiores. Foco em sobrecarga progressiva para hipertrofia pura.',
      trainingPrescription:
        'Iniciar exercícios isoladores sempre pelo braço esquerdo usando halteres ou cabos unilaterais, igualando as repetições no braço direito.',
      dietPrescription: `Manter ingestão proteica fracionada de ${dailyProtein}g/dia dividida em 4 a 5 refeições com pelo menos 3g de leucina para estímulo contínuo da via mTOR.`,
      targetGoal: 'Equalizar volume bilateral para desvio inferior a 40g e expandir 1cm de braço.',
      recommendedExercises: ['Rosca Alternada com Halteres', 'Tríceps Unilateral na Polia', 'Desenvolvimento Halteres Unilateral'],
      topPercent: 33,
      leftPercent: gender === 'female' ? 70 : 68,
      badgeColor: themeColors.cyan,
    },
    {
      id: 'hidratacao_celular',
      name: 'Hidratação & Água Intracelular',
      anatomicalRegion: 'Volemia Muscular & Hidratação Total',
      category: 'metabolico',
      severity: waterPercent < 60 ? 'atencao' : 'otimo',
      bioMetric: 'Água Corporal Total',
      bioValue: `${waterPercent}% (${totalWaterKg} Litros)`,
      diagnosis:
        waterPercent < 60
          ? `Hidratação corporal em ${waterPercent}%. A faixa ideal para hipertrofia e síntese proteica acelerada é acima de 60%. O músculo desidratado perde força contrátil.`
          : 'Excelente hidratação e volume intracelular. Manter protocolo de reposição eletrolítica.',
      trainingPrescription:
        'Ingerir 500ml de água com eletrólitos durante a sessão de treino para manter a volemia e evitar fadiga neuromuscular precoce.',
      dietPrescription: `Elevar ingestão hídrica de ${dailyWaterMl}ml para 4.100ml/dia (45ml/kg) + 5g diárias de Creatina Monohidratada para carrear água para dentro das fibras musculares.`,
      targetGoal: 'Alcançar > 61% de água corporal total na próxima avaliação de bioimpedância.',
      recommendedExercises: ['Consumo de 5g Creatina', 'Hidratação 45ml/kg', 'Eletrólitos Intra-Treino'],
      topPercent: 50,
      leftPercent: 50,
      badgeColor: themeColors.neonLime,
    },
    {
      id: 'coxas_quadriceps',
      name: 'Definição & Densidade de Pernas',
      anatomicalRegion: 'Quadríceps, Isquiotibiais & Glúteos',
      category: 'prioridade_maxima',
      severity: thighFold > 16 ? 'atencao' : 'otimo',
      skinfoldName: 'Dobra da Coxa',
      skinfoldValueMm: thighFold,
      bioMetric: 'Massa Muscular de Pernas',
      bioValue: '19.7 kg combinados',
      diagnosis: `Base muscular expressiva nas pernas. Dobra da coxa em ${thighFold}mm. O trabalho prioritário é reduzir a dobra para evidenciar os cortes laterais do vasto lateral e reto femoral.`,
      trainingPrescription:
        'Priorizar cadência excêntrica de 3 a 4 segundos no Agachamento Livre e Leg Press 45°, aumentando a densidade e gasto energético pós-treino (EPOC).',
      dietPrescription:
        'Manter carboidratos complexos (arroz, batata doce, aveia) nos dias de treino de pernas para suprir os estoques de glicogênio sem retenção extracelular.',
      targetGoal: 'Reduzir dobra da coxa de 19mm para 13mm mantendo a massa magra acima de 19.5kg.',
      recommendedExercises: ['Agachamento Livre com Barra', 'Leg Press 45° Pés Médios', 'Stiff com Barra', 'Cadeira Extensora'],
      topPercent: gender === 'female' ? 66 : 64,
      leftPercent: 44,
      badgeColor: themeColors.amber,
    },
    {
      id: 'dorsal_postura',
      name: 'Dorsais & Cintura Escapular',
      anatomicalRegion: 'Latissimus Dorsi & Subescapular',
      category: 'simetria',
      severity: subscapularFold > 16 ? 'atencao' : 'otimo',
      skinfoldName: 'Dobra Subescapular',
      skinfoldValueMm: subscapularFold,
      bioMetric: 'Massa do Tronco',
      bioValue: '31.2 kg (102% do padrão)',
      diagnosis: `Dobra subescapular em ${subscapularFold}mm. Fortalecimento da grande dorsal e romboides para criar a silhueta em "V" (proporção ombro/cintura) e suporte postural.`,
      trainingPrescription:
        'Puxadas verticais com pegada pronada aberta e remada curvada com barra, enfatizando a depressão escapular completa na contração.',
      dietPrescription: 'Alinhamento nutricional padrão com superávit calórico controlado em dias de treino de costas.',
      targetGoal: 'Reduzir dobra subescapular para 12mm e ampliar largura dorsal.',
      recommendedExercises: ['Puxada Alta Pronada', 'Remada Curvada com Barra', 'Remada Cavalinho'],
      topPercent: 26,
      leftPercent: 40,
      badgeColor: themeColors.purple,
    },
  ];

  const activeFocus = focusPoints.find((f) => f.id === selectedFocusId) || focusPoints[0];

  return (
    <View style={{ gap: 20 }}>
      {/* 1. CABEÇALHO DO LAUDO 3D */}
      <Card style={{ backgroundColor: themeColors.darkBg, borderColor: themeColors.borderDark, borderWidth: 1, padding: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: themeColors.neonLime,
                  shadowColor: themeColors.neonLime,
                  shadowOpacity: 1,
                  shadowRadius: 8,
                }}
              />
              <Text style={{ color: themeColors.neonLime, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                TELEMETRIA ANATÔMICA 3D VIVA
              </Text>
            </View>
            <Title size={24} style={{ color: '#FFFFFF' }}>
              Diagnóstico Biométrico & Foco de Ação
            </Title>
            <Body muted style={{ fontSize: 13 }}>
              Mapeamento dinâmico cruzando Dobras Cutâneas + Bioimpedância + Dieta + Objetivo.
            </Body>
          </View>

          {/* SELETOR DE SEXO ANATÔMICO */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: themeColors.cardDark,
              borderRadius: 12,
              padding: 4,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              gap: 4,
            }}
          >
            <Pressable
              onPress={() => setGender('male')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 9,
                backgroundColor: gender === 'male' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                borderWidth: 1,
                borderColor: gender === 'male' ? themeColors.cyan : 'transparent',
              }}
            >
              <Text style={{ color: gender === 'male' ? themeColors.cyan : '#94A3B8', fontSize: 13, fontWeight: '800' }}>
                ♂ Masculino (Vitality 3D)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGender('female')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 9,
                backgroundColor: gender === 'female' ? 'rgba(255, 77, 109, 0.25)' : 'transparent',
                borderWidth: 1,
                borderColor: gender === 'female' ? themeColors.coralRed : 'transparent',
              }}
            >
              <Text style={{ color: gender === 'female' ? themeColors.coralRed : '#94A3B8', fontSize: 13, fontWeight: '800' }}>
                ♀ Feminino (Belat 3D)
              </Text>
            </Pressable>
          </View>
        </View>

        {/* RESUMO DO OBJETIVO E DIETA ATUAL */}
        <View
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(16, 185, 129, 0.2)',
            borderRadius: 14,
            padding: 14,
            gap: 12,
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={{ color: t.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
              OBJETIVO PRINCIPAL PRESCRITO
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' }}>
              🎯 {goal}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <View style={{ minWidth: '45%', flex: 1, alignItems: 'flex-start' }}>
              <Text style={{ color: t.muted, fontSize: 9.5, fontWeight: '700' }}>META CALÓRICA</Text>
              <Text style={{ color: themeColors.neonLime, fontSize: 14, fontWeight: '800' }}>{dailyCalories} kcal</Text>
            </View>
            <View style={{ minWidth: '45%', flex: 1, alignItems: 'flex-start' }}>
              <Text style={{ color: t.muted, fontSize: 9.5, fontWeight: '700' }}>PROTEÍNA DIÁRIA</Text>
              <Text style={{ color: '#00F0FF', fontSize: 14, fontWeight: '800' }}>{dailyProtein}g ({proteinPerKg}g/kg)</Text>
            </View>
            <View style={{ minWidth: '45%', flex: 1, alignItems: 'flex-start' }}>
              <Text style={{ color: t.muted, fontSize: 9.5, fontWeight: '700' }}>ÁGUA DIÁRIA</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>{dailyWaterMl} ml</Text>
            </View>
            <View style={{ minWidth: '45%', flex: 1, alignItems: 'flex-start' }}>
              <Text style={{ color: t.muted, fontSize: 9.5, fontWeight: '700' }}>% GORDURA ATUAL</Text>
              <Text style={{ color: themeColors.coralRed, fontSize: 14, fontWeight: '800' }}>{currentBf}%</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* 2. O CORPO 3D CENTRALIZADO COM "VIDA" (PROTAGONISTA ABSOLUTO) */}
      <View
        style={{
          backgroundColor: '#0B0F17',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: themeColors.borderDark,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 24,
          paddingHorizontal: 16,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 560,
        }}
      >
        {/* Efeito de Scanner de Laser Biométrico Animado percorrendo o fundo */}
        <View
          style={{
            position: 'absolute',
            top: `${(pulseTick * 2) % 100}%`,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: 'rgba(0, 240, 255, 0.65)',
            shadowColor: '#00F0FF',
            shadowOpacity: 1,
            shadowRadius: 12,
            zIndex: 1,
          }}
        />

        {/* BARRA SUPERIOR DO SCANNER: STATUS + ALTERNADOR (SEM SOBREPOSIÇÃO) */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {/* Tag de Scanner Ativo */}
          <View
            style={{
              backgroundColor: 'rgba(11, 18, 32, 0.92)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: 'rgba(0, 240, 255, 0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00F0FF' }} />
            <Text style={{ color: '#00F0FF', fontSize: 10.5, fontWeight: '700' }}>
              SCANNER 3D ATIVO
            </Text>
          </View>

          {/* Alternador de Modo: Fotorrealista vs Holograma Neon */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(11, 18, 32, 0.92)',
              borderRadius: 10,
              padding: 2,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              gap: 2,
            }}
          >
            <Pressable
              onPress={() => setViewMode('clinical')}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 7,
                backgroundColor: viewMode === 'clinical' ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
              }}
            >
              <Text style={{ color: viewMode === 'clinical' ? '#FFFFFF' : '#94A3B8', fontSize: 10.5, fontWeight: '700' }}>
                Fotorrealista
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('hologram')}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 7,
                backgroundColor: viewMode === 'hologram' ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
              }}
            >
              <Text style={{ color: viewMode === 'hologram' ? '#00F0FF' : '#94A3B8', fontSize: 10.5, fontWeight: '700' }}>
                Neon 3D
              </Text>
            </Pressable>
          </View>
        </View>

        {/* CONTAINER DO CORPO TOTALMENTE CENTRALIZADO COM OS MARCADORES */}
        <View
          style={{
            width: 320,
            height: 520,
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Imagem do Corpo Centralizado */}
          <Image
            source={currentDisplayImage}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
              borderRadius: 18,
            }}
          />

          {/* OVERLAY SVG COM OS PONTOS DE VIDA E PULSAÇÃO BIOMÉTRICA */}
          <Svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 320,
              height: 520,
              pointerEvents: 'none',
            }}
          >
            {focusPoints.map((point) => {
              const cx = (point.leftPercent / 100) * 320;
              const cy = (point.topPercent / 100) * 520;
              const isSelected = point.id === selectedFocusId;

              return (
                <View key={point.id}>
                  {/* Anel Externo Pulsante de Radar */}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 18 : 12}
                    fill="none"
                    stroke={point.badgeColor}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeOpacity={isSelected ? 0.8 : 0.4}
                  />

                  {/* Ponto Central Brilhante */}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 6 : 4}
                    fill={point.badgeColor}
                  />
                </View>
              );
            })}
          </Svg>

          {/* BOTÕES CLICÁVEIS SOBRE O CORPO PARA SELEÇÃO DOS PONTOS */}
          {focusPoints.map((point) => {
            const isSelected = point.id === selectedFocusId;
            return (
              <Pressable
                key={point.id}
                onPress={() => {
                  setSelectedFocusId(point.id);
                  if (onSelectArea) onSelectArea(point.name);
                }}
                style={{
                  position: 'absolute',
                  top: `${point.topPercent}%`,
                  left: `${point.leftPercent}%`,
                  transform: [{ translateX: -20 }, { translateY: -20 }],
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                {/* Badge Flutuante em Pílula ao lado do ponto selecionado */}
                {isSelected && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -26,
                      backgroundColor: point.badgeColor,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      shadowColor: point.badgeColor,
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                    }}
                  >
                    <Text style={{ color: '#000000', fontSize: 10, fontWeight: '900' }}>
                      {point.name.split(' ')[0]}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Rodapé do Container do Corpo: Guia de Cores */}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: themeColors.coralRed }} />
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600' }}>Alerta de Dobra/Gordura</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: themeColors.cyan }} />
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600' }}>Simetria & Massa Magra</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: themeColors.neonLime }} />
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600' }}>Hidratação & Anabolismo</Text>
          </View>
        </View>
      </View>

      {/* 3. CARTÃO DETALHADO DA REGIÃO SELECIONADA NO CORPO */}
      <View
        style={{
          backgroundColor: '#121722',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: activeFocus.badgeColor,
          gap: 16,
        }}
      >
        <View style={{ gap: 10 }}>
          {/* Badge & Região Anatômica */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: `${activeFocus.badgeColor}25`,
                borderWidth: 1,
                borderColor: activeFocus.badgeColor,
              }}
            >
              <Text style={{ color: activeFocus.badgeColor, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>
                {activeFocus.category === 'prioridade_maxima' ? '⚡ FOCO DE AÇÃO IMEDIATA' : '⚖️ AJUSTE DE SIMETRIA'}
              </Text>
            </View>
            <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '600' }} numberOfLines={1}>
              {activeFocus.anatomicalRegion}
            </Text>
          </View>

          {/* Nome da Região */}
          <Title size={20} style={{ color: '#FFFFFF' }}>
            {activeFocus.name}
          </Title>

          {/* Dados Numéricos Reais (Dobra Cutânea & Bioimpedância) em 2 Colunas Limpas */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
            {activeFocus.skinfoldValueMm && (
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#171E2D',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <Text style={{ color: t.muted, fontSize: 10, fontWeight: '700' }}>{activeFocus.skinfoldName}</Text>
                <Text style={{ color: activeFocus.badgeColor, fontSize: 18, fontWeight: '900', marginTop: 2 }}>
                  {activeFocus.skinfoldValueMm} mm
                </Text>
              </View>
            )}

            <View
              style={{
                flex: 1,
                backgroundColor: '#171E2D',
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text style={{ color: t.muted, fontSize: 10, fontWeight: '700' }} numberOfLines={1}>Gordura Visceral</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900', marginTop: 2 }}>
                {activeFocus.bioValue}
              </Text>
            </View>
          </View>
        </View>

        {/* Diagnóstico Clínico */}
        <View style={{ backgroundColor: '#0B0F17', padding: 12, borderRadius: 12, gap: 4 }}>
          <Text style={{ color: activeFocus.badgeColor, fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase' }}>
            🔬 Diagnóstico da Bioimpedância & Dobras
          </Text>
          <Text style={{ color: '#D1D5DB', fontSize: 12.5, lineHeight: 18 }}>
            {activeFocus.diagnosis}
          </Text>
        </View>

        {/* Grid de Prescrição: O que Fazer no Treino vs O que Fazer na Dieta */}
        <View style={{ gap: 10 }}>
          {/* Coluna 1: Prescrição no Treino */}
          <View
            style={{
              backgroundColor: '#171E2D',
              borderRadius: 12,
              padding: 12,
              gap: 6,
              borderLeftWidth: 3,
              borderLeftColor: themeColors.neonLime,
            }}
          >
            <Text style={{ color: themeColors.neonLime, fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase' }}>
              🏋️‍♂️ Intervenção no Treino
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 17 }}>
              {activeFocus.trainingPrescription}
            </Text>
            <View style={{ gap: 3, marginTop: 4 }}>
              <Text style={{ color: t.muted, fontSize: 9.5, fontWeight: '700' }}>EXERCÍCIOS-CHAVE:</Text>
              {activeFocus.recommendedExercises.map((ex, idx) => (
                <Text key={idx} style={{ color: '#D1D5DB', fontSize: 11 }}>
                  • {ex}
                </Text>
              ))}
            </View>
          </View>

          {/* Coluna 2: Prescrição na Dieta */}
          <View
            style={{
              backgroundColor: '#171E2D',
              borderRadius: 12,
              padding: 12,
              gap: 6,
              borderLeftWidth: 3,
              borderLeftColor: themeColors.cyan,
            }}
          >
            <Text style={{ color: themeColors.cyan, fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase' }}>
              🥗 Intervenção na Dieta & Macros
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 17 }}>
              {activeFocus.dietPrescription}
            </Text>
            <View style={{ marginTop: 4, backgroundColor: 'rgba(0, 240, 255, 0.08)', padding: 7, borderRadius: 8 }}>
              <Text style={{ color: '#00F0FF', fontSize: 11, fontWeight: '700' }}>
                🎯 Meta: {activeFocus.targetGoal}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 4. LISTA DAS 5 MÉTRICAS PRIORITÁRIAS QUE O ALUNO DEVE TRABALHAR */}
      <View style={{ gap: 10 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>
          Plano de Ação: Métricas Prioritárias para Trabalhar
        </Text>
        <Text style={{ color: t.muted, fontSize: 12 }}>
          Clique em qualquer cartão abaixo para visualizar a topografia no corpo 3D:
        </Text>

        <View style={{ gap: 8 }}>
          {focusPoints.map((point) => {
            const isSelected = point.id === selectedFocusId;
            return (
              <Pressable
                key={point.id}
                onPress={() => setSelectedFocusId(point.id)}
                style={({ pressed }) => ({
                  backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#121722',
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: isSelected ? point.badgeColor : 'rgba(255, 255, 255, 0.06)',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                  gap: 12,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: point.badgeColor,
                    }}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                      {point.name}
                    </Text>
                    <Text style={{ color: t.muted, fontSize: 11 }} numberOfLines={1}>
                      {point.diagnosis}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text style={{ color: point.badgeColor, fontSize: 12, fontWeight: '800' }}>
                    {point.skinfoldValueMm ? `${point.skinfoldValueMm} mm` : point.bioValue}
                  </Text>
                  <Text style={{ color: t.muted, fontSize: 10 }}>
                    {isSelected ? '● Selecionado' : 'Toque para ver'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
