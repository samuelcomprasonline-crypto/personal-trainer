import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import type { UserRole } from '../src/domain/types';
import { useAuth } from '../src/state/AuthContext';
import { Body, Button, Card, Chip, Label, Screen, TextInputField, Title } from '../src/ui/components';
import { useTheme } from '../src/ui/theme';

export default function CadastroScreen() {
  const t = useTheme();
  const { signUp, loading } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const result = await signUp({
      name,
      email,
      pass: password,
      role,
      inviteCode: role === 'student' ? inviteCode.trim() : undefined,
    });

    setSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    Alert.alert(
      'Cadastro realizado!',
      'Sua conta foi criada com sucesso. Verifique seu e-mail caso uma confirmação seja necessária.',
      [
        {
          text: 'Continuar',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  return (
    <Screen hideNav>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
      >
        <Body muted>← Voltar</Body>
      </Pressable>

      <View style={{ gap: 6, marginTop: 8 }}>
        <Label>Novo Cadastro</Label>
        <Title size={32}>Faça parte da plataforma.</Title>
        <Body muted>
          Escolha seu perfil para começar a utilizar nossa infraestrutura de consultoria.
        </Body>
      </View>

      <Card>
        <Label>Perfil de Acesso</Label>
        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 4 }}>
          <Chip
            label="Sou Aluno"
            selected={role === 'student'}
            onPress={() => setRole('student')}
          />
          <Chip
            label="Sou Treinador"
            selected={role === 'trainer'}
            onPress={() => setRole('trainer')}
          />
        </View>

        <TextInputField
          label="Nome Completo"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrorMessage(null);
          }}
          placeholder="Ex: Carlos Eduardo"
          autoCapitalize="words"
        />

        <TextInputField
          label="E-mail"
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
          label="Senha de Acesso"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setErrorMessage(null);
          }}
          placeholder="Mínimo de 6 caracteres"
          secureTextEntry
        />

        {role === 'student' ? (
          <View style={{ gap: 4 }}>
            <TextInputField
              label="Código de Convite do Personal (Opcional)"
              value={inviteCode}
              onChangeText={(v) => {
                setInviteCode(v.toUpperCase());
                setErrorMessage(null);
              }}
              placeholder="Ex: TREINO-8492"
              autoCapitalize="characters"
            />
            <Body muted style={{ fontSize: 13 } as any}>
              * Se o seu treinador lhe forneceu um código, insira-o aqui para carregar sua periodização e as cores da marca dele.
            </Body>
          </View>
        ) : null}

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
            title={submitting || loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            onPress={handleRegister}
            disabled={submitting || loading}
          />
        </View>

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Pressable onPress={() => router.replace('/login')}>
            <Body muted style={{ fontSize: 14 } as any}>
              Já possui uma conta?{' '}
              <Body style={{ color: t.accent, fontWeight: '600', fontSize: 14 } as any}>
                Faça login
              </Body>
            </Body>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}
