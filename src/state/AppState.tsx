import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { appendLog, loadLogs } from '../data/logStore';
import type { SessionLog, SyncStatus } from '../domain/types';
import { markLogPendingSync, pullRemoteLogs, syncPendingLogs } from '../lib/syncService';
import { useAuth } from './AuthContext';

type AppState = {
  logs: SessionLog[];
  ready: boolean;
  syncStatus: SyncStatus;
  addLog: (log: SessionLog) => Promise<void>;
  forceSync: () => Promise<void>;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  // Carregar dados locais e tentar sincronizar com Supabase se logado
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const stored = await loadLogs();
      if (!isMounted) return;
      setLogs(stored);
      setReady(true);

      if (user?.id) {
        setSyncStatus('syncing');
        // 1. Enviar pendências
        const { status } = await syncPendingLogs(user.id, stored);
        if (!isMounted) return;
        setSyncStatus(status);

        // 2. Puxar novidades remotas
        const remote = await pullRemoteLogs(user.id);
        if (!isMounted) return;

        if (remote.length > 0) {
          // Mesclar sem duplicatas
          const map = new Map<string, SessionLog>();
          stored.forEach((l) => map.set(l.id, l));
          remote.forEach((l) => map.set(l.id, l));
          const merged = Array.from(map.values()).sort(
            (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt)
          );
          setLogs(merged);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const addLog = async (log: SessionLog) => {
    // 1. Salva localmente com zero latência
    const updated = await appendLog(log);
    setLogs(updated);

    // 2. Marca na fila de sincronização
    await markLogPendingSync(log.id);

    // 3. Tenta sincronizar se estiver logado
    if (user?.id) {
      setSyncStatus('syncing');
      const { status } = await syncPendingLogs(user.id, updated);
      setSyncStatus(status);
    } else {
      setSyncStatus('pending');
    }
  };

  const forceSync = async () => {
    if (!user?.id) return;
    setSyncStatus('syncing');
    const { status } = await syncPendingLogs(user.id, logs);
    setSyncStatus(status);
  };

  return (
    <Ctx.Provider value={{ logs, ready, syncStatus, addLog, forceSync }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppState(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAppState precisa estar dentro de AppStateProvider');
  return value;
}
