# Plano 1 — App rodando no celular (Expo Go) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ter o app (aluno + treinador) abrindo no celular via Expo Go, com a lógica de domínio testada e dados de exemplo salvos no próprio aparelho.

**Architecture:** Um único projeto Expo com expo-router. Grupos de rota `(student)` e `(trainer)` definem as abas de cada perfil; uma tela de entrada escolhe o perfil (a autenticação real entra no Plano 2). Toda regra de negócio fica em `src/domain/` como funções puras com testes Jest; as telas só leem dados de exemplo (`src/data/seed.ts`) e os registros de treino salvos em AsyncStorage.

**Tech Stack:** Expo SDK mais recente (TypeScript), expo-router, AsyncStorage, expo-haptics, @react-native-community/slider, expo-font + Google Fonts (Fraunces, Inter), Jest via jest-expo.

**Spec:** `docs/superpowers/specs/2026-09-22-personal-trainer-app-design.md`

## Roteiro dos planos

1. **Este plano** — app rodando com dados locais.
2. Supabase: login, convite do aluno, schema + RLS, sincronização da fila offline (substitui `logStore`).
3. Treinador completo: editor de modelos, aplicar a alunos, fila de sugestões de carga (`suggestNextLoad`), Radar com dados reais, alternativas aprovadas editáveis, registro de "sem substituto" no Radar.
4. Vídeo de execução + devolutiva (áudio + desenho), Kanban de vídeos, notificações, limpeza de 90 dias.
5. Pagamentos Asaas (sandbox): subcontas, assinatura com split, webhooks.

## Global Constraints

- Custo zero: nenhuma dependência paga, nenhum serviço externo neste plano.
- Sem integração com WhatsApp.
- Um único app; as abas mudam conforme o perfil.
- Cores: fundo `#F7F5F2`, texto `#141414`; um único destaque, a cor do treinador (padrão `#8C6A4F`).
- Tipografia: Fraunces nos títulos, Inter no texto.
- Abas do aluno: Hoje · Progresso · Treinador. Abas do treinador: Radar · Alunos · Biblioteca.
- Durante o treino: modo escuro "estúdio", vibração leve ao marcar série.
- Faltar treino nunca gera vermelho nem atraso.
- Toda a interface em português do Brasil.
- Arquivos de teste nunca dentro de `app/` (o expo-router trataria como rota).

## Estrutura de arquivos

```
app/
  _layout.tsx              # fontes, provider de estado, Stack
  index.tsx                # entrada: escolher perfil (prévia)
  treino.tsx               # execução do treino (modal, paleta estúdio)
  (student)/_layout.tsx    # abas do aluno
  (student)/hoje.tsx
  (student)/progresso.tsx
  (student)/treinador.tsx
  (trainer)/_layout.tsx    # abas do treinador
  (trainer)/radar.tsx
  (trainer)/alunos.tsx
  (trainer)/biblioteca.tsx
src/
  domain/types.ts          # tipos compartilhados
  domain/progression.ts    # carga planejada + dupla progressão
  domain/schedule.ts       # fila de sessões, descanso, consistência
  domain/substitution.ts   # alternativas + última carga
  domain/radar.ts          # snapshot do aluno + itens do Radar
  domain/__tests__/*.test.ts
  data/seed.ts             # dados de exemplo
  data/logStore.ts         # registros de treino no AsyncStorage
  state/AppState.tsx       # contexto com os registros
  ui/theme.ts              # paletas, fontes, useTheme
  ui/components.tsx        # Screen, Title, Body, Label, Card, Button, Chip, LoadStepper
  ui/tabs.ts               # estilo comum das abas
```

---

### Task 1: Criar o projeto Expo com expo-router e Jest

**Files:**
- Create: projeto Expo na raiz do repositório (`package.json`, `app.json`, `tsconfig.json`, etc.)
- Create: `app/index.tsx` (temporário, substituído na Task 6)

**Interfaces:**
- Produces: `npm test` roda Jest com preset `jest-expo`; `npx expo start` abre o app.

- [ ] **Step 1: Gerar o projeto numa pasta temporária e mover para a raiz**

A raiz já tem `docs/` e `.git`, então o gerador não roda direto nela.

```bash
cd ~/Desktop/Personal*Treiner*
npx create-expo-app@latest tmp-app --template blank-typescript --no-install
rsync -a --exclude .git tmp-app/ ./
rm -rf tmp-app
npm install
```

- [ ] **Step 2: Instalar dependências**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
npx expo install expo-font @expo-google-fonts/fraunces @expo-google-fonts/inter @react-native-async-storage/async-storage expo-haptics @react-native-community/slider
npx expo install jest-expo jest @types/jest -- --save-dev
rm -f App.tsx index.ts
```

- [ ] **Step 3: Configurar entrada, scheme e Jest**

```bash
npm pkg set main=expo-router/entry scripts.test=jest jest.preset=jest-expo
node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('app.json','utf8'));j.expo.name='Personal Trainer';j.expo.scheme='personaltrainer';j.expo.plugins=[...new Set([...(j.expo.plugins||[]),'expo-router'])];fs.writeFileSync('app.json',JSON.stringify(j,null,2)+'\n')"
```

- [ ] **Step 4: Criar a tela temporária `app/index.tsx`**

```tsx
import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Personal Trainer — prévia</Text>
    </View>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit` → Expected: sem erros.
Run: `npx expo start` → Expected: QR code no terminal; ao ler com o Expo Go (mesma rede Wi-Fi; senão `npx expo start --tunnel`), o celular mostra "Personal Trainer — prévia". Encerrar com Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Expo app with expo-router and jest"
```

---

### Task 2: Tipos de domínio e progressão de carga

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/progression.ts`
- Test: `src/domain/__tests__/progression.test.ts`

**Interfaces:**
- Produces:
  - Tipos `Mood`, `Exercise`, `TemplateItem`, `TemplateSession`, `Template`, `SetLog`, `SessionLog` (abaixo).
  - `plannedLoad(baseLoadKg: number, weeklyIncrementKg: number, weekN: number): number`
  - `suggestNextLoad(target: { sets: number; repMax: number }, currentLoadKg: number, loadIncrement: number, lastSets: { reps: number }[]): number`

- [ ] **Step 1: Criar `src/domain/types.ts`**

```ts
export type Mood = 'low' | 'ok' | 'great';

export type Exercise = {
  id: string;
  name: string;
  movementPattern: string;
  primaryMuscle: string;
  equipment: string;
  loadIncrement: number;
};

export type TemplateItem = {
  id: string;
  exerciseId: string;
  sets: number;
  repMin: number;
  repMax: number;
  restS: number;
  weeklyIncrementKg: number;
};

export type TemplateSession = {
  id: string;
  name: string;
  position: number;
  items: TemplateItem[];
};

export type Template = {
  id: string;
  name: string;
  weeks: number;
  sessions: TemplateSession[];
};

export type SetLog = {
  exerciseId: string;
  setN: number;
  reps: number;
  loadKg: number;
  substitutedFrom?: string;
};

export type SessionLog = {
  id: string;
  templateSessionId: string;
  weekN: number;
  completedAt: string; // ISO 8601
  rpe?: number;
  mood?: Mood;
  sets: SetLog[];
};
```

- [ ] **Step 2: Escrever o teste que falha — `src/domain/__tests__/progression.test.ts`**

```ts
import { plannedLoad, suggestNextLoad } from '../progression';

