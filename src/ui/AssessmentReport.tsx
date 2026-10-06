import { useState } from 'react';
import { View } from 'react-native';
import { assessmentHistory, samuelAssessment } from '../data/seed';
import type { BioimpedanceAssessment, PhysicalAssessment, SkinfoldsData } from '../domain/types';
import { AssessmentPhotoGallery } from './AssessmentPhotoGallery';
import { Body3DSegmentMap } from './Body3DSegmentMap';
import { Body, Button, Card, Chip, Label, Title } from './components';
import { EvolutionChart } from './EvolutionChart';
import { EvolutionComparison } from './EvolutionComparison';
import { useTheme } from './theme';

type TabView = 'mapa3d' | 'fotos' | 'bioimpedancia' | 'dobras' | 'evolucao';

function MetricBar({
  label,
  value,
  unit,
  min,
  max,
  status = 'normal',
}: {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  status?: 'abaixo' | 'normal' | 'acima' | 'excelente';
}) {
  const t = useTheme();

  const reference = max ? max * 1.3 : value * 1.3;
  const percentage = Math.min(100, Math.max(10, (value / reference) * 100));

  const statusColor =
    status === 'excelente'
      ? t.accent
      : status === 'acima'
      ? t.fatColor
      : status === 'abaixo'
      ? '#D97706'
      : t.waterColor;

  const statusLabel =
    status === 'excelente'
      ? 'Excelente'
      : status === 'acima'
      ? 'Acima da Média'
      : status === 'abaixo'
      ? 'Abaixo'
      : 'Padrão Ideal';

  return (
    <View style={{ gap: 4, marginVertical: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Body style={{ fontSize: 14, fontWeight: '600' } as any}>{label}</Body>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Title size={17} style={{ color: '#FFFFFF' }}>
            {value} {unit}
          </Title>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: `${statusColor}20`,
              borderWidth: 1,
              borderColor: `${statusColor}40`,
            }}
          >
            <Body style={{ color: statusColor, fontSize: 11, fontWeight: '700' } as any}>
              {statusLabel}
            </Body>
          </View>
        </View>
      </View>

      {/* Barra de Progresso com Cor Temática */}
      <View
        style={{
          height: 7,
          backgroundColor: t.surfaceElevated,
          borderRadius: 4,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: statusColor,
            borderRadius: 4,
          }}
        />
      </View>

      {min && max && (
        <Body muted style={{ fontSize: 11 } as any}>
          Faixa ideal: {min} – {max} {unit}
        </Body>
      )}
    </View>
  );
}

