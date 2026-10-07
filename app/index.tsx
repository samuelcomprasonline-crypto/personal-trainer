import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { trainer } from '../src/data/seed';
import type { UserRole } from '../src/domain/types';
import { useAuth } from '../src/state/AuthContext';
import { Body, Button, Card, Chip, Label, Screen, TextInputField, Title } from '../src/ui/components';
import { colors, radius, spacing, useTheme } from '../src/ui/theme';

export default function Entrada() {
  const t = useTheme();
  const { user, profile, loading, signIn, signUp, enterDemoMode } = useAuth();

  // Abas do Portal: Login vs Cadastro
  const [authMode, setAuthMode] = useState<'login' | 'cadastro'>('login');
  const [role, setRole] = useState<UserRole>('trainer');

  // Campos de Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [studioName, setStudioName] = useState('Aurora Personal Studio');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirecionamento automático caso já esteja autenticado
  useEffect(() => {
    if (profile) {
      if (profile.role === 'trainer') {
        router.replace('/radar');
      } else {
        router.replace('/hoje');
      }
    }
  }, [profile]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setSuccessMessage('Acesso autorizado! Redirecionando...');
    setTimeout(() => {
      router.replace(role === 'trainer' ? '/radar' : '/hoje');
    }, 600);
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha nome, e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await signUp({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      pass: password,
      role,
      inviteCode: role === 'student' ? inviteCode.trim() : undefined,
    });
    setSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    setSuccessMessage('Conta criada com sucesso! Acessando sua área...');
    setTimeout(() => {
      router.replace(role === 'trainer' ? '/radar' : '/hoje');
    }, 800);
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    enterDemoMode(demoRole);
    router.replace(demoRole === 'trainer' ? '/radar' : '/hoje');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
        {/* 1. CABEÇALHO DO ESTÚDIO */}
        <View style={styles.brandHeader}>
          <View style={styles.logoContainer}>
            <Text style={{ fontSize: 28 }}>⚡</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Title size={26} style={{ letterSpacing: -0.5 }}>
              AURORA
            </Title>
            <Text style={{ color: t.accent, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
              PERSONAL STUDIO • PLATAFORMA VIP
            </Text>
          </View>
        </View>

        {/* 2. CARD PRINCIPAL DE AUTENTICAÇÃO */}
        <Card style={{ padding: 18, gap: 14 }}>
          {/* Seletor de Modo: Entrar vs Criar Conta */}
          <View style={styles.tabToggleRow}>
            <Pressable
              onPress={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              style={[styles.tabToggleBtn, authMode === 'login' && styles.tabToggleBtnActive]}
            >
              <Text style={[styles.tabToggleText, authMode === 'login' && styles.tabToggleTextActive]}>
                🔑 Entrar na Conta
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setAuthMode('cadastro');
                setErrorMessage(null);
              }}
              style={[styles.tabToggleBtn, authMode === 'cadastro' && styles.tabToggleBtnActive]}
            >
              <Text style={[styles.tabToggleText, authMode === 'cadastro' && styles.tabToggleTextActive]}>
                📝 Criar Nova Conta
              </Text>
            </Pressable>
          </View>

          {/* Seletor de Perfil: Aluno vs Treinador */}
          <View style={{ gap: 6 }}>
            <Label>ESCOLHA SEU PERFIL DE ACESSO:</Label>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setRole('trainer')}
                style={[styles.roleSelectCard, role === 'trainer' && styles.roleSelectCardActive]}
              >
                <Text style={{ fontSize: 22 }}>⚡</Text>
                <View>
                  <Text style={[styles.roleSelectTitle, role === 'trainer' && { color: '#FFFFFF' }]}>
                    Treinador
                  </Text>
                  <Text style={styles.roleSelectSub}>Painel de Gestão & Alunos</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setRole('student')}
                style={[styles.roleSelectCard, role === 'student' && styles.roleSelectCardActive]}
              >
                <Text style={{ fontSize: 22 }}>👤</Text>
                <View>
                  <Text style={[styles.roleSelectTitle, role === 'student' && { color: '#FFFFFF' }]}>
                    Aluno VIP
                  </Text>
                  <Text style={styles.roleSelectSub}>Treinos, Dieta & Avaliação</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* MENSAGENS DE FEEDBACK */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={{ color: '#E11D48', fontSize: 13, fontWeight: '600' }}>
                ⚠️ {errorMessage}
              </Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successBox}>
              <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700' }}>
                ✓ {successMessage}
              </Text>
            </View>
          )}

          {/* FORMULÁRIO DINÂMICO CONFORME O MODO */}
          {authMode === 'login' ? (
            /* --- FORMULÁRIO DE LOGIN --- */
            <View style={{ gap: 10 }}>
              <TextInputField
                label="Seu E-mail Cadastrado *"
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
                label="Sua Senha de Acesso *"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrorMessage(null);
                }}
                placeholder="••••••••"
                secureTextEntry
              />

              <View style={{ marginTop: 6 }}>
                <Button
                  title={submitting ? 'Verificando Credenciais...' : 'Acessar Plataforma ➔'}
                  onPress={handleLogin}
                  disabled={submitting}
                />
              </View>
            </View>
          ) : (
            /* --- FORMULÁRIO DE CADASTRO --- */
            <View style={{ gap: 10 }}>
              <TextInputField
                label="Nome Completo *"
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setErrorMessage(null);
                }}
                placeholder="Ex: Helia Carriel ou Samuel Ferreira"
              />

              <TextInputField
                label="E-mail *"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setErrorMessage(null);
                }}
                placeholder="seuemail@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInputField
                label="Criar Senha de Acesso (Mín. 6 dígitos) *"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrorMessage(null);
                }}
                placeholder="••••••••"
                secureTextEntry
              />

              {role === 'trainer' ? (
                <TextInputField
                  label="Nome da Sua Marca / Estúdio"
                  value={studioName}
                  onChangeText={setStudioName}
                  placeholder="Aurora Personal Studio"
                />
              ) : (
                <TextInputField
                  label="Código do Convite do Personal (Opcional)"
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  placeholder="Ex: TREINO-8492"
                  autoCapitalize="characters"
                />
              )}

              <View style={{ marginTop: 6 }}>
                <Button
                  title={submitting ? 'Criando Conta...' : 'Cadastrar e Entrar 🚀'}
                  onPress={handleRegister}
                  disabled={submitting}
                />
              </View>
            </View>
          )}

          {/* DIVISOR SUTIL */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={{ color: t.muted, fontSize: 11, fontWeight: '600', paddingHorizontal: 8 }}>
              OU TESTE RAPIDAMENTE
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* BOTÕES DE ACESSO RÁPIDO PARA TESTE SEM SENHA */}
          <View style={{ gap: 8 }}>
            <Button
              title="⚡ Entrar no Painel do Treinador (Demonstração)"
              variant="neonOutline"
              onPress={() => handleQuickDemo('trainer')}
            />
            <Button
              title="👤 Entrar como Aluno VIP (Demonstração)"
              variant="ghost"
              onPress={() => handleQuickDemo('student')}
            />
          </View>
        </Card>

        {/* 3. RODAPÉ DE RECURSOS DO ESTÚDIO */}
        <View style={styles.footerFeatures}>
          <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
            🔒 Acesso Seguro com Criptografia e Sincronização em Nuvem Supabase
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#080C16',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabToggleBtnActive: {
    backgroundColor: '#1E293B',
  },
  tabToggleText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  tabToggleTextActive: {
    color: '#FFFFFF',
  },
  roleSelectCard: {
    flex: 1,
    backgroundColor: '#080C16',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleSelectCardActive: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  roleSelectTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  roleSelectSub: {
    color: '#64748B',
    fontSize: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  errorBox: {
    backgroundColor: 'rgba(225, 29, 72, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  footerFeatures: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