describe('plannedLoad', () => {
  it('semana 1 usa a carga base', () => {
    expect(plannedLoad(40, 2, 1)).toBe(40);
  });

  it('soma o incremento a cada semana', () => {
    expect(plannedLoad(40, 2, 4)).toBe(46);
  });
});

describe('suggestNextLoad', () => {
  const target = { sets: 3, repMax: 12 };

  it('sobe a carga quando todas as séries batem o topo da faixa', () => {
    expect(suggestNextLoad(target, 40, 2.5, [{ reps: 12 }, { reps: 12 }, { reps: 13 }])).toBe(42.5);
  });

  it('mantém a carga quando alguma série fica abaixo do topo', () => {
    expect(suggestNextLoad(target, 40, 2.5, [{ reps: 12 }, { reps: 11 }, { reps: 12 }])).toBe(40);
  });

  it('mantém a carga quando faltaram séries', () => {
    expect(suggestNextLoad(target, 40, 2.5, [{ reps: 12 }, { reps: 12 }])).toBe(40);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx jest src/domain/__tests__/progression.test.ts`
Expected: FAIL — `Cannot find module '../progression'`.

- [ ] **Step 4: Implementar `src/domain/progression.ts`**

```ts
export function plannedLoad(baseLoadKg: number, weeklyIncrementKg: number, weekN: number): number {
  return baseLoadKg + (weekN - 1) * weeklyIncrementKg;
}

// Dupla progressão: sobe a carga só quando todas as séries previstas bateram o topo da faixa.
export function suggestNextLoad(
  target: { sets: number; repMax: number },
  currentLoadKg: number,
  loadIncrement: number,
  lastSets: { reps: number }[],
): number {
  const hitTop = lastSets.length >= target.sets && lastSets.every((s) => s.reps >= target.repMax);
  return hitTop ? currentLoadKg + loadIncrement : currentLoadKg;
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx jest src/domain/__tests__/progression.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 6: Commit**

```bash
git add src/domain
git commit -m "feat(domain): add types and load progression"
```

---

### Task 3: Semana fluida — fila, descanso e consistência

**Files:**
- Create: `src/domain/schedule.ts`
- Test: `src/domain/__tests__/schedule.test.ts`

**Interfaces:**
- Consumes: `Template`, `SessionLog` de `types.ts`.
- Produces:
  - `type Slot = { weekN: number; sessionId: string }`
  - `buildQueue(template: Template): Slot[]`
  - `nextSlot(template: Template, logs: SessionLog[]): Slot | null`
  - `shouldRest(logs: SessionLog[], now: Date, minRestHours?: number): boolean`
  - `consistency(logs: SessionLog[], sessionsPerWeek: number, now: Date): number` (0 a 1)

- [ ] **Step 1: Escrever o teste que falha — `src/domain/__tests__/schedule.test.ts`**

```ts
import { buildQueue, consistency, nextSlot, shouldRest } from '../schedule';
import type { SessionLog, Template } from '../types';

const template: Template = {
  id: 't',
  name: 'T',
  weeks: 2,
  sessions: [
    { id: 'B', name: 'B', position: 2, items: [] },
    { id: 'A', name: 'A', position: 1, items: [] },
  ],
};

const HOUR = 60 * 60 * 1000;
const now = new Date('2026-09-22T12:00:00Z');
const ago = (hours: number) => new Date(now.getTime() - hours * HOUR).toISOString();
const log = (weekN: number, sessionId: string, completedAt: string): SessionLog => ({
  id: `${weekN}-${sessionId}-${completedAt}`,
  templateSessionId: sessionId,
  weekN,
  completedAt,
  sets: [],
});

describe('buildQueue', () => {
  it('ordena sessões por posição, semana a semana', () => {
    expect(buildQueue(template)).toEqual([
      { weekN: 1, sessionId: 'A' },
      { weekN: 1, sessionId: 'B' },
      { weekN: 2, sessionId: 'A' },
      { weekN: 2, sessionId: 'B' },
    ]);
  });
});

describe('nextSlot', () => {
  it('começa pela primeira sessão', () => {
    expect(nextSlot(template, [])).toEqual({ weekN: 1, sessionId: 'A' });
  });

  it('segue a fila independentemente de quantos dias passaram', () => {
    expect(nextSlot(template, [log(1, 'A', ago(24 * 10))])).toEqual({ weekN: 1, sessionId: 'B' });
  });

  it('retorna null quando o bloco acabou', () => {
    const all = buildQueue(template).map((s) => log(s.weekN, s.sessionId, ago(48)));
    expect(nextSlot(template, all)).toBeNull();
  });
});

describe('shouldRest', () => {
  it('sugere descanso se o último treino foi há menos de 24 h', () => {
    expect(shouldRest([log(1, 'A', ago(10))], now)).toBe(true);
  });

  it('não sugere descanso depois de 24 h', () => {
    expect(shouldRest([log(1, 'A', ago(30))], now)).toBe(false);
  });

  it('não sugere descanso sem histórico', () => {
    expect(shouldRest([], now)).toBe(false);
  });
});

describe('consistency', () => {
  it('conta só as últimas 4 semanas', () => {
    const logs = [ago(24), ago(48), ago(24 * 10), ago(24 * 20), ago(24 * 40)].map((d, i) => log(1, String(i), d));
    expect(consistency(logs, 2, now)).toBe(0.5); // 4 de 8
  });

  it('limita a 100%', () => {
    const logs = Array.from({ length: 12 }, (_, i) => log(1, String(i), ago(24 * (i + 1))));
    expect(consistency(logs, 2, now)).toBe(1);
  });

  it('é 0 sem sessões planejadas', () => {
    expect(consistency([], 0, now)).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx jest src/domain/__tests__/schedule.test.ts`
Expected: FAIL — `Cannot find module '../schedule'`.

- [ ] **Step 3: Implementar `src/domain/schedule.ts`**

```ts
import type { SessionLog, Template } from './types';

export type Slot = { weekN: number; sessionId: string };

const HOUR_MS = 60 * 60 * 1000;

export function buildQueue(template: Template): Slot[] {
  const ordered = [...template.sessions].sort((a, b) => a.position - b.position);
  const queue: Slot[] = [];
  for (let weekN = 1; weekN <= template.weeks; weekN++) {
    for (const session of ordered) queue.push({ weekN, sessionId: session.id });
  }
  return queue;
}

// O treino de hoje é sempre o próximo da fila: faltar não gera atraso.
export function nextSlot(template: Template, logs: SessionLog[]): Slot | null {
  const done = new Set(logs.map((l) => `${l.weekN}:${l.templateSessionId}`));
  return buildQueue(template).find((s) => !done.has(`${s.weekN}:${s.sessionId}`)) ?? null;
}

export function shouldRest(logs: SessionLog[], now: Date, minRestHours = 24): boolean {
  if (logs.length === 0) return false;
  const last = Math.max(...logs.map((l) => Date.parse(l.completedAt)));
  return now.getTime() - last < minRestHours * HOUR_MS;
}

export function consistency(logs: SessionLog[], sessionsPerWeek: number, now: Date): number {
  if (sessionsPerWeek <= 0) return 0;
  const since = now.getTime() - 28 * 24 * HOUR_MS;
  const recent = logs.filter((l) => Date.parse(l.completedAt) >= since).length;
  return Math.min(1, recent / (sessionsPerWeek * 4));
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx jest src/domain/__tests__/schedule.test.ts`
Expected: PASS (10 testes).

- [ ] **Step 5: Commit**

```bash
git add src/domain
git commit -m "feat(domain): add fluid week queue, rest advice and consistency"
```

---

### Task 4: Substituição inteligente

**Files:**
- Create: `src/domain/substitution.ts`
- Test: `src/domain/__tests__/substitution.test.ts`

**Interfaces:**
- Consumes: `Exercise`, `SessionLog`.
- Produces:
  - `suggestAlternatives(target: Exercise, library: Exercise[], approvedIds: string[], availableEquipment: string[], limit?: number): Exercise[]` — `availableEquipment` vazio = sem filtro de equipamento.
  - `lastLoadFor(exerciseId: string, logs: SessionLog[]): number | null`

- [ ] **Step 1: Escrever o teste que falha — `src/domain/__tests__/substitution.test.ts`**

```ts
import { lastLoadFor, suggestAlternatives } from '../substitution';
import type { Exercise, SessionLog } from '../types';

const ex = (id: string, movementPattern: string, primaryMuscle: string, equipment: string): Exercise => ({
  id,
  name: id,
  movementPattern,
  primaryMuscle,
  equipment,
  loadIncrement: 2.5,
});

const legPress = ex('legPress', 'squat', 'quads', 'machine');
const library = [
  legPress,
  ex('hack', 'squat', 'quads', 'machine'),
  ex('bulgaro', 'lunge', 'quads', 'dumbbell'),
  ex('extensora', 'knee_extension', 'quads', 'machine'),
  ex('supino', 'push', 'chest', 'barbell'),
  ex('goblet', 'squat', 'quads', 'dumbbell'),
];
const ids = (list: Exercise[]) => list.map((e) => e.id);

describe('suggestAlternatives', () => {
  it('coloca primeiro as alternativas aprovadas pelo treinador', () => {
    expect(ids(suggestAlternatives(legPress, library, ['bulgaro'], []))).toEqual(['bulgaro', 'hack', 'goblet']);
  });

  it('sem aprovadas: mesmo padrão + músculo, depois mesmo músculo', () => {
    expect(ids(suggestAlternatives(legPress, library, [], []))).toEqual(['hack', 'goblet', 'bulgaro']);
  });

  it('filtra pelo equipamento disponível', () => {
    expect(ids(suggestAlternatives(legPress, library, ['bulgaro'], ['machine']))).toEqual(['hack', 'extensora']);
  });

  it('nunca sugere o próprio exercício nem outro grupo muscular', () => {
    const result = ids(suggestAlternatives(legPress, library, [], [], 10));
    expect(result).not.toContain('legPress');
    expect(result).not.toContain('supino');
  });
});

describe('lastLoadFor', () => {
  const logs: SessionLog[] = [
    { id: '1', templateSessionId: 'A', weekN: 1, completedAt: '2026-09-01T10:00:00Z', sets: [{ exerciseId: 'hack', setN: 1, reps: 10, loadKg: 80 }] },
    { id: '2', templateSessionId: 'A', weekN: 2, completedAt: '2026-09-08T10:00:00Z', sets: [{ exerciseId: 'hack', setN: 1, reps: 10, loadKg: 90 }] },
  ];

  it('retorna a carga mais recente', () => {
    expect(lastLoadFor('hack', logs)).toBe(90);
  });

  it('retorna null sem histórico', () => {
    expect(lastLoadFor('goblet', logs)).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx jest src/domain/__tests__/substitution.test.ts`
Expected: FAIL — `Cannot find module '../substitution'`.

- [ ] **Step 3: Implementar `src/domain/substitution.ts`**

```ts
import type { Exercise, SessionLog } from './types';

// Ordem: aprovadas pelo treinador → mesmo padrão + músculo → mesmo músculo.
// availableEquipment vazio significa "equipamento desconhecido": não filtra.
export function suggestAlternatives(
  target: Exercise,
  library: Exercise[],
  approvedIds: string[],
  availableEquipment: string[],
  limit = 3,
): Exercise[] {
  const usable = library.filter(
    (e) => e.id !== target.id && (availableEquipment.length === 0 || availableEquipment.includes(e.equipment)),
  );
  const approved = approvedIds
    .map((id) => usable.find((e) => e.id === id))
    .filter((e): e is Exercise => e !== undefined);
  const samePattern = usable.filter(
    (e) => e.movementPattern === target.movementPattern && e.primaryMuscle === target.primaryMuscle,
  );
  const sameMuscle = usable.filter((e) => e.primaryMuscle === target.primaryMuscle);
  const ranked = [...approved, ...samePattern, ...sameMuscle];
  return ranked.filter((e, i) => ranked.findIndex((x) => x.id === e.id) === i).slice(0, limit);
}

export function lastLoadFor(exerciseId: string, logs: SessionLog[]): number | null {
  const newestFirst = [...logs].sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  for (const log of newestFirst) {
    const set = log.sets.find((s) => s.exerciseId === exerciseId);
    if (set) return set.loadKg;
  }
  return null;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx jest src/domain/__tests__/substitution.test.ts`
Expected: PASS (6 testes).

- [ ] **Step 5: Commit**

```bash
git add src/domain
git commit -m "feat(domain): add exercise substitution ranking"
```

---

### Task 5: Radar do treinador

**Files:**
- Create: `src/domain/radar.ts`
- Test: `src/domain/__tests__/radar.test.ts`

**Interfaces:**
- Consumes: `SessionLog`; `consistency` de `schedule.ts`.
- Produces:
  - `type RadarKind = 'video' | 'adherence' | 'stalled' | 'rpe'`
  - `type RadarItem = { kind: RadarKind; studentId: string; refId?: string; label: string }`
  - `type StudentSnapshot = { studentId: string; name: string; consistency: number; recentRpes: number[]; loadHistory: Record<string, { exerciseName: string; loads: number[] }>; pendingVideoIds: string[] }` (listas do mais antigo ao mais recente)
  - `isStalled(loads: number[]): boolean`
  - `buildRadar(students: StudentSnapshot[]): RadarItem[]`
  - `snapshotFromLogs(studentId: string, name: string, logs: SessionLog[], sessionsPerWeek: number, now: Date, exerciseNames: Record<string, string>): StudentSnapshot`

- [ ] **Step 1: Escrever o teste que falha — `src/domain/__tests__/radar.test.ts`**

```ts
import { buildRadar, isStalled, snapshotFromLogs, type StudentSnapshot } from '../radar';
import type { SessionLog } from '../types';

const base: StudentSnapshot = {
  studentId: 's',
  name: 'Ana',
  consistency: 0.8,
  recentRpes: [],
  loadHistory: {},
  pendingVideoIds: [],
};

describe('isStalled', () => {
  it('detecta 3 sessões sem aumento', () => {
    expect(isStalled([50, 60, 60, 60, 60])).toBe(true);
  });

  it('não marca quando houve aumento recente', () => {
    expect(isStalled([60, 60, 60, 62.5])).toBe(false);
  });

  it('precisa de pelo menos 4 sessões', () => {
    expect(isStalled([60, 60, 60])).toBe(false);
  });
});

describe('buildRadar', () => {
  it('não gera nada para aluno em dia', () => {
    expect(buildRadar([base])).toEqual([]);
  });

  it('consistência de exatamente 50% não é alerta', () => {
    expect(buildRadar([{ ...base, consistency: 0.5 }])).toEqual([]);
  });

  it('marca RPE ≥ 9 nas 3 últimas sessões', () => {
    expect(buildRadar([{ ...base, recentRpes: [6, 9, 9, 10] }]).map((i) => i.kind)).toEqual(['rpe']);
    expect(buildRadar([{ ...base, recentRpes: [9, 9, 8] }])).toEqual([]);
  });

  it('ordena: vídeo → aderência → carga → esforço', () => {
    const items = buildRadar([
      { ...base, studentId: 'a', recentRpes: [9, 9, 9] },
      { ...base, studentId: 'b', loadHistory: { supino: { exerciseName: 'Supino', loads: [60, 60, 60, 60] } } },
      { ...base, studentId: 'c', consistency: 0.2 },
      { ...base, studentId: 'd', pendingVideoIds: ['v1'] },
    ]);
    expect(items.map((i) => i.kind)).toEqual(['video', 'adherence', 'stalled', 'rpe']);
    expect(items[2].refId).toBe('supino');
  });
});

describe('snapshotFromLogs', () => {
  it('monta histórico de carga e RPE em ordem cronológica', () => {
    const logs: SessionLog[] = [
      { id: '2', templateSessionId: 'A', weekN: 2, completedAt: '2026-09-10T10:00:00Z', rpe: 9, sets: [{ exerciseId: 'hack', setN: 1, reps: 10, loadKg: 90 }] },
      { id: '1', templateSessionId: 'A', weekN: 1, completedAt: '2026-09-03T10:00:00Z', rpe: 7, sets: [{ exerciseId: 'hack', setN: 1, reps: 10, loadKg: 80 }, { exerciseId: 'hack', setN: 2, reps: 8, loadKg: 85 }] },
    ];
    const snap = snapshotFromLogs('s', 'Ana', logs, 2, new Date('2026-09-12T10:00:00Z'), { hack: 'Hack Machine' });
    expect(snap.loadHistory).toEqual({ hack: { exerciseName: 'Hack Machine', loads: [85, 90] } });
    expect(snap.recentRpes).toEqual([7, 9]);
    expect(snap.consistency).toBe(0.25);
    expect(snap.pendingVideoIds).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx jest src/domain/__tests__/radar.test.ts`
Expected: FAIL — `Cannot find module '../radar'`.

- [ ] **Step 3: Implementar `src/domain/radar.ts`**

```ts
import { consistency } from './schedule';
import type { SessionLog } from './types';

export type RadarKind = 'video' | 'adherence' | 'stalled' | 'rpe';

export type RadarItem = { kind: RadarKind; studentId: string; refId?: string; label: string };

export type StudentSnapshot = {
  studentId: string;
  name: string;
  consistency: number;
  recentRpes: number[]; // mais antigo → mais recente
  loadHistory: Record<string, { exerciseName: string; loads: number[] }>; // mais antigo → mais recente
  pendingVideoIds: string[];
};

const ORDER: RadarKind[] = ['video', 'adherence', 'stalled', 'rpe'];

// "Sem aumento de carga em 3 sessões seguidas": as 3 últimas não passam da anterior a elas.
export function isStalled(loads: number[]): boolean {
  if (loads.length < 4) return false;
  const before = loads[loads.length - 4];
  return loads.slice(-3).every((l) => l <= before);
}

export function buildRadar(students: StudentSnapshot[]): RadarItem[] {
  const items: RadarItem[] = [];
  for (const s of students) {
    for (const videoId of s.pendingVideoIds) {
      items.push({ kind: 'video', studentId: s.studentId, refId: videoId, label: `${s.name} enviou um vídeo para avaliação` });
    }
    if (s.consistency < 0.5) {
      items.push({
        kind: 'adherence',
        studentId: s.studentId,
        label: `${s.name}: consistência de ${Math.round(s.consistency * 100)}% nas últimas 4 semanas`,
      });
    }
    for (const [exerciseId, history] of Object.entries(s.loadHistory)) {
      if (isStalled(history.loads)) {
        items.push({
          kind: 'stalled',
          studentId: s.studentId,
          refId: exerciseId,
          label: `${s.name}: ${history.exerciseName} sem aumento de carga há 3 sessões`,
        });
      }
    }
    const lastRpes = s.recentRpes.slice(-3);
    if (lastRpes.length === 3 && lastRpes.every((r) => r >= 9)) {
      items.push({ kind: 'rpe', studentId: s.studentId, label: `${s.name}: esforço 9+ nas últimas 3 sessões` });
    }
  }
  return items.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
}

export function snapshotFromLogs(
  studentId: string,
  name: string,
  logs: SessionLog[],
  sessionsPerWeek: number,
  now: Date,
  exerciseNames: Record<string, string>,
): StudentSnapshot {
  const ordered = [...logs].sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
  const loadHistory: StudentSnapshot['loadHistory'] = {};
  for (const log of ordered) {
    const maxByExercise = new Map<string, number>();
    for (const set of log.sets) {
      maxByExercise.set(set.exerciseId, Math.max(maxByExercise.get(set.exerciseId) ?? 0, set.loadKg));
    }
    for (const [exerciseId, load] of maxByExercise) {
      loadHistory[exerciseId] ??= { exerciseName: exerciseNames[exerciseId] ?? exerciseId, loads: [] };
      loadHistory[exerciseId].loads.push(load);
    }
  }
  return {
    studentId,
    name,
    consistency: consistency(logs, sessionsPerWeek, now),
    recentRpes: ordered.flatMap((l) => (l.rpe === undefined ? [] : [l.rpe])),
    loadHistory,
    pendingVideoIds: [], // vídeos entram no Plano 4
  };
}
```

- [ ] **Step 4: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS — 4 arquivos, todos os testes verdes.

- [ ] **Step 5: Commit**

```bash
git add src/domain
git commit -m "feat(domain): add trainer radar and student snapshot"
```

---

### Task 6: Tema, dados de exemplo, estado local e tela de entrada

**Files:**
- Create: `src/data/seed.ts`, `src/data/logStore.ts`, `src/state/AppState.tsx`
- Create: `src/ui/theme.ts`, `src/ui/components.tsx`, `src/ui/tabs.ts`
- Create: `app/_layout.tsx`
- Modify: `app/index.tsx` (substitui a tela temporária)

**Interfaces:**
- Consumes: tipos e `StudentSnapshot` das Tasks 2–5.
- Produces:
  - `seed.ts`: `trainer`, `exercises`, `exerciseById(id)`, `approvedAlternatives`, `template`, `baseLoads`, `studentEquipment`, `otherStudents`, `muscleLabel`, `equipmentLabel`.
  - `logStore.ts`: `loadLogs(): Promise<SessionLog[]>`, `appendLog(log): Promise<SessionLog[]>` (lança erro se não salvar).
  - `AppState.tsx`: `AppStateProvider`, `useAppState(): { logs: SessionLog[]; ready: boolean; addLog(log): Promise<void> }`.
  - `theme.ts`: `Palette`, `useTheme()`, `studioPalette`, `PaletteOverride`.
  - `components.tsx`: `Screen`, `Title`, `Body`, `Label`, `Card`, `Button`, `Chip`, `LoadStepper`.
  - `tabs.ts`: `useTabOptions()`.

- [ ] **Step 1: Criar `src/data/seed.ts`**

```ts
import type { StudentSnapshot } from '../domain/radar';
import type { Exercise, Template } from '../domain/types';

export const trainer = { name: 'Studio Aurora', brandColor: '#8C6A4F' };

export const exercises: Exercise[] = [
  { id: 'leg-press', name: 'Leg Press 45º', movementPattern: 'squat', primaryMuscle: 'quads', equipment: 'machine', loadIncrement: 10 },
  { id: 'hack', name: 'Hack Machine', movementPattern: 'squat', primaryMuscle: 'quads', equipment: 'machine', loadIncrement: 5 },
  { id: 'goblet', name: 'Agachamento Goblet', movementPattern: 'squat', primaryMuscle: 'quads', equipment: 'dumbbell', loadIncrement: 2 },
  { id: 'bulgaro', name: 'Agachamento Búlgaro', movementPattern: 'lunge', primaryMuscle: 'quads', equipment: 'dumbbell', loadIncrement: 2 },
  { id: 'extensora', name: 'Cadeira Extensora', movementPattern: 'knee_extension', primaryMuscle: 'quads', equipment: 'machine', loadIncrement: 5 },
  { id: 'supino', name: 'Supino Reto', movementPattern: 'horizontal_push', primaryMuscle: 'chest', equipment: 'barbell', loadIncrement: 2.5 },
  { id: 'supino-halter', name: 'Supino com Halteres', movementPattern: 'horizontal_push', primaryMuscle: 'chest', equipment: 'dumbbell', loadIncrement: 2 },
  { id: 'crucifixo', name: 'Crucifixo na Máquina', movementPattern: 'fly', primaryMuscle: 'chest', equipment: 'machine', loadIncrement: 5 },
  { id: 'remada', name: 'Remada Baixa', movementPattern: 'horizontal_pull', primaryMuscle: 'back', equipment: 'cable', loadIncrement: 5 },
  { id: 'remada-halter', name: 'Remada Unilateral', movementPattern: 'horizontal_pull', primaryMuscle: 'back', equipment: 'dumbbell', loadIncrement: 2 },
  { id: 'puxada', name: 'Puxada Frontal', movementPattern: 'vertical_pull', primaryMuscle: 'back', equipment: 'cable', loadIncrement: 5 },
];

export function exerciseById(id: string): Exercise {
  const found = exercises.find((e) => e.id === id);
  if (!found) throw new Error(`Exercício desconhecido: ${id}`);
  return found;
}

export const muscleLabel: Record<string, string> = { quads: 'Quadríceps', chest: 'Peito', back: 'Costas' };
export const equipmentLabel: Record<string, string> = { machine: 'Máquina', dumbbell: 'Halteres', barbell: 'Barra', cable: 'Polia' };

export const approvedAlternatives: Record<string, string[]> = { 'leg-press': ['hack', 'bulgaro'] };

export const template: Template = {
  id: 'hipertrofia',
  name: 'Hipertrofia — Bloco 1',
  weeks: 4,
  sessions: [
    {
      id: 'A',
      name: 'Treino A — Inferiores',
      position: 1,
      items: [
        { id: 'A1', exerciseId: 'leg-press', sets: 3, repMin: 8, repMax: 12, restS: 90, weeklyIncrementKg: 10 },
        { id: 'A2', exerciseId: 'extensora', sets: 3, repMin: 10, repMax: 15, restS: 60, weeklyIncrementKg: 5 },
      ],
    },
    {
      id: 'B',
      name: 'Treino B — Superiores',
      position: 2,
      items: [
        { id: 'B1', exerciseId: 'supino', sets: 3, repMin: 6, repMax: 10, restS: 120, weeklyIncrementKg: 2.5 },
        { id: 'B2', exerciseId: 'remada', sets: 3, repMin: 8, repMax: 12, restS: 90, weeklyIncrementKg: 5 },
      ],
    },
  ],
};

// Carga base do aluno da prévia, por item do modelo.
export const baseLoads: Record<string, number> = { A1: 120, A2: 40, B1: 50, B2: 45 };

export const studentEquipment = ['machine', 'dumbbell', 'barbell', 'cable'];

// Alunos fictícios para o Radar mostrar cada tipo de alerta.
export const otherStudents: StudentSnapshot[] = [
  { studentId: 'marina', name: 'Marina Costa', consistency: 0.38, recentRpes: [7, 8, 7], loadHistory: {}, pendingVideoIds: ['v1'] },
  {
    studentId: 'rafael',
    name: 'Rafael Lima',
    consistency: 0.9,
    recentRpes: [9, 9, 10],
    loadHistory: { supino: { exerciseName: 'Supino Reto', loads: [60, 60, 60, 60] } },
    pendingVideoIds: [],
  },
  { studentId: 'julia', name: 'Julia Prado', consistency: 0.75, recentRpes: [6, 7, 7], loadHistory: {}, pendingVideoIds: [] },
];
```

- [ ] **Step 2: Criar `src/data/logStore.ts`**

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionLog } from '../domain/types';

// ponytail: tudo local no aparelho; o Plano 2 troca por fila de sincronização com o Supabase.
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
  const logs = [...(await loadLogs()), log];
  await AsyncStorage.setItem(KEY, JSON.stringify(logs));
  return logs;
}
```

- [ ] **Step 3: Criar `src/state/AppState.tsx`**

```tsx
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

  const addLog = async (log: SessionLog) => setLogs(await appendLog(log));

  return <Ctx.Provider value={{ logs, ready, addLog }}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAppState precisa estar dentro de AppStateProvider');
  return value;
}
```

- [ ] **Step 4: Criar `src/ui/theme.ts`**

```ts
import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { trainer } from '../data/seed';

export const fonts = { title: 'Fraunces_600SemiBold', body: 'Inter_400Regular', bodyBold: 'Inter_600SemiBold' };

const light = { bg: '#F7F5F2', surface: '#FFFFFF', text: '#141414', muted: '#6B6660', border: '#E6E1DA' };
const dark = { bg: '#0F0E0D', surface: '#1A1917', text: '#F2EFEA', muted: '#9A948C', border: '#2A2825' };

export type Palette = typeof light & { accent: string; fonts: typeof fonts };

// Modo escuro "estúdio", usado durante o treino.
export const studioPalette: Palette = { ...dark, accent: trainer.brandColor, fonts };

const Override = createContext<Palette | null>(null);
export const PaletteOverride = Override.Provider;

export function useTheme(): Palette {
  const override = useContext(Override);
  const scheme = useColorScheme();
  return override ?? { ...(scheme === 'dark' ? dark : light), accent: trainer.brandColor, fonts };
}
```

- [ ] **Step 5: Criar `src/ui/components.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './theme';

export function Screen({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children, size = 34 }: { children: ReactNode; size?: number }) {
  const t = useTheme();
  return <Text style={{ fontFamily: t.fonts.title, fontSize: size, lineHeight: size * 1.15, color: t.text }}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const t = useTheme();
  return <Text style={{ fontFamily: t.fonts.body, fontSize: 16, lineHeight: 22, color: muted ? t.muted : t.text }}>{children}</Text>;
}

export function Label({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <Text style={{ fontFamily: t.fonts.bodyBold, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: t.muted }}>
      {children}
    </Text>
  );
}

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const t = useTheme();
  const style = { backgroundColor: t.surface, borderRadius: 20, padding: 20, gap: 8, borderWidth: 1, borderColor: t.border };
  if (!onPress) return <View style={style}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [style, { opacity: pressed ? 0.8 : 1 }]}>
      {children}
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}) {
  const t = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: primary ? t.accent : 'transparent',
        borderWidth: primary ? 0 : 1,
        borderColor: t.border,
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ fontFamily: t.fonts.bodyBold, fontSize: 16, color: primary ? '#FFFFFF' : t.text }}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: selected ? t.accent : t.border,
        backgroundColor: selected ? t.accent : 'transparent',
      }}
    >
      <Text style={{ fontFamily: t.fonts.bodyBold, fontSize: 14, color: selected ? '#FFFFFF' : t.text }}>{label}</Text>
    </Pressable>
  );
}

