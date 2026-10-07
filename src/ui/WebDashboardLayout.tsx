import { router, usePathname } from 'expo-router';
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
};

export function WebDashboardLayout({ children }: { children: ReactNode }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { profile, signOut } = useAuth();
  const { syncStatus } = useAppState();
  const pathname = usePathname();

  // Itens de navegação profissionais para Desktop (padrão Trainerize / Future / Wellness Project)
  const navItems: NavItem[] = [
    { label: 'Hoje & Painel', icon: '⚡', route: '/hoje' },
    { label: 'Treino do Dia', icon: '🏋️‍♂️', route: '/treino' },
    { label: 'Progresso & 3D', icon: '📈', route: '/progresso' },
    { label: 'Seu Treinador', icon: '👤', route: '/treinador' },
    { label: 'Radar do Personal', icon: '📡', route: '/radar', badge: 'PRO' },
    { label: 'Gestão de Alunos', icon: '👥', route: '/alunos' },
    { label: 'Biblioteca de Treinos', icon: '📚', route: '/biblioteca' },
  ];

  if (!isDesktop) {
    // No celular, renderiza apenas o conteúdo original
    return <>{children}</>;
  }

  // Layout de Desktop com Sidebar Lateral Esquerda e Painel Amplo
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: t.bg }}>
      {/* 1. SIDEBAR LATERAL ESQUERDA FIXA */}
      <View
        style={{
          width: 270,
          backgroundColor: '#0C1017',
          borderRightWidth: 1,
          borderRightColor: t.border,
          padding: 20,
          justifyContent: 'space-between',
        }}
      >
        {/* Topo da Sidebar: Marca do Estúdio */}
        <View style={{ gap: 24 }}>
          <Pressable
            onPress={() => router.replace('/')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: t.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22 }}>🏋️</Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>
                {trainer.name}
              </Text>
              <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                Elite Coaching OS
              </Text>
            </View>
          </Pressable>

          {/* Status do Sistema / Sincronização */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: t.surface,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: syncStatus === 'synced' ? t.accent : '#F59E0B',
              }}
            />
            <Text style={{ color: t.muted, fontSize: 12, fontWeight: '600' }}>
              {syncStatus === 'synced' ? 'Nuvem Conectada' : 'Modo Offline'}
            </Text>
          </View>

          {/* Links de Navegação */}
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: t.muted,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 6,
                paddingHorizontal: 10,
              }}
            >
              Navegação Integrada
            </Text>

            {navItems.map((item, index) => {
              const isActive = pathname.includes(item.route.replace('/', ''));
              return (
                <Pressable
                  key={index}
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: isActive ? `${t.accent}18` : pressed ? t.surfaceElevated : 'transparent',
                    borderLeftWidth: isActive ? 3 : 0,
                    borderLeftColor: t.accent,
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                    <Text
                      style={{
                        color: isActive ? t.accent : t.text,
                        fontSize: 14,
                        fontWeight: isActive ? '700' : '500',
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>

                  {item.badge ? (
                    <View
                      style={{
                        backgroundColor: t.accent,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: t.accentText, fontSize: 9, fontWeight: 'bold' }}>
                        {item.badge}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Rodapé da Sidebar: Perfil Ativo e Botão de Sair */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: t.border,
            paddingTop: 16,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              }}
              style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: t.accent }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }} numberOfLines={1}>
                {profile?.name ?? 'Samuel Ferreira'}
              </Text>
              <Text style={{ color: t.muted, fontSize: 11 }}>
                {profile?.role === 'trainer' ? 'Treinador / Admin' : 'Aluno VIP'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => signOut()}
            style={{
              backgroundColor: t.surfaceElevated,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: t.muted, fontSize: 12, fontWeight: '600' }}>Encerrar Sessão</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. ÁREA CENTRAL EXPANSIVA DE CONTEÚDO (LARGURA AMPLA DO DESKTOP) */}
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {children}
      </View>
    </View>
  );
}
