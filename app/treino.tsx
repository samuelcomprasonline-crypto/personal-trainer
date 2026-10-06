import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import {
  approvedAlternatives,
  baseLoads,
  exerciseById,
  exercises,
  studentEquipment,
  template,
} from '../src/data/seed';
import { plannedLoad } from '../src/domain/progression';
import { nextSlot } from '../src/domain/schedule';
import { lastLoadFor, suggestAlternatives } from '../src/domain/substitution';
import type { Exercise, Mood, SessionLog } from '../src/domain/types';
import { useAppState } from '../src/state/AppState';
import { Body, Button, Card, Chip, Label, LoadStepper, Screen, Title } from '../src/ui/components';
import { ExerciseVideoModal } from '../src/ui/ExerciseVideoModal';
import { PaletteOverride, studioPalette, useTheme } from '../src/ui/theme';

type SetState = { reps: string; done: boolean };
type ItemState = { exerciseId: string; loadKg: number | null; sets: SetState[] };

const MOODS: { value: Mood; label: string }[] = [
  { value: 'low', label: 'Cansado' },
  { value: 'ok', label: 'Bem' },
  { value: 'great', label: 'Ótimo' },
];

function playTimerChime() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // no-op silencioso
    }
  }
}

export default function TreinoScreen() {
  return (
    <PaletteOverride value={studioPalette}>
      <StatusBar style="light" />
      <Treino />
    </PaletteOverride>
  );
}

