/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RawFinancialNotification, KNOWN_FINANCIAL_APPS } from './notificationBridge.ts';
import { Transaction, TransactionType, CategoryId } from '../types.ts';
import { db } from '../firebase.ts';
import { doc, setDoc } from 'firebase/firestore';

export interface ProcessedFinancialEvent {
  success: boolean;
  isDuplicate?: boolean;
  transaction?: Transaction;
  reason?: string;
  sourceApp: string;
}

// In-memory set of recently processed notification signatures (avoids multi-event floods)
const processedSignatures = new Set<string>();

/**
 * Clean & extract monetary value in Brazilian format (R$ 1.250,50 -> 1250.50)
 */
export function extractBrazilianCurrency(text: string): number | null {
  // Matches: R$ 1.234,56 or R$1234,56 or R$ 42,90 or 42,90
  const match = text.match(/R\$\s?([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2})/i) ||
                text.match(/R\$\s?([0-9]+,[0-9]{2})/i) ||
                text.match(/([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2})\s?reais/i);

  if (!match || !match[1]) return null;

  const cleanStr = match[1].replace(/\./g, '').replace(',', '.');
  const val = parseFloat(cleanStr);
  return isNaN(val) || val <= 0 ? null : Number(val.toFixed(2));
}

/**
 * Intelligent category inference based on Brazilian commercial names & keywords
 */
export function inferCategory(text: string, type: TransactionType): CategoryId {
  const lower = text.toLowerCase();

  if (type === 'income') {
    if (lower.includes('salario') || lower.includes('folha') || lower.includes('empresa')) return 'salario';
    if (lower.includes('ferias')) return 'ferias';
    if (lower.includes('13') || lower.includes('decimo')) return 'decimo_terceiro';
    if (lower.includes('freela') || lower.includes('bico') || lower.includes('servico')) return 'freelance';
    if (lower.includes('rendimento') || lower.includes('dividendo') || lower.includes('cdb')) return 'investimentos';
    return 'outros';
  }

  // Expenses
  if (
    lower.includes('supermercado') ||
    lower.includes('mercado') ||
    lower.includes('padaria') ||
    lower.includes('ifood') ||
    lower.includes('restaurante') ||
    lower.includes('lanchonete') ||
    lower.includes('mcdonald') ||
    lower.includes('burger') ||
    lower.includes('acougue') ||
    lower.includes('hortifruti')
  ) {
    return 'alimentacao';
  }

  if (
    lower.includes('uber') ||
    lower.includes('99') ||
    lower.includes('posto') ||
    lower.includes('combustivel') ||
    lower.includes('gasolina') ||
    lower.includes('etanol') ||
    lower.includes('estacionamento') ||
    lower.includes('pedagio') ||
    lower.includes('metro') ||
    lower.includes('onibus')
  ) {
    return 'transporte';
  }

  if (
    lower.includes('farmacia') ||
    lower.includes('drogaria') ||
    lower.includes('hospital') ||
    lower.includes('consulta') ||
    lower.includes('medico') ||
    lower.includes('dentista') ||
    lower.includes('laboratorio') ||
    lower.includes('exame')
  ) {
    return 'saude';
  }

  if (
    lower.includes('aluguel') ||
    lower.includes('condominio') ||
    lower.includes('enel') ||
    lower.includes('luz') ||
    lower.includes('energia') ||
    lower.includes('agua') ||
    lower.includes('sabesp') ||
    lower.includes('gas') ||
    lower.includes('internet') ||
    lower.includes('claro') ||
    lower.includes('vivo') ||
    lower.includes('tim')
  ) {
    return 'moradia';
  }

  if (
    lower.includes('cinema') ||
    lower.includes('netflix') ||
    lower.includes('spotify') ||
    lower.includes('steam') ||
    lower.includes('playstation') ||
    lower.includes('jogos') ||
    lower.includes('show') ||
    lower.includes('ingresso') ||
    lower.includes('bar ') ||
    lower.includes('choperia')
  ) {
    return 'lazer';
  }

  if (
    lower.includes('curso') ||
    lower.includes('escola') ||
    lower.includes('faculdade') ||
    lower.includes('livro') ||
    lower.includes('udemy') ||
    lower.includes('idiomas')
  ) {
    return 'educacao';
  }

  if (
    lower.includes('amazon') ||
    lower.includes('shopee') ||
    lower.includes('mercado livre') ||
    lower.includes('shein') ||
    lower.includes('roupa') ||
    lower.includes('calcado') ||
    lower.includes('shopping')
  ) {
    return 'compras';
  }

  return 'outros';
}

/**
 * Determine if notification represents income or expense
 */
export function inferTransactionType(text: string): TransactionType {
  const lower = text.toLowerCase();

  // Income keywords
  if (
    lower.includes('recebeu') ||
    lower.includes('recebido') ||
    lower.includes('pix recebido') ||
    lower.includes('transferencia recebida') ||
    lower.includes('deposito recebido') ||
    lower.includes('estorno') ||
    lower.includes('reembolso') ||
    lower.includes('caiu na conta') ||
    lower.includes('credito em conta')
  ) {
    return 'income';
  }

  // Expense keywords
  return 'expense';
}

/**
 * Extracts a concise, human-friendly description from notification text
 */
