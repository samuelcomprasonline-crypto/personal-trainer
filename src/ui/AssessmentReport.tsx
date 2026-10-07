import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getAssessmentsForStudent, saveOrUpdateAssessment, updateAssessmentPhotos, updateBioimpedanceData } from '../data/assessmentStore';
import { assessmentHistory, samuelAssessment } from '../data/seed';
import type { AssessmentPhotos, BioimpedanceAssessment, PhysicalAssessment, SkinfoldsData } from '../domain/types';
import { AssessmentComparison } from './AssessmentComparison';
import { AssessmentPhotoGallery } from './AssessmentPhotoGallery';
import { AssessmentPrintModal } from './AssessmentPrintModal';
import { AssessmentUploadModal } from './AssessmentUploadModal';
import { Body3DSegmentMap } from './Body3DSegmentMap';
import { Body, Button, Card, Chip, Label, TextInputField, Title } from './components';
import { EvolutionChart } from './EvolutionChart';
import { EvolutionComparison } from './EvolutionComparison';
import { colors, radius, spacing, useTheme } from './theme';

type TabView = 'mapa3d' | 'fotos' | 'comparativo' | 'bioimpedancia' | 'dobras' | 'evolucao';
type BioSubTab = 'laudo' | 'manual' | 'upload';

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
  studentId,
  assessment: initialAssessment,
  initialTab = 'mapa3d',
  onAssessmentChange,
}: {
  studentName?: string;
  studentId?: string;
  assessment?: PhysicalAssessment;
  initialTab?: TabView;
  onAssessmentChange?: (updated: PhysicalAssessment) => void;
}) {
  const t = useTheme();
  const [tab, setTab] = useState<TabView>(initialTab);
  const [bioSubTab, setBioSubTab] = useState<BioSubTab>('laudo');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carrega todas as avaliações conectadas a este aluno
  const [studentAssessments, setStudentAssessments] = useState<PhysicalAssessment[]>(() => {
    const list = getAssessmentsForStudent(studentName || studentId || 'Samuel Ferreira');
    if (initialAssessment && !list.some((a) => a.id === initialAssessment.id)) {
      return [...list, initialAssessment];
    }
    return list;
  });

  const [activeAssessmentId, setActiveAssessmentId] = useState<string>(() => {
    if (initialAssessment) return initialAssessment.id;
    return studentAssessments[studentAssessments.length - 1]?.id || samuelAssessment.id;
  });

  const currentAssessment =
    studentAssessments.find((a) => a.id === activeAssessmentId) ||
    studentAssessments[studentAssessments.length - 1] ||
    samuelAssessment;

  const bio = currentAssessment.bioimpedance;
  const skin = currentAssessment.skinfolds;
  const circ = currentAssessment.circumferences;

  // Estado dos inputs no Modo Manual da Balança
  const [manualPeso, setManualPeso] = useState(String(bio?.pesoKg || '91.2'));
  const [manualPercGordura, setManualPercGordura] = useState(String(bio?.percGordura || '21.2'));
  const [manualMassaMuscular, setManualMassaMuscular] = useState(String(bio?.massaMuscularEsqueleticaKg || '38.7'));
  const [manualAgua, setManualAgua] = useState(String(bio?.aguaTotalKg || '52.6'));
  const [manualVisceral, setManualVisceral] = useState(String(bio?.gorduraVisceralNivel || '8'));
  const [manualBmr, setManualBmr] = useState(String(bio?.bmrKcal || '1785'));
  const [manualAltura, setManualAltura] = useState(String(bio?.alturaCm || '177'));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmData = (extracted: {
    pesoKg: number;
    percGordura: number;
    massaMuscularEsqueleticaKg: number;
    aguaTotalKg: number;
    massaLivreGorduraKg: number;
  }) => {
    if (!bio) return;
    const updatedBio: BioimpedanceAssessment = {
      ...bio,
      pesoKg: extracted.pesoKg,
      percGordura: extracted.percGordura,
      massaMuscularEsqueleticaKg: extracted.massaMuscularEsqueleticaKg,
      massaMuscularTotalKg: Math.round(extracted.massaMuscularEsqueleticaKg * 1.55 * 10) / 10,
      aguaTotalKg: extracted.aguaTotalKg,
      massaLivreGorduraKg: extracted.massaLivreGorduraKg,
      massaGordaKg: Math.round((extracted.pesoKg * extracted.percGordura) / 10) / 10,
    };

    const updatedAssessment: PhysicalAssessment = {
      ...currentAssessment,
      bioimpedance: updatedBio,
    };

    saveOrUpdateAssessment(updatedAssessment);
    setStudentAssessments((prev) =>
      prev.map((a) => (a.id === updatedAssessment.id ? updatedAssessment : a))
    );

    // Atualiza campos manuais também
    setManualPeso(String(extracted.pesoKg));
    setManualPercGordura(String(extracted.percGordura));
    setManualMassaMuscular(String(extracted.massaMuscularEsqueleticaKg));
    setManualAgua(String(extracted.aguaTotalKg));

    if (onAssessmentChange) onAssessmentChange(updatedAssessment);
    showToast('Dados da balança lidos e sincronizados com sucesso!');
    setBioSubTab('laudo');
  };

  const handleSaveManualBio = () => {
    if (!bio) return;
    const pesoNum = parseFloat(manualPeso.replace(',', '.')) || bio.pesoKg;
    const gorduraNum = parseFloat(manualPercGordura.replace(',', '.')) || bio.percGordura;
    const musculoNum = parseFloat(manualMassaMuscular.replace(',', '.')) || bio.massaMuscularEsqueleticaKg;
    const aguaNum = parseFloat(manualAgua.replace(',', '.')) || bio.aguaTotalKg;
    const visceralNum = parseInt(manualVisceral, 10) || bio.gorduraVisceralNivel;
    const bmrNum = parseInt(manualBmr, 10) || bio.bmrKcal;
    const alturaNum = parseFloat(manualAltura.replace(',', '.')) || bio.alturaCm;

    const alturaMetros = alturaNum / 100;
    const novoImc = Math.round((pesoNum / (alturaMetros * alturaMetros)) * 10) / 10;
    const novaMassaGorda = Math.round(((pesoNum * gorduraNum) / 100) * 10) / 10;

    const updatedBio: BioimpedanceAssessment = {
      ...bio,
      pesoKg: pesoNum,
      alturaCm: alturaNum,
      percGordura: gorduraNum,
      massaMuscularEsqueleticaKg: musculoNum,
      massaMuscularTotalKg: Math.round(musculoNum * 1.55 * 10) / 10,
      aguaTotalKg: aguaNum,
      gorduraVisceralNivel: visceralNum,
      bmrKcal: bmrNum,
      imc: novoImc,
      massaGordaKg: novaMassaGorda,
      dataHora: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
    };

    const updatedAssessment: PhysicalAssessment = {
      ...currentAssessment,
      bioimpedance: updatedBio,
    };

    saveOrUpdateAssessment(updatedAssessment);
    setStudentAssessments((prev) =>
      prev.map((a) => (a.id === updatedAssessment.id ? updatedAssessment : a))
    );

    if (onAssessmentChange) onAssessmentChange(updatedAssessment);
    showToast('Dados manuais da balança salvos com sucesso!');
    setBioSubTab('laudo');
  };

  const handleUpdatePhotos = (assessmentId: string, updatedPhotos: AssessmentPhotos) => {
    updateAssessmentPhotos(assessmentId, updatedPhotos);
    setStudentAssessments((prev) =>
      prev.map((a) => (a.id === assessmentId ? { ...a, photos: updatedPhotos } : a))
    );
    showToast('Fotos da avaliação atualizadas com sucesso!');
  };

  const activeDateFormatted =
    currentAssessment.photos?.data || new Date(currentAssessment.data).toLocaleDateString('pt-BR');

  return (
    <View style={{ gap: 16 }}>
      {/* CABEÇALHO DO LAUDO CONECTADO AO ALUNO */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <View>
            <Label style={{ color: t.accent }}>Prontuário de Avaliação Biomecânica</Label>
            <Title size={26}>{studentName}</Title>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
                Avaliação: {activeDateFormatted}
              </Body>
            </View>

            <Button
              title="📄 Balança (PDF/Foto)"
              onPress={() => setShowUploadModal(true)}
              variant="neonOutline"
            />

            <Button
              title="📥 Laudo em PDF 🖨️"
              onPress={() => setShowPrintModal(true)}
              variant="primary"
            />
          </View>
        </View>

        {/* SELETOR DE HISTÓRICO DE AVALIAÇÕES DO ALUNO */}
        {studentAssessments.length > 1 && (
          <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: t.border }}>
            <Label style={{ marginBottom: 4 }}>Histórico de Avaliações Registradas deste Aluno:</Label>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {studentAssessments.map((a) => {
                const isSelected = a.id === activeAssessmentId;
                const d = a.photos?.data || new Date(a.data).toLocaleDateString('pt-BR');
                const p = a.bioimpedance?.pesoKg ? `${a.bioimpedance.pesoKg}kg` : '';
                return (
                  <Chip
                    key={a.id}
                    label={`${d} (${p})`}
                    selected={isSelected}
                    onPress={() => {
                      setActiveAssessmentId(a.id);
                      if (a.bioimpedance) {
                        setManualPeso(String(a.bioimpedance.pesoKg));
                        setManualPercGordura(String(a.bioimpedance.percGordura));
                        setManualMassaMuscular(String(a.bioimpedance.massaMuscularEsqueleticaKg));
                        setManualAgua(String(a.bioimpedance.aguaTotalKg));
                      }
                    }}
                  />
                );
              })}
            </View>
          </View>
        )}

        {toastMessage && (
          <View
            style={{
              backgroundColor: 'rgba(198, 244, 50, 0.15)',
              padding: 10,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: t.accent,
              marginTop: 8,
            }}
          >
            <Body style={{ color: t.accent, fontWeight: '700', fontSize: 13 } as any}>
              ✓ {toastMessage}
            </Body>
          </View>
        )}

        <Body muted style={{ fontSize: 12, marginTop: 4 } as any}>
          Equipamento: Balança Clínica de Bioimpedância Multifrequencial (8 eletrodos) · Dados vinculados ao aluno.
        </Body>
      </Card>

      {/* MODAL DE OCR DA BALANÇA */}
      <AssessmentUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirmData={handleConfirmData}
      />

      {/* MODAL DE IMPRESSÃO / EXPORTAÇÃO DE LAUDO EM PDF */}
      <AssessmentPrintModal
        visible={showPrintModal}
        studentName={studentName}
        assessment={currentAssessment}
        onClose={() => setShowPrintModal(false)}
      />

      {/* SELETOR DE ABAS PRINCIPAIS DO LAUDO */}
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Chip
          label="Topografia 3D"
          selected={tab === 'mapa3d'}
          onPress={() => setTab('mapa3d')}
        />
        <Chip
          label="Fotos da Avaliação"
          selected={tab === 'fotos'}
          onPress={() => setTab('fotos')}
        />
        <Chip
          label="📸 Comparativo Antes x Depois"
          selected={tab === 'comparativo'}
          onPress={() => setTab('comparativo')}
        />
        <Chip
          label="Dados da Balança (Bioimpedância)"
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

      {/* ABA 1: TOPOGRAFIA 3D */}
      {tab === 'mapa3d' && bio && <Body3DSegmentMap bio={bio} />}

      {/* ABA 2: FOTOS DA AVALIAÇÃO COM UPLOAD */}
      {tab === 'fotos' && (
        <AssessmentPhotoGallery
          photos={currentAssessment.photos}
          onPhotosUpdate={(updatedPhotos) => handleUpdatePhotos(currentAssessment.id, updatedPhotos)}
        />
      )}

      {/* ABA 3: COMPARATIVO ANTES X DEPOIS ENTRE CADA AVALIAÇÃO */}
      {tab === 'comparativo' && (
        <AssessmentComparison
          assessments={studentAssessments}
          studentName={studentName}
          onUpdateAssessmentPhotos={handleUpdatePhotos}
        />
      )}

      {/* ABA 4: DADOS DA BALANÇA (COM SUB-ABAS MANUAL VS PDF/FOTO) */}
      {tab === 'bioimpedancia' && bio && (
        <View style={{ gap: 14 }}>
          {/* Seletor entre Visão do Laudo, Edição Manual ou Leitura por Imagem/PDF */}
          <Card>
            <Label style={{ color: t.accent }}>Forma de Entrada dos Dados da Balança</Label>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <Chip
                label="📊 Visão do Laudo"
                selected={bioSubTab === 'laudo'}
                onPress={() => setBioSubTab('laudo')}
              />
              <Chip
                label="✍️ Inserção / Edição Manual"
                selected={bioSubTab === 'manual'}
                onPress={() => setBioSubTab('manual')}
              />
              <Chip
                label="📄 Leitura Automática (PDF / Foto)"
                selected={bioSubTab === 'upload'}
                onPress={() => setBioSubTab('upload')}
              />
            </View>
          </Card>

          {/* SUB-ABA: MODO MANUAL DE PREENCHIMENTO */}
          {bioSubTab === 'manual' && (
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title size={20}>✍️ Edição Manual dos Dados da Balança</Title>
                <Body muted style={{ fontSize: 12 } as any}>Altere os valores e salve</Body>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <TextInputField
                    label="Peso Corporal (kg) *"
                    value={manualPeso}
                    onChangeText={setManualPeso}
                    keyboardType="numeric"
                    placeholder="91.2"
                  />
                </View>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <TextInputField
                    label="% Gordura Corporal (%) *"
                    value={manualPercGordura}
                    onChangeText={setManualPercGordura}
                    keyboardType="numeric"
                    placeholder="21.2"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <TextInputField
                    label="Massa Muscular Esquelética (kg) *"
                    value={manualMassaMuscular}
                    onChangeText={setManualMassaMuscular}
                    keyboardType="numeric"
                    placeholder="38.7"
                  />
                </View>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <TextInputField
                    label="Água Corporal Total (kg) *"
                    value={manualAgua}
                    onChangeText={setManualAgua}
                    keyboardType="numeric"
                    placeholder="52.6"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <TextInputField
                    label="Gordura Visceral (Nível) *"
                    value={manualVisceral}
                    onChangeText={setManualVisceral}
                    keyboardType="numeric"
                    placeholder="8"
                  />
                </View>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <TextInputField
                    label="Taxa Metabólica Basal BMR (kcal)"
                    value={manualBmr}
                    onChangeText={setManualBmr}
                    keyboardType="numeric"
                    placeholder="1785"
                  />
                </View>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <TextInputField
                    label="Altura do Aluno (cm)"
                    value={manualAltura}
                    onChangeText={setManualAltura}
                    keyboardType="numeric"
                    placeholder="177"
                  />
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Button
                  title="💾 Salvar Dados Manuais da Balança"
                  onPress={handleSaveManualBio}
                />
              </View>
            </Card>
          )}

          {/* SUB-ABA: MODO UPLOAD INTELIGENTE */}
          {bioSubTab === 'upload' && (
            <Card>
              <Title size={20}>📄 Leitura Inteligente por PDF ou Foto da Balança</Title>
              <Body muted style={{ fontSize: 13, marginTop: 4 } as any}>
                Carregue o arquivo PDF exportado ou uma foto nítida do visor da balança de bioimpedância (InBody, Unique Health, Xiaomi, Tanita). Nosso sistema extrai todos os valores e preenche o laudo automaticamente!
              </Body>

              <View style={{ marginTop: 12, gap: 8 }}>
                <Button
                  title="Abrir Leitor de PDF / Foto da Balança ⚡"
                  onPress={() => setShowUploadModal(true)}
                />
              </View>
            </Card>
          )}

          {/* SUB-ABA: LAUDO COMPLETO */}
          {bioSubTab === 'laudo' && (
            <>
              {/* Cartões Rápidos */}
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

              {/* Composição Corporal */}
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

              {/* Parecer Profissional */}
              <Card>
                <Label style={{ color: t.accent }}>Parecer Técnico do Treinador</Label>
                <Body style={{ fontSize: 14, lineHeight: 22 } as any}>
                  {currentAssessment.notasProfissional || 'Avaliação biométrica regular realizada com sucesso.'}
                </Body>
              </Card>
            </>
          )}
        </View>
      )}

      {/* ABA 5: DOBRAS CUTÂNEAS */}
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

      {/* ABA 6: EVOLUÇÃO E GRÁFICOS */}
      {tab === 'evolucao' && (
        <View style={{ gap: 14 }}>
          <EvolutionComparison />
          <EvolutionChart history={assessmentHistory} />
        </View>
      )}
    </View>
  );
}
