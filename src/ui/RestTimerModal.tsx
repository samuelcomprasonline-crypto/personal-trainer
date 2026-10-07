import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip, Label, Title } from './components';
import { useTheme } from './theme';

interface RestTimerModalProps {
  visible: boolean;
  initialSeconds?: number;
  exerciseName?: string;
  onClose: () => void;
  onComplete?: () => void;
}

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
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // Ignorar se áudio bloqueado
    }
  }
}

export function RestTimerModal({
  visible,
  initialSeconds = 60,
  exerciseName,
  onClose,
  onComplete,
}: RestTimerModalProps) {
  const t = useTheme();
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sincroniza quando initialSeconds mudar ou ao abrir
  useEffect(() => {
    if (visible) {
      setTotalSeconds(initialSeconds);
      setSecondsLeft(initialSeconds);
      setIsPaused(false);
      setIsMinimized(false);
    }
  }, [visible, initialSeconds]);

  // Contagem regressiva
  useEffect(() => {
    if (!visible || isPaused || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          playTimerChime();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, isPaused, secondsLeft, onComplete]);

  if (!visible) return null;

  const progressPercent = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0;
  const minutes = Math.floor(secondsLeft / 60);
  const remainingSecs = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  const addSeconds = (secs: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSecondsLeft((prev) => Math.max(0, prev + secs));
    setTotalSeconds((prev) => Math.max(prev, secondsLeft + secs));
  };

  const setPreset = (secs: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsPaused(false);
  };

  // Se minimizado, exibe banner flutuante no rodapé
  if (isMinimized) {
    return (
      <View style={styles.floatingBanner}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: secondsLeft === 0 ? t.accent : '#F59E0B',
            }}
          />
          <View>
            <Text style={{ color: t.muted, fontSize: 11, fontWeight: '600' }}>
              {secondsLeft === 0 ? 'DESCANSO FINALIZADO!' : 'DESCANSO EM ANDAMENTO'}
            </Text>
            <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>
              ⏱ {formattedTime}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable
            onPress={() => setIsMinimized(false)}
            style={[styles.smallBtn, { backgroundColor: t.surfaceElevated, borderColor: t.border }]}
          >
            <Text style={{ color: t.text, fontSize: 13, fontWeight: '700' }}>Ampliar</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={[styles.smallBtn, { backgroundColor: t.accent, borderColor: t.accent }]}
          >
            <Text style={{ color: '#000000', fontSize: 13, fontWeight: '800' }}>
              {secondsLeft === 0 ? 'Concluir' : 'Pular'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          {/* TOPO COM MINIMIZAR E FECHAR */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Label style={{ color: t.accent }}>Cronômetro de Recuperação</Label>
              <Title size={20}>
                {exerciseName ? `Descanso: ${exerciseName}` : 'Intervalo entre Séries'}
              </Title>
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                onPress={() => setIsMinimized(true)}
                style={[styles.iconButton, { borderColor: t.border }]}
              >
                <Text style={{ color: t.muted, fontSize: 16 }}>🗕</Text>
              </Pressable>
              <Pressable
                onPress={onClose}
                style={[styles.iconButton, { borderColor: t.border }]}
              >
                <Text style={{ color: t.muted, fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* DISPLAY CENTRAL DO CRONÔMETRO */}
          <View style={styles.timerDisplayContainer}>
            <View
              style={[
                styles.timerCircle,
                {
                  borderColor: secondsLeft === 0 ? t.accent : `${t.accent}40`,
                  backgroundColor: secondsLeft === 0 ? `${t.accent}15` : `${t.surfaceElevated}`,
                },
              ]}
            >
              <Text
                style={[
                  styles.timerText,
                  { color: secondsLeft === 0 ? t.accent : t.text },
                ]}
              >
                {formattedTime}
              </Text>
              <Text style={{ color: t.muted, fontSize: 13, marginTop: 4 }}>
                {secondsLeft === 0
                  ? 'Pronto para a próxima série! 💥'
                  : isPaused
                  ? 'PAUSADO'
                  : 'Respire fundo e recupere 🫁'}
              </Text>
            </View>

            {/* BARRA DE PROGRESSO VISUAL */}
            <View style={[styles.progressBarTrack, { backgroundColor: t.surfaceElevated }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: t.accent,
                  },
                ]}
              />
            </View>
          </View>

          {/* AJUSTES RÁPIDOS (+15s / -15s / Pausar) */}
          <View style={styles.controlsRow}>
            <Pressable
              onPress={() => addSeconds(-15)}
              style={[styles.actionBtn, { borderColor: t.border, backgroundColor: t.surfaceElevated }]}
            >
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 13 }}>-15s</Text>
            </Pressable>

            <Pressable
              onPress={() => setIsPaused(!isPaused)}
              style={[
                styles.actionBtn,
                {
                  borderColor: isPaused ? t.accent : t.border,
                  backgroundColor: isPaused ? t.accent : t.surfaceElevated,
                },
              ]}
            >
              <Text
                style={{
                  color: isPaused ? '#000000' : t.text,
                  fontWeight: '800',
                  fontSize: 13,
                }}
              >
                {isPaused ? '▶ Retomar' : '⏸ Pausar'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => addSeconds(15)}
              style={[styles.actionBtn, { borderColor: t.border, backgroundColor: t.surfaceElevated }]}
            >
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 13 }}>+15s</Text>
            </Pressable>

            <Pressable
              onPress={() => addSeconds(30)}
              style={[styles.actionBtn, { borderColor: `${t.accent}60`, backgroundColor: `${t.accent}15` }]}
            >
              <Text style={{ color: t.accent, fontWeight: '800', fontSize: 13 }}>+30s</Text>
            </Pressable>
          </View>

          {/* PRESETS DE INTERVALO */}
          <View style={{ marginTop: 14 }}>
            <Label style={{ marginBottom: 6 }}>Predefinições de Intervalo:</Label>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {[30, 45, 60, 90, 120].map((s) => (
                <Chip
                  key={s}
                  label={`${s}s`}
                  selected={totalSeconds === s && secondsLeft > 0}
                  onPress={() => setPreset(s)}
                />
              ))}
            </View>
          </View>

          {/* BOTÕES INFERIORES */}
          <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={[
                styles.bottomBtn,
                {
                  flex: 1,
                  backgroundColor: t.surfaceElevated,
                  borderColor: t.border,
                },
              ]}
            >
              <Text style={{ color: t.muted, fontWeight: '700', fontSize: 14 }}>
                Pular Descanso
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={[
                styles.bottomBtn,
                {
                  flex: 1.2,
                  backgroundColor: t.accent,
                  borderColor: t.accent,
                },
              ]}
            >
              <Text style={{ color: '#000000', fontWeight: '800', fontSize: 14 }}>
                {secondsLeft === 0 ? 'Bora pra Série! 🚀' : 'Continuar Treinando'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDisplayContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#161C26',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9999,
  },
});
