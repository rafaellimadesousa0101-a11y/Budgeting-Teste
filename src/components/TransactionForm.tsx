import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, Check, Clock, Calendar } from 'lucide-react';
import { CategoryId, Transaction, TransactionType } from '../types.ts';
import { CATEGORIES } from '../data/categories.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { parseCurrencyInput, isoToBrDate, brDateToIso, maskBrDate } from '../utils/formatters.ts';
import { getNow, useTimeTravel } from '../utils/timeTravel.ts';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

const getMonthBounds = (now: Date, isPlanned: boolean) => {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const todayDay = now.getDate();

  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const lastDayNum = new Date(year, month + 1, 0).getDate();

  const firstDayIso = `${currentMonthStr}-01`;
  const lastDayIso = `${currentMonthStr}-${String(lastDayNum).padStart(2, '0')}`;
  const todayIso = `${currentMonthStr}-${String(todayDay).padStart(2, '0')}`;

  if (isPlanned) {
    const tomorrowDay = todayDay + 1;
    const canHavePlanned = tomorrowDay <= lastDayNum;
    const tomorrowIso = canHavePlanned
      ? `${currentMonthStr}-${String(tomorrowDay).padStart(2, '0')}`
      : `${currentMonthStr}-${String(lastDayNum).padStart(2, '0')}`;

    return {
      minIso: tomorrowIso,
      maxIso: lastDayIso,
      canHavePlanned,
      currentMonthStr,
    };
  } else {
    return {
      minIso: firstDayIso,
      maxIso: todayIso,
      canHavePlanned: true,
      currentMonthStr,
    };
  }
};

const validateDateString = (
  inputVal: string,
  isPlanned: boolean,
  currentType: TransactionType = 'expense',
  refDate: Date = getNow()
): { isValid: boolean; iso: string | null; error: string | null } => {
  const clean = inputVal.replace(/\D/g, '');
  if (clean.length !== 8) {
    return { isValid: false, iso: null, error: 'Data incompleta ou inválida.' };
  }
  const iso = brDateToIso(inputVal);
  if (!iso) {
    return { isValid: false, iso: null, error: 'Data inválida.' };
  }

  const bounds = getMonthBounds(refDate, isPlanned);

  // Cenário 1: Seleção de data fora do mês vigente
  if (iso.slice(0, 7) !== bounds.currentMonthStr) {
    return {
      isValid: false,
      iso,
      error: 'A data deve pertencer exclusivamente ao mês vigente.',
    };
  }

  // Cenário 2: Registro de gasto previsto (apenas datas futuras do mês vigente)
  if (isPlanned) {
    if (!bounds.canHavePlanned) {
      return {
        isValid: false,
        iso,
        error: 'Não há dias futuros disponíveis no mês vigente para agendar um gasto previsto.',
      };
    }
    if (iso < bounds.minIso) {
      return {
        isValid: false,
        iso,
        error: 'Gastos previstos devem ser agendados a partir do dia seguinte ao atual.',
      };
    }
    if (iso > bounds.maxIso) {
      return {
        isValid: false,
        iso,
        error: 'A data deve pertencer exclusivamente ao mês vigente.',
      };
    }
  } else {
    // Cenário 3: Lançamento de despesa comum (ou entrada) - não pode ser no futuro
    if (iso > bounds.maxIso) {
      const msg =
        currentType === 'income'
          ? 'Entradas não podem ser registradas com data futura.'
          : 'Despesas comuns não podem ser registradas com data futura.';
      return {
        isValid: false,
        iso,
        error: msg,
      };
    }
    if (iso < bounds.minIso) {
      return {
        isValid: false,
        iso,
        error: 'A data deve pertencer exclusivamente ao mês vigente.',
      };
    }
  }

  return { isValid: true, iso, error: null };
};

