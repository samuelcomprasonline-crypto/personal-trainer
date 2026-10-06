import { useState } from 'react';
import { View } from 'react-native';
import { equipmentLabel, exercises, muscleLabel, trainer } from '../../src/data/seed';
import { Body, Card, Chip, Label, Screen, Title } from '../../src/ui/components';

export default function Biblioteca() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const filtered = selectedMuscle
    ? exercises.filter((e) => e.primaryMuscle === selectedMuscle)
    : exercises;

  return (
    <Screen>
      <Label>{trainer.name}</Label>
      <Title>Biblioteca de Exercícios</Title>
      <Body muted>
        Base técnica com cadência biomecânica, padrão motor e incrementos de sobrecarga progressiva.
      </Body>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip
          label="Todos"
          selected={selectedMuscle === null}
          onPress={() => setSelectedMuscle(null)}
        />
        {Object.entries(muscleLabel).map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            selected={selectedMuscle === key}
            onPress={() => setSelectedMuscle(key)}
          />
        ))}
      </View>

      <View style={{ gap: 12, marginTop: 8 }}>
        {filtered.map((e) => (
          <Card key={e.id}>
            <Title size={20}>{e.name}</Title>
            <Body muted>
              Músculo principal: {muscleLabel[e.primaryMuscle] ?? e.primaryMuscle} · Equipamento: {equipmentLabel[e.equipment] ?? e.equipment}
            </Body>
            <Body muted>
              Padrão de movimento: {e.movementPattern} · Incremento padrão: +{e.loadIncrement} kg
            </Body>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
