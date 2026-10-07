import React from 'react';
import { Text, View, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { exercises, otherStudents, template, trainer } from '../../src/data/seed';
import { buildRadar, snapshotFromLogs, type RadarKind } from '../../src/domain/radar';
import { useAppState } from '../../src/state/AppState';
import { Body, Card, Label, Screen, Title, Button } from '../../src/ui/components';
import { useTheme } from '../../src/ui/theme';

const KIND_CONFIG: Record<RadarKind, { label: string; icon: string; color: string; action: string }> = {
  video: { label: 'Vídeo para Avaliação', icon: '📹', color: '#3B82F6', action: 'Avaliar Execução' },
  adherence: { label: 'Aderência Abaixo de 50%', icon: '⚠️', color: '#EF4444', action: 'Enviar WhatsApp' },
  stalled: { label: 'Carga Estagnada', icon: '⚖️', color: '#F59E0B', action: 'Ajustar Periodização' },
  rpe: { label: 'Esforço Crítico (RPE 9+)', icon: '🔥', color: '#EC4899', action: 'Reduzir Volume' },
};

const exerciseNames = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

export default function Radar() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const { logs } = useAppState();

  const me = snapshotFromLogs('previa', 'Samuel Ferreira', logs, template.sessions.length, new Date(), exerciseNames);
  const items = buildRadar([me, ...otherStudents]);

  const studentsOverview = [
    { name: 'Samuel Ferreira', status: 'Treino A Concluído', plan: 'Trimestral', tag: 'VIP' },
    { name: 'Beatriz Lima', status: 'Aderência Baixa (42%)', plan: 'Mensal', tag: 'Atenção' },
    { name: 'Carlos Mendes', status: 'Carga Estagnada (Supino)', plan: 'Semestral', tag: 'Ajustar' },
    { name: 'Alex', status: 'Strength Score 89 (Excelente)', plan: 'Mensal', tag: 'Top' },
  ];

  return (
    <Screen>
      {/* 1. CABEÇALHO DO RADAR */}
      <View style={{ gap: 4, marginTop: 4 }}>
        <Label style={{ color: t.accent }}>{trainer.name} • Inteligência Operacional & Triagem</Label>
        <Title size={28}>Radar de Alunos & Centro de Comando</Title>
        <Body muted style={{ fontSize: 13 } as any}>
          Alertas automatizados por prioridade: vídeos de execução pendentes, risco de evasão e atalho rápido de prescrição.
        </Body>
      </View>

      {/* 2. BARRA DE CARDS KPI SUPERIOR (4 COLUNAS EM DEGRADÊ) */}
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Card style={{ backgroundColor: '#141824', borderWidth: 1, borderColor: 'rgba(198, 244, 50, 0.25)' }}>
            <Label style={{ color: t.accent }}>ALERTAS ATIVOS</Label>
            <Title size={24} style={{ color: t.accent, marginTop: 2 }}>
              {items.length} Casos
            </Title>
            <Body muted style={{ fontSize: 11 } as any}>Triagem de urgência hoje</Body>
          </Card>
        </View>

        <View style={{ flex: 1 }}>
          <Card style={{ backgroundColor: '#141824', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Label>ALUNOS ATIVOS</Label>
            <Title size={24} style={{ color: '#FFFFFF', marginTop: 2 }}>
              4 Alunos
            </Title>
            <Body muted style={{ fontSize: 11 } as any}>Base da consultoria</Body>
          </Card>
        </View>

        <View style={{ flex: 1 }}>
          <Card style={{ backgroundColor: '#141824', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Label>FATURAMENTO MÊS</Label>
            <Title size={24} style={{ color: '#C6F432', marginTop: 2 }}>
              R$ 1.000,00
            </Title>
            <Body muted style={{ fontSize: 11 } as any}>100% mensalidades pagas</Body>
          </Card>
        </View>

        <View style={{ flex: 1 }}>
          <Card style={{ backgroundColor: '#141824', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Label>RETENÇÃO MÉDIA</Label>
            <Title size={24} style={{ color: '#00F0FF', marginTop: 2 }}>
              94%
            </Title>
            <Body muted style={{ fontSize: 11 } as any}>Engajamento nos treinos</Body>
          </Card>
        </View>
      </View>

      {/* 3. LAYOUT PRINCIPAL MULTICOLUNAS (ESQUERDA: ALERTAS & PRESCRIÇÃO | DIREITA: ALUNOS & AÇÕES) */}
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16 }}>
        {/* COLUNA ESQUERDA (60%) */}
        <View style={{ flex: isWide ? 1.4 : 1, gap: 16 }}>
          {/* Card de Destaque: Prescrição Ágil com 1 Clique */}
          <View
            style={{
              backgroundColor: '#141824',
              borderRadius: 18,
              padding: 18,
              borderWidth: 1,
              borderColor: 'rgba(198, 244, 50, 0.3)',
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 20 }}>⚡</Text>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                    Central de Prescrição & Dieta Rápida
                  </Text>
                  <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                    Prescreva periodizações completas ou dietas com cálculo de macros
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Prescrever Treino & Dieta 360° ⚡"
                  onPress={() => router.navigate('/prescrever-dieta')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Central de Metodologia 📚"
                  variant="ghost"
                  onPress={() => router.navigate('/biblioteca')}
                />
              </View>
            </View>
          </View>

          {/* Lista de Alertas Operacionais de Alta Prioridade */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                Casos que Demandam sua Atenção Hoje
              </Text>
              <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>
                {items.length} pendências
              </Text>
            </View>

            {items.map((item, index) => {
              const conf = KIND_CONFIG[item.kind];
              return (
                <Card
                  key={`${item.kind}-${item.studentId}-${item.refId ?? index}`}
                  onPress={() => router.navigate('/alunos')}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 18 }}>{conf.icon}</Text>
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

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                      Clique para abrir prontuário do aluno ({item.studentId})
                    </Text>
                    <Text style={{ color: conf.color, fontSize: 12, fontWeight: '800' }}>
                      {conf.action} ↗
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        {/* COLUNA DIREITA (40%) */}
        <View style={{ flex: isWide ? 1 : 1, gap: 16 }}>
          {/* Card: Prontuário Rápido dos Alunos da Consultoria */}
          <View
            style={{
              backgroundColor: '#141824',
              borderRadius: 18,
              padding: 18,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                  Alunos da Consultoria
                </Text>
                <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                  Status dos treinos em tempo real
                </Text>
              </View>
              <Pressable
                onPress={() => router.navigate('/alunos')}
                style={{ paddingVertical: 4 }}
              >
                <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>Ver Todos (4) ↗</Text>
              </Pressable>
            </View>

            <View style={{ gap: 8 }}>
              {studentsOverview.map((st, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => router.navigate('/alunos')}
                  style={({ pressed }) => ({
                    backgroundColor: '#0E121B',
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <View style={{ gap: 2 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                      {st.name}
                    </Text>
                    <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                      {st.status}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(198, 244, 50, 0.15)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: t.accent, fontSize: 10, fontWeight: '800' }}>
                      {st.tag}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Card: Fluxo Financeiro & Mensalidades */}
          <View
            style={{
              backgroundColor: '#141824',
              borderRadius: 18,
              padding: 18,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                  Financeiro & Cobrança Pix
                </Text>
                <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                  Chave: pix@aurorafit.com.br
                </Text>
              </View>
              <Pressable
                onPress={() => router.navigate('/financeiro')}
                style={{ paddingVertical: 4 }}
              >
                <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>Gerenciar ↗</Text>
              </Pressable>
            </View>

            <View style={{ backgroundColor: '#0E121B', padding: 12, borderRadius: 12, gap: 4 }}>
              <Text style={{ color: '#8E9AA8', fontSize: 11 }}>Previsão de Recebimento este Mês:</Text>
              <Text style={{ color: '#C6F432', fontSize: 20, fontWeight: '900' }}>
                R$ 1.000,00
              </Text>
              <Text style={{ color: '#8E9AA8', fontSize: 10 }}>
                4 mensalidades ativas • 0 inadimplentes
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}