export function LoadStepper({ value, step, onChange }: { value: number | null; step: number; onChange: (v: number) => void }) {
  const current = value ?? 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Chip label="−" onPress={() => onChange(Math.max(0, current - step))} />
      <Body>{value === null ? '— kg' : `${value} kg`}</Body>
      <Chip label="+" onPress={() => onChange(current + step)} />
    </View>
  );
}
```

- [ ] **Step 6: Criar `src/ui/tabs.ts`**

```ts
import { useTheme } from './theme';

// Abas só com texto: mais limpo que ícones genéricos.
export function useTabOptions() {
  const t = useTheme();
  return {
    headerShown: false,
    tabBarIcon: () => null,
    tabBarActiveTintColor: t.accent,
    tabBarInactiveTintColor: t.muted,
    tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.border },
    tabBarLabelStyle: { fontFamily: t.fonts.bodyBold, fontSize: 13 },
  };
}
```

- [ ] **Step 7: Criar `app/_layout.tsx`**

```tsx
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider } from '../src/state/AppState';

export default function RootLayout() {
  const [loaded] = useFonts({ Fraunces_600SemiBold, Inter_400Regular, Inter_600SemiBold });
  if (!loaded) return null;

  return (
    <AppStateProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="treino" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </AppStateProvider>
  );
}
```

- [ ] **Step 8: Substituir `app/index.tsx`**

```tsx
import { router } from 'expo-router';
import { trainer } from '../src/data/seed';
import { Body, Button, Label, Screen, Title } from '../src/ui/components';

