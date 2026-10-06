import { router } from 'expo-router';
import { View } from 'react-native';
import { trainer } from '../src/data/seed';
import { Body, Button, Card, Label, Screen, Title } from '../src/ui/components';

export default function Entrada() {
  return (
    <Screen>
      <View style={{ gap: 8, marginTop: 12 }}>
        <Label>{trainer.name}</Label>
        <Title size={36}>Bem-vindo ao seu estúdio.</Title>
        <Body muted>
          Plataforma de consultoria de alto padrão. Experimente a interface como aluno ou como treinador.
        </Body>
      </View>

      <Card>
        <Label>Área do Aluno</Label>
        <Body>
          Acesse seu treino do dia, registre cargas em tempo real, substitua aparelhos ocupados e acompanhe sua consistência semanal.
        </Body>
        <View style={{ marginTop: 8 }}>
          <Button title="Entrar como aluno" onPress={() => router.replace('/hoje')} />
        </View>
      </Card>

      <Card>
        <Label>Área do Treinador</Label>
        <Body>
          Visualize o Radar inteligente com alertas prioritários de alunos, acompanhe a aderência e consulte a biblioteca de exercícios.
        </Body>
        <View style={{ marginTop: 8 }}>
          <Button title="Entrar como treinador" variant="ghost" onPress={() => router.replace('/radar')} />
        </View>
      </Card>
    </Screen>
  );
}
