import { useState } from 'react';
import { Platform, View } from 'react-native';
import { assessmentHistory, samuelAssessment } from '../data/seed';
import type { BioimpedanceAssessment, SkinfoldsData } from '../domain/types';
import { Body, Button, Card, Chip, Label, Title } from './components';
import { EvolutionChart } from './EvolutionChart';
import { EvolutionComparison } from './EvolutionComparison';
import { useTheme } from './theme';

type TabView = 'bioimpedancia' | 'dobras' | 'segmentar' | 'evolucao';

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
      ? '#2E7D32'
      : status === 'acima'
      ? t.accent
      : status === 'abaixo'
      ? '#D97706'
      : '#3B82F6';

  const statusLabel =
    status === 'excelente'
      ? 'Excelente'
      : status === 'acima'
      ? 'Elevado'
      : status === 'abaixo'
      ? 'Abaixo'
      : 'Padrão';

  return (
    <View style={{ gap: 4, marginVertical: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Body>{label}</Body>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Title size={18}>
            {value} {unit}
          </Title>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: `${statusColor}22`,
            }}
          >
            <Body muted style={{ color: statusColor, fontSize: 12, fontWeight: '600' } as any}>
              {statusLabel}
            </Body>
          </View>
        </View>
      </View>

      <View
        style={{
          height: 7,
          backgroundColor: t.border,
          borderRadius: 4,
          overflow: 'hidden',
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

      {min !== undefined && max !== undefined && (
        <Body muted style={{ fontSize: 12 } as any}>
          Faixa de referência recomendada: {min} ~ {max} {unit}
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
  assessment?: typeof samuelAssessment;
}) {
  const t = useTheme();
  const [activeTab, setActiveTab] = useState<TabView>('bioimpedancia');
  const bio = assessment.bioimpedance as BioimpedanceAssessment;
  const dobras = assessment.skinfolds as SkinfoldsData;
  const circ = assessment.circumferences;

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <View style={{ gap: 16, width: '100%' }}>
      {/* CABEÇALHO DO LAUDO */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Label>Relatório de Composição Humana</Label>
            <Title size={26}>{studentName}</Title>
            <Body muted>
              {bio.dataHora} · {bio.idade} anos · {bio.alturaCm} cm
            </Body>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                backgroundColor: `${t.accent}15`,
                borderWidth: 1,
                borderColor: `${t.accent}40`,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Label>Pontuação Física</Label>
              <Title size={32} style={{ color: t.accent } as any}>
                {bio.pontuacaoFisica}
              </Title>
              <Body muted style={{ fontSize: 13, textTransform: 'capitalize' } as any}>
                {bio.avaliacaoSaude}
              </Body>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button title="📄 Imprimir Laudo / Exportar PDF" variant="ghost" onPress={handlePrint} />
        </View>
      </Card>

      {/* SELETOR DE ABAS */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip
          label="⚡ Bioimpedância"
          selected={activeTab === 'bioimpedancia'}
          onPress={() => setActiveTab('bioimpedancia')}
        />
        <Chip
          label="📏 Dobras & Perímetros"
          selected={activeTab === 'dobras'}
          onPress={() => setActiveTab('dobras')}
        />
        <Chip
          label="🧬 Análise Segmentar"
          selected={activeTab === 'segmentar'}
          onPress={() => setActiveTab('segmentar')}
        />
        <Chip
          label="📈 Evolução & Comparativo"
          selected={activeTab === 'evolucao'}
          onPress={() => setActiveTab('evolucao')}
        />
      </View>

      {/* ABA 1: BIOIMPEDÂNCIA COMPLETA */}
      {activeTab === 'bioimpedancia' && (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <View style={{ flex: 1, minWidth: 140 }}>
              <Card>
                <Label>Peso Corporal</Label>
                <Title size={26}>{bio.pesoKg} kg</Title>
                <Body muted>{bio.nivelObesidade}</Body>
              </Card>
            </View>

            <View style={{ flex: 1, minWidth: 140 }}>
              <Card>
                <Label>% Gordura</Label>
                <Title size={26}>{bio.percGordura}%</Title>
                <Body muted>{bio.massaGordaKg} kg de gordura</Body>
              </Card>
            </View>

            <View style={{ flex: 1, minWidth: 140 }}>
              <Card>
                <Label>Músculo Esquelético</Label>
                <Title size={26} style={{ color: '#2E7D32' } as any}>
                  {bio.massaMuscularEsqueleticaKg} kg
                </Title>
                <Body muted>{bio.taxaMusculoEsqueleticoPerc}% do corpo</Body>
              </Card>
            </View>

            <View style={{ flex: 1, minWidth: 140 }}>
              <Card>
                <Label>Taxa Metabólica</Label>
                <Title size={26}>{bio.bmrKcal} kcal</Title>
                <Body muted>Dieta: {bio.ingestaoCaloricaRecomendadaKcal} kcal</Body>
              </Card>
            </View>
          </View>

          <Card>
            <Title size={20}>Composição do Corpo Humano</Title>
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
              status="normal"
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

          <Card>
            <Title size={20}>Situação Musculoesquelética & Metabolismo</Title>
            <MetricBar
              label="Massa Muscular Total"
              value={bio.massaMuscularTotalKg}
              unit="kg"
              min={bio.massaMuscularMin}
              max={bio.massaMuscularMax}
              status="normal"
            />
            <MetricBar
              label="Massa Muscular Esquelética"
              value={bio.massaMuscularEsqueleticaKg}
              unit="kg"
              min={bio.massaMuscularEsqueleticaMin}
              max={bio.massaMuscularEsqueleticaMax}
              status="excelente"
            />
            <MetricBar
              label="IMC (Índice de Massa Corporal)"
              value={bio.imc}
              unit="kg/m²"
              min={bio.imcMin}
              max={bio.imcMax}
              status="acima"
            />
            <MetricBar
              label="Gordura Visceral"
              value={bio.gorduraVisceralNivel}
              unit="nível"
              min={1}
              max={9}
              status="normal"
            />
            <MetricBar
              label="Massa Livre de Gordura"
              value={bio.massaLivreGorduraKg}
              unit="kg"
              min={bio.massaLivreMin}
              max={bio.massaLivreMax}
              status="excelente"
            />
          </Card>

          <Card>
            <Title size={20}>Recomendações de Metas do Treinador</Title>
            <Body muted>
              Diretrizes de recomposição corporal sugeridas pelo algoritmo bioelétrico:
            </Body>
            <View style={{ gap: 8, marginTop: 8 }}>
              <Body>• Peso Padrão Recomendado: <Title size={16}>{bio.pesoPadraoKg} kg</Title></Body>
              <Body>• Controle de Gordura Alvo: <Title size={16} style={{ color: t.accent } as any}>{bio.controleGorduraKg} kg</Title></Body>
              <Body>• Controle de Massa Muscular: <Title size={16} style={{ color: '#2E7D32' } as any}>+0.0 kg (preservação total)</Title></Body>
              <Body>• Idade Biológica / Metabólica: <Title size={16}>{bio.idadeCorporal} anos</Title></Body>
              <Body>• Classificação de Tipo Corporal: <Title size={16}>{bio.tipoCorpoClassificacao}</Title></Body>
            </View>
          </Card>
        </View>
      )}

      {/* ABA 2: DOBRAS CUTÂNEAS & PERÍMETROS */}
      {activeTab === 'dobras' && (
        <View style={{ gap: 16 }}>
          <Card>
            <Label>Protocolo Jackson & Pollock (7 Dobras)</Label>
            <Title size={22}>Dobras Cutâneas em Milímetros (mm)</Title>
            <Body muted>Medição antropométrica com adipômetro científico:</Body>

            <View style={{ gap: 10, marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: t.border, paddingBottom: 6 }}>
                <Body>Dobra Peitoral</Body>
                <Title size={16}>{dobras.peitoralMm} mm</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: t.border, paddingBottom: 6 }}>
                <Body>Dobra Axilar Média</Body>
                <Title size={16}>{dobras.axilarMediaMm} mm</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: t.border, paddingBottom: 6 }}>
                <Body>Dobra Subescapular</Body>
                <Title size={16}>{dobras.subescapularMm} mm</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: t.border, paddingBottom: 6 }}>
                <Body>Dobra Tricipital</Body>
                <Title size={16}>{dobras.tricipitalMm} mm</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: t.border, paddingBottom: 6 }}>
                <Body>Dobra Abdominal</Body>
                <Title size={16}>{dobras.abdominalMm} mm</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: t.border, paddingBottom: 6 }}>
                <Body>Dobra Suprailíaca</Body>
                <Title size={16}>{dobras.suprailiacaMm} mm</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: t.border, paddingBottom: 6 }}>
                <Body>Dobra da Coxa</Body>
                <Title size={16}>{dobras.coxaMm} mm</Title>
              </View>
            </View>

            <View style={{ marginTop: 14, padding: 14, borderRadius: 12, backgroundColor: `${t.accent}10`, gap: 4 }}>
              <Body>• Soma das 7 Dobras: <Title size={16}>{dobras.somaDobrasMm} mm</Title></Body>
              <Body>• Densidade Corporal Calculada: <Title size={16}>{dobras.densidadeCorporal} g/cm³</Title></Body>
              <Body>• % de Gordura Estimado (Equação de Siri): <Title size={16} style={{ color: t.accent } as any}>{dobras.percGorduraEstimado}%</Title></Body>
            </View>
          </Card>

          {circ && (
            <Card>
              <Label>Antropometria</Label>
              <Title size={22}>Perímetros & Circunferências (cm)</Title>
              <View style={{ gap: 8, marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Body>Tórax</Body>
                  <Title size={16}>{circ.toraxCm} cm</Title>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Body>Cintura</Body>
                  <Title size={16}>{circ.cinturaCm} cm</Title>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Body>Abdômen</Body>
                  <Title size={16}>{circ.abdomenCm} cm</Title>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Body>Quadril</Body>
                  <Title size={16}>{circ.quadrilCm} cm</Title>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Body>Braço Contraído / Relaxado</Body>
                  <Title size={16}>{circ.bracoContraidoCm} / {circ.bracoRelaxadoCm} cm</Title>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Body>Coxa Medial</Body>
                  <Title size={16}>{circ.coxaMedialCm} cm</Title>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Body>Panturrilha</Body>
                  <Title size={16}>{circ.panturrilhaCm} cm</Title>
                </View>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* ABA 3: ANÁLISE SEGMENTAR */}
      {activeTab === 'segmentar' && (
        <View style={{ gap: 16 }}>
          <Card>
            <Label>Topografia Corporal</Label>
            <Title size={22}>Músculo por Segmento</Title>
            <Body muted>Distribuição de massa muscular nos membros e tronco:</Body>

            <View style={{ gap: 10, marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Braço Esquerdo</Body>
                <Title size={16}>{bio.segmentar.musculo.bracoEsquerdo.kg} kg ({bio.segmentar.musculo.bracoEsquerdo.proporcaoPadraoPerc}%)</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Braço Direito</Body>
                <Title size={16}>{bio.segmentar.musculo.bracoDireito.kg} kg ({bio.segmentar.musculo.bracoDireito.proporcaoPadraoPerc}%)</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Tronco</Body>
                <Title size={16} style={{ color: '#2E7D32' } as any}>{bio.segmentar.musculo.tronco.kg} kg ({bio.segmentar.musculo.tronco.proporcaoPadraoPerc}%)</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Perna Esquerda</Body>
                <Title size={16}>{bio.segmentar.musculo.pernaEsquerda.kg} kg ({bio.segmentar.musculo.pernaEsquerda.proporcaoPadraoPerc}%)</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Perna Direita</Body>
                <Title size={16}>{bio.segmentar.musculo.pernaDireita.kg} kg ({bio.segmentar.musculo.pernaDireita.proporcaoPadraoPerc}%)</Title>
              </View>
            </View>
          </Card>

          <Card>
            <Label>Topografia Corporal</Label>
            <Title size={22}>Gordura por Segmento</Title>
            <Body muted>Depósitos de gordura subcutânea segmentar:</Body>

            <View style={{ gap: 10, marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Braço Esquerdo</Body>
                <Title size={16}>{bio.segmentar.gordura.bracoEsquerdo.kg} kg ({bio.segmentar.gordura.bracoEsquerdo.proporcaoPadraoPerc}%)</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Braço Direito</Body>
                <Title size={16}>{bio.segmentar.gordura.bracoDireito.kg} kg ({bio.segmentar.gordura.bracoDireito.proporcaoPadraoPerc}%)</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Tronco</Body>
                <Title size={16} style={{ color: t.accent } as any}>{bio.segmentar.gordura.tronco.kg} kg ({bio.segmentar.gordura.tronco.proporcaoPadraoPerc}%)</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Perna Esquerda</Body>
                <Title size={16}>{bio.segmentar.gordura.pernaEsquerda.kg} kg ({bio.segmentar.gordura.pernaEsquerda.proporcaoPadraoPerc}%)</Title>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Body>Perna Direita</Body>
                <Title size={16}>{bio.segmentar.gordura.pernaDireita.kg} kg ({bio.segmentar.gordura.pernaDireita.proporcaoPadraoPerc}%)</Title>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* ABA 4: HISTÓRICO, GRÁFICO & COMPARATIVO */}
      {activeTab === 'evolucao' && (
        <View style={{ gap: 16 }}>
          {/* CURVA DE TENDÊNCIA EM SVG */}
          <EvolutionChart history={assessmentHistory} />

          {/* ANÁLISE COMPARATIVA ANTES X DEPOIS */}
          <EvolutionComparison />

          {/* TABELA DE SESSÕES */}
          <Card>
            <Label>História da Composição Corporal</Label>
            <Title size={20}>Linha do Tempo de Pesagens</Title>
            <View style={{ gap: 10, marginTop: 10 }}>
              {assessmentHistory.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: t.bg,
                    borderWidth: 1,
                    borderColor: t.border,
                    gap: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title size={16}>{item.data}</Title>
                    <Title size={16}>{item.pesoKg} kg</Title>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Body muted>Músculo Esquelético: {item.musculoEsqueleticoKg} kg</Body>
                    <Body muted>% Gordura: {item.percGordura}%</Body>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* PARECER TÉCNICO */}
      {assessment.notasProfissional && (
        <Card>
          <Label>Parecer do Treinador</Label>
          <Body>{assessment.notasProfissional}</Body>
        </Card>
      )}
    </View>
  );
}
