import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { assessmentHistory, otherStudents, samuelAssessment, template, trainer } from '../../src/data/seed';
import { snapshotFromLogs } from '../../src/domain/radar';
import { workoutProgramsCatalog, trainingMethods } from '../../src/domain/workoutLibrary';
import type { PhysicalAssessment, WorkoutProgram } from '../../src/domain/types';
import { useAppState } from '../../src/state/AppState';
import { useAuth } from '../../src/state/AuthContext';
import { AssessmentReport } from '../../src/ui/AssessmentReport';
import { NutritionModule } from '../../src/ui/NutritionModule';
import { RecoveryModule } from '../../src/ui/RecoveryModule';
import { Body, Button, Card, Chip, Label, Screen, Title } from '../../src/ui/components';
import { NewAssessmentModal } from '../../src/ui/NewAssessmentModal';
import { NewInviteModal } from '../../src/ui/NewInviteModal';
import { useTheme } from '../../src/ui/theme';

export default function Alunos() {
  const t = useTheme();
  const { logs } = useAppState();
  const { signOut, profile } = useAuth();
  const me = snapshotFromLogs('previa', 'Samuel Ferreira', logs, template.sessions.length, new Date(), {});
  const students = [me, ...otherStudents];
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentTab, setStudentTab] = useState<'laudo' | 'treino' | 'nutricao' | 'recuperacao'>('laudo');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(samuelAssessment);
  const [currentProgramName, setCurrentProgramName] = useState('Push / Pull / Legs — Volume Máximo');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAssessment = (newAss: PhysicalAssessment) => {
    setCurrentAssessment(newAss);
    if (newAss.bioimpedance) {
      assessmentHistory.push({
        data: new Date().toLocaleDateString('pt-BR'),
        pesoKg: newAss.bioimpedance.pesoKg,
        musculoEsqueleticoKg: newAss.bioimpedance.massaMuscularEsqueleticaKg,
        percGordura: newAss.bioimpedance.percGordura,
      });
    }
    showToast('Nova avaliação física salva com sucesso!');
  };

  const handleApplyProgramToStudent = (prog: WorkoutProgram) => {
    setCurrentProgramName(prog.name);
    showToast(`Programa "${prog.name}" aplicado a ${selectedStudent}!`);
  };

  return (
    <>
      <Screen>
        <Label>{profile?.name ? `${profile.name} · Consultoria` : `${trainer.name} · Consultoria`}</Label>
        <Title>Gestão de Alunos & Prontuários</Title>
        <Body muted>
          Acompanhe o engajamento, periodize treinos do banco de dados, prescreva nutrição e analise laudos clínicos.
        </Body>

        {toastMessage && (
          <View
            style={{
              backgroundColor: 'rgba(198, 244, 50, 0.15)',
              padding: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: t.accent,
              marginVertical: 4,
            }}
          >
            <Body style={{ color: t.accent, fontWeight: '700' } as any}>✓ {toastMessage}</Body>
          </View>
        )}

        <View style={{ gap: 8, marginVertical: 4 }}>
          <Button
            title="+ Convidar Novo Aluno (Gerar Código)"
            onPress={() => setShowInviteModal(true)}
          />
          <Button
            title="+ Registrar Nova Avaliação Física"
            variant="ghost"
            onPress={() => setShowNewModal(true)}
          />
        </View>

        <View style={{ gap: 12 }}>
          {students.map((s) => (
            <Card key={s.studentId} onPress={() => setSelectedStudent(s.name)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title size={20}>{s.name}</Title>
                <View
                  style={{
                    backgroundColor: `${t.accent}15`,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Body muted style={{ color: t.accent, fontSize: 13, fontWeight: '600' } as any}>
                    Abrir Prontuário 360° →
                  </Body>
                </View>
              </View>
              <Body muted>
                Consistência: {Math.round(s.consistency * 100)}% nas últimas 4 semanas · {currentProgramName}
              </Body>
            </Card>
          ))}
        </View>

        <View style={{ marginTop: 12, gap: 8 }}>
          <Button
            title="Encerrar sessão / Sair da conta"
            variant="ghost"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
        </View>
      </Screen>

      {/* MODAL DE CONVITE DE NOVO ALUNO */}
      <NewInviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* MODAL DE CADASTRO DE NOVA AVALIAÇÃO */}
      <NewAssessmentModal
        visible={showNewModal}
        studentName="Samuel Ferreira"
        onClose={() => setShowNewModal(false)}
        onSave={handleSaveAssessment}
      />

      {/* MODAL DO PRONTUÁRIO COMPLETO DO ALUNO (ESTILO APPS AMERICANOS DE PONTA) */}
      <Modal
        visible={selectedStudent !== null}
        animationType="slide"
        onRequestClose={() => setSelectedStudent(null)}
      >
        <Screen>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedStudent(null)}
              style={{ paddingVertical: 6 }}
            >
              <Body muted>← Voltar para lista de alunos</Body>
            </Pressable>

            <View
              style={{
                backgroundColor: `${t.accent}20`,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Body style={{ color: t.accent, fontSize: 11, fontWeight: '700' } as any}>
                Aluno: {selectedStudent}
              </Body>
            </View>
          </View>

          {toastMessage && (
            <View
              style={{
                backgroundColor: 'rgba(198, 244, 50, 0.15)',
                padding: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: t.accent,
                marginBottom: 8,
              }}
            >
              <Body style={{ color: t.accent, fontWeight: '700' } as any}>✓ {toastMessage}</Body>
            </View>
          )}

          {/* ABAS DO PRONTUÁRIO */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <Chip
              label="Laudo Clínico & 3D"
              selected={studentTab === 'laudo'}
              onPress={() => setStudentTab('laudo')}
            />
            <Chip
              label="Periodização & Ficha"
              selected={studentTab === 'treino'}
              onPress={() => setStudentTab('treino')}
            />
            <Chip
              label="Prescrição Nutricional"
              selected={studentTab === 'nutricao'}
              onPress={() => setStudentTab('nutricao')}
            />
            <Chip
              label="Biofeedback & Wearables"
              selected={studentTab === 'recuperacao'}
              onPress={() => setStudentTab('recuperacao')}
            />
          </View>

          {/* ABA 1: LAUDO CLÍNICO */}
          {studentTab === 'laudo' && (
            <AssessmentReport
              studentName={selectedStudent ?? 'Samuel Ferreira'}
              assessment={currentAssessment}
            />
          )}

          {/* ABA 2: APLICAR PROGRAMAS DO BANCO DE DADOS AO ALUNO */}
          {studentTab === 'treino' && (
            <View style={{ gap: 14 }}>
              <Card>
                <Label style={{ color: t.accent }}>PROGRAMA ATIVO DO ALUNO</Label>
                <Title size={22}>{currentProgramName}</Title>
                <Body muted style={{ fontSize: 13, marginTop: 4 } as any}>
                  Você pode selecionar qualquer uma das periodizações do banco de dados abaixo para aplicar a este aluno.
                </Body>
              </Card>

              <Label style={{ marginTop: 4 }}>Programas Disponíveis no Banco de Dados:</Label>
              {workoutProgramsCatalog.map((prog) => {
                const isCurrent = prog.name === currentProgramName;
                return (
                  <Card key={prog.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title size={18}>{prog.name}</Title>
                      {isCurrent ? (
                        <View style={{ backgroundColor: `${t.accent}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                          <Body style={{ color: t.accent, fontSize: 11, fontWeight: '800' } as any}>ATIVO NO APP DO ALUNO</Body>
                        </View>
                      ) : null}
                    </View>

                    <Body muted style={{ fontSize: 13, marginTop: 4 } as any}>
                      {prog.description}
                    </Body>

                    <View style={{ flexDirection: 'row', gap: 12, marginVertical: 8 }}>
                      <Body style={{ fontSize: 12, color: t.muted } as any}>
                        • {prog.frequencyDaysPerWeek}x na semana • {prog.durationWeeks} semanas • {prog.sessions.length} divisões
                      </Body>
                    </View>

                    {!isCurrent && (
                      <Button
                        title={`Aplicar este programa a ${selectedStudent}`}
                        onPress={() => handleApplyProgramToStudent(prog)}
                      />
                    )}
                  </Card>
                );
              })}
            </View>
          )}

          {/* ABA 3: PRESCRIÇÃO NUTRICIONAL & DIETAS */}
          {studentTab === 'nutricao' && (
            <NutritionModule isTrainer />
          )}

          {/* ABA 4: BIOFEEDBACK & WEARABLES */}
          {studentTab === 'recuperacao' && (
            <RecoveryModule />
          )}

          <View style={{ marginTop: 24, marginBottom: 16 }}>
            <Button title="Fechar Prontuário" variant="ghost" onPress={() => setSelectedStudent(null)} />
          </View>
        </Screen>
      </Modal>
    </>
  );
}
