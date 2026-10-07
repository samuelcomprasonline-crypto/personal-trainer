import type {
  FinancialSummary,
  FinancialTransaction,
  ProductServiceCategory,
  TrainerProduct,
} from '../domain/types';

export const initialTrainerProducts: TrainerProduct[] = [
  {
    id: 'prod-full-presencial',
    name: 'Treinamento Full Presencial (5x/sem)',
    category: 'presencial_full',
    defaultPrice: 1200,
    billingType: 'mensal',
    hoursEstimatedPerMonth: 20,
    description: 'Acompanhamento diário presencial na academia com correção postural em tempo real.',
  },
  {
    id: 'prod-parcial-presencial',
    name: 'Treinamento Presencial (3x/sem)',
    category: 'presencial_parcial',
    defaultPrice: 750,
    billingType: 'mensal',
    hoursEstimatedPerMonth: 12,
    description: 'Acompanhamento presencial 3 dias por semana com suporte e ficha no aplicativo.',
  },
  {
    id: 'prod-consultoria-online',
    name: 'Consultoria Online / Treino em Casa',
    category: 'consultoria_online',
    defaultPrice: 250,
    billingType: 'mensal',
    hoursEstimatedPerMonth: 2,
    description: 'Prescrição de fichas personalizadas, vídeos demonstrativos e suporte via WhatsApp.',
  },
  {
    id: 'prod-avaliacao-fisica',
    name: 'Avaliação Física Presencial (Balança + 3D)',
    category: 'avaliacao_fisica',
    defaultPrice: 150,
    billingType: 'unico',
    hoursEstimatedPerMonth: 1.5,
    description: 'Bioimpedância clínica, protocolo de 7 dobras, perímetros e laudo biomecânico completo.',
  },
  {
    id: 'prod-hora-aula',
    name: 'Hora-Aula Avulsa / Personal Training',
    category: 'hora_aula_avulsa',
    defaultPrice: 100,
    billingType: 'hora',
    hoursEstimatedPerMonth: 1,
    description: 'Sessão individual avulsa de 60 minutos para treino específico ou teste.',
  },
  {
    id: 'prod-dieta-protocolo',
    name: 'Planejamento Nutricional & Macros',
    category: 'dieta_protocolo',
    defaultPrice: 120,
    billingType: 'unico',
    hoursEstimatedPerMonth: 1,
    description: 'Cálculo de gasto calórico diário, distribuição de macronutrientes e sugestão de refeições.',
  },
];

export const initialTransactions: FinancialTransaction[] = [
  {
    id: 'tx-1',
    studentName: 'Samuel Ferreira',
    productId: 'prod-parcial-presencial',
    productName: 'Treinamento Presencial (3x/sem)',
    category: 'presencial_parcial',
    amount: 750,
    date: '05/10/2026',
    dueDate: '10/10/2026',
    status: 'pago',
    type: 'receita',
    notes: 'Mensalidade Outubro paga via PIX',
  },
  {
    id: 'tx-2',
    studentName: 'Beatriz Souza',
    productId: 'prod-consultoria-online',
    productName: 'Consultoria Online / Treino em Casa',
    category: 'consultoria_online',
    amount: 250,
    date: '01/10/2026',
    dueDate: '05/10/2026',
    status: 'pago',
    type: 'receita',
    notes: 'Plano Trimestral ativo',
  },
  {
    id: 'tx-3',
    studentName: 'Rafael Costa',
    productId: 'prod-full-presencial',
    productName: 'Treinamento Full Presencial (5x/sem)',
    category: 'presencial_full',
    amount: 1200,
    date: '02/10/2026',
    dueDate: '05/10/2026',
    status: 'pago',
    type: 'receita',
    notes: 'Atleta com foco em hipertrofia',
  },
  {
    id: 'tx-4',
    studentName: 'Camila Rocha',
    productId: 'prod-consultoria-online',
    productName: 'Consultoria Online / Treino em Casa',
    category: 'consultoria_online',
    amount: 250,
    date: '06/10/2026',
    dueDate: '15/10/2026',
    status: 'pendente',
    type: 'receita',
    notes: 'Vencimento próximo',
  },
  {
    id: 'tx-5',
    studentName: 'Rodrigo Silva',
    productId: 'prod-avaliacao-fisica',
    productName: 'Avaliação Física Presencial (Balança + 3D)',
    category: 'avaliacao_fisica',
    amount: 150,
    date: '04/10/2026',
    status: 'pago',
    type: 'receita',
    notes: 'Avaliação física inicial com balança',
  },
  {
    id: 'tx-6',
    studentName: 'Mariana Lima',
    productId: 'prod-hora-aula',
    productName: 'Hora-Aula Avulsa (2 sessões)',
    category: 'hora_aula_avulsa',
    amount: 200,
    date: '03/10/2026',
    status: 'pago',
    type: 'receita',
    notes: '2 aulas avulsas de perna',
  },
  {
    id: 'tx-exp-1',
    studentName: 'Conselho Regional de Ed. Física',
    productId: 'despesa-cref',
    productName: 'CREF Mensalidade',
    category: 'despesa_operacional',
    amount: 65,
    date: '05/10/2026',
    status: 'pago',
    type: 'despesa',
    notes: 'Anuidade parcelada',
  },
  {
    id: 'tx-exp-2',
    studentName: 'Deslocamento & Combustível',
    productId: 'despesa-combustivel',
    productName: 'Deslocamento Academias',
    category: 'despesa_operacional',
    amount: 220,
    date: '06/10/2026',
    status: 'pago',
    type: 'despesa',
    notes: 'Combustível da semana',
  },
];

