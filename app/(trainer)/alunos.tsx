import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { assessmentHistory, otherStudents, samuelAssessment, template, trainer } from '../../src/data/seed';
import { getLatestAssessmentForStudent, saveOrUpdateAssessment } from '../../src/data/assessmentStore';
import { buildBillingWhatsAppMessage } from '../../src/data/financialStore';
import { snapshotFromLogs, type StudentSnapshot } from '../../src/domain/radar';
import { workoutProgramsCatalog, trainingMethods } from '../../src/domain/workoutLibrary';
import type { PhysicalAssessment, WorkoutProgram } from '../../src/domain/types';
import { pullStudentsFromCloud, syncStudentToCloud } from '../../src/lib/syncService';
import { useAppState } from '../../src/state/AppState';
import { useAuth } from '../../src/state/AuthContext';
import { AssessmentReport } from '../../src/ui/AssessmentReport';
import { NutritionModule } from '../../src/ui/NutritionModule';
import { RecoveryModule } from '../../src/ui/RecoveryModule';
import { Body, Button, Card, Chip, Label, Screen, Title } from '../../src/ui/components';
import { NewAssessmentModal } from '../../src/ui/NewAssessmentModal';
import { NewInviteModal } from '../../src/ui/NewInviteModal';
import { useTheme } from '../../src/ui/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_CUSTOM_STUDENTS = '@personal_trainer_custom_students';
const STORAGE_HIDE_DEMO = '@personal_trainer_hide_demo';

