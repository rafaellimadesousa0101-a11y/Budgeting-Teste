/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, Cloud, CloudOff, CheckCircle2, User as UserIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { AuthModal } from './AuthModal.tsx';

interface UserAuthButtonProps {
  onOpenSettings?: () => void;
  isSketchMode?: boolean;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({ onOpenSettings, isSketchMode }) => {
  const { user, loading, isOnline, isSyncing, logout, authError } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
      <>
        <div className="relative" ref={containerRef}>
          <button
            id="btn-open-auth-modal"
            type="button"
            onClick={() => setShowAuthModal(true)}
            title="Acessar conta para sincronizar dados no Cloud Firestore"
            aria-label="Acessar conta"
            className="flex items-center gap-1.5 py-1 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs group"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Entrar</span>
          </button>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          isSketchMode={isSketchMode}
        />
      </>
    );
  }

  // User is signed in
  const displayName = user.displayName || user.email?.split('@')[0] || (user.isAnonymous ? 'Convidado' : 'Usuário');
  const photoUrl = user.photoURL;

  return (
    <div className="relative" ref={containerRef}>
      <button
        id="btn-user-profile-menu"
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        title={`Conectado como ${displayName} (${user.email || 'Anônimo'})`}
        aria-label="Menu da conta"
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
              ? 'Modo Offline: Alterações salvas localmente'
              : isSyncing
              ? 'Sincronizando com Firestore...'
              : 'Sincronizado na Nuvem'
          }
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          className={`absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-2 text-xs animate-in fade-in-50 zoom-in-95 duration-100 ${
            isSketchMode ? 'font-mono' : ''
          }`}
        >
          {/* User Info Header */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl mb-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {user.email || 'Convidado (Anônimo)'}
              </p>
            </div>
          </div>

          {/* Sync status row */}
          <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Status da Nuvem</span>
            <div className="flex items-center gap-1.5 font-medium">
              {isOnline ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Sincronizado</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Offline</span>
                </>
              )}
            </div>
          </div>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

          {/* Settings shortcut */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onOpenSettings();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-2"
            >
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Configurações do Perfil</span>
            </button>
          )}

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full text-left px-2.5 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex items-center gap-2 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Desconectar Conta</span>
          </button>
        </div>
      )}
    </div>
  );
};
