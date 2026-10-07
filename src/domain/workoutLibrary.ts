import type { TrainingMethod, WorkoutProgram } from './types';

export const trainingMethods: TrainingMethod[] = [
  {
    id: 'rest-pause',
    name: 'Rest-Pause (Pausa Curta)',
    description: 'Executa a série até a falha concêntrica, descansa 15 segundos e continua com mais 2 a 4 repetições com a mesma carga.',
    howToApply: 'Aplicar na última série do exercício principal de isolamento. Gera altíssimo estresse metabólico sem sobrecarregar tendões.',
    intensityLevel: 'alto',
  },
  {
    id: 'drop-set',
    name: 'Drop-Set (Redução de Carga)',
    description: 'Após a falha, reduz de 20% a 30% da carga sem descanso e busca a nova falha por até 2 reduções consecutivas.',
    howToApply: 'Excelente para finalizadores em máquinas (ex: Cadeira Extensora ou Puxada Frontal). Não recomendado para agachamento livre ou supino com barra sem auxílio.',
    intensityLevel: 'extremo',
  },
  {
    id: 'bi-set',
    name: 'Bi-Set (Super-série Antagonista)',
    description: 'Dois exercícios combinados executados sem intervalo entre eles.',
    howToApply: 'Exemplo: Supino Reto imediatamente seguido de Remada Baixa, otimizando o tempo e aumentando o gasto calórico.',
    intensityLevel: 'moderado',
  },
  {
    id: 'piramide',
    name: 'Pirâmide Crescente de Carga',
    description: 'Aumento progressivo de carga a cada série (ex: 12 reps @ 40kg -> 10 reps @ 50kg -> 8 reps @ 60kg).',
    howToApply: 'Padrão ouro para aquecimento neuromuscular e alcance de séries de choque no supino, agachamento e leg press.',
    intensityLevel: 'moderado',
  },
  {
    id: 'rir-controle',
    name: 'Controle de RIR (Repetições na Reserva)',
    description: 'Parar a série com exatamente 1 a 2 repetições antes da falha total (RIR 1-2).',
    howToApply: 'Garante 95% do estímulo hipertrófico minimizando a fadiga do sistema nervoso central e risco de lesão.',
    intensityLevel: 'alto',
  },
];

