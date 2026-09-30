import { Transaction } from '../types.ts';
import { getNow } from './timeTravel.ts';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseCurrencyInput = (input: string): number => {
  if (!input) return NaN;
  const isNegative = input.trim().startsWith('-');
  const clean = input.replace(/[^0-9.,]/g, '');
  if (!clean) return NaN;

  let val = 0;
  if (clean.includes('.') && clean.includes(',')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      // Brazilian format: 1.250,50
      val = parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    } else {
      // US format: 1,250.50
      val = parseFloat(clean.replace(/,/g, ''));
    }
  } else if (clean.includes(',')) {
    // Format: 1250,50
    val = parseFloat(clean.replace(',', '.'));
  } else {
    // Format: 1250.50 or 1250
    val = parseFloat(clean);
  }

  if (isNaN(val)) return NaN;
  return isNegative ? -Math.abs(val) : val;
};

export const formatDate = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Check if today or yesterday relative to active context (simulated if active, otherwise real)
    const today = getNow();
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month - 1 &&
      today.getDate() === day;

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday =
      yesterday.getFullYear() === year &&
      yesterday.getMonth() === month - 1 &&
      yesterday.getDate() === day;

    if (isToday) return 'Hoje';
    if (isYesterday) return 'Ontem';

    if (year !== today.getFullYear()) {
      return new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatFullDate = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const formatMonthYear = (yearMonth: string): string => {
  try {
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return yearMonth;
  }
};

export const formatDeadlineMonthYear = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-').map(Number);
    const year = parts[0];
    const month = parts[1];
    const months = [
      'Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.',
      'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'
    ];
    if (month >= 1 && month <= 12 && year) {
      return `${months[month - 1]}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const formatShortMonthYear = (yearMonth: string): string => {
  try {
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const monthShort = new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
    }).format(date).replace('.', '');
    const capitalized = monthShort.charAt(0).toUpperCase() + monthShort.slice(1);
    return `${capitalized}. de ${year}`;
  } catch {
    return yearMonth;
  }
};

export const getMonthNameInPortuguese = (monthNum: number): string => {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return months[monthNum - 1] || '';
};

export const getPreviousMonthString = (yearMonth: string): string => {
  try {
    const [year, month] = yearMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    return `${prevYear}-${prevMonth}`;
  } catch {
    return yearMonth;
  }
};

export const getNextMonthString = (yearMonth: string): string => {
  try {
    const [year, month] = yearMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    return `${nextYear}-${nextMonth}`;
  } catch {
    return yearMonth;
  }
};

export const getRealTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getRealCurrentMonthString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getTodayString = (): string => {
  const d = getNow();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthString = (): string => {
  const d = getNow();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getInitialTransactions = (): Transaction[] => {
  return [];
};

export const getTransactionTimestamp = (t: Transaction): number => {
  if (typeof t.createdAt === 'number' && !isNaN(t.createdAt) && t.createdAt > 0) {
    return t.createdAt;
  }
  if (t.id) {
    const match = t.id.match(/\d{10,}/);
    if (match) {
      const parsed = parseInt(match[0], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  if (t.date) {
    const parsedDate = new Date(`${t.date}T12:00:00`).getTime();
    if (!isNaN(parsedDate)) return parsedDate;
  }
  return 0;
};

export const compareTransactionsRecentFirst = (a: Transaction, b: Transaction): number => {
  const dateA = a.date || '';
  const dateB = b.date || '';
  const dateCompare = dateB.localeCompare(dateA);
  if (dateCompare !== 0) return dateCompare;

  const timeA = getTransactionTimestamp(a);
  const timeB = getTransactionTimestamp(b);
  if (timeB !== timeA) return timeB - timeA;

  return (b.id || '').localeCompare(a.id || '');
};

// Converte formato ISO (YYYY-MM-DD ou YYYY-MM) para DD/MM/AAAA
export const isoToBrDate = (iso: string): string => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  if (parts.length === 2) {
    return `01/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return '';
};

// Converte DD/MM/AAAA para formato ISO (YYYY-MM-DD) com validação de calendário
export const brDateToIso = (br: string): string | null => {
  const clean = br.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  const day = clean.substring(0, 2);
  const month = clean.substring(2, 4);
  const year = clean.substring(4, 8);
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (monthNum < 1 || monthNum > 12) return null;
  if (dayNum < 1 || dayNum > 31) return null;
  if (yearNum < 1900 || yearNum > 2100) return null;

  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  if (
    dateObj.getFullYear() !== yearNum ||
    dateObj.getMonth() !== monthNum - 1 ||
    dateObj.getDate() !== dayNum
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
};

// Máscara dinâmica para digitação de DD/MM/AAAA
export const maskBrDate = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};
