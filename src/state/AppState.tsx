import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { appendLog, loadLogs } from '../data/logStore';
import type { SessionLog } from '../domain/types';

type AppState = {
  logs: SessionLog[];
  ready: boolean;
  addLog: (log: SessionLog) => Promise<void>;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadLogs().then((stored) => {
      setLogs(stored);
      setReady(true);
    });
  }, []);

  const addLog = async (log: SessionLog) => {
    const updated = await appendLog(log);
    setLogs(updated);
  };

  return <Ctx.Provider value={{ logs, ready, addLog }}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAppState precisa estar dentro de AppStateProvider');
  return value;
}
