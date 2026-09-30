/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calculator as CalcIcon,
  X,
  Minus,
  Maximize2,
  History as HistoryIcon,
  Trash2,
  GripHorizontal,
  Copy,
  Check,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { CalculationRecord } from '../types.ts';

interface FloatingCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_HISTORY_KEY = 'min_finance_calc_history_v1';
const EXPIRATION_HOURS = 168; // 7 dias = 168 horas
const EXPIRATION_MS = EXPIRATION_HOURS * 60 * 60 * 1000;

// Limites estritos de zoom da calculadora: mín 75% e máx 95%
export const MIN_CALC_SCALE = 0.75;
export const MAX_CALC_SCALE = 0.95;
export const DEFAULT_CALC_SCALE = 0.85;

// Filter records that are older than 168 hours
function getCleanHistory(): CalculationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) return [];
    const parsed: CalculationRecord[] = JSON.parse(raw);
    const now = Date.now();
    const valid = parsed.filter(
      (item) => typeof item.timestamp === 'number' && now - item.timestamp < EXPIRATION_MS
    );
    if (valid.length !== parsed.length) {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch (err) {
    console.error('Erro ao ler histórico da calculadora:', err);
    return [];
  }
}

const getDefaultCalculatorPosition = (currentScale = DEFAULT_CALC_SCALE) => {
  if (typeof window !== 'undefined') {
    const defaultWidth = 315 * currentScale;
    const defaultHeight = 440 * currentScale;
    const initialX = Math.max(0, Math.min(window.innerWidth - defaultWidth - 16, window.innerWidth - defaultWidth));
    const initialY = Math.max(0, Math.min(80, window.innerHeight - defaultHeight - 16));
    return { x: initialX, y: initialY };
  }
  return { x: 80, y: 80 };
};

