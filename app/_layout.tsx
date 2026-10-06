import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider } from '../src/state/AppState';
import { AuthProvider } from '../src/state/AuthContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AppStateProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="treino" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="login" options={{ presentation: 'card' }} />
          <Stack.Screen name="cadastro" options={{ presentation: 'card' }} />
        </Stack>
      </AppStateProvider>
    </AuthProvider>
  );
}
