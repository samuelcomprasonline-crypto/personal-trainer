import { useState } from 'react';
import { View } from 'react-native';
import { getAssessmentsForStudent, getLatestAssessmentForStudent } from '../../src/data/assessmentStore';
import { exerciseById, samuelAssessment, template } from '../../src/data/seed';
import { consistency } from '../../src/domain/schedule';
import { useAppState } from '../../src/state/AppState';
import { useAuth } from '../../src/state/AuthContext';
import { AssessmentComparison } from '../../src/ui/AssessmentComparison';
import { AssessmentReport } from '../../src/ui/AssessmentReport';
import { AssessmentPhotoGallery } from '../../src/ui/AssessmentPhotoGallery';
import { Body, Card, Chip, CircularProgress, Label, Screen, Title } from '../../src/ui/components';
import { NutritionModule } from '../../src/ui/NutritionModule';
import { RecoveryModule } from '../../src/ui/RecoveryModule';
import { WorkoutHistoryView } from '../../src/ui/WorkoutHistoryView';
import { useTheme } from '../../src/ui/theme';

export default function Progresso() {
  const t = useTheme();
  const { logs } = useAppState();
  const { profile } = useAuth();
  const studentName = profile?.name || 'Samuel Ferreira';
  const studentAssessments = getAssessmentsForStudent(studentName);
  const currentAss = getLatestAssessmentForStudent(studentName);

  const [tab, setTab] = useState<'avaliacao' | 'comparativo' | 'fotos' | 'nutricao' | 'recuperacao' | 'treinos'>('avaliacao');
  const value = consistency(logs, template.sessions.length, new Date());
  const recent = [...logs]
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
    .slice(0, 10);

  // Dias da semana para o gráfico de frequência idêntico à foto 2
  const daysOfWeek = [
    { day: 'Seg', active: true, count: 1 },
    { day: 'Ter', active: true, count: 1 },
    { day: 'Qua', active: false, count: 0 },
    { day: 'Qui', active: true, count: 1 },
    { day: 'Sex', active: true, count: 1 },
    { day: 'Sáb', active: true, count: 1 },
    { day: 'Dom', active: false, count: 0 },
  ];

  return (
    <Screen>
      {/* 1. CABEÇALHO DE PROGRESSO (IDÊNTICO À FOTO 2) */}
      <View style={{ gap: 4, marginTop: 4 }}>
        <Label style={{ color: t.accent }}>Painel de Resultados & Biometria</Label>
        <Title size={28}>Seu Progresso</Title>
      </View>

      {/* 2. GRÁFICO DE BARRAS DE FREQUÊNCIA DA SEMANA (FOTO 2) */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Label>Frequência Semanal</Label>
            <Title size={22}>5 Treinos Realizados</Title>
          </View>
          <CircularProgress percentage={Math.round(value * 100) || 85} size={54} strokeWidth={6} />
        </View>

        {/* Barras em Verde Neon */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: 90,
            paddingTop: 10,
            paddingHorizontal: 8,
          }}
        >
          {daysOfWeek.map((d, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
              <View
                style={{
                  width: 14,
                  height: d.active ? 55 : 12,
                  borderRadius: 7,
                  backgroundColor: d.active ? t.accent : t.surfaceElevated,
                  shadowColor: d.active ? t.accent : 'transparent',
                  shadowOpacity: d.active ? 0.7 : 0,
                  shadowRadius: 8,
                }}
              />
              <Body muted style={{ fontSize: 11, color: d.active ? '#FFFFFF' : t.muted } as any}>
                {d.day}
              </Body>
            </View>
          ))}
        </View>
      </Card>

      {/* 3. CARDS DE CALORIAS E TEMPO ATIVO */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Card>
            <Label>Calorias Queimadas</Label>
            <Title size={20} style={{ color: '#FFFFFF', marginTop: 2 }}>
              🔥 2.350 kcal
            </Title>
            <Body muted style={{ fontSize: 11 } as any}>Meta semanal superada</Body>
          </Card>
        </View>

        <View style={{ flex: 1 }}>
          <Card>
            <Label>Tempo em Treino</Label>
            <Title size={20} style={{ color: t.accent, marginTop: 2 }}>
              ⏱ 4h 30m
            </Title>
            <Body muted style={{ fontSize: 11 } as any}>Semana fluida ativa</Body>
          </Card>
        </View>
      </View>

      {/* 4. SELETOR DE SEÇÕES EXPANDIDO (PADRÃO AMERICANO COMPLETO) */}
      <View style={{ flexDirection: 'row', gap: 6, marginVertical: 4, flexWrap: 'wrap' }}>
        <Chip
          label="Topografia 3D & Laudo"
          selected={tab === 'avaliacao'}
          onPress={() => setTab('avaliacao')}
        />
        <Chip
          label="📸 Comparativo Antes x Depois"
          selected={tab === 'comparativo'}
          onPress={() => setTab('comparativo')}
        />
        <Chip
          label="Fotos da Avaliação 📷"
          selected={tab === 'fotos'}
          onPress={() => setTab('fotos')}
        />
        <Chip
          label="Nutrição & Dieta"
          selected={tab === 'nutricao'}
          onPress={() => setTab('nutricao')}
        />
        <Chip
          label="Recuperação & Sono"
          selected={tab === 'recuperacao'}
          onPress={() => setTab('recuperacao')}
        />
        <Chip
          label="Histórico de Treinos"
          selected={tab === 'treinos'}
          onPress={() => setTab('treinos')}
        />
      </View>

      {tab === 'avaliacao' && (
        <AssessmentReport studentName={studentName} assessment={currentAss} />
      )}

      {tab === 'comparativo' && (
        <AssessmentComparison
          assessments={studentAssessments}
          studentName={studentName}
        />
      )}

      {tab === 'fotos' && (
        <AssessmentPhotoGallery photos={currentAss.photos} />
      )}

      {tab === 'nutricao' && (
        <NutritionModule />
      )}

      {tab === 'recuperacao' && (
        <RecoveryModule />
      )}

      {tab === 'treinos' && (
        <WorkoutHistoryView />
      )}
    </Screen>
  );
}
