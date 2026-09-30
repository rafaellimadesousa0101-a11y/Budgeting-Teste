/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  KNOWN_FINANCIAL_APPS,
  isNativeAndroidPlatform,
  checkNotificationPermission,
  requestNotificationPermission,
  getMonitoredPackageNames,
  setMonitoredPackageNames,
  dispatchSimulatedNotification,
  RawFinancialNotification,
} from '../services/notificationBridge.ts';

interface FinancialMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSketchMode?: boolean;
}

export const FinancialMonitoringModal: React.FC<FinancialMonitoringModalProps> = ({
  isOpen,
  onClose,
  isSketchMode = false,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState<boolean>(false);
  const [monitoredPackages, setMonitoredPackages] = useState<string[]>([]);
  const [customPackageInput, setCustomPackageInput] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Simulation test state
  const [simBank, setSimBank] = useState<string>('com.nu.production');
  const [simTitle, setSimTitle] = useState<string>('Pix recebido');
  const [simText, setSimText] = useState<string>('Você recebeu um Pix de R$ 150,00 de Maria Oliveira.');

  const isNative = isNativeAndroidPlatform();

  // Load permission and monitored packages on open
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const loadState = async () => {
      setIsCheckingPermission(true);
      try {
        const granted = await checkNotificationPermission();
        if (mounted) setHasPermission(granted);

        const packages = await getMonitoredPackageNames();
        if (mounted) setMonitoredPackages(packages);
      } finally {
        if (mounted) setIsCheckingPermission(false);
      }
    };

    loadState();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const handleRequestPermission = async () => {
    setIsCheckingPermission(true);
    try {
      await requestNotificationPermission();
      // Recheck status after opening settings
      setTimeout(async () => {
        const granted = await checkNotificationPermission();
        setHasPermission(granted);
        setIsCheckingPermission(false);
      }, 1000);
    } catch {
      setIsCheckingPermission(false);
    }
  };

  const handleTogglePackage = async (packageName: string) => {
    let nextList: string[];
    if (monitoredPackages.includes(packageName)) {
      nextList = monitoredPackages.filter((p) => p !== packageName);
    } else {
      nextList = [...monitoredPackages, packageName];
    }
    setMonitoredPackages(nextList);
    await setMonitoredPackageNames(nextList);
  };

  const handleSelectAll = async () => {
    const all = KNOWN_FINANCIAL_APPS.map((a) => a.packageName);
    setMonitoredPackages(all);
    await setMonitoredPackageNames(all);
  };

  const handleDeselectAll = async () => {
    setMonitoredPackages([]);
    await setMonitoredPackageNames([]);
  };

  const handleAddCustomPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = customPackageInput.trim();
    if (!pkg) return;

    if (monitoredPackages.includes(pkg)) {
      setFeedbackMessage({ text: 'Este pacote já está na lista monitorada.', type: 'info' });
      return;
    }

    const nextList = [...monitoredPackages, pkg];
    setMonitoredPackages(nextList);
    await setMonitoredPackageNames(nextList);
    setCustomPackageInput('');
    setFeedbackMessage({ text: `Pacote "${pkg}" adicionado com sucesso.`, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleRunSimulation = (presetTitle?: string, presetText?: string, presetBank?: string) => {
    const bankPkg = presetBank || simBank;
    const title = presetTitle || simTitle;
    const text = presetText || simText;

    const simulated: RawFinancialNotification = {
      packageName: bankPkg,
      title,
      text,
      timestamp: Date.now(),
      notificationKey: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };

    dispatchSimulatedNotification(simulated);
    setFeedbackMessage({
      text: `Notificação enviada para processamento. Verifique suas transações.`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleTestDuplicate = () => {
    const fixedKey = 'test_duplicate_static_key';
    const simulated: RawFinancialNotification = {
      packageName: 'com.nu.production',
      title: 'Compra no débito',
      text: 'Compra aprovada de R$ 35,00 no Supermercado Central.',
      timestamp: Date.now(),
      notificationKey: fixedKey,
    };

    // Dispatch first time
    dispatchSimulatedNotification(simulated);

    // Immediately dispatch second time to test deduplication
    setTimeout(() => {
      dispatchSimulatedNotification({
        ...simulated,
        timestamp: Date.now() + 500,
      });
      setFeedbackMessage({
        text: 'Duas notificações idênticas enviadas! A segunda deve ser barrada pelo motor anti-duplicação.',
        type: 'info',
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh] ${
          isSketchMode ? 'font-mono' : ''
        }`}
      >
        {/* Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Monitoramento de Notificações
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300/60 dark:border-emerald-800/60">
                  {isNative ? 'Android Nativo' : 'Híbrido Web / Dev'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ponte Android NotificationListenerService para leitura automática de Pix e transações
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {feedbackMessage && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 transition-all ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : feedbackMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Section 1: Android Permission */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {hasPermission ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Permissão de Acesso a Notificações
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {hasPermission
                      ? 'Permissão ativa. O serviço nativo pode interceptar transações bancárias.'
                      : 'O Android exige autorização explícita para ler notificações de aplicativos bancários.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isCheckingPermission}
                className={`py-1.5 px-3.5 rounded-xl font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 active:scale-95 shadow-2xs ${
                  hasPermission
                    ? 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {hasPermission ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reverificar</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Conceder no Android</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Financial Apps Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Aplicativos Financeiros Monitorados ({monitoredPackages.length})</span>
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Somente notificações dos pacotes marcados serão analisadas pelo listener.
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-1 text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Marcar todos
                </button>
                <span className="text-zinc-400">•</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2 py-1 text-zinc-500 hover:underline cursor-pointer"
                >
                  Desmarcar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {KNOWN_FINANCIAL_APPS.map((app) => {
                const isSelected = monitoredPackages.includes(app.packageName);
                return (
                  <label
                    key={app.packageName}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
                        : 'bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: app.color }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate leading-tight">{app.name}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono">
                          {app.packageName}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePackage(app.packageName)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            {/* Custom package input */}
            <form onSubmit={handleAddCustomPackage} className="flex gap-2 pt-1">
              <input
                type="text"
                value={customPackageInput}
                onChange={(e) => setCustomPackageInput(e.target.value)}
                placeholder="Adicionar outro pacote (ex: com.cora.app)"
                className="flex-1 py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                disabled={!customPackageInput.trim()}
                className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-medium cursor-pointer transition-all disabled:opacity-40 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </form>
          </div>

          {/* Section 3: Simulator / Testing Bench */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Simulador de Notificações & Teste de Anti-Duplicação</span>
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Teste o motor de extração de valores e prevenção de duplicidades no Firestore.
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleRunSimulation(
                    'Pix recebido',
                    'Você recebeu um Pix de R$ 150,00 de Rafael Lima.',
                    'com.nu.production'
                  )
                }
                className="py-1 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-[11px] text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
              >
                + Pix Recebido R$ 150 (Nubank)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRunSimulation(
                    'Compra no débito',
                    'Compra aprovada de R$ 42,90 em Padaria Central no seu cartão.',
                    'br.com.intermedium'
                  )
                }
                className="py-1 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-[11px] text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
              >
                - Compra Débito R$ 42,90 (Inter)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleRunSimulation(
                    'Transferência Pix enviada',
                    'Pix de R$ 80,00 enviado com sucesso para Posto Ipiranga.',
                    'com.itau'
                  )
                }
                className="py-1 px-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-[11px] text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
              >
                - Pix Enviado R$ 80 (Itaú)
              </button>
              <button
                type="button"
                onClick={handleTestDuplicate}
                className="py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-400/50 hover:bg-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 font-semibold transition-all cursor-pointer shadow-2xs"
                title="Envia duas notificações idênticas simultaneamente para testar a rejeição de duplicidade"
              >
                ⚡ Testar Bloqueio de Duplicidade
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-5 sm:px-6 py-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dados protegidos por segurança nativa e isolamento no Firestore.</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Concluir
          </button>
        </footer>
      </div>
    </div>
  );
};
