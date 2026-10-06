import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, ImageBackground, Pressable, Text, View } from 'react-native';
import { trainer } from '../src/data/seed';
import { useAuth } from '../src/state/AuthContext';
import { ArrowCircleButton, Body, Button, Card, Label, Screen, Title } from '../src/ui/components';
import { useTheme } from '../src/ui/theme';

export default function Entrada() {
  const t = useTheme();
  const { user, profile, enterDemoMode, signOut } = useAuth();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'trainer') {
        router.replace('/radar');
      } else {
        router.replace('/hoje');
      }
    }
  }, [user, profile]);

  const handleStart = () => {
    if (user && profile) {
      router.replace(profile.role === 'trainer' ? '/radar' : '/hoje');
    } else {
      enterDemoMode('student');
      router.replace('/hoje');
    }
  };

  return (
    <Screen>
      {/* 1. CABEÇALHO SUPERIOR (IDÊNTICO À FOTO 1) */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
          marginBottom: 4,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: t.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>🏋️</Text>
          </View>
          <View>
            <Title size={20} style={{ letterSpacing: -0.2 }}>
              {trainer.name}
            </Title>
            <Label style={{ fontSize: 10, color: t.accent }}>Consultoria de Elite</Label>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Sino de Notificação */}
          <Pressable
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: t.surfaceElevated,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <Text style={{ fontSize: 16 }}>🔔</Text>
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: t.accent,
              }}
            />
          </Pressable>

          {/* Avatar */}
          <Pressable
            onPress={() => (user ? signOut() : router.push('/login'))}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: t.accent,
            }}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </Pressable>
        </View>
      </View>

      {/* 2. HERO BANNER PRINCIPAL (IDÊNTICO À FOTO 1) */}
      <View
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: '#0F141C',
          borderWidth: 1,
          borderColor: t.border,
          marginTop: 4,
          position: 'relative',
          minHeight: 220,
        }}
      >
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&auto=format&fit=crop&q=80',
          }}
          style={{
            position: 'absolute',
            right: -20,
            bottom: 0,
            width: 250,
            height: 220,
            resizeMode: 'cover',
            opacity: 0.75,
          }}
        />

        <View style={{ padding: 22, maxWidth: '72%', gap: 8 }}>
          <Label style={{ color: t.muted, fontSize: 11, letterSpacing: 1.5 }}>
            SUA SAÚDE. NOSSA PRIORIDADE.
          </Label>

          <View>
            <Title size={28} style={{ color: '#FFFFFF', fontWeight: '800' }}>
              Mais Forte.{'\n'}Mais Saudável.{'\n'}
              <Text style={{ color: t.accent }}>Você.</Text>
            </Title>
          </View>

          <Body muted style={{ fontSize: 13, lineHeight: 18 } as any}>
            Periodização de alto nível, biomecânica em vídeo e laudos corporais 3D.
          </Body>

          <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
            <Button
              title="Começar Agora →"
              onPress={handleStart}
            />
          </View>
        </View>
      </View>

      {/* 3. GRADE DE 4 AÇÕES RÁPIDAS (EXATAMENTE COMO NA FOTO 1) */}
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {[
          {
            icon: '🏋️‍♂️',
            title: 'Treinos',
            subtitle: 'Fichas do dia',
            action: () => {
              enterDemoMode('student');
              router.push('/hoje');
            },
          },
          {
            icon: '🥗',
            title: 'Metas & Dieta',
            subtitle: 'Composição',
            action: () => {
              enterDemoMode('student');
              router.push('/progresso');
            },
          },
          {
            icon: '📈',
            title: 'Progresso',
            subtitle: 'Laudos & 3D',
            action: () => {
              enterDemoMode('student');
              router.push('/progresso');
            },
          },
          {
            icon: '⭐',
            title: 'Personal',
            subtitle: 'Canal Direto',
            action: () => {
              enterDemoMode('student');
              router.push('/treinador');
            },
          },
        ].map((item, index) => (
          <Pressable
            key={index}
            onPress={item.action}
            style={({ pressed }) => ({
              flex: 1,
              minWidth: 70,
              backgroundColor: t.surface,
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
              gap: 4,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: t.surfaceElevated,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            </View>
            <Text style={{ color: t.text, fontWeight: '700', fontSize: 13, textAlign: 'center' }}>
              {item.title}
            </Text>
            <Text style={{ color: t.muted, fontSize: 11, textAlign: 'center' }}>
              {item.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 4. SEÇÃO "PLANO DE HOJE" (TODAY'S PLAN) COM FOTOS E BOTÃO VERDE */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title size={20}>Plano de Hoje</Title>
          <Pressable onPress={handleStart}>
            <Body style={{ color: t.accent, fontSize: 13, fontWeight: '600' } as any}>
              Ver Todos →
            </Body>
          </Pressable>
        </View>

        {/* Card de Treino do Dia */}
        <Card
          onPress={() => {
            enterDemoMode('student');
            router.push('/hoje');
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop&q=80',
            }}
            style={{ width: 68, height: 68, borderRadius: 16 }}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Title size={17}>Treino A — Inferiores & Força</Title>
            <Body muted style={{ fontSize: 13 } as any}>
              45 min • Carga Moderada / Intensa
            </Body>
            <Body style={{ color: t.accent, fontSize: 12, fontWeight: '600' } as any}>
              ● Leg Press 45º + Cadeira Extensora
            </Body>
          </View>
          <ArrowCircleButton
            onPress={() => {
              enterDemoMode('student');
              router.push('/treino');
            }}
          />
        </Card>

        {/* Card de Avaliação Física 3D & Laudo */}
        <Card
          onPress={() => {
            enterDemoMode('student');
            router.push('/progresso');
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
            }}
            style={{ width: 68, height: 68, borderRadius: 16 }}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Title size={17}>Avaliação Física & Fotos 3D</Title>
            <Body muted style={{ fontSize: 13 } as any}>
              Bioimpedância clínica de 4 compartimentos
            </Body>
            <Body style={{ color: t.accent, fontSize: 12, fontWeight: '600' } as any}>
              ● 41.3 kg Músculo • 21.2% Gordura
            </Body>
          </View>
          <ArrowCircleButton
            onPress={() => {
              enterDemoMode('student');
              router.push('/progresso');
            }}
          />
        </Card>
      </View>

      {/* 5. CARD MOTIVACIONAL COM DEGRADE VERDE NEON (FOTO 1 RODAPÉ) */}
      <View
        style={{
          borderRadius: 20,
          backgroundColor: '#121720',
          borderWidth: 1,
          borderColor: `${t.accent}40`,
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <View style={{ gap: 4, maxWidth: '75%' }}>
          <Title size={17} style={{ color: '#FFFFFF' }}>
            Pequenos passos. Grandes mudanças.
          </Title>
          <Body muted style={{ fontSize: 13 } as any}>
            Mantenha a consistência sem pular treinos.
          </Body>
        </View>

        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${t.accent}20`,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: t.accent,
          }}
        >
          <Text style={{ fontSize: 22 }}>🏃</Text>
        </View>
      </View>

      {/* 6. ACESSO RÁPIDO DO TREINADOR E CONTAS */}
      <Card>
        <Label>Área Profissional</Label>
        <Body muted style={{ fontSize: 14 } as any}>
          Você é o personal trainer? Acesse o painel com Radar de alunos, prescrição e envio de convites.
        </Body>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Entrar como Treinador"
              variant="neonOutline"
              onPress={() => {
                enterDemoMode('trainer');
                router.replace('/radar');
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Fazer Login"
              variant="ghost"
              onPress={() => router.push('/login')}
            />
          </View>
        </View>
      </Card>
    </Screen>
  );
}
