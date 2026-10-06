import { Tabs } from 'expo-router';
import { useTabOptions } from '../../src/ui/tabs';

export default function StudentTabs() {
  return (
    <Tabs screenOptions={useTabOptions()}>
      <Tabs.Screen name="hoje" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="progresso" options={{ title: 'Progresso' }} />
      <Tabs.Screen name="treinador" options={{ title: 'Treinador' }} />
    </Tabs>
  );
}
