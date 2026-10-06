import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { exerciseById, template, trainer } from '../../src/data/seed';
import { nextSlot, shouldRest } from '../../src/domain/schedule';
import type { Exercise } from '../../src/domain/types';
import { useAppState } from '../../src/state/AppState';
import { useAuth } from '../../src/state/AuthContext';
import {
  ArrowCircleButton,
  Body,
  Button,
  Card,
  CircularProgress,
  Label,
  Screen,
  Title,
} from '../../src/ui/components';
import { ExerciseVideoModal } from '../../src/ui/ExerciseVideoModal';
import { useTheme } from '../../src/ui/theme';

export default function Hoje() {
  const t = useTheme();
  const { logs, ready, syncStatus } = useAppState();
  const { profile } = useAuth();
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);

  if (!ready) {
    return (
      <Screen>
        <Body muted>Carregando seu plano de treino…</Body>
      </Screen>
    );
  }

  const slot = nextSlot(template, logs);
  const session = slot ? template.sessions.find((s) => s.id === slot.sessionId)! : null;
  const openWorkout = () => router.push('/treino');

  const studentName = profile?.name ? profile.name.split(' ')[0] : 'Samuel';

  return (
    <>
      <Screen>
        {/* 1. CABEÇALHO DO ALUNO (IDÊNTICO À FOTO 2) */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <View>
            <Body muted style={{ fontSize: 14 } as any}>
              Olá, {studentName} 👋
            </Body>
            <Title size={24} style={{ color: '#FFFFFF', fontWeight: '800' }}>
              Pronto para bater metas?
            </Title>
          </View>

          {/* Sino e Status */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: t.surfaceElevated,
                borderWidth: 1,
                borderColor: t.border,
              }}
            >
              <Body style={{ fontSize: 11, color: t.accent, fontWeight: '700' } as any}>
                ● {syncStatus === 'synced' ? 'Nuvem Conectada' : 'Modo Local'}
              </Body>
            </View>
          </View>
        </View>

        {/* 2. PROGRESSO SEMANAL EM ANEL CIRCULAR E CALORIAS (FOTO 2) */}
        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: 22,
            padding: 18,
            borderWidth: 1,
            borderColor: t.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: 4 }}>
            <Label style={{ fontSize: 11, color: t.muted }}>Progresso da Semana</Label>
            <Title size={22} style={{ color: '#FFFFFF' }}>
              3 de 4 treinos
            </Title>
            <Body muted style={{ fontSize: 12 } as any}>
              75% da meta concluída
            </Body>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Body style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 'bold' } as any}>
                🔥 2.350 kcal
              </Body>
              <Body muted style={{ fontSize: 12 } as any}>
                ⏱ 4h 30m ativo
              </Body>
            </View>
            <CircularProgress percentage={75} size={64} strokeWidth={6} />
          </View>
        </View>

        {/* 3. AVISO DE DESCANSO SE NECESSÁRIO */}
        {shouldRest(logs, new Date()) && (
          <View
            style={{
              backgroundColor: '#1E2433',
              borderRadius: 18,
              padding: 14,
              borderLeftWidth: 4,
              borderLeftColor: t.accent,
            }}
          >
            <Label style={{ color: t.accent }}>Aviso de Recuperação Muscular</Label>
            <Body muted style={{ fontSize: 13, marginTop: 2 } as any}>
              Você concluiu seu último treino há menos de 24 horas. Descansar também gera hipertrofia, mas o início é livre.
            </Body>
          </View>
        )}

        {/* 4. BANNER DO TREINO DE HOJE (IDÊNTICO À FOTO 2 "TODAY'S WORKOUT") */}
        {session ? (
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: t.border,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Foto do Atleta no Treino */}
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
              }}
              style={{ width: '100%', height: 180, resizeMode: 'cover' }}
            />

            <View style={{ padding: 18, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: `${t.accent}20`,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: `${t.accent}40`,
                  }}
                >
                  <Body style={{ color: t.accent, fontSize: 12, fontWeight: '700' } as any}>
                    Semana {slot?.weekN} • {session.name}
                  </Body>
                </View>

                <Body muted style={{ fontSize: 12 } as any}>
                  ⏱ 45 min • Moderado
                </Body>
              </View>

              <Title size={24}>{session.name}</Title>

              {/* Botão Gigante Verde Neon (Foto 1 e 2: "Start Workout") */}
              <Button
                title="Iniciar Treino ▶"
                onPress={openWorkout}
              />
            </View>
          </View>
        ) : (
          <Card>
            <Label>{trainer.name}</Label>
            <Title size={24}>Bloco Concluído!</Title>
            <Body muted>
              Parabéns! Você finalizou todas as sessões prescritas. Seu treinador está preparando o próximo ciclo.
            </Body>
            <Button title="Ver Meu Progresso" onPress={() => router.push('/progresso')} />
          </Card>
        )}

        {/* 5. LISTA DOS EXERCÍCIOS PLANEJADOS (COM VÍDEO DO YOUTUBE) */}
        {session && (
          <View style={{ gap: 10, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title size={19}>Exercícios do Plano ({session.items.length})</Title>
              <Label style={{ color: t.accent }}>Biomecânica</Label>
            </View>

            {session.items.map((item, idx) => {
              const ex = exerciseById(item.exerciseId);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedVideoExercise(ex)}
                  style={({ pressed }) => ({
                    backgroundColor: t.surface,
                    borderRadius: 18,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: t.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  {/* Miniatura do YouTube ou do Exercício */}
                  <View style={{ width: 62, height: 62, borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
                    <Image
                      source={{ uri: ex.thumbnailUrl }}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#FF0000',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>▶</Text>
                    </View>
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Title size={16}>{ex.name}</Title>
                    <Body muted style={{ fontSize: 13 } as any}>
                      {item.sets} séries • {item.repMin}–{item.repMax} reps
                    </Body>
                    <Body style={{ color: t.accent, fontSize: 11, fontWeight: '600' } as any}>
                      Ver execução técnica no YouTube ↗
                    </Body>
                  </View>

                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: t.surfaceElevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: t.muted, fontSize: 14 }}>›</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </Screen>

      {/* MODAL DE VÍDEO DO EXERCÍCIO COM YOUTUBE */}
      <ExerciseVideoModal
        exercise={selectedVideoExercise}
        visible={selectedVideoExercise !== null}
        onClose={() => setSelectedVideoExercise(null)}
      />
    </>
  );
}
