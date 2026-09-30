/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Lock,
  ArrowLeft,
  History,
  Plus,
  Trash2,
  Clock,
  MessageSquare,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Transaction, SavingBox, AiConversation, AiMessage } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import {
  queryFinancialAiAssistant,
  subscribeToAiConversations,
  saveAiConversation,
  deleteAiConversation,
  clearAllAiConversations,
} from '../firebase.ts';

interface FinancialAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  savingBoxes: SavingBox[];
  initialBalance: number;
  monthlyRenda?: Record<string, number>;
  selectedMonth: string;
  isSketchMode?: boolean;
}

const SUGGESTIONS = [
  'Qual é o meu resumo financeiro do mês?',
  'Quanto ainda tenho livre para gastar no mês?',
  'Quais contas previstas estão reservadas no saldo?',
  'Quais são minhas maiores categorias de despesas?',
  'Como está o progresso das minhas caixinhas?',
  'Dicas práticas para economizar com base nos meus gastos',
];

const INITIAL_WELCOME_MESSAGE: AiMessage = {
  id: 'welcome',
  sender: 'assistant',
  text: 'Olá! Sou seu **Assistente Financeiro Inteligente**. Estou conectado diretamente aos seus registros do **Cloud Firestore** para analisar receitas, despesas, contas a pagar, economias e metas com total privacidade. Como posso ajudar nas suas finanças hoje?',
  timestamp: Date.now(),
};

function formatConversationDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Hoje às ${timeStr}`;
  if (isYesterday) return `Ontem às ${timeStr}`;
  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${timeStr}`;
}

