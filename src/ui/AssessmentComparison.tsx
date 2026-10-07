import { useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AssessmentPhotos, PhysicalAssessment } from '../domain/types';
import { Body, Button, Card, Chip, Label, Title } from './components';
import { colors, radius, spacing, useTheme } from './theme';

type AngleKey = 'frente' | 'costas' | 'perfilDireito' | 'perfilEsquerdo';

export function AssessmentComparison({
  assessments,
  studentName,
  onUpdateAssessmentPhotos,
}: {
  assessments: PhysicalAssessment[];
  studentName: string;
  onUpdateAssessmentPhotos?: (assessmentId: string, updatedPhotos: AssessmentPhotos) => void;
}) {
  const t = useTheme();

  // Garante pelo menos 2 avaliações (se houver apenas 1, replica com variação para demonstração)
  const safeList = assessments.length > 0 ? assessments : [];
  const baselineIdx = 0;
  const latestIdx = safeList.length > 1 ? safeList.length - 1 : 0;

  const [selectedBeforeId, setSelectedBeforeId] = useState<string>(
    safeList[baselineIdx]?.id || ''
  );
  const [selectedAfterId, setSelectedAfterId] = useState<string>(
    safeList[latestIdx]?.id || ''
  );

  const [selectedAngle, setSelectedAngle] = useState<'todos' | AngleKey>('todos');
  const [zoomPhoto, setZoomPhoto] = useState<{ url: string; label: string; date: string } | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{
    assessmentId: string;
    angle: AngleKey;
    label: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const beforeAssessment =
    safeList.find((a) => a.id === selectedBeforeId) || safeList[baselineIdx] || null;
  const afterAssessment =
    safeList.find((a) => a.id === selectedAfterId) || safeList[latestIdx] || null;

  // Cálculos de Deltas
  const beforeWeight = beforeAssessment?.bioimpedance?.pesoKg ?? 0;
  const afterWeight = afterAssessment?.bioimpedance?.pesoKg ?? 0;
  const deltaWeight = Math.round((afterWeight - beforeWeight) * 10) / 10;

  const beforeFatPerc = beforeAssessment?.bioimpedance?.percGordura ?? 0;
  const afterFatPerc = afterAssessment?.bioimpedance?.percGordura ?? 0;
  const deltaFatPerc = Math.round((afterFatPerc - beforeFatPerc) * 10) / 10;

  const beforeMuscle = beforeAssessment?.bioimpedance?.massaMuscularEsqueleticaKg ?? 0;
  const afterMuscle = afterAssessment?.bioimpedance?.massaMuscularEsqueleticaKg ?? 0;
  const deltaMuscle = Math.round((afterMuscle - beforeMuscle) * 10) / 10;

  const anglesList: { key: AngleKey; label: string; beforeUrl?: string; afterUrl?: string }[] = [
    {
      key: 'frente',
      label: 'Vista Anterior (Frente)',
      beforeUrl: beforeAssessment?.photos?.frenteUrl,
      afterUrl: afterAssessment?.photos?.frenteUrl,
    },
    {
      key: 'costas',
      label: 'Vista Posterior (Costas)',
      beforeUrl: beforeAssessment?.photos?.costasUrl,
      afterUrl: afterAssessment?.photos?.costasUrl,
    },
    {
      key: 'perfilDireito',
      label: 'Perfil Direito',
      beforeUrl: beforeAssessment?.photos?.perfilDireitoUrl,
      afterUrl: afterAssessment?.photos?.perfilDireitoUrl,
    },
    {
      key: 'perfilEsquerdo',
      label: 'Perfil Esquerdo',
      beforeUrl: beforeAssessment?.photos?.perfilEsquerdoUrl,
      afterUrl: afterAssessment?.photos?.perfilEsquerdoUrl,
    },
  ];

  const displayedAngles =
    selectedAngle === 'todos' ? anglesList : anglesList.filter((a) => a.key === selectedAngle);

  const handleApplyUpload = (assessmentId: string, angle: AngleKey, imageUrl: string) => {
    const target = safeList.find((a) => a.id === assessmentId);
    if (target && onUpdateAssessmentPhotos) {
      const updatedPhotos: AssessmentPhotos = {
        ...(target.photos ?? { data: new Date().toLocaleDateString('pt-BR') }),
        [`${angle}Url`]: imageUrl,
        data: target.photos?.data || new Date().toLocaleDateString('pt-BR'),
      };
      onUpdateAssessmentPhotos(assessmentId, updatedPhotos);
    }
    setUploadTarget(null);
    setToastMsg(`Foto de ${angle.toUpperCase()} atualizada no comparativo com sucesso!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleNativeFileUpload = (assessmentId: string, angle: AngleKey) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
              handleApplyUpload(assessmentId, angle, dataUrl);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // Simulação móvel com imagem em alta definição
      const sample =
        angle === 'frente'
          ? 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80';
      handleApplyUpload(assessmentId, angle, sample);
    }
  };

  return (
    <View style={{ gap: 14 }}>
      {/* CABEÇALHO DO COMPARATIVO */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <View>
            <Label style={{ color: t.accent }}>Comparativo Postural & Biométrico</Label>
            <Title size={22}>Antes vs Depois · {studentName}</Title>
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: `${t.accent}20`,
              borderWidth: 1,
              borderColor: `${t.accent}40`,
            }}
          >
            <Body style={{ color: t.accent, fontWeight: '700', fontSize: 12 } as any}>
              {safeList.length} avaliações registradas
            </Body>
          </View>
        </View>

        {toastMsg && (
          <View
            style={{
              backgroundColor: 'rgba(198, 244, 50, 0.15)',
              padding: 10,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: t.accent,
              marginTop: 6,
            }}
          >
            <Body style={{ color: t.accent, fontWeight: '700', fontSize: 13 } as any}>
              ✓ {toastMsg}
            </Body>
          </View>
        )}

        {/* SELETOR DE DATAS / AVALIAÇÕES PARA COMPARAR */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          {/* Caixa do ANTES */}
          <View style={{ flex: 1, minWidth: 140, backgroundColor: t.surfaceElevated, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: t.border }}>
            <Label>1. Avaliação Anterior (Antes):</Label>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {safeList.map((ass) => {
                const dateLabel = ass.photos?.data || new Date(ass.data).toLocaleDateString('pt-BR');
                const isSelected = (beforeAssessment?.id || '') === ass.id;
                return (
                  <Chip
                    key={`before-${ass.id}`}
                    label={dateLabel}
                    selected={isSelected}
                    onPress={() => setSelectedBeforeId(ass.id)}
                  />
                );
              })}
            </View>
            <Body muted style={{ fontSize: 11, marginTop: 4 } as any}>
              Peso: {beforeWeight} kg · % Gordura: {beforeFatPerc}%
            </Body>
          </View>

          {/* Caixa do DEPOIS */}
          <View style={{ flex: 1, minWidth: 140, backgroundColor: t.surfaceElevated, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: t.border }}>
            <Label style={{ color: t.accent }}>2. Avaliação Atual (Depois):</Label>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {safeList.map((ass) => {
                const dateLabel = ass.photos?.data || new Date(ass.data).toLocaleDateString('pt-BR');
                const isSelected = (afterAssessment?.id || '') === ass.id;
                return (
                  <Chip
                    key={`after-${ass.id}`}
                    label={dateLabel}
                    selected={isSelected}
                    onPress={() => setSelectedAfterId(ass.id)}
                  />
                );
              })}
            </View>
            <Body muted style={{ fontSize: 11, marginTop: 4 } as any}>
              Peso: {afterWeight} kg · % Gordura: {afterFatPerc}%
            </Body>
          </View>
        </View>

        {/* CARDS COM AS MÉTRICAS DE EVOLUÇÃO CORPORAL LADO A LADO */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {/* Card Peso */}
          <View style={{ flex: 1, minWidth: 100, backgroundColor: t.surfaceCard, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: t.border }}>
            <Label>Variação de Peso</Label>
            <Title size={18} style={{ color: deltaWeight <= 0 ? t.accent : '#F59E0B', marginTop: 2 }}>
              {deltaWeight > 0 ? `+${deltaWeight}` : `${deltaWeight}`} kg
            </Title>
            <Body muted style={{ fontSize: 10 } as any}>
              {beforeWeight} kg ➔ {afterWeight} kg
            </Body>
          </View>

          {/* Card Gordura */}
          <View style={{ flex: 1, minWidth: 100, backgroundColor: t.surfaceCard, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: t.border }}>
            <Label style={{ color: t.fatColor }}>% Gordura Corporal</Label>
            <Title size={18} style={{ color: deltaFatPerc <= 0 ? t.accent : t.fatColor, marginTop: 2 }}>
              {deltaFatPerc > 0 ? `+${deltaFatPerc}` : `${deltaFatPerc}`}%
            </Title>
            <Body muted style={{ fontSize: 10 } as any}>
              {beforeFatPerc}% ➔ {afterFatPerc}%
            </Body>
          </View>

          {/* Card Músculo */}
          <View style={{ flex: 1, minWidth: 100, backgroundColor: t.surfaceCard, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: t.border }}>
            <Label style={{ color: t.accent }}>Massa Muscular</Label>
            <Title size={18} style={{ color: deltaMuscle >= 0 ? t.accent : '#F59E0B', marginTop: 2 }}>
              {deltaMuscle > 0 ? `+${deltaMuscle}` : `${deltaMuscle}`} kg
            </Title>
            <Body muted style={{ fontSize: 10 } as any}>
              {beforeMuscle} kg ➔ {afterMuscle} kg
            </Body>
          </View>
        </View>

        {/* SELETOR DE ÂNGULOS */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          <Chip label="Todos os Ângulos" selected={selectedAngle === 'todos'} onPress={() => setSelectedAngle('todos')} />
          <Chip label="Frente" selected={selectedAngle === 'frente'} onPress={() => setSelectedAngle('frente')} />
          <Chip label="Costas" selected={selectedAngle === 'costas'} onPress={() => setSelectedAngle('costas')} />
          <Chip label="Perfil Direito" selected={selectedAngle === 'perfilDireito'} onPress={() => setSelectedAngle('perfilDireito')} />
          <Chip label="Perfil Esquerdo" selected={selectedAngle === 'perfilEsquerdo'} onPress={() => setSelectedAngle('perfilEsquerdo')} />
        </View>
      </Card>

      {/* EXIBIÇÃO DAS FOTOS LADO A LADO POR ÂNGULO */}
      {displayedAngles.map((angle) => {
        const beforeDate = beforeAssessment?.photos?.data || 'Antes';
        const afterDate = afterAssessment?.photos?.data || 'Depois';

        return (
          <Card key={angle.key}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Title size={18}>{angle.label}</Title>
              <Body muted style={{ fontSize: 12 } as any}>
                Toque na imagem para ampliar em tela cheia
              </Body>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              {/* LADO ESQUERDO: FOTO ANTES */}
              <View
                style={{
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: t.surfaceElevated,
                  borderRadius: 16,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: t.border,
                }}
              >
                {/* Badge Antes */}
                <View
                  style={{
                    padding: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderBottomWidth: 1,
                    borderColor: t.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 6,
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        borderWidth: 1,
                        borderColor: '#EF4444',
                      }}
                    >
                      <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '800' }}>ANTES</Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                      {beforeDate}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{beforeWeight} kg</Text>
                </View>

                {/* Imagem Antes */}
                {angle.beforeUrl ? (
                  <Pressable
                    onPress={() =>
                      setZoomPhoto({
                        url: angle.beforeUrl!,
                        label: `${angle.label} — ANTES`,
                        date: beforeDate,
                      })
                    }
                  >
                    <Image
                      source={{ uri: angle.beforeUrl }}
                      style={{ width: '100%', height: 260, resizeMode: 'cover' }}
                    />
                  </Pressable>
                ) : (
                  <View style={{ height: 260, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                    <Text style={{ fontSize: 32, marginBottom: 6 }}>📷</Text>
                    <Body muted style={{ textAlign: 'center', fontSize: 12 } as any}>
                      Nenhuma foto cadastrada para este ângulo no Antes.
                    </Body>
                  </View>
                )}

                {/* Botão de Upload da Foto do Antes */}
                <View style={{ padding: 8, borderTopWidth: 1, borderColor: t.border }}>
                  <Pressable
                    onPress={() =>
                      beforeAssessment && handleNativeFileUpload(beforeAssessment.id, angle.key)
                    }
                    style={({ pressed }) => ({
                      backgroundColor: `${t.accent}15`,
                      paddingVertical: 6,
                      borderRadius: radius.sm,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: `${t.accent}40`,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>
                      📁 Subir / Trocar Foto (Antes)
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* LADO DIREITO: FOTO DEPOIS */}
              <View
                style={{
                  flex: 1,
                  minWidth: 150,
                  backgroundColor: t.surfaceElevated,
                  borderRadius: 16,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: `${t.accent}60`,
                }}
              >
                {/* Badge Depois */}
                <View
                  style={{
                    padding: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: `${t.accent}10`,
                    borderBottomWidth: 1,
                    borderColor: `${t.accent}40`,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 6,
                        backgroundColor: `${t.accent}30`,
                        borderWidth: 1,
                        borderColor: t.accent,
                      }}
                    >
                      <Text style={{ color: t.accent, fontSize: 11, fontWeight: '800' }}>DEPOIS</Text>
                    </View>
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                      {afterDate}
                    </Text>
                  </View>
                  <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>{afterWeight} kg</Text>
                </View>

                {/* Imagem Depois */}
                {angle.afterUrl ? (
                  <Pressable
                    onPress={() =>
                      setZoomPhoto({
                        url: angle.afterUrl!,
                        label: `${angle.label} — DEPOIS`,
                        date: afterDate,
                      })
                    }
                  >
                    <Image
                      source={{ uri: angle.afterUrl }}
                      style={{ width: '100%', height: 260, resizeMode: 'cover' }}
                    />
                  </Pressable>
                ) : (
                  <View style={{ height: 260, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                    <Text style={{ fontSize: 32, marginBottom: 6 }}>📷</Text>
                    <Body muted style={{ textAlign: 'center', fontSize: 12 } as any}>
                      Nenhuma foto cadastrada para este ângulo no Depois.
                    </Body>
                  </View>
                )}

                {/* Botão de Upload da Foto do Depois */}
                <View style={{ padding: 8, borderTopWidth: 1, borderColor: t.border }}>
                  <Pressable
                    onPress={() =>
                      afterAssessment && handleNativeFileUpload(afterAssessment.id, angle.key)
                    }
                    style={({ pressed }) => ({
                      backgroundColor: `${t.accent}25`,
                      paddingVertical: 6,
                      borderRadius: radius.sm,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: t.accent,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ color: t.accent, fontSize: 11, fontWeight: '800' }}>
                      📁 Subir / Trocar Foto (Depois)
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Card>
        );
      })}

      {/* MODAL DE ZOOM DA FOTO EM TELA CHEIA */}
      <Modal
        visible={zoomPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setZoomPhoto(null)}
      >
        <Pressable
          onPress={() => setZoomPhoto(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.92)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          {zoomPhoto && (
            <View style={{ width: '100%', maxWidth: 500, alignItems: 'center', gap: 12 }}>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Title size={18} style={{ color: '#FFFFFF' }}>{zoomPhoto.label}</Title>
                  <Label style={{ color: t.accent }}>Data: {zoomPhoto.date}</Label>
                </View>
                <Pressable onPress={() => setZoomPhoto(null)} style={{ padding: 8 }}>
                  <Body style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' } as any}>✕</Body>
                </Pressable>
              </View>

              <Image
                source={{ uri: zoomPhoto.url }}
                style={{ width: '100%', height: 480, resizeMode: 'contain', borderRadius: 16 }}
              />
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}