// Prévia: escolha de perfil. O login real entra no Plano 2.
export default function Entrada() {
  return (
    <Screen>
      <Label>{trainer.name}</Label>
      <Title>Bem-vindo ao seu estúdio.</Title>
      <Body muted>Prévia de desenvolvimento — escolha um perfil para explorar.</Body>
      <Button title="Entrar como aluno" onPress={() => router.replace('/hoje')} />
      <Button title="Entrar como treinador" variant="ghost" onPress={() => router.replace('/radar')} />
    </Screen>
  );
}
```

- [ ] **Step 9: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: erros apenas de rotas `/hoje` e `/radar` inexistentes (se o expo-router gerar rotas tipadas) — resolvidos nas Tasks 7 e 8. Nenhum outro erro.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(app): add theme, seed data, local log store and entry screen"
```

---

### Task 7: Área do aluno — Hoje, Treino, Progresso, Treinador

**Files:**
- Create: `app/(student)/_layout.tsx`, `app/(student)/hoje.tsx`, `app/(student)/progresso.tsx`, `app/(student)/treinador.tsx`
- Create: `app/treino.tsx`

**Interfaces:**
- Consumes: `nextSlot`, `shouldRest`, `consistency` (schedule); `plannedLoad` (progression); `suggestAlternatives`, `lastLoadFor` (substitution); tudo de `seed.ts`; `useAppState`; componentes e tema da Task 6.
- Produces: rotas `/hoje`, `/progresso`, `/treinador`, `/treino`.

