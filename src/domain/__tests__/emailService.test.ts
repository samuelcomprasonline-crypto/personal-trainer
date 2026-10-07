jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

import { buildInviteEmailHtml, sendAutomaticInviteEmail } from '../../lib/emailService';

describe('emailService & Envio Automático de Convites', () => {
  it('deve gerar template HTML completo e com as informações do aluno', () => {
    const html = buildInviteEmailHtml({
      studentName: 'Carlos Silva',
      studentEmail: 'carlos@email.com',
      code: 'TREINO-88331',
      planType: 'Trimestral',
      monthlyPrice: '300',
      dueDay: '15',
      workoutProgram: 'Projeto 60 Dias Balestrin',
    });

    expect(html).toContain('Carlos Silva');
    expect(html).toContain('TREINO-88331');
    expect(html).toContain('Projeto 60 Dias Balestrin');
    expect(html).toContain('Trimestral');
    expect(html).toContain('#C6F432');
  });

  it('deve indicar que precisa de configuração se nenhuma API Key for passada', async () => {
    const result = await sendAutomaticInviteEmail({
      studentName: 'Lucas',
      studentEmail: 'lucas@teste.com',
      code: 'TREINO-9999',
      planType: 'Mensal',
      monthlyPrice: '250',
      dueDay: '10',
      workoutProgram: 'Iniciante',
    });

    expect(result.needsConfig).toBe(true);
    expect(result.success).toBe(false);
  });
});
