import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { assessmentHistory, otherStudents, samuelAssessment, template, trainer } from '../../src/data/seed';
import { snapshotFromLogs } from '../../src/domain/radar';
import type { PhysicalAssessment } from '../../src/domain/types';
import { useAppState } from '../../src/state/AppState';
import { AssessmentReport } from '../../src/ui/AssessmentReport';
import { Body, Button, Card, Label, Screen, Title } from '../../src/ui/components';
import { NewAssessmentModal } from '../../src/ui/NewAssessmentModal';
import { useTheme } from '../../src/ui/theme';

export default function Alunos() {
  const t = useTheme();
  const { logs } = useAppState();
  const me = snapshotFromLogs('previa', 'Samuel Ferreira', logs, template.sessions.length, new Date(), {});
  const students = [me, ...otherStudents];
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(samuelAssessment);

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
  };

  return (
    <>
      <Screen>
        <Label>{trainer.name} · Consultoria</Label>
        <Title>Gestão de Alunos</Title>
        <Body muted>
          Acompanhe o engajamento, periodização e laudos de avaliação física dos seus alunos.
        </Body>

        <View style={{ marginVertical: 4 }}>
          <Button
            title="+ Registrar Nova Avaliação Física"
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
                    Ver Laudo Clínico →
                  </Body>
                </View>
              </View>
              <Body muted>
                Consistência: {Math.round(s.consistency * 100)}% nas últimas 4 semanas · {template.name}
              </Body>
            </Card>
          ))}
        </View>

        <View style={{ marginTop: 12 }}>
          <Button title="Voltar para a tela de Entrada" variant="ghost" onPress={() => router.replace('/')} />
        </View>
      </Screen>

      {/* MODAL DE CADASTRO DE NOVA AVALIAÇÃO */}
      <NewAssessmentModal
        visible={showNewModal}
        studentName="Samuel Ferreira"
        onClose={() => setShowNewModal(false)}
        onSave={handleSaveAssessment}
      />

      {/* MODAL DE VISUALIZAÇÃO DO LAUDO COMPLETO */}
      <Modal
        visible={selectedStudent !== null}
        animationType="slide"
        onRequestClose={() => setSelectedStudent(null)}
      >
        <Screen>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSelectedStudent(null)}
            style={{ alignSelf: 'flex-start', paddingVertical: 6 }}
          >
            <Body muted>← Voltar para lista de alunos</Body>
          </Pressable>

          <AssessmentReport
            studentName={selectedStudent ?? 'Samuel Ferreira'}
            assessment={currentAssessment}
          />

          <View style={{ marginTop: 16 }}>
            <Button title="Fechar laudo" variant="ghost" onPress={() => setSelectedStudent(null)} />
          </View>
        </Screen>
      </Modal>
    </>
  );
}