export function AssessmentReport({
  studentName = 'Samuel Ferreira',
  assessment = samuelAssessment,
}: {
  studentName?: string;
  assessment?: PhysicalAssessment;
}) {
  const t = useTheme();
  const [tab, setTab] = useState<TabView>('mapa3d');

  const bio = assessment.bioimpedance;
  const skin = assessment.skinfolds;
  const circ = assessment.circumferences;

  return (
    <View style={{ gap: 16 }}>
      {/* CABEÇALHO DO LAUDO */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <View>
            <Label style={{ color: t.accent }}>Laudo Biomecânico & Clínico</Label>
            <Title size={26}>{studentName}</Title>
          </View>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: `${t.accent}20`,
              borderWidth: 1,
              borderColor: `${t.accent}50`,
            }}
          >
            <Body style={{ color: t.accent, fontWeight: '700', fontSize: 13 } as any}>
              Bioimpedância 19/09/2026
            </Body>
          </View>
        </View>
        <Body muted style={{ fontSize: 13 } as any}>
          Equipamento: Balança Clínica Unique Health de Alta Precisão (8 eletrodos / multifrequencial).
        </Body>
      </Card>

      {/* SELETOR DE ABAS DO LAUDO */}
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Chip
          label="Topografia 3D"
          selected={tab === 'mapa3d'}
          onPress={() => setTab('mapa3d')}
        />
        <Chip
          label="Fotos Corporais"
          selected={tab === 'fotos'}
          onPress={() => setTab('fotos')}
        />
        <Chip
          label="Bioimpedância"
          selected={tab === 'bioimpedancia'}
          onPress={() => setTab('bioimpedancia')}
        />
        <Chip
          label="Dobras Cutâneas"
          selected={tab === 'dobras'}
          onPress={() => setTab('dobras')}
        />
        <Chip
          label="Gráficos & Evolução"
          selected={tab === 'evolucao'}
          onPress={() => setTab('evolucao')}
        />
      </View>

      {/* ABA 1: TOPOGRAFIA ANATÔMICA 3D SEGMENTAR */}
      {tab === 'mapa3d' && bio && <Body3DSegmentMap bio={bio} />}

      {/* ABA 2: FOTOS CORPORAIS EM ALTA RESOLUÇÃO */}
      {tab === 'fotos' && <AssessmentPhotoGallery photos={assessment.photos} />}

      {/* ABA 3: LAUDO CLÍNICO DE BIOIMPEDÂNCIA */}
      {tab === 'bioimpedancia' && bio && (
        <View style={{ gap: 14 }}>
          {/* Cartões Rápidos de Destaque */}
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 130 }}>
              <Card>
                <Label>Peso Atual</Label>
                <Title size={26} style={{ color: '#FFFFFF' }}>{bio.pesoKg} kg</Title>
                <Body muted style={{ fontSize: 12 } as any}>IMC: {bio.imc} ({bio.nivelObesidade})</Body>
              </Card>
            </View>

            <View style={{ flex: 1, minWidth: 130 }}>
              <Card>
                <Label style={{ color: t.fatColor }}>% Gordura</Label>
                <Title size={26} style={{ color: t.fatColor }}>{bio.percGordura}%</Title>
                <Body muted style={{ fontSize: 12 } as any}>{bio.massaGordaKg} kg de gordura</Body>
              </Card>
            </View>

            <View style={{ flex: 1, minWidth: 130 }}>
              <Card>
                <Label style={{ color: t.accent }}>Massa Muscular</Label>
                <Title size={26} style={{ color: t.accent }}>{bio.massaMuscularEsqueleticaKg} kg</Title>
                <Body muted style={{ fontSize: 12 } as any}>{bio.taxaMusculoEsqueleticoPerc}% do corpo</Body>
              </Card>
            </View>
          </View>

          <Card>
            <Title size={19}>Composição do Corpo Humano</Title>
            <MetricBar
              label="Água Corporal Total"
              value={bio.aguaTotalKg}
              unit="kg"
              min={bio.aguaTotalMin}
              max={bio.aguaTotalMax}
              status="excelente"
            />
            <MetricBar
              label="• Água Intracelular"
              value={bio.aguaIntracelularKg}
              unit="kg"
              min={bio.aguaIntracelularMin}
              max={bio.aguaIntracelularMax}
              status="excelente"
            />
            <MetricBar
              label="• Água Extracelular"
              value={bio.aguaExtracelularKg}
              unit="kg"
              min={bio.aguaExtracelularMin}
              max={bio.aguaExtracelularMax}
              status="excelente"
            />
            <MetricBar
              label="Massa Gorda"
              value={bio.massaGordaKg}
              unit="kg"
              min={bio.massaGordaMin}
              max={bio.massaGordaMax}
              status="acima"
            />
            <MetricBar
              label="Massa Proteica"
              value={bio.massaProteicaKg}
              unit="kg"
              min={bio.massaProteicaMin}
              max={bio.massaProteicaMax}
              status="excelente"
            />
            <MetricBar
              label="Minerais / Massa Óssea"
              value={bio.mineraisKg}
              unit="kg"
              min={bio.mineraisMin}
              max={bio.mineraisMax}
              status="excelente"
            />
          </Card>

          {/* Cartão de Parecer Profissional */}
          <Card>
            <Label style={{ color: t.accent }}>Parecer Técnico do Treinador</Label>
            <Body style={{ fontSize: 14, lineHeight: 22 } as any}>
              {assessment.notasProfissional}
            </Body>
          </Card>
        </View>
      )}

      {/* ABA 4: DOBRAS CUTÂNEAS */}
      {tab === 'dobras' && (
        <View style={{ gap: 14 }}>
          {skin && (
            <Card>
              <Title size={19}>Protocolo de Dobras Cutâneas (Pollock 7)</Title>
              <Body muted style={{ fontSize: 13 } as any}>
                Soma das 7 dobras: <Title size={16} style={{ color: t.accent }}>{skin.somaDobrasMm} mm</Title> · % Gordura Estimado: <Title size={16} style={{ color: t.fatColor }}>{skin.percGorduraEstimado}%</Title>
              </Body>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                {[
                  { label: 'Peitoral', val: skin.peitoralMm },
                  { label: 'Axilar Média', val: skin.axilarMediaMm },
                  { label: 'Subescapular', val: skin.subescapularMm },
                  { label: 'Tricipital', val: skin.tricipitalMm },
                  { label: 'Abdominal', val: skin.abdominalMm },
                  { label: 'Suprailíaca', val: skin.suprailiacaMm },
                  { label: 'Coxa', val: skin.coxaMm },
                ].map((d, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      minWidth: 100,
                      backgroundColor: t.surfaceElevated,
                      padding: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: t.border,
                    }}
                  >
                    <Label>{d.label}</Label>
                    <Title size={17} style={{ marginTop: 2 }}>{d.val} mm</Title>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {circ && (
            <Card>
              <Title size={19}>Perímetros e Circunferências (cm)</Title>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                {[
                  { label: 'Tórax', val: circ.toraxCm },
                  { label: 'Cintura', val: circ.cinturaCm },
                  { label: 'Abdômen', val: circ.abdomenCm },
                  { label: 'Quadril', val: circ.quadrilCm },
                  { label: 'Braço Contraído', val: circ.bracoContraidoCm },
                  { label: 'Braço Relaxado', val: circ.bracoRelaxadoCm },
                  { label: 'Coxa Medial', val: circ.coxaMedialCm },
                  { label: 'Panturrilha', val: circ.panturrilhaCm },
                ].map((c, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      minWidth: 110,
                      backgroundColor: t.surfaceElevated,
                      padding: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: t.border,
                    }}
                  >
                    <Label>{c.label}</Label>
                    <Title size={17} style={{ marginTop: 2 }}>{c.val} cm</Title>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>
      )}

      {/* ABA 5: EVOLUÇÃO E GRÁFICOS */}
      {tab === 'evolucao' && (
        <View style={{ gap: 14 }}>
          <EvolutionComparison />
          <EvolutionChart history={assessmentHistory} />
        </View>
      )}
    </View>
  );
}
