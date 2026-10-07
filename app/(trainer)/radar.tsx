import { Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { exercises, otherStudents, template, trainer } from '../../src/data/seed';
import { buildRadar, snapshotFromLogs, type RadarKind } from '../../src/domain/radar';
import { useAppState } from '../../src/state/AppState';
import { Body, Card, Label, Screen, Title } from '../../src/ui/components';
import { useTheme } from '../../src/ui/theme';

const KIND_CONFIG: Record<RadarKind, { label: string; icon: string; color: string }> = {
  video: { label: 'Vídeo para Avaliação', icon: '📹', color: '#3B82F6' },
  adherence: { label: 'Aderência Abaixo de 50%', icon: '⚠️', color: '#EF4444' },
  stalled: { label: 'Carga Estagnada', icon: '⚖️', color: '#F59E0B' },
  rpe: { label: 'Esforço Crítico (RPE 9+)', icon: '🔥', color: '#EC4899' },
};

const exerciseNames = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

export default function Radar() {
  const t = useTheme();
  const { logs } = useAppState();
  const me = snapshotFromLogs('previa', 'Samuel Ferreira', logs, template.sessions.length, new Date(), exerciseNames);
  const items = buildRadar([me, ...otherStudents]);

  return (
    <Screen>
      <View style={{ gap: 4, marginTop: 4 }}>
        <Label style={{ color: t.accent }}>{trainer.name} • Inteligência Operacional</Label>
        <Title size={28}>Radar de Alunos</Title>
        <Body muted style={{ fontSize: 13 } as any}>
          Alertas automatizados por prioridade: vídeos de execução pendentes, risco de evasão e platôs de força.
        </Body>
      </View>

      {/* Card de Onboarding Rápido do Treinador (3 Passos) */}
      <View
        style={{
          backgroundColor: '#141824',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(198, 244, 50, 0.25)',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18 }}>🚀</Text>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                Guia Rápido de Configuração da Consultoria
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                Passos essenciais para começar a faturar e gerenciar seus alunos
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(198, 244, 50, 0.15)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: '#C6F432', fontSize: 11, fontWeight: '800' }}>
              2 / 3 Concluídos
            </Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {/* Passo 1 */}
          <Pressable
            onPress={() => router.push('/financeiro')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#0E121B',
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              opacity: pressed ? 0.8 : 1,
              gap: 10,
            })}
          >
            <Text style={{ fontSize: 16 }}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                1. Chave Pix & Planos Financeiros
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                Configurada: pix@aurorafit.com.br • Mensalidade: R$ 180/mês
              </Text>
            </View>
            <Text style={{ color: '#C6F432', fontSize: 11, fontWeight: '700' }}>Editar ↗</Text>
          </Pressable>

          {/* Passo 2 */}
          <Pressable
            onPress={() => router.push('/alunos')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#0E121B',
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              opacity: pressed ? 0.8 : 1,
              gap: 10,
            })}
          >
            <Text style={{ fontSize: 16 }}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                2. Convidar Aluno via Link ou WhatsApp
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                4 alunos ativos na base com credenciais de acesso
              </Text>
            </View>
            <Text style={{ color: '#C6F432', fontSize: 11, fontWeight: '700' }}>Convidar ↗</Text>
          </Pressable>

          {/* Passo 3 */}
          <Pressable
            onPress={() => router.push('/prescrever-dieta')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#0E121B',
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(198, 244, 50, 0.3)',
              opacity: pressed ? 0.8 : 1,
              gap: 10,
            })}
          >
            <Text style={{ fontSize: 16 }}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#C6F432', fontSize: 13, fontWeight: '800' }}>
                3. Prescrever Treino e Dieta Completa
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                Importe treinos em texto livre ou gere protocolos hipertróficos
              </Text>
            </View>
            <Text style={{ color: '#C6F432', fontSize: 11, fontWeight: '800' }}>Prescrever ↗</Text>
          </Pressable>
        </View>
      </View>

      {/* Cartões de Métricas do Radar */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Card>
            <Label>Alertas Ativos</Label>
            <Title size={22} style={{ color: t.accent, marginTop: 2 }}>
              {items.length} Casos
            </Title>
            <Body muted style={{ fontSize: 11 } as any}>Triagem prioritária</Body>
          </Card>
        </View>

        <View style={{ flex: 1 }}>
          <Card>
            <Label>Alunos Ativos</Label>
            <Title size={22} style={{ color: '#FFFFFF', marginTop: 2 }}>
              4 Alunos
            </Title>
            <Body muted style={{ fontSize: 11 } as any}>Base da consultoria</Body>
          </Card>
        </View>
      </View>

      {/* Lista de Alertas do Radar */}
      <View style={{ gap: 10, marginTop: 4 }}>
        {items.length === 0 ? (
          <Card>
            <Title size={20}>Tudo em dia!</Title>
            <Body muted>Nenhum aluno em risco de evasão ou estagnado no momento.</Body>
          </Card>
        ) : (
          items.map((item, index) => {
            const conf = KIND_CONFIG[item.kind];
            return (
              <Card key={`${item.kind}-${item.studentId}-${item.refId ?? index}`}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{conf.icon}</Text>
                    <Label style={{ color: conf.color }}>{conf.label}</Label>
                  </View>
                  <View
                    style={{
                      backgroundColor: `${conf.color}15`,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: `${conf.color}40`,
                    }}
                  >
                    <Body style={{ color: conf.color, fontSize: 11, fontWeight: '700' } as any}>
                      Prioridade {index + 1}
                    </Body>
                  </View>
                </View>

                <Title size={18} style={{ marginTop: 2 }}>{item.label}</Title>
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}
