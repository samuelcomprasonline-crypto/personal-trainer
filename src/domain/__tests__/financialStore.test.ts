import {
  addFinancialTransaction,
  calculateFinancialSummary,
  getFinancialTransactions,
  getTrainerProducts,
  saveTrainerProduct,
  updateTransactionStatus,
} from '../../data/financialStore';

describe('financialStore & Fluxo de Caixa do Personal', () => {
  it('deve carregar lista de produtos e serviços do personal', () => {
    const products = getTrainerProducts();
    expect(products.length).toBeGreaterThanOrEqual(4);
    expect(products.some((p) => p.category === 'presencial_full')).toBe(true);
    expect(products.some((p) => p.category === 'avaliacao_fisica')).toBe(true);
    expect(products.some((p) => p.category === 'consultoria_online')).toBe(true);
  });

  it('deve calcular resumo financeiro, fluxo de caixa e valor da hora-aula', () => {
    const summary = calculateFinancialSummary();
    expect(summary.totalReceivedRevenue).toBeGreaterThan(0);
    expect(summary.netProfit).toBeGreaterThan(0);
    expect(summary.effectiveHourlyRate).toBeGreaterThan(0);
    expect(summary.revenueByProduct.length).toBeGreaterThan(0);
  });

  it('deve permitir adicionar transação e recalcular fluxo de caixa', () => {
    const prevSummary = calculateFinancialSummary();
    addFinancialTransaction({
      id: `tx-test-${Date.now()}`,
      studentName: 'Aluno Teste',
      productId: 'prod-avaliacao-fisica',
      productName: 'Avaliação Física',
      category: 'avaliacao_fisica',
      amount: 150,
      date: '06/10/2026',
      status: 'pago',
      type: 'receita',
    });

    const newSummary = calculateFinancialSummary();
    expect(newSummary.totalReceivedRevenue).toBe(prevSummary.totalReceivedRevenue + 150);
  });

  it('deve permitir atualizar status de pagamento', () => {
    const transactions = getFinancialTransactions();
    const target = transactions[0];
    const updated = updateTransactionStatus(target.id, 'pendente');

    expect(updated?.status).toBe('pendente');
  });

  it('deve permitir editar o preço padrão de um serviço', () => {
    const products = getTrainerProducts();
    const prod = products[0];
    const updated = saveTrainerProduct({
      ...prod,
      defaultPrice: 1500,
    });

    expect(updated.defaultPrice).toBe(1500);
  });
});
