import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { trainer } from '../../src/data/seed';
import { Body, Button, Card, Label, Screen, Title } from '../../src/ui/components';
import { useTheme } from '../../src/ui/theme';

export default function Treinador() {
  const t = useTheme();

  return (
    <Screen>
      <Label>Seu Treinador</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: t.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: t.fonts.title, fontSize: 26 }}>
            {trainer.name[0]}
          </Text>
        </View>
        <View style={{ gap: 4 }}>
          <Title size={24}>{trainer.name}</Title>
          <Body muted>Consultoria personalizada ativa</Body>
        </View>
      </View>

      <Card>
        <Label>Canal Direto</Label>
        <Body>
          Todas as orientações técnicas, prescrições de periodização e análises dos seus vídeos de movimento são publicadas diretamente aqui.
        </Body>
      </Card>

      <Card>
        <Label>Metodologia</Label>
        <Body muted>
          Dupla progressão planejada, ajuste fino de carga por semana e flexibilidade de calendário para manter sua constância a longo prazo.
        </Body>
      </Card>

      <View style={{ marginTop: 16 }}>
        <Button title="Trocar perfil (Voltar à Entrada)" variant="ghost" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
