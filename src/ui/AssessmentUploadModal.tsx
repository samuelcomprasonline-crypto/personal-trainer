import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { colors, radius, spacing, typography } from './theme';
import type { AssessmentAttachment } from '../domain/types';

interface AssessmentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmData: (extracted: {
    pesoKg: number;
    percGordura: number;
    massaMuscularEsqueleticaKg: number;
    aguaTotalKg: number;
    massaLivreGorduraKg: number;
  }) => void;
}

export function AssessmentUploadModal({
  visible,
  onClose,
  onConfirmData,
}: AssessmentUploadModalProps) {
  const [selectedSource, setSelectedSource] = useState<'InBody' | 'Unique Health' | 'Tanita' | 'Manual'>('Unique Health');
  const [fileAttached, setFileAttached] = useState<{
    name: string;
    type: 'pdf' | 'image';
    size: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    pesoKg: number;
    percGordura: number;
    massaMuscularEsqueleticaKg: number;
    aguaTotalKg: number;
    massaLivreGorduraKg: number;
    confianca: number;
  } | null>(null);

  const simulateFileUpload = (type: 'pdf' | 'image') => {
    setIsProcessing(true);
    setFileAttached({
      name: type === 'pdf' ? 'Laudo_Bioimpedancia_Clinica_Setembro.pdf' : 'Foto_Relatorio_Balanca_InBody.jpg',
      type,
      size: type === 'pdf' ? '1.4 MB' : '3.8 MB',
    });

    // Simula leitura inteligente de OCR e reconhecimento de dados da balança
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedData({
        pesoKg: 78.4,
        percGordura: 16.8,
        massaMuscularEsqueleticaKg: 38.6,
        aguaTotalKg: 49.2,
        massaLivreGorduraKg: 65.2,
        confianca: 99.4,
      });
    }, 1200);
  };

  const handleConfirm = () => {
    if (extractedData) {
      onConfirmData(extractedData);
      onClose();
      // Resetar estado local
      setFileAttached(null);
      setExtractedData(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>📄 Leitor de Laudo da Balança</Text>
              <Text style={styles.headerSubtitle}>
                Faça o upload do PDF ou foto do relatório de bioimpedância
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Escolha do Equipamento */}
            <Text style={styles.sectionTitle}>Selecione o Fabricante da Balança:</Text>
            <View style={styles.sourceRow}>
              {(['Unique Health', 'InBody', 'Tanita', 'Manual'] as const).map((source) => {
                const isSelected = selectedSource === source;
                return (
                  <TouchableOpacity
                    key={source}
                    style={[styles.sourcePill, isSelected && styles.sourcePillActive]}
                    onPress={() => setSelectedSource(source)}
                  >
                    <Text style={[styles.sourcePillText, isSelected && styles.sourcePillTextActive]}>
                      {source}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Área de Dropzone / Upload de Arquivo */}
            {!fileAttached ? (
              <View style={styles.dropzone}>
                <Text style={styles.dropzoneIcon}>📥</Text>
                <Text style={styles.dropzoneTitle}>Arraste o arquivo ou selecione</Text>
                <Text style={styles.dropzoneSubtitle}>
                  Formatos suportados: PDF oficial da clínica ou foto legível do visor (JPG/PNG)
                </Text>

                <View style={styles.uploadButtonsRow}>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => simulateFileUpload('pdf')}
                  >
                    <Text style={styles.uploadBtnIcon}>📑</Text>
                    <Text style={styles.uploadBtnText}>Anexar PDF da Balança</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.uploadBtn, styles.uploadBtnSecondary]}
                    onPress={() => simulateFileUpload('image')}
                  >
                    <Text style={styles.uploadBtnIcon}>📷</Text>
                    <Text style={styles.uploadBtnText}>Foto do Visor / Papel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.attachedCard}>
                <View style={styles.attachedHeader}>
                  <Text style={styles.attachedIcon}>{fileAttached.type === 'pdf' ? '📑' : '🖼️'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attachedName}>{fileAttached.name}</Text>
                    <Text style={styles.attachedMeta}>
                      Tamanho: {fileAttached.size} • Balança: {selectedSource}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setFileAttached(null);
                      setExtractedData(null);
                    }}
                  >
                    <Text style={styles.removeText}>Trocar</Text>
                  </TouchableOpacity>
                </View>

                {isProcessing && (
                  <View style={styles.processingBox}>
                    <Text style={styles.processingText}>
                      ⏳ Processando laudo com IA e extraindo biomarcadores...
                    </Text>
                  </View>
                )}

                {extractedData && (
                  <View style={styles.extractedCard}>
                    <View style={styles.extractedTop}>
                      <Text style={styles.extractedTitle}>✨ Dados Extraídos com Sucesso</Text>
                      <View style={styles.confBadge}>
                        <Text style={styles.confText}>Precisão: {extractedData.confianca}%</Text>
                      </View>
                    </View>

                    <View style={styles.metricsGrid}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>PESO CORPORAL</Text>
                        <Text style={styles.metricValue}>{extractedData.pesoKg} kg</Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>% GORDURA</Text>
                        <Text style={[styles.metricValue, { color: '#FF6B6B' }]}>
                          {extractedData.percGordura}%
                        </Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>MASSA MUSCULAR</Text>
                        <Text style={[styles.metricValue, { color: colors.primary }]}>
                          {extractedData.massaMuscularEsqueleticaKg} kg
                        </Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>ÁGUA CORPORAL</Text>
                        <Text style={[styles.metricValue, { color: '#38BDF8' }]}>
                          {extractedData.aguaTotalKg} kg
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.confirmNotice}>
                      Estes dados atualizarão automaticamente a topografia 3D e o histórico clínico do aluno.
                    </Text>

                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                      <Text style={styles.confirmBtnText}>Salvar e Atualizar Avaliação</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Informações Regulatórias e Segurança */}
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyIcon}>🔒</Text>
              <Text style={styles.privacyText}>
                Em conformidade com a LGPD e privacidade médica, dados de saúde são armazenados de forma criptografada em repouso.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sourcePill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourcePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sourcePillText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: '700',
  },
  sourcePillTextActive: {
    color: colors.black,
  },
  dropzone: {
    borderWidth: 2,
    borderColor: 'rgba(198, 244, 50, 0.3)',
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(198, 244, 50, 0.02)',
    marginVertical: spacing.sm,
  },
  dropzoneIcon: {
    fontSize: 42,
    marginBottom: spacing.sm,
  },
  dropzoneTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  dropzoneSubtitle: {
    color: colors.textMuted,
    fontSize: typography.small,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
    maxWidth: 380,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  uploadBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  uploadBtnSecondary: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadBtnIcon: {
    fontSize: 16,
  },
  uploadBtnText: {
    color: colors.black,
    fontSize: typography.small,
    fontWeight: '800',
  },
  attachedCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attachedIcon: {
    fontSize: 28,
  },
  attachedName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  attachedMeta: {
    color: colors.textMuted,
    fontSize: typography.micro,
    marginTop: 2,
  },
  removeText: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '700',
  },
  processingBox: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  processingText: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '600',
  },
  extractedCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  extractedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  extractedTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  confBadge: {
    backgroundColor: 'rgba(198, 244, 50, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  confText: {
    color: colors.primary,
    fontSize: typography.micro,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  metricValue: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: '900',
    marginTop: 2,
  },
  confirmNotice: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    marginBottom: spacing.md,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.black,
    fontSize: typography.body,
    fontWeight: '900',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    padding: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.sm,
  },
  privacyIcon: {
    fontSize: 14,
  },
  privacyText: {
    color: colors.textMuted,
    fontSize: typography.micro,
    flex: 1,
  },
});
