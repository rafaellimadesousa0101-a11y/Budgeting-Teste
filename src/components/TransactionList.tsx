import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
  Clock,
  CheckCircle2,
  PiggyBank,
  Plus,
  Wallet,
} from 'lucide-react';
import { FilterType, Transaction, SavingBox } from '../types.ts';
import { getCategoryById } from '../data/categories.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { formatCurrency, formatDate, compareTransactionsRecentFirst } from '../utils/formatters.ts';

interface TransactionListProps {
  transactions: Transaction[];
  savingBoxes?: SavingBox[];
  onDeleteTransaction: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  savingBoxes,
  onDeleteTransaction,
  onMarkAsPaid,
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(4);

  // Reinicia o contador para 4 sempre que o termo de busca ou filtro for alterado
  useEffect(() => {
    setVisibleCount(4);
  }, [searchTerm, filterType]);

  // Filter items and keep the most recent always at the top across all tabs
  const filtered = transactions
    .filter((t) => {
      let matchesType = true;
      if (filterType === 'income') {
        matchesType = t.type === 'income';
      } else if (filterType === 'expense') {
        matchesType = t.type === 'expense' && t.status !== 'pending';
      } else if (filterType === 'pending') {
        matchesType = t.status === 'pending';
      }

      const term = searchTerm.trim().toLowerCase();
      const amountStr = t.amount.toString();
      const amountFormatted = t.amount.toFixed(2).replace('.', ',');

      const matchesSearch =
        term === '' ||
        t.description.toLowerCase().includes(term) ||
        getCategoryById(t.category).label.toLowerCase().includes(term) ||
        amountStr.includes(term) ||
        amountFormatted.includes(term);

      return matchesType && matchesSearch;
    })
    .sort(compareTransactionsRecentFirst);

  const visibleItems = filtered.slice(0, visibleCount);

