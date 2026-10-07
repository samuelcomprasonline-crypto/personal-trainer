import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { otherStudents, trainer } from '../../src/data/seed';
import { workoutProgramsCatalog } from '../../src/domain/workoutLibrary';
import type { WorkoutProgram } from '../../src/domain/types';
import { Screen, Title, Label, Body, Card, Chip, Button } from '../../src/ui/components';
import { NutritionModule } from '../../src/ui/NutritionModule';
import { NewWorkoutProgramModal } from '../../src/ui/NewWorkoutProgramModal';
import { useTheme } from '../../src/ui/theme';

export default function PrescreverDietaScreen() {
  const t = useTheme();
  const [selectedStudent, setSelectedStudent] = useState('Samuel Ferreira');
  const [activeTab, setActiveTab] = useState<'treino' | 'dieta'>('treino');
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [assignedProgram, setAssignedProgram] = useState<string>('Projeto 60 Dias Balestrin — Iniciante 1');

  const studentList = [
    { name: 'Samuel Ferreira', goal: 'Hipertrofia', weight: '78.5 kg' },
    { name: 'Alex', goal: 'Definição', weight: '74.0 kg' },
    { name: 'Beatriz Lima', goal: 'Emagrecimento', weight: '62.0 kg' },
    { name: 'Carlos Mendes', goal: 'Força & Potência', weight: '85.2 kg' },
  ];

  const handleApplyProgram = (prog: WorkoutProgram) => {
    setAssignedProgram(prog.name);
    setSuccessNotice(`Treino "${prog.name}" prescrito e ativado para ${selectedStudent}!`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <Screen>
      {/* Botão de Retorno Rápido */}
      <Pressable
        onPress={() => router.navigate('/radar')}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          opacity: pressed ? 0.7 : 1,
          paddingVertical: 4,
        })}
      >
        <Text style={{ color: t.accent, fontSize: 13, fontWeight: '700' }}>← Voltar ao Radar</Text>
      </Pressable>

      {/* Cabeçalho */}
      <View style={{ gap: 4 }}>
        <Label style={{ color: t.accent }}>{trainer.name} • Prescrição 360°</Label>
        <Title size={28}>Prescrever Treino & Dieta</Title>
        <Body muted style={{ fontSize: 13 } as any}>
          Monte e envie prescrições completas de treinamento e nutrição com sincronização instantânea no app do aluno.
        </Body>
      </View>

      {/* Seletor de Aluno Ativo */}
      <Card style={{ padding: 14 }}>
        <Label style={{ color: t.accent }}>Selecione o Aluno para Prescrição:</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
          {studentList.map((st) => {
            const isSelected = selectedStudent === st.name;
            return (
              <Pressable
                key={st.name}
                onPress={() => setSelectedStudent(st.name)}
                style={{
                  backgroundColor: isSelected ? 'rgba(198, 244, 50, 0.15)' : '#0E121B',
                  borderWidth: 1,
                  borderColor: isSelected ? t.accent : 'rgba(255, 255, 255, 0.08)',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 12,
                  gap: 2,
                }}
              >
                <Text style={{ color: isSelected ? t.accent : '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                  {st.name}
                </Text>
                <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                  {st.goal} • {st.weight}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Card>

      {/* Notificação de Sucesso */}
      {successNotice && (
        <View
          style={{
            backgroundColor: 'rgba(198, 244, 50, 0.15)',
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: t.accent,
          }}
        >
          <Body style={{ color: t.accent, fontWeight: '700' } as any}>✓ {successNotice}</Body>
        </View>
      )}

      {/* Abas Principais: Treino vs Dieta */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip
          label="🏋️‍♂️ Prescrição de Treino"
          selected={activeTab === 'treino'}
          onPress={() => setActiveTab('treino')}
        />
        <Chip
          label="🥗 Prescrição Nutricional & Macros"
          selected={activeTab === 'dieta'}
          onPress={() => setActiveTab('dieta')}
        />
      </View>

      {/* ABA 1: PRESCREVER TREINO */}
      {activeTab === 'treino' && (
        <View style={{ gap: 14 }}>
          {/* Card do Programa Atual do Aluno */}
          <Card style={{ borderWidth: 1, borderColor: 'rgba(198, 244, 50, 0.3)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 4 }}>
                <Label style={{ color: t.accent }}>TREINO ATUALMENTE ATIVO NO APP DO ALUNO</Label>
                <Title size={20}>{assignedProgram}</Title>
                <Body muted style={{ fontSize: 12 } as any}>
                  Aluno: {selectedStudent} • Sincronizado na nuvem em tempo real
                </Body>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(198, 244, 50, 0.15)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: t.accent, fontSize: 11, fontWeight: '800' }}>ATIVO ✓</Text>
              </View>
            </View>
          </Card>

          {/* Botão de Criar Novo Protocolo / Importar Texto Livre */}
          <View style={{ marginVertical: 4 }}>
            <Button
              title="+ Criar Novo Protocolo / Importar Texto Livre 📋"
              onPress={() => setShowNewProgramModal(true)}
            />
          </View>

          {/* Catálogo de Programas Prontos para Prescrever com 1 Toque */}
          <View style={{ gap: 8 }}>
            <Label>Ou selecione um protocolo periodizado do banco de treinos:</Label>
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
                      title={isCurrent ? 'Treino Atual ✓' : 'Ativar no Aluno ↗'}
                      variant={isCurrent ? 'ghost' : 'primary'}
                      onPress={() => handleApplyProgram(prog)}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      )}

      {/* ABA 2: PRESCREVER DIETA & MACROS */}
      {activeTab === 'dieta' && (
        <View style={{ gap: 14 }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 2 }}>
                <Label style={{ color: t.accent }}>PACIENTE / ALUNO SELECIONADO</Label>
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

      {/* MODAL DE CRIAÇÃO DE PROTOCOLO COM IMPORTADOR DE TEXTO LIVRE */}
      <NewWorkoutProgramModal
        visible={showNewProgramModal}
        onClose={() => setShowNewProgramModal(false)}
        onSaveProgram={(newProg) => {
          workoutProgramsCatalog.unshift(newProg);
          handleApplyProgram(newProg);
          setShowNewProgramModal(false);
        }}
      />
    </Screen>
  );
}
