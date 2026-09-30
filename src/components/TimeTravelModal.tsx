/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  FastForward,
  Rewind,
  Calendar,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Bug,
  Radiation,
} from 'lucide-react';
import {
  getNow,
  isTimeTravelActive,
  setSimulatedDate,
  addDays,
  addMonths,
  addYears,
  resetToRealTime,
  subscribeTimeTravel,
} from '../utils/timeTravel.ts';

interface TimeTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMonthSync?: (newYearMonth: string) => void;
  onNuclearReset?: () => void;
}

export const TimeTravelModal: React.FC<TimeTravelModalProps> = ({
  isOpen,
  onClose,
  onMonthSync,
  onNuclearReset,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => getNow());
  const [isActive, setIsActive] = useState<boolean>(() => isTimeTravelActive());
  const [syncAppMonth, setSyncAppMonth] = useState<boolean>(true);
  const [showNuclearConfirm, setShowNuclearConfirm] = useState<boolean>(false);

  // Form states
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = getNow();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [customTime, setCustomTime] = useState<string>(() => {
    const d = getNow();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const updateInputs = (d: Date) => {
      setCustomDate(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      );
      setCustomTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    };

    const updateClock = () => {
      const now = getNow();
      setCurrentDate(now);
      setIsActive(isTimeTravelActive());
    };

    updateClock();
    updateInputs(getNow());

    const interval = setInterval(updateClock, 1000);
    const unsub = subscribeTimeTravel(() => {
      updateClock();
      updateInputs(getNow());
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) return;
    const [year, month, day] = customDate.split('-').map(Number);
    const [hours, minutes] = (customTime || '12:00').split(':').map(Number);
    const target = new Date(year, month - 1, day, hours, minutes, 0);

    setSimulatedDate(target);
    if (syncAppMonth && onMonthSync) {
      const ym = `${year}-${String(month).padStart(2, '0')}`;
      onMonthSync(ym);
    }
  };

  const handleStep = (stepFn: () => void) => {
    stepFn();
    if (syncAppMonth && onMonthSync) {
      setTimeout(() => {
        const updated = getNow();
        const ym = `${updated.getFullYear()}-${String(updated.getMonth() + 1).padStart(2, '0')}`;
        onMonthSync(ym);
      }, 10);
    }
  };

  const handleSetEndOfMonth = () => {
    const now = getNow();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    setSimulatedDate(lastDay);
    if (syncAppMonth && onMonthSync) {
      const ym = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}`;
      onMonthSync(ym);
    }
  };

  const handleSetStartOfNextMonth = () => {
    const now = getNow();
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
    setSimulatedDate(firstDayNextMonth);
    if (syncAppMonth && onMonthSync) {
      const ym = `${firstDayNextMonth.getFullYear()}-${String(firstDayNextMonth.getMonth() + 1).padStart(2, '0')}`;
      onMonthSync(ym);
    }
  };

  const handleReset = () => {
    resetToRealTime();
    if (syncAppMonth && onMonthSync) {
      const real = new Date();
      const ym = `${real.getFullYear()}-${String(real.getMonth() + 1).padStart(2, '0')}`;
      onMonthSync(ym);
    }
  };

  const formattedSimulated = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(currentDate);

  const realDateNow = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());

  return (
    <div
      id="time-travel-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="time-travel-modal-content"
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Bug className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Modo Desenvolvedor (Time Travel)
                </h2>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Simulação Ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    Tempo Real do Sistema
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Simule datas, meses ou anos para testar histórico, caixinhas e movimentações.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Current Status Box */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              isActive
                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {isActive ? 'Data Simulada Atual no App' : 'Data Atual do Relógio Real'}
                </span>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize mt-0.5">
                  {formattedSimulated}
                </p>
              </div>

              {isActive && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="self-start sm:self-center px-2.5 py-1 text-xs font-semibold bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Voltar ao Tempo Real
                </button>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Relógio real do seu dispositivo:</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{realDateNow}</span>
            </div>
          </div>

          {/* Quick Steps (Avançar / Retroceder) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Ações Rápidas (Avançar e Voltar no Tempo)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleStep(() => addDays(1))}
                className="px-2.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FastForward className="w-3 h-3 text-amber-500" />
                +1 Dia
              </button>
              <button
                type="button"
                onClick={() => handleStep(() => addDays(-1))}
                className="px-2.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Rewind className="w-3 h-3 text-zinc-500" />
                -1 Dia
              </button>
              <button
                type="button"
                onClick={() => handleStep(() => addDays(7))}
                className="px-2.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FastForward className="w-3 h-3 text-amber-500" />
                +7 Dias
              </button>
              <button
                type="button"
                onClick={() => handleStep(() => addDays(-7))}
                className="px-2.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Rewind className="w-3 h-3 text-zinc-500" />
                -7 Dias
              </button>

              <button
                type="button"
                onClick={() => handleStep(() => addMonths(1))}
                className="px-2.5 py-2 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FastForward className="w-3 h-3" />
                +1 Mês
              </button>
              <button
                type="button"
                onClick={() => handleStep(() => addMonths(-1))}
                className="px-2.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Rewind className="w-3 h-3" />
                -1 Mês
              </button>
              <button
                type="button"
                onClick={() => handleStep(() => addYears(1))}
                className="px-2.5 py-2 text-xs font-medium bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FastForward className="w-3 h-3" />
                +1 Ano
              </button>
              <button
                type="button"
                onClick={() => handleStep(() => addYears(-1))}
                className="px-2.5 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Rewind className="w-3 h-3" />
                -1 Ano
              </button>
            </div>

            {/* Cenários Especiais */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={handleSetEndOfMonth}
                className="px-2.5 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-3 h-3 text-zinc-400" />
                Último dia deste mês
              </button>
              <button
                type="button"
                onClick={handleSetStartOfNextMonth}
                className="px-2.5 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-3 h-3 text-emerald-500" />
                1º dia do próximo mês (00h00)
              </button>
            </div>
          </div>

          {/* Manual Date & Time Picker */}
          <form
            onSubmit={handleApplyCustom}
            className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-3"
          >
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Escolher Data e Horário Específicos
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                  Data (Dia / Mês / Ano)
                </span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  required
                />
              </div>

              <div>
                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                  Horário (Hora : Minuto)
                </span>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="checkbox-sync-month"
                type="checkbox"
                checked={syncAppMonth}
                onChange={(e) => setSyncAppMonth(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-500 rounded border-zinc-300 dark:border-zinc-600 focus:ring-amber-400"
              />
              <label
                htmlFor="checkbox-sync-month"
                className="text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer select-none"
              >
                Sincronizar a visualização do mês do app automaticamente
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              Aplicar Data e Hora Simulada
            </button>
          </form>

          {/* Seção Crítica: Botão Nuclear (Reset de Fábrica) */}
          <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="p-3.5 rounded-xl bg-rose-500/[0.07] dark:bg-rose-500/[0.12] border border-rose-500/25 dark:border-rose-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 dark:bg-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <Radiation className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Limpeza Integral de Dados
                  </h4>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5 leading-snug">
                    Reinicia todo o aplicativo e apaga histórico, movimentações e caixinhas para o estado de fábrica.
                  </p>
                </div>
              </div>

              <button
                id="btn-nuclear"
                type="button"
                onClick={() => setShowNuclearConfirm(true)}
                className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-rose-700/60 active:scale-95"
              >
                <Radiation className="w-4 h-4" />
                <span>Botão Nuclear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Todas as movimentações e caixinhas sempre preservam suas datas originais de criação.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>

        {/* Modal de Confirmação do Botão Nuclear */}
        {showNuclearConfirm && (
          <div
            id="modal-nuclear-confirm"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setShowNuclearConfirm(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-rose-300 dark:border-rose-800/80 flex flex-col gap-4 text-center items-center animate-in zoom-in-95 duration-150 select-text"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Radiation className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Acionar Botão Nuclear?
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                  Esta ação limpará <strong>integralmente o histórico e todos os dados</strong>, reiniciando o estado do aplicativo exatamente como se tivesse acabado de ser instalado.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={() => setShowNuclearConfirm(false)}
                  className="flex-1 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-nuclear-confirm-yes"
                  type="button"
                  onClick={() => {
                    setShowNuclearConfirm(false);
                    onClose();
                    if (onNuclearReset) {
                      onNuclearReset();
                    }
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-lg transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Radiation className="w-3.5 h-3.5" />
                  Sim, Reiniciar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
