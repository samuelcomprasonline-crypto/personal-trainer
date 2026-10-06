import type { StudentSnapshot } from '../domain/radar';
import type { Exercise, PhysicalAssessment, Template } from '../domain/types';

export const trainer = { name: 'Studio Aurora', brandColor: '#C5A059' };

export const exercises: Exercise[] = [
  {
    id: 'leg-press',
    name: 'Leg Press 45º',
    movementPattern: 'squat',
    primaryMuscle: 'quads',
    equipment: 'machine',
    loadIncrement: 10,
    youtubeId: 'IZxyjW7MPJQ',
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    thumbnailUrl: 'https://img.youtube.com/vi/IZxyjW7MPJQ/hqdefault.jpg',
    instructions: 'Pés na largura dos ombros, desça com amplitude máxima sem descolar a lombar do encosto. Empurre pelos calcanhares.',
  },
  {
    id: 'hack',
    name: 'Hack Machine',
    movementPattern: 'squat',
    primaryMuscle: 'quads',
    equipment: 'machine',
    loadIncrement: 5,
    youtubeId: '0tn5K9NlCfo',
    videoUrl: 'https://www.youtube.com/watch?v=0tn5K9NlCfo',
    thumbnailUrl: 'https://img.youtube.com/vi/0tn5K9NlCfo/hqdefault.jpg',
    instructions: 'Desça até formar ângulo de 90° nos joelhos, mantendo abdômen ativado e costas totalmente apoiadas.',
  },
  {
    id: 'goblet',
    name: 'Agachamento Goblet',
    movementPattern: 'squat',
    primaryMuscle: 'quads',
    equipment: 'dumbbell',
    loadIncrement: 2,
    youtubeId: 'MeIiIdhvXT4',
    videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
    thumbnailUrl: 'https://img.youtube.com/vi/MeIiIdhvXT4/hqdefault.jpg',
    instructions: 'Segure o halter verticalmente colado ao esterno, cotovelos fechados, agache empurrando os joelhos para fora.',
  },
  {
    id: 'bulgaro',
    name: 'Agachamento Búlgaro',
    movementPattern: 'lunge',
    primaryMuscle: 'quads',
    equipment: 'dumbbell',
    loadIncrement: 2,
    youtubeId: '2C-uNgKwPLE',
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    thumbnailUrl: 'https://img.youtube.com/vi/2C-uNgKwPLE/hqdefault.jpg',
    instructions: 'Um pé elevado no banco atrás, desça o joelho de trás em direção ao chão mantendo o tronco levemente inclinado.',
  },
  {
    id: 'extensora',
    name: 'Cadeira Extensora',
    movementPattern: 'knee_extension',
    primaryMuscle: 'quads',
    equipment: 'machine',
    loadIncrement: 5,
    youtubeId: 'YyvSfVjQeL0',
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    thumbnailUrl: 'https://img.youtube.com/vi/YyvSfVjQeL0/hqdefault.jpg',
    instructions: 'Ajuste o rolo na altura dos tornozelos. Estenda até a contração máxima e segure 1 segundo no pico do movimento.',
  },
  {
    id: 'supino',
    name: 'Supino Reto',
    movementPattern: 'horizontal_push',
    primaryMuscle: 'chest',
    equipment: 'barbell',
    loadIncrement: 2.5,
    youtubeId: 'rT7DgCr-3pg',
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    thumbnailUrl: 'https://img.youtube.com/vi/rT7DgCr-3pg/hqdefault.jpg',
    instructions: 'Retração escapular firme no banco, desça a barra controlando até a linha do mamilo e suba com explosão controlada.',
  },
  {
    id: 'supino-halter',
    name: 'Supino com Halteres',
    movementPattern: 'horizontal_push',
    primaryMuscle: 'chest',
    equipment: 'dumbbell',
    loadIncrement: 2,
    youtubeId: 'VmB1G1K7v94',
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    thumbnailUrl: 'https://img.youtube.com/vi/VmB1G1K7v94/hqdefault.jpg',
    instructions: 'Desça abrindo bem o peitoral sem forçar os ombros além da linha do tronco. Suba aproximando os halteres no topo.',
  },
  {
    id: 'crucifixo',
    name: 'Crucifixo na Máquina',
    movementPattern: 'fly',
    primaryMuscle: 'chest',
    equipment: 'machine',
    loadIncrement: 5,
    youtubeId: 'FdayfZ8mKDs',
    videoUrl: 'https://www.youtube.com/watch?v=FdayfZ8mKDs',
    thumbnailUrl: 'https://img.youtube.com/vi/FdayfZ8mKDs/hqdefault.jpg',
    instructions: 'Mantenha cotovelos levemente flexionados durante todo o arco. Concentre o esforço em juntar os bíceps no centro.',
  },
  {
    id: 'remada',
    name: 'Remada Baixa',
    movementPattern: 'horizontal_pull',
    primaryMuscle: 'back',
    equipment: 'cable',
    loadIncrement: 5,
    youtubeId: 'GZbfZ033f74',
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    thumbnailUrl: 'https://img.youtube.com/vi/GZbfZ033f74/hqdefault.jpg',
    instructions: 'Coluna ereta, ombros longe das orelhas. Puxe o triângulo contra o abdômen esmagando as escápulas atrás.',
  },
  {
    id: 'remada-halter',
    name: 'Remada Unilateral',
    movementPattern: 'horizontal_pull',
    primaryMuscle: 'back',
    equipment: 'dumbbell',
    loadIncrement: 2,
    youtubeId: 'roCP6wCXPqo',
    videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
    thumbnailUrl: 'https://img.youtube.com/vi/roCP6wCXPqo/hqdefault.jpg',
    instructions: 'Apoie um joelho e mão no banco. Puxe o peso trazendo o cotovelo rente à cintura em direção ao bolso da bermuda.',
  },
  {
    id: 'puxada',
    name: 'Puxada Frontal',
    movementPattern: 'vertical_pull',
    primaryMuscle: 'back',
    equipment: 'cable',
    loadIncrement: 5,
    youtubeId: 'CAwf7n6Luuc',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    thumbnailUrl: 'https://img.youtube.com/vi/CAwf7n6Luuc/hqdefault.jpg',
    instructions: 'Pegada pronada aberta, incline levemente o tronco para trás. Puxe a barra até a altura do queixo, abrindo o peito.',
  },
];