export function extractCleanDescription(title: string, text: string, sourceName: string): string {
  const combined = `${title} ${text}`.replace(/\s+/g, ' ').trim();

  // Try extracting counterpart after 'de' or 'para' or 'em'
  // e.g. "Pix recebido de João Silva" -> "Pix: João Silva"
  const pixDeMatch = combined.match(/(?:pix recebido|transferencia|recebeu)\s+de\s+([A-Za-zÀ-ÖØ-öø-ÿ0-9\s*._-]+?)(?:\s+pelo|\s+no|\s+via|\.|$)/i);
  if (pixDeMatch && pixDeMatch[1].trim().length > 1) {
    return `Pix de ${pixDeMatch[1].trim()}`;
  }

  const pixParaMatch = combined.match(/(?:pix enviado|transferiu|pagamento)\s+para\s+([A-Za-zÀ-ÖØ-öø-ÿ0-9\s*._-]+?)(?:\s+pelo|\s+no|\s+via|\.|$)/i);
  if (pixParaMatch && pixParaMatch[1].trim().length > 1) {
    return `Pix para ${pixParaMatch[1].trim()}`;
  }

  const compraMatch = combined.match(/(?:compra|aprovada)\s+(?:de\s+R\$\s?[0-9,.]+\s+)?(?:em|no|na)\s+([A-Za-zÀ-ÖØ-öø-ÿ0-9\s*._-]+?)(?:\s+no|\s+cartao|\.|$)/i);
  if (compraMatch && compraMatch[1].trim().length > 1) {
    return `Compra: ${compraMatch[1].trim()}`;
  }

  // Fallback to title or truncated text with Bank Name
  if (title && title.length < 50 && !title.toLowerCase().includes('notificacao')) {
    return `${sourceName}: ${title}`;
  }

  return `${sourceName}: Pagamento`;
}

/**
 * Generate unique fingerprint to prevent duplicate entries
 */
export function generateNotificationFingerprint(
  notificationKey: string,
  amount: number,
  type: string,
  date: string,
  packageName: string
): string {
  // If Android provided a solid key with message ID, use it combined with amount
  if (notificationKey && notificationKey.length > 5) {
    return `key_${packageName}_${notificationKey}_${amount}`;
  }
  return `hash_${packageName}_${date}_${amount}_${type}`;
}

/**
 * Processes a raw notification and stores in Firestore if valid and not duplicate
 */
export async function processAndSaveFinancialNotification(
  userId: string,
  raw: RawFinancialNotification,
  existingTransactions: Transaction[]
): Promise<ProcessedFinancialEvent> {
  const bankDef = KNOWN_FINANCIAL_APPS.find((b) => b.packageName === raw.packageName);
  const sourceApp = bankDef ? bankDef.name : raw.packageName;

  const fullText = `${raw.title} ${raw.text} ${raw.subText || ''}`;
  const amount = extractBrazilianCurrency(fullText);

  if (!amount) {
    return {
      success: false,
      reason: 'Valor monetário não identificado na notificação.',
      sourceApp,
    };
  }

  const type = inferTransactionType(fullText);
  const eventDate = new Date(raw.timestamp || Date.now());
  const dateStr = eventDate.toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. In-memory deduplication check
  const fingerprint = generateNotificationFingerprint(
    raw.notificationKey,
    amount,
    type,
    dateStr,
    raw.packageName
  );

  if (processedSignatures.has(fingerprint)) {
    return {
      success: false,
      isDuplicate: true,
      reason: 'Notificação já processada recentemente (in-memory cache).',
      sourceApp,
    };
  }

  // 2. Strict Firestore deduplication check against existing transactions
  // A transaction is considered duplicate if:
  // - Same date, same amount, same type AND was created in the last 24 hours from same source
  const isDuplicateInDb = existingTransactions.some((t) => {
    const isSameDate = t.date === dateStr;
    const isSameAmount = Math.abs(t.amount - amount) < 0.01;
    const isSameType = t.type === type;
    const isRecent = Math.abs((t.createdAt || 0) - raw.timestamp) < 24 * 60 * 60 * 1000;
    const isSameTag = t.tag === 'Notificação Automática';

    return isSameDate && isSameAmount && isSameType && (isSameTag || isRecent);
  });

  if (isDuplicateInDb) {
    processedSignatures.add(fingerprint);
    return {
      success: false,
      isDuplicate: true,
      reason: 'Transação com mesmo valor, data e tipo já registrada no Firestore.',
      sourceApp,
    };
  }

  const category = inferCategory(fullText, type);
  const description = extractCleanDescription(raw.title, raw.text, sourceApp);
  const txId = `tx_notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const newTransaction: Transaction = {
    id: txId,
    description,
    amount,
    type,
    category,
    date: dateStr,
    status: 'paid', // Instant Pix and card transactions are already paid
    createdAt: Date.now(),
    tag: 'Notificação Automática',
  };

  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await setDoc(txRef, {
      ...newTransaction,
      userId,
      sourceNotification: {
        packageName: raw.packageName,
        app: sourceApp,
        notificationKey: raw.notificationKey,
        rawTimestamp: raw.timestamp,
      },
    });

    processedSignatures.add(fingerprint);

    return {
      success: true,
      transaction: newTransaction,
      sourceApp,
    };
  } catch (err: any) {
    console.error('Erro ao salvar transação de notificação no Firestore:', err);
    return {
      success: false,
      reason: err?.message || 'Falha ao gravar no Firestore.',
      sourceApp,
    };
  }
}
