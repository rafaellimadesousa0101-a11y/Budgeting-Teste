/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

const TIME_TRAVEL_KEY = 'min_finance_time_travel_v1';
export const TIME_TRAVEL_EVENT = 'min_finance_time_travel_change';

export interface TimeTravelState {
  isActive: boolean;
  offsetMs: number; // difference in milliseconds between simulated time and real time
  simulatedIso: string; // ISO string representing simulated date & time (for backward compatibility)
}

let cachedState: TimeTravelState | null = null;

export function loadTimeTravelState(): TimeTravelState {
  if (cachedState) return cachedState;
  try {
    const raw = localStorage.getItem(TIME_TRAVEL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.isActive === 'boolean') {
        let offsetMs = 0;
        if (typeof parsed.offsetMs === 'number' && !isNaN(parsed.offsetMs)) {
          offsetMs = parsed.offsetMs;
        } else if (parsed.simulatedIso) {
          // Backward compatibility for old saved state format
          const target = new Date(parsed.simulatedIso).getTime();
          if (!isNaN(target)) {
            offsetMs = target - Date.now();
          }
        }
        cachedState = {
          isActive: parsed.isActive,
          offsetMs,
          simulatedIso: new Date(Date.now() + offsetMs).toISOString(),
        };
        return cachedState;
      }
    }
  } catch (e) {
    console.error('Error loading time travel state', e);
  }
  cachedState = {
    isActive: false,
    offsetMs: 0,
    simulatedIso: new Date().toISOString(),
  };
  return cachedState;
}

export function saveTimeTravelState(state: TimeTravelState) {
  cachedState = state;
  try {
    localStorage.setItem(TIME_TRAVEL_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving time travel state', e);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TIME_TRAVEL_EVENT, { detail: state }));
  }
}

/**
 * Retorna o objeto Date atual do app (simulado se time travel ativo, ou relógio real do sistema).
 * Quando a simulação está ativa, o tempo continua passando normalmente no relógio simulado.
 */
export function getNow(): Date {
  const state = loadTimeTravelState();
  if (state.isActive) {
    return new Date(Date.now() + (state.offsetMs || 0));
  }
  return new Date();
}

/**
 * Indica se o mock de tempo está ativado no momento.
 */
export function isTimeTravelActive(): boolean {
  return loadTimeTravelState().isActive;
}

/**
 * Define uma nova data e hora simulada.
 * A partir deste momento, o relógio continua passando normalmente com o offset aplicado.
 */
export function setSimulatedDate(date: Date) {
  const targetTime = date.getTime();
  if (isNaN(targetTime)) return;
  const offsetMs = targetTime - Date.now();
  saveTimeTravelState({
    isActive: true,
    offsetMs,
    simulatedIso: date.toISOString(),
  });
}

/**
 * Adiciona ou subtrai dias da data simulada.
 */
export function addDays(days: number) {
  const current = getNow();
  const next = new Date(current);
  next.setDate(next.getDate() + days);
  setSimulatedDate(next);
}

/**
 * Adiciona ou subtrai meses da data simulada.
 */
export function addMonths(months: number) {
  const current = getNow();
  const next = new Date(current);
  next.setMonth(next.getMonth() + months);
  setSimulatedDate(next);
}

/**
 * Adiciona ou subtrai anos da data simulada.
 */
export function addYears(years: number) {
  const current = getNow();
  const next = new Date(current);
  next.setFullYear(next.getFullYear() + years);
  setSimulatedDate(next);
}

/**
 * Desativa o mock e restaura o relógio real do sistema.
 */
export function resetToRealTime() {
  saveTimeTravelState({
    isActive: false,
    offsetMs: 0,
    simulatedIso: new Date().toISOString(),
  });
}

/**
 * Listener para atualizações de time travel em toda a aplicação.
 */
export function subscribeTimeTravel(callback: (state: TimeTravelState) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<TimeTravelState>;
    callback(custom.detail || loadTimeTravelState());
  };
  window.addEventListener(TIME_TRAVEL_EVENT, handler);
  return () => {
    window.removeEventListener(TIME_TRAVEL_EVENT, handler);
  };
}

/**
 * Hook do React para sincronizar estado de time travel com componentes.
 */
export function useTimeTravel() {
  const [state, setState] = useState<TimeTravelState>(() => loadTimeTravelState());
  const [now, setNow] = useState<Date>(() => getNow());

  useEffect(() => {
    const unsub = subscribeTimeTravel((newState) => {
      setState(newState);
      setNow(getNow());
    });
    const interval = setInterval(() => {
      setNow(getNow());
    }, 1000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return {
    isActive: state.isActive,
    simulatedDate: now,
    setSimulatedDate,
    addDays,
    addMonths,
    addYears,
    resetToRealTime,
  };
}
