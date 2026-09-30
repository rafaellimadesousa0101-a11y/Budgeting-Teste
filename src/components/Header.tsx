import React, { useState, useEffect } from 'react';
import {
  Download,
  Trash2,
  AlertTriangle,
  Calendar,
  PieChart as PieChartIcon,
  Sun,
  Moon,
  Calculator as CalculatorIcon,
  PiggyBank,
  Pencil,
  Settings,
  Bug,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Transaction, SavingBox } from '../types.ts';
import { getCategoryById } from '../data/categories.ts';
import { formatMonthYear } from '../utils/formatters.ts';
import { MonthCalendarModal } from './MonthCalendarModal.tsx';
import { FinancialChartsModal } from './FinancialChartsModal.tsx';
import { FloatingCalculator } from './FloatingCalculator.tsx';
import { SavingsModal } from './SavingsModal.tsx';
import { BudgetingLogo } from './BudgetingLogo.tsx';
import { TimeTravelModal } from './TimeTravelModal.tsx';
import { SettingsModal } from './SettingsModal.tsx';
import { UserAuthButton } from './UserAuthButton.tsx';
import { FinancialAiModal } from './FinancialAiModal.tsx';
import { FinancialMonitoringModal } from './FinancialMonitoringModal.tsx';
import {
  isTimeTravelActive,
  getNow,
  subscribeTimeTravel,
  addDays,
  addMonths,
  resetToRealTime,
} from '../utils/timeTravel.ts';

interface HeaderProps {
  transactions: Transaction[];
  monthTransactionsCount: number;
  initialBalance: number;
  selectedMonth: string;
  onClearMonth: () => void;
  onMonthChange?: (month: string) => void;
  effectiveInitialBalance: number;
  totalIncome: number;
  paidExpense: number;
  plannedExpense: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  boxes: SavingBox[];
  onCreateBox: (box: Omit<SavingBox, 'id' | 'createdAt' | 'currentAmount'>, initialDeposit: number) => void;
  onUpdateBox?: (boxId: string, updatedData: Partial<Omit<SavingBox, 'id' | 'createdAt' | 'currentAmount'>>) => void;
  onFinalizeBox?: (boxId: string) => void;
  onDepositToBox: (boxId: string, amount: number) => void;
  onDeleteBox: (boxId: string) => void;
  isSketchMode?: boolean;
  onToggleSketchMode?: () => void;
  monthlyRenda?: Record<string, number>;
  onUpdateInitialBalance?: (val: number) => void;
  onNuclearReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  transactions,
  monthTransactionsCount,
  initialBalance,
  selectedMonth,
  onClearMonth,
  effectiveInitialBalance,
  totalIncome,
  paidExpense,
  plannedExpense,
  theme,
  onToggleTheme,
  boxes,
  onCreateBox,
  onUpdateBox,
  onFinalizeBox,
  onDepositToBox,
  onDeleteBox,
  isSketchMode = false,
  onToggleSketchMode,
  onMonthChange,
  monthlyRenda = {},
  onUpdateInitialBalance,
  onNuclearReset,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [isTitleLowered, setIsTitleLowered] = useState(false);
  const [isMockActive, setIsMockActive] = useState<boolean>(() => isTimeTravelActive());
  const [simulatedDate, setSimulatedDate] = useState<Date>(() => getNow());

