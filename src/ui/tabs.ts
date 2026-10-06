import { useTheme } from './theme';

export function useTabOptions() {
  const t = useTheme();
  return {
    headerShown: false,
    tabBarActiveTintColor: t.accent,
    tabBarInactiveTintColor: t.muted,
    tabBarStyle: {
      backgroundColor: '#0D1117',
      borderTopColor: '#1E2633',
      borderTopWidth: 1,
      height: 62,
      paddingBottom: 10,
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '700' as const,
      letterSpacing: 0.3,
    },
  };
}
