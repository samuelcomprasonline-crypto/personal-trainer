import { useWindowDimensions } from 'react-native';
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
