import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Download,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Inbox,
  PiggyBank,
  Plus,
  Camera,
  Trash2,
  Wallet,
  Cloud,
  CloudOff,
  CheckCircle2,
  LogIn,
  LogOut,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Transaction, SavingBox, FilterType } from '../types.ts';
import { getCategoryById } from '../data/categories.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  compareTransactionsRecentFirst,
  getCurrentMonthString,
  isoToBrDate,
  brDateToIso,
  maskBrDate,
} from '../utils/formatters.ts';
import { getNow } from '../utils/timeTravel.ts';
import {
  AVATARS,
  DefaultEmptyAvatar,
} from '../data/avatars.tsx';
import { AuthModal } from './AuthModal.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  monthlyRenda: Record<string, number>;
  defaultRenda: number;
  onUpdateRenda: (newRenda: number, month?: string) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  boxes: SavingBox[];
  onOpenSavings: () => void;
  onOpenTimeTravel: () => void;
  onExportCSV: () => void;
}

type SettingsView = 'menu' | 'profile' | 'avatar-picker' | 'history-list' | 'history-month';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  monthlyRenda,
  defaultRenda,
  onUpdateRenda,
  selectedMonth,
  onSelectMonth,
  theme,
  onToggleTheme,
  boxes,
  onOpenSavings,
  onOpenTimeTravel,
  onExportCSV,
}) => {
  const [view, setView] = useState<SettingsView>('menu');
  const [viewingMonth, setViewingMonth] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [monthSearchTerm, setMonthSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(4);

  const { user, isOnline, isSyncing, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reinicia a quantidade visível para 4 sempre que mudar de mês, busca, filtro ou visualização
  useEffect(() => {
    setVisibleCount(4);
  }, [viewingMonth, searchTerm, filterType, view]);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView('menu');
      setViewingMonth('');
      setSearchTerm('');
      setMonthSearchTerm('');
      setFilterType('all');
      setVisibleCount(4);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, defaultRenda]);

  // Estado para expandir imagem em tela inteira após pressionar por mais de 500ms
  const [expandedAvatar, setExpandedAvatar] = useState<string | null>(null);
  const [pressingAvatarId, setPressingAvatarId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);
  const isPointerDownRef = useRef(false);

  const startLongPress = (avatarId: string, e?: React.PointerEvent) => {
    isPointerDownRef.current = true;
    isLongPressTriggeredRef.current = false;
    setPressingAvatarId(avatarId);

    if (e && e.currentTarget && typeof e.currentTarget.setPointerCapture === 'function') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      if (isPointerDownRef.current) {
        isLongPressTriggeredRef.current = true;
        setExpandedAvatar(avatarId);
        setPressingAvatarId(null);
      }
    }, 500);
  };

  const handleRelease = useCallback(() => {
    isPointerDownRef.current = false;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setPressingAvatarId(null);
    setExpandedAvatar((curr) => {
      if (curr) {
        isLongPressTriggeredRef.current = true;
        setTimeout(() => {
          isLongPressTriggeredRef.current = false;
        }, 300);
      }
      return null;
    });
  }, []);

  const cancelLongPress = () => {
    handleRelease();
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      setPressingAvatarId(null);
      setExpandedAvatar(null);
      return;
    }

    const onGlobalRelease = () => {
      handleRelease();
    };

    window.addEventListener('pointerup', onGlobalRelease, { passive: true });
    window.addEventListener('pointercancel', onGlobalRelease, { passive: true });
    window.addEventListener('touchend', onGlobalRelease, { passive: true });
    window.addEventListener('touchcancel', onGlobalRelease, { passive: true });
    window.addEventListener('mouseup', onGlobalRelease, { passive: true });

    return () => {
      window.removeEventListener('pointerup', onGlobalRelease);
      window.removeEventListener('pointercancel', onGlobalRelease);
      window.removeEventListener('touchend', onGlobalRelease);
      window.removeEventListener('touchcancel', onGlobalRelease);
      window.removeEventListener('mouseup', onGlobalRelease);
    };
  }, [isOpen, handleRelease]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (expandedAvatar) {
          setExpandedAvatar(null);
        } else if (view === 'avatar-picker') {
          setView('profile');
        } else if (view === 'profile') {
          setView('menu');
        } else if (view === 'history-month') {
          setView('history-list');
        } else if (view === 'history-list') {
          setView('menu');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, view, onClose, expandedAvatar]);

  // Perfil do Usuário com persistência em localStorage
  const [profileName, setProfileName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('budgeting_user_profile_v1');
      if (saved) return JSON.parse(saved).name || '';
    } catch {}
    return '';
  });

  const [profileBirthDate, setProfileBirthDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('budgeting_user_profile_v1');
      if (saved) return JSON.parse(saved).birthDate || '';
    } catch {}
    return '';
  });

  const [profileBirthDateInput, setProfileBirthDateInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('budgeting_user_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.birthDateInput) return parsed.birthDateInput;
        if (parsed.birthDate) return isoToBrDate(parsed.birthDate);
      }
    } catch {}
    return '';
  });

  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('budgeting_user_profile_v1');
      if (saved) return JSON.parse(saved).avatarId ?? null;
    } catch {}
    return null;
  });

  // Opção para remover foto de perfil ao pressionar por 500ms
  const [showRemovePhotoOption, setShowRemovePhotoOption] = useState(false);
  const removePhotoOptionRef = useRef<HTMLDivElement>(null);
  const profileLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProfileLongPressRef = useRef(false);
  const [isPressingProfile, setIsPressingProfile] = useState(false);

  useEffect(() => {
    if (!isOpen || view !== 'profile' || !selectedAvatarId) {
      setShowRemovePhotoOption(false);
      if (profileLongPressTimerRef.current) {
        clearTimeout(profileLongPressTimerRef.current);
        profileLongPressTimerRef.current = null;
      }
      setIsPressingProfile(false);
    }
  }, [isOpen, view, selectedAvatarId]);

  // Fecha a opção de remover foto se o usuário clicar fora dela
  useEffect(() => {
    if (!showRemovePhotoOption) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        removePhotoOptionRef.current &&
        !removePhotoOptionRef.current.contains(e.target as Node)
      ) {
        setShowRemovePhotoOption(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 20);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showRemovePhotoOption]);

  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const birthDatePickerRef = useRef<HTMLInputElement>(null);

  // Sincroniza dados do perfil com o localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'budgeting_user_profile_v1',
        JSON.stringify({
          name: profileName,
          birthDate: profileBirthDate,
          birthDateInput: profileBirthDateInput,
          avatarId: selectedAvatarId,
        })
      );
    } catch (e) {
      console.error('Erro ao salvar dados do perfil no localStorage', e);
    }
  }, [profileName, profileBirthDate, profileBirthDateInput, selectedAvatarId]);

  const maxBirthDateIso = useMemo(() => {
    const now = getNow();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const handleBirthDateChange = (val: string) => {
    const masked = maskBrDate(val);
    setProfileBirthDateInput(masked);
    const clean = masked.replace(/\D/g, '');
    if (clean.length === 8) {
      const iso = brDateToIso(masked);
      if (!iso) {
        setBirthDateError('Data inválida.');
        setProfileBirthDate('');
      } else if (iso > maxBirthDateIso) {
        setBirthDateError('Data de nascimento não pode ser futura.');
        setProfileBirthDate('');
      } else {
        setBirthDateError(null);
        setProfileBirthDate(iso);
      }
    } else {
      setProfileBirthDate('');
      if (clean.length === 0) {
        setBirthDateError(null);
      }
    }
  };

  const handleNativeBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    if (!iso) return;
    if (iso > maxBirthDateIso) {
      setBirthDateError('Data de nascimento não pode ser futura.');
      return;
    }
    setProfileBirthDate(iso);
    setProfileBirthDateInput(isoToBrDate(iso));
    setBirthDateError(null);
  };

  // Lock body scroll
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

  // Agrupa todos os meses registrados no histórico (excluindo o mês corrente)
  const allMonths = useMemo(() => {
    const set = new Set<string>();
    const currentMonth = getCurrentMonthString();

    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        const monthKey = t.date.slice(0, 7);
        if (monthKey !== currentMonth) {
          set.add(monthKey);
        }
      }
    });

    Object.keys(monthlyRenda).forEach((m) => {
      if (m.length >= 7 && m !== currentMonth) {
        set.add(m.slice(0, 7));
      }
    });

    return Array.from(set).sort().reverse();
  }, [transactions, monthlyRenda]);

  // Lista de meses filtrados pela barra de pesquisa do Histórico Geral
  const filteredMonths = useMemo(() => {
    if (allMonths.length < 10 || !monthSearchTerm.trim()) return allMonths;
    const term = monthSearchTerm.toLowerCase().trim();
    return allMonths.filter((m) => {
      const formatted = formatMonthYear(m).toLowerCase();
      return formatted.includes(term) || m.includes(term);
    });
  }, [allMonths, monthSearchTerm]);

  // Métricas do mês selecionado para visualização no Histórico Geral
  const viewingMonthData = useMemo(() => {
    if (!viewingMonth) return null;

    // Todas as contas do mês anterior são consideradas pagas e figuram como Saídas efetivas
    const monthTxs = transactions
      .filter((t) => t.date && t.date.startsWith(viewingMonth))
      .map((t) => (t.status === 'pending' ? { ...t, status: 'paid' as const } : t))
      .sort(compareTransactionsRecentFirst);

    const income = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const paidExpense = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const renda = monthlyRenda[viewingMonth] ?? defaultRenda;
    const remainingBalance = renda + income - paidExpense;

    // Filtra transações pelo termo de busca e tipo (Todas, Entradas, Saídas)
    const filteredTxs = monthTxs.filter((t) => {
      let matchesType = true;
      if (filterType === 'income') matchesType = t.type === 'income';
      else if (filterType === 'expense') matchesType = t.type === 'expense';

      const term = searchTerm.trim().toLowerCase();
      if (!term) return matchesType;

      const descMatch = t.description.toLowerCase().includes(term);
      const catMatch = getCategoryById(t.category).label.toLowerCase().includes(term);
      const amountMatch = t.amount.toString().includes(term) || t.amount.toFixed(2).replace('.', ',').includes(term);
      return matchesType && (descMatch || catMatch || amountMatch);
    });

    return {
      monthStr: viewingMonth,
      monthTitle: formatMonthYear(viewingMonth),
      transactions: monthTxs,
      filteredTransactions: filteredTxs,
      income,
      paidExpense,
      renda,
      remainingBalance,
    };
  }, [viewingMonth, transactions, monthlyRenda, defaultRenda, filterType, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      id="modal-settings-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        id="modal-settings-card"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 cursor-default"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal com navegação entre views */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {view !== 'menu' && (
              <button
                type="button"
                onClick={() => {
                  if (view === 'avatar-picker') {
                    setView('profile');
                  } else if (view === 'profile') {
                    setView('menu');
                  } else if (view === 'history-month') {
                    setView('history-list');
                    setViewingMonth('');
                  } else {
                    setView('menu');
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                title="Voltar"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2
                id="settings-title"
                className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100"
              >
                {view === 'menu' && 'Configurações'}
                {view === 'profile' && 'Perfil'}
                {view === 'avatar-picker' && 'Escolha seu avatar'}
                {view === 'history-list' && 'Histórico Geral'}
                {view === 'history-month' && viewingMonthData?.monthTitle}
              </h2>
            </div>
          </div>

          {view === 'menu' && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Fechar"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: MENU PRINCIPAL DE CONFIGURAÇÕES                        */}
        {/* ============================================================== */}
        {view === 'menu' && (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* Opção: PERFIL (exatamente acima de Histórico Geral) */}
            <div>
              <button
                type="button"
                id="card-settings-profile"
                onClick={() => setView('profile')}
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors cursor-pointer p-0 bg-transparent border-none text-left"
              >
                Perfil
              </button>
            </div>

            {/* Opção: HISTÓRICO GERAL (somente o nome clicável, sem card/contêiner) */}
            <div>
              <button
                type="button"
                id="card-settings-general-history"
                onClick={() => setView('history-list')}
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors cursor-pointer p-0 bg-transparent border-none text-left"
              >
                Histórico Geral
              </button>
            </div>

            {/* Nuvem & Conta Google Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    user
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {user ? (
                    isOnline ? (
                      <Cloud className="w-4 h-4" />
                    ) : (
                      <CloudOff className="w-4 h-4 text-amber-500" />
                    )
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user ? 'Cloud Firestore Sincronizado' : 'Backup na Nuvem (Firebase)'}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user
                      ? `${user.email} (${isOnline ? 'Online' : 'Offline - cache local'})`
                      : 'Faça login com Google para sincronizar seus dados'}
                  </p>
                </div>
              </div>
              <div>
                {user ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await logout();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="py-1 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors cursor-pointer"
                  >
                    Sair
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Entrar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Exportar Dados para CSV */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onExportCSV}
                className="w-full py-2.5 px-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar todas as movimentações para planilha CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: LISTAGEM DE MESES E ANOS (HISTÓRICO GERAL)            */}
        {/* ============================================================== */}
        {view === 'history-list' && (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* Barra de Pesquisa de Mês e Ano - exibida apenas com 10 ou mais opções */}
            {allMonths.length >= 10 && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={monthSearchTerm}
                  onChange={(e) => setMonthSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-9 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
                />
                {monthSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setMonthSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    title="Limpar pesquisa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {filteredMonths.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 py-3 text-center">
                  {monthSearchTerm.trim()
                    ? 'Nenhum mês ou ano encontrado.'
                    : 'Nenhum mês anterior registrado no histórico.'}
                </p>
              ) : (
                filteredMonths.map((m) => (
                  <div key={m}>
                    <button
                      type="button"
                      onClick={() => {
                        setViewingMonth(m);
                        setView('history-month');
                        setSearchTerm('');
                        setFilterType('all');
                      }}
                      className="text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors cursor-pointer p-0 bg-transparent border-none text-left"
                    >
                      {formatMonthYear(m)}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: HISTÓRICO DETALHADO DO MÊS ESPECÍFICO                 */}
        {/* ============================================================== */}
        {view === 'history-month' && viewingMonthData && (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* Grid de Resumo do Mês */}
            {(() => {
              const totalBudget = viewingMonthData.renda + viewingMonthData.income;
              const totalExpense = viewingMonthData.paidExpense;
              const baseTotal = totalBudget > 0 ? totalBudget : totalExpense;

              const rendaPercent =
                baseTotal > 0
                  ? ((viewingMonthData.renda / baseTotal) * 100).toFixed(1)
                  : '0.0';
              const incomePercent =
                baseTotal > 0
                  ? ((viewingMonthData.income / baseTotal) * 100).toFixed(1)
                  : '0.0';
              const expensePercent =
                baseTotal > 0
                  ? ((viewingMonthData.paidExpense / baseTotal) * 100).toFixed(1)
                  : '0.0';
              const balancePercent =
                baseTotal > 0
                  ? viewingMonthData.remainingBalance > 0
                    ? ((viewingMonthData.remainingBalance / baseTotal) * 100).toFixed(1)
                    : '0.0'
                  : '0.0';

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                        Renda
                      </span>
                      <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                        {rendaPercent}%
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                      {formatCurrency(viewingMonthData.renda)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#3b6790]/[0.07] dark:bg-[#3b6790]/15 border border-[#3b6790]/20 dark:border-[#3b6790]/30">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-medium text-[#2d5275] dark:text-[#88b0d8] uppercase tracking-wider block">
                        Entradas
                      </span>
                      <span className="text-[10px] font-medium text-[#2d5275]/70 dark:text-[#88b0d8]/70">
                        {incomePercent}%
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                      {formatCurrency(viewingMonthData.income)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#e06a55]/[0.07] dark:bg-[#e06a55]/15 border border-[#e06a55]/20 dark:border-[#e06a55]/30">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-medium text-[#b54a37] dark:text-[#f09a89] uppercase tracking-wider block">
                        Saídas + Caixas
                      </span>
                      <span className="text-[10px] font-medium text-[#b54a37]/70 dark:text-[#f09a89]/70">
                        {expensePercent}%
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                      {formatCurrency(viewingMonthData.paidExpense)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/[0.08] dark:bg-emerald-500/15 border border-emerald-500/25 dark:border-emerald-500/35">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                        Saldo Poupado
                      </span>
                      <span className="text-[10px] font-medium text-emerald-700/70 dark:text-emerald-300/70">
                        {balancePercent}%
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 block">
                      {formatCurrency(viewingMonthData.remainingBalance)}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Controles de Busca e Filtro */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar movimentação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 w-full sm:w-64 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`w-full py-1 text-xs text-center rounded-md font-medium transition-colors cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('income')}
                  className={`w-full py-1 text-xs text-center rounded-md font-medium transition-colors cursor-pointer ${
                    filterType === 'income'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  Entradas
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('expense')}
                  className={`w-full py-1 text-xs text-center rounded-md font-medium transition-colors cursor-pointer ${
                    filterType === 'expense'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  Saídas
                </button>
              </div>
            </div>

            {/* Subtítulo indicando quantidade de registros e exibição */}
            {viewingMonthData.filteredTransactions.length > 0 && (
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 px-0.5">
                {viewingMonthData.filteredTransactions.length > 4
                  ? `Exibindo ${Math.min(visibleCount, viewingMonthData.filteredTransactions.length)} de ${viewingMonthData.filteredTransactions.length} movimentações`
                  : `${viewingMonthData.filteredTransactions.length} ${viewingMonthData.filteredTransactions.length === 1 ? 'registro' : 'registros'}`}
              </div>
            )}

            {/* Lista de Transações daquele Mês */}
            {viewingMonthData.filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400 dark:text-zinc-500">
                  <Inbox className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nenhuma movimentação encontrada
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                  {searchTerm || filterType !== 'all'
                    ? 'Tente ajustar os termos de busca ou o filtro selecionado.'
                    : 'Não há registros para o mês selecionado.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {viewingMonthData.filteredTransactions.slice(0, visibleCount).map((item) => {
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

                      {/* Right: Amount */}
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
                      </div>
                    </div>
                  );
                })}

                {/* Botão no canto direito para carregar mais registros (idêntico à tela principal) */}
                {visibleCount < viewingMonthData.filteredTransactions.length && (
                  <div className="pt-2 flex justify-end">
                    <button
                      id="btn-show-more-history-transactions"
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
        )}

        {/* ============================================================== */}
        {/* VIEW: PERFIL DO USUÁRIO                                        */}
        {/* ============================================================== */}
        {view === 'profile' && (
          <div
            className="p-4 sm:p-5 space-y-4 overflow-y-auto"
            onClick={(e) => {
              if (
                showRemovePhotoOption &&
                removePhotoOptionRef.current &&
                !removePhotoOptionRef.current.contains(e.target as Node)
              ) {
                setShowRemovePhotoOption(false);
              }
            }}
          >
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                id="btn-profile-avatar"
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  isProfileLongPressRef.current = false;
                  if (!selectedAvatarId) return;
                  setIsPressingProfile(true);
                  if (profileLongPressTimerRef.current) {
                    clearTimeout(profileLongPressTimerRef.current);
                  }
                  profileLongPressTimerRef.current = setTimeout(() => {
                    isProfileLongPressRef.current = true;
                    setShowRemovePhotoOption(true);
                    setIsPressingProfile(false);
                    try {
                      if ('vibrate' in navigator) {
                        navigator.vibrate(40);
                      }
                    } catch {}
                  }, 500);
                }}
                onPointerUp={() => {
                  setIsPressingProfile(false);
                  if (profileLongPressTimerRef.current) {
                    clearTimeout(profileLongPressTimerRef.current);
                    profileLongPressTimerRef.current = null;
                  }
                }}
                onPointerCancel={() => {
                  setIsPressingProfile(false);
                  if (profileLongPressTimerRef.current) {
                    clearTimeout(profileLongPressTimerRef.current);
                    profileLongPressTimerRef.current = null;
                  }
                }}
                onClick={(e) => {
                  if (isProfileLongPressRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    isProfileLongPressRef.current = false;
                    return;
                  }
                  setView('avatar-picker');
                }}
                className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-zinc-200/90 dark:border-zinc-700/90 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer select-none touch-none hover:scale-105 active:scale-95 focus:outline-none focus:ring-3 focus:ring-emerald-500/20 ${
                  isPressingProfile ? 'scale-105 ring-4 ring-emerald-500/30' : ''
                }`}
                title={selectedAvatarId ? "Toque para escolher um avatar ou segure por 500ms para remover" : "Toque para escolher um avatar"}
                aria-label={selectedAvatarId ? "Foto de perfil. Toque para escolher um avatar ou segure por 500ms para remover" : "Foto de perfil. Toque para escolher um avatar"}
              >
                {selectedAvatarId ? (
                  AVATARS.find((a) => a.id === selectedAvatarId)?.render('w-full h-full') || (
                    <DefaultEmptyAvatar className="w-full h-full" />
                  )
                ) : (
                  <DefaultEmptyAvatar className="w-full h-full" />
                )}

                {/* Overlay no hover com ícone para alterar */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                  <Camera className="w-4 h-4 mb-0.5 text-white drop-shadow-sm" />
                  <span className="text-[9px] font-medium tracking-tight">Alterar</span>
                </div>
              </button>

              {/* Opção para remover avatar após pressionar por 500ms (apenas se houver avatar selecionado) */}
              {showRemovePhotoOption && selectedAvatarId && (
                <div
                  ref={removePhotoOptionRef}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2.5 flex items-center justify-center animate-in fade-in zoom-in-95 duration-150"
                >
                  <button
                    type="button"
                    id="btn-remove-profile-photo"
                    onClick={() => {
                      setSelectedAvatarId(null);
                      setShowRemovePhotoOption(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200/90 dark:border-rose-800/80 rounded-full text-xs font-medium shadow-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover avatar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Campos de Dados Pessoais */}
            <div className="space-y-3.5 max-w-sm mx-auto w-full">
              {/* Campo Nome (logo abaixo da foto de perfil) */}
              <div>
                <label
                  htmlFor="input-profile-name"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1"
                >
                  Nome
                </label>
                <input
                  id="input-profile-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ex: Rafael Lima"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Campo Data de Nascimento (logo abaixo do nome) */}
              <div className="relative">
                <label
                  htmlFor="input-profile-birthdate"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1"
                >
                  Data de Nascimento
                </label>
                <div className="relative">
                  <input
                    id="input-profile-birthdate"
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/aaaa"
                    value={profileBirthDateInput}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    onBlur={() => {
                      const clean = profileBirthDateInput.replace(/\D/g, '');
                      if (clean.length > 0 && clean.length < 8) {
                        setBirthDateError('Data incompleta ou inválida.');
                      }
                    }}
                    className={`w-full pl-3 pr-9 py-2 bg-zinc-50 dark:bg-zinc-800/80 border rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono focus:outline-none focus:ring-2 transition-all ${
                      birthDateError
                        ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-rose-500/10'
                        : 'border-zinc-200/80 dark:border-zinc-700/80 focus:border-emerald-500 focus:ring-emerald-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const picker = birthDatePickerRef.current;
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                    title="Escolher data no calendário"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={birthDatePickerRef}
                    type="date"
                    max={maxBirthDateIso}
                    value={profileBirthDate}
                    onChange={handleNativeBirthDateChange}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 pointer-events-none"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
                {birthDateError && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {birthDateError}
                  </p>
                )}
              </div>

              {/* Conta Google & Sincronização Firestore */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
                  Autenticação & Nuvem
                </label>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${user ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                        {user ? (
                          isOnline ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Cloud className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {user ? user.displayName || user.email : 'Sem conta vinculada'}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {user ? user.email : 'Seus dados estão salvos apenas neste navegador.'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      user ? 'bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {user ? (isOnline ? 'Sincronizado' : 'Offline') : 'Local'}
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{user ? 'Cloud Firestore isolado por UID' : 'Login seguro com Google'}</span>
                    </div>

                    {user ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await logout();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
                      >
                        Desconectar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Acessar / Conectar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: SELEÇÃO DE AVATAR (GRADE DOS 9 AVATARES FIXADOS)         */}
        {/* ============================================================== */}
        {view === 'avatar-picker' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex items-center justify-center min-h-[260px]">
            {/* Grid dos 9 avatares fixados */}
            <div className="grid grid-cols-3 gap-3.5 sm:gap-4 max-w-xs mx-auto place-items-center">
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                const isPressing = pressingAvatarId === avatar.id;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onContextMenu={(e) => e.preventDefault()}
                    onPointerDown={(e) => startLongPress(avatar.id, e)}
                    onPointerUp={(e) => {
                      try {
                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        }
                      } catch {}
                      handleRelease();
                    }}
                    onPointerCancel={(e) => {
                      try {
                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        }
                      } catch {}
                      handleRelease();
                    }}
                    onClick={(e) => {
                      if (isLongPressTriggeredRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        isLongPressTriggeredRef.current = false;
                        return;
                      }
                      setSelectedAvatarId(avatar.id);
                      setView('profile');
                    }}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-200 cursor-pointer select-none touch-none hover:scale-110 active:scale-95 focus:outline-none ${
                      isPressing
                        ? 'scale-125 ring-3 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-lg'
                        : isSelected
                        ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-md scale-105'
                        : 'hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-600 shadow-2xs'
                    }`}
                    aria-label={`Selecionar avatar ${avatar.id}`}
                    title="Toque para selecionar ou segure por 500ms para expandir"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden pointer-events-none select-none">
                      {avatar.render('w-full h-full')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Visualização de avatar expandido em tela inteira (ao pressionar por mais de 500ms) */}
      {expandedAvatar && (
        <div
          id="modal-expanded-avatar-overlay"
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none touch-none cursor-pointer"
          onPointerUp={handleRelease}
          onTouchEnd={handleRelease}
          onMouseUp={handleRelease}
          onClick={handleRelease}
          onContextMenu={(e) => e.preventDefault()}
          role="dialog"
          aria-modal="true"
          aria-label="Avatar expandido em tela inteira"
        >
          {/* Imagem do Avatar expandida ocupando a tela de forma generosa, estática e proporcional */}
          <div
            className="w-[85vw] max-w-[480px] aspect-square rounded-full shadow-2xl overflow-hidden border-4 border-white/25 animate-in zoom-in-95 duration-200 pointer-events-none select-none touch-none"
          >
            {expandedAvatar === 'default' ? (
              <DefaultEmptyAvatar className="w-full h-full" />
            ) : expandedAvatar ? (
              AVATARS.find((a) => a.id === expandedAvatar)?.render('w-full h-full') || (
                <DefaultEmptyAvatar className="w-full h-full" />
              )
            ) : (
              <DefaultEmptyAvatar className="w-full h-full" />
            )}
          </div>
        </div>
      )}

      {/* Modal de Autenticação */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};
