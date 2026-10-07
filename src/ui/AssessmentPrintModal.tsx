import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PhysicalAssessment } from '../domain/types';
import { Body, Button, Card, Label, Title } from './components';
import { colors, radius, spacing, useTheme } from './theme';

export function AssessmentPrintModal({
  visible,
  studentName,
  assessment,
  onClose,
}: {
  visible: boolean;
  studentName: string;
  assessment: PhysicalAssessment;
  onClose: () => void;
}) {
  const t = useTheme();
  const bio = assessment.bioimpedance;
  const circ = assessment.circumferences;
  const skin = assessment.skinfolds;
  const photos = assessment.photos;

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0A0E13' }}>
        {/* Barra Superior de Ações (Oculta na impressão) */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: '#1E293B',
            backgroundColor: '#121820',
          }}
        >
          <Pressable onPress={onClose} style={{ padding: 6 }}>
            <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: '600' }}>← Voltar</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Button
              title="🖨️ Salvar em PDF / Imprimir"
              onPress={handlePrint}
            />
          </View>
        </View>

        {/* FOLHA DE RELATÓRIO FORMATADA (ESTILO LAUDO A4 CLÍNICO) */}
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
          <View
            style={{
              width: '100%',
              maxWidth: 760,
              backgroundColor: '#121820',
              borderRadius: 16,
              padding: 28,
              borderWidth: 1,
              borderColor: '#1E293B',
              gap: 20,
            }}
          >
            {/* CABEÇALHO DO LAUDO */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottomWidth: 2,
                borderColor: t.accent,
                paddingBottom: 16,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 24 }}>⚡</Text>
                  <Title size={24} style={{ color: '#FFFFFF', letterSpacing: 1 }}>
                    PERSONAL TRAINER
                  </Title>
                </View>
                <Text style={{ color: t.accent, fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                  LAUDO CLÍNICO DE AVALIAÇÃO FÍSICA & COMPOSIÇÃO CORPORAL
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Data do Laudo: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{photos?.data || new Date(assessment.data).toLocaleDateString('pt-BR')}</Text>
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                  Equipamento: Balança Clínica Multifrequencial
                </Text>
              </View>
            </View>

            {/* DADOS DO ALUNO */}
            <View
              style={{
                backgroundColor: '#1A222C',
                padding: 16,
                borderRadius: 12,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Label>Aluno Avaliado</Label>
                <Title size={18} style={{ color: '#FFFFFF' }}>{studentName}</Title>
              </View>
              {bio && (
                <>
                  <View>
                    <Label>Peso Corporal</Label>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>{bio.pesoKg} kg</Text>
                  </View>
                  <View>
                    <Label>Altura</Label>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>{bio.alturaCm} cm</Text>
                  </View>
                  <View>
                    <Label>Idade / Sexo</Label>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>{bio.idade} anos · {bio.sexo}</Text>
                  </View>
                  <View>
                    <Label>IMC Atual</Label>
                    <Text style={{ color: t.accent, fontSize: 16, fontWeight: 'bold' }}>{bio.imc} ({bio.nivelObesidade})</Text>
                  </View>
                </>
              )}
            </View>

            {/* COMPOSIÇÃO CORPORAL E BIOIMPEDÂNCIA */}
            {bio && (
              <View style={{ gap: 10 }}>
                <Title size={18} style={{ color: '#FFFFFF' }}>1. Composição em 4 Compartimentos</Title>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {[
                    { label: '% Gordura Corporal', val: `${bio.percGordura}%`, color: t.fatColor, sub: `${bio.massaGordaKg} kg de gordura` },
                    { label: 'Massa Muscular', val: `${bio.massaMuscularEsqueleticaKg} kg`, color: t.accent, sub: `${bio.taxaMusculoEsqueleticoPerc}% do corpo` },
                    { label: 'Água Corporal Total', val: `${bio.aguaTotalKg} kg`, color: t.waterColor, sub: 'Intracelular + Extracelular' },
                    { label: 'Massa Livre de Gordura', val: `${bio.massaLivreGorduraKg} kg`, color: '#FFFFFF', sub: 'Músculo + Ósseo + Vísceras' },
                    { label: 'Gordura Visceral', val: `Nível ${bio.gorduraVisceralNivel}`, color: '#EAB308', sub: 'Índice de saúde metabólica' },
                    { label: 'Taxa Metabólica Basal', val: `${bio.bmrKcal} kcal`, color: '#60A5FA', sub: 'Gasto calórico de repouso' },
                  ].map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        flex: 1,
                        minWidth: 140,
                        backgroundColor: '#161D26',
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#243040',
                      }}
                    >
                      <Label>{item.label}</Label>
                      <Text style={{ color: item.color, fontSize: 20, fontWeight: '800', marginVertical: 2 }}>
                        {item.val}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 10 }}>{item.sub}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* FOTOS POSTURAIS */}
            {photos && (
              <View style={{ gap: 10 }}>
                <Title size={18} style={{ color: '#FFFFFF' }}>2. Registro Fotográfico Postural Padronizado</Title>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {[
                    { label: 'Frente', url: photos.frenteUrl },
                    { label: 'Costas', url: photos.costasUrl },
                    { label: 'Perfil Direito', url: photos.perfilDireitoUrl },
                    { label: 'Perfil Esquerdo', url: photos.perfilEsquerdoUrl },
                  ].map((p, idx) =>
                    p.url ? (
                      <View
                        key={idx}
                        style={{
                          flex: 1,
                          minWidth: 130,
                          borderRadius: 10,
                          overflow: 'hidden',
                          backgroundColor: '#161D26',
                          borderWidth: 1,
                          borderColor: '#243040',
                        }}
                      >
                        <Image source={{ uri: p.url }} style={{ width: '100%', height: 170, resizeMode: 'cover' }} />
                        <View style={{ padding: 6, alignItems: 'center', backgroundColor: '#1A222C' }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>{p.label}</Text>
                        </View>
                      </View>
                    ) : null
                  )}
                </View>
              </View>
            )}

            {/* PERÍMETROS E CIRCUNFERÊNCIAS */}
            {circ && (
              <View style={{ gap: 10 }}>
                <Title size={18} style={{ color: '#FFFFFF' }}>3. Perímetros e Circunferências (cm)</Title>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { l: 'Tórax', v: circ.toraxCm },
                    { l: 'Cintura', v: circ.cinturaCm },
                    { l: 'Abdômen', v: circ.abdomenCm },
                    { l: 'Quadril', v: circ.quadrilCm },
                    { l: 'Braço Contraído', v: circ.bracoContraidoCm },
                    { l: 'Braço Relaxado', v: circ.bracoRelaxadoCm },
                    { l: 'Coxa Medial', v: circ.coxaMedialCm },
                    { l: 'Panturrilha', v: circ.panturrilhaCm },
                  ].map((c, idx) => (
                    <View
                      key={idx}
                      style={{
                        flex: 1,
                        minWidth: 90,
                        backgroundColor: '#161D26',
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#243040',
                      }}
                    >
                      <Label style={{ fontSize: 10 }}>{c.l}</Label>
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginTop: 2 }}>
                        {c.v} cm
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* PARECER TÉCNICO */}
            <View style={{ gap: 6, borderTopWidth: 1, borderColor: '#1E293B', paddingTop: 14 }}>
              <Title size={16} style={{ color: t.accent }}>4. Parecer Técnico do Treinador</Title>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
                {assessment.notasProfissional || 'Avaliação biométrica regular realizada com sucesso. Protocolo alinhado aos objetivos de recomposição corporal e ganho de força.'}
              </Text>
            </View>

            {/* ASSINATURA */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopWidth: 1,
                borderColor: '#1E293B',
                paddingTop: 16,
                marginTop: 10,
              }}
            >
              <View>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Personal Trainer Responsável</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>CREF Registrado e Ativo</Text>
              </View>

              <View style={{ borderBottomWidth: 1, borderColor: '#FFFFFF', width: 180, alignItems: 'center', paddingBottom: 4 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>Assinatura do Profissional</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
