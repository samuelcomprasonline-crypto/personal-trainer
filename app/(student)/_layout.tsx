import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTabOptions } from '../../src/ui/tabs';

export default function StudentTabs() {
  const options = useTabOptions();
  return (
    <Tabs screenOptions={options}>
      <Tabs.Screen
        name="hoje"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>⚡</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          title: 'Progresso',
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