  return (
    <div
      id="transaction-list-card"
      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Histórico de Movimentações</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {filtered.length > 4
              ? `Exibindo ${Math.min(visibleCount, filtered.length)} de ${filtered.length} movimentações`
              : `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`}
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-transactions"
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-400/10 focus:border-zinc-400 dark:focus:border-zinc-600 w-full sm:w-36 transition-all"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="w-full sm:w-auto flex items-center justify-between p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[11px] sm:text-xs font-medium">
            <button
              id="btn-filter-all"
              type="button"
              onClick={() => setFilterType('all')}
              className={`flex-1 sm:flex-initial text-center px-1.5 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Todos
            </button>

            <button
              id="btn-filter-income"
              type="button"
              onClick={() => setFilterType('income')}
              className={`flex-1 sm:flex-initial text-center px-1.5 sm:px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'income'
                  ? 'bg-white dark:bg-zinc-700 text-[#2d5275] dark:text-[#88b0d8] shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Entradas
            </button>

            <button
              id="btn-filter-expense"
              type="button"
              onClick={() => setFilterType('expense')}
              className={`flex-[1.4] sm:flex-initial text-center px-1.5 sm:px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'expense'
                  ? 'bg-white dark:bg-zinc-700 text-[#b54a37] dark:text-[#f09a89] shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Saída + Caixinhas</span>
            </button>

            <button
              id="btn-filter-pending"
              type="button"
              onClick={() => setFilterType('pending')}
              className={`flex-1 sm:flex-initial text-center px-1.5 sm:px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'pending'
                  ? 'bg-white dark:bg-zinc-700 text-[#a17015] dark:text-[#eec570] shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Previstos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div id="empty-transactions-state" className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400 dark:text-zinc-500">
            <Inbox className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nenhuma movimentação encontrada</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
            {searchTerm || filterType !== 'all'
              ? 'Tente ajustar os termos de busca ou o filtro selecionado.'
              : 'Clique em "Nova Movimentação" acima para registrar seus lançamentos.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleItems.map((item) => {
            const category = getCategoryById(item.category);
            const isIncome = item.type === 'income';
            const isPending = item.status === 'pending';
            const isSaved = item.isSavedBox || item.tag === 'Guardado' || !!item.boxId;
            const isSaldoPoupado =
              item.tag === 'Saldo Poupado' ||
              item.description.toLowerCase().startsWith('saldo poupado') ||
              item.id.startsWith('tx-poupado');

            const displayDate = isPending
              ? `Vencimento: ${formatDate(item.date)}`
              : formatDate(item.date);

            return (
              <div
                key={item.id}
                id={`transaction-row-${item.id}`}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isSaldoPoupado
                    ? 'bg-emerald-500/[0.05] dark:bg-emerald-500/[0.09] border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500/50 hover:bg-emerald-500/[0.08]'
                    : isSaved
                    ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border-emerald-500/25 dark:border-emerald-500/35 hover:border-emerald-500/40 hover:bg-emerald-500/[0.07]'
                    : isPending
                    ? 'bg-[#d99b26]/[0.05] dark:bg-[#d99b26]/10 border-[#d99b26]/20 dark:border-[#d99b26]/25 hover:bg-[#d99b26]/[0.08] dark:hover:bg-[#d99b26]/15'
                    : isIncome
                    ? 'bg-[#3b6790]/[0.03] dark:bg-[#3b6790]/[0.07] border-zinc-200/70 dark:border-zinc-800 hover:border-[#3b6790]/30 hover:bg-[#3b6790]/[0.06]'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200/70 dark:border-zinc-800 hover:border-[#e06a55]/30 hover:bg-[#e06a55]/[0.03] dark:hover:bg-zinc-800/40'
                }`}
              >
                {/* Left: Icon & Details */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 sm:mt-0 ${
                      isSaldoPoupado || isSaved
                        ? 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : isIncome
                        ? 'bg-[#3b6790]/10 dark:bg-[#3b6790]/25 text-[#2d5275] dark:text-[#88b0d8] border-[#3b6790]/20 dark:border-[#3b6790]/35'
                        : isPending
                        ? 'bg-[#d99b26]/10 dark:bg-[#d99b26]/25 text-[#a17015] dark:text-[#eec570] border-[#d99b26]/25 dark:border-[#d99b26]/35'
                        : 'bg-[#e06a55]/10 dark:bg-[#e06a55]/20 text-[#b54a37] dark:text-[#f09a89] border-[#e06a55]/20 dark:border-[#e06a55]/30'
                    }`}
                  >
                    {isSaldoPoupado ? (
                      <Wallet className="w-4 h-4" />
                    ) : isSaved ? (
                      <PiggyBank className="w-4 h-4" />
                    ) : (
                      <CategoryIcon icon={category.icon} className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words">
                        {item.description}
                      </span>
                      {isPending && (
                        <span className="text-[10px] font-semibold bg-[#d99b26]/15 dark:bg-[#d99b26]/25 text-[#a17015] dark:text-[#eec570] border border-[#d99b26]/30 dark:border-[#d99b26]/40 px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          <Clock className="w-2.5 h-2.5 text-[#a17015] dark:text-[#eec570]" />
                          <span>Previsto</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium px-1.5 py-0.5 rounded">
                        {isSaldoPoupado ? 'Saldo Poupado' : isSaved ? 'Caixinhas' : category.label}
                      </span>
                      {displayDate && (
                        <span className="text-zinc-400 dark:text-zinc-500">
                          {displayDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 sm:border-none shrink-0">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-sm sm:text-base font-bold tracking-tight flex items-center gap-1 ${
                        isSaldoPoupado || isSaved
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isIncome
                          ? 'text-[#2d5275] dark:text-[#88b0d8]'
                          : isPending
                          ? 'text-[#a17015] dark:text-[#eec570]'
                          : 'text-[#b54a37] dark:text-[#f09a89]'
                      }`}
                    >
                      {isSaldoPoupado ? (
                        <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isSaved ? (
                        <PiggyBank className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isIncome ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#3b6790] dark:text-[#88b0d8] shrink-0" />
                      ) : isPending ? (
                        <Clock className="w-3.5 h-3.5 text-[#d99b26] dark:text-[#eec570] shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-[#e06a55] dark:text-[#f09a89] shrink-0" />
                      )}
                      <span>{formatCurrency(item.amount)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPending && (
                      <button
                        id={`btn-list-pay-${item.id}`}
                        type="button"
                        onClick={() => onMarkAsPaid(item.id)}
                        title="Marcar como pago"
                        className="py-1 px-2.5 text-xs font-semibold text-[#2d5275] dark:text-[#88b0d8] bg-[#3b6790]/10 hover:bg-[#3b6790]/20 dark:bg-[#3b6790]/20 dark:hover:bg-[#3b6790]/30 border border-[#3b6790]/30 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3b6790] dark:text-[#88b0d8] shrink-0" />
                        <span>Pago</span>
                      </button>
                    )}

                    {/* Exibe o botão de lixeira SOMENTE se NÃO for Caixinha E NÃO for Saldo Poupado */}
                    {!isSaved && !isSaldoPoupado && (
                      <button
                        id={`btn-delete-${item.id}`}
                        type="button"
                        onClick={() => onDeleteTransaction(item.id)}
                        aria-label={`Excluir ${item.description}`}
                        title="Excluir movimentação"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Botão discreto sem nome com SVG de + no canto direito */}
          {visibleCount < filtered.length && (
            <div className="pt-2 flex justify-end">
              <button
                id="btn-show-more-transactions"
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 4)}
                aria-label="Carregar mais movimentações"
                title="Carregar mais movimentações"
                className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 inline-flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

