import React from 'react';
import { Linking, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { exercises, otherStudents, template, trainer } from '../../src/data/seed';
import { buildRadar, snapshotFromLogs } from '../../src/domain/radar';
import { useAppState } from '../../src/state/AppState';
import { Screen } from '../../src/ui/components';

function Sparkline({ color }: { color: string }) {
  return (
    <View style={{ width: 38, height: 18 }}>
      <Svg width="38" height="18" viewBox="0 0 38 18">
        <Path
          d="M 2 13 Q 10 4, 18 10 T 36 3"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />
        <Circle cx="36" cy="3" r="2.2" fill={color} />
      </Svg>
    </View>
  );
}

const exerciseNames = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

export default function Radar() {
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const { logs } = useAppState();

  const me = snapshotFromLogs('previa', 'Samuel Ferreira', logs, template.sessions.length, new Date(), exerciseNames);
  const items = buildRadar([me, ...otherStudents]);

  const studentsOverview = [
    { name: 'Samuel Ferreira', status: 'Treino A Concluído', tag: 'VIP', avatarColor: '#10B981', initial: 'SF' },
    { name: 'Beatriz Lima', status: 'Aderência Baixa (42%)', tag: 'Atenção', avatarColor: '#EF4444', initial: 'BL' },
    { name: 'Carlos Mendes', status: 'Carga Estagnada (Supino)', tag: 'Ajustar', avatarColor: '#F59E0B', initial: 'CM' },
    { name: 'Alex', status: 'Strength Score 89 (Excelente)', tag: 'Top', avatarColor: '#38BDF8', initial: 'AL' },
  ];

  const handleOpenWhatsApp = (studentName: string) => {
    const text = encodeURIComponent(`Olá ${studentName}, tudo bem? Notei sua baixa aderência aos treinos essa semana no Aurora Studio. Como posso te ajudar a ajustar a rotina?`);
    Linking.openURL(`https://wa.me/5511999999999?text=${text}`).catch(() => {
      // Fallback
    });
  };

  const cardBg = '#0D0E12';
  const cardBorder = 'rgba(255, 255, 255, 0.07)';
  const neonLime = '#10B981';

  return (
    <Screen>
      <View style={{ gap: 24, width: '100%' }}>
        {/* CABEÇALHO DO RADAR & CENTRO DE COMANDO */}
        <View style={{ gap: 4 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.4 }}>
            Radar de Alunos & Centro de Comando
          </Text>
          <Text style={{ color: '#8E9AA8', fontSize: 13, fontWeight: '500' }}>
            Alertas automatizados por prioridade: vídeos de execução pendentes, risco de evasão e atalho rápido de prescrição.
          </Text>
        </View>

        {/* 4 CARDS HORIZONTAIS DE MÉTRICAS KPI ULTRA-MINIMALISTAS */}
        <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 12 }}>
          {/* Alertas Ativos */}
          <View
            style={{
              flex: 1,
              backgroundColor: cardBg,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.25)',
              justifyContent: 'space-between',
              minHeight: 92,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#EF4444', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                ALERTAS ATIVOS
              </Text>
              <Sparkline color="#EF4444" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>
                1 Casos
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 11 }}>urgência hoje</Text>
            </View>
          </View>

          {/* Alunos Ativos */}
          <View
            style={{
              flex: 1,
              backgroundColor: cardBg,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: cardBorder,
              justifyContent: 'space-between',
              minHeight: 92,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#8E9AA8', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                ALUNOS ATIVOS
              </Text>
              <Sparkline color="#8E9AA8" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>
                4 Alunos
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 11 }}>base total</Text>
            </View>
          </View>

          {/* Faturamento Mês */}
          <View
            style={{
              flex: 1,
              backgroundColor: cardBg,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(16, 185, 129, 0.25)',
              justifyContent: 'space-between',
              minHeight: 92,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#10B981', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                FATURAMENTO MÊS
              </Text>
              <Sparkline color="#10B981" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>
                R$ 1.000,00
              </Text>
              <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '600' }}>100% em dia</Text>
            </View>
          </View>

          {/* Retenção Média */}
          <View
            style={{
              flex: 1,
              backgroundColor: cardBg,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: cardBorder,
              justifyContent: 'space-between',
              minHeight: 92,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#38BDF8', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                RETENÇÃO MÉDIA
              </Text>
              <Sparkline color="#38BDF8" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>
                94%
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 11 }}>engajamento</Text>
            </View>
          </View>
        </View>

        {/* ESTRUTURA PRINCIPAL: COLUNA 2 (MEIO - ALERTAS & AÇÃO) E COLUNA 3 (DIREITA - GESTÃO) */}
        <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 20 }}>
          {/* COLUNA 2 (WIDER MAIN CORE - 62%) */}
          <View style={{ flex: isWide ? 1.55 : 1, gap: 20 }}>
            {/* CENTRAL DE PRESCRIÇÃO & DIETA RÁPIDA */}
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: cardBorder,
                gap: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    borderWidth: 1,
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>⚡</Text>
                </View>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                    Central de Prescrição & Dieta Rápida
                  </Text>
                  <Text style={{ color: '#8E9AA8', fontSize: 11.5 }}>
                    Prescreva periodizações completas ou dietas com cálculo automático de macros
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 10 }}>
                <Pressable
                  onPress={() => router.navigate('/prescrever-dieta')}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: neonLime,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    opacity: pressed ? 0.9 : 1,
                    shadowColor: neonLime,
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                  })}
                >
                  <Text style={{ color: '#0A0E14', fontSize: 13, fontWeight: '800' }}>
                    Prescrever Treino & Dieta 360°
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.navigate('/biblioteca')}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: '#D1D5DB', fontSize: 13, fontWeight: '700' }}>
                    Central de Metodologia
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* CASOS QUE DEMANDAM SUA ATENÇÃO (DESTAQUE PARA SAMUEL FERREIRA) */}
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>
                  Casos que Demandam sua Atenção
                </Text>
                <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '700' }}>
                  1 alerta crítico
                </Text>
              </View>

              {/* Card de Atenção de Samuel Ferreira com Red Priority Tag e CTA WhatsApp */}
              <View
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  gap: 12,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {/* Avatar Redondo */}
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: '#1E2533',
                        borderWidth: 1.5,
                        borderColor: '#EF4444',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>SF</Text>
                    </View>
                    <View>
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                        Samuel Ferreira
                      </Text>
                      <Text style={{ color: '#8E9AA8', fontSize: 11 }}>
                        Aderência Semanal: 42% (Abaixo de 50%)
                      </Text>
                    </View>
                  </View>

                  {/* Red Priority Tag */}
                  <View
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <Text style={{ color: '#EF4444', fontSize: 10.5, fontWeight: '700' }}>
                      Prioridade Alta
                    </Text>
                  </View>
                </View>

                <Text style={{ color: '#9CA3AF', fontSize: 12.5, lineHeight: 18 }}>
                  O aluno não registrou 2 treinos prescritos nos últimos 5 dias. Envie um lembrete direto ou ajuste o volume semanal.
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                  <Pressable
                    onPress={() => router.navigate('/alunos')}
                    style={{ paddingHorizontal: 12, paddingVertical: 7 }}
                  >
                    <Text style={{ color: '#8E9AA8', fontSize: 12, fontWeight: '600' }}>
                      Ver Prontuário ↗
                    </Text>
                  </Pressable>

                  {/* Botão WhatsApp com Ícone de Seta */}
                  <Pressable
                    onPress={() => handleOpenWhatsApp('Samuel Ferreira')}
                    style={({ pressed }) => ({
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      borderWidth: 1,
                      borderColor: 'rgba(16, 185, 129, 0.35)',
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 13 }}>💬</Text>
                    <Text style={{ color: neonLime, fontSize: 12, fontWeight: '800' }}>
                      Enviar WhatsApp →
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* COLUNA 3 (RIGHT SIDEBAR - MANAGEMENT - 38%) */}
          <View style={{ flex: isWide ? 1 : 1, gap: 18 }}>
            {/* ALUNOS DA CONSULTORIA COM AVATARES CIRCULARES E TAGS PILL */}
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: cardBorder,
                gap: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                  Alunos da Consultoria
                </Text>
                <Pressable onPress={() => router.navigate('/alunos')}>
                  <Text style={{ color: neonLime, fontSize: 11, fontWeight: '700' }}>
                    Ver Todos (4) ↗
                  </Text>
                </Pressable>
              </View>

              <View style={{ gap: 8 }}>
                {studentsOverview.map((st, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => router.navigate('/alunos')}
                    style={({ pressed }) => ({
                      backgroundColor: '#0F131D',
                      borderRadius: 12,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.04)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      {/* Avatar Circular */}
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: '#161B26',
                          borderWidth: 1,
                          borderColor: st.avatarColor,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: st.avatarColor, fontSize: 11, fontWeight: '800' }}>
                          {st.initial}
                        </Text>
                      </View>
                      <View style={{ gap: 1 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' }}>
                          {st.name}
                        </Text>
                        <Text style={{ color: '#6B7280', fontSize: 10.5 }}>
                          {st.status}
                        </Text>
                      </View>
                    </View>

                    {/* Tag em Pílula de Baixo Contraste */}
                    <View
                      style={{
                        backgroundColor: `${st.avatarColor}15`,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: `${st.avatarColor}35`,
                      }}
                    >
                      <Text style={{ color: st.avatarColor, fontSize: 9.5, fontWeight: '800' }}>
                        {st.tag}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* CARD FINANCEIRO & COBRANÇA PIX */}
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: cardBorder,
                gap: 12,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' }}>
                  Financeiro & Cobrança Pix
                </Text>
                <Pressable
                  onPress={() => router.navigate('/financeiro')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: '#D1D5DB', fontSize: 10.5, fontWeight: '600' }}>
                    Gerenciar
                  </Text>
                </Pressable>
              </View>

              <View
                style={{
                  backgroundColor: '#0F131D',
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.04)',
                  gap: 4,
                }}
              >
                <Text style={{ color: '#6B7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Mensalidades Recebidas Este Mês
                </Text>
                <Text style={{ color: neonLime, fontSize: 20, fontWeight: '900' }}>
                  R$ 1.000,00
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 10.5 }}>
                  4 de 4 alunos com plano ativo • 0 pendências
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}