- [ ] **Step 1: Criar `app/(student)/_layout.tsx`**

```tsx
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
```

- [ ] **Step 2: Criar `app/(student)/hoje.tsx`**

```tsx
import { router } from 'expo-router';
import { nextSlot, shouldRest } from '../../src/domain/schedule';
import { exerciseById, template, trainer } from '../../src/data/seed';
import { useAppState } from '../../src/state/AppState';
import { Body, Button, Card, Label, Screen, Title } from '../../src/ui/components';

export default function Hoje() {
  const { logs, ready } = useAppState();

  if (!ready) {
    return (
      <Screen>
        <Body muted>Carregando…</Body>
      </Screen>
    );
  }

  const slot = nextSlot(template, logs);
  if (!slot) {
    return (
      <Screen>
        <Label>{trainer.name}</Label>
        <Title>Bloco concluído.</Title>
        <Body muted>Seu treinador está preparando seu próximo plano.</Body>
      </Screen>
    );
  }

  const session = template.sessions.find((s) => s.id === slot.sessionId)!;
  const openWorkout = () => router.push('/treino');

  return (
    <Screen>
      <Label>{trainer.name}</Label>
      <Title>Hoje</Title>
      {shouldRest(logs, new Date()) && (
        <Body muted>Você treinou há menos de 24 h. Descansar também é treino — mas a escolha é sua.</Body>
      )}
      <Card onPress={openWorkout}>
        <Label>
          Semana {slot.weekN} de {template.weeks}
        </Label>
        <Title size={26}>{session.name}</Title>
        {session.items.map((item) => (
          <Body key={item.id} muted>
            {exerciseById(item.exerciseId).name} · {item.sets} × {item.repMin}–{item.repMax}
          </Body>
        ))}
      </Card>
      <Button title="Começar treino" onPress={openWorkout} />
    </Screen>
  );
}
```

