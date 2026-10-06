import { useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import type { AssessmentPhotos } from '../domain/types';
import { Body, Button, Card, Chip, Label, Title } from './components';
import { useTheme } from './theme';

export function AssessmentPhotoGallery({ photos }: { photos?: AssessmentPhotos }) {
  const t = useTheme();
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; label: string } | null>(null);
  const [activeAngle, setActiveAngle] = useState<'todos' | 'frente' | 'costas' | 'perfil'>('todos');

  if (!photos) return null;

  const photoList = [
    { key: 'frente', label: 'Vista Anterior (Frente)', url: photos.frenteUrl },
    { key: 'costas', label: 'Vista Posterior (Costas)', url: photos.costasUrl },
    { key: 'perfil', label: 'Perfil Direito', url: photos.perfilDireitoUrl },
    { key: 'perfil', label: 'Perfil Esquerdo', url: photos.perfilEsquerdoUrl },
  ].filter((p) => Boolean(p.url)) as { key: string; label: string; url: string }[];

  const filtered = activeAngle === 'todos' ? photoList : photoList.filter((p) => p.key === activeAngle);

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <View>
          <Label>Registro Fotográfico Postural</Label>
          <Title size={22}>Fotos da Avaliação</Title>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="Todas" selected={activeAngle === 'todos'} onPress={() => setActiveAngle('todos')} />
          <Chip label="Frente" selected={activeAngle === 'frente'} onPress={() => setActiveAngle('frente')} />
          <Chip label="Costas" selected={activeAngle === 'costas'} onPress={() => setActiveAngle('costas')} />
          <Chip label="Perfil" selected={activeAngle === 'perfil'} onPress={() => setActiveAngle('perfil')} />
        </View>
      </View>

      <Body muted style={{ fontSize: 13 } as any}>
        Acompanhamento visual em alta definição realizado em {photos.data}. Toque na foto para ampliar em tela cheia.
      </Body>

      {/* Grade de Fotos */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
        {filtered.map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => setSelectedPhoto({ url: item.url, label: item.label })}
            style={({ pressed }) => ({
              flex: 1,
              minWidth: 140,
              maxWidth: Platform.OS === 'web' ? '24%' : '48%',
              borderRadius: 18,
              overflow: 'hidden',
              backgroundColor: t.surfaceElevated,
              borderWidth: 1,
              borderColor: t.border,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Image
              source={{ uri: item.url }}
              style={{ width: '100%', height: 210, resizeMode: 'cover' }}
            />
            <View style={{ padding: 10, backgroundColor: t.surfaceCard }}>
              <Body style={{ fontSize: 12, fontWeight: '600' } as any}>{item.label}</Body>
              <Label style={{ fontSize: 10, marginTop: 2 } as any}>{photos.data}</Label>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Modal de Foto em Tela Cheia */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <Pressable
          onPress={() => setSelectedPhoto(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          {selectedPhoto && (
            <View style={{ width: '100%', maxWidth: 500, alignItems: 'center', gap: 14 }}>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title size={20} style={{ color: '#FFFFFF' }}>{selectedPhoto.label}</Title>
                <Pressable onPress={() => setSelectedPhoto(null)} style={{ padding: 8 }}>
                  <Body style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' } as any}>✕</Body>
                </Pressable>
              </View>

              <Image
                source={{ uri: selectedPhoto.url }}
                style={{
                  width: '100%',
                  height: 480,
                  borderRadius: 20,
                  resizeMode: 'contain',
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              />

              <Body muted style={{ color: '#94A3B8', fontSize: 13 } as any}>
                Toque em qualquer local fora da imagem para fechar.
              </Body>
            </View>
          )}
        </Pressable>
      </Modal>
    </Card>
  );
}
