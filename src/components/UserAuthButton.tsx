/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, Cloud, CloudOff, CheckCircle2, User as UserIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface UserAuthButtonProps {
  onOpenSettings?: () => void;
  isSketchMode?: boolean;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({ onOpenSettings, isSketchMode }) => {
  const { user, loading, isOnline, isSyncing, loginWithGoogle, logout, authError } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLoginClick = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      setDropdownOpen(false);
    } catch {
      // Handled in context
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      setDropdownOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-1.5 h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center shadow-2xs" />
    );
  }

  // User is not signed in
  if (!user) {
    return (
      <div className="relative" ref={containerRef}>
        <button
          id="btn-google-login"
          type="button"
          onClick={handleLoginClick}
          disabled={isLoggingIn}
          title="Fazer login com Google para sincronizar dados no Cloud Firestore"
          aria-label="Fazer login com Google"
          className="flex items-center gap-1.5 py-1 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs group"
        >
          {isLoggingIn ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : (
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
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
          )}
          <span className="hidden sm:inline">Entrar</span>
        </button>

        {authError && (
          <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 rounded-lg text-[11px] text-rose-700 dark:text-rose-300 shadow-lg z-50">
            {authError}
          </div>
        )}
      </div>
    );
  }

  // User is signed in
  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';
  const photoUrl = user.photoURL;

  return (
    <div className="relative" ref={containerRef}>
      <button
        id="btn-user-profile-menu"
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        title={`Conectado como ${displayName} (${user.email})`}
        aria-label="Menu da conta Google"
        className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-2xs relative"
      >
        <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 relative">
          {photoUrl ? (
            <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Sync / Online Status dot */}
        <span
          className={`w-2 h-2 rounded-full absolute -top-0.5 -right-0.5 border border-white dark:border-zinc-900 ${
            !isOnline
              ? 'bg-amber-500'
              : isSyncing
              ? 'bg-sky-500 animate-spin'
              : 'bg-emerald-500'
          }`}
          title={
            !isOnline
              ? 'Offline - salvando em cache local'
              : isSyncing
              ? 'Sincronizando com Firestore...'
              : 'Sincronizado na nuvem (Firestore)'
          }
        />
      </button>

      {/* Account Popover */}
      {dropdownOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User info */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-zinc-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Cloud Firestore Status */}
          <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              {isOnline ? (
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="text-[11px]">
                {isOnline ? 'Cloud Firestore ativo' : 'Cache Offline ativo'}
              </span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 space-y-1">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenSettings();
                }}
                className="w-full text-left py-1.5 px-2 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Perfil e Configurações</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full text-left py-1.5 px-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da conta Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
