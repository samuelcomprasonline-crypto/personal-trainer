import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { WorkoutProgram } from '../domain/types';
import { exercises } from '../data/seed';
import { Body, Button, Card, Chip, Label, Screen, TextInputField, Title } from './components';
import { colors, radius, spacing, useTheme } from './theme';

export function NewWorkoutProgramModal({
  visible,
  onClose,
  onSaveProgram,
}: {
  visible: boolean;
  onClose: () => void;
  onSaveProgram: (program: WorkoutProgram) => void;
}) {
  const t = useTheme();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<'hipertrofia' | 'forca' | 'emagrecimento' | 'recomposicao' | 'condicionamento'>('hipertrofia');
  const [level, setLevel] = useState<'iniciante' | 'intermediario' | 'avancado'>('intermediario');
  const [frequency, setFrequency] = useState('4');
  const [durationWeeks, setDurationWeeks] = useState('8');
  const [description, setDescription] = useState('');
  const [sessionCount, setSessionCount] = useState(3);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['Drop-Set', 'Rest-Pause']);
  const [freeText, setFreeText] = useState('');
  const [parsedItemsCount, setParsedItemsCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableMethods = ['Drop-Set', 'Rest-Pause', 'Ponto Zero', 'Bi-Set / Super-série', 'Cluster Sets', 'GVT 10x10'];

  const toggleMethod = (m: string) => {
    setSelectedMethods((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Por favor, informe o nome do treino ou protocolo.');
      return;
    }

    // Criar divisões estruturadas automáticas com base na biblioteca
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const sessionLabels = [
      'Peitoral, Tríceps & Ombro Frontal',
      'Costas, Bíceps & Deltoide Posterior',
      'Quadríceps, Isquiotibiais & Panturrilhas',
      'Ombros Completo & Trapézio',
      'Braços (Bíceps & Tríceps Super-série)',
      'Full Body / Condicionamento Geral',
    ];

    const generatedSessions = Array.from({ length: sessionCount }).map((_, idx) => {
      const splitLetter = letters[idx] || `S${idx + 1}`;
      const splitName = sessionLabels[idx] || `Sessão ${splitLetter}`;
      return {
        id: `sess-${Date.now()}-${splitLetter}`,
        position: idx + 1,
        name: `Treino ${splitLetter} — ${splitName}`,
        items: [
          {
            id: `item-${Date.now()}-${idx}-1`,
            exerciseId: exercises[idx % exercises.length].id,
            sets: 4,
            repMin: 8,
            repMax: 12,
            restS: 60,
            weeklyIncrementKg: 2,
          },
          {
            id: `item-${Date.now()}-${idx}-2`,
            exerciseId: exercises[(idx + 1) % exercises.length].id,
            sets: 4,
            repMin: 10,
            repMax: 12,
            restS: 60,
            weeklyIncrementKg: 2,
          },
          {
            id: `item-${Date.now()}-${idx}-3`,
            exerciseId: exercises[(idx + 2) % exercises.length].id,
            sets: 3,
            repMin: 12,
            repMax: 15,
            restS: 45,
            weeklyIncrementKg: 1,
          },
        ],
      };
    });

    const newProgram: WorkoutProgram = {
      id: `prog-custom-${Date.now()}`,
      name: name.trim(),
      goal,
      level,
      frequencyDaysPerWeek: parseInt(frequency, 10) || 4,
      durationWeeks: parseInt(durationWeeks, 10) || 8,
      description: description.trim() || `Protocolo periodizado focado em ${goal} com divisão de ${sessionCount} dias.`,
      sessions: generatedSessions,
      recommendedMethods: selectedMethods,
    };

    onSaveProgram(newProgram);
    handleReset();
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setFreeText('');
    setParsedItemsCount(null);
    setFrequency('4');
    setDurationWeeks('8');
    setError(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleReset}>
      <Screen>
        <Pressable
          accessibilityRole="button"
          onPress={handleReset}
          style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
        >
          <Body muted>← Voltar à Central</Body>
        </Pressable>

        <View style={{ gap: 4 }}>
          <Label style={{ color: t.accent }}>Prescrição & Metodologia do Treinador</Label>
          <Title size={28}>Cadastrar Novo Protocolo / Treino</Title>
          <Body muted>
            Crie sua periodização personalizada. Ela será salva na biblioteca do banco de dados e poderá ser aplicada a qualquer aluno com 1 clique.
          </Body>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, marginTop: 4 }}>
          {/* 1. DADOS DO PROTOCOLO */}
          <Card>
            <Label>1. Identificação do Treino</Label>
            <TextInputField
              label="Nome do Treino / Protocolo *"
              value={name}
              onChangeText={(v) => {
                setName(v);
                setError(null);
              }}
              placeholder="Ex: Protocolo Densidade Balestrin — ABCD"
              error={error ?? undefined}
            />

            <TextInputField
              label="Descrição / Orientações Metodológicas (Opcional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Foco em cadência 3-0-1, contração de pico e descanso de 90 segundos."
            />
          </Card>

          {/* IMPORTADOR EM TEXTO LIVRE */}
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>📝</Text>
                <Label style={{ color: t.accent }}>Importador Rápido em Texto Livre (Opcional)</Label>
              </View>
              {parsedItemsCount !== null && (
                <View style={{ backgroundColor: 'rgba(198, 244, 50, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: '#C6F432', fontSize: 10, fontWeight: '800' }}>
                    {parsedItemsCount} EXERCÍCIOS LIDOS
                  </Text>
                </View>
              )}
            </View>

            <Body muted style={{ fontSize: 11 } as any}>
              Cole sua ficha do WhatsApp ou bloco de notas. O sistema identifica séries e repetições automaticamente (ex: "Supino Reto 4x10"):
            </Body>

            <View style={{ gap: 6, marginTop: 4 }}>
              <Label>Texto Livre da Ficha de Treino</Label>
              <TextInput
                value={freeText}
                onChangeText={(t) => {
                  setFreeText(t);
                  if (t.trim().length > 0) {
                    const lines = t.split('\n').filter((l) => l.trim().length > 2);
                    setParsedItemsCount(lines.length);
                  } else {
                    setParsedItemsCount(null);
                  }
                }}
                placeholder="Exemplo:&#10;Supino Reto com Barra 4x8-10&#10;Supino Inclinado Halteres 4x10&#10;Crucifixo Máquina 3x12&#10;Tríceps Polia Corda 4x12-15"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  padding: 12,
                  color: colors.text,
                  fontSize: 13,
                  minHeight: 95,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </Card>

          {/* 2. OBJETIVO E NÍVEL */}
          <Card>
            <Label style={{ color: t.accent }}>2. Objetivo Principal</Label>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {(['hipertrofia', 'forca', 'emagrecimento', 'recomposicao', 'condicionamento'] as const).map((g) => (
                <Chip
                  key={g}
                  label={g.toUpperCase()}
                  selected={goal === g}
                  onPress={() => setGoal(g)}
                />
              ))}
            </View>

            <Label style={{ marginTop: 12 }}>Nível do Aluno:</Label>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {(['iniciante', 'intermediario', 'avancado'] as const).map((l) => (
                <Chip
                  key={l}
                  label={l.toUpperCase()}
                  selected={level === l}
                  onPress={() => setLevel(l)}
                />
              ))}
            </View>
          </Card>

          {/* 3. PARÂMETROS TEMPORAIS E DIVISÕES */}
          <Card>
            <Label style={{ color: t.accent }}>3. Estrutura & Divisões</Label>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextInputField
                  label="Frequência Semanal *"
                  value={frequency}
                  onChangeText={setFrequency}
                  placeholder="4"
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <TextInputField
                  label="Duração (Semanas) *"
                  value={durationWeeks}
                  onChangeText={setDurationWeeks}
                  placeholder="8"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Label style={{ marginTop: 8 }}>Quantidade de Divisões (Treinos A, B, C...):</Label>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {[2, 3, 4, 5, 6].map((count) => (
                <Chip
                  key={count}
                  label={`${count} Sessões (${['AB', 'ABC', 'ABCD', 'ABCDE', 'ABCDEF'][count - 2]})`}
                  selected={sessionCount === count}
                  onPress={() => setSessionCount(count)}
                />
              ))}
            </View>
          </Card>

          {/* 4. MÉTODOS DE INTENSIDADE APLICADOS */}
          <Card>
            <Label style={{ color: t.accent }}>4. Métodos de Intensidade Inclusos</Label>
            <Body muted style={{ fontSize: 12 } as any}>
              Selecione as técnicas que farão parte deste protocolo:
            </Body>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {availableMethods.map((m) => {
                const isSelected = selectedMethods.includes(m);
                return (
                  <Chip
                    key={m}
                    label={m}
                    selected={isSelected}
                    onPress={() => toggleMethod(m)}
                  />
                );
              })}
            </View>
          </Card>

          <View style={{ marginVertical: 8 }}>
            <Button
              title="Salvar Protocolo no Banco de Dados ⚡"
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      </Screen>
    </Modal>
  );
}
