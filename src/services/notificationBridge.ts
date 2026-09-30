/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

export interface RawFinancialNotification {
  packageName: string;
  title: string;
  text: string;
  subText?: string;
  timestamp: number;
  notificationKey: string;
}

export interface BankAppDefinition {
  packageName: string;
  name: string;
  shortName: string;
  color: string;
  badge: string;
  isPopular?: boolean;
}

export const KNOWN_FINANCIAL_APPS: BankAppDefinition[] = [
  {
    packageName: 'com.nu.production',
    name: 'Nubank',
    shortName: 'Nu',
    color: '#820ad1',
    badge: 'Roxo',
    isPopular: true,
  },
  {
    packageName: 'br.com.intermedium',
    name: 'Banco Inter',
    shortName: 'Inter',
    color: '#ff7a00',
    badge: 'Laranja',
    isPopular: true,
  },
  {
    packageName: 'com.itau',
    name: 'Itaú Unibanco',
    shortName: 'Itaú',
    color: '#ec7000',
    badge: 'Laranja',
    isPopular: true,
  },
  {
    packageName: 'br.com.bb.android',
    name: 'Banco do Brasil',
    shortName: 'BB',
    color: '#f9d214',
    badge: 'Amarelo',
    isPopular: true,
  },
  {
    packageName: 'com.bradesco',
    name: 'Bradesco',
    shortName: 'Bradesco',
    color: '#cc092f',
    badge: 'Vermelho',
    isPopular: true,
  },
  {
    packageName: 'com.santander.app',
    name: 'Santander Brasil',
    shortName: 'Santander',
    color: '#ea1d25',
    badge: 'Vermelho',
    isPopular: true,
  },
  {
    packageName: 'com.c6bank.app',
    name: 'C6 Bank',
    shortName: 'C6',
    color: '#242424',
    badge: 'Preto',
    isPopular: true,
  },
  {
    packageName: 'com.picpay',
    name: 'PicPay',
    shortName: 'PicPay',
    color: '#11c76f',
    badge: 'Verde',
    isPopular: true,
  },
  {
    packageName: 'com.mercadopago.wallet',
    name: 'Mercado Pago',
    shortName: 'Mercado Pago',
    color: '#00a650',
    badge: 'Azul/Verde',
    isPopular: true,
  },
  {
    packageName: 'br.gov.caixa.tem',
    name: 'Caixa Tem',
    shortName: 'Caixa Tem',
    color: '#005ca9',
    badge: 'Azul',
    isPopular: true,
  },
  {
    packageName: 'br.com.caixa.mobile',
    name: 'Caixa Econômica Federal',
    shortName: 'Caixa',
    color: '#005ca9',
    badge: 'Azul',
  },
  {
    packageName: 'br.com.uol.ps.myaccount',
    name: 'PagBank / PagSeguro',
    shortName: 'PagBank',
    color: '#00c389',
    badge: 'Verde',
  },
];

interface NotificationMonitorPluginType {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ openedSettings: boolean }>;
  getMonitoredApps(): Promise<{ packages: string[] }>;
  setMonitoredApps(options: { packages: string[] }): Promise<{ success: boolean; count: number }>;
  addListener(
    eventName: 'onFinancialNotification',
    listenerFunc: (data: RawFinancialNotification) => void
  ): Promise<{ remove: () => void }>;
}

const NotificationMonitor = registerPlugin<NotificationMonitorPluginType>('NotificationMonitor');

const LOCAL_STORAGE_MONITORED_APPS = 'budgeting_monitored_apps';
const DEFAULT_MONITORED_PACKAGES = [
  'com.nu.production',
  'br.com.intermedium',
  'com.itau',
  'br.com.bb.android',
  'com.picpay',
];

export const isNativeAndroidPlatform = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Check if the user has granted access to read notifications
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (isNativeAndroidPlatform()) {
    try {
      const res = await NotificationMonitor.checkPermission();
      return res.granted;
    } catch (e) {
      console.warn('Erro ao verificar permissão nativa:', e);
      return false;
    }
  }

  // Web fallback simulation
  const sim = localStorage.getItem('budgeting_simulated_permission');
  return sim === 'true';
}

/**
 * Open Android system settings to grant permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isNativeAndroidPlatform()) {
    try {
      const res = await NotificationMonitor.requestPermission();
      return res.openedSettings;
    } catch (e) {
      console.warn('Erro ao solicitar permissão nativa:', e);
      return false;
    }
  }

  // Web fallback simulation
  localStorage.setItem('budgeting_simulated_permission', 'true');
  return true;
}

/**
 * Revoke/reset permission simulation (Web)
 */
export function revokeNotificationPermissionSimulated(): void {
  localStorage.setItem('budgeting_simulated_permission', 'false');
}

/**
 * Retrieve list of monitored package names
 */
export async function getMonitoredPackageNames(): Promise<string[]> {
  if (isNativeAndroidPlatform()) {
    try {
      const res = await NotificationMonitor.getMonitoredApps();
      return res.packages && res.packages.length > 0 ? res.packages : DEFAULT_MONITORED_PACKAGES;
    } catch (e) {
      console.warn('Erro ao obter pacotes monitorados nativos:', e);
    }
  }

  // Web storage fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MONITORED_APPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_MONITORED_PACKAGES;
}

/**
 * Save list of monitored package names
 */
export async function setMonitoredPackageNames(packages: string[]): Promise<boolean> {
  // Always update web localStorage for sync & UI consistency
  try {
    localStorage.setItem(LOCAL_STORAGE_MONITORED_APPS, JSON.stringify(packages));
  } catch {
    // ignore
  }

  if (isNativeAndroidPlatform()) {
    try {
      const res = await NotificationMonitor.setMonitoredApps({ packages });
      return res.success;
    } catch (e) {
      console.warn('Erro ao salvar pacotes monitorados nativos:', e);
      return false;
    }
  }

  return true;
}

// Global subscribers for notifications
type NotificationCallback = (data: RawFinancialNotification) => void;
const listeners = new Set<NotificationCallback>();
let nativeListenerSubscribed = false;

export function addFinancialNotificationListener(callback: NotificationCallback): () => void {
  listeners.add(callback);

  if (isNativeAndroidPlatform() && !nativeListenerSubscribed) {
    nativeListenerSubscribed = true;
    NotificationMonitor.addListener('onFinancialNotification', (data) => {
      listeners.forEach((fn) => fn(data));
    }).catch((err) => {
      console.error('Falha ao registrar listener no plugin NotificationMonitor:', err);
    });
  }

  return () => {
    listeners.delete(callback);
  };
}

/**
 * Dispatches a simulated notification (useful for testing on Web dev environments)
 */
export function dispatchSimulatedNotification(notif: RawFinancialNotification): void {
  listeners.forEach((fn) => fn(notif));
}
