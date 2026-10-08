import React, { useState } from 'react';
import { View, Text, Pressable, Image, useWindowDimensions, Modal, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Line, Path, Circle } from 'react-native-svg';
import { approvedAlternatives, exerciseById, exercises, studentEquipment, template, trainer } from '../../src/data/seed';
import { nextSlot, shouldRest } from '../../src/domain/schedule';
import { suggestAlternatives } from '../../src/domain/substitution';
import type { Exercise } from '../../src/domain/types';
import { useAppState } from '../../src/state/AppState';
import { useAuth } from '../../src/state/AuthContext';
import { ExerciseVideoModal } from '../../src/ui/ExerciseVideoModal';
import { Screen } from '../../src/ui/components';
import { useTheme } from '../../src/ui/theme';

export default function Hoje() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const { logs, ready, syncStatus } = useAppState();
  const { profile } = useAuth();
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);

  // ESTADO DE HIDRATAÇÃO RÁPIDA (QUICK WATER TRACKER)
  const [waterMl, setWaterMl] = useState(2250);
  const targetWaterMl = 3500;
  const waterPercent = Math.min(100, Math.round((waterMl / targetWaterMl) * 100));

  // ESTADO DE SUBSTITUIÇÃO DE EXERCÍCIO (APARELHO OCUPADO)
  const [exerciseToSwap, setExerciseToSwap] = useState<Exercise | null>(null);
  const [swapSuccessNotice, setSwapSuccessNotice] = useState<string | null>(null);

  // Lista dinâmica de exercícios do treino de hoje
  const [todayExercises, setTodayExercises] = useState([
    { name: 'Supino Reto com Barra', setsReps: '4 x 6-8', done: true, exId: 'supino-reto' },
    { name: 'Supino Inclinado com Halteres', setsReps: '4 x 8-10', done: true, exId: 'supino-inclinado' },
    { name: 'Desenvolvimento Militar Halteres', setsReps: '3 x 8-10', done: false, exId: 'desenvolvimento-halteres' },
    { name: 'Crucifixo na Polia Média', setsReps: '3 x 12-15', done: false, exId: 'crucifixo-polia' },
    { name: 'Tríceps Pulley na Corda', setsReps: '3 x 12-15', done: false, exId: 'triceps-corda' },
  ]);

  const handleAddWater = (amount: number) => {
    setWaterMl((prev) => Math.min(5000, prev + amount));
  };

  const handleSwapExercise = (alternative: Exercise) => {
    if (!exerciseToSwap) return;
    setTodayExercises((prev) =>
      prev.map((item) =>
        item.exId === exerciseToSwap.id
          ? {
              ...item,
              name: alternative.name,
              exId: alternative.id,
            }
          : item
      )
    );
    setSwapSuccessNotice(`Substituído com sucesso por "${alternative.name}"!`);
    setExerciseToSwap(null);
    setTimeout(() => setSwapSuccessNotice(null), 4000);
  };

  // Dias da semana para a barra superior idêntica ao tablet de referência
  const daysOfWeek = [
    { label: 'SEG', day: 20, active: false },
    { label: 'TER', day: 21, active: false },
    { label: 'QUA', day: 22, active: false },
    { label: 'QUI', day: 23, active: true }, // Dia ativo com pill verde neon
    { label: 'SEX', day: 24, active: false },
    { label: 'SÁB', day: 25, active: false },
    { label: 'DOM', day: 26, active: false },
  ];

  const studentName = profile?.name ? profile.name.split(' ')[0] : 'Samuel';
  const slot = nextSlot(template, logs);
  const session = slot ? template.sessions.find((s) => s.id === slot.sessionId)! : null;

  const openWorkout = () => router.push('/treino');

  // Fotos dos 4 exercícios principais em alta resolução
  const benchPressImg = require('../../assets/exercise_bench_press.jpg');
  const deadliftImg = require('../../assets/exercise_deadlift.jpg');
  const squatImg = require('../../assets/exercise_squat.jpg');
  const pullupImg = require('../../assets/exercise_pullup.jpg');

  // Cores do tema Titanium & Emerald Cirúrgico
  const cardBg = '#0D0E12';
  const cardBorder = 'rgba(255, 255, 255, 0.07)';
  const neonLime = '#10B981';

  return (
    <Screen>
      <View style={{ gap: 22, width: '100%' }}>
        {/* 1. TOPO DO DASHBOARD: SAUDAÇÃO & CALENDÁRIO SEMANAL */}
        <View
          style={{
            flexDirection: isWide ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: isWide ? 'center' : 'flex-start',
            gap: 16,
            paddingBottom: 4,
          }}
        >
          {/* Saudação Elegante */}
          <View style={{ gap: 2 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.4 }}>
              Bem-vindo de volta, {studentName}
            </Text>
            <Text style={{ color: '#8E9AA8', fontSize: 13, fontWeight: '500' }}>
              Aluno VIP • Pronto para superar seus limites hoje?
            </Text>
          </View>

          {/* Faixa dos dias da semana (Pill Strip) */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#111520',
              borderRadius: 14,
              padding: 5,
              borderWidth: 1,
              borderColor: cardBorder,
              gap: 4,
            }}
          >
            {daysOfWeek.map((d, idx) => (
              <View
                key={idx}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: d.active ? neonLime : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: d.active ? '#0A0E14' : '#8E9AA8',
                    fontSize: 9,
                    fontWeight: '800',
                  }}
                >
                  {d.label}
                </Text>
                <Text
                  style={{
                    color: d.active ? '#0A0E14' : '#FFFFFF',
                    fontSize: 12.5,
                    fontWeight: '800',
                    marginTop: 1,
                  }}
                >
                  {d.day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 2. LAYOUT PRINCIPAL: COLUNA 2 (MEIO - PROGRESSO & BIOMETRIA) vs COLUNA 3 (DIREITA - TREINO & ATIVIDADE) */}
        <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 20 }}>
          {/* COLUNA 2: MIDDLE - PROGRESS, BIOMETRICS & ACTIVITY (55%) */}
          <View style={{ flex: isWide ? 1.25 : 1, gap: 18 }}>
            {/* CARDS DE PROGRESSO: SCORE DE FORÇA + PROGRESSO SEMANAL */}
            <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 14 }}>
              {/* CARD: SCORE DE FORÇA & METABOLISMO (89 EXCELENTE + CURVA VERDE) */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  justifyContent: 'space-between',
                  minHeight: 175,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ gap: 3 }}>
                    <Text style={{ color: '#8E9AA8', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      SCORE DE FORÇA & METABOLISMO
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 40, fontWeight: '900', lineHeight: 42 }}>
                      89
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={{ color: neonLime, fontSize: 12, fontWeight: '800' }}>
                        Excelente
                      </Text>
                      <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                        +7% vs último mês
                      </Text>
                    </View>
                  </View>

                  {/* Gráfico de Curva Verde com Glow Fino */}
                  <View style={{ width: 130, height: 80 }}>
                    <Svg width="130" height="80" viewBox="0 0 130 80">
                      <Defs>
                        <LinearGradient id="waveGlowMid" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0%" stopColor={neonLime} stopOpacity="0.4" />
                          <Stop offset="100%" stopColor={neonLime} stopOpacity="0.0" />
                        </LinearGradient>
                      </Defs>
                      <Path
                        d="M 10 70 C 25 70, 35 48, 55 52 C 75 56, 85 30, 100 34 C 112 38, 120 15, 125 15 L 125 75 L 10 75 Z"
                        fill="url(#waveGlowMid)"
                      />
                      <Path
                        d="M 10 70 C 25 70, 35 48, 55 52 C 75 56, 85 30, 100 34 C 112 38, 120 15, 125 15"
                        fill="none"
                        stroke={neonLime}
                        strokeWidth="2.5"
                      />
                      <Circle cx="125" cy="15" r="4" fill={neonLime} />
                      <Circle cx="125" cy="15" r="7" fill="none" stroke={neonLime} strokeWidth="1.2" strokeOpacity="0.4" />
                    </Svg>
                  </View>
                </View>
              </View>

              {/* CARD: PROGRESSO SEMANAL (4/6 TREINOS + BARRA LINEAR) */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  justifyContent: 'space-between',
                  minHeight: 175,
                  gap: 14,
                }}
              >
                <View style={{ gap: 4 }}>
                  <Text style={{ color: '#8E9AA8', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    PROGRESSO SEMANAL
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '900' }}>
                      4
                    </Text>
                    <Text style={{ color: '#8E9AA8', fontSize: 18, fontWeight: '700' }}>
                      / 6
                    </Text>
                    <Text style={{ color: '#8E9AA8', fontSize: 12, marginLeft: 4 }}>
                      Treinos Concluídos
                    </Text>
                  </View>

                  {/* Barra de Progresso Linear Verde (67%) */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <View
                      style={{
                        flex: 1,
                        height: 7,
                        backgroundColor: '#1E2533',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: '67%',
                          height: '100%',
                          backgroundColor: neonLime,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                    <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '700' }}>
                      67%
                    </Text>
                  </View>
                </View>

                {/* Métricas: Volume Total e Tempo Ativo */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <View style={{ gap: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                      12.450 kg
                    </Text>
                    <Text style={{ color: '#8E9AA8', fontSize: 10.5 }}>
                      Volume Total
                    </Text>
                  </View>

                  <View style={{ gap: 1, alignItems: 'flex-end' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                      6h 25m
                    </Text>
                    <Text style={{ color: '#8E9AA8', fontSize: 10.5 }}>
                      Tempo Ativo
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* CARD: CONTROLE DE HIDRATAÇÃO BIOMÉTRICA ISOLADO */}
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: 'rgba(56, 189, 248, 0.25)',
                gap: 12,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      borderWidth: 1,
                      borderColor: '#38BDF8',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>💧</Text>
                  </View>
                  <View>
                    <Text style={{ color: '#38BDF8', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      CONTROLE DE HIDRATAÇÃO BIOMÉTRICA
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900' }}>
                      {waterMl.toLocaleString('pt-BR')} ml <Text style={{ color: '#8E9AA8', fontSize: 12, fontWeight: '500' }}>de {targetWaterMl.toLocaleString('pt-BR')} ml meta</Text>
                    </Text>
                  </View>
                </View>

                {/* CTAs em Pílula +250ml Copo e +500ml Garrafa */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() => handleAddWater(250)}
                    style={({ pressed }) => ({
                      backgroundColor: 'rgba(56, 189, 248, 0.08)',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text style={{ color: '#38BDF8', fontSize: 11.5, fontWeight: '700' }}>
                      +250ml Copo
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleAddWater(500)}
                    style={({ pressed }) => ({
                      backgroundColor: '#38BDF8',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ color: '#0A0E14', fontSize: 11.5, fontWeight: '800' }}>
                      +500ml Garrafa
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Barra de Progresso Azul Delicada */}
              <View style={{ height: 7, backgroundColor: '#131D2D', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: `${waterPercent}%`, height: '100%', backgroundColor: '#38BDF8', borderRadius: 4 }} />
              </View>
            </View>
          </View>

          {/* COLUNA 3: RIGHT SIDEBAR - WORKOUT DETAILS & ACTIVITY (45%) */}
          <View style={{ flex: isWide ? 1.05 : 1, gap: 18 }}>
            {/* SEÇÃO: TREINO DO DIA */}
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: cardBorder,
                gap: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ gap: 2 }}>
                  <Text style={{ color: '#8E9AA8', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    TREINO DO DIA - DIA 1
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
                    {session?.name ?? 'Upper Push • Peitoral & Deltoides'}
                  </Text>
                </View>
              </View>

              {swapSuccessNotice && (
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderWidth: 1, borderColor: neonLime, borderRadius: 8, padding: 8 }}>
                  <Text style={{ color: neonLime, fontSize: 11.5, fontWeight: '700' }}>
                    ✓ {swapSuccessNotice}
                  </Text>
                </View>
              )}

              {/* Lista Organizada de Exercícios com Checkmark Compacto e Botão Trocar */}
              <View style={{ gap: 8 }}>
                {todayExercises.slice(0, 4).map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 9,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: item.done ? 'rgba(16, 185, 129, 0.04)' : '#10141F',
                      borderWidth: 1,
                      borderColor: item.done ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        const ex = exerciseById(item.exId);
                        if (ex) setSelectedVideoExercise(ex);
                      }}
                      style={{ flex: 1, gap: 2 }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: '#8E9AA8', fontSize: 10.5 }}>
                        {item.setsReps}
                      </Text>
                    </Pressable>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {/* Botão Trocar */}
                      <Pressable
                        onPress={() => {
                          const ex = exerciseById(item.exId);
                          if (ex) setExerciseToSwap(ex);
                        }}
                        style={{
                          paddingHorizontal: 7,
                          paddingVertical: 3,
                          borderRadius: 6,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Text style={{ color: '#9CA3AF', fontSize: 10, fontWeight: '700' }}>
                          Trocar
                        </Text>
                      </Pressable>

                      {/* Checkmark Compacto */}
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: item.done ? neonLime : 'transparent',
                          borderWidth: item.done ? 0 : 1.5,
                          borderColor: '#4A5568',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.done && (
                          <Text style={{ color: '#0A0E14', fontSize: 10, fontWeight: '900' }}>✓</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Botão de Iniciar Treino Verde Esmeralda */}
              <Pressable
                onPress={openWorkout}
                style={({ pressed }) => ({
                  backgroundColor: neonLime,
                  borderRadius: 12,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: neonLime,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                })}
              >
                <Text style={{ color: '#0A0E14', fontSize: 13.5, fontWeight: '800' }}>
                  ▶ Iniciar Treino Agora
                </Text>
              </Pressable>
            </View>

            {/* SEÇÃO: ATIVIDADE RECENTE */}
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: cardBorder,
                gap: 12,
              }}
            >
              <Text style={{ color: '#8E9AA8', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                ATIVIDADE RECENTE
              </Text>

              <View style={{ gap: 8 }}>
                {[
                  { title: 'Upper Push', date: 'Hoje', volume: '12.450 kg' },
                  { title: 'Membros Inferiores', date: 'Ontem', volume: '15.750 kg' },
                  { title: 'Costas & Bíceps', date: '21 Mai', volume: '11.200 kg' },
                ].map((act, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderBottomWidth: idx < 2 ? 1 : 0,
                      borderColor: 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <View style={{ gap: 2 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                        {act.title}
                      </Text>
                      <Text style={{ color: '#6B7280', fontSize: 10.5 }}>
                        {act.date}
                      </Text>
                    </View>

                    <Text style={{ color: '#D1D5DB', fontSize: 12, fontWeight: '700' }}>
                      {act.volume}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

      {/* 4. LINHA INFERIOR: EXERCISE LIBRARY vs ACHIEVEMENTS */}
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 18 }}>
        {/* CARD 5: EXERCISE LIBRARY (4 CARDS COM FOTOS REAIS EM ALTA RESOLUÇÃO) */}
        <View
          style={{
            flex: isWide ? 2 : 1,
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 22,
            borderWidth: 1,
            borderColor: cardBorder,
            gap: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
              BIBLIOTECA DE EXERCÍCIOS
            </Text>
            <Pressable onPress={() => router.push('/progresso')}>
              <Text style={{ color: neonLime, fontSize: 12, fontWeight: '700' }}>
                Ver Todos ↗
              </Text>
            </Pressable>
          </View>

          {/* Grid dos 4 Exercícios com Fotos Reais */}
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {[
              { name: 'Supino Reto', target: 'Peitoral', img: benchPressImg, exId: 'supino-reto' },
              { name: 'Levantamento Terra', target: 'Costas & Posterior', img: deadliftImg, exId: 'terra' },
              { name: 'Agachamento Livre', target: 'Quadríceps', img: squatImg, exId: 'agachamento' },
              { name: 'Barra Fixa', target: 'Dorsal & Bíceps', img: pullupImg, exId: 'barra-fixa' },
            ].map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  const ex = exerciseById(item.exId);
                  if (ex) setSelectedVideoExercise(ex);
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  minWidth: 130,
                  backgroundColor: '#0F131C',
                  borderRadius: 14,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  opacity: pressed ? 0.88 : 1,
                })}
              >
                <Image
                  source={item.img}
                  style={{ width: '100%', height: 110, resizeMode: 'cover' }}
                />
                <View style={{ padding: 10, gap: 2 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '600' }} numberOfLines={1}>
                    {item.target}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => router.navigate('/progresso')}
            style={({ pressed }) => ({
              backgroundColor: '#1E2533',
              borderRadius: 12,
              paddingVertical: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.06)',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#D1D5DB', fontSize: 12, fontWeight: '700' }}>
              Ver Biblioteca de Exercícios Completa
            </Text>
          </Pressable>
        </View>

        {/* CARD 6: ACHIEVEMENTS (8 BADGES DESBLOQUEADOS + MEDALHAS HEXAGONAIS) */}
        <View
          style={{
            flex: isWide ? 1 : 1,
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 22,
            borderWidth: 1,
            borderColor: cardBorder,
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
              CONQUISTAS & BADGES
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '900' }}>
                8
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 13, fontWeight: '600' }}>
                Medalhas Desbloqueadas
              </Text>
            </View>
          </View>

          {/* Insígnias Luminosas Hexagonais (Idênticas ao Tablet) */}
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between', paddingVertical: 10 }}>
            {[
              { icon: '🛡️', color: neonLime, label: 'Força' },
              { icon: '🔥', color: '#FFB703', label: 'Queima' },
              { icon: '⚡', color: '#00F0FF', label: 'Carga' },
              { icon: '💎', color: '#A855F7', label: 'Mestre' },
            ].map((badge, idx) => (
              <View
                key={idx}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: '#121622',
                  borderWidth: 1.5,
                  borderColor: badge.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: badge.color,
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ fontSize: 22 }}>{badge.icon}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.navigate('/progresso')}
            style={({ pressed }) => ({
              backgroundColor: '#1E2533',
              borderRadius: 12,
              paddingVertical: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.06)',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#D1D5DB', fontSize: 12, fontWeight: '700' }}>
              Ver Todas as Conquistas
            </Text>
          </Pressable>
        </View>
      </View>

      {/* MODAL DE VÍDEO DO EXERCÍCIO COM YOUTUBE */}
      <ExerciseVideoModal
        exercise={selectedVideoExercise}
        visible={selectedVideoExercise !== null}
        onClose={() => setSelectedVideoExercise(null)}
      />

      {/* MODAL DE SUBSTITUIÇÃO DE APARELHO OCUPADO */}
      <Modal
        visible={exerciseToSwap !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setExerciseToSwap(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 520,
              backgroundColor: '#141824',
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: 'rgba(16, 185, 129, 0.25)',
              shadowColor: neonLime,
              shadowOpacity: 0.2,
              shadowRadius: 20,
              gap: 16,
            }}
          >
            {/* Cabeçalho do Modal */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ gap: 4, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 18 }}>🔄</Text>
                  <Text style={{ color: neonLime, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Aparelho Ocupado na Academia
                  </Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900' }}>
                  Substituir {exerciseToSwap?.name}
                </Text>
                <Text style={{ color: '#8E9AA8', fontSize: 12, lineHeight: 17 }}>
                  Substitutos biomecanicamente validados para recrutar as mesmas fibras sem perder a eficácia do treino.
                </Text>
              </View>
              <Pressable
                onPress={() => setExerciseToSwap(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#1E2533',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#8E9AA8', fontSize: 16, fontWeight: '700' }}>✕</Text>
              </Pressable>
            </View>

            {/* Lista de Alternativas */}
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 10 }}>
                {exerciseToSwap &&
                  suggestAlternatives(
                    exerciseToSwap,
                    exercises,
                    approvedAlternatives[exerciseToSwap.id] ?? [],
                    studentEquipment
                  ).map((alt) => {
                    const isApproved = (approvedAlternatives[exerciseToSwap.id] ?? []).includes(alt.id);
                    return (
                      <Pressable
                        key={alt.id}
                        onPress={() => handleSwapExercise(alt)}
                        style={({ pressed }) => ({
                          backgroundColor: '#0E121B',
                          borderRadius: 14,
                          padding: 14,
                          borderWidth: 1,
                          borderColor: isApproved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <View style={{ flex: 1, gap: 4, paddingRight: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
                              {alt.name}
                            </Text>
                            {isApproved && (
                              <View
                                style={{
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRadius: 4,
                                }}
                              >
                                <Text style={{ color: neonLime, fontSize: 9, fontWeight: '800' }}>
                                  ★ RECOMENDADO
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                            Equipamento: {alt.equipment} • Músculo: {alt.primaryMuscle}
                          </Text>
                        </View>

                        <View
                          style={{
                            backgroundColor: neonLime,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: '#0A0E14', fontSize: 12, fontWeight: '800' }}>
                            Trocar ↗
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
              </View>
            </ScrollView>

            {/* Rodapé / Botão de Fechar */}
            <Pressable
              onPress={() => setExerciseToSwap(null)}
              style={({ pressed }) => ({
                backgroundColor: '#1E2533',
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '700' }}>
                Cancelar / Manter Exercício Atual
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      </View>
    </Screen>
  );
}
