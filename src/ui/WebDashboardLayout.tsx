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
    { label: 'Alunos & Prontuários 360°', icon: '👥', route: '/alunos', badge: 'GESTÃO' },
    { label: 'Central de Treinos & Prescrição', icon: '📚', route: '/biblioteca', badge: 'PRO' },
    { label: 'Financeiro & Fluxo de Caixa', icon: '💰', route: '/financeiro', badge: 'NOVO' },
  ];

  // Menus estritamente específicos para o Aluno
  const studentNavItems: NavItem[] = [
    { label: 'Treino de Hoje', icon: '🏋️‍♂️', route: '/hoje' },
    { label: 'Dieta & Macros', icon: '🥗', route: '/dieta' },
    { label: 'Avaliação & Fotos', icon: '📈', route: '/progresso' },
    { label: 'Meu Treinador', icon: '👤', route: '/treinador' },
  ];

  const activeNavItems = isTrainer ? trainerNavItems : studentNavItems;

  const handleToggleRole = () => {
    if (isTrainer) {
      enterDemoMode('student');
      router.replace('/hoje');
    } else {
      enterDemoMode('trainer');
      router.replace('/radar');
    }
  };

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
          width: 275,
          backgroundColor: '#0C1017',
          borderRightWidth: 1,
          borderRightColor: t.border,
          padding: 20,
          justifyContent: 'space-between',
        }}
      >
        {/* Topo da Sidebar: Marca do Estúdio */}
        <View style={{ gap: 20 }}>
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
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 }}>
                Personal Trainer
              </Text>
              <Text style={{ color: t.accent, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {isTrainer ? 'Painel do Treinador' : 'Portal do Aluno'}
              </Text>
            </View>
          </Pressable>

          {/* Seletor Instantâneo de Perfil (Aluno vs Treinador) */}
          <Pressable
            onPress={handleToggleRole}
            style={({ pressed }) => ({
              backgroundColor: isTrainer ? 'rgba(198, 244, 50, 0.12)' : t.surfaceElevated,
              borderRadius: 12,
              padding: 10,
              borderWidth: 1,
              borderColor: isTrainer ? t.accent : t.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ gap: 2 }}>
              <Text style={{ color: t.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                VISÃO ATUAL
              </Text>
              <Text style={{ color: isTrainer ? t.accent : '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                {isTrainer ? '⚡ Painel do Treinador' : '👤 Área do Aluno'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isTrainer ? t.accent : t.surfaceCard,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: isTrainer ? t.accentText : t.muted, fontSize: 10, fontWeight: '800' }}>
                Alternar ⇄
              </Text>
            </View>
          </Pressable>

          {/* Links de Navegação Exclusivos */}
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: t.muted,
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 6,
                paddingHorizontal: 10,
              }}
            >
              {isTrainer ? 'Menu do Personal' : 'Menu do Aluno'}
            </Text>

            {activeNavItems.map((item, index) => {
              const isActive = pathname.includes(item.route.replace('/', ''));
              return (
                <Pressable
                  key={index}
                  onPress={() => router.push(item.route as any)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    backgroundColor: isActive ? `${t.accent}18` : pressed ? t.surfaceElevated : 'transparent',
                    borderLeftWidth: isActive ? 3 : 0,
                    borderLeftColor: t.accent,
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                    <Text
                      style={{
                        color: isActive ? t.accent : t.text,
                        fontSize: 13,
                        fontWeight: isActive ? '700' : '500',
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
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: isActive ? t.accentText : t.muted, fontSize: 9, fontWeight: 'bold' }}>
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
              paddingVertical: 7,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: t.muted, fontSize: 11, fontWeight: '600' }}>Encerrar Sessão</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. ÁREA CENTRAL EXPANSIVA DE CONTEÚDO */}
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        {children}
      </View>
    </View>
  );
}
