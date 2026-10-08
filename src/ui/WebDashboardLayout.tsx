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
    { label: 'Radar', icon: '📡', route: '/radar' },
    { label: 'Prescrever', icon: '⚡', route: '/prescrever-dieta' },
    { label: 'Alunos 360°', icon: '👥', route: '/alunos' },
    { label: 'Central', icon: '📚', route: '/biblioteca' },
    { label: 'Financeiro', icon: '💰', route: '/financeiro' },
  ];

  // Menus estritamente específicos para o Aluno (Prompt Aurora Studio)
  const studentNavItems: NavItem[] = [
    { label: 'Hoje', icon: '⚡', route: '/hoje' },
    { label: 'Treino', icon: '🏋️‍♂️', route: '/treino' },
    { label: 'Evolução', icon: '📈', route: '/progresso' },
    { label: 'Nutrição', icon: '🥗', route: '/dieta' },
    { label: 'Perfil', icon: '👤', route: '/treinador' },
  ];

  const activeNavItems = isTrainer ? trainerNavItems : studentNavItems;

  const isAuthRoute =
    pathname === '/' || pathname === '/login' || pathname === '/cadastro';

  // Se não for desktop, ou se estiver em tela de autenticação, ou se o usuário não estiver logado:
  if (!isDesktop || isAuthRoute || !profile) {
    return <>{children}</>;
  }

  // Layout de Desktop com Sidebar Lateral Esquerda Estreita e Elegante (Coluna 1)
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#0A0D14' }}>
      {/* 1. SIDEBAR LATERAL ESQUERDA NARROW & MINIMALISTA */}
      <View
        style={{
          width: 230,
          backgroundColor: '#0D0E12',
          borderRightWidth: 1,
          borderRightColor: 'rgba(255, 255, 255, 0.06)',
          paddingHorizontal: 14,
          paddingVertical: 18,
          justifyContent: 'space-between',
        }}
      >
        {/* Topo da Sidebar: Marca do Estúdio e Perfil */}
        <View style={{ gap: 18 }}>
          {/* Logo Minimalista */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(16, 185, 129, 0.4)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>⚡</Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
                AURORA STUDIO
              </Text>
              <Text style={{ color: '#10B981', fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {isTrainer ? 'CENTRO DE COMANDO' : 'PORTAL DO ALUNO'}
              </Text>
            </View>
          </View>

          {/* Cartão de Identificação do Perfil */}
          <View
            style={{
              backgroundColor: '#12151D',
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isTrainer ? '#10B981' : '#38BDF8',
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                {isTrainer ? 'Aurora Personal' : profile?.name ?? 'Samuel Ferreira'}
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 9.5, fontWeight: '500' }}>
                {isTrainer ? 'Treinador Titular' : 'Aluno VIP'}
              </Text>
            </View>
          </View>

          {/* Links de Navegação com Indicador Ativo */}
          <View style={{ gap: 4 }}>
            {activeNavItems.map((item, index) => {
              const isActive = pathname.includes(item.route.replace('/', '')) || (item.route === '/radar' && pathname === '/');
              return (
                <Link key={index} href={item.route as any} asChild>
                  <Pressable
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.08)' : pressed ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                      borderWidth: 1,
                      borderColor: isActive ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                    })}
                  >
                    {/* Indicador Verde Sutil */}
                    {isActive ? (
                      <View
                        style={{
                          width: 3,
                          height: 14,
                          backgroundColor: '#10B981',
                          borderRadius: 2,
                          marginRight: 8,
                        }}
                      />
                    ) : (
                      <View style={{ width: 3, marginRight: 8 }} />
                    )}

                    <Text style={{ fontSize: 14, marginRight: 8 }}>{item.icon}</Text>
                    <Text
                      style={{
                        color: isActive ? '#FFFFFF' : '#8E9AA8',
                        fontSize: 12.5,
                        fontWeight: isActive ? '700' : '500',
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        </View>

        {/* Rodapé: Mini-Avatar com Status Online e Botão Sair Discreto */}
        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)', paddingTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#161B26',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 13 }}>{isTrainer ? '⚡' : '👤'}</Text>
              </View>
              <View style={{ gap: 2 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '700' }} numberOfLines={1}>
                  {isTrainer ? 'Aurora Treinador' : profile?.name?.split(' ')[0] ?? 'Samuel'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                  <Text style={{ color: '#10B981', fontSize: 9.5, fontWeight: '600' }}>Online</Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={async () => {
                await signOut();
                router.replace('/');
              }}
              style={({ pressed }) => ({
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
                backgroundColor: pressed ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              })}
            >
              <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '500' }}>
                Sair ↗
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 2. ÁREA CENTRAL EXPANSIVA DE CONTEÚDO */}
      <View style={{ flex: 1, backgroundColor: '#0A0D14' }}>
        {children}
      </View>
    </View>
  );
}
