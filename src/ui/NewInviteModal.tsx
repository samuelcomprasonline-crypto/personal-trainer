import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { workoutProgramsCatalog } from '../domain/workoutLibrary';
import type { StudentSnapshot } from '../domain/radar';
import { useAuth } from '../state/AuthContext';
import { Body, Button, Card, Chip, Label, Screen, TextInputField, Title } from './components';
import { colors, radius, spacing, useTheme } from './theme';

export function NewInviteModal({
  visible,
  onClose,
  onStudentAdded,
}: {
  visible: boolean;
  onClose: () => void;
  onStudentAdded?: (newStudent: StudentSnapshot) => void;
}) {
  const t = useTheme();
  const { createInvite } = useAuth();
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('250');
  const [planType, setPlanType] = useState<'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'>('Mensal');
  const [dueDay, setDueDay] = useState('10');
  const [selectedProgram, setSelectedProgram] = useState<string>(workoutProgramsCatalog[0]?.name || 'Projeto 60 Dias Balestrin');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!studentEmail.trim()) {
      setError('Informe o e-mail do aluno.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await createInvite(studentEmail, studentName);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.code) {
      setGeneratedCode(res.code);
      if (onStudentAdded) {
        onStudentAdded({
          studentId: `student-${Date.now()}`,
          name: studentName.trim() || 'Novo Aluno',
          consistency: 1.0,
          recentRpes: [],
          loadHistory: {},
          pendingVideoIds: [],
          monthlyPrice: parseFloat(monthlyPrice.replace(',', '.')) || 250,
          planType,
          dueDay: parseInt(dueDay, 10) || 10,
          paymentStatus: 'pago',
          assignedProgramName: selectedProgram,
        });
      }
    }
  };

  const handleReset = () => {
    setStudentName('');
    setStudentEmail('');
    setMonthlyPrice('250');
    setPlanType('Mensal');
    setDueDay('10');
    setGeneratedCode(null);
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
          <Body muted>← Fechar</Body>
        </Pressable>

        <View style={{ gap: 4 }}>
          <Label style={{ color: t.accent }}>Gestão de Alunos & Financeiro</Label>
          <Title size={28}>Cadastrar & Convidar Aluno</Title>
          <Body muted>
            Defina a mensalidade, o plano contratado, o treino inicial e gere o código de ativação individual.
          </Body>
        </View>

        {generatedCode ? (
          <Card>
            <Label style={{ color: t.accent }}>Aluno Cadastrado com Sucesso!</Label>
            <View
              style={{
                backgroundColor: `${t.accent}15`,
                padding: 20,
                borderRadius: 16,
                alignItems: 'center',
                marginVertical: 8,
                borderWidth: 1,
                borderColor: `${t.accent}40`,
              }}
            >
              <Label>Código Exclusivo de Acesso</Label>
              <Title size={36} style={{ color: t.accent, letterSpacing: 2, marginVertical: 6 }}>
                {generatedCode}
              </Title>
              <Body muted style={{ fontSize: 13, textAlign: 'center' } as any}>
                Válido por 30 dias para {studentEmail}
              </Body>
            </View>

            {/* Resumo do Contrato */}
            <View style={{ backgroundColor: t.surfaceElevated, padding: 12, borderRadius: radius.md, gap: 4, marginVertical: 4 }}>
              <Body style={{ fontSize: 13, fontWeight: '700' } as any}>Resumo do Cadastro:</Body>
              <Body muted style={{ fontSize: 12 } as any}>• Aluno: {studentName || studentEmail}</Body>
              <Body muted style={{ fontSize: 12 } as any}>• Mensalidade: R$ {monthlyPrice},00 ({planType})</Body>
              <Body muted style={{ fontSize: 12 } as any}>• Vencimento: Todo dia {dueDay}</Body>
              <Body muted style={{ fontSize: 12 } as any}>• Treino Liberado: {selectedProgram}</Body>
            </View>

            <Card>
              <Label>Mensagem Pronta para WhatsApp / E-mail</Label>
              <Body style={{ fontSize: 13, color: '#FFFFFF' } as any}>
                "Olá{studentName ? ` ${studentName}` : ''}! Já cadastrei seu plano ({planType}) e ativei seu treino '{selectedProgram}' no app da nossa consultoria. Baixe o aplicativo e insira seu código exclusivo *{generatedCode}* para acessar sua ficha e avaliação completa!"
              </Body>
            </Card>

            <View style={{ marginTop: 12 }}>
              <Button title="Concluir e Voltar aos Alunos" onPress={handleReset} />
            </View>
          </Card>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {/* 1. DADOS DE IDENTIFICAÇÃO */}
            <Card>
              <Label>1. Dados Básicos</Label>
              <TextInputField
                label="Nome Completo do Aluno *"
                value={studentName}
                onChangeText={(v) => {
                  setStudentName(v);
                  setError(null);
                }}
                placeholder="Ex: Carlos Eduardo Silveira"
                autoCapitalize="words"
              />

              <TextInputField
                label="E-mail do Aluno *"
                value={studentEmail}
                onChangeText={(v) => {
                  setStudentEmail(v);
                  setError(null);
                }}
                placeholder="aluno@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={error ?? undefined}
              />
            </Card>

            {/* 2. DADOS FINANCEIROS & COBRANÇA */}
            <Card>
              <Label style={{ color: t.accent }}>2. Contrato & Pagamento</Label>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextInputField
                    label="Valor da Mensalidade (R$) *"
                    value={monthlyPrice}
                    onChangeText={setMonthlyPrice}
                    placeholder="250"
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <TextInputField
                    label="Dia de Vencimento *"
                    value={dueDay}
                    onChangeText={setDueDay}
                    placeholder="10"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Label style={{ marginTop: 6 }}>Plano Contratado:</Label>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {(['Mensal', 'Trimestral', 'Semestral', 'Anual'] as const).map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    selected={planType === p}
                    onPress={() => setPlanType(p)}
                  />
                ))}
              </View>
            </Card>

            {/* 3. ATRIBUIÇÃO DE TREINO INICIAL */}
            <Card>
              <Label style={{ color: t.accent }}>3. Treino Inicial do Aluno</Label>
              <Body muted style={{ fontSize: 13 } as any}>
                Escolha o treino da biblioteca que será liberado imediatamente no app do aluno:
              </Body>

              <View style={{ gap: 6, marginTop: 8 }}>
                {workoutProgramsCatalog.map((prog) => {
                  const isSelected = selectedProgram === prog.name;
                  return (
                    <Pressable
                      key={prog.id}
                      onPress={() => setSelectedProgram(prog.name)}
                      style={{
                        padding: 10,
                        borderRadius: radius.md,
                        backgroundColor: isSelected ? `${t.accent}20` : t.surfaceElevated,
                        borderWidth: 1,
                        borderColor: isSelected ? t.accent : t.border,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Body style={{ fontSize: 13, fontWeight: '700', color: isSelected ? t.accent : '#FFFFFF' } as any}>
                          {prog.name}
                        </Body>
                        {isSelected && <Text style={{ color: t.accent, fontWeight: '800' }}>✓</Text>}
                      </View>
                      <Body muted style={{ fontSize: 11, marginTop: 2 } as any}>
                        {prog.goal.toUpperCase()} • {prog.frequencyDaysPerWeek}x/sem • {prog.durationWeeks} semanas
                      </Body>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <View style={{ marginVertical: 8 }}>
              <Button
                title={loading ? 'Cadastrando aluno...' : 'Finalizar Cadastro & Gerar Convite ⚡'}
                onPress={handleGenerate}
                disabled={loading}
              />
            </View>
          </ScrollView>
        )}
      </Screen>
    </Modal>
  );
}
