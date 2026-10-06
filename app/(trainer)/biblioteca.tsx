import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { equipmentLabel, exercises, muscleLabel, trainer } from '../../src/data/seed';
import type { Exercise } from '../../src/domain/types';
import { Body, Card, Chip, Label, Screen, Title } from '../../src/ui/components';
import { ExerciseVideoModal } from '../../src/ui/ExerciseVideoModal';
import { useTheme } from '../../src/ui/theme';

export default function Biblioteca() {
  const t = useTheme();
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);

  const filtered = exercises.filter((e) => {
    const matchesMuscle = selectedMuscle ? e.primaryMuscle === selectedMuscle : true;
    const matchesSearch = search.trim()
      ? e.name.toLowerCase().includes(search.toLowerCase()) ||
        (muscleLabel[e.primaryMuscle] ?? '').toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesMuscle && matchesSearch;
  });

  return (
    <>
      <Screen>
        {/* CABEÇALHO (FOTO 2: EXERCISE LIBRARY) */}
        <View style={{ gap: 4, marginTop: 4 }}>
          <Label style={{ color: t.accent }}>{trainer.name} • Biomecânica</Label>
          <Title size={28}>Biblioteca de Exercícios</Title>
          <Body muted style={{ fontSize: 13 } as any}>
            Consulte a biomecânica, padrões motores e assista à execução técnica no YouTube.
          </Body>
        </View>

        {/* CAMPO DE BUSCA */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: t.surfaceElevated,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou músculo..."
            placeholderTextColor={t.muted}
            style={{
              flex: 1,
              color: t.text,
              fontSize: 15,
            }}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Text style={{ color: t.muted, fontSize: 14 }}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        {/* FILTROS EM PÍLULAS */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Chip
            label="Todos"
            selected={selectedMuscle === null}
            onPress={() => setSelectedMuscle(null)}
          />
          {Object.entries(muscleLabel).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              selected={selectedMuscle === key}
              onPress={() => setSelectedMuscle(key)}
            />
          ))}
        </View>

        {/* LISTA DE EXERCÍCIOS COM MINIATURAS E BOTÃO YOUTUBE (FOTO 2) */}
        <View style={{ gap: 10 }}>
          {filtered.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => setSelectedVideo(e)}
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
              {/* Miniatura do Exercício */}
              <View style={{ width: 68, height: 68, borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
                <Image
                  source={{ uri: e.thumbnailUrl }}
                  style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: '#FF0000',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>▶</Text>
                </View>
              </View>

              <View style={{ flex: 1, gap: 3 }}>
                <Title size={17}>{e.name}</Title>
                <Body muted style={{ fontSize: 13 } as any}>
                  {muscleLabel[e.primaryMuscle] ?? e.primaryMuscle} • {equipmentLabel[e.equipment] ?? e.equipment}
                </Body>
                <Body style={{ color: t.accent, fontSize: 11, fontWeight: '600' } as any}>
                  Ver tutorial no YouTube ↗
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
          ))}
        </View>
      </Screen>

      {/* MODAL DE EXECUÇÃO DO YOUTUBE */}
      <ExerciseVideoModal
        exercise={selectedVideo}
        visible={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}
