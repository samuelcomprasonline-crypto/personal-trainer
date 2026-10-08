import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exercises, otherStudents, trainer } from '../../src/data/seed';
import { workoutProgramsCatalog } from '../../src/domain/workoutLibrary';
import type { Exercise, WorkoutProgram } from '../../src/domain/types';
import { Screen, Title, Label, Body, Card, Chip, Button } from '../../src/ui/components';
import { NutritionModule } from '../../src/ui/NutritionModule';
import { NewWorkoutProgramModal } from '../../src/ui/NewWorkoutProgramModal';
import { useTheme } from '../../src/ui/theme';

type CustomExerciseItem = {
  id: string;
  exerciseId: string;
  name: string;
  muscle: string;
  equipment: string;
  sets: number;
  reps: string;
  rest: string;
  method: string;
};

type SplitWorkout = {
  letter: string;
  name: string;
  items: CustomExerciseItem[];
};

export type StudentItem = {
  name: string;
  cpf: string;
  goal: string;
  weight: string;
  tag: string;
};

const INITIAL_STUDENTS: StudentItem[] = [
  { name: 'Samuel Ferreira', cpf: '382.491.820-14', goal: 'Hipertrofia & Força', weight: '78.5 kg', tag: 'VIP' },
  { name: 'Alex', cpf: '219.840.512-88', goal: 'Definição & Densidade', weight: '74.0 kg', tag: 'Atleta' },
  { name: 'Beatriz Lima', cpf: '492.103.847-55', goal: 'Emagrecimento & Tônus', weight: '62.0 kg', tag: 'Iniciante' },
  { name: 'Carlos Mendes', cpf: '105.738.920-33', goal: 'Força Máxima', weight: '85.2 kg', tag: 'Intermediário' },
  { name: 'Marina Costa', cpf: '518.294.731-09', goal: 'Hipertrofia Glúteos', weight: '58.4 kg', tag: 'VIP' },
  { name: 'Rafael Lima', cpf: '742.610.385-40', goal: 'Ganho de Massa', weight: '81.0 kg', tag: 'Intermediário' },
  { name: 'Julia Prado', cpf: '631.905.827-21', goal: 'Definição & Tônus', weight: '54.2 kg', tag: 'Iniciante' },
];

const STORAGE_CUSTOM_STUDENTS = '@personal_trainer_custom_students';

