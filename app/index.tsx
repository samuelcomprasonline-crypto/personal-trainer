import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import { trainer } from '../src/data/seed';
import type { UserRole } from '../src/domain/types';
import { useAuth } from '../src/state/AuthContext';
import { useTheme } from '../src/ui/theme';

export default function Entrada() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const { profile, signIn, signUp, signOut, enterDemoMode } = useAuth();

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

  const neonLime = '#C6F432';
  const cardBg = '#141824';
  const cardBorder = 'rgba(255, 255, 255, 0.08)';

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
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0E14' }}
      contentContainerStyle={{
        minHeight: '100%',
        paddingVertical: isWide ? 40 : 20,
        paddingHorizontal: isWide ? 40 : 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 1200,
          flexDirection: isWide ? 'row' : 'column',
          gap: 32,
          alignItems: isWide ? 'center' : 'stretch',
        }}
      >
        {/* COLUNA ESQUERDA: HERO SHOWCASE E PREVIEW DO TABLET */}
        <View style={{ flex: 1, gap: 20 }}>
          {/* Logo e Nome da Marca */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: neonLime,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: neonLime,
                shadowOpacity: 0.4,
                shadowRadius: 10,
              }}
            >
              <Text style={{ fontSize: 24 }}>⚡</Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>
                AURORA STUDIO
              </Text>
              <Text style={{ color: neonLime, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
                Sistema Operacional Biométrico & Gestão 360°
              </Text>
            </View>
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: isWide ? 34 : 26, fontWeight: '900', lineHeight: isWide ? 42 : 32 }}>
            A plataforma mais avançada para Personal Trainers e Alunos.
          </Text>

          <Text style={{ color: '#8E9AA8', fontSize: 15, lineHeight: 22 }}>
            Prescrição inteligente de treinos com biomecânica, dietas com cálculo automático de macros,
            leitor de balança por PDF/foto, scanner corporal 3D e fluxo financeiro integrado com cobrança Pix.
          </Text>

          {/* CARD DE PREVIEW REAL DO DASHBOARD DO TABLET */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: cardBorder,
              gap: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: neonLime }} />
                <Text style={{ color: neonLime, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
                  TECNOLOGIA BIOMÉTRICA DE PONTA
                </Text>
              </View>
              <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '600' }}>
                Tablet & Desktop Pro
              </Text>
            </View>

            {/* Miniatura do Strength Score Wave */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: 2 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '700' }}>STRENGTH SCORE</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '900' }}>89</Text>
                <Text style={{ color: neonLime, fontSize: 11, fontWeight: '700' }}>● Excelente (+7%)</Text>
              </View>

              <View style={{ width: 140, height: 60 }}>
                <Svg width="140" height="60" viewBox="0 0 140 60">
                  <Defs>
                    <LinearGradient id="previewWave" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={neonLime} stopOpacity="0.4" />
                      <Stop offset="100%" stopColor={neonLime} stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  <Path
                    d="M 10 50 C 30 50, 40 35, 60 40 C 80 45, 90 20, 110 25 C 120 28, 125 10, 135 10 L 135 55 L 10 55 Z"
                    fill="url(#previewWave)"
                  />
                  <Path
                    d="M 10 50 C 30 50, 40 35, 60 40 C 80 45, 90 20, 110 25 C 120 28, 125 10, 135 10"
                    fill="none"
                    stroke={neonLime}
                    strokeWidth="2.5"
                  />
                  <Circle cx="135" cy="10" r="4" fill={neonLime} />
                </Svg>
              </View>
            </View>

            {/* 4 Destaques em Pílulas */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingTop: 6 }}>
              {[
                '🧬 Scanner 3D Vivo',
                '📄 Balança PDF / OCR',
                '🥗 Dieta & Macros',
                '💰 Cobrança Pix',
              ].map((feat, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: '#121622',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <Text style={{ color: '#D1D5DB', fontSize: 11, fontWeight: '700' }}>
                    {feat}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* COLUNA DIREITA: PORTAL DE ACESSO, LOGIN & DEMOS DE 1 CLIQUE */}
        <View
          style={{
            flex: 1,
            maxWidth: isWide ? 480 : '100%',
            backgroundColor: cardBg,
            borderRadius: 24,
            padding: 28,
            borderWidth: 1,
            borderColor: cardBorder,
            gap: 18,
            shadowColor: '#000000',
            shadowOpacity: 0.5,
            shadowRadius: 20,
          }}
        >
          {/* Seletor de Abas: Entrar vs Criar Conta */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#0F131D',
              borderRadius: 14,
              padding: 4,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <Pressable
              onPress={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: authMode === 'login' ? '#1E2533' : 'transparent',
              }}
            >
              <Text
                style={{
                  color: authMode === 'login' ? '#FFFFFF' : '#8E9AA8',
                  fontSize: 13,
                  fontWeight: '700',
                }}
              >
                🔑 Entrar na Conta
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setAuthMode('cadastro');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: authMode === 'cadastro' ? '#1E2533' : 'transparent',
              }}
            >
              <Text
                style={{
                  color: authMode === 'cadastro' ? '#FFFFFF' : '#8E9AA8',
                  fontSize: 13,
                  fontWeight: '700',
                }}
              >
                📝 Criar Nova Conta
              </Text>
            </Pressable>
          </View>

          {/* Seletor de Perfil: Treinador vs Aluno */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
              ESCOLHA SEU PERFIL:
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setRole('trainer')}
                style={{
                  flex: 1,
                  backgroundColor: role === 'trainer' ? 'rgba(0, 240, 255, 0.1)' : '#0F131D',
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: role === 'trainer' ? '#00F0FF' : 'rgba(255, 255, 255, 0.06)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 20 }}>⚡</Text>
                <View>
                  <Text style={{ color: role === 'trainer' ? '#FFFFFF' : '#8E9AA8', fontSize: 13, fontWeight: '800' }}>
                    Treinador
                  </Text>
                  <Text style={{ color: '#6B7A8D', fontSize: 10 }}>Gestão & Alunos</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setRole('student')}
                style={{
                  flex: 1,
                  backgroundColor: role === 'student' ? 'rgba(198, 244, 50, 0.1)' : '#0F131D',
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: role === 'student' ? neonLime : 'rgba(255, 255, 255, 0.06)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 20 }}>👤</Text>
                <View>
                  <Text style={{ color: role === 'student' ? '#FFFFFF' : '#8E9AA8', fontSize: 13, fontWeight: '800' }}>
                    Aluno VIP
                  </Text>
                  <Text style={{ color: '#6B7A8D', fontSize: 10 }}>Treino & Dieta</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Feedback de Erro ou Sucesso */}
          {errorMessage && (
            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#EF4444', borderRadius: 10, padding: 10 }}>
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>
                ⚠️ {errorMessage}
              </Text>
            </View>
          )}

          {successMessage && (
            <View style={{ backgroundColor: 'rgba(198, 244, 50, 0.15)', borderWidth: 1, borderColor: neonLime, borderRadius: 10, padding: 10 }}>
              <Text style={{ color: neonLime, fontSize: 12, fontWeight: '700' }}>
                ✓ {successMessage}
              </Text>
            </View>
          )}

          {/* FORMULÁRIO */}
          {authMode === 'login' ? (
            <View style={{ gap: 12 }}>
              <View style={{ gap: 4 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '700' }}>E-mail Cadastrado</Text>
                <View style={{ backgroundColor: '#0F131D', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
                    {email || 'exemplo@email.com'}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '700' }}>Senha de Acesso</Text>
                <View style={{ backgroundColor: '#0F131D', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={{ color: '#8E9AA8', fontSize: 14 }}>••••••••</Text>
                </View>
              </View>

              <Pressable
                onPress={() => handleQuickDemo(role)}
                style={({ pressed }) => ({
                  backgroundColor: neonLime,
                  borderRadius: 12,
                  paddingVertical: 13,
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: neonLime,
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  marginTop: 4,
                })}
              >
                <Text style={{ color: '#0A0E14', fontSize: 14, fontWeight: '900' }}>
                  Acessar Plataforma ➔
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <View style={{ gap: 4 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '700' }}>Nome Completo *</Text>
                <View style={{ backgroundColor: '#0F131D', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 13 }}>Ex: Prof. Samuel Ferreira</Text>
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ color: '#8E9AA8', fontSize: 11, fontWeight: '700' }}>E-mail *</Text>
                <View style={{ backgroundColor: '#0F131D', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 13 }}>personal@aurorastudio.com</Text>
                </View>
              </View>

              <Pressable
                onPress={() => handleQuickDemo(role)}
                style={({ pressed }) => ({
                  backgroundColor: neonLime,
                  borderRadius: 12,
                  paddingVertical: 13,
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                  marginTop: 6,
                })}
              >
                <Text style={{ color: '#0A0E14', fontSize: 14, fontWeight: '900' }}>
                  Cadastrar e Acessar Agora 🚀
                </Text>
              </Pressable>
            </View>
          )}

          {/* DIVISOR */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <Text style={{ color: '#8E9AA8', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>
              OU TESTE EM 1 CLIQUE
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          </View>

          {/* BOTÕES DE ACESSO RÁPIDO INSTANTÂNEO */}
          <View style={{ gap: 8 }}>
            <Pressable
              onPress={() => handleQuickDemo('trainer')}
              style={({ pressed }) => ({
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                borderWidth: 1,
                borderColor: '#00F0FF',
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#00F0FF', fontSize: 13, fontWeight: '800' }}>
                ⚡ Testar como Treinador (Personal Pro)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleQuickDemo('student')}
              style={({ pressed }) => ({
                backgroundColor: 'rgba(198, 244, 50, 0.08)',
                borderWidth: 1,
                borderColor: neonLime,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: neonLime, fontSize: 13, fontWeight: '800' }}>
                👤 Testar como Aluno VIP (Dashboard da Foto)
              </Text>
            </Pressable>
          </View>

          <Text style={{ color: '#6B7A8D', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
            🔒 Sincronização em nuvem ativa com Supabase e criptografia ponta a ponta.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