let productsMemory: TrainerProduct[] = [...initialTrainerProducts];
let transactionsMemory: FinancialTransaction[] = [...initialTransactions];

export function getTrainerProducts(): TrainerProduct[] {
  return [...productsMemory];
}

export function saveTrainerProduct(prod: TrainerProduct): TrainerProduct {
  const idx = productsMemory.findIndex((p) => p.id === prod.id);
  if (idx >= 0) {
    productsMemory[idx] = { ...prod };
  } else {
    productsMemory.push({ ...prod });
  }
  return prod;
}

export function deleteTrainerProduct(id: string): void {
  productsMemory = productsMemory.filter((p) => p.id !== id);
}

export function getFinancialTransactions(): FinancialTransaction[] {
  return [...transactionsMemory];
}

export function addFinancialTransaction(tx: FinancialTransaction): FinancialTransaction {
  transactionsMemory.unshift(tx);
  return tx;
}

export function updateTransactionStatus(
  id: string,
  newStatus: 'pago' | 'pendente' | 'atrasado'
): FinancialTransaction | null {
  const item = transactionsMemory.find((t) => t.id === id);
  if (item) {
    item.status = newStatus;
    return item;
  }
  return null;
}

export function deleteFinancialTransaction(id: string): void {
  transactionsMemory = transactionsMemory.filter((t) => t.id !== id);
}

/**
 * Calcula o fluxo de caixa, lucro líquido, distribuição por produto e valor da hora-aula
 */
export function calculateFinancialSummary(): FinancialSummary {
  let totalReceivedRevenue = 0;
  let totalPendingRevenue = 0;
  let totalExpenses = 0;
  let totalHoursWorked = 0;

  const productTotals: Record<string, { totalAmount: number; count: number; name: string; category: ProductServiceCategory }> = {};

  // Inicializa mapa com todos os produtos
  productsMemory.forEach((p) => {
    productTotals[p.id] = {
      name: p.name,
      category: p.category,
      totalAmount: 0,
      count: 0,
    };
  });

  transactionsMemory.forEach((tx) => {
    if (tx.type === 'receita') {
      if (tx.status === 'pago') {
        totalReceivedRevenue += tx.amount;

        // Horas estimadas
        const matchedProd = productsMemory.find((p) => p.id === tx.productId);
        if (matchedProd) {
          totalHoursWorked += matchedProd.hoursEstimatedPerMonth;
        } else {
          totalHoursWorked += 1;
        }

        if (!productTotals[tx.productId]) {
          productTotals[tx.productId] = {
            name: tx.productName,
            category: tx.category,
            totalAmount: 0,
            count: 0,
          };
        }
        productTotals[tx.productId].totalAmount += tx.amount;
        productTotals[tx.productId].count += 1;
      } else {
        totalPendingRevenue += tx.amount;
      }
    } else if (tx.type === 'despesa') {
      totalExpenses += tx.amount;
    }
  });

  const totalExpectedRevenue = totalReceivedRevenue + totalPendingRevenue;
  const netProfit = totalReceivedRevenue - totalExpenses;

  // Valor da Hora Aula: Faturamento Líquido / Horas Trabalhadas
  const effectiveHours = totalHoursWorked > 0 ? totalHoursWorked : 40;
  const effectiveHourlyRate = Math.round((netProfit / effectiveHours) * 10) / 10;

  const revenueByProduct = Object.entries(productTotals)
    .filter(([_, data]) => data.totalAmount > 0)
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      category: data.category,
      totalAmount: data.totalAmount,
      count: data.count,
      percentage: totalReceivedRevenue > 0 ? Math.round((data.totalAmount / totalReceivedRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    totalExpectedRevenue,
    totalReceivedRevenue,
    totalPendingRevenue,
    totalExpenses,
    netProfit,
    totalHoursWorked: effectiveHours,
    effectiveHourlyRate: Math.max(0, effectiveHourlyRate),
    revenueByProduct,
  };
}
