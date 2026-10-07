import { Link, router, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { trainer } from '../data/seed';
import { useAppState } from '../state/AppState';
import { useAuth } from '../state/AuthContext';
import { useTheme } from './theme';

type NavItem = {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  forRole?: 'all' | 'trainer' | 'student';
};

export function WebDashboardLayout({ children }: { children: ReactNode }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { profile, enterDemoMode, signOut } = useAuth();
  const { syncStatus } = useAppState();
  const pathname = usePathname();

  const isTrainer = profile?.role === 'trainer';

  // Menus estritamente específicos para o Treinador (Sem misturar com visão de aluno)
  const trainerNavItems: NavItem[] = [
    { label: 'Radar & Alertas do Personal', icon: '📡', route: '/radar', badge: 'ALERTAS' },
    { label: 'Prescrever Treino & Dieta', icon: '⚡', route: '/prescrever-dieta', badge: 'PRESCREVER' },
    { label: 'Alunos & Prontuários 360°', icon: '👥', route: '/alunos', badge: 'GESTÃO' },
    { label: 'Central de Treinos & Metodologia', icon: '📚', route: '/biblioteca', badge: 'PRO' },
    { label: 'Financeiro & Fluxo de Caixa', icon: '💰', route: '/financeiro', badge: 'FINANÇAS' },
  ];

  // Menus estritamente específicos para o Aluno
  const studentNavItems: NavItem[] = [
    { label: 'Treino de Hoje', icon: '🏋️‍♂️', route: '/hoje' },
    { label: 'Dieta & Macros', icon: '🥗', route: '/dieta' },
    { label: 'Avaliação & Fotos', icon: '📈', route: '/progresso' },
    { label: 'Meu Treinador', icon: '👤', route: '/treinador' },
  ];

  const activeNavItems = isTrainer ? trainerNavItems : studentNavItems;

  const isAuthRoute =
    pathname === '/' || pathname === '/login' || pathname === '/cadastro';

  // Se não for desktop, ou se estiver em tela de autenticação, ou se o usuário não estiver logado:
  // Renderiza APENAS o conteúdo (sem sidebar lateral, sem links de treinos/dieta ao lado)
  if (!isDesktop || isAuthRoute || !profile) {
    return <>{children}</>;
  }

  // Layout de Desktop com Sidebar Lateral Esquerda e Painel Amplo
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: t.bg }}>
      {/* 1. SIDEBAR LATERAL ESQUERDA FIXA */}
      <View
        style={{
          width: 250,
          backgroundColor: '#0A0E15',
          borderRightWidth: 1,
          borderRightColor: t.border,
          padding: 16,
          justifyContent: 'space-between',
        }}
      >
        {/* Topo da Sidebar: Marca do Estúdio */}
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: t.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>🏋️</Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: -0.3 }}>
                AURORA STUDIO
              </Text>
              <Text style={{ color: t.accent, fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                {isTrainer ? 'Painel do Treinador' : 'Portal do Aluno'}
              </Text>
            </View>
          </View>

          {/* Cartão de Identificação de Perfil (Fixo, sem alternância) */}
          <View
            style={{
              backgroundColor: isTrainer ? 'rgba(16, 185, 129, 0.08)' : 'rgba(168, 85, 247, 0.08)',
              borderRadius: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: isTrainer ? 'rgba(16, 185, 129, 0.25)' : 'rgba(168, 85, 247, 0.25)',
              gap: 3,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: isTrainer ? t.accent : '#A855F7',
                }}
              />
              <Text
                style={{
                  color: isTrainer ? t.accent : '#A855F7',
                  fontSize: 9.5,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {isTrainer ? 'Treinador Responsável' : 'Aluno VIP Exclusivo'}
              </Text>
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
              {profile?.name ?? (isTrainer ? 'Aurora Personal' : 'Samuel Ferreira')}
            </Text>
            <Text style={{ color: t.muted, fontSize: 11 }} numberOfLines={1}>
              {profile?.email}
            </Text>
          </View>

          {/* Links de Navegação Exclusivos */}
          <View style={{ gap: 3 }}>
            <Text
              style={{
                color: t.muted,
                fontSize: 9.5,
                fontWeight: '700',
                letterSpacing: 1.0,
                textTransform: 'uppercase',
                marginBottom: 4,
                paddingHorizontal: 8,
              }}
            >
              {isTrainer ? 'Menu do Personal' : 'Menu do Aluno'}
            </Text>

            {activeNavItems.map((item, index) => {
              const isActive = pathname.includes(item.route.replace('/', ''));
              return (
                <Link key={index} href={item.route as any} asChild>
                  <Pressable
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 9,
                      paddingHorizontal: 12,
                      borderRadius: 9,
                      backgroundColor: isActive ? t.accentSubtle : pressed ? t.surfaceElevated : 'transparent',
                      borderWidth: 1,
                      borderColor: isActive ? t.accentGlow : 'transparent',
                    })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 15 }}>{item.icon}</Text>
                      <Text
                        style={{
                          color: isActive ? t.accent : '#D1D5DB',
                          fontSize: 12.5,
                          fontWeight: isActive ? '600' : '400',
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>

                    {item.badge ? (
                      <View
                        style={{
                          backgroundColor: isActive ? t.accent : t.surfaceCard,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 5,
                        }}
                      >
                        <Text style={{ color: isActive ? '#FFFFFF' : t.muted, fontSize: 8.5, fontWeight: 'bold' }}>
                          {item.badge}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                </Link>
              );
            })}
          </View>
        </View>

        {/* Rodapé da Sidebar: Card Motivacional Clássico (Idêntico ao Tablet) + Perfil */}
        <View style={{ gap: 14 }}>
          {/* Card com a citação de Abraham Lincoln do print */}
          <View
            style={{
              backgroundColor: '#121721',
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.06)',
              gap: 6,
            }}
          >
            <Text style={{ color: t.accent, fontSize: 24, fontWeight: '900', lineHeight: 22 }}>“</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontStyle: 'italic', lineHeight: 16 }}>
              A disciplina é a escolha entre o que você quer agora e o que você mais quer na vida.
            </Text>
            <Text style={{ color: t.accent, fontSize: 10, fontWeight: '700' }}>
              — Abraham Lincoln
            </Text>
          </View>

          {/* Perfil Ativo e Botão de Sair */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: t.border,
              paddingTop: 12,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image
                source={{
                  uri: isTrainer
                    ? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                }}
                style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: t.accent }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }} numberOfLines={1}>
                  {isTrainer ? trainer.name : profile?.name ?? 'Samuel Ferreira'}
                </Text>
                <Text style={{ color: isTrainer ? t.accent : t.muted, fontSize: 11, fontWeight: '600' }}>
                  {isTrainer ? 'Treinador Titular' : 'Aluno VIP'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={async () => {
                await signOut();
                router.replace('/');
              }}
              style={{
                backgroundColor: t.surfaceElevated,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: t.muted, fontSize: 11, fontWeight: '600' }}>Encerrar Sessão</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 2. ÁREA CENTRAL EXPANSIVA DE CONTEÚDO */}
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {children}
      </View>
    </View>
  );
}
