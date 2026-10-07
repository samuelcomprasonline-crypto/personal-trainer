import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, View } from 'react-native';
import { AppStateProvider } from '../src/state/AppState';
import { AuthProvider } from '../src/state/AuthContext';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  // Na Web ou se as fontes já terminaram (ou deram erro), nunca bloquear com tela branca
  const isReady = loaded || !!error || Platform.OS === 'web';

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050811', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00F0FF" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppStateProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="treino" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="login" options={{ presentation: 'card' }} />
          <Stack.Screen name="cadastro" options={{ presentation: 'card' }} />
        </Stack>
      </AppStateProvider>
    </AuthProvider>
  );
}
