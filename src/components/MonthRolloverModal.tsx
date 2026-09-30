import React, { useEffect, useRef } from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatMonthYear, getMonthNameInPortuguese } from '../utils/formatters.ts';

interface MonthRolloverModalProps {
  isOpen: boolean;
  currentMonth: string; // e.g. "2026-10"
  previousMonth: string; // e.g. "2026-09"
  previousRemainingBalance: number;
  renda: number;
  onConfirm: () => void;
}

export const MonthRolloverModal: React.FC<MonthRolloverModalProps> = ({
  isOpen,
  currentMonth,
  previousMonth,
  previousRemainingBalance,
  renda,
  onConfirm,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentMonthTitle = formatMonthYear(currentMonth);
  const previousMonthTitle = formatMonthYear(previousMonth);

  const [prevYearStr, prevMonthNumStr] = previousMonth.split('-');
  const prevMonthNum = parseInt(prevMonthNumStr, 10);
  const prevMonthName = getMonthNameInPortuguese(prevMonthNum);
  const poupadoDescription = `Saldo poupado de ${prevMonthName} de ${prevYearStr}`;

  const hasPoupado = previousRemainingBalance > 0;

  return (
    <div
      ref={overlayRef}
      id="modal-month-rollover-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={contentRef}
        id="modal-month-rollover-card"
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="month-rollover-title"
      >
        {/* Header Decorativo com Ícone */}
        <div className="relative p-6 sm:p-7 pb-4 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <Calendar className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Novo Mês Iniciado
              </div>
              <h2
                id="month-rollover-title"
                className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
              >
                {currentMonthTitle}
              </h2>
            </div>
          </div>
        </div>

        {/* Corpo com Texto Oficial Requisitado */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto">
          {/* Mensagem oficial sem caixa envolvente */}
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Suas movimentações do mês anterior estão salvas em{' '}
            <strong className="text-zinc-900 dark:text-zinc-100 font-medium">
              Configurações &gt; Histórico Geral
            </strong>
            . Sua renda continua a mesma, mas pode ser alterada quando quiser, e eventuais saldos restantes aparecerão como{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-medium">
              '{poupadoDescription}'
            </strong>
            . Suas caixinhas (ativas ou arquivadas) permanecem inalteradas; continue guardando dinheiro para alcançar seus objetivos.
          </p>

          {/* Resumo simples dos valores */}
          <div className="pt-1 space-y-1.5 text-xs sm:text-sm font-mono">
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] sm:text-xs font-sans">
                SALDO POUPADO:
              </span>{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(hasPoupado ? previousRemainingBalance : 0)}
              </span>
            </div>
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] sm:text-xs font-sans">
                RENDA MENSAL:
              </span>{' '}
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(renda)}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé com Botão "OK" */}
        <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end">
          <button
            id="btn-confirm-month-rollover"
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto min-w-[140px] px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>OK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
