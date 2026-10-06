import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useAuth } from '../src/state/AuthContext';
import { Body, Button, Card, Label, Screen, TextInputField, Title } from '../src/ui/components';
import { useTheme } from '../src/ui/theme';

export default function LoginScreen() {
  const t = useTheme();
  const { signIn, enterDemoMode, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha seu e-mail e senha.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    // Redireciona baseado no role
    router.replace('/');
  };

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/')}
        style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
      >
        <Body muted>← Voltar ao início</Body>
      </Pressable>

      <View style={{ gap: 6, marginTop: 8 }}>
        <Label>Identificação</Label>
        <Title size={32}>Acesse seu estúdio.</Title>
        <Body muted>
          Entre com suas credenciais para acessar seus treinos ou gerenciar seus alunos.
        </Body>
      </View>

      <Card>
        <TextInputField
          label="Seu e-mail"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setErrorMessage(null);
          }}
          placeholder="exemplo@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInputField
          label="Sua senha"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setErrorMessage(null);
          }}
          placeholder="••••••••"
          secureTextEntry
        />

        {errorMessage ? (
          <View
            style={{
              backgroundColor: '#E11D4815',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E11D4830',
            }}
          >
            <Body style={{ color: '#E11D48', fontSize: 14 } as any}>{errorMessage}</Body>
          </View>
        ) : null}

        <View style={{ marginTop: 8 }}>
          <Button
            title={submitting || loading ? 'Acessando...' : 'Entrar na Plataforma'}
            onPress={handleLogin}
            disabled={submitting || loading}
          />
        </View>

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Pressable onPress={() => router.push('/cadastro')}>
            <Body muted style={{ fontSize: 14 } as any}>
              Ainda não tem conta?{' '}
              <Body style={{ color: t.accent, fontWeight: '600', fontSize: 14 } as any}>
                Cadastre-se aqui
              </Body>
            </Body>
          </Pressable>
        </View>
      </Card>

      <Card>
        <Label>Acesso de Demonstração</Label>
        <Body muted>
          Deseja testar as funcionalidades sem criar conta no Supabase?
        </Body>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Demo Aluno"
              variant="ghost"
              onPress={() => {
                enterDemoMode('student');
                router.replace('/hoje');
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Demo Treinador"
              variant="ghost"
              onPress={() => {
                enterDemoMode('trainer');
                router.replace('/radar');
              }}
            />
          </View>
        </View>
      </Card>
    </Screen>
  );
}