export function exerciseById(id: string): Exercise {
  const found = exercises.find((e) => e.id === id);
  if (!found) throw new Error(`Exercício desconhecido: ${id}`);
  return found;
}

export const muscleLabel: Record<string, string> = { quads: 'Quadríceps', chest: 'Peitoral', back: 'Dorsal/Costas' };
export const equipmentLabel: Record<string, string> = { machine: 'Máquina', dumbbell: 'Halteres', barbell: 'Barra', cable: 'Polia' };

export const approvedAlternatives: Record<string, string[]> = { 'leg-press': ['hack', 'bulgaro'] };

export const template: Template = {
  id: 'hipertrofia',
  name: 'Hipertrofia & Definição — Bloco Pro',
  weeks: 4,
  sessions: [
    {
      id: 'A',
      name: 'Treino A — Inferiores & Força',
      position: 1,
      items: [
        { id: 'A1', exerciseId: 'leg-press', sets: 3, repMin: 8, repMax: 12, restS: 90, weeklyIncrementKg: 10 },
        { id: 'A2', exerciseId: 'extensora', sets: 3, repMin: 10, repMax: 15, restS: 60, weeklyIncrementKg: 5 },
      ],
    },
    {
      id: 'B',
      name: 'Treino B — Superiores & Postura',
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

// Alunos para o Radar
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

// ========================================================================
// AVALIAÇÃO FÍSICA REAL — BALANÇA UNIQUE HEALTH + DOBRAS CUTÂNEAS + FOTOS
// ========================================================================

export const samuelAssessment: PhysicalAssessment = {
  id: 'avaliacao-samuel-2026-09-19',
  studentId: 'previa',
  trainerId: 'trainer-aurora',
  data: '2026-09-19T09:39:24.000Z',

  // Fotos corporais em alta resolução
  photos: {
    frenteUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
    costasUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    perfilDireitoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    perfilEsquerdoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
    data: '19/09/2026',
  },

  bioimpedance: {
    dataHora: '19/09/2026 09:39:24',
    pesoKg: 91.2,
    alturaCm: 177,
    idade: 37,
    sexo: 'M',
    pontuacaoFisica: 87,
    avaliacaoSaude: 'Bom',

    // Composição 4 compartimentos
    aguaTotalKg: 52.6,
    aguaTotalMin: 38.7,
    aguaTotalMax: 47.3,
    aguaIntracelularKg: 33.3,
    aguaIntracelularMin: 24.0,
    aguaIntracelularMax: 29.4,
    aguaExtracelularKg: 19.3,
    aguaExtracelularMin: 14.7,
    aguaExtracelularMax: 18.0,

    massaGordaKg: 19.3,
    massaGordaMin: 8.3,
    massaGordaMax: 16.6,
    percGordura: 21.2,
    percGorduraMin: 10.0,
    percGorduraMax: 20.0,

    massaProteicaKg: 14.3,
    massaProteicaMin: 10.3,
    massaProteicaMax: 12.6,

    mineraisKg: 4.9,
    mineraisMin: 3.5,
    mineraisMax: 4.3,

    massaOsseaKg: 3.9,
    massaOsseaMin: 3.0,
    massaOsseaMax: 3.7,

    massaCelularCorporalKg: 47.4,
    massaCelularMin: 34.4,
    massaCelularMax: 42.0,

    massaLivreGorduraKg: 71.8,
    massaLivreMin: 50.3,
    massaLivreMax: 62.6,

    // Musculoesquelético
    massaMuscularTotalKg: 66.9,
    massaMuscularMin: 49.7,
    massaMuscularMax: 68.3,
    massaMuscularEsqueleticaKg: 41.3,
    massaMuscularEsqueleticaMin: 29.5,
    massaMuscularEsqueleticaMax: 36.1,
    taxaMusculoEsqueleticoPerc: 45.2,
    taxaMusculoEsqueleticoMin: 32.3,
    taxaMusculoEsqueleticoMax: 39.5,

    // Síntese e Índices
    imc: 29.1,
    imcMin: 18.5,
    imcMax: 25.0,
    freqCardiacaBpm: 106,
    bmrKcal: 1920,
    bmrMin: 1877,
    bmrMax: 2212,
    ingestaoCaloricaRecomendadaKcal: 2496,
    adiposidadePerc: 132,
    relacaoProteicaPerc: 15.6,
    relacaoCinturaQuadril: 0.90,
    gorduraVisceralNivel: 8,
    gorduraSubcutaneaKg: 17.1,
    relacaoGorduraSubcutaneaPerc: 18.7,
    idadeCorporal: 44,

    // Metas
    pesoPadraoKg: 84.5,
    controlePesoKg: -6.7,
    controleGorduraKg: -6.7,
    controleMuscularKg: 0,
    pesoIdealKg: 68.9,
    nivelObesidade: 'Sobrepeso',

    // Tipologia
    tipoCorpoGordura: 'Sobrepeso',
    tipoCorpoMusculo: 'Padrão / Excelente',
    tipoCorpoClassificacao: 'Tipo muscular acima do peso',

    // Análise Segmentar
    segmentar: {
      gordura: {
        bracoEsquerdo: { kg: 1.2, proporcaoPadraoPerc: 200.0 },
        bracoDireito: { kg: 1.2, proporcaoPadraoPerc: 200.0 },
        tronco: { kg: 10.0, proporcaoPadraoPerc: 232.5 },
        pernaEsquerda: { kg: 2.6, proporcaoPadraoPerc: 152.9 },
        pernaDireita: { kg: 2.6, proporcaoPadraoPerc: 152.9 },
      },
      musculo: {
        bracoEsquerdo: { kg: 3.8, proporcaoPadraoPerc: 108.5 },
        bracoDireito: { kg: 3.7, proporcaoPadraoPerc: 105.7 },
        tronco: { kg: 31.7, proporcaoPadraoPerc: 111.0 },
        pernaEsquerda: { kg: 11.4, proporcaoPadraoPerc: 115.1 },
        pernaDireita: { kg: 11.6, proporcaoPadraoPerc: 117.1 },
      },
    },
  },

  skinfolds: {
    protocolo: 'pollock_7',
    peitoralMm: 14,
    axilarMediaMm: 16,
    subescapularMm: 18,
    tricipitalMm: 12,
    abdominalMm: 26,
    suprailiacaMm: 20,
    coxaMm: 18,
    somaDobrasMm: 124,
    densidadeCorporal: 1.0542,
    percGorduraEstimado: 20.8,
  },

  circumferences: {
    toraxCm: 108,
    cinturaCm: 88,
    abdomenCm: 94,
    quadrilCm: 104,
    bracoContraidoCm: 39.5,
    bracoRelaxadoCm: 37.0,
    coxaMedialCm: 62.0,
    panturrilhaCm: 41.0,
  },

  notasProfissional:
    'Excelente volume de massa muscular esquelética (41.3 kg), bem acima da média populacional. Foco da periodização atual: redução gradual de gordura subcutânea e visceral com déficit calórico moderado, preservando 100% da massa magra.',
};

export const assessmentHistory = [
  { data: '07/03/2026', pesoKg: 89.15, musculoEsqueleticoKg: 44.8, percGordura: 15.1 },
  { data: '01/06/2026', pesoKg: 88.00, musculoEsqueleticoKg: 38.0, percGordura: 16.0 },
  { data: '12/09/2026', pesoKg: 90.95, musculoEsqueleticoKg: 41.5, percGordura: 20.6 },
  { data: '19/09/2026', pesoKg: 91.20, musculoEsqueleticoKg: 41.3, percGordura: 21.2 },
];
