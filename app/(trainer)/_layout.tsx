import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTabOptions } from '../../src/ui/tabs';

export default function TrainerTabs() {
  const options = useTabOptions();
  return (
    <Tabs screenOptions={options}>
      <Tabs.Screen
        name="radar"
        options={{
          title: 'Radar',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>📡</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="alunos"
        options={{
          title: 'Alunos',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="biblioteca"
        options={{
          title: 'Biblioteca',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>📚</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="financeiro"
        options={{
          title: 'Financeiro',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>💰</Text>
          ),
        }}
      />
    </Tabs>
  );
}