- [ ] **Step 3: Criar `app/treino.tsx`**

```tsx
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Modal, Pressable, TextInput, View } from 'react-native';
import { plannedLoad } from '../src/domain/progression';
import { nextSlot } from '../src/domain/schedule';
import { lastLoadFor, suggestAlternatives } from '../src/domain/substitution';
import type { Mood, SessionLog } from '../src/domain/types';
import { approvedAlternatives, baseLoads, exerciseById, exercises, studentEquipment, template } from '../src/data/seed';
import { useAppState } from '../src/state/AppState';
import { Body, Button, Card, Chip, Label, LoadStepper, Screen, Title } from '../src/ui/components';
import { PaletteOverride, studioPalette, useTheme } from '../src/ui/theme';

type SetState = { reps: string; done: boolean };
type ItemState = { exerciseId: string; loadKg: number | null; sets: SetState[] };

const MOODS: { value: Mood; label: string }[] = [
  { value: 'low', label: 'Cansado' },
  { value: 'ok', label: 'Bem' },
  { value: 'great', label: 'Ótimo' },
];

export default function TreinoScreen() {
  return (
    <PaletteOverride value={studioPalette}>
      <StatusBar style="light" />
      <Treino />
    </PaletteOverride>
  );
}

function Treino() {
  const t = useTheme();
  const { logs, addLog } = useAppState();
  const [slot] = useState(() => nextSlot(template, logs));
  const session = template.sessions.find((s) => s.id === slot?.sessionId);
  const [items, setItems] = useState<ItemState[]>(() =>
    (session?.items ?? []).map((item) => ({
      exerciseId: item.exerciseId,
      loadKg: plannedLoad(baseLoads[item.id] ?? 0, item.weeklyIncrementKg, slot?.weekN ?? 1),
      sets: Array.from({ length: item.sets }, () => ({ reps: '', done: false })),
    })),
  );
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<'workout' | 'checkin'>('workout');
  const [rpe, setRpe] = useState(7);
  const [mood, setMood] = useState<Mood | undefined>();
  const [saving, setSaving] = useState(false);

  if (!slot || !session) {
    return (
      <Screen>
        <Title>Nada para hoje.</Title>
        <Button title="Voltar" onPress={() => router.back()} />
      </Screen>
    );
  }

  const update = (i: number, fn: (s: ItemState) => ItemState) =>
    setItems((prev) => prev.map((s, idx) => (idx === i ? fn(s) : s)));

  const toggleSet = (i: number, n: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    update(i, (s) => ({ ...s, sets: s.sets.map((x, k) => (k === n ? { ...x, done: !x.done } : x)) }));
  };

  const swap = (i: number, exerciseId: string) => {
    update(i, (s) => ({ ...s, exerciseId, loadKg: lastLoadFor(exerciseId, logs) }));
    setSwapIndex(null);
  };

  const finish = async (withCheckin: boolean) => {
    const log: SessionLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      templateSessionId: session.id,
      weekN: slot.weekN,
      completedAt: new Date().toISOString(),
      rpe: withCheckin ? rpe : undefined,
      mood: withCheckin ? mood : undefined,
      sets: items.flatMap((s, i) => {
        const planned = session.items[i];
        return s.sets
          .filter((set) => set.done)
          .map((set, k) => ({
            exerciseId: s.exerciseId,
            setN: k + 1,
            // Campo vazio conta como o mínimo da faixa: nunca infla a progressão.
            reps: Number(set.reps) || planned.repMin,
            loadKg: s.loadKg ?? 0,
            substitutedFrom: s.exerciseId !== planned.exerciseId ? planned.exerciseId : undefined,
          }));
      }),
    };
    setSaving(true);
    try {
      await addLog(log);
      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Não foi possível salvar', 'Seu treino continua aqui. Tente de novo.');
    }
  };

  if (phase === 'checkin') {
    return (
      <Screen>
        <Label>Treino concluído</Label>
        <Title>Como foi?</Title>
        <Body muted>Esforço percebido: {rpe}/10</Body>
        <Slider
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={rpe}
          onValueChange={setRpe}
          minimumTrackTintColor={t.accent}
          maximumTrackTintColor={t.border}
          thumbTintColor={t.accent}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {MOODS.map((m) => (
            <Chip key={m.value} label={m.label} selected={mood === m.value} onPress={() => setMood(m.value)} />
          ))}
        </View>
        <Button title="Salvar" onPress={() => finish(true)} disabled={saving} />
        <Button title="Pular" variant="ghost" onPress={() => finish(false)} disabled={saving} />
      </Screen>
    );
  }

  const swapTarget = swapIndex === null ? null : session.items[swapIndex];
  const alternatives = swapTarget
    ? suggestAlternatives(
        exerciseById(swapTarget.exerciseId),
        exercises,
        approvedAlternatives[swapTarget.exerciseId] ?? [],
        studentEquipment,
      )
    : [];

  return (
    <>
      <Screen>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Body muted>Fechar</Body>
        </Pressable>
        <Label>
          Semana {slot.weekN} · {template.name}
        </Label>
        <Title>{session.name}</Title>
        {items.map((s, i) => {
          const planned = session.items[i];
          const exercise = exerciseById(s.exerciseId);
          return (
            <Card key={planned.id}>
              <Title size={22}>{exercise.name}</Title>
              {s.exerciseId !== planned.exerciseId && (
                <Body muted>Substituindo {exerciseById(planned.exerciseId).name}</Body>
              )}
              <Body muted>
                {planned.sets} × {planned.repMin}–{planned.repMax} · descanso {planned.restS}s
              </Body>
              <LoadStepper
                value={s.loadKg}
                step={exercise.loadIncrement}
                onChange={(v) => update(i, (x) => ({ ...x, loadKg: v }))}
              />
              {s.sets.map((set, n) => (
                <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Body muted>Série {n + 1}</Body>
                  <TextInput
                    value={set.reps}
                    onChangeText={(reps) =>
                      update(i, (x) => ({ ...x, sets: x.sets.map((y, k) => (k === n ? { ...y, reps } : y)) }))
                    }
                    keyboardType="number-pad"
                    placeholder={`${planned.repMin}–${planned.repMax} reps`}
                    placeholderTextColor={t.muted}
                    accessibilityLabel={`Repetições da série ${n + 1}`}
                    style={{
                      flex: 1,
                      color: t.text,
                      fontFamily: t.fonts.body,
                      fontSize: 16,
                      borderBottomWidth: 1,
                      borderColor: t.border,
                      paddingVertical: 6,
                    }}
                  />
                  <Chip label={set.done ? 'Feita' : 'Marcar'} selected={set.done} onPress={() => toggleSet(i, n)} />
                </View>
              ))}
              <Button title="Aparelho ocupado" variant="ghost" onPress={() => setSwapIndex(i)} />
            </Card>
          );
        })}
        <Button title="Concluir treino" onPress={() => setPhase('checkin')} />
      </Screen>

      <Modal visible={swapIndex !== null} transparent animationType="slide" onRequestClose={() => setSwapIndex(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: t.bg, padding: 24, paddingBottom: 40, gap: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <Title size={22}>Alternativas</Title>
            {alternatives.length === 0 ? (
              <Body muted>Sem substituto disponível — pule ou aguarde.</Body>
            ) : (
              alternatives.map((alt) => {
                const last = lastLoadFor(alt.id, logs);
                return (
                  <Card key={alt.id} onPress={() => swap(swapIndex!, alt.id)}>
                    <Body>{alt.name}</Body>
                    <Body muted>{last === null ? 'Sem histórico de carga' : `Última carga: ${last} kg`}</Body>
                  </Card>
                );
              })
            )}
            <Button title="Cancelar" variant="ghost" onPress={() => setSwapIndex(null)} />
          </View>
        </View>
      </Modal>
    </>
  );
}
```

