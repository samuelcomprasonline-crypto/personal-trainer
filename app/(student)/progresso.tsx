import { useState } from 'react';
import { View } from 'react-native';
import { exerciseById, samuelAssessment, template } from '../../src/data/seed';
import { consistency } from '../../src/domain/schedule';
import { useAppState } from '../../src/state/AppState';
import { AssessmentReport } from '../../src/ui/AssessmentReport';
import { Body, Card, Chip, Label, Screen, Title } from '../../src/ui/components';

export default function Progresso() {
  const { logs } = useAppState();
  const [tab, setTab] = useState<'avaliacao' | 'treinos'>('avaliacao');
  const value = consistency(logs, template.sessions.length, new Date());
  const recent = [...logs]
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
    .slice(0, 10);

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Label>Painel de Resultados</Label>
        <Title size={32}>Evolução & Avaliações</Title>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 4 }}>
        <Chip
          label="Relatório de Avaliação Física"
          selected={tab === 'avaliacao'}
          onPress={() => setTab('avaliacao')}
        />
        <Chip
          label="Histórico de Treinos"
          selected={tab === 'treinos'}
          onPress={() => setTab('treinos')}
        />
      </View>

      {tab === 'avaliacao' ? (
        <AssessmentReport studentName="Samuel Ferreira" assessment={samuelAssessment} />
      ) : (
        <View style={{ gap: 16 }}>
          <Card>
            <Label>Consistência de Frequência</Label>
            <Title size={44}>{Math.round(value * 100)}%</Title>
            <Body muted>Nas últimas 4 semanas — metodologia de semana fluida sem penalidades.</Body>
          </Card>

          <Label>Histórico de Sessões</Label>
          {recent.length === 0 ? (
            <Card>
              <Body muted>Nenhum treino concluído ainda. Ao finalizar seu primeiro treino, o resumo de cargas e séries aparecerá aqui.</Body>
            </Card>
          ) : (
            recent.map((log) => {
              const session = template.sessions.find((s) => s.id === log.templateSessionId);
              return (
                <Card key={log.id}>
                  <Title size={20}>{session?.name ?? 'Treino Concluído'}</Title>
                  <Body muted>
                    {new Date(log.completedAt).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · Semana {log.weekN}
                    {log.rpe ? ` · Esforço (RPE): ${log.rpe}/10` : ''}
                    {log.mood ? ` · Humor: ${log.mood === 'great' ? 'Ótimo' : log.mood === 'ok' ? 'Bem' : 'Cansado'}` : ''}
                  </Body>

                  {log.sets.length > 0 && (
                    <Body muted>
                      {log.sets.length} séries registradas (ex: {exerciseById(log.sets[0].exerciseId).name} @ {log.sets[0].loadKg} kg)
                    </Body>
                  )}
                </Card>
              );
            })
          )}
        </View>
      )}
    </Screen>
  );
}