function Treino() {
  const t = useTheme();
  const { logs, addLog } = useAppState();
  const [slot] = useState(() => nextSlot(template, logs));
  const session = template.sessions.find((s) => s.id === slot?.sessionId);

  const [items, setItems] = useState<ItemState[]>(() =>
    (session?.items ?? []).map((item) => {
      const base = baseLoads[item.id] ?? 0;
      const load = plannedLoad(base, item.weeklyIncrementKg, slot?.weekN ?? 1);
      return {
        exerciseId: item.exerciseId,
        loadKg: load,
        sets: Array.from({ length: item.sets }, () => ({ reps: '', done: false })),
      };
    })
  );

  const [phase, setPhase] = useState<'workout' | 'checkin'>('workout');
  const [rpe, setRpe] = useState(7);
  const [mood, setMood] = useState<Mood>('ok');
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);

  // CRONÔMETRO DE DESCANSO
  const [restSeconds, setRestSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (restSeconds === null) return;
    if (restSeconds <= 0) {
      playTimerChime();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRestSeconds(null);
      return;
    }

    const timer = setInterval(() => {
      setRestSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [restSeconds]);

  if (!session || !slot) {
    return (
      <Screen>
        <Title>Sem treino disponível</Title>
        <Body muted>Todas as sessões deste bloco foram concluídas.</Body>
        <Button title="Voltar" onPress={() => router.back()} />
      </Screen>
    );
  }

  const update = (index: number, fn: (prev: ItemState) => ItemState) => {
    setItems((curr) => curr.map((it, i) => (i === index ? fn(it) : it)));
  };

  const toggleSet = (itemIdx: number, setIdx: number) => {
    const isNowDone = !items[itemIdx].sets[setIdx].done;

    update(itemIdx, (it) => ({
      ...it,
      sets: it.sets.map((s, idx) => (idx === setIdx ? { ...s, done: !s.done } : s)),
    }));

    if (isNowDone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const restTime = session.items[itemIdx]?.restS ?? 90;
      setRestSeconds(restTime);
    }
  };

  const finish = async (withCheckin: boolean) => {
    setSaving(true);
    const sets = items.flatMap((it) =>
      it.sets
        .filter((s) => s.done)
        .map((s, n) => ({
          exerciseId: it.exerciseId,
          setN: n + 1,
          reps: parseInt(s.reps, 10) || 0,
          loadKg: it.loadKg ?? 0,
        }))
    );

    const log: SessionLog = {
      id: `log-${Date.now()}`,
      templateSessionId: session.id,
      weekN: slot.weekN,
      completedAt: new Date().toISOString(),
      ...(withCheckin ? { rpe, mood } : {}),
      sets,
    };

    try {
      await addLog(log);
      router.replace('/hoje');
    } catch {
      Alert.alert('Erro ao salvar', 'Não foi possível salvar o treino. Tente novamente.');
      setSaving(false);
    }
  };

  // TELA DE CHECK-IN FINAL
  if (phase === 'checkin') {
    return (
      <Screen>
        <Label>Finalização do Treino</Label>
        <Title size={30}>Como foi o treino?</Title>
        <Body muted>
          Seu feedback calibra a intensidade das próximas semanas e alerta seu treinador no Radar.
        </Body>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Label>Percepção de Esforço (RPE)</Label>
            <Title size={22} style={{ color: t.accent }}>{rpe} / 10</Title>
          </View>

          <Body muted style={{ fontSize: 13 } as any}>
            {rpe <= 4
              ? 'Muito leve — quase nenhum cansaço'
              : rpe <= 6
              ? 'Moderado — dava para fazer mais repetições'
              : rpe <= 8
              ? 'Intenso — restavam 1 a 2 repetições na reserva'
              : 'Extremo — esforço máximo até a falha'}
          </Body>

          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={rpe}
            onValueChange={setRpe}
            minimumTrackTintColor={t.accent}
            maximumTrackTintColor={t.border}
            thumbTintColor={t.accent}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <Chip
                key={num}
                label={String(num)}
                selected={rpe === num}
                onPress={() => setRpe(num)}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Label>Humor pós-treino</Label>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {MOODS.map((m) => (
              <Chip
                key={m.value}
                label={m.label}
                selected={mood === m.value}
                onPress={() => setMood(m.value)}
              />
            ))}
          </View>
        </Card>

        <Button title="Salvar e Concluir Treino" onPress={() => finish(true)} disabled={saving} />
        <Button title="Pular avaliação" variant="ghost" onPress={() => finish(false)} disabled={saving} />
      </Screen>
    );
  }

  const swapTarget = swapIndex === null ? null : session.items[swapIndex];
  const alternatives = swapTarget
    ? suggestAlternatives(
        exerciseById(swapTarget.exerciseId),
        exercises,
        approvedAlternatives[swapTarget.exerciseId] ?? [],
        studentEquipment
      )
    : [];

  return (
    <>
      <Screen>
        {/* TOPO COM VOLTAR E META CHIPS (FOTO 2) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={{ paddingVertical: 4 }}>
            <Body muted style={{ fontSize: 16 } as any}>← Sair do treino</Body>
          </Pressable>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: `${t.accent}20`,
              borderWidth: 1,
              borderColor: `${t.accent}40`,
            }}
          >
            <Body style={{ color: t.accent, fontSize: 12, fontWeight: '700' } as any}>
              ● Treino em Andamento
            </Body>
          </View>
        </View>

        {/* HERO BANNER DO TREINO */}
        <View
          style={{
            borderRadius: 22,
            overflow: 'hidden',
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
            position: 'relative',
          }}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
            }}
            style={{ width: '100%', height: 160, resizeMode: 'cover' }}
          />

          <View style={{ padding: 18, gap: 6 }}>
            <Label style={{ color: t.accent }}>Semana {slot.weekN} • {template.name}</Label>
            <Title size={26}>{session.name}</Title>

            <View style={{ flexDirection: 'row', gap: 14, marginTop: 4 }}>
              <Body muted style={{ fontSize: 13 } as any}>⏱ 45 min</Body>
              <Body muted style={{ fontSize: 13 } as any}>📊 Carga Progressiva</Body>
              <Body style={{ color: t.accent, fontSize: 13, fontWeight: 'bold' } as any}>🔥 320 kcal</Body>
            </View>
          </View>
        </View>

        {/* BANNER FLUTUANTE DE CRONÔMETRO DE DESCANSO */}
        {restSeconds !== null && (
          <View
            style={{
              backgroundColor: '#161C26',
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: t.accent,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ gap: 2 }}>
              <Label style={{ color: t.accent }}>Tempo de Descanso</Label>
              <Title size={28} style={{ color: t.accent, letterSpacing: 1 }}>
                {Math.floor(restSeconds / 60)}:
                {(restSeconds % 60).toString().padStart(2, '0')}
              </Title>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Chip label="+30s" onPress={() => setRestSeconds((s) => (s ?? 0) + 30)} />
              <Pressable onPress={() => setRestSeconds(null)} style={{ padding: 8 }}>
                <Body muted style={{ fontSize: 13 } as any}>Pular</Body>
              </Pressable>
            </View>
          </View>
        )}

        {/* LISTA DE EXERCÍCIOS */}
        {items.map((s, i) => {
          const planned = session.items[i];
          const exercise = exerciseById(s.exerciseId);

          return (
            <Card key={planned.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Title size={20}>{exercise.name}</Title>
                  <Body muted style={{ fontSize: 13 } as any}>
                    {planned.sets} séries × {planned.repMin}–{planned.repMax} reps • Descanso {planned.restS}s
                  </Body>
                </View>

                {/* Botão para ver vídeo no YouTube */}
                <Pressable
                  onPress={() => setSelectedVideo(exercise)}
                  style={{
                    backgroundColor: '#FF000020',
                    borderWidth: 1,
                    borderColor: '#FF000050',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ color: '#FF0000', fontSize: 12, fontWeight: 'bold' }}>▶ YouTube</Text>
                </Pressable>
              </View>

              {s.exerciseId !== planned.exerciseId && (
                <Body style={{ color: t.accent, fontSize: 13 } as any}>
                  Substituindo {exerciseById(planned.exerciseId).name}
                </Body>
              )}

              {/* Ajuste de Carga */}
              <View style={{ marginVertical: 4 }}>
                <Label>Carga da Série</Label>
                <View style={{ marginTop: 4 }}>
                  <LoadStepper
                    value={s.loadKg}
                    step={exercise.loadIncrement}
                    onChange={(v) => update(i, (x) => ({ ...x, loadKg: v }))}
                  />
                </View>
              </View>

              {/* Lista das Séries */}
              <View style={{ gap: 8, marginTop: 4 }}>
                {s.sets.map((set, n) => (
                  <View
                    key={n}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      backgroundColor: set.done ? `${t.accent}12` : t.surfaceElevated,
                      padding: 10,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: set.done ? `${t.accent}40` : t.border,
                    }}
                  >
                    <View style={{ width: 60 }}>
                      <Body style={{ fontSize: 13, fontWeight: '700' } as any}>Série {n + 1}</Body>
                    </View>

                    <TextInput
                      value={set.reps}
                      onChangeText={(reps) =>
                        update(i, (x) => ({
                          ...x,
                          sets: x.sets.map((y, k) => (k === n ? { ...y, reps } : y)),
                        }))
                      }
                      keyboardType="number-pad"
                      placeholder={`${planned.repMin}–${planned.repMax} reps`}
                      placeholderTextColor={t.muted}
                      style={{
                        flex: 1,
                        color: t.text,
                        fontSize: 15,
                        fontWeight: '600',
                        paddingVertical: 4,
                      }}
                    />

                    <Chip
                      label={set.done ? '✓ Feita' : 'Concluir'}
                      selected={set.done}
                      onPress={() => toggleSet(i, n)}
                    />
                  </View>
                ))}
              </View>

              {/* Botão de Aparelho Ocupado */}
              <View style={{ marginTop: 6 }}>
                <Button
                  title="Aparelho Ocupado? (Substituir)"
                  variant="ghost"
                  onPress={() => setSwapIndex(i)}
                />
              </View>
            </Card>
          );
        })}

        {/* BOTÃO PRINCIPAL DE CONCLUIR TREINO */}
        <Button
          title="Concluir Treino & Registrar →"
          onPress={() => setPhase('checkin')}
        />
      </Screen>

      {/* MODAL DE VÍDEO DO EXERCÍCIO COM YOUTUBE */}
      <ExerciseVideoModal
        exercise={selectedVideo}
        visible={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
      />

      {/* MODAL DE SUBSTITUIÇÃO DE EXERCÍCIO */}
      <Modal visible={swapIndex !== null} animationType="slide">
        <Screen>
          <Pressable onPress={() => setSwapIndex(null)} style={{ paddingVertical: 4 }}>
            <Body muted>← Voltar ao treino</Body>
          </Pressable>

          <Label>Aparelho Ocupado</Label>
          <Title size={26}>Escolha uma alternativa</Title>
          <Body muted>
            Exercícios com biomecânica compatível para você não perder o ritmo.
          </Body>

          {alternatives.length === 0 ? (
            <Card>
              <Body muted>Nenhum substituto compatível com os equipamentos disponíveis.</Body>
            </Card>
          ) : (
            alternatives.map((alt) => (
              <Card
                key={alt.id}
                onPress={() => {
                  if (swapIndex !== null) {
                    const last = lastLoadFor(alt.id, logs);
                    update(swapIndex, (x) => ({
                      ...x,
                      exerciseId: alt.id,
                      loadKg: last ?? x.loadKg,
                    }));
                    setSwapIndex(null);
                  }
                }}
              >
                <Title size={20}>{alt.name}</Title>
                <Body muted>
                  {swapTarget && approvedAlternatives[swapTarget.exerciseId]?.includes(alt.id)
                    ? '★ Aprovado pelo Treinador'
                    : 'Mesmo padrão de movimento'}
                </Body>
                <Body style={{ color: t.accent, fontSize: 13, fontWeight: 'bold' } as any}>
                  Toque para substituir neste treino →
                </Body>
              </Card>
            ))
          )}
        </Screen>
      </Modal>
    </>
  );
}