export const FloatingCalculator: React.FC<FloatingCalculatorProps> = ({ isOpen, onClose }) => {
  // Positioning state (Draggable) - Inicia na posição padrão
  const [position, setPosition] = useState<{ x: number; y: number }>(() => getDefaultCalculatorPosition());

  // Scale state (Pinch-to-zoom / controls) - Limitado estritamente entre 75% e 95% (padrão 85%)
  const [scale, setScale] = useState<number>(DEFAULT_CALC_SCALE);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'calc' | 'history'>('calc');
  const [copied, setCopied] = useState<boolean>(false);

  // Calculator logic state
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [expression, setExpression] = useState<string>('');

  // History state (dados persistidos no localStorage)
  const [history, setHistory] = useState<CalculationRecord[]>(() => getCleanHistory());

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const canDragWindowRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  // Clampa a posição da calculadora para nunca ser arrastada ou ultrapassar os limites da tela
  const clampPosition = useCallback(
    (x: number, y: number, currentScale = scale, minimized = isMinimized) => {
      if (typeof window === 'undefined') return { x, y };

      let width: number;
      let height: number;
      const rect = containerRef.current?.getBoundingClientRect();

      if (rect && rect.width > 0 && currentScale === scale && minimized === isMinimized) {
        width = rect.width;
        height = rect.height;
      } else {
        const baseWidth = minimized ? 200 : 315;
        const baseHeight = minimized ? 44 : 440;
        width = baseWidth * currentScale;
        height = baseHeight * currentScale;
      }

      const minX = 0;
      const minY = 0;
      const maxX = Math.max(0, window.innerWidth - width);
      const maxY = Math.max(0, window.innerHeight - height);

      return {
        x: Math.min(maxX, Math.max(minX, x)),
        y: Math.min(maxY, Math.max(minY, y)),
      };
    },
    [scale, isMinimized]
  );

  // Mantém a calculadora sempre dentro da tela ao redimensionar a janela ou alterar escala/minimização
  useEffect(() => {
    if (!isOpen) return;

    const enforceBounds = () => {
      requestAnimationFrame(() => {
        setPosition((prev) => clampPosition(prev.x, prev.y));
      });
    };

    enforceBounds();
    window.addEventListener('resize', enforceBounds);
    window.addEventListener('orientationchange', enforceBounds);
    return () => {
      window.removeEventListener('resize', enforceBounds);
      window.removeEventListener('orientationchange', enforceBounds);
    };
  }, [isOpen, scale, isMinimized, clampPosition]);

  // Touch & Mouse gesture discrimination: distinguish click/tap vs hold to drag
  const touchStartPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const touchHasMovedRef = useRef<boolean>(false);
  const mouseHasMovedRef = useRef<boolean>(false);
  const DRAG_THRESHOLD = 6; // pixels of movement before treating as a drag

  // Pinch-to-zoom refs
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);

  // Redefine estado temporário de interface/navegação ao abrir novamente
  useEffect(() => {
    if (isOpen) {
      setPosition(getDefaultCalculatorPosition());
      setScale(DEFAULT_CALC_SCALE);
      setIsMinimized(false);
      setActiveTab('calc');
      setDisplay('0');
      setPrevValue(null);
      setOperation(null);
      setOverwrite(true);
      setExpression('');
      setCopied(false);
      setHistory(getCleanHistory());
    }
  }, [isOpen]);

  // Save history to localStorage
  const saveHistory = (items: CalculationRecord[]) => {
    const valid = items.filter((item) => Date.now() - item.timestamp < EXPIRATION_MS);
    setHistory(valid);
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(valid));
    } catch (e) {
      console.error('Erro ao salvar histórico:', e);
    }
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch (e) {
      console.error('Erro ao limpar histórico:', e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  const handleUseHistoryResult = (resultStr: string) => {
    setDisplay(resultStr);
    setOverwrite(true);
    setActiveTab('calc');
  };

  // Safe Math calculation helper
  const calculateResult = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
      case '*':
        return a * b;
      case '÷':
      case '/':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return 'Erro';
    if (!isFinite(num)) return 'Infinito';
    // Format safely to avoid floating precision bugs
    const rounded = parseFloat(num.toPrecision(12));
    return rounded.toString();
  };

  // Numeric and Decimal Button Handlers
  const handleDigit = (digit: string) => {
    if (overwrite || display === '0' || display === 'Erro') {
      setDisplay(digit);
      setOverwrite(false);
    } else {
      if (display.length < 15) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (overwrite || display === 'Erro') {
      setDisplay('0.');
      setOverwrite(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setOverwrite(false);
    }
  };

  const handleOperator = (nextOp: string) => {
    const currentNum = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(currentNum);
      setOperation(nextOp);
      setExpression(`${display} ${nextOp}`);
      setOverwrite(true);
    } else if (operation) {
      if (!overwrite) {
        const res = calculateResult(prevValue, currentNum, operation);
        const formatted = formatNumber(res);
        setDisplay(formatted);
        setPrevValue(res);
        setExpression(`${formatted} ${nextOp}`);
      } else {
        setOperation(nextOp);
        setExpression(`${prevValue} ${nextOp}`);
      }
      setOverwrite(true);
    }
    setOperation(nextOp);
  };

  const handleEquals = () => {
    if (operation === null || prevValue === null) return;

    const currentNum = parseFloat(display);
    const res = calculateResult(prevValue, currentNum, operation);
    const formatted = formatNumber(res);

    const recordExp = `${prevValue} ${operation} ${currentNum}`;
    const newRecord: CalculationRecord = {
      id: `calc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      expression: recordExp,
      result: formatted,
      timestamp: Date.now(),
    };

    setDisplay(formatted);
    setExpression(`${recordExp} =`);
    setPrevValue(null);
    setOperation(null);
    setOverwrite(true);

    if (!isNaN(res) && isFinite(res)) {
      saveHistory([newRecord, ...history]);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setExpression('');
    setOverwrite(true);
  };

  const handleBackspace = () => {
    if (overwrite) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setOverwrite(true);
    }
  };

  const handleToggleSign = () => {
    if (display === '0' || display === 'Erro') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const handlePercentage = () => {
    const currentNum = parseFloat(display);
    if (isNaN(currentNum)) return;

    if (prevValue !== null && operation) {
      // Percentage relative to prevValue (e.g. 200 + 10% = 20)
      const pctValue = (prevValue * currentNum) / 100;
      setDisplay(formatNumber(pctValue));
    } else {
      setDisplay(formatNumber(currentNum / 100));
    }
    setOverwrite(true);
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => {
      const nextScale = Math.min(MAX_CALC_SCALE, parseFloat((prev + 0.1).toFixed(2)));
      setPosition((pos) => clampPosition(pos.x, pos.y, nextScale));
      return nextScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const nextScale = Math.max(MIN_CALC_SCALE, parseFloat((prev - 0.1).toFixed(2)));
      setPosition((pos) => clampPosition(pos.x, pos.y, nextScale));
      return nextScale;
    });
  };

  const handleResetZoom = () => {
    setScale(DEFAULT_CALC_SCALE);
    setPosition((pos) => clampPosition(pos.x, pos.y, DEFAULT_CALC_SCALE));
  };

  // Keyboard shortcut listener for physical keyboards
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input or textarea elsewhere, do not hijack
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+' || e.key === '-') {
        e.preventDefault();
        handleOperator(e.key);
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, display, prevValue, operation, overwrite]);

  // Mouse Drag Events (Permite arrastar até mesmo segurando em cima do teclado numérico)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const target = e.target as HTMLElement;

    // Se o histórico estiver aberto, SÓ permite arrastar pela parte de cima (titlebar ou drag-area do histórico)
    if (activeTab === 'history' && !isMinimized) {
      const isTopDragArea =
        Boolean(target.closest('#calculator-titlebar')) ||
        Boolean(target.closest('#calculator-history-drag-area'));

      if (!isTopDragArea) {
        return;
      }
    }

    mouseHasMovedRef.current = false;
    isDraggingRef.current = false;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      const moveDist = Math.hypot(dx, dy);

      if (!isDraggingRef.current && moveDist > DRAG_THRESHOLD) {
        isDraggingRef.current = true;
        mouseHasMovedRef.current = true;
      }

      if (isDraggingRef.current) {
        const targetX = dragStartRef.current.posX + dx;
        const targetY = dragStartRef.current.posY + dy;
        setPosition(clampPosition(targetX, targetY));
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // Mantém mouseHasMovedRef temporariamente para o createButtonTapHandler diferenciar clique de arrasto
      setTimeout(() => {
        isDraggingRef.current = false;
        mouseHasMovedRef.current = false;
      }, 50);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Touch Drag & Pinch-to-zoom Events across the overlay
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      // 2-finger Pinch to zoom
      canDragWindowRef.current = false;
      isDraggingRef.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scale;
      return;
    }

    if (e.touches.length === 1) {
      const target = e.target as HTMLElement;

      // Se o histórico estiver aberto, SÓ permite arrastar pela parte de cima (titlebar ou drag-area logo acima de "registros expiram...")
      if (activeTab === 'history' && !isMinimized) {
        const isTopDragArea =
          Boolean(target.closest('#calculator-titlebar')) ||
          Boolean(target.closest('#calculator-history-drag-area'));
        const isClickableButton = Boolean(target.closest('button'));

        if (!isTopDragArea || isClickableButton) {
          canDragWindowRef.current = false;
          isDraggingRef.current = false;
          return;
        }
      }

      // Quando estiver exibindo a calculadora (activeTab === 'calc'), o usuário pode arrastar por qualquer parte normalmente (igual antes)
      canDragWindowRef.current = true;
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      touchHasMovedRef.current = false;

      dragStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        posX: position.x,
        posY: position.y,
      };
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Handle 2-finger pinch anywhere on the window (limitado entre 75% e 95%)
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const nextScale = Math.min(MAX_CALC_SCALE, Math.max(MIN_CALC_SCALE, pinchStartScaleRef.current * ratio));
      const roundedScale = parseFloat(nextScale.toFixed(2));
      setScale(roundedScale);
      setPosition((prev) => clampPosition(prev.x, prev.y, roundedScale));
      return;
    }

    // Handle 1-finger drag across permitted surface
    if (e.touches.length === 1) {
      if (!canDragWindowRef.current) {
        // Usuário está deslizando no histórico: a calculadora permanece totalmente estática
        return;
      }

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const moveDist = Math.hypot(
        currentX - touchStartPosRef.current.x,
        currentY - touchStartPosRef.current.y
      );

      // Distinguish tap vs drag
      if (!isDraggingRef.current && moveDist > DRAG_THRESHOLD) {
        isDraggingRef.current = true;
        touchHasMovedRef.current = true;
      }

      if (isDraggingRef.current) {
        const dx = currentX - dragStartRef.current.startX;
        const dy = currentY - dragStartRef.current.startY;

        const targetX = dragStartRef.current.posX + dx;
        const targetY = dragStartRef.current.posY + dy;

        setPosition(clampPosition(targetX, targetY));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchHasMovedRef.current && isDraggingRef.current) {
      // Se moveu significativamente, cancela o click para evitar acionar botão
      e.stopPropagation();
    }
    canDragWindowRef.current = false;
    pinchStartDistRef.current = null;
    setTimeout(() => {
      isDraggingRef.current = false;
      touchHasMovedRef.current = false;
    }, 50);
  };

  // Diferencia clique/toque de segurar para arrastar: só executa a ação se não houve movimento de arrasto
  const createButtonTapHandler = (onClickHandler: () => void) => {
    return (e: React.MouseEvent | React.TouchEvent) => {
      if (touchHasMovedRef.current || mouseHasMovedRef.current || isDraggingRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClickHandler();
    };
  };

  if (!isOpen) return null;

  return (
    <div
      id="floating-calculator-window"
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        touchAction: activeTab === 'history' && !isMinimized ? 'pan-y' : 'none',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed z-[9999] select-none transition-shadow duration-150 animate-in fade-in zoom-in-95 pointer-events-auto ${
        activeTab === 'history' && !isMinimized ? 'cursor-default' : 'touch-none cursor-move'
      }`}
    >
      {/* Minimized Pill Bar View */}
      {isMinimized ? (
        <div
          id="calculator-minimized-pill"
          onMouseDown={handleMouseDown}
          className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3.5 py-2 rounded-full shadow-lg dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-zinc-200/90 dark:border-zinc-800 cursor-grab active:cursor-grabbing backdrop-blur-sm transition-colors"
        >
          <GripHorizontal className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <div className="w-5 h-5 rounded-md bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CalcIcon className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold font-mono tracking-wide">{display}</span>
          <button
            type="button"
            id="btn-calc-restore"
            onClick={createButtonTapHandler(() => setIsMinimized(false))}
            title="Restaurar calculadora"
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            id="btn-calc-close-minimized"
            onClick={createButtonTapHandler(onClose)}
            title="Fechar calculadora"
            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Full Floating Window (Overlay PiP totalmente redimensionável e arrastável) */
        <div className="w-[305px] sm:w-[315px] bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_56px_rgba(0,0,0,0.7)] border border-zinc-200/90 dark:border-zinc-800 flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors">
          {/* Window Header / Drag Bar */}
          <div
            id="calculator-titlebar"
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 cursor-grab active:cursor-grabbing transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
                <CalcIcon className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Calculadora</span>
              {/* Zoom indicator pill */}
              <span className="invisible select-none text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Header Controls: Zoom + History + Minimize + Close */}
            <div className="flex items-center gap-0.5">
              {/* Zoom Out (Mínimo 75%) */}
              <button
                type="button"
                id="btn-calc-zoom-out"
                disabled={scale <= MIN_CALC_SCALE}
                onClick={createButtonTapHandler(handleZoomOut)}
                title={scale <= MIN_CALC_SCALE ? 'Zoom mínimo de 75% atingido' : 'Diminuir zoom (mín 75%)'}
                className={`p-1 rounded-md transition-colors invisible select-none pointer-events-none ${
                  scale <= MIN_CALC_SCALE
                    ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 cursor-pointer'
                }`}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {/* Zoom In (Máximo 95%) */}
              <button
                type="button"
                id="btn-calc-zoom-in"
                disabled={scale >= MAX_CALC_SCALE}
                onClick={createButtonTapHandler(handleZoomIn)}
                title={scale >= MAX_CALC_SCALE ? 'Zoom máximo de 95% atingido' : 'Aumentar zoom (máx 95%)'}
                className={`p-1 rounded-md transition-colors invisible select-none pointer-events-none ${
                  scale >= MAX_CALC_SCALE
                    ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 cursor-pointer'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Reset Zoom */}
              {scale !== DEFAULT_CALC_SCALE && (
                <button
                  type="button"
                  id="btn-calc-reset-zoom"
                  onClick={createButtonTapHandler(handleResetZoom)}
                  title="Restaurar zoom padrão (85%)"
                  className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}

              {/* History Toggle */}
              <button
                type="button"
                id="btn-calc-toggle-history"
                onClick={createButtonTapHandler(() => setActiveTab((prev) => (prev === 'calc' ? 'history' : 'calc')))}
                title={activeTab === 'calc' ? 'Ver histórico de cálculos' : 'Voltar ao teclado'}
                className={`p-1 rounded-md transition-colors cursor-pointer relative ml-0.5 ${
                  activeTab === 'history'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <HistoryIcon className="w-3.5 h-3.5" />
              </button>

              {/* Minimize Window */}
              <button
                type="button"
                id="btn-calc-minimize"
                onClick={createButtonTapHandler(() => setIsMinimized(true))}
                title="Minimizar janela"
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close Window */}
              <button
                type="button"
                id="btn-calc-close"
                onClick={createButtonTapHandler(onClose)}
                title="Fechar calculadora"
                className="p-1 rounded-md text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Content: Calculator vs History */}
          {activeTab === 'history' ? (
            /* History View with Auto-expiration (168h) */
            <div
              id="calculator-history-view"
              style={{ touchAction: 'pan-y' }}
              className="p-3 flex flex-col h-[320px] bg-white dark:bg-zinc-900 transition-colors cursor-default touch-pan-y"
            >
              {/* Header do Histórico: Área de arraste logo acima de "Registros expiram..." */}
              <div
                id="calculator-history-drag-area"
                onMouseDown={handleMouseDown}
                className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-2 cursor-grab active:cursor-grabbing select-none touch-none"
              >
                <div className="flex items-center gap-1.5 pointer-events-none select-none">
                  <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Histórico ({history.length})
                  </span>
                </div>
                {history.length > 0 && (
                  <button
                    type="button"
                    id="btn-calc-clear-history"
                    onClick={createButtonTapHandler(handleClearAllHistory)}
                    title="Excluir todo o histórico"
                    className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpar tudo</span>
                  </button>
                )}
              </div>

              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5 select-none pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Registros expiram e somem sozinhos após 168h (7 dias).</span>
              </div>

              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-400 dark:text-zinc-500 select-none">
                  <HistoryIcon className="w-8 h-8 stroke-1 mb-2 opacity-50" />
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Nenhum cálculo registrado</p>
                  <p className="text-[10px] mt-0.5">Faça operações com "=" para salvar.</p>
                </div>
              ) : (
                <div
                  id="calculator-history-scroll-list"
                  style={{ touchAction: 'pan-y' }}
                  className="flex-1 overflow-y-auto space-y-1.5 pr-1 touch-pan-y overscroll-contain"
                >
                  {history.map((item) => (
                    <div
                      key={item.id}
                      id={`calc-hist-item-${item.id}`}
                      className="group p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-2 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={createButtonTapHandler(() => handleUseHistoryResult(item.result))}
                        title="Clique para utilizar este valor"
                        className="text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                          {item.expression}
                        </div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                          = {item.result}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={createButtonTapHandler(() => handleDeleteHistoryItem(item.id))}
                        title="Excluir este registro"
                        aria-label="Excluir registro"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Keypad & Display View */
            <div id="calculator-keypad-view" className="p-3 flex flex-col gap-2.5 bg-white dark:bg-zinc-900 transition-colors cursor-move">
              {/* Display Area */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col justify-end text-right min-h-[72px] relative group transition-colors">
                {/* Expression / Formula */}
                <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 h-4 overflow-hidden text-ellipsis whitespace-nowrap">
                  {expression || ' '}
                </div>

                {/* Primary Number */}
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <button
                    type="button"
                    id="btn-calc-copy-display"
                    onClick={createButtonTapHandler(handleCopy)}
                    title="Copiar valor"
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div
                    id="display-calc-value"
                    className="text-2xl sm:text-[26px] font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50 overflow-x-auto whitespace-nowrap no-scrollbar"
                  >
                    {display}
                  </div>
                </div>
              </div>

              {/* Grid of Keypad Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {/* Row 1: AC, Backspace, %, ÷ */}
                <button
                  id="btn-calc-clear"
                  type="button"
                  onClick={createButtonTapHandler(handleClear)}
                  className="h-10 rounded-xl font-semibold text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-rose-600 dark:text-rose-400 border border-zinc-200/60 dark:border-zinc-700/50 transition-colors cursor-pointer active:scale-95"
                >
                  AC
                </button>
                <button
                  id="btn-calc-backspace"
                  type="button"
                  onClick={createButtonTapHandler(handleBackspace)}
                  title="Apagar último dígito"
                  className="h-10 rounded-xl font-medium text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/50 transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  DEL
                </button>
                <button
                  id="btn-calc-percent"
                  type="button"
                  onClick={createButtonTapHandler(handlePercentage)}
                  className="h-10 rounded-xl font-medium text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/50 transition-colors cursor-pointer active:scale-95"
                >
                  %
                </button>
                <button
                  id="btn-calc-divide"
                  type="button"
                  onClick={createButtonTapHandler(() => handleOperator('÷'))}
                  className={`h-10 rounded-xl font-semibold text-sm transition-colors cursor-pointer active:scale-95 border ${
                    operation === '÷'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-amber-100/90 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                  }`}
                >
                  ÷
                </button>

                {/* Row 2: 7, 8, 9, × */}
                <button
                  id="btn-calc-7"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('7'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  7
                </button>
                <button
                  id="btn-calc-8"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('8'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  8
                </button>
                <button
                  id="btn-calc-9"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('9'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  9
                </button>
                <button
                  id="btn-calc-multiply"
                  type="button"
                  onClick={createButtonTapHandler(() => handleOperator('×'))}
                  className={`h-10 rounded-xl font-semibold text-sm transition-colors cursor-pointer active:scale-95 border ${
                    operation === '×'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-amber-100/90 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                  }`}
                >
                  ×
                </button>

                {/* Row 3: 4, 5, 6, - */}
                <button
                  id="btn-calc-4"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('4'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  4
                </button>
                <button
                  id="btn-calc-5"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('5'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  5
                </button>
                <button
                  id="btn-calc-6"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('6'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  6
                </button>
                <button
                  id="btn-calc-subtract"
                  type="button"
                  onClick={createButtonTapHandler(() => handleOperator('-'))}
                  className={`h-10 rounded-xl font-semibold text-sm transition-colors cursor-pointer active:scale-95 border ${
                    operation === '-'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-amber-100/90 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                  }`}
                >
                  −
                </button>

                {/* Row 4: 1, 2, 3, + */}
                <button
                  id="btn-calc-1"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('1'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  1
                </button>
                <button
                  id="btn-calc-2"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('2'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  2
                </button>
                <button
                  id="btn-calc-3"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('3'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  3
                </button>
                <button
                  id="btn-calc-add"
                  type="button"
                  onClick={createButtonTapHandler(() => handleOperator('+'))}
                  className={`h-10 rounded-xl font-semibold text-sm transition-colors cursor-pointer active:scale-95 border ${
                    operation === '+'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-amber-100/90 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                  }`}
                >
                  +
                </button>

                {/* Row 5: +/-, 0, ., = */}
                <button
                  id="btn-calc-sign"
                  type="button"
                  onClick={createButtonTapHandler(handleToggleSign)}
                  className="h-10 rounded-xl font-medium text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer active:scale-95"
                >
                  ±
                </button>
                <button
                  id="btn-calc-0"
                  type="button"
                  onClick={createButtonTapHandler(() => handleDigit('0'))}
                  className="h-10 rounded-xl font-medium text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  0
                </button>
                <button
                  id="btn-calc-decimal"
                  type="button"
                  onClick={createButtonTapHandler(handleDecimal)}
                  className="h-10 rounded-xl font-bold text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer active:scale-95"
                >
                  .
                </button>
                <button
                  id="btn-calc-equals"
                  type="button"
                  onClick={createButtonTapHandler(handleEquals)}
                  className="h-10 rounded-xl font-bold text-base bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  =
                </button>
              </div>

              {/* Quick gestural hint footer */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-medium px-0.5">
                <span className="invisible select-none">Arraste em qualquer lugar para mover</span>
                <span className="invisible select-none">Pinça para zoom</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
