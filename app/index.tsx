import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { trainer } from '../src/data/seed';
import { useAuth } from '../src/state/AuthContext';
import { Body, Button, Card, Label, Screen, Title } from '../src/ui/components';

export default function Entrada() {
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

  return (
    <Screen>
      <View style={{ gap: 8, marginTop: 12 }}>
        <Label>{trainer.name}</Label>
        <Title size={36}>A tecnologia por trás do seu estúdio.</Title>
        <Body muted>
          Plataforma de consultoria esportiva de alto padrão. Prescrição, periodização e avaliações físicas em uma única experiência.
        </Body>
      </View>

      {user && profile ? (
        <Card>
          <Label>Sessão Ativa</Label>
          <Title size={22}>{profile.name}</Title>
          <Body muted>
            Conectado como {profile.role === 'trainer' ? 'Treinador' : 'Aluno'} ({profile.email})
          </Body>
          <View style={{ gap: 8, marginTop: 10 }}>
            <Button
              title="Continuar para o aplicativo"
              onPress={() => {
                if (profile.role === 'trainer') {
                  router.replace('/radar');
                } else {
                  router.replace('/hoje');
                }
              }}
            />
            <Button title="Encerrar sessão" variant="ghost" onPress={() => signOut()} />
          </View>
        </Card>
      ) : (
        <Card>
          <Label>Acesso com Conta</Label>
          <Body>
            Acesse seus treinos sincronizados na nuvem ou gerencie sua base de alunos.
          </Body>
          <View style={{ gap: 8, marginTop: 10 }}>
            <Button title="Entrar na minha conta" onPress={() => router.push('/login')} />
            <Button title="Criar nova conta" variant="ghost" onPress={() => router.push('/cadastro')} />
          </View>
        </Card>
      )}

      <Card>
        <Label>Modo Demonstração</Label>
        <Body muted>
          Deseja testar as telas e ferramentas imediatamente com dados de exemplo locais?
        </Body>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Aluno Demo"
              variant="ghost"
              onPress={() => {
                enterDemoMode('student');
                router.replace('/hoje');
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Treinador Demo"
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
