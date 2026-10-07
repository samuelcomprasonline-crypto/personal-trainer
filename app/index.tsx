import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { trainer } from '../src/data/seed';
import { useAuth } from '../src/state/AuthContext';
import { ArrowCircleButton, Body, Button, Card, Label, Screen, Title } from '../src/ui/components';
import { useTheme } from '../src/ui/theme';

export default function Entrada() {
  const t = useTheme();
  const { enterDemoMode, signOut, profile, user } = useAuth();

  const handleEnterAsStudent = () => {
    enterDemoMode('student');
    router.replace('/hoje');
  };

  const handleEnterAsTrainer = () => {
    enterDemoMode('trainer');
    router.replace('/radar');
  };

  return (
    <Screen>
      {/* 1. CABEÇALHO SUPERIOR MINIMALISTA */}
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
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: t.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🏋️</Text>
          </View>
          <View>
            <Title size={20} style={{ letterSpacing: -0.3 }}>
              {trainer.name}
            </Title>
            <Label style={{ fontSize: 10, color: t.accent }}>Projeto 60 Dias • Consultoria</Label>
          </View>
        </View>

        {/* Seletor Rápido de Acesso */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={handleEnterAsTrainer}
            style={({ pressed }) => ({
              backgroundColor: 'rgba(198, 244, 50, 0.12)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: t.accent,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: t.accent, fontSize: 11, fontWeight: '800' }}>
              ⚡ Sou o Treinador
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/login')}
            style={({ pressed }) => ({
              backgroundColor: t.surfaceElevated,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: t.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: t.muted, fontSize: 11, fontWeight: '700' }}>Login</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. HERO BANNER MINIMALISTA COM ACESSO DUPLO CLARO */}
      <View
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: '#0E131B',
          borderWidth: 1,
          borderColor: t.border,
          marginTop: 6,
          position: 'relative',
          padding: 24,
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
            width: 240,
            height: 220,
            resizeMode: 'cover',
            opacity: 0.55,
          }}
        />

        <View style={{ maxWidth: '78%', gap: 8 }}>
          <Label style={{ color: t.muted, fontSize: 11, letterSpacing: 1.5 }}>
            CONSULTORIA & PRESCRIÇÃO OFICIAL
          </Label>

          <Title size={28} style={{ color: '#FFFFFF', fontWeight: '800' }}>
            Mais Forte.{'\n'}Mais Saudável.{'\n'}
            <Text style={{ color: t.accent }}>Você.</Text>
          </Title>

          <Body muted style={{ fontSize: 13, lineHeight: 18 } as any}>
            Treinos calibrados pelo método Júlio Balestrin, biomecânica em vídeo 16:9 e dietas automáticas por gramas.
          </Body>

          {/* DUPLO ACESSO: ALUNO OU TREINADOR COM 1 CLIQUE */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <Button
              title="Entrar como Aluno 👤"
              onPress={handleEnterAsStudent}
            />
            <Button
              title="Acessar como Treinador ⚡"
              variant="neonOutline"
              onPress={handleEnterAsTrainer}
            />
          </View>
        </View>
      </View>

      {/* 3. GRADE DE 4 AÇÕES RÁPIDAS (COM DIETA SEPARADA DE TREINO) */}
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {[
          {
            icon: '🏋️‍♂️',
            title: 'Treinos',
            subtitle: 'Balestrin 60 Dias',
            action: handleEnterAsStudent,
          },
          {
            icon: '🥗',
            title: 'Dieta & Macros',
            subtitle: 'Grama a grama',
            action: () => {
              enterDemoMode('student');
              router.push('/dieta');
            },
          },
          {
            icon: '📈',
            title: 'Avaliação & 3D',
            subtitle: 'Laudos e balança',
            action: () => {
              enterDemoMode('student');
              router.push('/progresso');
            },
          },
          {
            icon: '⚡',
            title: 'Radar Personal',
            subtitle: 'Painel Treinador',
            action: handleEnterAsTrainer,
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
                width: 38,
                height: 38,
                borderRadius: 19,
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

      {/* 4. PLANO CALIBRADO DO PDF DO JÚLIO BALESTRIN */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title size={20}>Plano Pré-Calibrado Oficial</Title>
          <Pressable onPress={handleEnterAsStudent}>
            <Body style={{ color: t.accent, fontSize: 13, fontWeight: '600' } as any}>
              Abrir Ficha Completa →
            </Body>
          </Pressable>
        </View>

        {/* Card do Treino DIA 1 — Pernas */}
        <Card
          onPress={handleEnterAsStudent}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop&q=80',
            }}
            style={{ width: 68, height: 68, borderRadius: 16 }}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Title size={17}>DIA 1 — Pernas (Iniciante 1)</Title>
            <Body muted style={{ fontSize: 13 } as any}>
              Aquecimento 140 BPMs • 12 exercícios • 4x15
            </Body>
            <Body style={{ color: t.accent, fontSize: 12, fontWeight: '600' } as any}>
              ● Cadeira Adutora, Abdutora, Pélvica, Leg Press & Extensora
            </Body>
          </View>
          <ArrowCircleButton onPress={handleEnterAsStudent} />
        </Card>

        {/* Card da Dieta Dedicada */}
        <Card
          onPress={() => {
            enterDemoMode('student');
            router.push('/dieta');
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
            <Title size={17}>Plano Nutricional & Dieta</Title>
            <Body muted style={{ fontSize: 13 } as any}>
              2.450 kcal • 185g Prot • 260g Carb • 65g Gord
            </Body>
            <Body style={{ color: t.accent, fontSize: 12, fontWeight: '600' } as any}>
              ● Cálculo automático de macros por gramas + Vitaminas
            </Body>
          </View>
          <ArrowCircleButton
            onPress={() => {
              enterDemoMode('student');
              router.push('/dieta');
            }}
          />
        </Card>
      </View>
    </Screen>
  );
}
