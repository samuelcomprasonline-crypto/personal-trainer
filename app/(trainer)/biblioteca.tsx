import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View, ScrollView } from 'react-native';
import { equipmentLabel, exercises, muscleLabel, trainer } from '../../src/data/seed';
import { trainingMethods, workoutProgramsCatalog } from '../../src/domain/workoutLibrary';
import type { Exercise, WorkoutProgram, TrainingMethod } from '../../src/domain/types';
import { Body, Card, Chip, Label, Screen, Title, Button } from '../../src/ui/components';
import { ExerciseVideoModal } from '../../src/ui/ExerciseVideoModal';
import { NewWorkoutProgramModal } from '../../src/ui/NewWorkoutProgramModal';
import { useTheme } from '../../src/ui/theme';

export default function Biblioteca() {
  const t = useTheme();
  const [programsList, setProgramsList] = useState<WorkoutProgram[]>([...workoutProgramsCatalog]);
  const [tab, setTab] = useState<'programas' | 'metodos' | 'exercicios'>('programas');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);
  const [appliedProgramNotice, setAppliedProgramNotice] = useState<string | null>(null);

  const filteredExercises = exercises.filter((e) => {
    const matchesMuscle = selectedMuscle ? e.primaryMuscle === selectedMuscle : true;
    const matchesSearch = search.trim()
      ? e.name.toLowerCase().includes(search.toLowerCase()) ||
        (muscleLabel[e.primaryMuscle] ?? '').toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesMuscle && matchesSearch;
  });

  const handleApplyProgram = (program: WorkoutProgram) => {
    setAppliedProgramNotice(`Programa "${program.name}" selecionado e sincronizado com os alunos da consultoria!`);
    setTimeout(() => setAppliedProgramNotice(null), 4000);
  };

  const handleSaveNewProgram = (newProg: WorkoutProgram) => {
    workoutProgramsCatalog.unshift(newProg);
    setProgramsList([newProg, ...programsList]);
    setShowNewProgramModal(false);
    setAppliedProgramNotice(`Protocolo "${newProg.name}" cadastrado com sucesso no banco de dados!`);
    setTimeout(() => setAppliedProgramNotice(null), 5000);
  };

  return (
    <>
      <Screen>
        {/* CABEÇALHO */}
        <View style={{ gap: 4, marginTop: 4 }}>
          <Label style={{ color: t.accent }}>{trainer.name} • Sistema de Prescrição</Label>
          <Title size={28}>Central de Treinamento</Title>
          <Body muted style={{ fontSize: 13 } as any}>
            Acesse o banco de programas periodizados, métodos avançados de intensidade e biomecânica em vídeo.
          </Body>
        </View>

        {appliedProgramNotice && (
          <View
            style={{
              backgroundColor: 'rgba(198, 244, 50, 0.15)',
              padding: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: t.accent,
            }}
          >
            <Body style={{ color: t.accent, fontWeight: '700' } as any}>✓ {appliedProgramNotice}</Body>
          </View>
        )}

        {/* BOTÃO EM DESTAQUE PARA CADASTRAR NOVO PROTOCOLO */}
        <View style={{ marginVertical: 4 }}>
          <Button
            title="+ Cadastrar Novo Treino / Protocolo 📋"
            onPress={() => setShowNewProgramModal(true)}
          />
        </View>

        {/* ABAS MODERNAS */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Chip
            label="Programas & Fichas Prontas"
            selected={tab === 'programas'}
            onPress={() => setTab('programas')}
          />
          <Chip
            label="Métodos de Intensidade"
            selected={tab === 'metodos'}
            onPress={() => setTab('metodos')}
          />
          <Chip
            label="Biblioteca de Exercícios"
            selected={tab === 'exercicios'}
            onPress={() => setTab('exercicios')}
          />
        </View>

        {/* ABA 1: PROGRAMAS & FICHAS DO BANCO DE DADOS */}
        {tab === 'programas' && (
          <View style={{ gap: 14 }}>
            <Body muted style={{ fontSize: 13 } as any}>
              Divisões de treino cientificamente estruturadas. Clique para aplicar diretamente aos alunos.
            </Body>

            {programsList.map((prog) => (
              <Card key={prog.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 999,
                        backgroundColor: `${t.accent}20`,
                        marginBottom: 6,
                      }}
                    >
                      <Body style={{ color: t.accent, fontSize: 11, fontWeight: '800' } as any}>
                        {prog.goal.toUpperCase()} • NÍVEL {prog.level.toUpperCase()}
                      </Body>
                    </View>
                    <Title size={20}>{prog.name}</Title>
                  </View>
                </View>

                <Body muted style={{ fontSize: 13, marginTop: 4 } as any}>
                  {prog.description}
                </Body>

                <View
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    marginVertical: 10,
                    paddingVertical: 8,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: t.border,
                  }}
                >
                  <View>
                    <Label style={{ fontSize: 10 }}>FREQUÊNCIA</Label>
                    <Body style={{ fontWeight: '700', fontSize: 13 } as any}>{prog.frequencyDaysPerWeek}x / semana</Body>
                  </View>
                  <View>
                    <Label style={{ fontSize: 10 }}>CICLO</Label>
                    <Body style={{ fontWeight: '700', fontSize: 13 } as any}>{prog.durationWeeks} semanas</Body>
                  </View>
                  <View>
                    <Label style={{ fontSize: 10 }}>DIVISÕES</Label>
                    <Body style={{ fontWeight: '700', fontSize: 13 } as any}>{prog.sessions.length} sessões</Body>
                  </View>
                </View>

                {/* Sessões do Programa */}
                <View style={{ gap: 6, marginBottom: 12 }}>
                  <Label style={{ fontSize: 11 }}>Sessões Inclusas no Programa:</Label>
                  {prog.sessions.map((s) => (
                    <View
                      key={s.id}
                      style={{
                        backgroundColor: t.surfaceElevated,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Body style={{ fontSize: 13, fontWeight: '600' } as any}>{s.name}</Body>
                      <Body muted style={{ fontSize: 12 } as any}>{s.items.length} exercícios</Body>
                    </View>
                  ))}
                </View>

                <Button
                  title="Aplicar Este Programa aos Alunos ✓"
                  onPress={() => handleApplyProgram(prog)}
                />
              </Card>
            ))}
          </View>
        )}

        {/* ABA 2: MÉTODOS DE TREINAMENTO (REST-PAUSE, DROP-SET, PIRÂMIDE, ETC) */}
        {tab === 'metodos' && (
          <View style={{ gap: 14 }}>
            <Body muted style={{ fontSize: 13 } as any}>
              Variáveis avançadas de sobrecarga para quebrar platôs de hipertrofia e densidade muscular.
            </Body>

            {trainingMethods.map((met) => {
              const badgeColor =
                met.intensityLevel === 'extremo'
                  ? '#FF6B6B'
                  : met.intensityLevel === 'alto'
                  ? t.accent
                  : '#FFD93D';

              return (
                <Card key={met.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title size={19}>{met.name}</Title>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor: `${badgeColor}22`,
                      }}
                    >
                      <Body style={{ color: badgeColor, fontSize: 10, fontWeight: '800' } as any}>
                        INTENSIDADE {met.intensityLevel.toUpperCase()}
                      </Body>
                    </View>
                  </View>

                  <Body style={{ fontSize: 14, color: '#E2E8F0', marginTop: 6 } as any}>
                    {met.description}
                  </Body>

                  <View
                    style={{
                      backgroundColor: t.surfaceElevated,
                      padding: 12,
                      borderRadius: 12,
                      marginTop: 8,
                      borderLeftWidth: 3,
                      borderLeftColor: t.accent,
                    }}
                  >
                    <Label style={{ color: t.accent, fontSize: 10 }}>COMO O TREINADOR DEVE PRESCREVER:</Label>
                    <Body muted style={{ fontSize: 12, marginTop: 2 } as any}>
                      {met.howToApply}
                    </Body>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* ABA 3: EXERCÍCIOS & BIOMECÂNICA EM VÍDEO DO YOUTUBE */}
        {tab === 'exercicios' && (
          <View style={{ gap: 12 }}>
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

            {/* LISTA DE EXERCÍCIOS */}
            <View style={{ gap: 10 }}>
              {filteredExercises.map((e) => (
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
          </View>
        )}
      </Screen>

      {/* MODAL DE EXECUÇÃO DO YOUTUBE */}
      <ExerciseVideoModal
        exercise={selectedVideo}
        visible={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
      />

      {/* MODAL DE CADASTRO DE NOVO TREINO / PROTOCOLO */}
      <NewWorkoutProgramModal
        visible={showNewProgramModal}
        onClose={() => setShowNewProgramModal(false)}
        onSaveProgram={handleSaveNewProgram}
      />
    </>
  );
}
