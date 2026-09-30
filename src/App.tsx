/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, SavingBox } from './types.ts';
import {
  getCurrentMonthString,
  formatMonthYear,
  formatCurrency,
  getTodayString,
  getRealTodayString,
  compareTransactionsRecentFirst,
  getPreviousMonthString,
  getMonthNameInPortuguese,
} from './utils/formatters.ts';
import { subscribeTimeTravel, getNow, resetToRealTime } from './utils/timeTravel.ts';
import { Header } from './components/Header.tsx';
import { BalanceSummary } from './components/BalanceSummary.tsx';
import { TransactionForm } from './components/TransactionForm.tsx';
import { TransactionList } from './components/TransactionList.tsx';
import { MonthRolloverModal } from './components/MonthRolloverModal.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import {
  db,
  saveTransactionToCloud,
  updateTransactionInCloud,
  deleteTransactionFromCloud,
  saveSavingBoxToCloud,
  updateSavingBoxInCloud,
  deleteSavingBoxFromCloud,
  upsertUserProfile,
  batchClearUserTransactions,
  batchClearUserSavingBoxes,
  batchMigrateLocalDataToCloud,
  handleFirestoreError,
  OperationType,
} from './firebase.ts';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { CloudOff } from 'lucide-react';
import { addFinancialNotificationListener, RawFinancialNotification } from './services/notificationBridge.ts';
import { processAndSaveFinancialNotification } from './services/financialNotificationProcessor.ts';

const TX_STORAGE_KEY = 'min_finance_transactions_v2';
const INITIAL_BALANCE_KEY = 'min_finance_initial_balance_v2';
const BOXES_STORAGE_KEY = 'min_finance_saving_boxes_v1';
const MONTHLY_RENDA_KEY = 'min_finance_monthly_renda_v1';
const LAST_ACK_MONTH_KEY = 'min_finance_last_ack_month_v1';

