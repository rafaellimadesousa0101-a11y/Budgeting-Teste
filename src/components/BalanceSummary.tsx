import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Edit2,
  Check,
  X,
  Coins,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatMonthYear, parseCurrencyInput } from '../utils/formatters.ts';

interface BalanceSummaryProps {
  initialBalance: number;
  onUpdateInitialBalance: (val: number) => void;
  totalIncome: number;
  paidExpense: number;
  plannedExpense: number;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  initialBalance,
  onUpdateInitialBalance,
  totalIncome,
  paidExpense,
  plannedExpense,
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  const [isEditingInitial, setIsEditingInitial] = useState(false);
  const [initialInput, setInitialInput] = useState(initialBalance.toString());

  // Redefine edição de renda ao navegar entre meses
  useEffect(() => {
    setIsEditingInitial(false);
    setInitialInput(initialBalance.toString());
  }, [selectedMonth, initialBalance]);

  // Total de saídas (efetivadas + previstas)
  const totalAllExpense = paidExpense + plannedExpense;

  // Saldo Atual com gastos previstos JÁ DESCONTADOS
  const balanceWithPlanned = initialBalance + totalIncome - totalAllExpense;

  const handleSaveInitial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = parseCurrencyInput(initialInput);
    if (!isNaN(clean)) {
      onUpdateInitialBalance(clean);
    }
    setIsEditingInitial(false);
  };

  const handleOpenEdit = () => {
    setInitialInput(initialBalance === 0 ? '' : initialBalance.toString());
    setIsEditingInitial(true);
  };

  return (
    <div
      id="balance-summary-card"
      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6 transition-colors"
    >
      {/* Initial Balance Bar */}
      <div className="flex items-center justify-start pb-5 mb-5 border-b border-zinc-100 dark:border-zinc-800/80">
        {/* Saldo Inicial Config */}
        <div className="flex items-center gap-2">
          {!isEditingInitial ? (
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/80 px-2.5 py-1 rounded-lg">
              <Coins className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Renda:</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {formatCurrency(initialBalance)}
              </span>
              <button
                id="btn-edit-initial-balance"
                type="button"
                onClick={handleOpenEdit}
                title="Alterar renda"
                className="ml-1 p-0.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveInitial} className="flex items-center gap-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Renda:</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium">
                  R$
                </span>
                <input
                  id="input-initial-balance"
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0,00"
                  value={initialInput}
                  onChange={(e) => setInitialInput(e.target.value.replace(/[^0-9.,-]/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsEditingInitial(false);
                    }
                  }}
                  className="w-24 pl-6 pr-2 py-0.5 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                />
              </div>
              <button
                id="btn-save-initial-balance"
                type="submit"
                className="p-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded transition-colors cursor-pointer"
                title="Salvar renda"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                id="btn-cancel-initial-balance"
                type="button"
                onClick={() => setIsEditingInitial(false)}
                className="p-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="Cancelar"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">
            <Wallet className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <span>Saldo Restante</span>
          </div>

          <div
            id="display-net-balance"
            className={`text-3xl sm:text-4xl font-bold tracking-tight ${
              balanceWithPlanned >= 0
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(balanceWithPlanned)}
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Calculado com base em suas movimentações
          </p>
        </div>

        {/* 3 Metric Cards: Entradas (Azul-ardósia translúcido), Pagos (Coral translúcido), Gastos Previstos (Ocre translúcido) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Entradas (Sincronizado com Azul-ardósia #3b6790 translúcido) */}
          <div
            id="card-total-income"
            className="bg-[#3b6790]/[0.07] dark:bg-[#3b6790]/15 border border-[#3b6790]/20 dark:border-[#3b6790]/30 rounded-xl p-3.5 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#2d5275] dark:text-[#88b0d8]">Entradas</span>
              <div className="w-5 h-5 rounded-full bg-[#3b6790]/15 dark:bg-[#3b6790]/30 flex items-center justify-center text-[#2d5275] dark:text-[#88b0d8]">
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalIncome)}
            </div>
          </div>

          {/* Despesas / Saídas + Caixinhas (Sincronizado com Tom Coral #e06a55 translúcido) */}
          <div
            id="card-paid-expense"
            className="bg-[#e06a55]/[0.07] dark:bg-[#e06a55]/15 border border-[#e06a55]/20 dark:border-[#e06a55]/30 rounded-xl p-3.5 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#b54a37] dark:text-[#f09a89]">Saídas + Caixinhas</span>
              <div className="w-5 h-5 rounded-full bg-[#e06a55]/15 dark:bg-[#e06a55]/30 flex items-center justify-center text-[#b54a37] dark:text-[#f09a89]">
                <ArrowDownLeft className="w-3 h-3" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(paidExpense)}
            </div>
          </div>

          {/* Gastos Previstos (Sincronizado com Tom Ocre / Amarelo-queimado #d99b26 translúcido) */}
          <div
            id="card-planned-expense"
            className={`border rounded-xl p-3.5 transition-colors ${
              plannedExpense > 0
                ? 'bg-[#d99b26]/[0.08] dark:bg-[#d99b26]/15 border-[#d99b26]/25 dark:border-[#d99b26]/35'
                : 'bg-zinc-500/[0.04] dark:bg-zinc-500/10 border-zinc-200/70 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-xs font-medium ${
                  plannedExpense > 0 ? 'text-[#a17015] dark:text-[#eec570]' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                A Pagar
              </span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  plannedExpense > 0
                    ? 'bg-[#d99b26]/15 dark:bg-[#d99b26]/30 text-[#a17015] dark:text-[#eec570]'
                    : 'bg-zinc-200/60 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <Clock className="w-3 h-3" />
              </div>
            </div>
            <div
              className={`text-base sm:text-lg font-bold ${
                plannedExpense > 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {formatCurrency(plannedExpense)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
