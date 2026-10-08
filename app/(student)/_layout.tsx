import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../../src/state/AuthContext';
import { CustomBottomTabBar, useTabOptions } from '../../src/ui/tabs';
import { Body, Button, Card, Title } from '../../src/ui/components';

export default function StudentTabs() {
  const { profile, loading } = useAuth();
  const options = useTabOptions();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.replace('/');
      } else if (profile.role !== 'student') {
        // Treinador tentando acessar área de aluno -> redireciona para o radar do treinador
        router.replace('/radar');
      }
    }
  }, [profile, loading]);

  if (!loading && (!profile || profile.role !== 'student')) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050811', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Card style={{ maxWidth: 400, alignItems: 'center', gap: 12 }}>
          <Title size={20}>Área Exclusiva do Aluno</Title>
          <Body muted style={{ textAlign: 'center' }}>
            Esta área é destinada exclusivamente aos treinos e acompanhamento do aluno.
          </Body>
          <Button
            title={profile ? 'Ir para o Painel do Treinador' : 'Ir para a Tela de Login'}
            onPress={() => router.replace(profile ? '/radar' : '/')}
          />
        </Card>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={options}
      tabBar={(props) => <CustomBottomTabBar {...props} />}
    >
      <Tabs.Screen
        name="hoje"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 16, color }}>⚡</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="dieta"
        options={{
          title: 'Nutrição',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 16, color }}>🥗</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          title: 'Evolução',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 16, color }}>📈</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="treinador"
        options={{
          title: 'Treinador',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 16, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
