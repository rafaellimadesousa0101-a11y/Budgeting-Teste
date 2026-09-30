/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Smartphone,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSketchMode?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isSketchMode = false }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAnonymously,
    authError,
    clearAuthError,
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  const isNativeApp =
    typeof window !== 'undefined' &&
    Boolean(
      (window as any).Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.hostname === 'localhost'
    );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Por favor, preencha seu e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      setLocalError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || 'Erro durante a autenticação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('unauthorized-domain') || err?.code === 'auth/unauthorized-domain') {
        setLocalError(
          'O domínio "localhost" não está na lista de domínios autorizados do Firebase Console para login com Google. Utilize o login com E-mail e Senha abaixo (ou Convidado) para entrar agora mesmo no APK!'
        );
        setShowDomainHelp(true);
        setTab('login');
      } else {
        setLocalError(msg || 'Erro ao autenticar com o Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    try {
      await loginAnonymously();
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || 'Erro ao entrar como convidado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh] ${
          isSketchMode ? 'font-mono' : ''
        }`}
      >
        {/* Header */}
        <header className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Acessar sua Conta
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sincronize suas finanças no Cloud Firestore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content with scroll if needed */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* APK Banner */}
          {isNativeApp && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <Smartphone className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>Modo Android:</strong> Para sincronizar na nuvem pelo aplicativo, use seu <strong>E-mail e Senha</strong> abaixo.
              </span>
            </div>
          )}

          {/* Tabs: Login / Register */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setLocalError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-bold'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Entrar com E-mail
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setLocalError(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-bold'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {/* Feedback Error */}
          {(localError || authError) && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl flex flex-col gap-1.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{localError || authError}</span>
              </div>

              {showDomainHelp && (
                <div className="mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/60 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1">
                  <p className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Como autorizar o Google no APK (opcional):
                  </p>
                  <p>
                    1. Acesse o <strong>Console do Firebase</strong> &gt; <strong>Authentication</strong>.
                  </p>
                  <p>
                    2. Vá na aba <strong>Configurações</strong> &gt; <strong>Domínios autorizados</strong>.
                  </p>
                  <p>
                    3. Adicione <strong>localhost</strong> e salve.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Seu Nome
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Rafael"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Senha (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : tab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar com E-mail</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar e Conectar</span>
                </>
              )}
            </button>
          </form>

          {/* Anonymous fallback */}
          <div>
            <button
              type="button"
              onClick={handleAnonymousLogin}
              disabled={isSubmitting}
              className="w-full py-2 px-3 border border-dashed border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 rounded-xl text-center text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Entrar como Convidado (acesso imediato sem senha)</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-zinc-400 font-medium uppercase tracking-wider absolute">
              ou
            </span>
          </div>

          {/* Quick Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 border border-zinc-200/90 dark:border-zinc-700 rounded-2xl text-xs font-semibold text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com Google (Web)</span>
          </button>
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 text-[11px] text-zinc-400 text-center flex-shrink-0">
          Dados sincronizados com o Cloud Firestore de forma segura e privada.
        </footer>
      </div>
    </div>
  );
};