export const FinancialAiModal: React.FC<FinancialAiModalProps> = ({
  isOpen,
  onClose,
  transactions,
  savingBoxes,
  initialBalance,
  monthlyRenda,
  selectedMonth,
  isSketchMode = false,
}) => {
  const { user, loginWithGoogle } = useAuth();

  // Chat conversation state
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [remainingQueries, setRemainingQueries] = useState<number | null>(null);

  // History state
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time conversation history in Firestore
  useEffect(() => {
    if (!user?.uid || !isOpen) return;

    const unsubscribe = subscribeToAiConversations(user.uid, (data) => {
      setConversations(data);
    });

    return () => unsubscribe();
  }, [user?.uid, isOpen]);

  // Freeze main background completely (static & without scrolling)
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalTouchAction;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close modal or history drawer
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isHistoryOpen) {
          setIsHistoryOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, isHistoryOpen, onClose]);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && user && !isHistoryOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, user, isHistoryOpen]);

  // Start a fresh conversation thread
  const handleStartNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        timestamp: Date.now(),
      },
    ]);
    setInput('');
    setErrorMessage(null);
    setLastFailedPrompt(null);
    setIsHistoryOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Load a past conversation from history
  const handleSelectConversation = (conv: AiConversation) => {
    setCurrentConversationId(conv.id);
    setMessages(conv.messages && conv.messages.length > 0 ? conv.messages : [INITIAL_WELCOME_MESSAGE]);
    setErrorMessage(null);
    setLastFailedPrompt(null);
    setIsHistoryOpen(false);
  };

  // Delete an individual conversation
  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!user?.uid) return;
    try {
      await deleteAiConversation(user.uid, convId);
      if (currentConversationId === convId) {
        handleStartNewConversation();
      }
    } catch (err) {
      console.error('Erro ao deletar conversa:', err);
    }
  };

  // Clear all conversations history
  const handleClearAllHistory = async () => {
    if (!user?.uid) return;
    if (window.confirm('Tem certeza que deseja apagar todo o histórico de conversas do assistente?')) {
      try {
        await clearAllAiConversations(user.uid);
        handleStartNewConversation();
      } catch (err) {
        console.error('Erro ao limpar histórico:', err);
      }
    }
  };

  // Send question to Gemini AI Assistant
  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    if (!user) {
      setErrorMessage('Por favor, faça login com sua conta Google para consultar o assistente de IA.');
      return;
    }

    const userMessage: AiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);
    setLastFailedPrompt(null);

    try {
      const response = await queryFinancialAiAssistant({
        prompt: promptText,
        transactions,
        savingBoxes,
        initialBalance,
        monthlyRenda,
        selectedMonth,
      });

      if (typeof response.remaining === 'number') {
        setRemainingQueries(response.remaining);
      }

      const assistantMessage: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: Date.now(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Persist conversation to Firestore
      const convId = currentConversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      if (!currentConversationId) {
        setCurrentConversationId(convId);
      }

      const existingConv = conversations.find((c) => c.id === convId);
      const title =
        existingConv?.title ||
        (promptText.length > 45 ? `${promptText.slice(0, 45)}...` : promptText);

      const convRecord: AiConversation = {
        id: convId,
        userId: user.uid,
        title,
        lastMessage: response.answer.slice(0, 160),
        messages: finalMessages,
        createdAt: existingConv?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await saveAiConversation(user.uid, convRecord);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar consulta com o assistente.');
      setLastFailedPrompt(promptText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter conversations for history search
  const filteredConversations = useMemo(() => {
    if (!historySearch.trim()) return conversations;
    const q = historySearch.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  }, [conversations, historySearch]);

  if (!isOpen) return null;

  return (
    <div
      id="fullscreen-financial-ai-container"
      className={`fixed inset-0 z-50 w-screen h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden animate-in fade-in duration-200 ${
        isSketchMode ? 'font-mono' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
    >
      {/* Top Header Bar */}
      <header className="w-full shrink-0 border-b border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 sm:px-6 py-3 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 -ml-1 sm:hidden rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Voltar"
              aria-label="Voltar para a tela principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  id="ai-assistant-title"
                  className="text-sm sm:text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate"
                >
                  Assistente IA Financeiro
                </h1>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300/60 dark:border-emerald-800/80">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Isolamento estrito por UID • Histórico no Firestore</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* History Toggle Button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className={`py-1.5 px-3 rounded-xl transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                isHistoryOpen
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700'
              }`}
              title="Histórico de conversas salvas"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
              {conversations.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isHistoryOpen
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {conversations.length}
                </span>
              )}
            </button>

            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleStartNewConversation}
              className="py-1.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title="Iniciar uma nova conversa limpa"
            >
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Nova conversa</span>
            </button>

            {/* Remaining queries badge */}
            {remainingQueries !== null && (
              <span className="text-[11px] sm:text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 hidden lg:inline-flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{remainingQueries} consultas</span>
              </span>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 sm:px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ml-1"
              title="Fechar chat (Esc)"
              aria-label="Fechar assistente"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Fechar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Auth Warning if not signed in */}
      {!user && (
        <div className="w-full shrink-0 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-900/60 px-4 py-3 z-10">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Para salvar seu histórico de conversas e carregar dados com privacidade, faça login com sua conta Google.
              </span>
            </div>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="py-1.5 px-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Entrar com Google</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area (History Drawer + Chat Stream) */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* History Sidebar / Drawer */}
        {isHistoryOpen && (
          <aside
            className="absolute inset-y-0 left-0 z-30 w-full sm:w-80 md:w-88 bg-white dark:bg-zinc-900 border-r border-zinc-200/90 dark:border-zinc-800 flex flex-col shadow-2xl sm:shadow-lg transition-transform animate-in slide-in-from-left duration-200"
            aria-label="Painel de Histórico de Conversas"
          >
            {/* History Header */}
            <div className="p-4 border-b border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between gap-2 bg-zinc-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Histórico de Conversas
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                  {conversations.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Fechar painel de histórico"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions & Search */}
            <div className="p-3 space-y-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/30">
              <button
                type="button"
                onClick={handleStartNewConversation}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Iniciar nova conversa</span>
              </button>

              {conversations.length > 2 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Pesquisar conversas..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y-0">
              {filteredConversations.length === 0 ? (
                <div className="py-12 px-4 text-center text-zinc-400 dark:text-zinc-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs">
                    {historySearch
                      ? 'Nenhuma conversa encontrada para sua busca.'
                      : 'Nenhuma conversa salva ainda. As perguntas que você fizer serão gravadas automaticamente aqui.'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isCurrent = conv.id === currentConversationId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`group w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-start justify-between gap-2.5 relative border ${
                        isCurrent
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-2xs'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border-transparent text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                            }`}
                          />
                          <h3 className="text-xs font-semibold truncate leading-tight">
                            {conv.title || 'Conversa sem título'}
                          </h3>
                        </div>

                        {conv.lastMessage && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {conv.lastMessage}
                          </p>
                        )}

                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatConversationDate(conv.updatedAt || conv.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer flex-shrink-0"
                        title="Excluir esta conversa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* History Footer Actions */}
            {conversations.length > 0 && (
              <div className="p-3 border-t border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar todo histórico</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Fechar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Main Conversation Stream */}
        <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
          <div className="flex-1 overflow-y-auto w-full overscroll-contain">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs border border-emerald-500/20">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed text-xs sm:text-sm shadow-2xs ${
                        isUser
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-xs font-normal'
                          : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-bl-xs border border-zinc-200/90 dark:border-zinc-800 whitespace-pre-wrap'
                      }`}
                    >
                      {m.text}
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0 mt-0.5 border border-zinc-300/80 dark:border-zinc-700">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 justify-start items-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="animate-pulse">Analisando seus dados financeiros no Firestore com o Gemini...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                  {lastFailedPrompt && (
                    <button
                      type="button"
                      onClick={() => handleSend(lastFailedPrompt)}
                      className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto shadow-2xs text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tentar novamente</span>
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Sticky Action & Input Dock */}
          <footer className="w-full shrink-0 border-t border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 sm:px-6 py-3 sm:py-4 z-10 shadow-lg">
            <div className="max-w-4xl mx-auto space-y-2.5">
              {/* Suggestion Chips */}
              <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 py-0.5">
                <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 flex-shrink-0 mr-1 font-medium">
                  <HelpCircle className="w-3.5 h-3.5" /> Sugestões:
                </span>
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleSend(sug)}
                    disabled={isLoading || !user}
                    className="text-[11px] sm:text-xs py-1 px-3 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex-shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs whitespace-nowrap active:scale-95"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || !user}
                  placeholder={
                    !user
                      ? 'Faça login com sua conta Google para enviar perguntas'
                      : 'Pergunte sobre seus gastos, receitas, contas pendentes ou metas...'
                  }
                  className="flex-1 py-2.5 sm:py-3 px-4 bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200/90 dark:border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-60 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading || !user}
                  title="Enviar pergunta (Enter)"
                  aria-label="Enviar pergunta"
                  className="p-2.5 sm:py-3 sm:px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-sm font-semibold text-xs sm:text-sm shrink-0"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Perguntar</span>
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
