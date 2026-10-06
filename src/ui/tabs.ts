import { useTheme } from './theme';

// Abas com tipografia refinada e espaçamento limpo.
export function useTabOptions() {
  const t = useTheme();
  return {
    headerShown: false,
    tabBarIcon: () => null,
    tabBarActiveTintColor: t.accent,
    tabBarInactiveTintColor: t.muted,
    tabBarStyle: {
      backgroundColor: t.bg,
      borderTopColor: t.border,
      height: 56,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontFamily: t.fonts.bodyBold,
      fontSize: 14,
      letterSpacing: 0.3,
    },
  };
}
