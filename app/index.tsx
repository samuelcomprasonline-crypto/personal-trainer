import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import type { UserRole } from '../src/domain/types';
import { useAuth } from '../src/state/AuthContext';
import { useTheme } from '../src/ui/theme';

export default function Entrada() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const { profile, signIn, signUp, enterDemoMode } = useAuth();

  // Abas do Portal: Login vs Cadastro
  const [authMode, setAuthMode] = useState<'login' | 'cadastro'>('login');
  const [role, setRole] = useState<UserRole>('trainer');

  // Campos de Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const neonLime = '#10B981';
  const cardBg = '#0D0E12';
  const cardBorder = 'rgba(255, 255, 255, 0.08)';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      // Se não preencheu e clicar no botão, direciona com base no perfil selecionado
      handleQuickDemo(role);
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
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0D14' }}
      contentContainerStyle={{
        minHeight: '100%',
        paddingVertical: isWide ? 48 : 24,
        paddingHorizontal: isWide ? 48 : 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          width: '100%',
          maxWidth: 1180,
          flexDirection: isWide ? 'row' : 'column',
          gap: isWide ? 56 : 32,
          alignItems: isWide ? 'center' : 'stretch',
        }}
      >
        {/* LADO ESQUERDO: BRANDING & VALUE PROPS */}
        <View style={{ flex: 1.1, gap: 24 }}>
          {/* Logo Minimalista com Ícone Verde Neon Brilhante */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(16, 185, 129, 0.5)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: neonLime,
                shadowOpacity: 0.35,
                shadowRadius: 10,
              }}
            >
              <Text style={{ fontSize: 18 }}>⚡</Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>
                AURORA STUDIO
              </Text>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700', letterSpacing: 1.0, textTransform: 'uppercase' }}>
                SISTEMA OPERACIONAL BIOMÉTRICO & GESTÃO 360
              </Text>
            </View>
          </View>

          {/* Headline Elegante */}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: isWide ? 38 : 28,
              fontWeight: '800',
              lineHeight: isWide ? 46 : 36,
              letterSpacing: -0.6,
            }}
          >
            A plataforma mais avançada para Personal Trainers e Alunos.
          </Text>

          {/* Parágrafo de Baixo Contraste */}
          <Text style={{ color: '#8E9AA8', fontSize: 15, lineHeight: 24, maxWidth: 520 }}>
            Prescrição inteligente de treinos com biomecânica, dietas com cálculo automático de macros,
            leitor de balança por PDF/foto, scanner corporal 3D e fluxo financeiro integrado com cobrança Pix.
          </Text>

          {/* SHOWCASE TECNOLOGIA BIOMÉTRICA */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 18,
              padding: 22,
              borderWidth: 1,
              borderColor: cardBorder,
              gap: 16,
              maxWidth: 520,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: neonLime }} />
                <Text style={{ color: neonLime, fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
                  TECNOLOGIA BIOMÉTRICA
                </Text>
              </View>
              <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '600' }}>
                Tablet & Desktop Pro
              </Text>
            </View>

            {/* STRENGTH SCORE 89 & CURVA DE ONDA VERDE */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 2 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  STRENGTH SCORE
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '900', lineHeight: 40 }}>
                  89
                </Text>
                <Text style={{ color: neonLime, fontSize: 11.5, fontWeight: '700' }}>
                  ● Excelente (+7%)
                </Text>
              </View>

              <View style={{ width: 140, height: 55 }}>
                <Svg width="140" height="55" viewBox="0 0 140 55">
                  <Defs>
                    <LinearGradient id="loginWave" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={neonLime} stopOpacity="0.35" />
                      <Stop offset="100%" stopColor={neonLime} stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  <Path
                    d="M 10 45 C 30 45, 40 32, 60 36 C 80 40, 90 18, 110 22 C 120 25, 125 10, 135 10 L 135 50 L 10 50 Z"
                    fill="url(#loginWave)"
                  />
                  <Path
                    d="M 10 45 C 30 45, 40 32, 60 36 C 80 40, 90 18, 110 22 C 120 25, 125 10, 135 10"
                    fill="none"
                    stroke={neonLime}
                    strokeWidth="2.2"
                  />
                  <Circle cx="135" cy="10" r="3.5" fill={neonLime} />
                </Svg>
              </View>
            </View>

            {/* BADGES MINIMALISTAS COM OUTLINES SUTIS */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
              {[
                { label: 'Scanner 3D Vivo', icon: '🧬' },
                { label: 'Balança PDF/OCR', icon: '📄' },
                { label: 'Dieta & Macros', icon: '🥗' },
                { label: 'Cobrança Pix', icon: '💰' },
              ].map((feat, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: '#11151F',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 11 }}>{feat.icon}</Text>
                  <Text style={{ color: '#D1D5DB', fontSize: 11, fontWeight: '600' }}>
                    {feat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* LADO DIREITO: THE LOGIN CARD (TRANSLÚCIDO & GLASSMORPHISM) */}
        <View
          style={{
            flex: 0.95,
            width: '100%',
            maxWidth: isWide ? 460 : '100%',
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: isWide ? 32 : 24,
            borderWidth: 1,
            borderColor: cardBorder,
            gap: 20,
            shadowColor: '#000000',
            shadowOpacity: 0.6,
            shadowRadius: 30,
          }}
        >
          {/* Abas Minimalistas de Baixo Contraste */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#0A0D14',
              borderRadius: 12,
              padding: 3,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <Pressable
              onPress={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: 'center',
                borderRadius: 9,
                backgroundColor: authMode === 'login' ? '#161B26' : 'transparent',
              }}
            >
              <Text
                style={{
                  color: authMode === 'login' ? '#FFFFFF' : '#6B7280',
                  fontSize: 12.5,
                  fontWeight: '700',
                }}
              >
                Entrar na Conta
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setAuthMode('cadastro');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: 'center',
                borderRadius: 9,
                backgroundColor: authMode === 'cadastro' ? '#161B26' : 'transparent',
              }}
            >
              <Text
                style={{
                  color: authMode === 'cadastro' ? '#FFFFFF' : '#6B7280',
                  fontSize: 12.5,
                  fontWeight: '700',
                }}
              >
                Criar Nova Conta
              </Text>
            </Pressable>
          </View>

          {/* Seletor Segmentado de Perfil */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: '#6B7280', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              ESCOLHA SEU PERFIL:
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setRole('trainer')}
                style={{
                  flex: 1,
                  backgroundColor: role === 'trainer' ? 'rgba(16, 185, 129, 0.08)' : '#0A0D14',
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: role === 'trainer' ? neonLime : 'rgba(255, 255, 255, 0.06)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 16 }}>⚡</Text>
                <View>
                  <Text style={{ color: role === 'trainer' ? '#FFFFFF' : '#8E9AA8', fontSize: 12.5, fontWeight: '700' }}>
                    Treinador
                  </Text>
                  <Text style={{ color: '#6B7280', fontSize: 9.5 }}>Personal Pro</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setRole('student')}
                style={{
                  flex: 1,
                  backgroundColor: role === 'student' ? 'rgba(16, 185, 129, 0.08)' : '#0A0D14',
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: role === 'student' ? neonLime : 'rgba(255, 255, 255, 0.06)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 16 }}>👤</Text>
                <View>
                  <Text style={{ color: role === 'student' ? '#FFFFFF' : '#8E9AA8', fontSize: 12.5, fontWeight: '700' }}>
                    Aluno VIP
                  </Text>
                  <Text style={{ color: '#6B7280', fontSize: 9.5 }}>Treino & Dieta</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Mensagens de Feedback */}
          {errorMessage && (
            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', borderWidth: 1, borderColor: '#EF4444', borderRadius: 8, padding: 8 }}>
              <Text style={{ color: '#EF4444', fontSize: 11.5, fontWeight: '600' }}>
                ⚠️ {errorMessage}
              </Text>
            </View>
          )}

          {successMessage && (
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderWidth: 1, borderColor: neonLime, borderRadius: 8, padding: 8 }}>
              <Text style={{ color: neonLime, fontSize: 11.5, fontWeight: '600' }}>
                ✓ {successMessage}
              </Text>
            </View>
          )}

          {/* FORMULÁRIO COM INPUTS SUTIS */}
          {authMode === 'login' ? (
            <View style={{ gap: 14 }}>
              <View style={{ gap: 5 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '600' }}>E-mail Cadastrado</Text>
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMessage(null);
                  }}
                  placeholder={role === 'trainer' ? 'personal@aurorastudio.com' : 'aluno@aurorastudio.com'}
                  placeholderTextColor="#4B5563"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    backgroundColor: '#0A0D14',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: '#FFFFFF',
                    fontSize: 13.5,
                  }}
                />
              </View>

              <View style={{ gap: 5 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '600' }}>Senha de Acesso</Text>
                <TextInput
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#4B5563"
                  secureTextEntry
                  style={{
                    backgroundColor: '#0A0D14',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: '#FFFFFF',
                    fontSize: 13.5,
                  }}
                />
              </View>

              {/* Botão Primário Verde Esmeralda Compacto e Vibrante */}
              <Pressable
                onPress={handleLogin}
                disabled={submitting}
                style={({ pressed }) => ({
                  backgroundColor: neonLime,
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: neonLime,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  marginTop: 2,
                })}
              >
                {submitting ? (
                  <ActivityIndicator color="#0A0E14" />
                ) : (
                  <Text style={{ color: '#0A0E14', fontSize: 13.5, fontWeight: '800' }}>
                    Acessar Plataforma →
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <View style={{ gap: 4 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '600' }}>Nome Completo</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#4B5563"
                  style={{
                    backgroundColor: '#0A0D14',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    color: '#FFFFFF',
                    fontSize: 13,
                  }}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '600' }}>E-mail</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor="#4B5563"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    backgroundColor: '#0A0D14',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    color: '#FFFFFF',
                    fontSize: 13,
                  }}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '600' }}>Senha</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#4B5563"
                  secureTextEntry
                  style={{
                    backgroundColor: '#0A0D14',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    color: '#FFFFFF',
                    fontSize: 13,
                  }}
                />
              </View>

              <Pressable
                onPress={handleRegister}
                disabled={submitting}
                style={({ pressed }) => ({
                  backgroundColor: neonLime,
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                  marginTop: 4,
                })}
              >
                {submitting ? (
                  <ActivityIndicator color="#0A0E14" />
                ) : (
                  <Text style={{ color: '#0A0E14', fontSize: 13.5, fontWeight: '800' }}>
                    Criar Conta & Acessar →
                  </Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Divisor "OU TESTE EM 1 CLIQUE" */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />
            <Text style={{ color: '#6B7280', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              OU TESTE EM 1 CLIQUE
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />
          </View>

          {/* DOIS BOTÕES HOLLOW COM CONTORNOS SUTIS */}
          <View style={{ gap: 8 }}>
            <Pressable
              onPress={() => handleQuickDemo('trainer')}
              style={({ pressed }) => ({
                backgroundColor: 'rgba(16, 185, 129, 0.04)',
                borderWidth: 1,
                borderColor: 'rgba(16, 185, 129, 0.3)',
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>
                Testar como Treinador (Personal Pro)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleQuickDemo('student')}
              style={({ pressed }) => ({
                backgroundColor: 'rgba(56, 189, 248, 0.04)',
                borderWidth: 1,
                borderColor: 'rgba(56, 189, 248, 0.3)',
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '700' }}>
                Testar como Aluno VIP
              </Text>
            </Pressable>
          </View>

          {/* Nota de Segurança Elegante */}
          <Text style={{ color: '#4B5563', fontSize: 9.5, textAlign: 'center' }}>
            🔒 Sincronização em nuvem ativa com Supabase e criptografia ponta a ponta.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
