import { Tabs } from 'expo-router';
import { useTabOptions } from '../../src/ui/tabs';

export default function TrainerTabs() {
  return (
    <Tabs screenOptions={useTabOptions()}>
      <Tabs.Screen name="radar" options={{ title: 'Radar' }} />
      <Tabs.Screen name="alunos" options={{ title: 'Alunos' }} />
      <Tabs.Screen name="biblioteca" options={{ title: 'Biblioteca' }} />
    </Tabs>
  );
}
