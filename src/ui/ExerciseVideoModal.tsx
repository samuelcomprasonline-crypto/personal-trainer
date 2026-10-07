import React, { useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../domain/types';
import { colors, radius, spacing, typography } from './theme';

export function ExerciseVideoModal({
  exercise,
  visible,
  onClose,
}: {
  exercise: Exercise | null;
  visible: boolean;
  onClose: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!exercise) return null;

  const handleOpenYouTubeApp = () => {
    if (exercise.videoUrl) {
      Linking.openURL(exercise.videoUrl);
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop clicável para fechar */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* Quadro Proporcional e Minimalista */}
        <View style={styles.modalCard}>
          {/* Topo Minimalista */}
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: spacing.sm }}>
              <View style={styles.badgeRow}>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>BIOMECÂNICA EM ALTA DEFINIÇÃO</Text>
                </View>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {exercise.name}
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel="Fechar vídeo"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Quadro de Vídeo Estritamente Proporcional 16:9 (Perfeitamente Centralizado) */}
          <View style={styles.videoFrame}>
            {isPlaying && Platform.OS === 'web' && exercise.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <Pressable
                onPress={() => {
                  if (Platform.OS === 'web') {
                    setIsPlaying(true);
                  } else {
                    handleOpenYouTubeApp();
                  }
                }}
                style={styles.thumbnailContainer}
              >
                {exercise.thumbnailUrl ? (
                  <Image
                    source={{ uri: exercise.thumbnailUrl }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.thumbnailImage, { backgroundColor: '#141A23' }]} />
                )}

                {/* Camada sutil de gradiente escuro */}
                <View style={styles.thumbnailOverlay} />

                {/* Botão Play Minimalista Estilo Vidro */}
                <View style={styles.playButtonGlow}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>

                <View style={styles.durationPill}>
                  <Text style={styles.durationText}>▶ Clique para Iniciar Execução HD</Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Aviso e Ação Direta para o YouTube */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 4 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              {isPlaying ? '▶ Reproduzindo tutorial explicativo' : 'Tutorial focado apenas no movimento biomecânico'}
            </Text>
            <Pressable onPress={handleOpenYouTubeApp}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
                Abrir no YouTube Oficial ↗
              </Text>
            </Pressable>
          </View>

          {/* Informações Técnicas e Instruções */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsLabel}>PADRÃO DE MOVIMENTO & POSTURA</Text>
            <Text style={styles.instructionsText}>
              {exercise.instructions ??
                'Mantenha a escápula estabilizada, cadência controlada na descida (2 a 3 segundos) e máxima contração no pico do movimento.'}
            </Text>
          </View>

          {/* Rodapé de Ações Minimalista */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={handleOpenYouTubeApp}
              style={({ pressed }) => [
                styles.btnSecondary,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.btnSecondaryText}>Assistir em Tela Cheia ↗</Text>
            </Pressable>

            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.btnPrimary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.btnPrimaryText}>Voltar ao Treino</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 12, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    width: '100%',
    height: '100%',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    marginHorizontal: 'auto',
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 25,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillBadge: {
    backgroundColor: 'rgba(198, 244, 50, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(198, 244, 50, 0.3)',
  },
  pillBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeIcon: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  // Quadro estritamente 16:9 proporcional
  videoFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  thumbnailContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  playButtonGlow: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(10, 14, 19, 0.85)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  playIcon: {
    color: colors.primary,
    fontSize: 22,
    marginLeft: 3,
  },
  durationPill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(10, 14, 19, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  instructionsBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  instructionsLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  instructionsText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  btnSecondary: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: '700',
  },
  btnPrimary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  btnPrimaryText: {
    color: colors.black,
    fontSize: typography.small,
    fontWeight: '800',
  },
});
