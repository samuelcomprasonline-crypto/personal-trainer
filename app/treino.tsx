import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
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
import type { Mood, SessionLog } from '../src/domain/types';
import { useAppState } from '../src/state/AppState';
import { Body, Button, Card, Chip, Label, LoadStepper, Screen, Title } from '../src/ui/components';
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
        osc.frequency.setValueAtTime(880, ctx.currentTime); // Tom suave A5
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
    (session?.items ?? []).map((item) => ({
      exerciseId: item.exerciseId,
      loadKg: plannedLoad(baseLoads[item.id] ?? 0, item.weeklyIncrementKg, slot?.weekN ?? 1),
      sets: Array.from({ length: item.sets }, () => ({ reps: '', done: false })),
    })),
  );

  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<'workout' | 'checkin'>('workout');
  const [rpe, setRpe] = useState(7);
  const [mood, setMood] = useState<Mood | undefined>('ok');
  const [saving, setSaving] = useState(false);

  // CRONÔMETRO DE DESCANSO INTELIGENTE
  const [restSeconds, setRestSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev === null || prev <= 1) {
          playTimerChime();
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restSeconds]);

  if (!slot || !session) {
    return (
      <Screen>
        <Title>Nenhum treino pendente para hoje.</Title>
        <Button title="Voltar" onPress={() => router.back()} />
      </Screen>
    );
  }

  const update = (i: number, fn: (s: ItemState) => ItemState) =>
    setItems((prev) => prev.map((s, idx) => (idx === i ? fn(s) : s)));

  const toggleSet = (i: number, n: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const plannedRest = session.items[i]?.restS ?? 60;
    const currentDone = items[i]?.sets[n]?.done;

    // Se está marcando a série como concluída agora, ativa o cronômetro do descanso!
    if (!currentDone) {
      setRestSeconds(plannedRest);
    }

    update(i, (s) => ({ ...s, sets: s.sets.map((x, k) => (k === n ? { ...x, done: !x.done } : x)) }));
  };

  const swap = (i: number, exerciseId: string) => {
    update(i, (s) => ({ ...s, exerciseId, loadKg: lastLoadFor(exerciseId, logs) }));
    setSwapIndex(null);
  };

  const finish = async (withCheckin: boolean) => {
    const log: SessionLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      templateSessionId: session.id,
      weekN: slot.weekN,
      completedAt: new Date().toISOString(),
      rpe: withCheckin ? rpe : undefined,
      mood: withCheckin ? mood : undefined,
      sets: items.flatMap((s, i) => {
        const planned = session.items[i];
        return s.sets
          .filter((set) => set.done)
          .map((set, k) => ({
            exerciseId: s.exerciseId,
            setN: k + 1,
            reps: Number(set.reps) || planned.repMin,
            loadKg: s.loadKg ?? 0,
            substitutedFrom: s.exerciseId !== planned.exerciseId ? planned.exerciseId : undefined,
          }));
      }),
    };

    setSaving(true);
    try {
      await addLog(log);
      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Não foi possível salvar', 'Seu treino continua aqui. Tente novamente.');
    }
  };

  if (phase === 'checkin') {
    return (
      <Screen>
        <Label>Treino concluído</Label>
        <Title>Como você se sentiu?</Title>

        <Card>
          <Label>Percepção de Esforço (RPE)</Label>
          <Title size={36}>{rpe}/10</Title>
          <Body muted>
            {rpe <= 4
              ? 'Muito leve — quase nenhum cansaço'
              : rpe <= 6
              ? 'Moderado — dava para fazer mais várias repetições'
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
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
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

        <Button title="Salvar e finalizar" onPress={() => finish(true)} disabled={saving} />
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
        studentEquipment,
      )
    : [];

  return (
    <>
      <Screen>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
        >
          <Body muted>← Voltar para o início</Body>
        </Pressable>

        <Label>
          Semana {slot.weekN} · {template.name}
        </Label>
        <Title size={28}>{session.name}</Title>

        {/* BANNER FLUTUANTE DE DESCANSO */}
        {restSeconds !== null && (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <View style={{ gap: 2 }}>
                <Label>Tempo de Recuperação</Label>
                <Title size={24} style={{ color: t.accent } as any}>
                  ⏱ {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}
                </Title>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Chip label="+30s" onPress={() => setRestSeconds((prev) => (prev ?? 0) + 30)} />
                <Pressable onPress={() => setRestSeconds(null)} style={{ padding: 6 }}>
                  <Body muted style={{ fontSize: 13 }}>Pular</Body>
                </Pressable>
              </View>
            </View>
          </Card>
        )}

        {items.map((s, i) => {
          const planned = session.items[i];
          const exercise = exerciseById(s.exerciseId);

          return (
            <Card key={planned.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title size={22}>{exercise.name}</Title>
              </View>

              {s.exerciseId !== planned.exerciseId && (
                <Body muted>Substituindo {exerciseById(planned.exerciseId).name}</Body>
              )}

              <Body muted>
                Alvo: {planned.sets} séries × {planned.repMin}–{planned.repMax} reps · descanso {planned.restS}s
              </Body>

              <View style={{ marginVertical: 6 }}>
                <LoadStepper
                  value={s.loadKg}
                  step={exercise.loadIncrement}
                  onChange={(v) => update(i, (x) => ({ ...x, loadKg: v }))}
                />
              </View>

              <View style={{ gap: 10, marginTop: 4 }}>
                {s.sets.map((set, n) => (
                  <View
                    key={n}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 4,
                    }}
                  >
                    <View style={{ width: 64 }}>
                      <Body muted>Série {n + 1}</Body>
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
                      accessibilityLabel={`Repetições da série ${n + 1}`}
                      style={{
                        flex: 1,
                        color: t.text,
                        fontFamily: t.fonts.body,
                        fontSize: 16,
                        borderBottomWidth: 1,
                        borderColor: t.border,
                        paddingVertical: 6,
                        paddingHorizontal: 4,
                        ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
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

              <View style={{ marginTop: 8 }}>
                <Button title="Aparelho ocupado (Substituir)" variant="ghost" onPress={() => setSwapIndex(i)} />
              </View>
            </Card>
          );
        })}

        <Button title="Concluir treino" onPress={() => setPhase('checkin')} />
      </Screen>

      <Modal
        visible={swapIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSwapIndex(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: t.bg,
              padding: 24,
              borderRadius: 24,
              gap: 14,
              maxWidth: 520,
              width: '100%',
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <Title size={22}>Substituições Sugeridas</Title>
            <Body muted>Alternativas inteligentes com o mesmo padrão biomecânico:</Body>

            {alternatives.length === 0 ? (
              <Body muted>Nenhum substituto cadastrado com o equipamento disponível no momento.</Body>
            ) : (
              alternatives.map((alt) => {
                const last = lastLoadFor(alt.id, logs);
                return (
                  <Card key={alt.id} onPress={() => swap(swapIndex!, alt.id)}>
                    <Title size={18}>{alt.name}</Title>
                    <Body muted>
                      {last === null ? 'Sem histórico de carga recente' : `Última carga registrada: ${last} kg`}
                    </Body>
                  </Card>
                );
              })
            )}

            <Button title="Cancelar" variant="ghost" onPress={() => setSwapIndex(null)} />
          </View>
        </View>
      </Modal>
    </>
  );
}
