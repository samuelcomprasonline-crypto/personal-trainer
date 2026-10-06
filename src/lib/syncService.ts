import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionLog, SyncStatus } from '../domain/types';
import { isSupabaseConfigured, supabase } from './supabase';

const PENDING_QUEUE_KEY = 'personal_trainer_pending_sync_v1';
const SYNC_STATUS_KEY = 'personal_trainer_sync_status_v1';

export async function getPendingSyncIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function markLogPendingSync(logId: string): Promise<void> {
  try {
    const pending = await getPendingSyncIds();
    if (!pending.includes(logId)) {
      pending.push(logId);
      await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(pending));
    }
  } catch {
    // Falha silenciosa de persistência
  }
}

export async function removeLogFromPending(logIds: string[]): Promise<void> {
  try {
    const pending = await getPendingSyncIds();
    const updated = pending.filter((id) => !logIds.includes(id));
    await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(updated));
  } catch {
    // Falha silenciosa
  }
}

/**
 * Envia logs locais pendentes para o Supabase.
 * Se offline ou sem credenciais, mantém na fila com segurança.
 */
export async function syncPendingLogs(
  studentId: string,
  localLogs: SessionLog[]
): Promise<{ status: SyncStatus; syncedCount: number }> {
  if (!isSupabaseConfigured) {
    return { status: 'offline', syncedCount: 0 };
  }

  const pendingIds = await getPendingSyncIds();
  if (pendingIds.length === 0) {
    return { status: 'synced', syncedCount: 0 };
  }

  const logsToSync = localLogs.filter((log) => pendingIds.includes(log.id));
  if (logsToSync.length === 0) {
    // Fila continha IDs não encontrados, limpa a fila
    await AsyncStorage.removeItem(PENDING_QUEUE_KEY);
    return { status: 'synced', syncedCount: 0 };
  }

  const successfullySyncedIds: string[] = [];

  for (const log of logsToSync) {
    try {
      // 1. Upsert em session_logs (id idempotente gerado no celular)
      const { error: sessionError } = await supabase.from('session_logs').upsert({
        id: log.id,
        student_id: studentId,
        template_session_id: log.templateSessionId,
        week_n: log.weekN,
        completed_at: log.completedAt,
        rpe: log.rpe ?? null,
        mood: log.mood ?? null,
      });

      if (sessionError) {
        console.warn('Erro ao sincronizar session_log:', sessionError.message);
        continue;
      }

      // 2. Inserir set_logs associados
      if (log.sets.length > 0) {
        // Remover sets antigos do mesmo session_log para evitar duplicatas em re-sincronização
        await supabase.from('set_logs').delete().eq('session_log_id', log.id);

        const setRows = log.sets.map((s) => ({
          session_log_id: log.id,
          exercise_id: s.exerciseId,
          set_n: s.setN,
          reps: s.reps,
          load_kg: s.loadKg,
          substituted_from: s.substitutedFrom ?? null,
        }));

        const { error: setsError } = await supabase.from('set_logs').insert(setRows);
        if (setsError) {
          console.warn('Erro ao sincronizar set_logs:', setsError.message);
          continue;
        }
      }

      successfullySyncedIds.push(log.id);
    } catch (err) {
      console.warn('Falha na tentativa de envio do log:', err);
    }
  }

  if (successfullySyncedIds.length > 0) {
    await removeLogFromPending(successfullySyncedIds);
  }

  const remaining = await getPendingSyncIds();
  const status: SyncStatus = remaining.length === 0 ? 'synced' : 'pending';

  return { status, syncedCount: successfullySyncedIds.length };
}

/**
 * Busca histórico remoto do Supabase para unificar com o cache local.
 */
export async function pullRemoteLogs(studentId: string): Promise<SessionLog[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data: sessionRows, error } = await supabase
      .from('session_logs')
      .select('id, template_session_id, week_n, completed_at, rpe, mood')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (error || !sessionRows) return [];

    const result: SessionLog[] = [];

    for (const s of sessionRows) {
      const { data: setRows } = await supabase
        .from('set_logs')
        .select('exercise_id, set_n, reps, load_kg, substituted_from')
        .eq('session_log_id', s.id)
        .order('set_n', { ascending: true });

      result.push({
        id: s.id,
        templateSessionId: s.template_session_id,
        weekN: s.week_n,
        completedAt: s.completed_at,
        rpe: s.rpe ?? undefined,
        mood: s.mood ?? undefined,
        sets: (setRows ?? []).map((row) => ({
          exerciseId: row.exercise_id,
          setN: row.set_n,
          reps: row.reps,
          loadKg: Number(row.load_kg),
          substitutedFrom: row.substituted_from ?? undefined,
        })),
      });
    }

    return result;
  } catch {
    return [];
  }
}
