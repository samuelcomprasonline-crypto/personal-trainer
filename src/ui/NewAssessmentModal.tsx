import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { calculatePollock7 } from '../domain/assessment';
import type { BioimpedanceAssessment, PhysicalAssessment, SkinfoldsData } from '../domain/types';
import { Body, Button, Card, Chip, Label, Title } from './components';
import { useTheme } from './theme';

export function NewAssessmentModal({
  visible,
  studentName = 'Samuel Ferreira',
  onClose,
  onSave,
}: {
  visible: boolean;
  studentName?: string;
  onClose: () => void;
  onSave: (assessment: PhysicalAssessment) => void;
}) {
  const t = useTheme();
  const [activeTab, setActiveTab] = useState<'dobras' | 'bioimpedancia'>('dobras');

  // Estado das Dobras Cutâneas (mm)
  const [peitoral, setPeitoral] = useState('14');
  const [axilar, setAxilar] = useState('16');
  const [subescapular, setSubescapular] = useState('18');
  const [triceps, setTriceps] = useState('12');
  const [abdominal, setAbdominal] = useState('26');
  const [suprailiaca, setSuprailiaca] = useState('20');
  const [coxa, setCoxa] = useState('18');

  // Estado Perímetros (cm)
  const [torax, setTorax] = useState('108');
  const [cintura, setCintura] = useState('88');
  const [quadril, setQuadril] = useState('104');
  const [braco, setBraco] = useState('39');

  // Estado Bioimpedância
  const [peso, setPeso] = useState('91.2');
  const [altura, setAltura] = useState('177');
  const [idade, setIdade] = useState('37');
  const [percGorduraBio, setPercGorduraBio] = useState('21.2');
  const [musculoEsqueleticoBio, setMusculoEsqueleticoBio] = useState('41.3');
  const [visceralBio, setVisceralBio] = useState('8');
  const [aguaBio, setAguaBio] = useState('52.6');
  const [notas, setNotas] = useState('Avaliação periódica de controle de sobrecarga e composição corporal.');

  // Cálculo ao vivo de Dobras
  const numP = Number(peitoral) || 0;
  const numAx = Number(axilar) || 0;
  const numSub = Number(subescapular) || 0;
  const numTri = Number(triceps) || 0;
  const numAbd = Number(abdominal) || 0;
  const numSup = Number(suprailiaca) || 0;
  const numCox = Number(coxa) || 0;
  const numIdade = Number(idade) || 30;

  const pollockResult =
    numP && numAx && numSub && numTri && numAbd && numSup && numCox
      ? calculatePollock7(
          {
            peitoralMm: numP,
            axilarMediaMm: numAx,
            subescapularMm: numSub,
            tricipitalMm: numTri,
            abdominalMm: numAbd,
            suprailiacaMm: numSup,
            coxaMm: numCox,
          },
          numIdade,
          'M',
        )
      : null;

  const handleSave = () => {
    const dataHoraStr = new Date().toLocaleString('pt-BR');
    const newAss: PhysicalAssessment = {
      id: `assessment-${Date.now()}`,
      studentId: 'previa',
      trainerId: 'trainer-aurora',
      data: new Date().toISOString(),
      skinfolds: {
        protocolo: 'pollock_7',
        peitoralMm: numP,
        axilarMediaMm: numAx,
        subescapularMm: numSub,
        tricipitalMm: numTri,
        abdominalMm: numAbd,
        suprailiacaMm: numSup,
        coxaMm: numCox,
        somaDobrasMm: pollockResult?.somaMm,
        densidadeCorporal: pollockResult?.densidadeCorporal,
        percGorduraEstimado: pollockResult?.percGordura,
      },
      circumferences: {
        toraxCm: Number(torax) || undefined,
        cinturaCm: Number(cintura) || undefined,
        quadrilCm: Number(quadril) || undefined,
        bracoContraidoCm: Number(braco) || undefined,
      },
      bioimpedance: {
        dataHora: dataHoraStr,
        pesoKg: Number(peso) || 90,
        alturaCm: Number(altura) || 175,
        idade: numIdade,
        sexo: 'M',
        pontuacaoFisica: 88,
        avaliacaoSaude: 'Bom',
        aguaTotalKg: Number(aguaBio) || 50,
        aguaTotalMin: 38.7,
        aguaTotalMax: 47.3,
        aguaIntracelularKg: 33,
        aguaIntracelularMin: 24,
        aguaIntracelularMax: 29,
        aguaExtracelularKg: 19,
        aguaExtracelularMin: 14,
        aguaExtracelularMax: 18,
        massaGordaKg: Number(((Number(peso) * (Number(percGorduraBio) || 20)) / 100).toFixed(1)),
        massaGordaMin: 8.3,
        massaGordaMax: 16.6,
        percGordura: Number(percGorduraBio) || 20,
        percGorduraMin: 10,
        percGorduraMax: 20,
        massaProteicaKg: 14.5,
        massaProteicaMin: 10.3,
        massaProteicaMax: 12.6,
        mineraisKg: 4.8,
        mineraisMin: 3.5,
        mineraisMax: 4.3,
        massaOsseaKg: 3.8,
        massaOsseaMin: 3.0,
        massaOsseaMax: 3.7,
        massaCelularCorporalKg: 47.0,
        massaCelularMin: 34.4,
        massaCelularMax: 42.0,
        massaLivreGorduraKg: 72.0,
        massaLivreMin: 50.3,
        massaLivreMax: 62.6,
        massaMuscularTotalKg: 67.0,
        massaMuscularMin: 49.7,
        massaMuscularMax: 68.3,
        massaMuscularEsqueleticaKg: Number(musculoEsqueleticoBio) || 40,
        massaMuscularEsqueleticaMin: 29.5,
        massaMuscularEsqueleticaMax: 36.1,
        taxaMusculoEsqueleticoPerc: 45.0,
        taxaMusculoEsqueleticoMin: 32.3,
        taxaMusculoEsqueleticoMax: 39.5,
        imc: Number((Number(peso) / Math.pow(Number(altura) / 100, 2)).toFixed(1)),
        imcMin: 18.5,
        imcMax: 25.0,
        bmrKcal: 1920,
        bmrMin: 1877,
        bmrMax: 2212,
        ingestaoCaloricaRecomendadaKcal: 2500,
        adiposidadePerc: 130,
        relacaoProteicaPerc: 15.5,
        relacaoCinturaQuadril: Number(((Number(cintura) || 88) / (Number(quadril) || 104)).toFixed(2)),
        gorduraVisceralNivel: Number(visceralBio) || 7,
        gorduraSubcutaneaKg: 17.0,
        relacaoGorduraSubcutaneaPerc: 18.5,
        idadeCorporal: 42,
        pesoPadraoKg: 84.5,
        controlePesoKg: -6.5,
        controleGorduraKg: -6.5,
        controleMuscularKg: 0,
        pesoIdealKg: 70,
        nivelObesidade: 'Sobrepeso',
        tipoCorpoGordura: 'Sobrepeso',
        tipoCorpoMusculo: 'Padrão / Excelente',
        tipoCorpoClassificacao: 'Tipo muscular acima do peso',
        segmentar: {
          gordura: {
            bracoEsquerdo: { kg: 1.2, proporcaoPadraoPerc: 200 },
            bracoDireito: { kg: 1.2, proporcaoPadraoPerc: 200 },
            tronco: { kg: 10.0, proporcaoPadraoPerc: 230 },
            pernaEsquerda: { kg: 2.6, proporcaoPadraoPerc: 150 },
            pernaDireita: { kg: 2.6, proporcaoPadraoPerc: 150 },
          },
          musculo: {
            bracoEsquerdo: { kg: 3.8, proporcaoPadraoPerc: 108 },
            bracoDireito: { kg: 3.7, proporcaoPadraoPerc: 105 },
            tronco: { kg: 31.5, proporcaoPadraoPerc: 110 },
            pernaEsquerda: { kg: 11.4, proporcaoPadraoPerc: 115 },
            pernaDireita: { kg: 11.6, proporcaoPadraoPerc: 117 },
          },
        },
      },
      notasProfissional: notas,
    };

    onSave(newAss);
    onClose();
  };

  const inputStyle = {
    backgroundColor: t.surface,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: t.text,
    fontFamily: t.fonts.body,
    fontSize: 16,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 60,
            gap: 16,
            maxWidth: 680,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Label>Novo Registro</Label>
              <Title size={26}>Avaliação Física</Title>
              <Body muted>Aluno: {studentName}</Body>
            </View>

            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Body muted>✕ Fechar</Body>
            </Pressable>
          </View>

          {/* SELETOR DE ABA */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip
              label="📏 Dobras Cutâneas (Pollock 7)"
              selected={activeTab === 'dobras'}
              onPress={() => setActiveTab('dobras')}
            />
            <Chip
              label="⚡ Dados da Balança"
              selected={activeTab === 'bioimpedancia'}
              onPress={() => setActiveTab('bioimpedancia')}
            />
          </View>

          {/* ABA DOBRAS CUTÂNEAS */}
          {activeTab === 'dobras' && (
            <View style={{ gap: 14 }}>
              <Card>
                <Title size={20}>Medições das 7 Dobras (mm)</Title>
                <Body muted>Insira os valores do adipômetro em milímetros:</Body>

                <View style={{ gap: 10, marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Peitoral (mm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={peitoral} onChangeText={setPeitoral} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Axilar Média (mm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={axilar} onChangeText={setAxilar} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Subescapular (mm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={subescapular} onChangeText={setSubescapular} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Tricipital (mm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={triceps} onChangeText={setTriceps} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Abdominal (mm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={abdominal} onChangeText={setAbdominal} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Suprailíaca (mm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={suprailiaca} onChangeText={setSuprailiaca} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Coxa (mm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={coxa} onChangeText={setCoxa} />
                  </View>
                </View>

                {/* RESULTADO AO VIVO */}
                {pollockResult && (
                  <View style={{ marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: `${t.accent}12`, borderWidth: 1, borderColor: `${t.accent}30`, gap: 4 }}>
                    <Label>Cálculo em Tempo Real (Jackson & Pollock)</Label>
                    <Title size={20}>% Gordura: <Title size={22} style={{ color: t.accent } as any}>{pollockResult.percGordura}%</Title></Title>
                    <Body muted>Soma das Dobras: {pollockResult.somaMm} mm · Densidade: {pollockResult.densidadeCorporal} g/cm³</Body>
                  </View>
                )}
              </Card>

              <Card>
                <Title size={20}>Perímetros Corporais (cm)</Title>
                <View style={{ gap: 10, marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Tórax (cm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={torax} onChangeText={setTorax} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Cintura (cm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={cintura} onChangeText={setCintura} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Quadril (cm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={quadril} onChangeText={setQuadril} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}><Body>Braço (cm)</Body></View>
                    <TextInput style={[inputStyle, { width: 90 }]} keyboardType="numeric" value={braco} onChangeText={setBraco} />
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* ABA BIOIMPEDÂNCIA */}
          {activeTab === 'bioimpedancia' && (
            <Card>
              <Title size={20}>Parâmetros da Balança de Bioimpedância</Title>
              <View style={{ gap: 12, marginTop: 10 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body muted>Peso (kg)</Body>
                    <TextInput style={inputStyle} keyboardType="numeric" value={peso} onChangeText={setPeso} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body muted>Altura (cm)</Body>
                    <TextInput style={inputStyle} keyboardType="numeric" value={altura} onChangeText={setAltura} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body muted>Idade</Body>
                    <TextInput style={inputStyle} keyboardType="numeric" value={idade} onChangeText={setIdade} />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body muted>% Gordura Balança</Body>
                    <TextInput style={inputStyle} keyboardType="numeric" value={percGorduraBio} onChangeText={setPercGorduraBio} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body muted>Músculo Esquelético (kg)</Body>
                    <TextInput style={inputStyle} keyboardType="numeric" value={musculoEsqueleticoBio} onChangeText={setMusculoEsqueleticoBio} />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body muted>Gordura Visceral (1~9)</Body>
                    <TextInput style={inputStyle} keyboardType="numeric" value={visceralBio} onChangeText={setVisceralBio} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body muted>Água Corporal (kg)</Body>
                    <TextInput style={inputStyle} keyboardType="numeric" value={aguaBio} onChangeText={setAguaBio} />
                  </View>
                </View>
              </View>
            </Card>
          )}

          <Card>
            <Title size={18}>Parecer Técnico do Treinador</Title>
            <TextInput
              style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
              multiline
              value={notas}
              onChangeText={setNotas}
              placeholder="Digite orientações e metas da periodização..."
              placeholderTextColor={t.muted}
            />
          </Card>

          <Button title="Salvar e Registrar Avaliação" onPress={handleSave} />
          <Button title="Cancelar" variant="ghost" onPress={onClose} />
        </ScrollView>
      </View>
    </Modal>
  );
}
