import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Clock, PiggyBank } from 'lucide-react';
import { Transaction } from '../types.ts';
import { getCategoryById } from '../data/categories.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { formatCurrency, formatFullDate, formatMonthYear, formatShortMonthYear, getCurrentMonthString, getTodayString } from '../utils/formatters.ts';

interface MonthCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  transactions: Transaction[];
}

export const MonthCalendarModal: React.FC<MonthCalendarModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  transactions,
}) => {
  const targetMonth = selectedMonth !== 'all' ? selectedMonth : getCurrentMonthString();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => {
    return getTodayString();
  }, [isOpen]);

  // Redefine seleção temporária de dia e scroll ao reabrir
  useEffect(() => {
    if (isOpen) {
      setSelectedDay(null);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll and isolate background while modal is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    const overlay = overlayRef.current;
    const content = contentRef.current;

    const handleOverlayWheel = (e: WheelEvent) => {
      if (e.target === overlay) {
        e.preventDefault();
      }
    };

    const handleOverlayTouchMove = (e: TouchEvent) => {
      if (e.target === overlay) {
        e.preventDefault();
      }
    };

    const handleContentWheel = (e: WheelEvent) => {
      if (!content) return;
      const { scrollTop, scrollHeight, clientHeight } = content;
      const isAtTop = scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
      if (isAtTop || isAtBottom) {
        e.preventDefault();
      }
    };

    if (overlay) {
      overlay.addEventListener('wheel', handleOverlayWheel, { passive: false });
      overlay.addEventListener('touchmove', handleOverlayTouchMove, { passive: false });
    }

    if (content) {
      content.addEventListener('wheel', handleContentWheel, { passive: false });
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;

      if (overlay) {
        overlay.removeEventListener('wheel', handleOverlayWheel);
        overlay.removeEventListener('touchmove', handleOverlayTouchMove);
      }
      if (content) {
        content.removeEventListener('wheel', handleContentWheel);
      }
    };
  }, [isOpen]);

  // Calendar calculations
  const { year, monthIndex, daysInMonth, firstDayOfWeek } = useMemo(() => {
    const [yStr, mStr] = targetMonth.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1;
    const dCount = new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(y, m, 1).getDay();
    return {
      year: y,
      monthIndex: m,
      daysInMonth: dCount,
      firstDayOfWeek: firstDay,
    };
  }, [targetMonth]);

  // Determine calendar date: for caixinha movements, always use the day they were created
  const getTxCalendarDate = (t: Transaction): string => {
    const isSaved = t.isSavedBox || t.tag === 'Guardado' || !!t.boxId;
    if (isSaved && t.createdAt) {
      const d = new Date(t.createdAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return t.date;
  };

  // Filter transactions for this specific month based on creation day for caixinhas
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const calDate = getTxCalendarDate(t);
      return calDate && calDate.startsWith(targetMonth);
    });
  }, [transactions, targetMonth]);

  // Group transactions by calendar date
  const transactionsByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    monthTransactions.forEach((t) => {
      const calDate = getTxCalendarDate(t);
      const current = map.get(calDate) || [];
      current.push(t);
      map.set(calDate, current);
    });
    return map;
  }, [monthTransactions]);

  // If selectedDay has no movements, clear selection
  useEffect(() => {
    if (selectedDay) {
      const txs = transactionsByDate.get(selectedDay);
      if (!txs || txs.length === 0) {
        setSelectedDay(null);
      }
    }
  }, [transactionsByDate, selectedDay]);

  if (!isOpen) return null;

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthTitle = formatMonthYear(targetMonth);

  const selectedDayTransactions = selectedDay ? transactionsByDate.get(selectedDay) || [] : [];

  return (
    <div
      id="modal-calendar-overlay"
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-150 overscroll-contain select-none"
      style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        id="modal-calendar-content"
        ref={contentRef}
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-y-auto overscroll-contain transition-colors select-text"
        style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header: Month & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {monthTitle}
            </h2>
          </div>
          <button
            id="btn-close-calendar"
            type="button"
            onClick={onClose}
            aria-label="Fechar calendário"
            className="p-1 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="pt-3 pb-2">
          {/* Subtle Legend Bar matching chart colors */}
          <div className="flex items-center justify-center gap-3.5 mb-2.5 text-[10px] text-zinc-500 dark:text-zinc-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3b6790]" />
              <span>Entradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e06a55]" />
              <span>Saídas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d99b26]" />
              <span>Previstos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Caixinhas</span>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {weekDayLabels.map((w, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 py-1"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Blank offset slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`blank-${idx}`} className="w-8 h-8 sm:w-9 sm:h-9 mx-auto" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayStr = `${targetMonth}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dayStr === todayStr;
              const dayTxs = transactionsByDate.get(dayStr) || [];
              const hasMovements = dayTxs.length > 0;
              const isSelected = selectedDay === dayStr;

              const isSavedTx = (t: Transaction) => t.isSavedBox || t.tag === 'Guardado' || !!t.boxId;

              // Identify distinct movement categories for this day
              const hasIncome = dayTxs.some((t) => t.type === 'income');
              const hasExpense = dayTxs.some(
                (t) => t.type === 'expense' && t.status !== 'pending' && !isSavedTx(t)
              );
              const hasPlanned = dayTxs.some(
                (t) => t.type === 'expense' && t.status === 'pending'
              );
              const hasSaved = dayTxs.some((t) => isSavedTx(t));

              // Colors correspondentes à paleta:
              // - Entradas: Azul-ardósia (#3b6790)
              // - Despesas Pagas: Coral (#e06a55)
              // - Gastos Previstos: Ocre (#d99b26)
              // - Caixinhas: Esmeralda (#10b981)
              const colors: string[] = [];
              if (hasIncome) colors.push('rgba(59, 103, 144, 0.85)'); // Azul-ardósia
              if (hasExpense) colors.push('rgba(224, 106, 85, 0.85)'); // Coral
              if (hasPlanned) colors.push('rgba(217, 155, 38, 0.85)'); // Ocre
              if (hasSaved) colors.push('rgba(16, 185, 129, 0.85)'); // Esmeralda (Caixinhas)

              let ringBackground: string | undefined;
              if (colors.length === 1) {
                ringBackground = colors[0];
              } else if (colors.length > 1) {
                const slice = 360 / colors.length;
                const stops = colors
                  .map((col, i) => `${col} ${i * slice}deg ${(i + 1) * slice}deg`)
                  .join(', ');
                ringBackground = `conic-gradient(from -90deg, ${stops})`;
              }

              return (
                <div key={dayStr} className="flex items-center justify-center">
                  <button
                    id={`calendar-day-${dayNum}`}
                    type="button"
                    disabled={!hasMovements}
                    onClick={() => {
                      if (hasMovements) {
                        setSelectedDay(isSelected ? null : dayStr);
                      }
                    }}
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center p-[2.5px] transition-all select-none ${
                      hasMovements
                        ? 'cursor-pointer hover:scale-110 active:scale-95'
                        : 'cursor-default opacity-85'
                    } ${
                      isSelected
                        ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 dark:ring-offset-zinc-900 scale-105 z-10'
                        : ''
                    }`}
                    style={
                      ringBackground
                        ? { background: ringBackground }
                        : undefined
                    }
                    title={
                      isToday
                        ? hasMovements
                          ? `Hoje (dia ${dayNum}) - ${dayTxs.length} movimentação(ões)`
                          : `Hoje (dia ${dayNum})`
                        : hasMovements
                        ? `${dayTxs.length} movimentação(ões) no dia ${dayNum}`
                        : undefined
                    }
                  >
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center text-xs font-semibold ${
                        isSelected
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : hasMovements
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                          : isToday
                          ? 'bg-transparent text-zinc-900 dark:text-zinc-100 font-bold'
                          : 'bg-transparent text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className={isToday ? 'underline underline-offset-[3px] decoration-2 font-bold decoration-current' : ''}>
                        {dayNum}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Movements List */}
        {selectedDay && selectedDayTransactions.length > 0 && (
          <div
            id="calendar-day-details"
            className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {formatFullDate(selectedDay)}
              </span>
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                {selectedDayTransactions.length}{' '}
                {selectedDayTransactions.length === 1
                  ? 'movimentação'
                  : 'movimentações'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
              {selectedDayTransactions.map((tx) => {
                const category = getCategoryById(tx.category);
                const isPlanned = tx.type === 'expense' && tx.status === 'pending';
                const isIncome = tx.type === 'income';
                const isSaved = tx.isSavedBox || tx.tag === 'Guardado' || !!tx.boxId;

                return (
                  <div
                    key={tx.id}
                    id={`day-tx-${tx.id}`}
                    className={`flex items-center justify-between gap-3 p-2 rounded-xl border ${
                      isSaved
                        ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] border-emerald-500/25 dark:border-emerald-500/35'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/60 dark:border-zinc-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSaved
                            ? 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : isIncome
                            ? 'bg-[#3b6790]/10 dark:bg-[#3b6790]/25 text-[#2d5275] dark:text-[#88b0d8] border-[#3b6790]/20'
                            : isPlanned
                            ? 'bg-[#d99b26]/10 dark:bg-[#d99b26]/25 text-[#a17015] dark:text-[#eec570] border-[#d99b26]/25'
                            : 'bg-[#e06a55]/10 dark:bg-[#e06a55]/20 text-[#b54a37] dark:text-[#f09a89] border-[#e06a55]/20'
                        }`}
                      >
                        {isSaved ? (
                          <PiggyBank className="w-3.5 h-3.5" />
                        ) : (
                          <CategoryIcon icon={category.icon} className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {tx.description}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {isSaved ? 'Caixinhas' : category.label}
                          </span>
                          {isSaved && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-1 py-0.2 rounded border border-emerald-500/25">
                              Guardado
                            </span>
                          )}
                          {isPlanned && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#a17015] dark:text-[#eec570] bg-[#d99b26]/10 dark:bg-[#d99b26]/20 px-1 py-0.2 rounded border border-[#d99b26]/25 dark:border-[#d99b26]/35">
                              <Clock className="w-2.5 h-2.5" />
                              Previsto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div
                        className={`text-xs font-bold ${
                          isSaved
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isIncome
                            ? 'text-[#2d5275] dark:text-[#88b0d8]'
                            : isPlanned
                            ? 'text-[#a17015] dark:text-[#eec570]'
                            : 'text-[#b54a37] dark:text-[#f09a89]'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
