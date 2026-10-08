import { Platform, useWindowDimensions } from 'react-native';
import { useTheme } from './theme';

export function useTabOptions() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return {
    headerShown: false,
    tabBarActiveTintColor: '#10B981',
    tabBarInactiveTintColor: '#8E9AA8',
    tabBarStyle: isDesktop
      ? { display: 'none' as const }
      : {
          backgroundColor: '#0D0E12',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 26,
          paddingTop: 8,
        },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '700' as const,
      letterSpacing: 0.2,
      marginBottom: 2,
    },
    tabBarItemStyle: {
      paddingVertical: 2,
    },
  };
}
