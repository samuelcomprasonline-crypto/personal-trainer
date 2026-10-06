import { useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, View } from 'react-native';
import type { Exercise } from '../domain/types';
import { Body, Button, Card, Label, Title } from './components';
import { useTheme } from './theme';

export function ExerciseVideoModal({
  exercise,
  visible,
  onClose,
}: {
  exercise: Exercise | null;
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTheme();
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
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: t.bg, padding: 20 }}>
        {/* Cabeçalho */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 16 }}>
          <Pressable onPress={handleClose} style={{ padding: 8 }}>
            <Body muted style={{ fontSize: 16 } as any}>← Voltar ao treino</Body>
          </Pressable>
          <View
            style={{
              backgroundColor: '#FF000020',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#FF000040',
            }}
          >
            <Body style={{ color: '#FF0000', fontSize: 12, fontWeight: 'bold' } as any}>
              ● YouTube Oficial
            </Body>
          </View>
        </View>

        <View style={{ gap: 4, marginBottom: 16 }}>
          <Label>Tutorial de Execução Biomecânica</Label>
          <Title size={28}>{exercise.name}</Title>
          <Body muted style={{ fontSize: 14 } as any}>
            Aprenda a cadência, ângulo e contração corretos para máxima hipertrofia com segurança articular.
          </Body>
        </View>

        {/* Player de Vídeo / Prévia YouTube */}
        <View
          style={{
            width: '100%',
            height: 250,
            borderRadius: 22,
            overflow: 'hidden',
            backgroundColor: '#000000',
            position: 'relative',
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          {isPlaying && Platform.OS === 'web' && exercise.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=1&rel=0`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              {exercise.thumbnailUrl ? (
                <Image
                  source={{ uri: exercise.thumbnailUrl }}
                  style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
              ) : null}

              {/* Botão Play Luminoso Central */}
              <View
                style={{
                  position: 'absolute',
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              >
                <Title size={26} style={{ color: '#FFFFFF', marginLeft: 4 }}>▶</Title>
              </View>
            </Pressable>
          )}
        </View>

        {/* Informações Técnicas e Instruções */}
        <Card style={{ marginTop: 16 } as any}>
          <Label>Orientações do Treinador</Label>
          <Body style={{ fontSize: 15, lineHeight: 22 } as any}>
            {exercise.instructions ??
              'Mantenha a postura alinhada, respire na fase excêntrica e solte o ar na fase concêntrica. Evite trancos articulares.'}
          </Body>
        </Card>

        {/* Ação para abrir aplicativo externo */}
        <View style={{ marginTop: 16, gap: 10 }}>
          <Button
            title="Assistir no Aplicativo do YouTube ↗"
            onPress={handleOpenYouTubeApp}
          />
          <Button
            title="Concluir e Voltar às Séries"
            variant="ghost"
            onPress={handleClose}
          />
        </View>
      </View>
    </Modal>
  );
}