const isDateErrorMessage = (err: string | null): boolean => {
  if (!err) return false;
  return (
    err === 'Data inválida.' ||
    err === 'Data incompleta ou inválida.' ||
    err === 'Por favor, informe a data da movimentação.' ||
    err.includes('mês vigente') ||
    err.includes('data futura') ||
    err.includes('Gastos previstos')
  );
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [isPending, setIsPending] = useState(false); // Gasto previsto
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [date, setDate] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { simulatedDate } = useTimeTravel();
  const datePickerRef = useRef<HTMLInputElement>(null);

  const isPlannedExpense = type === 'expense' && isPending;
  const currentBounds = useMemo(
    () => getMonthBounds(simulatedDate, isPlannedExpense),
    [simulatedDate, isPlannedExpense]
  );

  // Revalidação reativa em tempo real com as funções do Modo Desenvolvedor (Time Travel)
  useEffect(() => {
    const clean = dateInput.replace(/\D/g, '');
    if (clean.length === 8) {
      const res = validateDateString(dateInput, isPlannedExpense, type, simulatedDate);
      if (!res.isValid) {
        setError(res.error || 'Data inválida.');
        setDate('');
      } else {
        if (isDateErrorMessage(error)) setError(null);
        setDate(res.iso || '');
      }
    }
  }, [simulatedDate, isPlannedExpense, type]);

  // Available categories based on selected type
  const availableCategories = CATEGORIES.filter(
    (c) => c.type === 'both' || c.type === type
  );

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(null);
    if (newType === 'income') {
      setIsPending(false);
    }
    const clean = dateInput.replace(/\D/g, '');
    if (clean.length === 8) {
      const res = validateDateString(dateInput, newType === 'expense' && isPending, newType, simulatedDate);
      if (!res.isValid) {
        setError(res.error || 'Data inválida.');
        setDate('');
      } else {
        if (isDateErrorMessage(error)) setError(null);
        setDate(res.iso || '');
      }
    }
  };

  const handleTogglePending = (nextState?: boolean) => {
    const nextPending = typeof nextState === 'boolean' ? nextState : !isPending;
    setIsPending(nextPending);
    const clean = dateInput.replace(/\D/g, '');
    if (clean.length === 8) {
      const res = validateDateString(dateInput, type === 'expense' && nextPending, type, simulatedDate);
      if (!res.isValid) {
        setError(res.error || 'Data inválida.');
        setDate('');
      } else {
        if (isDateErrorMessage(error)) setError(null);
        setDate(res.iso || '');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanAmount = parseCurrencyInput(amountStr);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      setError('Por favor, adicione uma breve descrição.');
      return;
    }

    if (!dateInput.trim()) {
      setError('Por favor, informe a data da movimentação.');
      return;
    }

    const res = validateDateString(dateInput, isPlannedExpense, type, simulatedDate);
    if (!res.isValid || !res.iso) {
      setError(res.error || 'Data inválida.');
      return;
    }

    if (!category) {
      setError('Por favor, selecione uma categoria.');
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: cleanAmount,
      type,
      category,
      date: res.iso,
      status: isPlannedExpense ? 'pending' : 'paid',
    });

    // Reset form
    setDescription('');
    setAmountStr('');
    setDate('');
    setDateInput('');
    setCategory(null);
    setIsPending(false);
    setError(null);
    setIsOpen(false);
  };

  return (
    <div
      id="transaction-form-container"
      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors"
    >
      {!isOpen ? (
        <button
          id="btn-open-new-transaction"
          type="button"
          onClick={() => {
            setDescription('');
            setAmountStr('');
            setType('expense');
            setCategory(null);
            setDate('');
            setDateInput('');
            setIsPending(false);
            setError(null);
            setIsOpen(true);
          }}
          className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Movimentação</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} id="form-new-transaction" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Registrar movimentação
            </h3>
            <button
              id="btn-cancel-transaction"
              type="button"
              onClick={() => {
                setDescription('');
                setAmountStr('');
                setType('expense');
                setCategory(null);
                setDate('');
                setDateInput('');
                setIsPending(false);
                setError(null);
                setIsOpen(false);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {/* Type Toggle: Despesa vs Entradas */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 dark:bg-zinc-800 rounded-xl">
            <button
              id="btn-type-expense"
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-zinc-900 text-rose-700 dark:text-rose-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Despesa</span>
            </button>

            <button
              id="btn-type-income"
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Entradas</span>
            </button>
          </div>

          {/* If Expense: Option for Gasto Previsto */}
          {type === 'expense' && (
            <div
              id="planned-expense-toggle-card"
              role="button"
              tabIndex={0}
              onClick={() => handleTogglePending()}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleTogglePending();
                }
              }}
              className={`rounded-xl p-3 transition-all cursor-pointer border flex items-center justify-between gap-3 select-none ${
                isPending
                  ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-900/60 shadow-xs'
                  : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/70 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    isPending
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-semibold ${
                        isPending ? 'text-amber-950 dark:text-amber-200' : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      Gasto Previsto (A pagar)
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isPending
                          ? 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200'
                          : 'bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      Desconta do saldo
                    </span>
                  </div>
                </div>
              </div>

              {/* Modern Switch Toggle */}
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  isPending ? 'bg-amber-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    isPending ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </div>

              <input
                type="checkbox"
                id="input-is-pending"
                checked={isPending}
                onChange={(e) => handleTogglePending(e.target.checked)}
                className="sr-only"
                aria-label="Gasto Previsto (A pagar)"
              />
            </div>
          )}

          {/* Amount and Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label htmlFor="input-amount" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-sm font-medium">
                  R$
                </span>
                <input
                  id="input-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full pl-9 pr-3 py-2 text-sm font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:font-['Roboto'] placeholder:text-xs placeholder:font-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-400/10 focus:border-zinc-400 dark:focus:border-zinc-600"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="input-description" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Descrição
              </label>
              <input
                id="input-description"
                type="text"
                placeholder={
                  isPending
                    ? 'Ex: Fatura Cartão, Aluguel, Internet...'
                    : type === 'expense'
                    ? 'Ex: Alimentação, Farmácia...'
                    : 'Ex: Motoboy, Motorista de Aplicativo...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:font-['Roboto'] placeholder:text-xs placeholder:font-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-400/10 focus:border-zinc-400 dark:focus:border-zinc-600"
                required
              />
            </div>
          </div>

          {/* Date and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 relative">
              <label htmlFor="input-date" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                {isPending ? 'Data de Vencimento / Previsão' : 'Data'}
              </label>
              <input
                id="input-date"
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                value={dateInput}
                onChange={(e) => {
                  const masked = maskBrDate(e.target.value);
                  setDateInput(masked);
                  const clean = masked.replace(/\D/g, '');
                  if (clean.length === 8) {
                    const res = validateDateString(masked, isPlannedExpense, type, simulatedDate);
                    if (!res.isValid) {
                      setError(res.error || 'Data inválida.');
                      setDate('');
                    } else {
                      if (isDateErrorMessage(error)) setError(null);
                      setDate(res.iso || '');
                    }
                  } else {
                    setDate('');
                    if (isDateErrorMessage(error)) {
                      setError(null);
                    }
                  }
                }}
                onBlur={() => {
                  const clean = dateInput.replace(/\D/g, '');
                  if (clean.length > 0 && clean.length < 8) {
                    setError('Data incompleta ou inválida.');
                  }
                }}
                className={`w-full pl-3 pr-9 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:font-['Roboto'] placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 font-mono tracking-wide transition-colors ${
                  isDateErrorMessage(error)
                    ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-900/10 dark:focus:ring-zinc-400/10'
                }`}
                required
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const picker = datePickerRef.current;
                  if (!picker) return;
                  try {
                    picker.showPicker();
                  } catch {
                    try {
                      picker.focus();
                      picker.click();
                    } catch {}
                  }
                }}
                className="absolute right-2.5 top-[27px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                title="Escolher data no calendário"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
              <input
                ref={datePickerRef}
                type="date"
                min={currentBounds.minIso}
                max={currentBounds.maxIso}
                value={date}
                onChange={(e) => {
                  const iso = e.target.value;
                  if (!iso) return;
                  const br = isoToBrDate(iso);
                  setDateInput(br);
                  const res = validateDateString(br, isPlannedExpense, type, simulatedDate);
                  if (!res.isValid) {
                    setError(res.error || 'Data inválida.');
                    setDate('');
                  } else {
                    if (isDateErrorMessage(error)) setError(null);
                    setDate(iso);
                  }
                }}
                className="absolute right-2.5 top-[27px] w-6 h-6 opacity-0 pointer-events-none"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Categoria
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {availableCategories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`btn-cat-${cat.id}`}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        if (error === 'Por favor, selecione uma categoria.') {
                          setError(null);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                          : 'bg-zinc-100/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <CategoryIcon icon={cat.icon} className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <p id="form-error-message" className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-lg border border-rose-100 dark:border-rose-900/50">
              {error}
            </p>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              id="btn-submit-transaction"
              type="submit"
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isPending ? 'Salvar Gasto Previsto' : 'Salvar Transação'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
