import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View, ScrollView } from 'react-native';
import { equipmentLabel, exercises, muscleLabel, trainer } from '../../src/data/seed';
import { trainingMethods, workoutProgramsCatalog } from '../../src/domain/workoutLibrary';
import type { Exercise, WorkoutProgram, TrainingMethod } from '../../src/domain/types';
import { Body, Card, Chip, Label, Screen, Title, Button } from '../../src/ui/components';
import { ExerciseVideoModal } from '../../src/ui/ExerciseVideoModal';
import { NewWorkoutProgramModal } from '../../src/ui/NewWorkoutProgramModal';
import { useTheme } from '../../src/ui/theme';

import { WorkoutHistoryView } from '../../src/ui/WorkoutHistoryView';

export default function Biblioteca() {
  const t = useTheme();
  const [programsList, setProgramsList] = useState<WorkoutProgram[]>([...workoutProgramsCatalog]);
  const [tab, setTab] = useState<'programas' | 'metodos' | 'exercicios' | 'historico'>('programas');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);
  const [appliedProgramNotice, setAppliedProgramNotice] = useState<string | null>(null);

  const displayedExercises = exercises.filter((e) => {
    const matchesArea = selectedArea === 'todos' || !selectedArea ? true : e.targetArea === selectedArea;
    const matchesMuscle = selectedMuscle ? e.primaryMuscle === selectedMuscle : true;
    const matchesSearch = search.trim()
      ? e.name.toLowerCase().includes(search.toLowerCase()) ||
        (muscleLabel[e.primaryMuscle] ?? '').toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesArea && matchesMuscle && matchesSearch;
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
          <Title size={22}>Central de Treinamento</Title>
          <Body muted style={{ fontSize: 13 } as any}>
            Acesse o banco de programas periodizados, métodos avançados de intensidade e biomecânica em vídeo.
          </Body>
        </View>

        {appliedProgramNotice && (
          <View
            style={{
              backgroundColor: t.accentSubtle,
              padding: 10,
              borderRadius: 10,
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4, paddingHorizontal: 2 }}
          style={{ marginVertical: 2 }}
        >
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
          <Chip
            label="Telemetria & Histórico Pro"
            selected={tab === 'historico'}
            onPress={() => setTab('historico')}
          />
        </ScrollView>

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
          <View style={{ gap: 14 }}>
            {/* 1. CARDS DE MÉTRICAS GERAIS (ESTILO DO PRINT DE HISTÓRICO) */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <View
                style={{
                  flex: 1,
                  minWidth: 140,
                  backgroundColor: '#0F172A',
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#1E293B',
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>📅</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>TOTAL EXERCÍCIOS</Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>25</Text>
                <Text style={{ color: '#64748B', fontSize: 11 }}>No Banco de Dados</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: 140,
                  backgroundColor: '#0F172A',
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#1E293B',
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>🏋️</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>TOTAL REPETIÇÕES</Text>
                </View>
                <Text style={{ color: '#10B981', fontSize: 20, fontWeight: '800' }}>1.248</Text>
                <Text style={{ color: '#64748B', fontSize: 11 }}>Ciclo de 4 Semanas</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: 140,
                  backgroundColor: '#0F172A',
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#1E293B',
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>🔥</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>TOTAL CALORIAS</Text>
                </View>
                <Text style={{ color: '#F97316', fontSize: 20, fontWeight: '800' }}>2.640</Text>
                <Text style={{ color: '#64748B', fontSize: 11 }}>Kcal Estimadas</Text>
              </View>

              <View
                style={{
                  flex: 1,
                  minWidth: 140,
                  backgroundColor: '#0F172A',
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#1E293B',
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>⏱️</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>TEMPO TOTAL</Text>
                </View>
                <Text style={{ color: '#A855F7', fontSize: 20, fontWeight: '800' }}>18h 42m</Text>
                <Text style={{ color: '#64748B', fontSize: 11 }}>Duração Acumulada</Text>
              </View>
            </View>

            {/* 2. CAMPO DE BUSCA */}
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
                placeholder="Buscar exercício por nome, músculo ou padrão..."
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

            {/* 3. FILTROS POR ÁREAS DE TREINAMENTO (CONFORME SOLICITADO PELO USUÁRIO) */}
            <View style={{ gap: 6 }}>
              <Label style={{ fontSize: 11, color: t.accent }}>ÁREA DE TREINAMENTO:</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <Chip
                  label="🌟 Todos"
                  selected={selectedArea === 'todos'}
                  onPress={() => setSelectedArea('todos')}
                />
                <Chip
                  label="🏋️ Peitoral"
                  selected={selectedArea === 'peito'}
                  onPress={() => setSelectedArea('peito')}
                />
                <Chip
                  label="🧗 Costas & Dorsais"
                  selected={selectedArea === 'costas'}
                  onPress={() => setSelectedArea('costas')}
                />
                <Chip
                  label="🦵 Membros Inferiores (Pernas)"
                  selected={selectedArea === 'pernas'}
                  onPress={() => setSelectedArea('pernas')}
                />
                <Chip
                  label="🛡️ Ombros & Deltóides"
                  selected={selectedArea === 'ombros'}
                  onPress={() => setSelectedArea('ombros')}
                />
                <Chip
                  label="💪 Braços (Bíceps & Tríceps)"
                  selected={selectedArea === 'bracos'}
                  onPress={() => setSelectedArea('bracos')}
                />
                <Chip
                  label="🧘 Core & Abdômen"
                  selected={selectedArea === 'core'}
                  onPress={() => setSelectedArea('core')}
                />
              </ScrollView>
            </View>

            {/* 4. LISTA DE EXERCÍCIOS COM TABELA DE REPETIÇÕES, CALORIAS E DURAÇÃO */}
            <View style={{ gap: 10 }}>
              {displayedExercises.map((e, index) => {
                const hourFormatted = `${17 + (index % 5)}:${(15 + (index * 7) % 45).toString().padStart(2, '0')}`;
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => setSelectedVideo(e)}
                    style={({ pressed }) => ({
                      backgroundColor: '#0B0F19',
                      borderRadius: 18,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: '#1E293B',
                      gap: 10,
                      opacity: pressed ? 0.88 : 1,
                    })}
                  >
                    {/* Linha superior: Data & Hora e Status */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }}>
                        Hoje • {hourFormatted}
                      </Text>
                      <View
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: 'rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700' }}>
                          ✓ BOA FORMA • BIOMECÂNICA OK
                        </Text>
                      </View>
                    </View>

                    {/* Linha central: Foto + Nome + Métricas (Reps, Calorias, Duração) */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      {/* Foto Demonstrativa de Postura / Execução */}
                      <View
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 14,
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: '#1E293B',
                          borderWidth: 1,
                          borderColor: '#334155',
                        }}
                      >
                        <Image
                          source={{ uri: e.photoUrl || e.thumbnailUrl }}
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
                            backgroundColor: '#E11D48',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>▶</Text>
                        </View>
                      </View>

                      {/* Nome do Exercício & Equipamento */}
                      <View style={{ flex: 1.2, gap: 2 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }} numberOfLines={1}>
                          {e.name}
                        </Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                          {muscleLabel[e.primaryMuscle] ?? e.primaryMuscle}
                        </Text>
                        <Text style={{ color: t.accent, fontSize: 11, fontWeight: '600' }}>
                          {equipmentLabel[e.equipment] ?? e.equipment}
                        </Text>
                      </View>

                      {/* Métricas destacadas conforme o print do usuário */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {/* Repetições */}
                        <View style={{ alignItems: 'center', minWidth: 46 }}>
                          <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800' }}>
                            {e.defaultReps || '4x15'}
                          </Text>
                          <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '700' }}>REPS</Text>
                        </View>

                        {/* Calorias */}
                        <View style={{ alignItems: 'center', minWidth: 46 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Text style={{ fontSize: 11 }}>🔥</Text>
                            <Text style={{ color: '#F97316', fontSize: 13, fontWeight: '800' }}>
                              {e.estimatedCalories || 90}
                            </Text>
                          </View>
                          <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '700' }}>KCAL</Text>
                        </View>

                        {/* Duração */}
                        <View style={{ alignItems: 'center', minWidth: 46 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Text style={{ fontSize: 11 }}>⏱️</Text>
                            <Text style={{ color: '#A855F7', fontSize: 12, fontWeight: '800' }}>
                              {e.estimatedDurationMin || '05:30'}
                            </Text>
                          </View>
                          <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '700' }}>TEMPO</Text>
                        </View>
                      </View>

                      {/* Seta indicativa */}
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: '#1E293B',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#94A3B8', fontSize: 14 }}>›</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* 5. RESUMO SEMANAL (WEEKLY SUMMARY) IDÊNTICO AO PRINT */}
            <View
              style={{
                backgroundColor: '#0F172A',
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: '#1E293B',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 6,
              }}
            >
              <View>
                <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '700' }}>📊 RESUMO DO BLOCO ATUAL</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>Ciclo Hipertrofia & Força</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#38BDF8', fontSize: 15, fontWeight: '800' }}>{displayedExercises.length}</Text>
                  <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '700' }}>EXERCÍCIOS</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#10B981', fontSize: 15, fontWeight: '800' }}>{displayedExercises.length * 15 * 4}</Text>
                  <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '700' }}>REPS</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#F97316', fontSize: 15, fontWeight: '800' }}>
                    {displayedExercises.reduce((acc, curr) => acc + (curr.estimatedCalories || 90), 0)}
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '700' }}>KCAL</Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#A855F7', fontSize: 15, fontWeight: '800' }}>00:52:30</Text>
                  <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '700' }}>DURAÇÃO</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ABA 4: HISTÓRICO & TELEMETRIA PRO (IDÊNTICO À REFERÊNCIA DO USUÁRIO) */}
        {tab === 'historico' && (
          <WorkoutHistoryView />
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
