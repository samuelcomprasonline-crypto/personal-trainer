import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { trainer } from '../src/data/seed';
import { useAuth } from '../src/state/AuthContext';
import { Body, Button, Card, Chip, Label, Screen, TextInputField, Title } from '../src/ui/components';
import { colors, radius, spacing, typography, useTheme } from '../src/ui/theme';

export default function Entrada() {
  const t = useTheme();
  const { enterDemoMode } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'student' | 'trainer'>('student');
  const [studentInput, setStudentInput] = useState('samuel@aluno.com');
  const [trainerInput, setTrainerInput] = useState('personal@consultoria.com');

  const handleEnterAsStudent = () => {
    enterDemoMode('student');
    router.replace('/hoje');
  };

  const handleEnterAsTrainer = () => {
    enterDemoMode('trainer');
    router.replace('/radar');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 30 }}>
        {/* 1. CABEÇALHO DA MARCA DO APP */}
        <View style={styles.brandHeader}>
          <View style={styles.logoContainer}>
            <Text style={{ fontSize: 26 }}>🏋️</Text>
          </View>
          <View>
            <Title size={26} style={{ letterSpacing: -0.5 }}>
              Personal Trainer
            </Title>
            <Label style={{ fontSize: 11, color: t.accent }}>
              Plataforma de Treinamento, Nutrição & Avaliação
            </Label>
          </View>
        </View>

        {/* 2. SELETOR DE LOGIN INICIAL (DIFERENCIA QUEM É ALUNO E QUEM É TREINADOR) */}
        <View style={styles.roleSelectorBox}>
          <Text style={styles.roleSelectorTitle}>Como deseja acessar o aplicativo?</Text>
          <View style={styles.roleButtonsRow}>
            <Pressable
              onPress={() => setSelectedRole('student')}
              style={[
                styles.roleButton,
                selectedRole === 'student' && styles.roleButtonActive,
              ]}
            >
              <Text style={{ fontSize: 20 }}>👤</Text>
              <View>
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === 'student' && styles.roleButtonTextActive,
                  ]}
                >
                  Sou Aluno
                </Text>
                <Text style={styles.roleButtonSub}>Ver meus treinos e dieta</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSelectedRole('trainer')}
              style={[
                styles.roleButton,
                selectedRole === 'trainer' && styles.roleButtonActive,
              ]}
            >
              <Text style={{ fontSize: 20 }}>⚡</Text>
              <View>
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === 'trainer' && styles.roleButtonTextActive,
                  ]}
                >
                  Sou Treinador
                </Text>
                <Text style={styles.roleButtonSub}>Painel de gestão e alunos</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 3. FORMULÁRIO ESPECÍFICO CONFORME O PERFIL ESCOLHIDO */}
        {selectedRole === 'student' ? (
          /* CARD DE LOGIN DO ALUNO */
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Label style={{ color: t.accent }}>PORTAL DO ALUNO</Label>
                <Title size={22}>Acessar seus Treinos</Title>
              </View>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>ÁREA DO ALUNO</Text>
              </View>
            </View>

            <Body muted style={{ fontSize: 13, marginTop: 4 } as any}>
              Informe seu e-mail cadastrado ou código individual gerado pelo seu personal trainer.
            </Body>

            <View style={{ marginVertical: 10, gap: 10 }}>
              <TextInputField
                label="E-mail ou Código de Ativação *"
                value={studentInput}
                onChangeText={setStudentInput}
                placeholder="Ex: aluno@email.com ou PRO-8492"
                autoCapitalize="none"
              />
            </View>

            <View style={{ gap: 8, marginTop: 4 }}>
              <Button
                title="Entrar no Portal do Aluno 👤"
                onPress={handleEnterAsStudent}
              />
              <Button
                title="Acessar com Aluno de Demonstração (Samuel Ferreira) →"
                variant="ghost"
                onPress={handleEnterAsStudent}
              />
            </View>

            {/* O que o aluno encontra */}
            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>O que você encontra no seu portal:</Text>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🏋️‍♂️</Text>
                <Text style={styles.featureText}>Sua ficha de treino de hoje com vídeos explicativos</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🥗</Text>
                <Text style={styles.featureText}>Plano nutricional com cálculo automático por gramas</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📈</Text>
                <Text style={styles.featureText}>Topografia anatômica 3D, fotos da avaliação e bioimpedância</Text>
              </View>
            </View>
          </Card>
        ) : (
          /* CARD DE LOGIN DO TREINADOR */
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Label style={{ color: t.accent }}>CENTRAL DO PERSONAL</Label>
                <Title size={22}>Painel do Treinador</Title>
              </View>
              <View style={[styles.badgePill, { backgroundColor: 'rgba(198, 244, 50, 0.2)' }]}>
                <Text style={styles.badgePillText}>ACESSO PROFISSIONAL</Text>
              </View>
            </View>

            <Body muted style={{ fontSize: 13, marginTop: 4 } as any}>
              Acesso exclusivo para o personal trainer gerenciar prontuários, prescrever periodizações e controlar mensalidades.
            </Body>

            <View style={{ marginVertical: 10, gap: 10 }}>
              <TextInputField
                label="E-mail do Treinador *"
                value={trainerInput}
                onChangeText={setTrainerInput}
                placeholder="personal@consultoria.com"
                autoCapitalize="none"
              />
            </View>

            <View style={{ gap: 8, marginTop: 4 }}>
              <Button
                title="Acessar Painel do Treinador ⚡"
                onPress={handleEnterAsTrainer}
              />
              <Button
                title="Entrar no Painel de Demonstração do Treinador →"
                variant="ghost"
                onPress={handleEnterAsTrainer}
              />
            </View>

            {/* O que o treinador encontra */}
            <View style={styles.featuresList}>
              <Text style={styles.featuresTitle}>Ferramentas da Central do Treinador:</Text>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📡</Text>
                <Text style={styles.featureText}>Radar clínico de alunos estagnados e com baixa frequência</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>👥</Text>
                <Text style={styles.featureText}>Prontuário 360°, laudos clínicos e controle de mensalidades pagas</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📚</Text>
                <Text style={styles.featureText}>Banco de periodizações e cadastro de protocolos próprios</Text>
              </View>
            </View>
          </Card>
        )}

        {/* 4. PRÉVIA RÁPIDA DE METODOLOGIA E CONTEÚDO */}
        <View style={{ gap: 10 }}>
          <Title size={18}>Exemplos de Treinos & Metodologias</Title>

          <Card
            onPress={handleEnterAsStudent}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop&q=80',
              }}
              style={{ width: 64, height: 64, borderRadius: 16 }}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Title size={16}>Ficha A, B, C — Hipertrofia & Força</Title>
              <Body muted style={{ fontSize: 12 } as any}>
                Divisão clássica • 12 exercícios • Séries com progressão de carga
              </Body>
              <Body style={{ color: t.accent, fontSize: 11, fontWeight: '700' } as any}>
                ● Exercícios com vídeos biomecânicos explicativos
              </Body>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSelectorBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleSelectorTitle: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleButtonActive: {
    backgroundColor: 'rgba(198, 244, 50, 0.12)',
    borderColor: colors.primary,
  },
  roleButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
  roleButtonTextActive: {
    color: colors.primary,
  },
  roleButtonSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: 'rgba(198, 244, 50, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(198, 244, 50, 0.3)',
  },
  badgePillText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  featuresList: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: 8,
  },
  featuresTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureText: {
    color: colors.text,
    fontSize: 12,
    flex: 1,
  },
});
