import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionLog } from '../domain/types';

const KEY = 'session_logs_v1';

export async function loadLogs(): Promise<SessionLog[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionLog[]) : [];
  } catch {
    return [];
  }
}

// Lança erro se não conseguir salvar, para a tela manter o treino e deixar tentar de novo.
export async function appendLog(log: SessionLog): Promise<SessionLog[]> {
  const current = await loadLogs();
  const logs = [...current, log];
  await AsyncStorage.setItem(KEY, JSON.stringify(logs));
  return logs;
}
