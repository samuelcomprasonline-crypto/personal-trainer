import { useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { useAuth } from '../state/AuthContext';
import { Body, Button, Card, Label, Screen, TextInputField, Title } from './components';
import { useTheme } from './theme';

export function NewInviteModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTheme();
  const { createInvite } = useAuth();
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
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
    }
  };

  const handleReset = () => {
    setStudentName('');
    setStudentEmail('');
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
          <Label>Gestão de Alunos</Label>
          <Title size={28}>Convidar Aluno</Title>
          <Body muted>
            Gere um código de ativação individual. Ao se cadastrar, o aluno é automaticamente vinculado à sua metodologia e à sua marca.
          </Body>
        </View>

        {generatedCode ? (
          <Card>
            <Label>Convite Gerado com Sucesso</Label>
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
              <Label>Código de Ativação</Label>
              <Title size={36} style={{ color: t.accent, letterSpacing: 2, marginVertical: 6 }}>
                {generatedCode}
              </Title>
              <Body muted style={{ fontSize: 13, textAlign: 'center' } as any}>
                Válido por 30 dias para {studentEmail}
              </Body>
            </View>

            <Card>
              <Label>Mensagem Pronta para Envio</Label>
              <Body style={{ fontSize: 14 } as any}>
                "Olá{studentName ? ` ${studentName}` : ''}! Já configurei sua periodização no aplicativo da nossa consultoria. Baixe o app e informe seu código exclusivo {generatedCode} no cadastro para conectar seu perfil diretamente ao meu estúdio."
              </Body>
            </Card>

            <View style={{ marginTop: 12 }}>
              <Button title="Concluir e Voltar" onPress={handleReset} />
            </View>
          </Card>
        ) : (
          <Card>
            <TextInputField
              label="Nome do Aluno (Opcional)"
              value={studentName}
              onChangeText={(v) => {
                setStudentName(v);
                setError(null);
              }}
              placeholder="Ex: Beatriz Lima"
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

            <View style={{ marginTop: 8 }}>
              <Button
                title={loading ? 'Gerando convite...' : 'Gerar Código de Convite'}
                onPress={handleGenerate}
                disabled={loading}
              />
            </View>
          </Card>
        )}
      </Screen>
    </Modal>
  );
}
