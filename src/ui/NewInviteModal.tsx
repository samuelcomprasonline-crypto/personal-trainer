import { useEffect, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { workoutProgramsCatalog } from '../domain/workoutLibrary';
import type { StudentSnapshot } from '../domain/radar';
import {
  getResendApiKey,
  saveResendApiKey,
  sendAutomaticInviteEmail,
  type SendEmailResult,
} from '../lib/emailService';
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
  const [studentCpf, setStudentCpf] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('250');
  const [planType, setPlanType] = useState<'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'>('Mensal');
  const [dueDay, setDueDay] = useState('10');
  const [selectedProgram, setSelectedProgram] = useState<string>(workoutProgramsCatalog[0]?.name || 'Projeto 60 Dias Balestrin');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de Envio Automático
  const [autoEmailResult, setAutoEmailResult] = useState<SendEmailResult | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showConfigApiKey, setShowConfigApiKey] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');

  useEffect(() => {
    async function checkKey() {
      const key = await getResendApiKey();
      setHasApiKey(Boolean(key));
    }
    if (visible) {
      checkKey();
    }
  }, [visible]);

  const getInviteMessage = (code: string) => {
    const nome = studentName.trim() || 'Aluno';
    return `Olá ${nome}! Seu acesso à consultoria Personal Trainer foi liberado!\n\nPlano: ${planType} (R$ ${monthlyPrice}/mês)\nTreino Liberado: ${selectedProgram}\n\nSeu código de ativação individual é: *${code}*\n\nAcesse o app e insira o código para começar agora!`;
  };

  const handleSendAutomatic = async (code: string) => {
    setAutoEmailResult(null);
    const res = await sendAutomaticInviteEmail({
      studentName,
      studentEmail,
      code,
      planType,
      monthlyPrice,
      dueDay,
      workoutProgram: selectedProgram,
    });
    setAutoEmailResult(res);
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim() || apiKeyInput.trim().length < 8) {
      Alert.alert('Chave Inválida', 'Por favor insira uma chave de API válida da Resend (começa com re_...).');
      return;
    }
    await saveResendApiKey(apiKeyInput.trim());
    setHasApiKey(true);
    setShowConfigApiKey(false);
    if (generatedCode) {
      // Dispara o e-mail no mesmo instante
      handleSendAutomatic(generatedCode);
    }
  };

  const handleSendManualEmail = async (code: string) => {
    const subject = encodeURIComponent('🏋️ Seu Acesso ao Personal Trainer — Código de Ativação');
    const body = encodeURIComponent(getInviteMessage(code));
    const mailtoUrl = `mailto:${studentEmail.trim()}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(mailtoUrl);
    } catch {
      // Ignora erro
    }
  };

  const handleSendWhatsApp = async (code: string) => {
    const text = encodeURIComponent(getInviteMessage(code));
    const waUrl = `https://wa.me/?text=${text}`;
    try {
      await Linking.openURL(waUrl);
    } catch {
      // Ignora erro
    }
  };

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
          cpf: studentCpf.trim() || undefined,
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

      // DISPARO 100% AUTOMÁTICO VIA SERVIDOR / API RESEND
      handleSendAutomatic(res.code);
    }
  };

  const handleReset = () => {
    setStudentName('');
    setStudentCpf('');
    setStudentEmail('');
    setMonthlyPrice('250');
    setPlanType('Mensal');
    setDueDay('10');
    setGeneratedCode(null);
    setError(null);
    setAutoEmailResult(null);
    setShowConfigApiKey(false);
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
            Defina o plano, o treino inicial e o sistema enviará o convite automaticamente para o e-mail do aluno.
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

            {/* STATUS DO ENVIO AUTOMÁTICO */}
            {autoEmailResult?.success ? (
              <View
                style={{
                  backgroundColor: t.accentSubtle,
                  padding: 12,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: t.accent,
                  marginBottom: 10,
                  gap: 4,
                }}
              >
                <Body style={{ color: t.accent, fontWeight: '800', fontSize: 14 } as any}>
                  ⚡ E-mail enviado 100% de forma automática!
                </Body>
                <Body muted style={{ fontSize: 12, color: '#FFFFFF' } as any}>
                  O aluno recebeu o convite com o código na caixa de entrada ({studentEmail}).
                </Body>
              </View>
            ) : autoEmailResult?.needsConfig ? (
              <View
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.12)',
                  padding: 14,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: '#EAB308',
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#EAB308', fontWeight: '800', fontSize: 13 }}>
                    ⚙️ Envio Automático por E-mail (Servidor)
                  </Text>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#EAB30825' }}>
                    <Text style={{ color: '#EAB308', fontSize: 10, fontWeight: 'bold' }}>GRATUITO</Text>
                  </View>
                </View>

                <Body muted style={{ fontSize: 12 } as any}>
                  Para os e-mails saírem sozinhos direto do servidor sem abrir o seu app de e-mail, ative a chave gratuita da API Resend (leva 1 minuto).
                </Body>

                <Button
                  title={showConfigApiKey ? 'Ocultar Configuração' : 'Ativar Envio Automático com Chave Resend ⚡'}
                  variant="neonOutline"
                  onPress={() => setShowConfigApiKey(!showConfigApiKey)}
                />

                {showConfigApiKey && (
                  <View style={{ marginTop: 8, gap: 8, backgroundColor: t.surfaceElevated, padding: 12, borderRadius: 10 }}>
                    <TextInputField
                      label="Sua Chave da API Resend (ex: re_123456...)"
                      value={apiKeyInput}
                      onChangeText={setApiKeyInput}
                      placeholder="re_..."
                      autoCapitalize="none"
                    />
                    <Button title="Salvar Chave & Disparar E-mail Agora" onPress={handleSaveApiKey} />
                    <Body muted style={{ fontSize: 11 } as any}>
                      Não tem chave ainda? Crie uma grátis em resend.com (até 3.000 e-mails/mês sem custo).
                    </Body>
                  </View>
                )}
              </View>
            ) : autoEmailResult && !autoEmailResult.success ? (
              <View
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  padding: 10,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: '#EF4444',
                  marginBottom: 8,
                }}
              >
                <Body style={{ color: '#EF4444', fontWeight: '700', fontSize: 12 } as any}>
                  ⚠️ {autoEmailResult.message}
                </Body>
              </View>
            ) : (
              <View style={{ padding: 8, alignItems: 'center' }}>
                <Body muted style={{ fontSize: 12 } as any}>Enviando e-mail automaticamente para o aluno...</Body>
              </View>
            )}

            {/* BOTÕES DE ENVIO ADICIONAIS / WHATSAPP */}
            <View style={{ gap: 8, marginVertical: 6 }}>
              <Button
                title="💬 Enviar Também pelo WhatsApp"
                variant="neonOutline"
                onPress={() => handleSendWhatsApp(generatedCode)}
              />
              <Pressable
                onPress={() => handleSendManualEmail(generatedCode)}
                style={{ paddingVertical: 6, alignItems: 'center' }}
              >
                <Body muted style={{ fontSize: 12, textDecorationLine: 'underline' } as any}>
                  Ou abrir cliente de e-mail do aparelho (opção alternativa)
                </Body>
              </Pressable>
            </View>

            {/* Resumo do Contrato */}
            <View style={{ backgroundColor: t.surfaceElevated, padding: 12, borderRadius: radius.md, gap: 4, marginVertical: 4 }}>
              <Body style={{ fontSize: 13, fontWeight: '700' } as any}>Resumo do Cadastro:</Body>
              <Body muted style={{ fontSize: 12 } as any}>• Aluno: {studentName || studentEmail}</Body>
              <Body muted style={{ fontSize: 12 } as any}>• E-mail: {studentEmail}</Body>
              <Body muted style={{ fontSize: 12 } as any}>• Mensalidade: R$ {monthlyPrice},00 ({planType})</Body>
              <Body muted style={{ fontSize: 12 } as any}>• Vencimento: Todo dia {dueDay}</Body>
              <Body muted style={{ fontSize: 12 } as any}>• Treino Liberado: {selectedProgram}</Body>
            </View>

            <View style={{ marginTop: 8 }}>
              <Button title="Concluir e Voltar aos Alunos" variant="ghost" onPress={handleReset} />
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
                label="CPF do Aluno (opcional)"
                value={studentCpf}
                onChangeText={setStudentCpf}
                placeholder="Ex: 123.456.789-00"
                keyboardType="numeric"
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
                title={loading ? 'Cadastrando aluno...' : 'Finalizar Cadastro & Enviar Convite Automático ⚡'}
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
