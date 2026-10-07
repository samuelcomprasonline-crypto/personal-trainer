export type Mood = 'low' | 'ok' | 'great';

export type Exercise = {
  id: string;
  name: string;
  movementPattern: string;
  primaryMuscle: string;
  equipment: string;
  loadIncrement: number;
  videoUrl?: string; // Link direto do YouTube
  youtubeId?: string; // ID do vídeo no YouTube (ex: "IODxDxX7oi4")
  thumbnailUrl?: string;
  instructions?: string;
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

// -------------------------------------------------------------
// Avaliação Física: Bioimpedância (Modelo Unique Health) & Dobras
// -------------------------------------------------------------

export type SegmentMeasurement = {
  kg: number;
  proporcaoPadraoPerc: number;
};

export type SegmentalAnalysis = {
  gordura: {
    bracoEsquerdo: SegmentMeasurement;
    bracoDireito: SegmentMeasurement;
    tronco: SegmentMeasurement;
    pernaEsquerda: SegmentMeasurement;
    pernaDireita: SegmentMeasurement;
  };
  musculo: {
    bracoEsquerdo: SegmentMeasurement;
    bracoDireito: SegmentMeasurement;
    tronco: SegmentMeasurement;
    pernaEsquerda: SegmentMeasurement;
    pernaDireita: SegmentMeasurement;
  };
};

export type BioimpedanceAssessment = {
  dataHora: string;
  pesoKg: number;
  alturaCm: number;
  idade: number;
  sexo: 'M' | 'F';
  pontuacaoFisica: number; // Ex: 87
  avaliacaoSaude: string; // Ex: "bom"

  // Composição em 4 Compartimentos
  aguaTotalKg: number;
  aguaTotalMin: number;
  aguaTotalMax: number;
  aguaIntracelularKg: number;
  aguaIntracelularMin: number;
  aguaIntracelularMax: number;
  aguaExtracelularKg: number;
  aguaExtracelularMin: number;
  aguaExtracelularMax: number;

  massaGordaKg: number;
  massaGordaMin: number;
  massaGordaMax: number;
  percGordura: number;
  percGorduraMin: number;
  percGorduraMax: number;

  massaProteicaKg: number;
  massaProteicaMin: number;
  massaProteicaMax: number;

  mineraisKg: number;
  mineraisMin: number;
  mineraisMax: number;

  massaOsseaKg: number;
  massaOsseaMin: number;
  massaOsseaMax: number;

  massaCelularCorporalKg: number;
  massaCelularMin: number;
  massaCelularMax: number;

  massaLivreGorduraKg: number;
  massaLivreMin: number;
  massaLivreMax: number;

  // Situação Musculoesquelética
  massaMuscularTotalKg: number;
  massaMuscularMin: number;
  massaMuscularMax: number;
  massaMuscularEsqueleticaKg: number;
  massaMuscularEsqueleticaMin: number;
  massaMuscularEsqueleticaMax: number;
  taxaMusculoEsqueleticoPerc: number;
  taxaMusculoEsqueleticoMin: number;
  taxaMusculoEsqueleticoMax: number;

  // Síntese e Índices Metabólicos
  imc: number;
  imcMin: number;
  imcMax: number;
  freqCardiacaBpm?: number;
  bmrKcal: number;
  bmrMin: number;
  bmrMax: number;
  ingestaoCaloricaRecomendadaKcal: number;
  adiposidadePerc: number;
  relacaoProteicaPerc: number;
  relacaoCinturaQuadril: number;
  gorduraVisceralNivel: number;
  gorduraSubcutaneaKg: number;
  relacaoGorduraSubcutaneaPerc: number;
  idadeCorporal: number; // Idade biológica/metabólica

  // Recomendações e Metas
  pesoPadraoKg: number;
  controlePesoKg: number;
  controleGorduraKg: number;
  controleMuscularKg: number;
  pesoIdealKg: number;
  nivelObesidade: string; // Ex: "Sobrepeso", "Normal"

  // Tipologia Corporal
  tipoCorpoGordura: string;
  tipoCorpoMusculo: string;
  tipoCorpoClassificacao: string;

  // Análise Segmentar
  segmentar: SegmentalAnalysis;
};

export type SkinfoldsData = {
  protocolo: 'pollock_7' | 'pollock_3' | 'faulkner';
  peitoralMm?: number;
  axilarMediaMm?: number;
  subescapularMm?: number;
  tricipitalMm?: number;
  abdominalMm?: number;
  suprailiacaMm?: number;
  coxaMm?: number;
  panturrilhaMm?: number;
  somaDobrasMm?: number;
  densidadeCorporal?: number;
  percGorduraEstimado?: number;
};

export type CircumferencesData = {
  bracoRelaxadoCm?: number;
  bracoContraidoCm?: number;
  antebracoCm?: number;
  toraxCm?: number;
  cinturaCm?: number;
  abdomenCm?: number;
  quadrilCm?: number;
  coxaProximalCm?: number;
  coxaMedialCm?: number;
  panturrilhaCm?: number;
};

export type AssessmentPhotos = {
  frenteUrl?: string;
  costasUrl?: string;
  perfilDireitoUrl?: string;
  perfilEsquerdoUrl?: string;
  data: string;
};

export type PhysicalAssessment = {
  id: string;
  studentId: string;
  trainerId: string;
  data: string; // ISO 8601
  bioimpedance?: BioimpedanceAssessment;
  skinfolds?: SkinfoldsData;
  circumferences?: CircumferencesData;
  photos?: AssessmentPhotos;
  notasProfissional?: string;
};

// -------------------------------------------------------------
// Autenticação, Perfis e Sincronização
// -------------------------------------------------------------

export type UserRole = 'trainer' | 'student';

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  trainerId?: string;
  brandColor?: string;
  logoUrl?: string;
  phone?: string;
  createdAt: string;
};

