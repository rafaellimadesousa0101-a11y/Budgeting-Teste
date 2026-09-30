import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingDown,
  Clock,
  Wallet,
  Info,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatMonthYear, getCurrentMonthString } from '../utils/formatters.ts';

interface FinancialChartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  initialBalance: number;
  totalIncome: number;
  paidExpense: number;
  plannedExpense: number;
}

export const FinancialChartsModal: React.FC<FinancialChartsModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  initialBalance,
  totalIncome,
  paidExpense,
  plannedExpense,
}) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Redefine estado temporário de navegação/visualização ao abrir
  useEffect(() => {
    if (isOpen) {
      setChartType('pie');
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  const targetMonth = selectedMonth !== 'all' ? selectedMonth : getCurrentMonthString();
  const periodLabel = selectedMonth === 'all' ? 'Todo o histórico' : formatMonthYear(targetMonth);

  // Montante Único: soma do saldo fixo + quaisquer adições (receitas)
  const totalBudget = initialBalance + totalIncome;

  // Total de gastos (efetivados + previstos)
  const totalAllExpense = paidExpense + plannedExpense;

  // Saldo Atual restante
  const currentBalance = totalBudget - totalAllExpense;

  // Base para cálculo percentual: o montante único (ou total de gastos se estourou)
  const baseTotal = totalBudget > 0 ? totalBudget : totalAllExpense;

  // Paleta de cores moderna e sóbria:
  // - Despesas: Tom coral (#e06a55)
  // - Gastos Previstos: Ocre / Amarelo-queimado (#d99b26)
  // - Saldo Restante: Azul-ardósia (#3b6790 / negativo: #be4b5e)
  const chartItems = useMemo(() => {
    return [
      {
        id: 'expense',
        name: 'Despesas + Caixinhas',
        value: paidExpense,
        color: '#e06a55', // Coral refinado
        icon: TrendingDown,
        description: 'Despesas e saídas de caixinhas pagas no período',
      },
      {
        id: 'planned',
        name: 'Gastos Previstos',
        value: plannedExpense,
        color: '#d99b26', // Ocre / Amarelo-queimado
        icon: Clock,
        description: 'Contas e compromissos a pagar',
      },
      {
        id: 'balance',
        name: 'Saldo Restante',
        value: currentBalance,
        color: currentBalance >= 0 ? '#3b6790' : '#be4b5e', // Azul-ardósia moderno
        icon: Wallet,
        description: 'Saldo restante do montante',
      },
    ];
  }, [paidExpense, plannedExpense, currentBalance]);

  // Fatias do gráfico de pizza (somente valores positivos entram no círculo)
  const pieData = useMemo(() => {
    return chartItems
      .filter((item) => item.value > 0)
      .map((item) => {
        const percent = baseTotal > 0 ? (item.value / baseTotal) * 100 : 0;
        return {
          ...item,
          chartValue: item.value,
          percent: percent.toFixed(1),
        };
      });
  }, [chartItems, baseTotal]);

  // Dados para o gráfico de barras
  const barData = useMemo(() => {
    return chartItems.map((item) => {
      const percent = baseTotal > 0 ? ((item.value / baseTotal) * 100).toFixed(1) : '0';
      return {
        name: item.name,
        value: Math.max(0, item.value),
        actualValue: item.value,
        color: item.color,
        percent,
        formatted: formatCurrency(item.value),
      };
    });
  }, [chartItems, baseTotal]);

  // Escala matemática constante do Eixo Y (4 divisões exatas)
  const { yAxisDomain, yAxisTicks } = useMemo(() => {
    const maxVal = Math.max(
      totalBudget,
      ...chartItems.map((i) => i.value),
      1000
    );

    let step: number;
    if (maxVal <= 1000) step = 250;
    else if (maxVal <= 2500) step = 500;
    else if (maxVal <= 5000) step = 1000;
    else if (maxVal <= 10000) step = 2500;
    else if (maxVal <= 16000) step = 3500; // 0, 3.5k, 7k, 10.5k, 14k (4 divisões exatas até 14k)
    else if (maxVal <= 25000) step = 5000;
    else if (maxVal <= 50000) step = 10000;
    else if (maxVal <= 100000) step = 25000;
    else {
      const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
      step = Math.ceil(maxVal / (4 * magnitude)) * magnitude;
    }

    const maxTick = Math.ceil(maxVal / step) * step;
    const ticks: number[] = [];
    for (let t = 0; t <= maxTick; t += step) {
      ticks.push(t);
    }

    return {
      yAxisDomain: [0, maxTick] as [number, number],
      yAxisTicks: ticks,
    };
  }, [totalBudget, chartItems]);

  // Responsive dimensions for Pie chart (mobile vs desktop)
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  const hasAnyData = totalBudget > 0 || totalAllExpense > 0;

  return (
    <div
      id="modal-charts-overlay"
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-150 overscroll-contain select-none"
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
        id="modal-charts-content"
        ref={contentRef}
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-3.5 sm:p-6 shadow-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col max-h-[94vh] overflow-y-auto overscroll-contain transition-colors select-text"
        style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Resumo Financeiro
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {periodLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Pizza / Barras */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700">
              <button
                id="btn-toggle-pie-chart"
                type="button"
                onClick={() => setChartType('pie')}
                title="Gráfico de Pizza"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  chartType === 'pie'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pizza</span>
              </button>
              <button
                id="btn-toggle-bar-chart"
                type="button"
                onClick={() => setChartType('bar')}
                title="Gráfico de Barras"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Barras</span>
              </button>
            </div>

            <button
              id="btn-close-charts"
              type="button"
              onClick={onClose}
              aria-label="Fechar gráficos"
              className="p-1 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Montante Único Highlight Banner */}
        <div
          id="banner-total-budget"
          className="mt-3 p-3 sm:p-3.5 bg-zinc-50/90 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex flex-col gap-2.5 transition-all"
        >
          {/* Header Row: Title & Total Value */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block truncate">
                  Montante Total Disponível
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block truncate">
                  Base de cálculo para gastos e saldo
                </span>
              </div>
            </div>

            <div className="sm:text-right shrink-0 pl-9 sm:pl-0">
              <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight block">
                {formatCurrency(totalBudget)}
              </span>
            </div>
          </div>

          {/* Sub-breakdown Row: Renda e Adições lado a lado com visual harmonioso e proporcional */}
          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
              Composição do Montante
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {/* Renda Fixa */}
              <div className="flex flex-col gap-0.5 bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 px-2.5 py-1.5 rounded-lg shadow-2xs min-w-0">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium truncate">Renda:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {formatCurrency(initialBalance)}
                </span>
              </div>

              {/* Entradas */}
              <div className="flex flex-col gap-0.5 bg-white dark:bg-zinc-800/80 border border-[#3b6790]/30 dark:border-[#3b6790]/40 px-2.5 py-1.5 rounded-lg shadow-2xs min-w-0">
                <span className="text-[#2d5275] dark:text-[#88b0d8] font-medium truncate">Entradas:</span>
                <span className="font-semibold text-[#2d5275] dark:text-[#88b0d8] truncate">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Visualization Area */}
        <div className="py-3">
          {!hasAnyData ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-4">
              <PieChartIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-2 stroke-1" />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nenhum valor registrado
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                Defina o saldo fixo ou adicione movimentações para visualizar os gráficos.
              </p>
            </div>
          ) : chartType === 'pie' ? (
            /* Pie Chart View */
            <div className="flex flex-col items-center w-full">
              <div className="w-full h-52 xs:h-56 sm:h-64 relative flex items-center justify-center pointer-events-none select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart className="pointer-events-none">
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 58 : 72}
                      outerRadius={isMobile ? 78 : 92}
                      paddingAngle={0}
                      dataKey="chartValue"
                      isAnimationActive={false}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={1}
                          style={{
                            outline: 'none',
                            cursor: 'default',
                          }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display: Saldo Restante com espaçamento e hierarquia refinada */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none px-2 text-center">
                  <span className="text-[10px] sm:text-[11px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider mb-0.5 sm:mb-1.5">
                    Saldo Restante
                  </span>
                  <span
                    className={`text-sm xs:text-base sm:text-lg font-bold tracking-tight ${
                      currentBalance >= 0 ? 'text-zinc-950 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatCurrency(currentBalance)}
                  </span>
                </div>
              </div>

              {currentBalance < 0 && (
                <div className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px]">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Os gastos superaram o montante total em {formatCurrency(Math.abs(currentBalance))} (Saldo negativo).
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Bar Chart View com Eixo Y Constante, Barras Esbeltas e Valores Flutuantes */
            <div className="w-full h-60 sm:h-72 pt-2 sm:pt-3 pointer-events-none select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  barSize={isMobile ? 24 : 32}
                  margin={{ top: 24, right: isMobile ? 8 : 16, left: isMobile ? -16 : 8, bottom: 6 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#a1a1aa"
                    opacity={0.12}
                  />
                  <XAxis
                    dataKey="name"
                    tick={false}
                    tickLine={false}
                    axisLine={{ stroke: '#e4e4e7' }}
                  />
                  <YAxis
                    domain={yAxisDomain}
                    ticks={yAxisTicks}
                    tick={{ fill: '#71717a', fontSize: isMobile ? 9 : 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (val === 0) return '0';
                      if (Math.abs(val) >= 1000) {
                        return `${(val / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
                      }
                      return `${val}`;
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    shape={(props: any) => {
                      const { x, y, width, height, fill, payload } = props;
                      // Altura mínima visual de 4px para que barras de valor reduzido não sumam
                      const minHeight = 4;
                      const drawHeight = Math.max(height || 0, minHeight);
                      const drawY = y - (drawHeight - (height || 0));
                      const radius = 6;
                      const r = Math.min(radius, drawHeight / 2, width / 2);

                      // Rótulo flutuante acima do topo da barra
                      const rawVal = payload?.actualValue ?? payload?.value ?? 0;
                      const labelText =
                        rawVal >= 10000
                          ? `R$ ${(rawVal / 1000).toFixed(1)}k`
                          : formatCurrency(rawVal);

                      return (
                        <g>
                          {/* Barra com bordas superiores arredondadas consistentes */}
                          <path
                            d={`
                              M ${x},${drawY + drawHeight}
                              L ${x},${drawY + r}
                              Q ${x},${drawY} ${x + r},${drawY}
                              L ${x + width - r},${drawY}
                              Q ${x + width},${drawY} ${x + width},${drawY + r}
                              L ${x + width},${drawY + drawHeight}
                              Z
                            `}
                            fill={fill}
                          />
                          {/* Valor flutuante acima do topo da barra */}
                          <text
                            x={x + width / 2}
                            y={drawY - 6}
                            textAnchor="middle"
                            fill="#71717a"
                            className="dark:fill-zinc-300 text-[10px] font-semibold select-none"
                          >
                            {labelText}
                          </text>
                        </g>
                      );
                    }}
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Legend / Metrics Breakdown List (Despesas, Gastos Previstos, Saldo Atual) */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Detalhamento sobre o Montante
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {chartItems.map((item) => {
              const percent =
                baseTotal > 0 && item.value > 0
                  ? ((item.value / baseTotal) * 100).toFixed(1)
                  : item.value <= 0
                  ? '0.0'
                  : null;

              return (
                <div
                  key={item.id}
                  id={`legend-item-${item.id}`}
                  className="flex flex-col justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0 mb-1">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span
                      className={`text-xs font-bold ${
                        item.id === 'balance' && item.value < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {formatCurrency(item.value)}
                    </span>
                    {percent && (
                      <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
                        {percent}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