- [ ] **Step 4: Criar `app/(student)/progresso.tsx`**

```tsx
import { consistency } from '../../src/domain/schedule';
import { template } from '../../src/data/seed';
import { useAppState } from '../../src/state/AppState';
import { Body, Card, Label, Screen, Title } from '../../src/ui/components';

export default function Progresso() {
  const { logs } = useAppState();
  const value = consistency(logs, template.sessions.length, new Date());
  const recent = [...logs]
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
    .slice(0, 10);

  return (
    <Screen>
      <Label>Progresso</Label>
      <Title size={56}>{Math.round(value * 100)}%</Title>
      <Body muted>de consistência nas últimas 4 semanas</Body>
      {recent.length === 0 ? (
        <Body muted>Seu primeiro treino aparece aqui.</Body>
      ) : (
        recent.map((log) => {
          const session = template.sessions.find((s) => s.id === log.templateSessionId);
          return (
            <Card key={log.id}>
              <Body>{session?.name ?? 'Treino'}</Body>
              <Body muted>
                {new Date(log.completedAt).toLocaleDateString('pt-BR')} · semana {log.weekN}
                {log.rpe ? ` · esforço ${log.rpe}/10` : ''}
              </Body>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
```

- [ ] **Step 5: Criar `app/(student)/treinador.tsx`**

