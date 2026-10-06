import { router } from 'expo-router';
import { View } from 'react-native';
import { exerciseById, template, trainer } from '../../src/data/seed';
import { nextSlot, shouldRest } from '../../src/domain/schedule';
import { useAppState } from '../../src/state/AppState';
import { useAuth } from '../../src/state/AuthContext';
import { Body, Button, Card, Label, Screen, Title } from '../../src/ui/components';
import { useTheme } from '../../src/ui/theme';

export default function Hoje() {
  const t = useTheme();
  const { logs, ready, syncStatus, forceSync } = useAppState();
  const { profile } = useAuth();

  if (!ready) {
    return (
      <Screen>
        <Body muted>Carregando seu plano de treino…</Body>
      </Screen>
    );
  }

  const slot = nextSlot(template, logs);
  if (!slot) {
    return (
      <Screen>
        <Label>{profile?.name ? `Olá, ${profile.name}` : trainer.name}</Label>
        <Title>Bloco concluído.</Title>
        <Body muted>
          Parabéns! Você completou todas as semanas deste bloco de periodização. Seu treinador está preparando o próximo plano.
        </Body>
        <Button title="Ver meu progresso" onPress={() => router.push('/progresso')} />
      </Screen>
    );
  }

  const session = template.sessions.find((s) => s.id === slot.sessionId)!;
  const openWorkout = () => router.push('/treino');

  const syncLabel = {
    synced: '● Nuvem sincronizada',
    syncing: '↻ Sincronizando...',
    pending: '○ Pendente de envio',
    offline: 'Modo local',
    error: '⚠ Falha na conexão',
  }[syncStatus];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label>{trainer.name}</Label>
        <Body
          muted
          style={{
            fontSize: 12,
            color: syncStatus === 'synced' ? '#10B981' : syncStatus === 'pending' ? '#F59E0B' : t.muted,
          } as any}
        >
          {syncLabel}
        </Body>
      </View>

      <Title>Hoje</Title>

      {shouldRest(logs, new Date()) && (
        <Card>
          <Label>Aviso de Recuperação</Label>
          <Body muted>
            Você concluiu seu último treino há menos de 24 horas. Descanso muscular também faz parte dos resultados — mas a decisão de treinar é sua.
          </Body>
        </Card>
      )}

      <Card onPress={openWorkout}>
        <Label>
          Semana {slot.weekN} de {template.weeks} · Fila Fluida
        </Label>
        <Title size={26}>{session.name}</Title>

        <View style={{ gap: 6, marginVertical: 4 }}>
          {session.items.map((item) => (
            <Body key={item.id} muted>
              • {exerciseById(item.exerciseId).name} — {item.sets} séries × {item.repMin}–{item.repMax} reps
            </Body>
          ))}
        </View>
      </Card>

      <Button title="Começar treino agora" onPress={openWorkout} />
    </Screen>
  );
}
