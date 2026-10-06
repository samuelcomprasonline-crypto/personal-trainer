import { exercises, otherStudents, template, trainer } from '../../src/data/seed';
import { buildRadar, snapshotFromLogs, type RadarKind } from '../../src/domain/radar';
import { useAppState } from '../../src/state/AppState';
import { Body, Card, Label, Screen, Title } from '../../src/ui/components';

const KIND_LABEL: Record<RadarKind, string> = {
  video: 'Vídeo para Avaliação',
  adherence: 'Aderência Baixa',
  stalled: 'Carga Estagnada',
  rpe: 'Esforço Crítico (RPE 9+)',
};

const exerciseNames = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

export default function Radar() {
  const { logs } = useAppState();
  const me = snapshotFromLogs('previa', 'Aluno da prévia', logs, template.sessions.length, new Date(), exerciseNames);
  const items = buildRadar([me, ...otherStudents]);

  return (
    <Screen>
      <Label>{trainer.name} · Painel</Label>
      <Title>Radar do Treinador</Title>
      <Body muted>
        Lista de atenção prioritária em tempo real: vídeos pendentes, queda de consistência e estagnação de cargas.
      </Body>

      {items.length === 0 ? (
        <Card>
          <Title size={20}>Tudo em dia!</Title>
          <Body muted>Nenhum aluno em risco de evasão ou estagnado no momento.</Body>
        </Card>
      ) : (
        items.map((item, index) => (
          <Card key={`${item.kind}-${item.studentId}-${item.refId ?? index}`}>
            <Label>{KIND_LABEL[item.kind]}</Label>
            <Body>{item.label}</Body>
          </Card>
        ))
      )}
    </Screen>
  );
}