export default function PrescreverDietaScreen() {
  const t = useTheme();
  const [selectedStudent, setSelectedStudent] = useState('Samuel Ferreira');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'treino' | 'dieta'>('treino');
  const [workoutMode, setWorkoutMode] = useState<'individual' | 'protocolos'>('individual');
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [assignedProgram, setAssignedProgram] = useState<string>('Treino Personalizado Exclusivo');

  // Lista de alunos carregada dinamicamente
  const [studentList, setStudentList] = useState<StudentItem[]>(INITIAL_STUDENTS);

  // Carrega alunos personalizados cadastrados pelo personal
  useEffect(() => {
    async function loadStudents() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_CUSTOM_STUDENTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStudentList((prev) => {
              const existing = new Set(prev.map((s) => s.name));
              const additions: StudentItem[] = parsed
                .filter((p: any) => !existing.has(p.name))
                .map((p: any, idx: number) => ({
                  name: p.name,
                  cpf: p.cpf || `000.${String(idx + 100).padStart(3, '0')}.999-00`,
                  goal: p.goal || 'Hipertrofia',
                  weight: p.weight || '75.0 kg',
                  tag: 'Novo Aluno',
                }));
              return [...prev, ...additions];
            });
          }
        }
      } catch {}
    }
    loadStudents();
  }, []);

  // ESTADO DO TREINO PERSONALIZADO POR EXERCÍCIOS INDIVIDUAIS
  const [activeSplitIndex, setActiveSplitIndex] = useState(0);
  const [splits, setSplits] = useState<SplitWorkout[]>([
    {
      letter: 'A',
      name: 'Peitoral, Tríceps & Deltoide Frontal',
      items: [
        {
          id: 'item-1',
          exerciseId: 'supino-reto',
          name: 'Supino Reto com Barra',
          muscle: 'Peitoral',
          equipment: 'Barra Olímpica',
          sets: 4,
          reps: '8-10',
          rest: '90s',
          method: 'Normal',
        },
        {
          id: 'item-2',
          exerciseId: 'supino-inclinado',
          name: 'Supino Inclinado com Halteres',
          muscle: 'Peitoral Superior',
          equipment: 'Halteres',
          sets: 4,
          reps: '10-12',
          rest: '60s',
          method: 'Drop-Set',
        },
        {
          id: 'item-3',
          exerciseId: 'crucifixo-polia',
          name: 'Crucifixo na Polia Média',
          muscle: 'Peitoral',
          equipment: 'Cross Over',
          sets: 3,
          reps: '12-15',
          rest: '45s',
          method: 'Ponto Zero',
        },
        {
          id: 'item-4',
          exerciseId: 'triceps-corda',
          name: 'Tríceps Pulley na Corda',
          muscle: 'Tríceps',
          equipment: 'Polia Alta',
          sets: 4,
          reps: '10-12',
          rest: '45s',
          method: 'Rest-Pause',
        },
      ],
    },
    {
      letter: 'B',
      name: 'Dorsal, Bíceps & Deltoide Posterior',
      items: [
        {
          id: 'item-b1',
          exerciseId: 'puxada-frente',
          name: 'Puxada Aberta na Polia Alta',
          muscle: 'Dorsal',
          equipment: 'Polia Alta',
          sets: 4,
          reps: '8-10',
          rest: '60s',
          method: 'Normal',
        },
        {
          id: 'item-b2',
          exerciseId: 'remada-curvada',
          name: 'Remada Curvada com Barra',
          muscle: 'Costas Geral',
          equipment: 'Barra',
          sets: 4,
          reps: '8-10',
          rest: '90s',
          method: 'Normal',
        },
        {
          id: 'item-b3',
          exerciseId: 'rosca-direta',
          name: 'Rosca Direta com Barra W',
          muscle: 'Bíceps',
          equipment: 'Barra W',
          sets: 3,
          reps: '10-12',
          rest: '60s',
          method: 'Drop-Set',
        },
      ],
    },
    {
      letter: 'C',
      name: 'Quadríceps, Isquiotibiais & Panturrilhas',
      items: [
        {
          id: 'item-c1',
          exerciseId: 'agachamento-livre',
          name: 'Agachamento Livre com Barra',
          muscle: 'Quadríceps & Glúteos',
          equipment: 'Gaiola de Agachamento',
          sets: 4,
          reps: '8-10',
          rest: '120s',
          method: 'Normal',
        },
        {
          id: 'item-c2',
          exerciseId: 'leg-press-45',
          name: 'Leg Press 45°',
          muscle: 'Pernas Completo',
          equipment: 'Aparelho 45°',
          sets: 4,
          reps: '10-12',
          rest: '90s',
          method: 'Rest-Pause',
        },
        {
          id: 'item-c3',
          exerciseId: 'cadeira-extensora',
          name: 'Cadeira Extensora',
          muscle: 'Quadríceps',
          equipment: 'Máquina Extensora',
          sets: 3,
          reps: '12-15',
          rest: '45s',
          method: 'Ponto Zero',
        },
      ],
    },
  ]);

  // Seletor de exercícios da biblioteca
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('todos');

  const filteredLibraryExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle =
      selectedMuscleFilter === 'todos' ||
      ex.primaryMuscle.toLowerCase() === selectedMuscleFilter.toLowerCase() ||
      ex.targetArea === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const currentSplit = splits[activeSplitIndex] || splits[0];

  const handleAddExerciseToSplit = (ex: Exercise) => {
    const newItem: CustomExerciseItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: ex.id,
      name: ex.name,
      muscle: ex.primaryMuscle,
      equipment: ex.equipment,
      sets: 4,
      reps: '8-12',
      rest: '60s',
      method: 'Normal',
    };

    setSplits((prev) =>
      prev.map((s, idx) =>
        idx === activeSplitIndex ? { ...s, items: [...s.items, newItem] } : s
      )
    );
    setShowExercisePicker(false);
    setExerciseSearch('');
    setSuccessNotice(`"${ex.name}" adicionado ao Treino ${currentSplit.letter}!`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleRemoveExercise = (itemId: string) => {
    setSplits((prev) =>
      prev.map((s, idx) =>
        idx === activeSplitIndex
          ? { ...s, items: s.items.filter((item) => item.id !== itemId) }
          : s
      )
    );
  };

  const handleUpdateItemSets = (itemId: string, delta: number) => {
    setSplits((prev) =>
      prev.map((s, idx) =>
        idx === activeSplitIndex
          ? {
              ...s,
              items: s.items.map((item) =>
                item.id === itemId
                  ? { ...item, sets: Math.max(1, Math.min(10, item.sets + delta)) }
                  : item
              ),
            }
          : s
      )
    );
  };

  const handleUpdateItemReps = (itemId: string, newReps: string) => {
    setSplits((prev) =>
      prev.map((s, idx) =>
        idx === activeSplitIndex
          ? {
              ...s,
              items: s.items.map((item) =>
                item.id === itemId ? { ...item, reps: newReps } : item
              ),
            }
          : s
      )
    );
  };

  const handleUpdateItemMethod = (itemId: string, nextMethod: string) => {
    setSplits((prev) =>
      prev.map((s, idx) =>
        idx === activeSplitIndex
          ? {
              ...s,
              items: s.items.map((item) =>
                item.id === itemId ? { ...item, method: nextMethod } : item
              ),
            }
          : s
      )
    );
  };

  const handleSaveCustomWorkout = () => {
    const totalExercises = splits.reduce((acc, s) => acc + s.items.length, 0);
    setAssignedProgram(`Periodização Individual (${splits.length} Divisões • ${totalExercises} Exercícios)`);
    setSuccessNotice(
      `Ficha individual de ${selectedStudent} (${splits.length} Divisões, ${totalExercises} Exercícios) sincronizada e ativada no app com sucesso!`
    );
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleApplyPresetProgram = (prog: WorkoutProgram) => {
    setAssignedProgram(prog.name);
    setSuccessNotice(`Treino "${prog.name}" prescrito e ativado para ${selectedStudent}!`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const methodOptions = ['Normal', 'Drop-Set', 'Rest-Pause', 'Ponto Zero', 'Bi-Set', 'GVT'];

  const filteredStudents = studentList.filter((st) => {
    if (!studentSearchQuery.trim()) return true;
    const term = studentSearchQuery.toLowerCase().trim();
    const rawTerm = term.replace(/\D/g, '');
    const rawCpf = st.cpf.replace(/\D/g, '');
    const matchName = st.name.toLowerCase().includes(term);
    const matchCpf = rawTerm.length > 0 ? rawCpf.includes(rawTerm) : false;
    return matchName || matchCpf;
  });

  const activeStudentData = studentList.find((s) => s.name === selectedStudent) || studentList[0];

  return (
    <Screen>
      {/* 1. CABEÇALHO DA PRESCRIÇÃO */}
      <View style={{ gap: 2 }}>
        <Label style={{ color: t.accent }}>{trainer.name} • Prescrição 360°</Label>
        <Title size={20}>Central de Prescrição do Aluno</Title>
        <Body muted style={{ fontSize: 12.5 } as any}>
          Direcione protocolos individualizados ou periodizados por nome completo e CPF do aluno.
        </Body>
      </View>

      {/* 2. SELETOR DE ALUNO COM BARRA DE PESQUISA POR NOME COMPLETO E CPF */}
      <Card style={{ backgroundColor: t.surface, borderColor: t.border, borderWidth: 1, gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 16 }}>👤</Text>
            <Label style={{ color: t.accent }}>1. DESTINATÁRIO DO PROTOCOLO (SELEÇÃO DO ALUNO)</Label>
          </View>
          <View style={{ backgroundColor: t.accentSubtle, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: t.accentGlow }}>
            <Text style={{ color: t.accent, fontSize: 10, fontWeight: '700' }}>
              SELECIONADO: {selectedStudent.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* BARRA DE PESQUISA POR NOME COMPLETO OU CPF */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.bgElevated,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: studentSearchQuery ? t.accent : t.border,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 14 }}>🔍</Text>
          <TextInput
            placeholder="Buscar aluno por nome completo ou CPF (ex: 382.491 ou Samuel)..."
            placeholderTextColor="#64748B"
            value={studentSearchQuery}
            onChangeText={setStudentSearchQuery}
            style={{
              flex: 1,
              color: '#FFFFFF',
              fontSize: 12.5,
              paddingVertical: 2,
            }}
          />
          {studentSearchQuery.length > 0 && (
            <Pressable
              onPress={() => setStudentSearchQuery('')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>✕ LIMPAR</Text>
            </Pressable>
          )}
        </View>

        {/* FEEDBACK DE BUSCA */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#64748B', fontSize: 10.5 }}>
            {studentSearchQuery
              ? `Filtrando: ${filteredStudents.length} aluno(s) encontrado(s)`
              : `Total de ${studentList.length} alunos cadastrados`}
          </Text>
          {activeStudentData && (
            <Text style={{ color: t.accent, fontSize: 10.5, fontWeight: '600' }}>
              🪪 CPF Alvo: {activeStudentData.cpf}
            </Text>
          )}
        </View>

        {/* LISTA DE ALUNOS DISPONÍVEIS */}
        {filteredStudents.length === 0 ? (
          <View
            style={{
              padding: 16,
              alignItems: 'center',
              backgroundColor: t.bgElevated,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              gap: 4,
            }}
          >
            <Text style={{ color: '#94A3B8', fontSize: 12 }}>
              Nenhum aluno encontrado para "{studentSearchQuery}".
            </Text>
            <Text style={{ color: '#64748B', fontSize: 11 }}>
              Verifique a grafia do nome ou os dígitos do CPF.
            </Text>
            <Pressable
              onPress={() => setStudentSearchQuery('')}
              style={{
                marginTop: 6,
                backgroundColor: t.accentSubtle,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: t.accentGlow,
              }}
            >
              <Text style={{ color: t.accent, fontSize: 11, fontWeight: '600' }}>Ver todos os alunos</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 4 }}>
            {filteredStudents.map((st) => {
              const isSelected = selectedStudent === st.name;
              return (
                <Pressable
                  key={st.name}
                  onPress={() => setSelectedStudent(st.name)}
                  style={({ pressed }) => ({
                    backgroundColor: isSelected ? t.accentSubtle : t.bgElevated,
                    borderWidth: 1,
                    borderColor: isSelected ? t.accent : t.border,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderRadius: 8,
                    gap: 3,
                    minWidth: 160,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: isSelected ? t.accent : '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                      {st.name}
                    </Text>
                    {isSelected && (
                      <View style={{ backgroundColor: t.accent, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '800' }}>ATIVO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: isSelected ? '#E2E8F0' : '#94A3B8', fontSize: 10.5, fontWeight: '500' }}>
                    🪪 CPF: {st.cpf}
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 10 }}>
                    {st.goal} • {st.weight}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* BADGE DE CONFIRMAÇÃO DIRETA DO ALUNO SELECIONADO */}
        {activeStudentData && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: t.surfaceElevated,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
              gap: 8,
              borderLeftWidth: 3,
              borderLeftColor: t.accent,
            }}
          >
            <Text style={{ fontSize: 13 }}>🎯</Text>
            <Text style={{ color: '#E2E8F0', fontSize: 11, flex: 1 }}>
              Destinatário ativo: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{activeStudentData.name}</Text> • CPF: <Text style={{ color: t.accent, fontWeight: '600' }}>{activeStudentData.cpf}</Text> • Meta: {activeStudentData.goal}
            </Text>
          </View>
        )}
      </Card>

      {/* NOTIFICAÇÃO DE SUCESSO LUMINOSA */}
      {successNotice && (
        <View
          style={{
            backgroundColor: t.accentSubtle,
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: t.accent,
          }}
        >
          <Body style={{ color: t.accent, fontWeight: '700', fontSize: 12.5 } as any}>✓ {successNotice}</Body>
        </View>
      )}

      {/* 3. ABAS: TREINO vs DIETA */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        style={{ marginBottom: 4 }}
      >
        <Chip
          label="🏋️‍♂️ Prescrição de Treino"
          selected={activeTab === 'treino'}
          onPress={() => setActiveTab('treino')}
        />
        <Chip
          label="🥗 Prescrição Nutricional"
          selected={activeTab === 'dieta'}
          onPress={() => setActiveTab('dieta')}
        />
      </ScrollView>

      {/* ABA DE TREINO */}
      {activeTab === 'treino' && (
        <View style={{ gap: 16 }}>
          {/* SUB-SELETOR: MODO INDIVIDUAL vs PROTOCOLOS PRONTOS */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#10141E',
              padding: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              gap: 4,
            }}
          >
            <Pressable
              onPress={() => setWorkoutMode('individual')}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: workoutMode === 'individual' ? t.accent : 'transparent',
              }}
            >
              <Text
                style={{
                  color: workoutMode === 'individual' ? '#0A0E14' : '#8E9AA8',
                  fontSize: 13,
                  fontWeight: '800',
                }}
              >
                ✍️ Personalizar por Exercícios Individuais
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setWorkoutMode('protocolos')}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: workoutMode === 'protocolos' ? t.accent : 'transparent',
              }}
            >
              <Text
                style={{
                  color: workoutMode === 'protocolos' ? '#0A0E14' : '#8E9AA8',
                  fontSize: 13,
                  fontWeight: '800',
                }}
              >
                📋 Protocolos & Fichas Prontas da Consultoria
              </Text>
            </Pressable>
          </View>

          {/* MODO 1: PERSONALIZAR POR EXERCÍCIOS INDIVIDUAIS */}
          {workoutMode === 'individual' && (
            <View style={{ gap: 16 }}>
              {/* DIVISÕES DO TREINO (A, B, C...) */}
              <Card style={{ backgroundColor: '#141824', padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Label style={{ color: t.accent }}>SELECIONE A DIVISÃO DO TREINO:</Label>
                  <Text style={{ color: '#8E9AA8', fontSize: 12 }}>
                    Aluno: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{selectedStudent}</Text>
                  </Text>
                </View>

                {/* Pílulas de divisão A, B, C */}
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {splits.map((split, idx) => {
                    const isSelected = activeSplitIndex === idx;
                    return (
                      <Pressable
                        key={split.letter}
                        onPress={() => setActiveSplitIndex(idx)}
                        style={{
                          backgroundColor: isSelected ? t.accent : '#0E121B',
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isSelected ? t.accent : 'rgba(255, 255, 255, 0.08)',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected ? '#0A0E14' : '#FFFFFF',
                            fontSize: 14,
                            fontWeight: '900',
                          }}
                        >
                          Treino {split.letter}
                        </Text>
                        <View
                          style={{
                            backgroundColor: isSelected ? '#0A0E14' : 'rgba(255,255,255,0.1)',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected ? t.accent : '#8E9AA8',
                              fontSize: 10,
                              fontWeight: '800',
                            }}
                          >
                            {split.items.length} ex
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Nome / Foco da Divisão */}
                <View style={{ marginTop: 14, gap: 4 }}>
                  <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '700' }}>
                    FOCO MUSCULAR DESTA SESSÃO:
                  </Text>
                  <TextInput
                    value={currentSplit.name}
                    onChangeText={(val) => {
                      setSplits((prev) =>
                        prev.map((s, idx) =>
                          idx === activeSplitIndex ? { ...s, name: val } : s
                        )
                      );
                    }}
                    style={{
                      backgroundColor: '#0E121B',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      padding: 10,
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: '700',
                    }}
                  />
                </View>
              </Card>

              {/* LISTA DE EXERCÍCIOS ADICIONADOS NA DIVISÃO ATUAL */}
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                    Exercícios do Treino {currentSplit.letter} ({currentSplit.items.length})
                  </Text>
                  <Button
                    title="+ Adicionar Exercício da Biblioteca ➕"
                    onPress={() => setShowExercisePicker(true)}
                  />
                </View>

                {currentSplit.items.length === 0 ? (
                  <Card style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
                    <Text style={{ fontSize: 24 }}>🏋️‍♂️</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
                      Nenhum exercício adicionado a esta divisão ainda
                    </Text>
                    <Text style={{ color: '#8E9AA8', fontSize: 12 }}>
                      Clique em "+ Adicionar Exercício da Biblioteca" para escolher os movimentos.
                    </Text>
                  </Card>
                ) : (
                  currentSplit.items.map((item, idx) => (
                    <Card key={item.id} style={{ backgroundColor: t.surface, borderColor: t.border, gap: 10, padding: 12 }}>
                      {/* Topo do Exercício */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              backgroundColor: t.accentSubtle,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 1,
                              borderColor: t.accentGlow,
                            }}
                          >
                            <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>
                              {idx + 1}
                            </Text>
                          </View>
                          <View>
                            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                              {item.name}
                            </Text>
                            <Text style={{ color: '#94A3B8', fontSize: 10.5 }}>
                              {item.muscle} • Equipamento: {item.equipment}
                            </Text>
                          </View>
                        </View>

                        {/* Botão de Excluir Exercício */}
                        <Pressable
                          onPress={() => handleRemoveExercise(item.id)}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 5,
                            backgroundColor: 'rgba(244, 63, 94, 0.1)',
                            borderWidth: 1,
                            borderColor: 'rgba(244, 63, 94, 0.25)',
                          }}
                        >
                          <Text style={{ color: '#F43F5E', fontSize: 10, fontWeight: '700' }}>Excluir ✕</Text>
                        </Pressable>
                      </View>

                      {/* Parâmetros: Séries, Reps, Descanso e Método */}
                      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                        {/* Séries */}
                        <View style={{ backgroundColor: '#0E121B', padding: 8, borderRadius: 8, minWidth: 100 }}>
                          <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '700' }}>SÉRIES</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <Pressable
                              onPress={() => handleUpdateItemSets(item.id, -1)}
                              style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#1A2130', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>-</Text>
                            </Pressable>
                            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                              {item.sets}
                            </Text>
                            <Pressable
                              onPress={() => handleUpdateItemSets(item.id, 1)}
                              style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#1A2130', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>+</Text>
                            </Pressable>
                          </View>
                        </View>

                        {/* Repetições */}
                        <View style={{ backgroundColor: '#0E121B', padding: 8, borderRadius: 8, minWidth: 110 }}>
                          <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '700' }}>REPETIÇÕES</Text>
                          <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                            {['6-8', '8-10', '10-12', '12-15'].map((r) => (
                              <Pressable
                                key={r}
                                onPress={() => handleUpdateItemReps(item.id, r)}
                                style={{
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRadius: 4,
                                  backgroundColor: item.reps === r ? t.accent : '#1A2130',
                                }}
                              >
                                <Text
                                  style={{
                                    color: item.reps === r ? '#0A0E14' : '#8E9AA8',
                                    fontSize: 10,
                                    fontWeight: '800',
                                  }}
                                >
                                  {r}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        </View>

                        {/* Método / Variação Avançada */}
                        <View style={{ backgroundColor: '#0E121B', padding: 8, borderRadius: 8, flex: 1, minWidth: 180 }}>
                          <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '700' }}>MÉTODO / INTENSIDADE</Text>
                          <View style={{ flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                            {methodOptions.map((m) => (
                              <Pressable
                                key={m}
                                onPress={() => handleUpdateItemMethod(item.id, m)}
                                style={{
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRadius: 4,
                                  backgroundColor: item.method === m ? t.accentSubtle : t.bgElevated,
                                  borderWidth: 1,
                                  borderColor: item.method === m ? t.accent : 'transparent',
                                }}
                              >
                                <Text
                                  style={{
                                    color: item.method === m ? t.accent : '#94A3B8',
                                    fontSize: 10,
                                    fontWeight: '700',
                                  }}
                                >
                                  {m}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        </View>
                      </View>
                    </Card>
                  ))
                )}
              </View>

              {/* BOTÃO EM DESTAQUE: SALVAR E ATIVAR FICHA NO APP DO ALUNO */}
              <View style={{ marginVertical: 8 }}>
                <Button
                  title={`⚡ Salvar e Ativar Ficha no App de ${selectedStudent}`}
                  onPress={handleSaveCustomWorkout}
                />
              </View>
            </View>
          )}

          {/* MODO 2: PROTOCOLOS PRONTOS DA CONSULTORIA */}
          {workoutMode === 'protocolos' && (
            <View style={{ gap: 12 }}>
              <Card style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ gap: 3 }}>
                    <Label style={{ color: t.accent }}>TREINO ATIVO NO APP DO ALUNO</Label>
                    <Title size={18}>{assignedProgram}</Title>
                    <Body muted style={{ fontSize: 11.5 } as any}>
                      Aluno: {selectedStudent} • Sincronizado na nuvem em tempo real
                    </Body>
                  </View>
                  <View
                    style={{
                      backgroundColor: t.accentSubtle,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: t.accentGlow,
                    }}
                  >
                    <Text style={{ color: t.accent, fontSize: 10.5, fontWeight: '700' }}>ATIVO ✓</Text>
                  </View>
                </View>
              </Card>

              {/* Catálogo de Programas Prontos */}
              <View style={{ gap: 8 }}>
                <Label>Selecione um protocolo periodizado pronto para aplicar em {selectedStudent}:</Label>
                {workoutProgramsCatalog.map((prog) => {
                  const isCurrent = assignedProgram === prog.name;
                  return (
                    <Card key={prog.id}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, gap: 4 }}>
                          <Title size={18}>{prog.name}</Title>
                          <Body muted style={{ fontSize: 12 } as any}>
                            {prog.description}
                          </Body>
                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            <View style={{ backgroundColor: '#1A2130', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '700' }}>
                                {prog.frequencyDaysPerWeek}x / SEMANA
                              </Text>
                            </View>
                            <View style={{ backgroundColor: '#1A2130', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '700' }}>
                                {prog.sessions.length} DIVISÕES ({prog.sessions.map((s) => s.name.split('—')[0].trim()).join(', ')})
                              </Text>
                            </View>
                            <View style={{ backgroundColor: '#1A2130', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '700' }}>
                                {prog.level.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <Button
                          title={isCurrent ? 'Treino Atual ✓' : `Ativar em ${selectedStudent} ↗`}
                          variant={isCurrent ? 'ghost' : 'primary'}
                          onPress={() => handleApplyPresetProgram(prog)}
                        />
                      </View>
                    </Card>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}

      {/* ABA DE NUTRIÇÃO & DIETA */}
      {activeTab === 'dieta' && (
        <View style={{ gap: 14 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 2 }}>
                <Label style={{ color: t.accent }}>ALUNO SELECIONADO PARA A DIETA</Label>
                <Title size={18}>{selectedStudent}</Title>
              </View>
              <Button
                title="Salvar Dieta no Perfil do Aluno ⚡"
                onPress={() => {
                  setSuccessNotice(`Plano nutricional salvo e liberado no app de ${selectedStudent}!`);
                  setTimeout(() => setSuccessNotice(null), 4000);
                }}
              />
            </View>
          </Card>

          {/* Módulo Nutricional Integrado */}
          <NutritionModule />
        </View>
      )}

      {/* MODAL SELETOR DE EXERCÍCIOS DA BIBLIOTECA */}
      {showExercisePicker && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            zIndex: 9999,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '90%',
              backgroundColor: t.surface,
              borderRadius: 14,
              padding: 18,
              borderWidth: 1,
              borderColor: t.border,
              gap: 12,
            }}
          >
            {/* Topo do Modal */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
                  Adicionar ao Treino {currentSplit.letter}
                </Text>
                <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                  Selecione o exercício biomecânico na biblioteca oficial
                </Text>
              </View>
              <Pressable
                onPress={() => setShowExercisePicker(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E2533', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#8E9AA8', fontSize: 16, fontWeight: '700' }}>✕</Text>
              </Pressable>
            </View>

            {/* Campo de Busca */}
            <TextInput
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
              placeholder="Buscar por nome (ex: supino, agachamento, terra)..."
              placeholderTextColor="#8E9AA8"
              style={{
                backgroundColor: '#0E121B',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
                padding: 10,
                color: '#FFFFFF',
                fontSize: 13,
              }}
            />

            {/* Filtros de Músculo em Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[
                { label: 'Todos', value: 'todos' },
                { label: 'Peito', value: 'chest' },
                { label: 'Costas', value: 'back' },
                { label: 'Pernas', value: 'legs' },
                { label: 'Ombros', value: 'shoulders' },
                { label: 'Braços', value: 'arms' },
                { label: 'Glúteos', value: 'glutes' },
                { label: 'Core / Abdômen', value: 'abs' },
              ].map((f) => (
                <Pressable
                  key={f.value}
                  onPress={() => setSelectedMuscleFilter(f.value)}
                  style={{
                    backgroundColor: selectedMuscleFilter === f.value ? t.accent : '#1E2533',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: selectedMuscleFilter === f.value ? '#0A0E14' : '#D1D5DB',
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Lista com Rolagem dos Exercícios Filtrados */}
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 8 }}>
                {filteredLibraryExercises.map((ex) => (
                  <Pressable
                    key={ex.id}
                    onPress={() => handleAddExerciseToSplit(ex)}
                    style={({ pressed }) => ({
                      backgroundColor: '#0E121B',
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                        {ex.name}
                      </Text>
                      <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                        Músculo: {ex.primaryMuscle} • Equipamento: {ex.equipment}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: t.accent,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: '#0A0E14', fontSize: 11, fontWeight: '800' }}>
                        + Adicionar
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </Screen>
  );
}
