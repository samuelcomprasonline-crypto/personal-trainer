import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './theme';

type FilterType = 'ALL' | 'PUSH UP' | 'DEADLIFT' | 'SQUAT' | 'OVERHEAD PRESS';

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  workoutName: string;
  badge: string;
  reps: number;
  calories: number;
  duration: string;
  image: any;
  category: 'PUSH UP' | 'DEADLIFT' | 'SQUAT' | 'OVERHEAD PRESS';
}

export function WorkoutHistoryView() {
  const t = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

  const pushupImg = require('../../assets/exercise_pushup.jpg');
  const deadliftImg = require('../../assets/exercise_deadlift.jpg');
  const squatImg = require('../../assets/exercise_squat.jpg');
  const overheadImg = require('../../assets/exercise_overhead_press.jpg');

  const historyItems: HistoryItem[] = [
    {
      id: 'h1',
      date: 'May 20, 2024',
      time: '7:30 PM',
      workoutName: 'PUSH UP',
      badge: 'GOOD FORM',
      reps: 20,
      calories: 86,
      duration: '05:12',
      image: pushupImg,
      category: 'PUSH UP',
    },
    {
      id: 'h2',
      date: 'May 20, 2024',
      time: '6:45 AM',
      workoutName: 'DEADLIFT',
      badge: 'GOOD FORM',
      reps: 15,
      calories: 124,
      duration: '06:23',
      image: deadliftImg,
      category: 'DEADLIFT',
    },
    {
      id: 'h3',
      date: 'May 19, 2024',
      time: '7:10 PM',
      workoutName: 'BACK SQUAT',
      badge: 'GOOD FORM',
      reps: 20,
      calories: 112,
      duration: '06:18',
      image: squatImg,
      category: 'SQUAT',
    },
    {
      id: 'h4',
      date: 'May 19, 2024',
      time: '6:30 AM',
      workoutName: 'OVERHEAD PRESS',
      badge: 'GOOD FORM',
      reps: 15,
      calories: 98,
      duration: '05:45',
      image: overheadImg,
      category: 'OVERHEAD PRESS',
    },
    {
      id: 'h5',
      date: 'May 18, 2024',
      time: '7:20 PM',
      workoutName: 'PUSH UP',
      badge: 'GOOD FORM',
      reps: 25,
      calories: 95,
      duration: '05:36',
      image: pushupImg,
      category: 'PUSH UP',
    },
    {
      id: 'h6',
      date: 'May 18, 2024',
      time: '6:40 AM',
      workoutName: 'DEADLIFT',
      badge: 'GOOD FORM',
      reps: 12,
      calories: 102,
      duration: '05:50',
      image: deadliftImg,
      category: 'DEADLIFT',
    },
    {
      id: 'h7',
      date: 'May 17, 2024',
      time: '7:00 PM',
      workoutName: 'BACK SQUAT',
      badge: 'GOOD FORM',
      reps: 18,
      calories: 99,
      duration: '05:58',
      image: squatImg,
      category: 'SQUAT',
    },
    {
      id: 'h8',
      date: 'May 17, 2024',
      time: '6:30 AM',
      workoutName: 'OVERHEAD PRESS',
      badge: 'GOOD FORM',
      reps: 15,
      calories: 93,
      duration: '05:40',
      image: overheadImg,
      category: 'OVERHEAD PRESS',
    },
  ];

  const filtered = selectedFilter === 'ALL'
    ? historyItems
    : historyItems.filter((item) => item.category === selectedFilter);

  return (
    <View style={styles.container}>
      {/* 1. CABEÇALHO COM TÍTULO E ÍCONE DE CALENDÁRIO */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>HISTORY</Text>
          <Text style={styles.headerSubtitle}>Track your progress. Every rep counts.</Text>
        </View>

        <Pressable style={styles.calendarBtn}>
          <Text style={{ fontSize: 18 }}>📅</Text>
        </Pressable>
      </View>

      {/* 2. OS 4 CARDS DE MÉTRICAS DO TOPO */}
      <View style={styles.metricsGrid}>
        {/* TOTAL WORKOUTS */}
        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Text style={{ fontSize: 16 }}>🗓️</Text>
          </View>
          <Text style={styles.metricLabel}>TOTAL WORKOUTS</Text>
          <Text style={styles.metricValue}>28</Text>
          <Text style={styles.metricSub}>Sessions</Text>
        </View>

        {/* TOTAL REPS */}
        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
            <Text style={{ fontSize: 16 }}>🏋️</Text>
          </View>
          <Text style={styles.metricLabel}>TOTAL REPS</Text>
          <Text style={styles.metricValue}>1,248</Text>
          <Text style={styles.metricSub}>Reps</Text>
        </View>

        {/* TOTAL CALORIES */}
        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
            <Text style={{ fontSize: 16 }}>🔥</Text>
          </View>
          <Text style={styles.metricLabel}>TOTAL CALORIES</Text>
          <Text style={styles.metricValue}>9,568</Text>
          <Text style={styles.metricSub}>KCAL</Text>
        </View>

        {/* TOTAL TIME */}
        <View style={styles.metricCard}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
            <Text style={{ fontSize: 16 }}>⏱️</Text>
          </View>
          <Text style={styles.metricLabel}>TOTAL TIME</Text>
          <Text style={styles.metricValue}>18h 42m</Text>
          <Text style={styles.metricSub}>Duration</Text>
        </View>
      </View>

      {/* 3. FILTROS HORIZONTAIS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
        {(['ALL', 'PUSH UP', 'DEADLIFT', 'SQUAT', 'OVERHEAD PRESS'] as FilterType[]).map((f) => {
          const isActive = selectedFilter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setSelectedFilter(f)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 4. CABEÇALHO DA TABELA */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.colHeader, { flex: 2 }]}>DATE ↓</Text>
        <Text style={[styles.colHeader, { flex: 3.2 }]}>WORKOUT</Text>
        <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'center' }]}>REPS</Text>
        <Text style={[styles.colHeader, { flex: 1.8, textAlign: 'center' }]}>CALORIES</Text>
        <Text style={[styles.colHeader, { flex: 1.8, textAlign: 'right' }]}>DURATION</Text>
      </View>

      {/* 5. LISTA DE CARDS DE HISTÓRICO COM FOTOS REAIS */}
      <View style={{ gap: 8 }}>
        {filtered.map((item) => (
          <View key={item.id} style={styles.rowCard}>
            {/* DATA & HORA */}
            <View style={{ flex: 2 }}>
              <Text style={styles.rowDateText}>{item.date}</Text>
              <Text style={styles.rowTimeText}>{item.time}</Text>
            </View>

            {/* FOTO & NOME DO EXERCÍCIO */}
            <View style={{ flex: 3.2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image source={item.image} style={styles.exerciseThumbnail} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowWorkoutTitle}>{item.workoutName}</Text>
                <View style={styles.goodFormBadge}>
                  <Text style={styles.goodFormText}>✔ {item.badge}</Text>
                </View>
              </View>
            </View>

            {/* REPS */}
            <View style={{ flex: 1.5, alignItems: 'center' }}>
              <Text style={styles.rowRepsValue}>{item.reps}</Text>
              <Text style={styles.rowRepsUnit}>REPS</Text>
            </View>

            {/* CALORIAS */}
            <View style={{ flex: 1.8, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={{ fontSize: 13 }}>🔥</Text>
                <Text style={styles.rowCalValue}>{item.calories}</Text>
              </View>
              <Text style={styles.rowCalUnit}>KCAL</Text>
            </View>

            {/* DURAÇÃO */}
            <View style={{ flex: 1.8, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 4 }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.rowDurationValue}>{item.duration}</Text>
                <Text style={{ color: '#A855F7', fontSize: 12 }}>⏱️</Text>
              </View>
              <Text style={{ color: '#475569', fontSize: 14, marginLeft: 2 }}>›</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 6. WEEKLY SUMMARY BAR (RODAPÉ RESUMO SEMANAL) */}
      <View style={styles.weeklySummaryCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 2 }}>
          <View style={styles.summaryBarIcon}>
            <Text style={{ fontSize: 16 }}>📊</Text>
          </View>
          <View>
            <Text style={styles.summaryTitle}>WEEKLY SUMMARY</Text>
            <Text style={styles.summaryDates}>May 14 – May 20, 2024</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 3, justifyContent: 'flex-end' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.summaryStatValue, { color: '#38BDF8' }]}>8</Text>
            <Text style={styles.summaryStatLabel}>WORKOUTS</Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.summaryStatValue, { color: '#4ADE80' }]}>140</Text>
            <Text style={styles.summaryStatLabel}>REPS</Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.summaryStatValue, { color: '#FB923C' }]}>809</Text>
            <Text style={styles.summaryStatLabel}>KCAL</Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.summaryStatValue, { color: '#C084FC' }]}>00:46:42</Text>
            <Text style={styles.summaryStatLabel}>DURATION</Text>
          </View>

          <Text style={{ color: '#64748B', fontSize: 18 }}>›</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 78,
    backgroundColor: '#0A0F1D',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  metricSub: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  filterBar: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  colHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0E1A',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  rowDateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rowTimeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  exerciseThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  rowWorkoutTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  goodFormBadge: {
    marginTop: 3,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  goodFormText: {
    color: '#22C55E',
    fontSize: 9,
    fontWeight: '800',
  },
  rowRepsValue: {
    color: '#22C55E',
    fontSize: 15,
    fontWeight: '900',
  },
  rowRepsUnit: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  rowCalValue: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '900',
  },
  rowCalUnit: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  rowDurationValue: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  weeklySummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C1222',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    marginTop: 8,
  },
  summaryBarIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  summaryDates: {
    color: '#64748B',
    fontSize: 10,
  },
  summaryStatValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  summaryStatLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
