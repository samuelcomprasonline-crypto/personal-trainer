import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  addFinancialTransaction,
  calculateFinancialSummary,
  getFinancialTransactions,
  getTrainerProducts,
  saveTrainerProduct,
  updateTransactionStatus,
} from '../../src/data/financialStore';
import type { FinancialTransaction, TrainerProduct } from '../../src/domain/types';
import { Body, Button, Card, Chip, Label, Screen, TextInputField, Title } from '../../src/ui/components';
import { colors, radius, spacing, useTheme } from '../../src/ui/theme';

export default function Financeiro() {
  const t = useTheme();

  const [activeTab, setActiveTab] = useState<'resumo' | 'transacoes' | 'produtos'>('resumo');
  const [summary, setSummary] = useState(calculateFinancialSummary());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(getFinancialTransactions());
  const [products, setProducts] = useState<TrainerProduct[]>(getTrainerProducts());

  // Modal de Nova Transação
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [txStudentName, setTxStudentName] = useState('');
  const [txSelectedProduct, setTxSelectedProduct] = useState<TrainerProduct>(products[0]);
  const [txAmount, setTxAmount] = useState(String(products[0]?.defaultPrice || 250));
  const [txStatus, setTxStatus] = useState<'pago' | 'pendente'>('pago');
  const [txNotes, setTxNotes] = useState('');

  // Modal de Edição de Produto
  const [editingProduct, setEditingProduct] = useState<TrainerProduct | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');
  const [editHoursInput, setEditHoursInput] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setSummary(calculateFinancialSummary());
    setTransactions(getFinancialTransactions());
    setProducts(getTrainerProducts());
  };

  const handleCreateTransaction = () => {
    if (!txStudentName.trim()) {
      showToast('Informe o nome do aluno ou cliente.');
      return;
    }

    const amountNum = parseFloat(txAmount.replace(',', '.')) || txSelectedProduct.defaultPrice;

    addFinancialTransaction({
      id: `tx-${Date.now()}`,
      studentName: txStudentName.trim(),
      productId: txSelectedProduct.id,
      productName: txSelectedProduct.name,
      category: txSelectedProduct.category,
      amount: amountNum,
      date: new Date().toLocaleDateString('pt-BR'),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      status: txStatus,
      type: 'receita',
      notes: txNotes.trim() || undefined,
    });

    refreshData();
    setShowNewTxModal(false);
    setTxStudentName('');
    setTxNotes('');
    showToast(`Lançamento de R$ ${amountNum},00 registrado com sucesso!`);
  };

  const handleToggleStatus = (id: string, currentStatus: 'pago' | 'pendente' | 'atrasado') => {
    const nextStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
    updateTransactionStatus(id, nextStatus);
    refreshData();
    showToast(`Status atualizado para: ${nextStatus.toUpperCase()}!`);
  };

  const handleSaveProductEdit = () => {
    if (!editingProduct) return;
    const newPrice = parseFloat(editPriceInput.replace(',', '.')) || editingProduct.defaultPrice;
    const newHours = parseFloat(editHoursInput.replace(',', '.')) || editingProduct.hoursEstimatedPerMonth;

    saveTrainerProduct({
      ...editingProduct,
      defaultPrice: newPrice,
      hoursEstimatedPerMonth: newHours,
    });

    refreshData();
    setEditingProduct(null);
    showToast(`Produto "${editingProduct.name}" atualizado!`);
  };

  return (
    <Screen>
      {/* 1. CABEÇALHO */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <View>
          <Label style={{ color: t.accent }}>Painel de Gestão & Negócios</Label>
          <Title size={28}>Fluxo de Caixa & Finanças</Title>
        </View>

        <Button
          title="+ Novo Recebimento / Lançamento 💰"
          onPress={() => setShowNewTxModal(true)}
        />
      </View>

      <Body muted style={{ fontSize: 13 } as any}>
        Monitore o faturamento de cada serviço, controle inadimplências e saiba exatamente o valor da sua hora-aula.
      </Body>

      {toastMessage && (
        <View
          style={{
            backgroundColor: 'rgba(198, 244, 50, 0.15)',
            padding: 12,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: t.accent,
            marginVertical: 4,
          }}
        >
          <Body style={{ color: t.accent, fontWeight: '700' } as any}>✓ {toastMessage}</Body>
        </View>
      )}

      {/* 2. CARDS RESUMO DO FLUXO DE CAIXA */}
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {/* Receita Recebida */}
        <View style={{ flex: 1, minWidth: 140 }}>
          <Card>
            <Label style={{ color: t.accent }}>Faturamento Realizado</Label>
            <Title size={24} style={{ color: t.accent, marginTop: 4 }}>
              R$ {summary.totalReceivedRevenue.toLocaleString('pt-BR')},00
            </Title>
            <Body muted style={{ fontSize: 11, marginTop: 2 } as any}>
              Total recebido este mês
            </Body>
          </Card>
        </View>

        {/* Receita Pendente */}
        <View style={{ flex: 1, minWidth: 140 }}>
          <Card>
            <Label style={{ color: '#EAB308' }}>A Receber / Pendente</Label>
            <Title size={24} style={{ color: '#EAB308', marginTop: 4 }}>
              R$ {summary.totalPendingRevenue.toLocaleString('pt-BR')},00
            </Title>
            <Body muted style={{ fontSize: 11, marginTop: 2 } as any}>
              Mensalidades a vencer
            </Body>
          </Card>
        </View>

        {/* Lucro Líquido */}
        <View style={{ flex: 1, minWidth: 140 }}>
          <Card>
            <Label style={{ color: '#60A5FA' }}>Lucro Líquido do Mês</Label>
            <Title size={24} style={{ color: '#60A5FA', marginTop: 4 }}>
              R$ {summary.netProfit.toLocaleString('pt-BR')},00
            </Title>
            <Body muted style={{ fontSize: 11, marginTop: 2 } as any}>
              Menos despesas operacionais
            </Body>
          </Card>
        </View>
      </View>

      {/* 3. CARD DE DESTAQUE: VALOR DA HORA-AULA DO PERSONAL */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <View>
            <Label style={{ color: t.accent }}>Métrica Chave de Eficiência do Profissional</Label>
            <Title size={22}>Valor da Sua Hora-Aula Efetiva</Title>
          </View>

          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: `${t.accent}20`,
              borderWidth: 1,
              borderColor: `${t.accent}40`,
            }}
          >
            <Body style={{ color: t.accent, fontWeight: '800', fontSize: 14 } as any}>
              ⏱ R$ {summary.effectiveHourlyRate.toFixed(2).replace('.', ',')} / hora
            </Body>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Body muted style={{ fontSize: 13, lineHeight: 20 } as any}>
              Com base em <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{summary.totalHoursWorked} horas</Text> de atendimentos e prescrições estimadas no mês, o retorno líquido por hora dedicada ao seu negócio é de <Text style={{ color: t.accent, fontWeight: 'bold' }}>R$ {summary.effectiveHourlyRate.toFixed(2).replace('.', ',')}</Text>.
            </Body>
          </View>
        </View>
      </Card>

      {/* 4. SELETOR DE ABAS */}
      <View style={{ flexDirection: 'row', gap: 6, marginVertical: 4, flexWrap: 'wrap' }}>
        <Chip
          label="📊 Faturamento por Produto"
          selected={activeTab === 'resumo'}
          onPress={() => setActiveTab('resumo')}
        />
        <Chip
          label="📋 Extrato & Lançamentos"
          selected={activeTab === 'transacoes'}
          onPress={() => setActiveTab('transacoes')}
        />
        <Chip
          label="🏷️ Tabela de Serviços & Preços"
          selected={activeTab === 'produtos'}
          onPress={() => setActiveTab('produtos')}
        />
      </View>

      {/* ABA 1: FATURAMENTO DETALHADO POR PRODUTO */}
      {activeTab === 'resumo' && (
        <View style={{ gap: 12 }}>
          <Card>
            <Title size={19}>Quanto você ganha com cada produto:</Title>
            <Body muted style={{ fontSize: 13, marginBottom: 8 } as any}>
              Distribuição proporcional do seu faturamento mensal por modalidade:
            </Body>

            <View style={{ gap: 14 }}>
              {summary.revenueByProduct.map((item) => (
                <View key={item.productId} style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Body style={{ fontSize: 14, fontWeight: '700' } as any}>{item.productName}</Body>
                      <View style={{ backgroundColor: t.surfaceElevated, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 10 }}>{item.count} contratos</Text>
                      </View>
                    </View>
                    <Title size={16} style={{ color: t.accent }}>
                      R$ {item.totalAmount.toLocaleString('pt-BR')},00 ({item.percentage}%)
                    </Title>
                  </View>

                  {/* Barra proporcional */}
                  <View style={{ height: 8, backgroundColor: t.surfaceElevated, borderRadius: 4, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${Math.max(5, item.percentage)}%`,
                        backgroundColor: t.accent,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* ABA 2: EXTRATO E LANÇAMENTOS */}
      {activeTab === 'transacoes' && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Label>Lançamentos e Cobranças ({transactions.length})</Label>
            <Body muted style={{ fontSize: 12 } as any}>Toque no status para alternar pago/pendente</Body>
          </View>

          {transactions.map((tx) => {
            const isPaid = tx.status === 'pago';
            const isExpense = tx.type === 'despesa';

            return (
              <Card key={tx.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Title size={17}>{tx.studentName}</Title>
                    <Body muted style={{ fontSize: 12, marginTop: 2 } as any}>
                      {tx.productName} • {tx.date}
                    </Body>
                    {tx.notes && (
                      <Body muted style={{ fontSize: 11, fontStyle: 'italic', marginTop: 2 } as any}>
                        "{tx.notes}"
                      </Body>
                    )}
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Title
                      size={18}
                      style={{ color: isExpense ? '#EF4444' : isPaid ? t.accent : '#EAB308' }}
                    >
                      {isExpense ? `- R$ ${tx.amount},00` : `+ R$ ${tx.amount},00`}
                    </Title>

                    {!isExpense && (
                      <Pressable
                        onPress={() => handleToggleStatus(tx.id, tx.status)}
                        style={({ pressed }) => ({
                          backgroundColor: isPaid ? 'rgba(198, 244, 50, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: isPaid ? t.accent : '#EAB308',
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text
                          style={{
                            color: isPaid ? t.accent : '#EAB308',
                            fontSize: 11,
                            fontWeight: '800',
                          }}
                        >
                          {isPaid ? 'PAGO ✓' : 'PENDENTE ⚠️'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* ABA 3: TABELA DE PREÇOS E SERVIÇOS DO PERSONAL */}
      {activeTab === 'produtos' && (
        <View style={{ gap: 10 }}>
          <Label>Seus Produtos e Serviços Configurados</Label>
          {products.map((prod) => (
            <Card key={prod.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Title size={18}>{prod.name}</Title>
                  <Body muted style={{ fontSize: 12, marginTop: 2 } as any}>{prod.description}</Body>
                  <Body muted style={{ fontSize: 11, marginTop: 4 } as any}>
                    ⏱ Carga horária estimada: {prod.hoursEstimatedPerMonth}h/mês
                  </Body>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Title size={20} style={{ color: t.accent }}>
                    R$ {prod.defaultPrice},00
                  </Title>
                  <Button
                    title="Editar Preço ✏️"
                    variant="ghost"
                    onPress={() => {
                      setEditingProduct(prod);
                      setEditPriceInput(String(prod.defaultPrice));
                      setEditHoursInput(String(prod.hoursEstimatedPerMonth));
                    }}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* MODAL: NOVO LANÇAMENTO FINANCEIRO */}
      <Modal visible={showNewTxModal} animationType="slide" onRequestClose={() => setShowNewTxModal(false)}>
        <Screen>
          <Pressable onPress={() => setShowNewTxModal(false)} style={{ alignSelf: 'flex-start', paddingVertical: 4 }}>
            <Body muted>← Voltar</Body>
          </Pressable>

          <Label style={{ color: t.accent }}>Registro Financeiro</Label>
          <Title size={26}>Novo Recebimento</Title>
          <Body muted>Lance um pagamento de mensalidade, hora-aula ou avaliação avulsa.</Body>

          <Card>
            <TextInputField
              label="Nome do Aluno ou Cliente *"
              value={txStudentName}
              onChangeText={setTxStudentName}
              placeholder="Ex: Beatriz Souza"
            />

            <Label style={{ marginTop: 8 }}>Selecione o Serviço / Produto:</Label>
            <View style={{ gap: 6, marginVertical: 6 }}>
              {products.map((p) => {
                const isSelected = txSelectedProduct.id === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setTxSelectedProduct(p);
                      setTxAmount(String(p.defaultPrice));
                    }}
                    style={{
                      padding: 10,
                      borderRadius: radius.md,
                      backgroundColor: isSelected ? `${t.accent}20` : t.surfaceElevated,
                      borderWidth: 1,
                      borderColor: isSelected ? t.accent : t.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Body style={{ fontSize: 13, fontWeight: '700', color: isSelected ? t.accent : '#FFFFFF' } as any}>
                        {p.name}
                      </Body>
                      <Body style={{ color: t.accent, fontWeight: 'bold' } as any}>R$ {p.defaultPrice},00</Body>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <TextInputField
              label="Valor Cobrado (R$) *"
              value={txAmount}
              onChangeText={setTxAmount}
              keyboardType="numeric"
              placeholder="250"
            />

            <Label style={{ marginTop: 6 }}>Status do Pagamento:</Label>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <Chip label="Já Pago ✓" selected={txStatus === 'pago'} onPress={() => setTxStatus('pago')} />
              <Chip label="Pendente / A Vencer ⚠️" selected={txStatus === 'pendente'} onPress={() => setTxStatus('pendente')} />
            </View>

            <TextInputField
              label="Observação (Opcional)"
              value={txNotes}
              onChangeText={setTxNotes}
              placeholder="Ex: PIX recebido, pacote de 10 aulas, etc."
            />

            <View style={{ marginTop: 12 }}>
              <Button title="Salvar Recebimento 💰" onPress={handleCreateTransaction} />
            </View>
          </Card>
        </Screen>
      </Modal>

      {/* MODAL: EDITAR PREÇO DO PRODUTO */}
      <Modal visible={editingProduct !== null} transparent animationType="fade" onRequestClose={() => setEditingProduct(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title size={20}>Editar Preço do Serviço</Title>
              <Pressable onPress={() => setEditingProduct(null)}>
                <Text style={{ color: colors.textMuted, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
              </Pressable>
            </View>

            {editingProduct && (
              <View style={{ gap: 10, marginTop: 8 }}>
                <Body style={{ fontSize: 14, fontWeight: '700', color: t.accent } as any}>{editingProduct.name}</Body>
                <TextInputField
                  label="Preço Padrão (R$)"
                  value={editPriceInput}
                  onChangeText={setEditPriceInput}
                  keyboardType="numeric"
                />
                <TextInputField
                  label="Horas Estimadas / Mês"
                  value={editHoursInput}
                  onChangeText={setEditHoursInput}
                  keyboardType="numeric"
                />
                <Button title="Salvar Alterações" onPress={handleSaveProductEdit} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#121820',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
});
