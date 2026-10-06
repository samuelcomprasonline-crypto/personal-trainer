import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { trainer } from '../../src/data/seed';
import { useAuth } from '../../src/state/AuthContext';
import { Body, Button, Card, Chip, Label, Screen, Title } from '../../src/ui/components';
import { useTheme } from '../../src/ui/theme';

export default function Treinador() {
  const t = useTheme();
  const { profile, signOut } = useAuth();

  return (
    <Screen>
      {/* 1. PERFIL DO TREINADOR (IDÊNTICO À FOTO 2: TRAINER PROFILE) */}
      <View style={{ alignItems: 'center', marginTop: 10, gap: 10 }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&auto=format&fit=crop&q=80',
            }}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              borderWidth: 3,
              borderColor: t.accent,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              backgroundColor: t.accent,
              borderRadius: 12,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: t.accentText }}>✓ PRO</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: 2 }}>
          <Title size={24}>{trainer.name}</Title>
          <Body muted style={{ fontSize: 14 } as any}>
            Personal Trainer Certificado & Fisiologista
          </Body>
          <Body style={{ color: t.accent, fontSize: 13, fontWeight: '700' } as any}>
            ★ 4.9 (128 Avaliações de Alunos)
          </Body>
        </View>
      </View>

      {/* 2. ESTATÍSTICAS DO TREINADOR (FOTO 2) */}
      <View style={{ flexDirection: 'row', gap: 10, marginVertical: 6 }}>
        {[
          { num: '8', label: 'Anos Exp.' },
          { num: '250+', label: 'Alunos' },
          { num: '120+', label: 'Planos' },
        ].map((stat, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: t.surface,
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: t.border,
              alignItems: 'center',
            }}
          >
            <Title size={22} style={{ color: '#FFFFFF' }}>{stat.num}</Title>
            <Body muted style={{ fontSize: 11, marginTop: 2 } as any}>{stat.label}</Body>
          </View>
        ))}
      </View>

      {/* 3. BOTÃO VERDE NEON "MENSAGEM AO TREINADOR" (FOTO 2) */}
      <Button
        title="Enviar Mensagem ao Treinador 💬"
        onPress={() => {}}
      />

      {/* 4. SOBRE O TREINADOR */}
      <Card>
        <Label>Sobre o Profissional</Label>
        <Body style={{ fontSize: 14, lineHeight: 22 } as any}>
          Apaixonado por ajudar você a alcançar suas metas de saúde e estética. Foco em biomecânica de precisão, periodização ondulatória e suporte contínuo para evitar lesões e garantir evolução perpétua.
        </Body>
      </Card>

      {/* 5. ESPECIALIZAÇÕES (FOTO 2) */}
      <Card>
        <Label>Especializações</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {['Perda de Gordura', 'Hipertrofia', 'Força Pura', 'Reabilitação', 'HIIT'].map((esp, i) => (
            <View
              key={i}
              style={{
                backgroundColor: t.surfaceElevated,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: t.border,
              }}
            >
              <Body style={{ fontSize: 12, fontWeight: '600', color: t.text } as any}>{esp}</Body>
            </View>
          ))}
        </View>
      </Card>

      {/* 6. CONTA DO ALUNO & SAIR */}
      <Card>
        <Label>Sua Conta de Aluno</Label>
        <Title size={18}>{profile?.name ?? 'Samuel Ferreira'}</Title>
        <Body muted style={{ fontSize: 13 } as any}>{profile?.email ?? 'samuel@aluno.com'}</Body>
        <View style={{ marginTop: 8 }}>
          <Button
            title="Sair da Conta"
            variant="ghost"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
        </View>
      </Card>
    </Screen>
  );
}