export default function App() {
  // Saldo Inicial definido pelo usuário (inicia em 0)
  const [initialBalance, setInitialBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(INITIAL_BALANCE_KEY);
      if (saved !== null) {
        const val = parseFloat(saved);
        if (!isNaN(val)) return val;
      }
    } catch (e) {
      console.error('Error loading initial balance', e);
    }
    return 0;
  });

  // Lista de transações (inicia 100% zerada)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      localStorage.removeItem('min_finance_transactions_v1');
      const saved = localStorage.getItem(TX_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const currentMonth = getCurrentMonthString();
          return parsed.map((t: any) => {
            let item = t;
            if (!item.createdAt && item.id) {
              const match = item.id.match(/\d{10,}/);
              const ts = match ? parseInt(match[0], 10) : undefined;
              if (ts) item = { ...item, createdAt: ts };
            }
            // Contas previstas restantes de meses anteriores passam a ser consideradas pagas (saídas efetivas)
            if (item.status === 'pending' && item.date && item.date.slice(0, 7) < currentMonth) {
              item = { ...item, status: 'paid' };
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.error('Error loading transactions from localStorage', e);
    }
    return [];
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return getCurrentMonthString();
  });

  // Histórico de Renda por mês (para consulta no Histórico Geral e persistência)
  const [monthlyRenda, setMonthlyRenda] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(MONTHLY_RENDA_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading monthly renda', e);
    }
    return {};
  });

  // Último mês reconhecido / aberto pelo usuário
  const [lastAcknowledgedMonth, setLastAcknowledgedMonth] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_ACK_MONTH_KEY);
    } catch {
      return null;
    }
  });

  // Estados para o Modal de Virada de Mês (Rollover)
  const [showRolloverModal, setShowRolloverModal] = useState<boolean>(false);
  const [pendingRollover, setPendingRollover] = useState<{
    currentMonth: string;
    previousMonth: string;
    previousRemainingBalance: number;
    renda: number;
  } | null>(null);

  // Caixinhas para guardar dinheiro
  const [savingBoxes, setSavingBoxes] = useState<SavingBox[]>(() => {
    try {
      const saved = localStorage.getItem(BOXES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saving boxes from localStorage', e);
    }
    return [];
  });

  // Dark/Light theme state - padrão tema claro na primeira abertura
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('min_finance_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });

  // Synchronize 'dark' class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('min_finance_theme', theme);
    } catch (e) {
      console.error('Error saving theme', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (user) {
        upsertUserProfile(user.uid, { theme: next }).catch(console.error);
      }
      return next;
    });
  };

  // Sketch Mode state (Layout feito a mão com lápis sobre folha totalmente em branco)
  const [isSketchMode, setIsSketchMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('min_finance_sketch_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Synchronize 'sketch-mode' class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isSketchMode) {
      root.classList.add('sketch-mode');
    } else {
      root.classList.remove('sketch-mode');
    }
    try {
      localStorage.setItem('min_finance_sketch_mode', isSketchMode.toString());
    } catch (e) {
      console.error('Error saving sketch mode', e);
    }
  }, [isSketchMode]);

  const toggleSketchMode = () => {
    setIsSketchMode((prev) => {
      const next = !prev;
      if (user) {
        upsertUserProfile(user.uid, { isSketchMode: next }).catch(console.error);
      }
      return next;
    });
  };

  const [toast, setToast] = useState<string | null>(null);

  // Escuta alterações do modo desenvolvedor (Time Travel) para re-renderizar cálculos temporais
  const [timeTravelTick, setTimeTravelTick] = useState(0);
  useEffect(() => {
    return subscribeTimeTravel((state) => {
      setTimeTravelTick((t) => t + 1);
      if (state.isActive) {
        const d = getNow();
        const simMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(simMonth);
      } else {
        setSelectedMonth(getCurrentMonthString());
      }
    });
  }, []);

  // Monitora periodicamente se a passagem do tempo simulado/real cruzou uma virada de mês
  useEffect(() => {
    const timer = setInterval(() => {
      const currentMonth = getCurrentMonthString();
      if (lastAcknowledgedMonth && currentMonth > lastAcknowledgedMonth) {
        setTimeTravelTick((t) => t + 1);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [lastAcknowledgedMonth]);

  // Sync transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions to localStorage', e);
    }
  }, [transactions]);

  // Sync initial balance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(INITIAL_BALANCE_KEY, initialBalance.toString());
    } catch (e) {
      console.error('Error saving initial balance to localStorage', e);
    }
  }, [initialBalance]);

  // Sync saving boxes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOXES_STORAGE_KEY, JSON.stringify(savingBoxes));
    } catch (e) {
      console.error('Error saving saving boxes to localStorage', e);
    }
  }, [savingBoxes]);

  const { user, isOnline, setIsSyncing } = useAuth();
  const isMigratingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  // Interceptação de Notificações Financeiras Nativas (Android Capacitor Bridge)
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = addFinancialNotificationListener(async (raw: RawFinancialNotification) => {
      try {
        const result = await processAndSaveFinancialNotification(user.uid, raw, transactions);
        if (result.success && result.transaction) {
          setToast(
            `🔔 Transação detectada (${result.sourceApp}): ${result.transaction.description} (${formatCurrency(result.transaction.amount)})`
          );
          setTimeout(() => setToast(null), 5000);
        } else if (result.isDuplicate) {
          setToast(`⚠️ Transação já registrada anteriormente (${result.sourceApp}).`);
          setTimeout(() => setToast(null), 4000);
        }
      } catch (err) {
        console.error('Erro ao processar notificação bancária:', err);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, transactions]);

  // Real-time Cloud Firestore synchronization when user is authenticated
  useEffect(() => {
    if (!user) {
      initialLoadDoneRef.current = false;
      return;
    }

    setIsSyncing(true);

    // 1. User Profile Listener
    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(
      userDocRef,
      (docSnap) => {
        setIsSyncing(false);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.initialBalance === 'number') {
            setInitialBalance(data.initialBalance);
          }
          if (data.monthlyRenda && typeof data.monthlyRenda === 'object') {
            setMonthlyRenda(data.monthlyRenda);
          }
          if (data.theme && (data.theme === 'light' || data.theme === 'dark')) {
            setTheme(data.theme);
          }
          if (typeof data.isSketchMode === 'boolean') {
            setIsSketchMode(data.isSketchMode);
          }
          if (data.lastAcknowledgedMonth) {
            setLastAcknowledgedMonth(data.lastAcknowledgedMonth);
          }
        } else {
          // Initialize user document in Cloud Firestore
          upsertUserProfile(user.uid, {
            userId: user.uid,
            email: user.email || '',
            name: user.displayName || '',
            avatarId: user.photoURL || '',
            theme,
            isSketchMode,
            initialBalance,
            monthlyRenda,
            lastAcknowledgedMonth: lastAcknowledgedMonth || getCurrentMonthString(),
            createdAt: Date.now(),
          }).catch(console.error);
        }
      },
      (error) => {
        setIsSyncing(false);
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    );

    // 2. User Transactions Listener
    const txColRef = collection(db, 'users', user.uid, 'transactions');
    const unsubTx = onSnapshot(
      txColRef,
      (snapshot) => {
        setIsSyncing(false);
        const docs = snapshot.docs.map((d) => d.data() as Transaction);

        // Auto-migrate local transactions & boxes to Cloud Firestore if cloud collection is currently empty
        if (
          docs.length === 0 &&
          transactions.length > 0 &&
          !isMigratingRef.current &&
          !initialLoadDoneRef.current
        ) {
          isMigratingRef.current = true;
          batchMigrateLocalDataToCloud(
            user.uid,
            user.email || '',
            transactions,
            savingBoxes,
            {
              theme,
              isSketchMode,
              initialBalance,
              monthlyRenda,
              lastAcknowledgedMonth: lastAcknowledgedMonth || getCurrentMonthString(),
            }
          ).then(() => {
            isMigratingRef.current = false;
            showToast('Dados locais sincronizados no Cloud Firestore com sucesso!');
          });
          return;
        }

        initialLoadDoneRef.current = true;
        const sorted = docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setTransactions(sorted);
      },
      (error) => {
        setIsSyncing(false);
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/transactions`);
      }
    );

    // 3. User Saving Boxes Listener
    const boxColRef = collection(db, 'users', user.uid, 'savingBoxes');
    const unsubBox = onSnapshot(
      boxColRef,
      (snapshot) => {
        setIsSyncing(false);
        const boxes = snapshot.docs.map((d) => d.data() as SavingBox);
        setSavingBoxes(boxes);
      },
      (error) => {
        setIsSyncing(false);
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/savingBoxes`);
      }
    );

    return () => {
      unsubUser();
      unsubTx();
      unsubBox();
    };
  }, [user]);

  // Show temporary toast message
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Derive unique list of months present in transactions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(getCurrentMonthString());
    if (selectedMonth && selectedMonth !== 'all') {
      set.add(selectedMonth);
    }
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions, selectedMonth]);

  // Transactions filtered for current selected month (most recent always at the top)
  const monthTransactions = useMemo(() => {
    const list =
      selectedMonth === 'all'
        ? [...transactions]
        : transactions.filter((t) => t.date && t.date.startsWith(selectedMonth));

    return list.sort(compareTransactionsRecentFirst);
  }, [transactions, selectedMonth]);

  // Renda efetiva do mês selecionado
  const effectiveInitialBalance = useMemo(() => {
    if (selectedMonth === 'all') return initialBalance;
    return monthlyRenda[selectedMonth] ?? initialBalance;
  }, [selectedMonth, monthlyRenda, initialBalance]);

  // Monitora virada de mês (às 00h00 do 1º dia de cada mês ou ao simular datas no Time Travel)
  useEffect(() => {
    const currentMonth = getCurrentMonthString();

    // Se ainda não há lastAcknowledgedMonth salvo:
    if (!lastAcknowledgedMonth) {
      const earlierMonths = transactions
        .map((t) => (t.date ? t.date.slice(0, 7) : ''))
        .filter((m) => m && m < currentMonth)
        .sort();

      if (earlierMonths.length > 0) {
        // Usuário já possui dados de meses anteriores: aciona fechamento para o mês mais recente anterior
        const prevMonth = earlierMonths[earlierMonths.length - 1];
        triggerRollover(currentMonth, prevMonth);
      } else {
        // Primeira utilização do aplicativo no mês atual
        setLastAcknowledgedMonth(currentMonth);
        try {
          localStorage.setItem(LAST_ACK_MONTH_KEY, currentMonth);
        } catch {}
      }
      return;
    }

    // Se o mês atual do relógio/simulador for mais recente que o último mês reconhecido
    if (currentMonth > lastAcknowledgedMonth) {
      const prevMonth = getPreviousMonthString(currentMonth);
      triggerRollover(currentMonth, prevMonth);
    }
  }, [transactions, lastAcknowledgedMonth, timeTravelTick]);

  // Sempre que o mês virar, todas as contas previstas restantes de meses anteriores
  // são automaticamente marcadas como pagas e transferidas para a categoria de "Saídas"
  useEffect(() => {
    const currentMonth = getCurrentMonthString();
    setTransactions((prev) => {
      let hasChanges = false;
      const updated = prev.map((t) => {
        if (t.status === 'pending' && t.date && t.date.slice(0, 7) < currentMonth) {
          hasChanges = true;
          return { ...t, status: 'paid' as const };
        }
        return t;
      });
      return hasChanges ? updated : prev;
    });
  }, [lastAcknowledgedMonth, timeTravelTick]);

  const triggerRollover = (currMonth: string, prevMonth: string) => {
    const prevMonthTxs = transactions.filter((t) => t.date && t.date.startsWith(prevMonth));
    const prevIncome = prevMonthTxs
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const prevPaidExpense = prevMonthTxs
      .filter((t) => t.type === 'expense' && t.status !== 'pending')
      .reduce((s, t) => s + t.amount, 0);
    const prevPlannedExpense = prevMonthTxs
      .filter((t) => t.type === 'expense' && t.status === 'pending')
      .reduce((s, t) => s + t.amount, 0);

    const prevRenda = monthlyRenda[prevMonth] ?? initialBalance;
    const prevRemaining = prevRenda + prevIncome - (prevPaidExpense + prevPlannedExpense);

    setPendingRollover({
      currentMonth: currMonth,
      previousMonth: prevMonth,
      previousRemainingBalance: prevRemaining,
      renda: prevRenda,
    });
    setShowRolloverModal(true);
  };

  const handleConfirmRollover = () => {
    if (!pendingRollover) return;

    const { currentMonth, previousMonth, previousRemainingBalance, renda } = pendingRollover;

    // Se sobrou algum valor positivo do mês anterior, registra a entrada "Saldo poupado de [mês] de [ano]"
    if (previousRemainingBalance > 0) {
      const alreadyHasPoupado = transactions.some(
        (t) =>
          t.date &&
          t.date.startsWith(currentMonth) &&
          t.description.toLowerCase().startsWith('saldo poupado')
      );

      if (!alreadyHasPoupado) {
        const [prevYear, prevMonthNumStr] = previousMonth.split('-');
        const prevMonthNum = parseInt(prevMonthNumStr, 10);
        const prevMonthName = getMonthNameInPortuguese(prevMonthNum);
        const desc = `Saldo poupado de ${prevMonthName} de ${prevYear}`;

        const poupadoTx: Transaction = {
          id: `tx-poupado-${currentMonth}-${Date.now()}`,
          description: desc,
          amount: previousRemainingBalance,
          type: 'income',
          category: 'outros',
          date: `${currentMonth}-01`,
          status: 'paid',
          tag: 'Saldo Poupado',
          createdAt: new Date(`${currentMonth}-01T00:00:00`).getTime(),
        };

        // Marca todas as contas previstas restantes do mês anterior como pagas e insere a transação de saldo poupado
        setTransactions((prev) => {
          const updated = prev.map((t) => {
            if (t.status === 'pending' && t.date && t.date.slice(0, 7) < currentMonth) {
              return { ...t, status: 'paid' as const };
            }
            return t;
          });
          return [poupadoTx, ...updated];
        });
      } else {
        // Marca todas as contas previstas restantes do mês anterior como pagas
        setTransactions((prev) =>
          prev.map((t) => {
            if (t.status === 'pending' && t.date && t.date.slice(0, 7) < currentMonth) {
              return { ...t, status: 'paid' as const };
            }
            return t;
          })
        );
      }
    } else {
      // Marca todas as contas previstas restantes do mês anterior como pagas
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.status === 'pending' && t.date && t.date.slice(0, 7) < currentMonth) {
            return { ...t, status: 'paid' as const };
          }
          return t;
        })
      );
    }

    // Mantém a mesma renda para o novo mês
    setMonthlyRenda((prev) => {
      const next = { ...prev, [currentMonth]: renda };
      try {
        localStorage.setItem(MONTHLY_RENDA_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    setInitialBalance(renda);

    // Atualiza o mês ativo e salva o novo mês reconhecido
    setSelectedMonth(currentMonth);
    setLastAcknowledgedMonth(currentMonth);
    try {
      localStorage.setItem(LAST_ACK_MONTH_KEY, currentMonth);
    } catch {}

    if (user) {
      upsertUserProfile(user.uid, {
        initialBalance: renda,
        monthlyRenda: { ...monthlyRenda, [currentMonth]: renda },
        lastAcknowledgedMonth: currentMonth,
      }).catch(console.error);
    }

    setShowRolloverModal(false);
    setPendingRollover(null);

    const formattedTitle = formatMonthYear(currentMonth);
    showToast(`${formattedTitle} iniciado com sucesso!`);
  };

  // Summary figures
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const paidExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense' && t.status !== 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const plannedExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const activeTime = getNow().getTime();
    const tx: Transaction = {
      ...newTx,
      id: `tx-${activeTime}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: activeTime,
    };

    setTransactions((prev) => [tx, ...prev]);

    if (user) {
      saveTransactionToCloud(user.uid, tx).catch(console.error);
    }

    // If added transaction is in a different month, switch to it
    const txMonth = tx.date.slice(0, 7);
    if (selectedMonth !== 'all' && selectedMonth !== txMonth) {
      setSelectedMonth(txMonth);
    }

    if (tx.status === 'pending') {
      showToast('Gasto previsto registrado e descontado do saldo!');
    } else {
      showToast('Movimentação adicionada com sucesso!');
    }
  };

  const handleMarkAsPaid = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'paid' as const } : t))
    );
    if (user) {
      updateTransactionInCloud(user.uid, id, { status: 'paid' }).catch(console.error);
    }
    showToast('Conta marcada como paga!');
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (
      tx &&
      (tx.tag === 'Saldo Poupado' ||
        tx.description.toLowerCase().startsWith('saldo poupado') ||
        tx.id.startsWith('tx-poupado'))
    ) {
      showToast('O saldo poupado não pode ser excluído.');
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (user) {
      deleteTransactionFromCloud(user.uid, id).catch(console.error);
    }
    showToast('Movimentação removida.');
  };

  const handleUpdateInitialBalance = (val: number, targetMonth?: string) => {
    const m = targetMonth || selectedMonth;
    setInitialBalance(val);
    let nextRenda = { ...monthlyRenda };
    if (m && m !== 'all') {
      nextRenda = { ...monthlyRenda, [m]: val };
      setMonthlyRenda((prev) => {
        const next = { ...prev, [m]: val };
        try {
          localStorage.setItem(MONTHLY_RENDA_KEY, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    }
    if (user) {
      upsertUserProfile(user.uid, {
        initialBalance: val,
        monthlyRenda: nextRenda,
      }).catch(console.error);
    }
    showToast('Renda atualizada!');
  };

  const handleClearMonth = () => {
    if (selectedMonth === 'all') {
      setTransactions([]);
      setInitialBalance(0);
      setSavingBoxes([]);
      setMonthlyRenda({});
      localStorage.removeItem(TX_STORAGE_KEY);
      localStorage.removeItem(INITIAL_BALANCE_KEY);
      localStorage.removeItem(BOXES_STORAGE_KEY);
      localStorage.removeItem(MONTHLY_RENDA_KEY);

      if (user) {
        batchClearUserTransactions(user.uid).catch(console.error);
        batchClearUserSavingBoxes(user.uid).catch(console.error);
        upsertUserProfile(user.uid, { initialBalance: 0, monthlyRenda: {} }).catch(console.error);
      }
      showToast('Histórico e dados zerados!');
    } else {
      setTransactions((prev) =>
        prev.filter((t) => !t.date || !t.date.startsWith(selectedMonth))
      );
      setSavingBoxes([]);
      localStorage.removeItem(BOXES_STORAGE_KEY);

      if (user) {
        batchClearUserTransactions(user.uid, selectedMonth).catch(console.error);
        batchClearUserSavingBoxes(user.uid).catch(console.error);
      }
      showToast('Histórico deste mês, renda e caixinhas zerados!');
    }
  };

  // Botão Nuclear: Limpeza integral de dados e reinicialização completa (estado de fábrica)
  const handleNuclearReset = () => {
    // 1. Reset de todos os estados do React
    setTransactions([]);
    setInitialBalance(0);
    setMonthlyRenda({});
    setSavingBoxes([]);
    setLastAcknowledgedMonth(null);
    setShowRolloverModal(false);
    setPendingRollover(null);
    setIsSketchMode(false);
    document.documentElement.classList.remove('sketch-mode');

    // Reset de tema para o padrão de fábrica: Tema Claro
    setTheme('light');
    document.documentElement.classList.remove('dark');

    // 2. Desativa simulações e restaura relógio real
    resetToRealTime();

    // 3. Limpeza total de todos os dados do localStorage
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }

    // 4. Limpeza no Cloud Firestore se autenticado
    if (user) {
      batchClearUserTransactions(user.uid).catch(console.error);
      batchClearUserSavingBoxes(user.uid).catch(console.error);
      upsertUserProfile(user.uid, {
        initialBalance: 0,
        monthlyRenda: {},
        lastAcknowledgedMonth: '',
        theme: 'light',
        isSketchMode: false,
      }).catch(console.error);
    }

    // 5. Reposiciona o mês selecionado para o mês real corrente
    const realMonth = getCurrentMonthString();
    setSelectedMonth(realMonth);

    // 6. Notificação de confirmação ao usuário
    showToast('Aplicativo reiniciado com sucesso para o estado original de fábrica!');
  };

  // Caixinhas (Guardar Dinheiro) handlers
  const handleCreateBox = (
    boxData: Omit<SavingBox, 'id' | 'createdAt' | 'currentAmount'>,
    initialDeposit: number
  ) => {
    const activeTime = getNow().getTime();
    const newBoxId = `box-${activeTime}-${Math.random().toString(36).substr(2, 4)}`;
    const newBox: SavingBox = {
      ...boxData,
      id: newBoxId,
      currentAmount: initialDeposit > 0 ? initialDeposit : 0,
      createdAt: activeTime,
    };

    setSavingBoxes((prev) => [newBox, ...prev]);

    if (user) {
      saveSavingBoxToCloud(user.uid, newBox).catch(console.error);
    }

    if (initialDeposit > 0) {
      const todayIso = getTodayString();
      const tx: Transaction = {
        id: `tx-box-${activeTime}-${Math.random().toString(36).substr(2, 4)}`,
        description: `Guardado: ${boxData.name}`,
        amount: initialDeposit,
        type: 'expense',
        category: 'investimentos',
        date: todayIso,
        status: 'paid',
        tag: 'Guardado',
        isSavedBox: true,
        boxId: newBoxId,
        createdAt: activeTime,
      };
      setTransactions((prev) => [tx, ...prev]);

      if (user) {
        saveTransactionToCloud(user.uid, tx).catch(console.error);
      }

      const txMonth = tx.date.slice(0, 7);
      if (selectedMonth !== 'all' && selectedMonth !== txMonth) {
        setSelectedMonth(txMonth);
      }
      showToast(`Caixinha "${boxData.name}" criada e ${formatCurrency(initialDeposit)} guardado!`);
    } else {
      showToast(`Caixinha "${boxData.name}" criada com sucesso!`);
    }
  };

  const handleDepositToBox = (boxId: string, amount: number) => {
    const targetBox = savingBoxes.find((b) => b.id === boxId);
    if (!targetBox) return;

    const newAmount = (targetBox.currentAmount || 0) + amount;
    setSavingBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, currentAmount: newAmount } : b))
    );

    const activeTime = getNow().getTime();
    const todayIso = getTodayString();
    const tx: Transaction = {
      id: `tx-box-${activeTime}-${Math.random().toString(36).substr(2, 4)}`,
      description: `Guardado: ${targetBox.name}`,
      amount: amount,
      type: 'expense',
      category: 'investimentos',
      date: todayIso,
      status: 'paid',
      tag: 'Guardado',
      isSavedBox: true,
      boxId: boxId,
      createdAt: activeTime,
    };
    setTransactions((prev) => [tx, ...prev]);

    if (user) {
      updateSavingBoxInCloud(user.uid, boxId, { currentAmount: newAmount }).catch(console.error);
      saveTransactionToCloud(user.uid, tx).catch(console.error);
    }

    const txMonth = tx.date.slice(0, 7);
    if (selectedMonth !== 'all' && selectedMonth !== txMonth) {
      setSelectedMonth(txMonth);
    }
    showToast(`${formatCurrency(amount)} guardado com sucesso na caixinha "${targetBox.name}"!`);
  };

  const handleUpdateBox = (
    boxId: string,
    updatedData: Partial<Omit<SavingBox, 'id' | 'createdAt' | 'currentAmount'>>
  ) => {
    setSavingBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, ...updatedData } : b))
    );
    if (updatedData.name) {
      const newName = updatedData.name;
      setTransactions((prev) =>
        prev.map((t) =>
          t.boxId === boxId ? { ...t, description: `Guardado: ${newName}` } : t
        )
      );
    }
    if (user) {
      updateSavingBoxInCloud(user.uid, boxId, updatedData).catch(console.error);
    }
    showToast('Caixinha atualizada com sucesso!');
  };

  const handleFinalizeBox = (boxId: string) => {
    const targetBox = savingBoxes.find((b) => b.id === boxId);
    if (!targetBox || targetBox.isFinalized) return;

    const activeTime = getNow().getTime();
    setSavingBoxes((prev) =>
      prev.map((b) =>
        b.id === boxId
          ? {
              ...b,
              isFinalized: true,
              finalizedAt: activeTime,
            }
          : b
      )
    );

    if (user) {
      updateSavingBoxInCloud(user.uid, boxId, {
        isFinalized: true,
        finalizedAt: activeTime,
      }).catch(console.error);
    }

    showToast(`Caixinha "${targetBox.name}" finalizada e arquivada com sucesso!`);
  };

  const handleDeleteBox = (boxId: string) => {
    const targetBox = savingBoxes.find((b) => b.id === boxId);
    if (!targetBox || targetBox.isFinalized) return;

    const boxName = targetBox.name;
    const boxAmount = targetBox.currentAmount || 0;

    // 1. Remove a caixinha do estado de caixinhas salvas
    setSavingBoxes((prev) => prev.filter((b) => b.id !== boxId));
    if (user) {
      deleteSavingBoxFromCloud(user.uid, boxId).catch(console.error);
    }

    // 2. Remove automaticamente do histórico de movimentações todas as transações vinculadas a esta caixinha
    let removedTotal = 0;
    const removedTxIds: string[] = [];
    setTransactions((prev) => {
      const remaining: Transaction[] = [];
      for (const tx of prev) {
        const isBoxIdMatch = tx.boxId === boxId;
        const isNameMatch =
          Boolean(tx.isSavedBox) &&
          (tx.description.toLowerCase() === `guardado: ${boxName.toLowerCase()}` ||
            tx.description.toLowerCase().includes(boxName.toLowerCase()));

        if (isBoxIdMatch || isNameMatch) {
          removedTotal += tx.amount;
          removedTxIds.push(tx.id);
        } else {
          remaining.push(tx);
        }
      }
      return remaining;
    });

    if (user && removedTxIds.length > 0) {
      removedTxIds.forEach((id) => deleteTransactionFromCloud(user.uid, id).catch(console.error));
    }

    // 3. Caso o total de transações encontradas seja menor que o saldo acumulado na caixinha
    if (boxAmount > removedTotal) {
      const diff = boxAmount - removedTotal;
      setInitialBalance((prev) => {
        const next = prev + diff;
        if (user) {
          upsertUserProfile(user.uid, { initialBalance: next }).catch(console.error);
        }
        return next;
      });
    }

    showToast(
      boxAmount > 0
        ? `Caixinha "${boxName}" excluída! ${formatCurrency(boxAmount)} retornou ao saldo restante.`
        : `Caixinha "${boxName}" excluída!`
    );
  };

  return (
    <div
      className={`min-h-screen pb-16 pt-6 sm:pt-10 px-4 sm:px-6 transition-colors duration-200 ${
        isSketchMode
          ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100'
          : 'bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100'
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Header
          transactions={transactions}
          monthTransactionsCount={monthTransactions.length}
          initialBalance={initialBalance}
          selectedMonth={selectedMonth}
          onClearMonth={handleClearMonth}
          onMonthChange={setSelectedMonth}
          effectiveInitialBalance={effectiveInitialBalance}
          totalIncome={totalIncome}
          paidExpense={paidExpense}
          plannedExpense={plannedExpense}
          theme={theme}
          onToggleTheme={toggleTheme}
          boxes={savingBoxes}
          onCreateBox={handleCreateBox}
          onUpdateBox={handleUpdateBox}
          onFinalizeBox={handleFinalizeBox}
          onDepositToBox={handleDepositToBox}
          onDeleteBox={handleDeleteBox}
          isSketchMode={isSketchMode}
          onToggleSketchMode={toggleSketchMode}
          monthlyRenda={monthlyRenda}
          onUpdateInitialBalance={handleUpdateInitialBalance}
          onNuclearReset={handleNuclearReset}
        />

        {/* Offline Mode Indicator Banner */}
        {!isOnline && (
          <div
            id="banner-offline-mode"
            className="mb-4 py-2 px-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-2xs animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <CloudOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Modo Offline Ativo:</strong> Suas alterações estão salvas no cache seguro local e sincronizarão com o Cloud Firestore assim que a conexão retornar.
              </span>
            </div>
          </div>
        )}

        {/* Balance & Period Card - Gastos previstos já são descontados do Saldo Atual */}
        <BalanceSummary
          initialBalance={effectiveInitialBalance}
          onUpdateInitialBalance={handleUpdateInitialBalance}
          totalIncome={totalIncome}
          paidExpense={paidExpense}
          plannedExpense={plannedExpense}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableMonths={availableMonths}
        />

        {/* Quick Add Form (Supports normal transactions and Gastos Previstos) */}
        <TransactionForm onAddTransaction={handleAddTransaction} />

        {/* Transaction History & Filters */}
        <TransactionList
          transactions={monthTransactions}
          savingBoxes={savingBoxes}
          onDeleteTransaction={handleDeleteTransaction}
          onMarkAsPaid={handleMarkAsPaid}
        />

        {/* Modal de Virada de Mês Automática (Primeiro dia do mês às 00h00) */}
        {showRolloverModal && pendingRollover && (
          <MonthRolloverModal
            isOpen={showRolloverModal}
            currentMonth={pendingRollover.currentMonth}
            previousMonth={pendingRollover.previousMonth}
            previousRemainingBalance={pendingRollover.previousRemainingBalance}
            renda={pendingRollover.renda}
            onConfirm={handleConfirmRollover}
          />
        )}


        {/* Feedback Toast */}
        {toast && (
          <div
            id="toast-notification"
            role="status"
            className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white text-xs font-medium py-2.5 px-4 rounded-xl shadow-lg border border-zinc-800 animate-fade-in flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