  useEffect(() => {
    const update = () => {
      setIsMockActive(isTimeTravelActive());
      setSimulatedDate(getNow());
    };
    update();
    const interval = setInterval(update, 1000);
    const unsub = subscribeTimeTravel(update);
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  // Close confirm modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirm) {
        setShowConfirm(false);
      }
    };
    if (showConfirm) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirm]);

  // Lock body scroll and isolate background while confirm modal is active
  useEffect(() => {
    if (!showConfirm) return;

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
  }, [showConfirm]);

  // Saldo Restante da interface principal
  const remainingBalance = effectiveInitialBalance + totalIncome - (paidExpense + plannedExpense);

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Data', 'Tipo', 'Situação', 'Categoria', 'Descrição', 'Valor (R$)'];
    const rows = transactions.map((t) => [
      t.date,
      t.type === 'income' ? 'Entradas' : 'Despesa',
      t.status === 'pending' ? 'Previsto (A pagar)' : 'Efetivado / Pago',
      `"${getCategoryById(t.category).label}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2).replace('.', ','),
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `controle_financeiro_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasData = transactions.length > 0 || initialBalance !== 0 || (boxes && boxes.length > 0);
  const isAllMonths = selectedMonth === 'all';
  const monthLabel = isAllMonths ? 'todos os períodos' : formatMonthYear(selectedMonth);

  return (
    <>
      <header
        className={`mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 overflow-visible relative transition-all duration-700 ease-[cubic-bezier(0.34,1.25,0.64,1)] ${
          isTitleLowered ? 'pt-10 sm:pt-11' : 'pt-0'
        }`}
      >
        <div className="mb-2 sm:mb-0 relative overflow-visible">
          <div className="flex items-center overflow-visible">
            <h1 className="sr-only">Budgeting</h1>
            <BudgetingLogo
              onLoweredChange={setIsTitleLowered}
              isSketchMode={isSketchMode}
              isDark={theme === 'dark'}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-2 flex-wrap sm:flex-nowrap">
          {/* Google Auth & Sync Button */}
          <UserAuthButton
            onOpenSettings={() => setShowSettings(true)}
            isSketchMode={isSketchMode}
          />

          {transactions.length > 0 && (
            <button
              id="btn-export-csv"
              type="button"
              onClick={exportToCSV}
              title="Exportar dados para planilha CSV"
              aria-label="Exportar dados para planilha CSV"
              className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Financial Charts Button (Gráficos: Pizza e Barras) */}
          <button
            id="btn-open-charts"
            type="button"
            onClick={() => setShowCharts(true)}
            title="Gráficos financeiros (Pizza e Barras)"
            aria-label="Abrir gráficos financeiros"
            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <PieChartIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
          </button>

          {/* Assistente de IA Financeiro (Gemini + Firebase) */}
          <button
            id="btn-open-ai-assistant"
            type="button"
            onClick={() => setShowAiModal(true)}
            title="Assistente de IA Financeiro (Gemini)"
            aria-label="Abrir assistente financeiro inteligente"
            className="p-1.5 bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-300/80 dark:border-emerald-700/80 rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-400 transition-all flex items-center justify-center cursor-pointer shadow-2xs group relative"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Monitoramento de Notificações Bancárias (Android Native Bridge) */}
          <button
            id="btn-open-monitoring"
            type="button"
            onClick={() => setShowMonitoring(true)}
            title="Monitoramento de notificações bancárias (Pix / Pagamentos)"
            aria-label="Abrir monitoramento de notificações"
            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs relative group"
          >
            <Smartphone className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>

          {/* Calendar Button */}
          <button
            id="btn-open-calendar"
            type="button"
            onClick={() => setShowCalendar(true)}
            title="Calendário do mês"
            aria-label="Abrir calendário do mês"
            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle Button (Claro / Escuro - Próximo à lixeira) */}
          <button
            id="btn-toggle-theme"
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </button>

          {/* Floating Calculator Button (Próximo à lixeira e abaixo do título) */}
          <button
            id="btn-open-calculator"
            type="button"
            onClick={() => setShowCalculator((prev) => !prev)}
            title={showCalculator ? 'Ocultar calculadora flutuante' : 'Abrir calculadora flutuante (PiP)'}
            aria-label="Abrir calculadora flutuante"
            className={`p-1.5 border rounded-lg transition-colors flex items-center justify-center cursor-pointer shadow-2xs ${
              showCalculator
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <CalculatorIcon className="w-3.5 h-3.5" />
          </button>

          {/* Botão Guardar Dinheiro / Caixinhas (Próximo à lixeira e logo abaixo do título) */}
          <button
            id="btn-open-savings"
            type="button"
            onClick={() => setShowSavings(true)}
            title="Guardar Dinheiro (Caixinhas & Metas)"
            aria-label="Abrir tela de guardar dinheiro em caixinhas"
            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <PiggyBank className="w-3.5 h-3.5" />
          </button>

          {/* Botão Trocar Layout: Feito a mão com lápis sobre folha em branco (Antes da lixeira) */}
          <button
            id="btn-toggle-sketch-mode"
            type="button"
            onClick={onToggleSketchMode}
            title={
              isSketchMode
                ? 'Voltar ao layout padrão'
                : 'Mudar layout para feito a mão com lápis (Folha em branco)'
            }
            aria-label="Alternar layout feito a mão com lápis sobre folha em branco"
            className={`p-1.5 border rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-2xs ${
              isSketchMode
                ? 'bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-700 dark:ring-zinc-300'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Botão de Configurações / Catraca (À esquerda do ícone da lixeira) */}
          <button
            id="btn-settings"
            type="button"
            onClick={() => setShowSettings(true)}
            title="Configurações e Histórico Geral"
            aria-label="Configurações e Histórico Geral"
            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Coluna da Lixeira com o Botão de Debug (Modo Desenvolvedor / Time Travel) Logo Acima */}
          <div className="flex flex-col items-center gap-1.5 relative">
            {/* Botão de Debug (Modo Desenvolvedor / Time Travel) - Logo acima do ícone da lixeira */}
            <button
              id="btn-debug-time-travel"
              type="button"
              onClick={() => setShowTimeTravel(true)}
              title={
                isMockActive
                  ? `Modo Desenvolvedor ativo: simulando ${simulatedDate.toLocaleDateString('pt-BR')}. Clique para alterar.`
                  : 'Modo Desenvolvedor: simular datas e horários (Time Travel)'
              }
              aria-label="Modo Desenvolvedor: simular datas e horários"
              className={`p-1.5 border rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-2xs relative ${
                isMockActive
                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20 ring-2 ring-amber-400/50 hover:bg-amber-600'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/40'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              {isMockActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            {/* Ícone da Lixeira */}
            <button
              id="btn-clear-all"
              type="button"
              onClick={() => {
                if (hasData) setShowConfirm(true);
              }}
              disabled={!hasData}
              title={hasData ? 'Apagar histórico deste mês' : 'Nenhum dado para apagar neste mês'}
              aria-label="Apagar histórico financeiro"
              className={`p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg transition-colors flex items-center justify-center shadow-2xs ${
                hasData
                  ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 cursor-pointer'
                  : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner Indicador de Time Travel Ativo */}
        {isMockActive && (
          <div
            id="banner-time-travel-active"
            className="w-full mt-3 py-1.5 px-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-2xs animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                Simulando: <strong>{simulatedDate.toLocaleDateString('pt-BR')}</strong>{' '}
                <span className="font-mono text-[11px] opacity-85">
                  ({simulatedDate.toLocaleTimeString('pt-BR')})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => addDays(1)}
                className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-zinc-700 text-[11px] font-semibold cursor-pointer"
                title="Avançar 1 dia"
              >
                +1d
              </button>
              <button
                type="button"
                onClick={() => addMonths(1)}
                className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-zinc-700 text-[11px] font-semibold cursor-pointer"
                title="Avançar 1 mês"
              >
                +1m
              </button>
              <button
                type="button"
                onClick={() => resetToRealTime()}
                className="px-2 py-0.5 rounded bg-amber-500 text-white hover:bg-amber-600 text-[11px] font-semibold cursor-pointer"
                title="Restaurar relógio real"
              >
                Restaurar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Time Travel Modal (Modo Desenvolvedor para Mock de Tempo) */}
      {showTimeTravel && (
        <TimeTravelModal
          key="time-travel-modal"
          isOpen={showTimeTravel}
          onClose={() => setShowTimeTravel(false)}
          onMonthSync={onMonthChange}
          onNuclearReset={onNuclearReset}
        />
      )}

      {/* Interface de Guardar Dinheiro & Caixinhas (Nubank style) */}
      {showSavings && (
        <SavingsModal
          key="savings-modal"
          isOpen={showSavings}
          onClose={() => setShowSavings(false)}
          remainingBalance={remainingBalance}
          boxes={boxes}
          onCreateBox={onCreateBox}
          onUpdateBox={onUpdateBox}
          onFinalizeBox={onFinalizeBox}
          onDepositToBox={onDepositToBox}
          onDeleteBox={onDeleteBox}
        />
      )}

      {/* Month Calendar Modal */}
      {showCalendar && (
        <MonthCalendarModal
          key="month-calendar-modal"
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          selectedMonth={selectedMonth}
          transactions={transactions}
        />
      )}

      {/* Financial Charts Modal (Pizza & Barras) */}
      {showCharts && (
        <FinancialChartsModal
          key="financial-charts-modal"
          isOpen={showCharts}
          onClose={() => setShowCharts(false)}
          selectedMonth={selectedMonth}
          initialBalance={effectiveInitialBalance}
          totalIncome={totalIncome}
          paidExpense={paidExpense}
          plannedExpense={plannedExpense}
        />
      )}

      {/* Settings Modal (Configurações & Histórico Geral) */}
      {showSettings && (
        <SettingsModal
          key="settings-modal"
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          transactions={transactions}
          monthlyRenda={monthlyRenda}
          defaultRenda={initialBalance}
          onUpdateRenda={(val) => {
            if (onUpdateInitialBalance) onUpdateInitialBalance(val);
          }}
          selectedMonth={selectedMonth}
          onSelectMonth={(m) => {
            if (onMonthChange) onMonthChange(m);
          }}
          theme={theme}
          onToggleTheme={onToggleTheme}
          boxes={boxes}
          onOpenSavings={() => setShowSavings(true)}
          onOpenTimeTravel={() => setShowTimeTravel(true)}
          onExportCSV={exportToCSV}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          id="modal-confirm-clear"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 overscroll-contain select-none"
          style={{ overscrollBehavior: 'contain', touchAction: 'none' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirm(false);
            }
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xs w-full p-5 shadow-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col gap-4 text-center items-center overscroll-contain select-text"
            style={{ overscrollBehavior: 'contain' }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Apagar Histórico
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Você está prestes a apagar todo o seu histórico financeiro deste mês, inclusive as caixinhas.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full pt-1">
              <button
                id="btn-confirm-clear-back"
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                id="btn-confirm-clear-yes"
                type="button"
                onClick={() => {
                  onClearMonth();
                  setShowConfirm(false);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Picture-in-Picture Calculator (Sempre sobreposta a qualquer interface e 100% interativa) */}
      {showCalculator && (
        <FloatingCalculator
          key="floating-calculator"
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
        />
      )}

      {/* Modal Assistente de IA Financeiro (Gemini + Firebase) */}
      {showAiModal && (
        <FinancialAiModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          transactions={transactions}
          savingBoxes={boxes}
          initialBalance={initialBalance}
          monthlyRenda={monthlyRenda}
          selectedMonth={selectedMonth}
          isSketchMode={isSketchMode}
        />
      )}

      {/* Modal Monitoramento de Notificações Bancárias (Android Native Bridge) */}
      {showMonitoring && (
        <FinancialMonitoringModal
          isOpen={showMonitoring}
          onClose={() => setShowMonitoring(false)}
          isSketchMode={isSketchMode}
        />
      )}
    </>
  );
};