export const workoutProgramsCatalog: WorkoutProgram[] = [
  {
    id: 'ppl-hipertrofia',
    name: 'Push / Pull / Legs — Volume Máximo',
    goal: 'hipertrofia',
    level: 'avancado',
    frequencyDaysPerWeek: 6,
    durationWeeks: 8,
    description: 'A divisão mais consagrada do fisiculturismo moderno. Permite treinar cada agrupamento 2x por semana com descanso ideal.',
    recommendedMethods: ['rest-pause', 'drop-set', 'rir-controle'],
    sessions: [
      {
        id: 'ppl-push',
        name: 'Push (Peitoral, Deltóide Anterior e Tríceps)',
        position: 1,
        items: [
          { id: 'p1', exerciseId: 'supino', sets: 4, repMin: 6, repMax: 8, restS: 120, weeklyIncrementKg: 2.5 },
          { id: 'p2', exerciseId: 'supino-halter', sets: 3, repMin: 8, repMax: 12, restS: 90, weeklyIncrementKg: 2 },
          { id: 'p3', exerciseId: 'crucifixo', sets: 3, repMin: 12, repMax: 15, restS: 60, weeklyIncrementKg: 5 },
        ],
      },
      {
        id: 'ppl-pull',
        name: 'Pull (Dorsais, Trapézio e Bíceps)',
        position: 2,
        items: [
          { id: 'pl1', exerciseId: 'puxada', sets: 4, repMin: 8, repMax: 10, restS: 90, weeklyIncrementKg: 5 },
          { id: 'pl2', exerciseId: 'remada', sets: 3, repMin: 8, repMax: 12, restS: 90, weeklyIncrementKg: 5 },
          { id: 'pl3', exerciseId: 'remada-halter', sets: 3, repMin: 10, repMax: 12, restS: 60, weeklyIncrementKg: 2 },
        ],
      },
      {
        id: 'ppl-legs',
        name: 'Legs (Quadríceps, Isquiotibiais e Panturrilhas)',
        position: 3,
        items: [
          { id: 'lg1', exerciseId: 'leg-press', sets: 4, repMin: 8, repMax: 12, restS: 120, weeklyIncrementKg: 10 },
          { id: 'lg2', exerciseId: 'hack', sets: 3, repMin: 8, repMax: 10, restS: 90, weeklyIncrementKg: 5 },
          { id: 'lg3', exerciseId: 'extensora', sets: 3, repMin: 12, repMax: 15, restS: 60, weeklyIncrementKg: 5 },
        ],
      },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower — Força & Recomposição',
    goal: 'recomposicao',
    level: 'intermediario',
    frequencyDaysPerWeek: 4,
    durationWeeks: 6,
    description: 'Equilíbrio ideal entre frequência, volume e recuperação muscular para quem tem rotina movimentada.',
    recommendedMethods: ['piramide', 'rir-controle'],
    sessions: [
      {
        id: 'ul-upper',
        name: 'Superior Completo (Upper A)',
        position: 1,
        items: [
          { id: 'u1', exerciseId: 'supino', sets: 4, repMin: 6, repMax: 10, restS: 120, weeklyIncrementKg: 2.5 },
          { id: 'u2', exerciseId: 'remada', sets: 4, repMin: 8, repMax: 10, restS: 90, weeklyIncrementKg: 5 },
          { id: 'u3', exerciseId: 'puxada', sets: 3, repMin: 10, repMax: 12, restS: 60, weeklyIncrementKg: 5 },
        ],
      },
      {
        id: 'ul-lower',
        name: 'Inferior Completo (Lower A)',
        position: 2,
        items: [
          { id: 'l1', exerciseId: 'leg-press', sets: 4, repMin: 8, repMax: 12, restS: 120, weeklyIncrementKg: 10 },
          { id: 'l2', exerciseId: 'bulgaro', sets: 3, repMin: 8, repMax: 12, restS: 90, weeklyIncrementKg: 2 },
          { id: 'l3', exerciseId: 'extensora', sets: 3, repMin: 12, repMax: 15, restS: 60, weeklyIncrementKg: 5 },
        ],
      },
    ],
  },
  {
    id: 'gluteos-feminino',
    name: 'Cadeia Posterior & Glúteos Hipertrofia',
    goal: 'hipertrofia',
    level: 'intermediario',
    frequencyDaysPerWeek: 4,
    durationWeeks: 8,
    description: 'Ênfase em amplitude máxima, glúteo máximo/médio e quadríceps com técnica apurada.',
    recommendedMethods: ['rest-pause', 'drop-set'],
    sessions: [
      {
        id: 'gl-1',
        name: 'Foco Glúteos & Quadríceps',
        position: 1,
        items: [
          { id: 'g1', exerciseId: 'bulgaro', sets: 4, repMin: 8, repMax: 12, restS: 90, weeklyIncrementKg: 2 },
          { id: 'g2', exerciseId: 'leg-press', sets: 4, repMin: 10, repMax: 15, restS: 90, weeklyIncrementKg: 10 },
          { id: 'g3', exerciseId: 'extensora', sets: 3, repMin: 12, repMax: 15, restS: 60, weeklyIncrementKg: 5 },
        ],
      },
    ],
  },
  {
    id: 'deload-recuperacao',
    name: 'Deload Ativo — Redução de Fadiga',
    goal: 'condicionamento',
    level: 'iniciante',
    frequencyDaysPerWeek: 3,
    durationWeeks: 1,
    description: 'Redução de 50% no volume de séries para dissipar fadiga acumulada e preparar o corpo para um novo recorde de cargas.',
    recommendedMethods: ['rir-controle'],
    sessions: [
      {
        id: 'del-1',
        name: 'Sessão Regenerativa',
        position: 1,
        items: [
          { id: 'd1', exerciseId: 'supino', sets: 2, repMin: 8, repMax: 10, restS: 120, weeklyIncrementKg: 0 },
          { id: 'd2', exerciseId: 'remada', sets: 2, repMin: 10, repMax: 12, restS: 90, weeklyIncrementKg: 0 },
          { id: 'd3', exerciseId: 'leg-press', sets: 2, repMin: 10, repMax: 12, restS: 120, weeklyIncrementKg: 0 },
        ],
      },
    ],
  },
];
