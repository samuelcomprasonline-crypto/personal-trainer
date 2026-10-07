import type { AssessmentPhotos, BioimpedanceAssessment, PhysicalAssessment } from '../domain/types';
import { samuelAssessment } from './seed';

// Avaliação baseline anterior do Samuel (10/01/2026) para permitir comparativo Antes x Depois
export const samuelBaselineAssessment: PhysicalAssessment = {
  id: 'avaliacao-samuel-2026-01-10',
  studentId: 'previa',
  trainerId: 'trainer-julio-balestrin',
  data: '2026-01-10T10:00:00.000Z',
  photos: {
    frenteUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    costasUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
    perfilDireitoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    perfilEsquerdoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    data: '10/01/2026',
  },
  bioimpedance: {
    ...samuelAssessment.bioimpedance!,
    dataHora: '10/01/2026 08:30:00',
    pesoKg: 95.8,
    percGordura: 25.4,
    massaGordaKg: 24.3,
    massaMuscularEsqueleticaKg: 36.8,
    taxaMusculoEsqueleticoPerc: 38.4,
    imc: 30.6,
    aguaTotalKg: 49.2,
    gorduraVisceralNivel: 10,
    bmrKcal: 1720,
    pontuacaoFisica: 74,
  },
  circumferences: {
    toraxCm: 103,
    cinturaCm: 96,
    abdomenCm: 98,
    quadrilCm: 106,
    bracoRelaxadoCm: 36.0,
    bracoContraidoCm: 38.5,
    antebracoCm: 29.0,
    coxaProximalCm: 63.0,
    panturrilhaCm: 39.0,
  },
  skinfolds: {
    protocolo: 'pollock_7',
    densidadeCorporal: 1.042,
    percGorduraEstimado: 25.0,
    somaDobrasMm: 156,
  },
  notasProfissional: 'Avaliação inicial baseline. Foco em déficit calórico controlado e recomposição corporal com treinos de força pesados.',
};

// Avaliações de outros alunos para o prontuário não ficar solto nem vazio
export const beatrizAssessment: PhysicalAssessment = {
  id: 'avaliacao-beatriz-2026-09-01',
  studentId: 'student-1',
  trainerId: 'trainer-julio-balestrin',
  data: '2026-09-01T14:20:00.000Z',
  photos: {
    frenteUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    costasUrl: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&auto=format&fit=crop&q=80',
    perfilDireitoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
    perfilEsquerdoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
    data: '01/09/2026',
  },
  bioimpedance: {
    ...samuelAssessment.bioimpedance!,
    dataHora: '01/09/2026 14:20:00',
    pesoKg: 62.5,
    alturaCm: 165,
    idade: 29,
    sexo: 'F',
    pontuacaoFisica: 89,
    pesoPadraoKg: 60.0,
    pesoIdealKg: 60.0,
    percGordura: 22.1,
    massaGordaKg: 13.8,
    massaMuscularEsqueleticaKg: 25.2,
    taxaMusculoEsqueleticoPerc: 40.3,
    imc: 23.0,
    aguaTotalKg: 35.8,
    gorduraVisceralNivel: 4,
    bmrKcal: 1410,
    nivelObesidade: 'Normal',
  },
  circumferences: {
    toraxCm: 88,
    cinturaCm: 68,
    abdomenCm: 72,
    quadrilCm: 98,
    bracoRelaxadoCm: 28.0,
    bracoContraidoCm: 29.5,
    antebracoCm: 23.0,
    coxaProximalCm: 56.0,
    panturrilhaCm: 35.0,
  },
  notasProfissional: 'Excelente tônus muscular em membros inferiores. Meta: manutenção de massa magra e definição de glúteos e abdômen.',
};

export const rafaelAssessment: PhysicalAssessment = {
  id: 'avaliacao-rafael-2026-08-15',
  studentId: 'student-2',
  trainerId: 'trainer-julio-balestrin',
  data: '2026-08-15T18:00:00.000Z',
  photos: {
    frenteUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800&auto=format&fit=crop&q=80',
    costasUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    perfilDireitoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    perfilEsquerdoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    data: '15/08/2026',
  },
  bioimpedance: {
    ...samuelAssessment.bioimpedance!,
    dataHora: '15/08/2026 18:00:00',
    pesoKg: 88.0,
    alturaCm: 182,
    idade: 34,
    sexo: 'M',
    pontuacaoFisica: 92,
    pesoPadraoKg: 82.0,
    pesoIdealKg: 82.0,
    percGordura: 16.5,
    massaGordaKg: 14.5,
    massaMuscularEsqueleticaKg: 42.1,
    taxaMusculoEsqueleticoPerc: 47.8,
    imc: 26.5,
    aguaTotalKg: 54.0,
    gorduraVisceralNivel: 6,
    bmrKcal: 1950,
    nivelObesidade: 'Normal / Atlético',
  },
  circumferences: {
    toraxCm: 110,
    cinturaCm: 84,
    abdomenCm: 86,
    quadrilCm: 101,
    bracoRelaxadoCm: 40.0,
    bracoContraidoCm: 43.0,
    antebracoCm: 32.0,
    coxaProximalCm: 62.0,
    panturrilhaCm: 40.0,
  },
  notasProfissional: 'Atleta com alta densidade muscular. Foco em progressão de cargas no supino e agachamento.',
};