export type StudentInvite = {
  id: string;
  trainerId: string;
  trainerName?: string;
  studentEmail: string;
  studentName?: string;
  code: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt?: string;
};

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'offline' | 'error';

// -------------------------------------------------------------
// Nutrição, Dietas e Vitaminas
// -------------------------------------------------------------

export type FoodItem = {
  id: string;
  name: string;
  quantityGrams: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type Meal = {
  id: string;
  name: string;
  time: string; // ex: "07:30"
  foods: FoodItem[];
  vitamins?: string[];
};

export type DietPlan = {
  id: string;
  studentId: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  waterTargetMl: number;
  tmbKcal: number;
  tdeeKcal: number;
  meals: Meal[];
  supplements: string[];
};

// -------------------------------------------------------------
// Biblioteca de Métodos e Programas de Treino
// -------------------------------------------------------------

export type TrainingMethod = {
  id: string;
  name: string;
  description: string;
  howToApply: string;
  intensityLevel: 'moderado' | 'alto' | 'extremo';
};

export type WorkoutProgram = {
  id: string;
  name: string;
  goal: 'hipertrofia' | 'forca' | 'emagrecimento' | 'recomposicao' | 'condicionamento';
  level: 'iniciante' | 'intermediario' | 'avancado';
  frequencyDaysPerWeek: number;
  durationWeeks: number;
  description: string;
  sessions: TemplateSession[];
  recommendedMethods: string[];
};

// -------------------------------------------------------------
// Anexo de Balança (PDF ou Foto) e Leitura Inteligente
// -------------------------------------------------------------

export type AssessmentAttachment = {
  id: string;
  assessmentId: string;
  fileType: 'pdf' | 'image';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  equipmentSource: 'InBody' | 'Unique Health' | 'Tanita' | 'Manual';
  extractedSummary?: {
    weightKg: number;
    bodyFatPerc: number;
    muscleMassKg: number;
    totalWaterKg: number;
  };
};

// -------------------------------------------------------------
// Recuperação e Biofeedback (Wearables: Apple Watch, Oura, Whoop)
// -------------------------------------------------------------

export type RecoveryMetrics = {
  readinessScore: number; // 0 a 100
  sleepHours: number;
  sleepQualityPerc: number;
  hrvMs: number;
  restingHeartRateBpm: number;
  muscleSoreness: 'baixa' | 'moderada' | 'alta';
  systemicFatigue: 'baixa' | 'moderada' | 'alta';
  lastUpdated: string;
};


