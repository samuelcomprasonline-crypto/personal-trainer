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

/**
 * -------------------------------------------------------------
 * 1. SINCRONIZAÇÃO DE ALUNOS (STUDENTS)
 * -------------------------------------------------------------
 */
export async function syncStudentToCloud(student: {
  studentId: string;
  name: string;
  email?: string;
  phone?: string;
  monthlyPrice?: number;
  dueDay?: number;
  paymentStatus?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('students').upsert({
      id: student.studentId,
      name: student.name,
      email: student.email ?? null,
      phone: student.phone ?? null,
      monthly_fee: student.monthlyPrice ?? 250,
      billing_due_day: student.dueDay ?? 10,
      status: student.paymentStatus === 'atrasado' ? 'pendente' : 'ativo',
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function pullStudentsFromCloud(): Promise<
  Array<{
    studentId: string;
    name: string;
    email?: string;
    phone?: string;
    monthlyPrice: number;
    dueDay: number;
    paymentStatus: 'pago' | 'pendente' | 'atrasado';
  }>
> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, phone, monthly_fee, billing_due_day, status')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      studentId: row.id,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
      monthlyPrice: Number(row.monthly_fee) || 250,
      dueDay: Number(row.billing_due_day) || 10,
      paymentStatus: (row.status === 'pendente' ? 'pendente' : 'pago') as 'pago' | 'pendente' | 'atrasado',
    }));
  } catch {
    return [];
  }
}

/**
 * -------------------------------------------------------------
 * 2. SINCRONIZAÇÃO DE AVALIAÇÕES FÍSICAS (ASSESSMENTS)
 * -------------------------------------------------------------
 */
export async function syncAssessmentToCloud(assessment: any): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const bio = assessment.bioimpedance;
    const { error } = await supabase.from('assessments').upsert({
      id: assessment.id,
      student_id: assessment.studentId || 'samuel',
      date: assessment.data || new Date().toISOString(),
      peso_kg: bio?.pesoKg ?? null,
      altura_cm: bio?.alturaCm ?? null,
      perc_gordura: bio?.percGordura ?? null,
      massa_muscular_kg: bio?.massaMuscularEsqueleticaKg ?? null,
      agua_total_kg: bio?.aguaTotalKg ?? null,
      gordura_visceral: bio?.gorduraVisceralNivel ?? null,
      bmr_kcal: bio?.bmrKcal ?? null,
      imc: bio?.imc ?? null,
      massa_gorda_kg: bio?.massaGordaKg ?? null,
      data_bioimpedance: bio ?? null,
      data_skinfolds: assessment.skinfolds ?? null,
      data_circumferences: assessment.circumferences ?? null,
      photos: assessment.photos ?? null,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function pullAssessmentsFromCloud(studentId: string): Promise<any[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: true });

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      trainerId: 'trainer-julio-balestrin',
      data: row.date,
      photos: row.photos,
      bioimpedance: row.data_bioimpedance,
      circumferences: row.data_circumferences,
      skinfolds: row.data_skinfolds,
    }));
  } catch {
    return [];
  }
}

/**
 * -------------------------------------------------------------
 * 3. SINCRONIZAÇÃO DE TRANSAÇÕES FINANCEIRAS (FINANCEIRO)
 * -------------------------------------------------------------
 */
export async function syncTransactionToCloud(tx: {
  id: string;
  studentId?: string;
  studentName: string;
  productId?: string;
  productTitle: string;
  category: string;
  amount: number;
  dueDate?: string;
  date?: string;
  status: 'pago' | 'pendente' | 'atrasado';
  notes?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('financial_transactions').upsert({
      id: tx.id,
      student_id: tx.studentId ?? null,
      student_name: tx.studentName,
      product_id: tx.productId ?? null,
      product_title: tx.productTitle,
      category: tx.category,
      amount: tx.amount,
      due_date: tx.dueDate ?? tx.date ?? new Date().toLocaleDateString('pt-BR'),
      paid_at: tx.status === 'pago' ? (tx.date ?? new Date().toISOString()) : null,
      status: tx.status === 'pago' ? 'pago' : 'pendente',
      notes: tx.notes ?? null,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function pullTransactionsFromCloud(): Promise<any[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      studentId: row.student_id ?? undefined,
      studentName: row.student_name,
      productId: row.product_id ?? undefined,
      productTitle: row.product_title,
      category: row.category,
      amount: Number(row.amount),
      dueDate: row.due_date,
      paidAt: row.paid_at ?? undefined,
      status: row.status,
      pixKey: row.pix_key ?? undefined,
      notes: row.notes ?? undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * -------------------------------------------------------------
 * 4. UPLOAD REAL DE FOTOS PARA O SUPABASE STORAGE
 * -------------------------------------------------------------
 */
export async function uploadAssessmentPhotoToStorage(
  uriOrBase64: string,
  studentId: string,
  photoType: 'frente' | 'costas' | 'perfil_direito' | 'perfil_esquerdo' | 'balanca'
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const fileName = `${studentId}_${photoType}_${Date.now()}.jpg`;
    const filePath = `assessments/${studentId}/${fileName}`;

    let body: any;

    if (uriOrBase64.startsWith('data:image')) {
      // Converte data url base64 para Uint8Array
      const base64Data = uriOrBase64.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      body = bytes.buffer;
    } else {
      // Se for URI remota ou local blob
      const response = await fetch(uriOrBase64);
      body = await response.blob();
    }

    const { error: uploadError } = await supabase.storage
      .from('assessment-photos')
      .upload(filePath, body, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Erro ao enviar foto para o Supabase Storage:', uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('assessment-photos')
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl ?? null;
  } catch (err) {
    console.warn('Falha no upload da foto de avaliação:', err);
    return null;
  }
}