export default function Alunos() {
  const t = useTheme();
  const { logs } = useAppState();
  const { signOut, profile } = useAuth();
  const me = snapshotFromLogs('previa', 'Samuel Ferreira', logs, template.sessions.length, new Date(), {});
  me.cpf = '382.491.820-14';
  me.monthlyPrice = 300;
  me.planType = 'Trimestral';
  me.dueDay = 10;
  me.paymentStatus = 'pago';
  me.assignedProgramName = 'Projeto 60 Dias Balestrin — Iniciante 1';

  const [searchQuery, setSearchQuery] = useState('');
  const [hideDemo, setHideDemo] = useState(false);
  const [customStudents, setCustomStudents] = useState<StudentSnapshot[]>([]);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);
  const [studentTab, setStudentTab] = useState<'laudo' | 'treino' | 'nutricao' | 'recuperacao' | 'financeiro'>('laudo');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carrega alunos personalizados e preferência de modo limpo
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedCustom = await AsyncStorage.getItem(STORAGE_CUSTOM_STUDENTS);
        if (storedCustom) {
          setCustomStudents(JSON.parse(storedCustom));
        }
        const storedHide = await AsyncStorage.getItem(STORAGE_HIDE_DEMO);
        if (storedHide !== null) {
          setHideDemo(storedHide === 'true');
        }
      } catch {}
    }
    loadStoredData();
  }, []);

  // Sincroniza e busca alunos cadastrados no Supabase
  useEffect(() => {
    pullStudentsFromCloud().then((cloudStudents) => {
      if (cloudStudents.length > 0) {
        setCustomStudents((prev) => {
          const existingIds = new Set(prev.map((s) => s.studentId));
          const newFromCloud: StudentSnapshot[] = cloudStudents
            .filter((cs) => !existingIds.has(cs.studentId))
            .map((cs) => ({
              studentId: cs.studentId,
              name: cs.name,
              consistency: 1.0,
              recentRpes: [],
              loadHistory: {},
              pendingVideoIds: [],
              monthlyPrice: cs.monthlyPrice,
              planType: 'Mensal',
              dueDay: cs.dueDay,
              paymentStatus: cs.paymentStatus,
              assignedProgramName: 'Projeto 60 Dias Balestrin — Iniciante 1',
            }));
          const merged = [...newFromCloud, ...prev];
          AsyncStorage.setItem(STORAGE_CUSTOM_STUDENTS, JSON.stringify(merged)).catch(() => {});
          return merged;
        });
      }
    }).catch(() => {});
  }, []);

  const demoList: StudentSnapshot[] = [me, ...otherStudents];
  const studentsList: StudentSnapshot[] = hideDemo
    ? customStudents
    : [...customStudents, ...demoList.filter((d) => !customStudents.some((c) => c.name === d.name))];

  const displayStudents = studentsList.filter((s) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    const rawTerm = term.replace(/\D/g, '');
    const rawCpf = (s.cpf || '').replace(/\D/g, '');
    const matchName = s.name.toLowerCase().includes(term);
    const matchCpf = rawTerm.length > 0 ? rawCpf.includes(rawTerm) : false;
    return matchName || matchCpf;
  });

  const activeStudent = studentsList.find((s) => s.name === selectedStudentName) || studentsList[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAssessment = (newAss: PhysicalAssessment) => {
    saveOrUpdateAssessment(newAss);
    if (newAss.bioimpedance) {
      assessmentHistory.push({
        data: new Date().toLocaleDateString('pt-BR'),
        pesoKg: newAss.bioimpedance.pesoKg,
        musculoEsqueleticoKg: newAss.bioimpedance.massaMuscularEsqueleticaKg,
        percGordura: newAss.bioimpedance.percGordura,
      });
    }
    showToast(`Avaliação de ${newAss.studentId || selectedStudentName || 'aluno'} salva com sucesso!`);
  };

  const handleApplyProgramToStudent = (prog: WorkoutProgram) => {
    if (!selectedStudentName) return;
    setCustomStudents((prev) => {
      const updated = prev.map((s) => (s.name === selectedStudentName ? { ...s, assignedProgramName: prog.name } : s));
      AsyncStorage.setItem(STORAGE_CUSTOM_STUDENTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    showToast(`Programa "${prog.name}" aplicado e ativado no app de ${selectedStudentName}!`);
  };

  const handleTogglePaymentStatus = (studentName: string) => {
    setCustomStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.name === studentName) {
          const nextStatus: 'pago' | 'pendente' = s.paymentStatus === 'pago' ? 'pendente' : 'pago';
          return { ...s, paymentStatus: nextStatus };
        }
        return s;
      });
      AsyncStorage.setItem(STORAGE_CUSTOM_STUDENTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    showToast(`Status financeiro atualizado!`);
  };

  return (
    <>
      <Screen>
        <Label>{profile?.name ? `${profile.name} · Consultoria` : `${trainer.name} · Consultoria`}</Label>
        <Title size={20}>Gestão de Alunos & Prontuários</Title>
        <Body muted style={{ fontSize: 12.5 } as any}>
          Acompanhe mensalidades, envie periodizações do banco de treinos e prescreva protocolos nutricionais.
        </Body>

        {toastMessage && (
          <View
            style={{
              backgroundColor: t.accentSubtle,
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: t.accent,
              marginVertical: 4,
            }}
          >
            <Body style={{ color: t.accent, fontWeight: '700', fontSize: 12.5 } as any}>✓ {toastMessage}</Body>
          </View>
        )}

        <View style={{ gap: 8, marginVertical: 4 }}>
          <Button
            title="+ Cadastrar & Convidar Novo Aluno ⚡"
            onPress={() => setShowInviteModal(true)}
          />
          <Button
            title="+ Registrar Nova Avaliação Física"
            variant="ghost"
            onPress={() => setShowNewModal(true)}
          />
        </View>

        {/* BARRA DE PESQUISA DE ALUNOS POR NOME E CPF */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.surface,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderWidth: 1,
            borderColor: searchQuery ? t.accent : t.border,
            gap: 8,
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 14 }}>🔍</Text>
          <TextInput
            placeholder="Buscar aluno por nome completo ou CPF..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              color: '#FFFFFF',
              fontSize: 12.5,
              paddingVertical: 2,
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
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

        {/* BARRA DE CONTROLE DO MODO LIMPO / PRODUÇÃO */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: hideDemo ? t.accent : '#F59E0B' }} />
            <Body style={{ fontSize: 11.5, fontWeight: '700', color: hideDemo ? t.accent : '#F59E0B' } as any}>
              {hideDemo ? 'Modo Produção (Sistema Limpo)' : 'Exibindo Alunos de Teste (Demo)'}
            </Body>
          </View>

          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable
              onPress={async () => {
                const next = !hideDemo;
                setHideDemo(next);
                await AsyncStorage.setItem(STORAGE_HIDE_DEMO, String(next));
                showToast(next ? 'Alunos demo ocultados. Sistema limpo!' : 'Alunos demo restaurados para testes.');
              }}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: t.surfaceElevated,
                borderWidth: 1,
                borderColor: t.border,
              }}
            >
              <Body style={{ fontSize: 11, fontWeight: '600' } as any}>
                {hideDemo ? '👁️ Ver Alunos Demo' : '🧹 Ocultar Alunos Demo'}
              </Body>
            </Pressable>

            {customStudents.length > 0 && (
              <Pressable
                onPress={async () => {
                  setCustomStudents([]);
                  await AsyncStorage.removeItem(STORAGE_CUSTOM_STUDENTS);
                  showToast('Lista de alunos personalizados zerada!');
                }}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
              >
                <Body style={{ fontSize: 11, fontWeight: '600', color: '#EF4444' } as any}>
                  Zerar Alunos
                </Body>
              </Pressable>
            )}
          </View>
        </View>

        {/* LISTA DE ALUNOS OU EMPTY STATE LIMPO */}
        {displayStudents.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 24, gap: 8, borderWidth: 1, borderColor: t.border }}>
            <Text style={{ fontSize: 22 }}>🔍</Text>
            <Title size={16} style={{ textAlign: 'center' }}>
              {searchQuery ? `Nenhum aluno encontrado para "${searchQuery}"` : 'Sistema Limpo e Pronto para Cadastros'}
            </Title>
            <Body muted style={{ textAlign: 'center', maxWidth: 380, fontSize: 12 }}>
              {searchQuery
                ? 'Verifique se o nome ou CPF digitado está correto.'
                : 'Nenhum aluno cadastrado ainda. Comece cadastrando os primeiros alunos reais da consultoria.'}
            </Body>
            {searchQuery ? (
              <Button
                title="Limpar Busca"
                variant="ghost"
                onPress={() => setSearchQuery('')}
              />
            ) : (
              <View style={{ gap: 8, width: '100%', maxWidth: 300, marginTop: 4 }}>
                <Button
                  title="+ Cadastrar Primeiro Aluno Real ⚡"
                  onPress={() => setShowInviteModal(true)}
                />
              </View>
            )}
          </Card>
        ) : (
          <View style={{ gap: 8 }}>
            {displayStudents.map((s) => {
              const isPaid = s.paymentStatus === 'pago';
              return (
                <Card key={s.studentId} onPress={() => setSelectedStudentName(s.name)} style={{ padding: 12, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Title size={16}>{s.name}</Title>
                      <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>
                        🪪 CPF: <Text style={{ color: t.accent, fontWeight: '600' }}>{s.cpf || '382.491.820-14'}</Text>
                      </Text>
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
                      <Body muted style={{ color: t.accent, fontSize: 11, fontWeight: '600' } as any}>
                        Abrir Prontuário →
                      </Body>
                    </View>
                  </View>

                  {/* Resumo Financeiro & Treino */}
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 4,
                      paddingTop: 6,
                      borderTopWidth: 1,
                      borderColor: t.border,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: isPaid ? t.accentSubtle : 'rgba(234, 179, 8, 0.15)',
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: isPaid ? t.accentGlow : 'rgba(234, 179, 8, 0.3)',
                      }}
                    >
                      <Body
                        style={{
                          color: isPaid ? t.accent : '#EAB308',
                          fontSize: 10,
                          fontWeight: '700',
                        } as any}
                      >
                        {isPaid ? 'MENSALIDADE PAGA ✓' : 'PAGAMENTO PENDENTE ⚠️'}
                      </Body>
                    </View>

                    <Body style={{ fontSize: 11.5, fontWeight: '600' } as any}>
                      R$ {s.monthlyPrice || 250},00 ({s.planType || 'Mensal'})
                    </Body>

                    <Body muted style={{ fontSize: 11 } as any}>
                      • Vencimento: todo dia {s.dueDay || 10}
                    </Body>

                    {!isPaid && (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          const msg = buildBillingWhatsAppMessage({
                            studentName: s.name,
                            productName: `${s.planType || 'Mensalidade'} (${s.assignedProgramName || 'Consultoria'})`,
                            amount: s.monthlyPrice || 250,
                            dueDate: `dia ${s.dueDay || 10}`,
                          });
                          Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
                        }}
                        style={({ pressed }) => ({
                          backgroundColor: '#25D36620',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#25D366',
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text style={{ color: '#25D366', fontSize: 11, fontWeight: '800' }}>
                          💬 Cobrar via WhatsApp
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  <View style={{ marginTop: 6 }}>
                    <Body muted style={{ fontSize: 12 } as any}>
                      🏋️ Treino Ativo: <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{s.assignedProgramName || 'Projeto 60 Dias Balestrin'}</Text>
                    </Body>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

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

      {/* MODAL DE CADASTRO E CONVITE COM FINANCEIRO */}
      <NewInviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onStudentAdded={(newS) => {
          const updated = [newS, ...customStudents];
          setCustomStudents(updated);
          AsyncStorage.setItem(STORAGE_CUSTOM_STUDENTS, JSON.stringify(updated)).catch(() => {});
          syncStudentToCloud(newS).catch(() => {});
          showToast(`Aluno ${newS.name} cadastrado com sucesso!`);
        }}
      />

      {/* MODAL DE CADASTRO DE NOVA AVALIAÇÃO */}
      <NewAssessmentModal
        visible={showNewModal}
        studentName={selectedStudentName || 'Samuel Ferreira'}
        onClose={() => setShowNewModal(false)}
        onSave={handleSaveAssessment}
      />

      {/* MODAL DO PRONTUÁRIO COMPLETO DO ALUNO */}
      <Modal
        visible={selectedStudentName !== null}
        animationType="slide"
        onRequestClose={() => setSelectedStudentName(null)}
      >
        <Screen hideNav>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedStudentName(null)}
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
                Aluno: {selectedStudentName}
              </Body>
            </View>
          </View>

          {toastMessage && (
            <View
              style={{
                backgroundColor: t.accentSubtle,
                padding: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: t.accent,
                marginBottom: 8,
              }}
            >
              <Body style={{ color: t.accent, fontWeight: '700', fontSize: 12.5 } as any}>✓ {toastMessage}</Body>
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
              label="Financeiro & Contrato 💳"
              selected={studentTab === 'financeiro'}
              onPress={() => setStudentTab('financeiro')}
            />
            <Chip
              label="Prescrição Nutricional"
              selected={studentTab === 'nutricao'}
              onPress={() => setStudentTab('nutricao')}
            />
            <Chip
              label="Biofeedback"
              selected={studentTab === 'recuperacao'}
              onPress={() => setStudentTab('recuperacao')}
            />
          </View>

          {/* ABA 1: LAUDO CLÍNICO & COMPARTIVO CONECTADO AO ALUNO */}
          {studentTab === 'laudo' && (
            <AssessmentReport
              key={selectedStudentName}
              studentName={selectedStudentName ?? 'Samuel Ferreira'}
              studentId={activeStudent?.studentId}
              assessment={getLatestAssessmentForStudent(selectedStudentName ?? 'Samuel Ferreira')}
              onAssessmentChange={(updated) => {
                saveOrUpdateAssessment(updated);
                showToast(`Avaliação de ${selectedStudentName} sincronizada!`);
              }}
            />
          )}

          {/* ABA 2: APLICAR PROGRAMAS DO BANCO DE DADOS AO ALUNO */}
          {studentTab === 'treino' && (
            <View style={{ gap: 14 }}>
              <Card>
                <Label style={{ color: t.accent }}>PROGRAMA ATIVO DO ALUNO</Label>
                <Title size={22}>{activeStudent?.assignedProgramName || 'Projeto 60 Dias Balestrin'}</Title>
                <Body muted style={{ fontSize: 13, marginTop: 4 } as any}>
                  Este é o treino que o aluno visualiza e executa hoje no aplicativo dele. Escolha qualquer treino abaixo para alterar instantaneamente.
                </Body>
              </Card>

              <Label style={{ marginTop: 4 }}>Treinos e Protocolos no Banco de Dados:</Label>
              {workoutProgramsCatalog.map((prog) => {
                const isCurrent = prog.name === activeStudent?.assignedProgramName;
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
                        title={`Enviar / Aplicar este Treino a ${selectedStudentName} ✓`}
                        onPress={() => handleApplyProgramToStudent(prog)}
                      />
                    )}
                  </Card>
                );
              })}
            </View>
          )}

          {/* ABA FINANCEIRA & CONTRATO */}
          {studentTab === 'financeiro' && selectedStudentName && (
            <View style={{ gap: 14 }}>
              <Card>
                <Label style={{ color: t.accent }}>CONTRATO DA CONSULTORIA</Label>
                <Title size={24}>{activeStudent?.name}</Title>

                <View
                  style={{
                    backgroundColor: t.surfaceElevated,
                    padding: 16,
                    borderRadius: 14,
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Body muted>Valor Mensal da Consultoria:</Body>
                    <Title size={20} style={{ color: t.accent }}>R$ {activeStudent?.monthlyPrice || 250},00</Title>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Body muted>Modalidade do Plano:</Body>
                    <Body style={{ fontWeight: '700' } as any}>{activeStudent?.planType || 'Mensal'}</Body>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Body muted>Dia de Vencimento:</Body>
                    <Body style={{ fontWeight: '700' } as any}>Todo dia {activeStudent?.dueDay || 10}</Body>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Body muted>Situação do Pagamento:</Body>
                    <View
                      style={{
                        backgroundColor: activeStudent?.paymentStatus === 'pago' ? t.accentSubtle : 'rgba(234, 179, 8, 0.2)',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: activeStudent?.paymentStatus === 'pago' ? t.accentGlow : 'rgba(234, 179, 8, 0.3)',
                      }}
                    >
                      <Body
                        style={{
                          color: activeStudent?.paymentStatus === 'pago' ? t.accent : '#EAB308',
                          fontSize: 11,
                          fontWeight: '700',
                        } as any}
                      >
                        {activeStudent?.paymentStatus === 'pago' ? 'EM DIA (PAGO) ✓' : 'PENDENTE DE PAGAMENTO ⚠️'}
                      </Body>
                    </View>
                  </View>
                </View>

                <View style={{ marginTop: 14 }}>
                  <Button
                    title={activeStudent?.paymentStatus === 'pago' ? 'Marcar como Pendente' : 'Registrar Pagamento Recebido ✓'}
                    variant={activeStudent?.paymentStatus === 'pago' ? 'ghost' : 'primary'}
                    onPress={() => handleTogglePaymentStatus(activeStudent.name)}
                  />
                </View>
              </Card>
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
            <Button title="Fechar Prontuário" variant="ghost" onPress={() => setSelectedStudentName(null)} />
          </View>
        </Screen>
      </Modal>
    </>
  );
}
