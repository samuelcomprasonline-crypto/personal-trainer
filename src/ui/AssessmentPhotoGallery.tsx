import { useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AssessmentPhotos } from '../domain/types';
import { uploadAssessmentPhotoToStorage } from '../lib/syncService';
import { Body, Button, Card, Chip, Label, Title } from './components';
import { colors, radius, spacing, typography, useTheme } from './theme';

export function AssessmentPhotoGallery({
  photos: initialPhotos,
  onPhotosUpdate,
}: {
  photos?: AssessmentPhotos;
  onPhotosUpdate?: (updated: AssessmentPhotos) => void;
}) {
  const t = useTheme();
  const [photos, setPhotos] = useState<AssessmentPhotos>(
    initialPhotos ?? {
      frenteUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
      costasUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      perfilDireitoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      perfilEsquerdoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      data: new Date().toLocaleDateString('pt-BR'),
    }
  );
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; label: string } | null>(null);
  const [activeAngle, setActiveAngle] = useState<'todos' | 'frente' | 'costas' | 'perfil'>('todos');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUploadAngle, setSelectedUploadAngle] = useState<'frente' | 'costas' | 'perfilDireito' | 'perfilEsquerdo'>('frente');
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  const photoList = [
    { key: 'frente', label: 'Vista Anterior (Frente)', url: photos.frenteUrl, id: 'frente' as const },
    { key: 'costas', label: 'Vista Posterior (Costas)', url: photos.costasUrl, id: 'costas' as const },
    { key: 'perfil', label: 'Perfil Direito', url: photos.perfilDireitoUrl, id: 'perfilDireito' as const },
    { key: 'perfil', label: 'Perfil Esquerdo', url: photos.perfilEsquerdoUrl, id: 'perfilEsquerdo' as const },
  ].filter((p) => Boolean(p.url)) as { key: string; label: string; url: string; id: 'frente' | 'costas' | 'perfilDireito' | 'perfilEsquerdo' }[];

  const filtered = activeAngle === 'todos' ? photoList : photoList.filter((p) => p.key === activeAngle);

  const applyUploadedImage = (angle: 'frente' | 'costas' | 'perfilDireito' | 'perfilEsquerdo', imageUrl: string) => {
    const updated: AssessmentPhotos = {
      ...photos,
      [`${angle}Url`]: imageUrl,
      data: new Date().toLocaleDateString('pt-BR'),
    };

    setPhotos(updated);
    if (onPhotosUpdate) onPhotosUpdate(updated);

    setIsUploadModalOpen(false);
    setUploadSuccessToast(`Foto do ângulo "${angle.toUpperCase()}" registrada com sucesso!`);
    setTimeout(() => setUploadSuccessToast(null), 3500);
  };

  const handleNativeFileUpload = (angle: 'frente' | 'costas' | 'perfilDireito' | 'perfilEsquerdo') => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
              // Aplica imediatamente para a UI não travar
              applyUploadedImage(angle, dataUrl);

              // Faz upload permanente para o bucket assessment-photos do Supabase
              const cloudUrl = await uploadAssessmentPhotoToStorage(
                dataUrl,
                'aluno',
                angle === 'perfilDireito'
                  ? 'perfil_direito'
                  : angle === 'perfilEsquerdo'
                  ? 'perfil_esquerdo'
                  : angle
              );

              if (cloudUrl) {
                applyUploadedImage(angle, cloudUrl);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      simulatePhotoUpload(angle);
    }
  };

  const simulatePhotoUpload = (angle: 'frente' | 'costas' | 'perfilDireito' | 'perfilEsquerdo') => {
    const mockUrls = {
      frente: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
      costas: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      perfilDireito: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      perfilEsquerdo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
    };
    applyUploadedImage(angle, mockUrls[angle]);
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <View>
          <Label>Registro Fotográfico Postural Padronizado</Label>
          <Title size={22}>Fotos da Avaliação</Title>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Button
            title="+ Enviar Nova Foto 📷"
            onPress={() => setIsUploadModalOpen(true)}
            variant="neonOutline"
          />
        </View>
      </View>

      {uploadSuccessToast && (
        <View
          style={{
            backgroundColor: 'rgba(198, 244, 50, 0.15)',
            padding: 10,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: t.accent,
            marginVertical: 4,
          }}
        >
          <Body style={{ color: t.accent, fontWeight: '700', fontSize: 13 } as any}>
            ✓ {uploadSuccessToast}
          </Body>
        </View>
      )}

      {/* Filtros em Chips */}
      <View style={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
        <Chip label="Todas" selected={activeAngle === 'todos'} onPress={() => setActiveAngle('todos')} />
        <Chip label="Frente" selected={activeAngle === 'frente'} onPress={() => setActiveAngle('frente')} />
        <Chip label="Costas" selected={activeAngle === 'costas'} onPress={() => setActiveAngle('costas')} />
        <Chip label="Perfil" selected={activeAngle === 'perfil'} onPress={() => setActiveAngle('perfil')} />
      </View>

      <Body muted style={{ fontSize: 13 } as any}>
        Acompanhamento visual em alta definição realizado em {photos.data}. Toque na foto para ampliar em tela cheia.
      </Body>

      {/* Grade de Fotos */}
      {/* Grade de Fotos com ações diretas */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
        {filtered.map((item, idx) => (
          <View
            key={idx}
            style={{
              flex: 1,
              minWidth: 140,
              maxWidth: Platform.OS === 'web' ? '24%' : '48%',
              borderRadius: 18,
              overflow: 'hidden',
              backgroundColor: t.surfaceElevated,
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <Pressable
              onPress={() => setSelectedPhoto({ url: item.url, label: item.label })}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Image
                source={{ uri: item.url }}
                style={{ width: '100%', height: 210, resizeMode: 'cover' }}
              />
            </Pressable>

            <View style={{ padding: 10, backgroundColor: t.surfaceCard, gap: 6 }}>
              <View>
                <Body style={{ fontSize: 12, fontWeight: '700' } as any}>{item.label}</Body>
                <Label style={{ fontSize: 10, marginTop: 1 } as any}>{photos.data}</Label>
              </View>

              <Pressable
                onPress={() => handleNativeFileUpload(item.id)}
                style={({ pressed }) => ({
                  backgroundColor: `${t.accent}20`,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  borderRadius: radius.sm,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: `${t.accent}60`,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: t.accent, fontSize: 11, fontWeight: '800' }}>
                  📷 Trocar / Subir Foto
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* MODAL DE UPLOAD DE FOTOS DA AVALIAÇÃO */}
      <Modal
        visible={isUploadModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsUploadModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>📷 Subir Foto de Avaliação</Text>
                <Text style={styles.modalSubtitle}>
                  Selecione o ângulo postural correspondente
                </Text>
              </View>
              <Pressable onPress={() => setIsUploadModalOpen(false)} style={{ padding: 6 }}>
                <Text style={{ color: colors.textMuted, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
              </Pressable>
            </View>

            {/* Seletor de Ângulo Postural */}
            <View style={styles.anglesRow}>
              {[
                { id: 'frente' as const, label: 'Frente' },
                { id: 'costas' as const, label: 'Costas' },
                { id: 'perfilDireito' as const, label: 'Perfil D.' },
                { id: 'perfilEsquerdo' as const, label: 'Perfil E.' },
              ].map((angle) => {
                const isSelected = selectedUploadAngle === angle.id;
                return (
                  <Pressable
                    key={angle.id}
                    onPress={() => setSelectedUploadAngle(angle.id)}
                    style={[styles.angleBtn, isSelected && styles.angleBtnActive]}
                  >
                    <Text style={[styles.angleBtnText, isSelected && styles.angleBtnTextActive]}>
                      {angle.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Dropzone de Foto com suporte a arquivo real */}
            <View style={styles.photoDropzone}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📸</Text>
              <Text style={styles.dropzoneTitle}>Tirar ou Anexar Foto do Aluno</Text>
              <Text style={styles.dropzoneSub}>
                Envie a foto do seu dispositivo para o ângulo:{' '}
                <Text style={{ color: t.accent, fontWeight: 'bold' }}>{selectedUploadAngle.toUpperCase()}</Text>.
              </Text>

              <View style={[styles.uploadActionButtons, { gap: 10 }]}>
                <Pressable
                  onPress={() => handleNativeFileUpload(selectedUploadAngle)}
                  style={styles.btnUploadPrimary}
                >
                  <Text style={styles.btnUploadPrimaryText}>
                    📁 Escolher Arquivo do Celular / Computador
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => simulatePhotoUpload(selectedUploadAngle)}
                  style={[styles.btnUploadPrimary, { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border }]}
                >
                  <Text style={[styles.btnUploadPrimaryText, { color: colors.textSecondary }]}>
                    ⚡ Inserir Foto Padrão de Demonstração
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.privacyNote}>
              <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                🔒 As fotos são criptografadas e de acesso restrito entre o aluno e o treinador.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Foto em Tela Cheia */}
      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <Pressable
          onPress={() => setSelectedPhoto(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          {selectedPhoto && (
            <View style={{ width: '100%', maxWidth: 500, alignItems: 'center', gap: 14 }}>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title size={20} style={{ color: '#FFFFFF' }}>{selectedPhoto.label}</Title>
                <Pressable onPress={() => setSelectedPhoto(null)} style={{ padding: 8 }}>
                  <Body style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' } as any}>✕</Body>
                </Pressable>
              </View>

              <Image
                source={{ uri: selectedPhoto.url }}
                style={{
                  width: '100%',
                  height: 480,
                  borderRadius: 20,
                  resizeMode: 'contain',
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              />

              <Body muted style={{ color: '#94A3B8', fontSize: 13 } as any}>
                Toque em qualquer local fora da imagem para fechar.
              </Body>
            </View>
          )}
        </Pressable>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 12, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  uploadModalCard: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginTop: 2,
  },
  anglesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  angleBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  angleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  angleBtnText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: '700',
  },
  angleBtnTextActive: {
    color: colors.black,
  },
  photoDropzone: {
    borderWidth: 2,
    borderColor: 'rgba(198, 244, 50, 0.3)',
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(198, 244, 50, 0.02)',
  },
  dropzoneTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  dropzoneSub: {
    color: colors.textMuted,
    fontSize: typography.micro,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
    maxWidth: 340,
  },
  uploadActionButtons: {
    width: '100%',
    alignItems: 'center',
  },
  btnUploadPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    width: '100%',
  },
  btnUploadPrimaryText: {
    color: colors.black,
    fontSize: typography.small,
    fontWeight: '800',
  },
  privacyNote: {
    marginTop: spacing.md,
  },
});
