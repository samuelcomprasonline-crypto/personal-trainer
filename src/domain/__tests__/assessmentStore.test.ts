import {
  getAssessmentsForStudent,
  getLatestAssessmentForStudent,
  saveOrUpdateAssessment,
  updateAssessmentPhotos,
  updateBioimpedanceData,
} from '../../data/assessmentStore';

describe('assessmentStore & gerenciamento de avaliações por aluno', () => {
  it('deve carregar avaliações do aluno pelo nome', () => {
    const list = getAssessmentsForStudent('Samuel Ferreira');
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].studentId).toBeDefined();
  });

  it('deve retornar a avaliação mais recente do aluno', () => {
    const latest = getLatestAssessmentForStudent('Samuel Ferreira');
    expect(latest.bioimpedance).toBeDefined();
    expect(latest.bioimpedance?.pesoKg).toBeGreaterThan(0);
  });

  it('deve atualizar fotos de uma avaliação existente', () => {
    const latest = getLatestAssessmentForStudent('Samuel Ferreira');
    const updated = updateAssessmentPhotos(latest.id, {
      frenteUrl: 'https://exemplo.com/frente-nova.jpg',
      data: '20/09/2026',
    });

    expect(updated).not.toBeNull();
    expect(updated?.photos?.frenteUrl).toBe('https://exemplo.com/frente-nova.jpg');
  });

  it('deve atualizar dados manuais de bioimpedância da balança', () => {
    const latest = getLatestAssessmentForStudent('Samuel Ferreira');
    const updated = updateBioimpedanceData(latest.id, {
      pesoKg: 89.5,
      percGordura: 19.8,
    });

    expect(updated).not.toBeNull();
    expect(updated?.bioimpedance?.pesoKg).toBe(89.5);
    expect(updated?.bioimpedance?.percGordura).toBe(19.8);
  });

  it('deve criar uma avaliação base se o aluno for novo', () => {
    const novo = getAssessmentsForStudent('Carlos Silva');
    expect(novo.length).toBe(1);
    expect(novo[0].studentId).toBe('Carlos Silva');
  });
});