// Armazenamento em memória com cópia profunda inicial
const initialAssessments: PhysicalAssessment[] = [
  samuelBaselineAssessment,
  samuelAssessment,
  beatrizAssessment,
  rafaelAssessment,
];

let assessmentsMemory: PhysicalAssessment[] = [...initialAssessments];

/**
 * Retorna todas as avaliações de um aluno pelo nome ou ID, ordenadas da mais antiga para a mais recente.
 */
export function getAssessmentsForStudent(studentNameOrId: string): PhysicalAssessment[] {
  const norm = studentNameOrId.trim().toLowerCase();
  
  const matches = assessmentsMemory.filter((a) => {
    if (a.studentId && a.studentId.toLowerCase() === norm) return true;
    if (norm.includes('samuel') && (a.studentId === 'previa' || a.id.includes('samuel'))) return true;
    if (norm.includes('beatriz') && (a.studentId === 'student-1' || a.id.includes('beatriz'))) return true;
    if (norm.includes('rafael') && (a.studentId === 'student-2' || a.id.includes('rafael'))) return true;
    return false;
  });

  if (matches.length > 0) {
    return matches.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }

  // Se for um novo aluno sem avaliação anterior, cria uma avaliação base personalizada
  const fallback: PhysicalAssessment = {
    id: `avaliacao-${studentNameOrId.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    studentId: studentNameOrId,
    trainerId: 'trainer-julio-balestrin',
    data: new Date().toISOString(),
    photos: {
      frenteUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
      costasUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      perfilDireitoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      perfilEsquerdoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      data: new Date().toLocaleDateString('pt-BR'),
    },
    bioimpedance: {
      ...samuelAssessment.bioimpedance!,
      dataHora: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
      pesoKg: 78.0,
      percGordura: 20.0,
      massaMuscularEsqueleticaKg: 34.0,
    },
    circumferences: { ...samuelAssessment.circumferences! },
    skinfolds: { ...samuelAssessment.skinfolds! },
    notasProfissional: `Avaliação inicial cadastrada para ${studentNameOrId}.`,
  };

  assessmentsMemory.push(fallback);
  return [fallback];
}

/**
 * Retorna a avaliação mais recente de um aluno.
 */
export function getLatestAssessmentForStudent(studentNameOrId: string): PhysicalAssessment {
  const list = getAssessmentsForStudent(studentNameOrId);
  return list[list.length - 1];
}

/**
 * Salva ou atualiza uma avaliação física.
 */
export function saveOrUpdateAssessment(assessment: PhysicalAssessment): PhysicalAssessment {
  const idx = assessmentsMemory.findIndex((a) => a.id === assessment.id);
  if (idx >= 0) {
    assessmentsMemory[idx] = { ...assessment };
  } else {
    assessmentsMemory.push({ ...assessment });
  }
  return assessment;
}

/**
 * Atualiza fotos de uma avaliação específica.
 */
export function updateAssessmentPhotos(assessmentId: string, photos: AssessmentPhotos): PhysicalAssessment | null {
  const idx = assessmentsMemory.findIndex((a) => a.id === assessmentId);
  if (idx >= 0) {
    assessmentsMemory[idx] = {
      ...assessmentsMemory[idx],
      photos: { ...photos },
    };
    return assessmentsMemory[idx];
  }
  return null;
}

/**
 * Atualiza dados de bioimpedância de uma avaliação de forma manual ou automática.
 */
export function updateBioimpedanceData(
  assessmentId: string,
  updates: Partial<BioimpedanceAssessment>
): PhysicalAssessment | null {
  const idx = assessmentsMemory.findIndex((a) => a.id === assessmentId);
  if (idx >= 0 && assessmentsMemory[idx].bioimpedance) {
    assessmentsMemory[idx] = {
      ...assessmentsMemory[idx],
      bioimpedance: {
        ...assessmentsMemory[idx].bioimpedance!,
        ...updates,
      },
    };
    return assessmentsMemory[idx];
  }
  return null;
}
