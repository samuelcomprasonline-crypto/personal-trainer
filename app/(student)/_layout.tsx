import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../../src/state/AuthContext';
import { useTabOptions } from '../../src/ui/tabs';
import { Body, Button, Card, Title } from '../../src/ui/components';

export default function StudentTabs() {
  const { profile, loading } = useAuth();
  const options = useTabOptions();

  useEffect(() => {
    if (!loading && !profile) {
      router.replace('/');
    }
  }, [profile, loading]);

  if (!loading && !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050811', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Card style={{ maxWidth: 400, alignItems: 'center', gap: 12 }}>
          <Title size={20}>Sessão Não Iniciada</Title>
          <Body muted style={{ textAlign: 'center' }}>Faça login para acessar o seu portal do aluno.</Body>
          <Button title="Ir para a Tela de Login" onPress={() => router.replace('/')} />
        </Card>
      </View>
    );
  }

  return (
    <Tabs screenOptions={options}>
      <Tabs.Screen
        name="hoje"
        options={{
          title: 'Treinos & Hoje',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>🏋️‍♂️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="dieta"
        options={{
          title: 'Dieta & Macros',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>🥗</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          title: 'Avaliação & 3D',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>📈</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="treinador"
        options={{
          title: 'Treinador',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