```tsx
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { trainer } from '../../src/data/seed';
import { Body, Button, Label, Screen, Title } from '../../src/ui/components';
import { useTheme } from '../../src/ui/theme';

export default function Treinador() {
  const t = useTheme();
  return (
    <Screen>
      <Label>Seu treinador</Label>
      <View
        style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#FFFFFF', fontFamily: t.fonts.title, fontSize: 30 }}>{trainer.name[0]}</Text>
      </View>
      <Title>{trainer.name}</Title>
      <Body muted>As devolutivas dos seus vídeos de execução vão aparecer aqui.</Body>
      <Button title="Sair da prévia" variant="ghost" onPress={() => router.replace('/')} />
    </Screen>
  );
}
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit` → Expected: erro só da rota `/radar` (se rotas tipadas estiverem ativas), resolvido na Task 8.
Run: `npx expo start` e abrir no Expo Go. Expected:
1. Entrada → "Entrar como aluno" → aba Hoje mostra "Treino A — Inferiores", semana 1 de 4.
2. "Começar treino" abre em modo escuro; o Leg Press mostra 120 kg; marcar série vibra.
3. "Aparelho ocupado" no Leg Press lista Hack Machine, Agachamento Búlgaro, Agachamento Goblet; escolher um mostra "Substituindo Leg Press 45º" e carga "— kg".
4. "Concluir treino" → controle de esforço + humor → "Salvar" volta para Hoje, que agora mostra "Treino B" e o aviso de descanso.
5. Aba Progresso mostra o treino salvo. Fechar e reabrir o Expo Go: o treino continua lá.

- [ ] **Step 7: Commit**

```bash
git add app
git commit -m "feat(app): add student area with workout, substitution and check-in"
```

---

### Task 8: Área do treinador — Radar, Alunos, Biblioteca

**Files:**
- Create: `app/(trainer)/_layout.tsx`, `app/(trainer)/radar.tsx`, `app/(trainer)/alunos.tsx`, `app/(trainer)/biblioteca.tsx`

**Interfaces:**
- Consumes: `buildRadar`, `snapshotFromLogs`, `RadarKind` (radar); `consistency` não é usado direto (vem no snapshot); `exercises`, `otherStudents`, `template`, `trainer`, `muscleLabel`, `equipmentLabel` (seed); `useAppState`.
- Produces: rotas `/radar`, `/alunos`, `/biblioteca`.

- [ ] **Step 1: Criar `app/(trainer)/_layout.tsx`**

```tsx
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
```

- [ ] **Step 2: Criar `app/(trainer)/radar.tsx`**

```tsx
import { buildRadar, snapshotFromLogs, type RadarKind } from '../../src/domain/radar';
import { exercises, otherStudents, template, trainer } from '../../src/data/seed';
import { useAppState } from '../../src/state/AppState';
import { Body, Card, Label, Screen, Title } from '../../src/ui/components';

const KIND_LABEL: Record<RadarKind, string> = {
  video: 'Vídeo',
  adherence: 'Aderência',
  stalled: 'Carga',
  rpe: 'Esforço',
};

const exerciseNames = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

export default function Radar() {
  const { logs } = useAppState();
  const me = snapshotFromLogs('previa', 'Aluno da prévia', logs, template.sessions.length, new Date(), exerciseNames);
  const items = buildRadar([me, ...otherStudents]);

  return (
    <Screen>
      <Label>{trainer.name}</Label>
      <Title>Radar</Title>
      {items.length === 0 ? (
        <Body muted>Tudo em dia.</Body>
      ) : (
        items.map((item) => (
          <Card key={`${item.kind}-${item.studentId}-${item.refId ?? ''}`}>
            <Label>{KIND_LABEL[item.kind]}</Label>
            <Body>{item.label}</Body>
          </Card>
        ))
      )}
    </Screen>
  );
}
```

- [ ] **Step 3: Criar `app/(trainer)/alunos.tsx`**

```tsx
import { router } from 'expo-router';
import { snapshotFromLogs } from '../../src/domain/radar';
import { otherStudents, template } from '../../src/data/seed';
import { useAppState } from '../../src/state/AppState';
import { Body, Button, Card, Label, Screen, Title } from '../../src/ui/components';

export default function Alunos() {
  const { logs } = useAppState();
  const me = snapshotFromLogs('previa', 'Aluno da prévia', logs, template.sessions.length, new Date(), {});
  const students = [me, ...otherStudents];

  return (
    <Screen>
      <Label>{students.length} alunos</Label>
      <Title>Alunos</Title>
      {students.map((s) => (
        <Card key={s.studentId}>
          <Body>{s.name}</Body>
          <Body muted>{Math.round(s.consistency * 100)}% de consistência · {template.name}</Body>
        </Card>
      ))}
      <Button title="Sair da prévia" variant="ghost" onPress={() => router.replace('/')} />
    </Screen>
  );
}
```

- [ ] **Step 4: Criar `app/(trainer)/biblioteca.tsx`**

```tsx
import { equipmentLabel, exercises, muscleLabel } from '../../src/data/seed';
import { Body, Card, Label, Screen, Title } from '../../src/ui/components';

export default function Biblioteca() {
  return (
    <Screen>
      <Label>{exercises.length} exercícios</Label>
      <Title>Biblioteca</Title>
      {exercises.map((e) => (
        <Card key={e.id}>
          <Body>{e.name}</Body>
          <Body muted>
            {muscleLabel[e.primaryMuscle] ?? e.primaryMuscle} · {equipmentLabel[e.equipment] ?? e.equipment}
          </Body>
        </Card>
      ))}
    </Screen>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit` → Expected: sem erros.
Run: `npm test` → Expected: PASS.
Run: `npx expo start` e abrir no Expo Go. Expected:
1. Entrada → "Entrar como treinador" → Radar lista, nesta ordem: vídeo da Marina, aderência da Marina (38%), carga do Rafael (Supino Reto), esforço do Rafael.
2. Alunos lista 4 nomes com a consistência; "Sair da prévia" volta à entrada.
3. Biblioteca lista 11 exercícios com músculo e equipamento em português.
4. Com o celular em modo escuro, as abas do aluno e do treinador ficam escuras, com o destaque marrom.

- [ ] **Step 6: Commit**

```bash
git add app
git commit -m "feat(app): add trainer area with radar, students and library"
```

---

## Cobertura da spec neste plano

| Spec | Onde |
|---|---|
| Progressão planejada por semana | Task 2 (`plannedLoad`), usada na Task 7 |
| Dupla progressão | Task 2 (`suggestNextLoad`); fila de aprovação no Plano 3 |
| Semana fluida + descanso + consistência | Tasks 3 e 7 |
| Aparelho ocupado + última carga | Tasks 4 e 7 |
| Radar (4 tipos, ordem) | Tasks 5 e 8 (vídeos reais no Plano 4) |
| Check-in RPE + humor | Task 7 |
| Abas por perfil, tema, fontes, modo estúdio | Tasks 6–8 |
| Registro salvo no aparelho | Task 6 (sincronização no Plano 2) |
| Login, RLS, vídeo, modelos editáveis, Asaas | Planos 2–5 |
