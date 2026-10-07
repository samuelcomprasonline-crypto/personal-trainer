import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Rect, Stop } from 'react-native-svg';
import { exerciseById, template, trainer } from '../../src/data/seed';
import { nextSlot, shouldRest } from '../../src/domain/schedule';
import type { Exercise } from '../../src/domain/types';
import { useAppState } from '../../src/state/AppState';
import { useAuth } from '../../src/state/AuthContext';
import { ExerciseVideoModal } from '../../src/ui/ExerciseVideoModal';
import { useTheme } from '../../src/ui/theme';

export default function Hoje() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const { logs, ready, syncStatus } = useAppState();
  const { profile } = useAuth();
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);

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

  const studentName = profile?.name ? profile.name.split(' ')[0] : 'Alex';
  const slot = nextSlot(template, logs);
  const session = slot ? template.sessions.find((s) => s.id === slot.sessionId)! : null;

  const openWorkout = () => router.push('/treino');

  // Fotos dos 4 exercícios principais em alta resolução
  const benchPressImg = require('../../assets/exercise_bench_press.jpg');
  const deadliftImg = require('../../assets/exercise_deadlift.jpg');
  const squatImg = require('../../assets/exercise_squat.jpg');
  const pullupImg = require('../../assets/exercise_pullup.jpg');

  // Cores do tema Obsidian & Cyber Lime
  const cardBg = '#141824';
  const cardBorder = 'rgba(255, 255, 255, 0.07)';
  const neonLime = '#C6F432';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0E14' }}
      contentContainerStyle={{ padding: isWide ? 28 : 16, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. TOPO DO DASHBOARD (BEM-VINDO + DIAS DA SEMANA + NOTIFICAÇÃO + AVATAR) */}
      <View
        style={{
          flexDirection: isWide ? 'row' : 'column',
          justifyContent: 'space-between',
          alignItems: isWide ? 'center' : 'flex-start',
          gap: 16,
          paddingBottom: 6,
        }}
      >
        {/* Saudação do Aluno */}
        <View style={{ gap: 2 }}>
          <Text style={{ color: '#8E9AA8', fontSize: 13, fontWeight: '500' }}>
            Bem-vindo de volta,
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }}>
            {studentName}
          </Text>
          <Text style={{ color: '#8E9AA8', fontSize: 13, fontWeight: '500' }}>
            Pronto para superar seus limites hoje?
          </Text>
        </View>

        {/* Lado Direito: Seletor de Dias da Semana + Ícones */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Faixa dos dias da semana (Pill Strip) */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#121622',
              borderRadius: 16,
              padding: 6,
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
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 12,
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
                    fontSize: 13,
                    fontWeight: '800',
                    marginTop: 2,
                  }}
                >
                  {d.day}
                </Text>
              </View>
            ))}
          </View>

          {/* Sino de Notificação */}
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#141824',
              borderWidth: 1,
              borderColor: cardBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>🔔</Text>
          </View>

          {/* Avatar com Iniciais */}
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#1C2433',
              borderWidth: 2,
              borderColor: neonLime,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: neonLime, fontSize: 14, fontWeight: '900' }}>
              {studentName.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. LINHA SUPERIOR DE CARDS (STRENGTH SCORE + WEEKLY PROGRESS) */}
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 18 }}>
        {/* CARD 1: STRENGTH SCORE (89 EXCELENTE + ONDA VERDE NEON) */}
        <View
          style={{
            flex: 1,
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: cardBorder,
            justifyContent: 'space-between',
            minHeight: 185,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
                SCORE DE FORÇA & METABOLISMO
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 44, fontWeight: '900', lineHeight: 46 }}>
                89
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <Text style={{ color: neonLime, fontSize: 13, fontWeight: '800' }}>
                  Excelente
                </Text>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '600' }}>
                  +7% vs último mês
                </Text>
              </View>
            </View>

            {/* Gráfico de Onda Fluida Verde Neon (SVG) com escala 0-100 */}
            <View style={{ width: 170, height: 100, position: 'relative' }}>
              <Svg width="170" height="100" viewBox="0 0 170 100">
                <Defs>
                  <LinearGradient id="waveGlow" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={neonLime} stopOpacity="0.45" />
                    <Stop offset="100%" stopColor={neonLime} stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>

                {/* Grade sutil */}
                <Line x1="15" y1="20" x2="165" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,3" />
                <Line x1="15" y1="50" x2="165" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,3" />
                <Line x1="15" y1="80" x2="165" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,3" />

                {/* Área preenchida com gradiente */}
                <Path
                  d="M 15 85 C 35 85, 45 60, 65 65 C 85 70, 95 40, 115 45 C 135 50, 145 20, 165 20 L 165 95 L 15 95 Z"
                  fill="url(#waveGlow)"
                />

                {/* Linha de onda verde neon */}
                <Path
                  d="M 15 85 C 35 85, 45 60, 65 65 C 85 70, 95 40, 115 45 C 135 50, 145 20, 165 20"
                  fill="none"
                  stroke={neonLime}
                  strokeWidth="3"
                />

                {/* Ponto de ápice com anel de luz */}
                <Circle cx="165" cy="20" r="5" fill={neonLime} />
                <Circle cx="165" cy="20" r="8" fill="none" stroke={neonLime} strokeWidth="1.5" strokeOpacity="0.5" />
              </Svg>
            </View>
          </View>
        </View>

        {/* CARD 2: WEEKLY PROGRESS (4/6 TREINOS + BARRA VERDE + VOLUME TOTAL) */}
        <View
          style={{
            flex: 1,
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: cardBorder,
            justifyContent: 'space-between',
            minHeight: 185,
            gap: 16,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
              PROGRESSO SEMANAL
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '900' }}>
                4
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 20, fontWeight: '700' }}>
                / 6
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 13, fontWeight: '500', marginLeft: 4 }}>
                Treinos Concluídos
              </Text>
            </View>

            {/* Barra de Progresso Verde Neon (67%) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <View
                style={{
                  flex: 1,
                  height: 8,
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
              <Text style={{ color: '#8E9AA8', fontSize: 12, fontWeight: '700' }}>
                67%
              </Text>
            </View>
          </View>

          {/* Divisão de Estatísticas (Volume Total e Tempo) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <View style={{ gap: 2 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
                12.450 kg
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '500' }}>
                Volume Total
              </Text>
            </View>

            <View style={{ gap: 2, alignItems: 'flex-end' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
                6h 25m
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '500' }}>
                Tempo Ativo
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. LINHA DO MEIO: TODAY'S WORKOUT vs RECENT ACTIVITY */}
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 18 }}>
        {/* CARD 3: TODAY'S WORKOUT (EXERCÍCIOS COM CHECKBOX + BOTÃO VERDE NEON) */}
        <View
          style={{
            flex: 1,
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 22,
            borderWidth: 1,
            borderColor: cardBorder,
            gap: 16,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
              TREINO DO DIA
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>
              {session?.name ?? 'Upper Push • Peitoral & Deltoides'}
            </Text>
          </View>

          {/* Lista de Exercícios com Séries, Repetições e Status */}
          <View style={{ gap: 10 }}>
            {[
              { name: 'Supino Reto com Barra', setsReps: '4 x 6-8', done: true, exId: 'supino-reto' },
              { name: 'Supino Inclinado com Halteres', setsReps: '4 x 8-10', done: true, exId: 'supino-inclinado' },
              { name: 'Desenvolvimento Militar Halteres', setsReps: '3 x 8-10', done: false, exId: 'desenvolvimento-halteres' },
              { name: 'Crucifixo na Polia Média', setsReps: '3 x 12-15', done: false, exId: 'crucifixo-polia' },
              { name: 'Tríceps Pulley na Corda', setsReps: '3 x 12-15', done: false, exId: 'triceps-corda' },
            ].map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  const ex = exerciseById(item.exId);
                  if (ex) setSelectedVideoExercise(ex);
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: item.done ? 'rgba(198, 244, 50, 0.04)' : '#10141F',
                  borderWidth: 1,
                  borderColor: item.done ? 'rgba(198, 244, 50, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                  {item.name}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ color: '#8E9AA8', fontSize: 12, fontWeight: '700' }}>
                    {item.setsReps}
                  </Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: item.done ? neonLime : 'transparent',
                      borderWidth: item.done ? 0 : 2,
                      borderColor: '#4A5568',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.done && (
                      <Text style={{ color: '#0A0E14', fontSize: 11, fontWeight: '900' }}>✓</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Botão de Iniciar Treino Verde Neon Vibrante (Idêntico ao "Start Workout") */}
          <Pressable
            onPress={openWorkout}
            style={({ pressed }) => ({
              backgroundColor: neonLime,
              borderRadius: 14,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
              shadowColor: neonLime,
              shadowOpacity: 0.35,
              shadowRadius: 10,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ color: '#0A0E14', fontSize: 15, fontWeight: '900' }}>
              ▶ Iniciar Treino Agora
            </Text>
          </Pressable>
        </View>

        {/* CARD 4: RECENT ACTIVITY (HISTÓRICO RECENTE COM VOLUMES E DATAS) */}
        <View
          style={{
            flex: 1,
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
              ATIVIDADE RECENTE
            </Text>
          </View>

          {/* Lista com ícones das sessões anteriores */}
          <View style={{ gap: 12 }}>
            {[
              { title: 'Upper Push', date: 'Hoje', volume: '12.450 kg', icon: '🏋️' },
              { title: 'Membros Inferiores (Pernas)', date: 'Ontem', volume: '15.750 kg', icon: '🦵' },
              { title: 'Costas & Bíceps (Pull)', date: '21 Mai', volume: '11.200 kg', icon: '🧗' },
              { title: 'Full Body Funcional', date: '19 Mai', volume: '10.500 kg', icon: '⚡' },
            ].map((act, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: idx < 3 ? 1 : 0,
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'rgba(198, 244, 50, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(198, 244, 50, 0.25)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{act.icon}</Text>
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                      {act.title}
                    </Text>
                    <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '500' }}>
                      {act.date}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                  {act.volume}
                </Text>
              </View>
            ))}
          </View>

          {/* Botão Ver Histórico Completo */}
          <Pressable
            onPress={() => router.push('/progresso')}
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
              Ver Histórico Completo
            </Text>
          </Pressable>
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
            onPress={() => router.push('/progresso')}
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
            onPress={() => router.push('/progresso')}
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
    </ScrollView>
  );
}
