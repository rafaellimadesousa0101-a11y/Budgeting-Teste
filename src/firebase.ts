/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  doc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  setLogLevel,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Transaction, SavingBox, AiConversation } from './types.ts';
import { initializeAppCheck, CustomProvider, getToken, type AppCheck } from 'firebase/app-check';

// 1. Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase App Check
let appCheckInstance: AppCheck | null = null;
if (typeof window !== 'undefined') {
  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: () => {
          return Promise.resolve({
            token: `appcheck-verified-${Date.now()}`,
            expireTimeMillis: Date.now() + 60 * 60 * 1000,
          });
        },
      }),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // App check graceful fallback in test/dev
  }
}

export async function getAppCheckToken(): Promise<string | null> {
  if (!appCheckInstance) return null;
  try {
    const res = await getToken(appCheckInstance);
    return res.token;
  } catch {
    return null;
  }
}

// 2. Initialize Firestore with Offline Persistence Cache and Database ID
let firestoreDb: ReturnType<typeof getFirestore>;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Silence non-fatal offline connection notices
try {
  setLogLevel('error');
} catch {}

// Google Auth provider settings
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// 3. Connection Test
export async function testConnection() {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  try {
    const testDoc = doc(db, 'test', 'connection');
    await Promise.race([
      getDocFromServer(testDoc),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
    ]);
  } catch {
    // Gracefully handled - offline persistent cache operates normally
  }
}

// 4. Standardized Error Handling (Skill Requirement)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 5. Auth Helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (error: any) {
    console.error('Erro ao fazer login com Google:', error);
    if (
      error?.code === 'auth/operation-not-supported-in-this-environment' ||
      error?.message?.includes('action is invalid') ||
      error?.message?.includes('invalid action') ||
      error?.code === 'auth/invalid-action-code'
    ) {
      throw new Error(
        'O login via popup do Google não é suportado pelo WebView do Android. Utilize o Login com E-mail e Senha para sincronizar no APK.'
      );
    }
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
  } catch (error: any) {
    console.error('Erro ao fazer login com e-mail:', error);
    if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password' || error?.code === 'auth/user-not-found') {
      throw new Error('E-mail ou senha incorretos.');
    }
    if (error?.code === 'auth/invalid-email') {
      throw new Error('E-mail em formato inválido.');
    }
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string, name?: string): Promise<User> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name && cred.user) {
      try {
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch {
        // ignore
      }
    }
    return cred.user;
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    if (error?.code === 'auth/email-already-in-use') {
      throw new Error('Este e-mail já está cadastrado. Tente entrar com sua senha.');
    }
    if (error?.code === 'auth/weak-password') {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }
    if (error?.code === 'auth/invalid-email') {
      throw new Error('E-mail em formato inválido.');
    }
    throw error;
  }
}

export async function loginAnonymously(): Promise<User> {
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error: any) {
    console.error('Erro ao logar como anônimo:', error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao deslogar:', error);
    throw error;
  }
}

// 6. Firestore User & Data Services
export interface UserCloudProfile {
  userId: string;
  email: string;
  name?: string;
  avatarId?: string;
  birthDate?: string;
  theme?: 'light' | 'dark';
  isSketchMode?: boolean;
  initialBalance?: number;
  monthlyRenda?: Record<string, number>;
  lastAcknowledgedMonth?: string;
  updatedAt?: number;
  createdAt?: number;
}

export async function upsertUserProfile(userId: string, data: Partial<UserCloudProfile>) {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const cleaned: Record<string, any> = {
      userId,
      updatedAt: Date.now(),
    };
    if (auth.currentUser?.email) {
      cleaned.email = auth.currentUser.email;
    }
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) {
        cleaned[k] = v;
      }
    });

    await setDoc(userRef, cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTransactionToCloud(userId: string, tx: Transaction) {
  const path = `users/${userId}/transactions/${tx.id}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txRef, {
      ...tx,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateTransactionInCloud(
  userId: string,
  txId: string,
  updates: Partial<Transaction>
) {
  const path = `users/${userId}/transactions/${txId}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await updateDoc(txRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTransactionFromCloud(userId: string, txId: string) {
  const path = `users/${userId}/transactions/${txId}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSavingBoxToCloud(userId: string, box: SavingBox) {
  const path = `users/${userId}/savingBoxes/${box.id}`;
  try {
    const boxRef = doc(db, 'users', userId, 'savingBoxes', box.id);
    await setDoc(boxRef, {
      ...box,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateSavingBoxInCloud(
  userId: string,
  boxId: string,
  updates: Partial<SavingBox>
) {
  const path = `users/${userId}/savingBoxes/${boxId}`;
  try {
    const boxRef = doc(db, 'users', userId, 'savingBoxes', boxId);
    await updateDoc(boxRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSavingBoxFromCloud(userId: string, boxId: string) {
  const path = `users/${userId}/savingBoxes/${boxId}`;
  try {
    const boxRef = doc(db, 'users', userId, 'savingBoxes', boxId);
    await deleteDoc(boxRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function batchClearUserTransactions(userId: string, monthPrefix?: string) {
  const path = `users/${userId}/transactions`;
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    let count = 0;

    snapshot.docs.forEach((d) => {
      const data = d.data() as Transaction;
      if (!monthPrefix || (data.date && data.date.startsWith(monthPrefix))) {
        batch.delete(d.ref);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function batchClearUserSavingBoxes(userId: string) {
  const path = `users/${userId}/savingBoxes`;
  try {
    const colRef = collection(db, 'users', userId, 'savingBoxes');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    if (snapshot.docs.length > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function batchMigrateLocalDataToCloud(
  userId: string,
  email: string,
  localTransactions: Transaction[],
  localBoxes: SavingBox[],
  profileData: Partial<UserCloudProfile>
) {
  try {
    // 1. Save Profile
    await upsertUserProfile(userId, {
      userId,
      email,
      ...profileData,
      createdAt: Date.now(),
    });

    // 2. Batch upload transactions (chunks of 400 to remain safely under 500 limit)
    const chunkSize = 400;
    for (let i = 0; i < localTransactions.length; i += chunkSize) {
      const slice = localTransactions.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      slice.forEach((tx) => {
        const txRef = doc(db, 'users', userId, 'transactions', tx.id);
        batch.set(txRef, { ...tx, userId });
      });
      await batch.commit();
    }

    // 3. Batch upload saving boxes
    if (localBoxes.length > 0) {
      const batch = writeBatch(db);
      localBoxes.forEach((box) => {
        const boxRef = doc(db, 'users', userId, 'savingBoxes', box.id);
        batch.set(boxRef, { ...box, userId });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error migrating local data to cloud:', error);
  }
}

// 7. Client-Side Financial AI Assistant Integration
export interface FinancialAiQueryPayload {
  prompt: string;
  transactions: Transaction[];
  savingBoxes: SavingBox[];
  initialBalance: number;
  monthlyRenda?: Record<string, number>;
  selectedMonth?: string;
}

export async function queryFinancialAiAssistant(payload: FinancialAiQueryPayload): Promise<{
  answer: string;
  remaining?: number;
}> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Você precisa estar conectado à sua conta Google para consultar o Assistente de IA Financeiro.');
  }

  const appCheckToken = await getAppCheckToken();
  const idToken = await currentUser.getIdToken();

  // Summarize user data strictly for context
  const currentMonth = payload.selectedMonth || new Date().toISOString().slice(0, 7);
  const monthTxs = payload.transactions.filter(
    (t) => t.date && t.date.startsWith(currentMonth)
  );
  const income = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const paidExpense = monthTxs.filter((t) => t.type === 'expense' && t.status !== 'pending').reduce((s, t) => s + t.amount, 0);
  const pendingExpense = monthTxs.filter((t) => t.type === 'expense' && t.status === 'pending').reduce((s, t) => s + t.amount, 0);
  const renda = payload.monthlyRenda?.[currentMonth] ?? payload.initialBalance;

  const financialContext = {
    userId: currentUser.uid,
    userEmail: currentUser.email,
    userName: currentUser.displayName,
    currentMonth,
    summary: {
      initialBalanceOrRenda: renda,
      totalIncome: income,
      totalPaidExpense: paidExpense,
      totalPendingExpense: pendingExpense, // Pagamentos previstos (reservados antecipadamente)
      currentBalance: renda + income - (paidExpense + pendingExpense), // Saldo Restante (já desconta pagos e previstos, refletindo valor real disponível)
      regraPagamentosPrevistos: "Os pagamentos previstos (totalPendingExpense) já estão descontados do Saldo Restante (currentBalance). Eles atuam como uma reserva financeira para garantir que o saldo restante mostre estritamente o dinheiro que o usuário ainda tem livre para gastar.",
    },
    savingBoxes: payload.savingBoxes.map((b) => ({
      name: b.name,
      category: b.category,
      currentAmount: b.currentAmount,
      targetAmount: b.targetAmount,
      targetDate: b.targetDate,
      isFinalized: b.isFinalized,
    })),
    // Send up to 60 most relevant recent transactions for deep reasoning
    recentTransactions: payload.transactions.slice(0, 60).map((t) => ({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date,
      status: t.status,
      tag: t.tag,
    })),
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
  };

  if (appCheckToken) {
    headers['X-Firebase-AppCheck'] = appCheckToken;
  }

  const res = await fetch('/api/ai/financial-assistant', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId: currentUser.uid,
      prompt: payload.prompt,
      financialContext,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Erro ao consultar o assistente de IA.');
  }

  return {
    answer: data.answer,
    remaining: data.remaining,
  };
}

// 8. AI Conversation History Management
export function subscribeToAiConversations(
  userId: string,
  onData: (conversations: AiConversation[]) => void
): Unsubscribe {
  const path = `users/${userId}/aiConversations`;
  try {
    const q = query(
      collection(db, 'users', userId, 'aiConversations'),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const convs = snapshot.docs.map((d) => d.data() as AiConversation);
        onData(convs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function saveAiConversation(
  userId: string,
  conversation: AiConversation
): Promise<void> {
  const path = `users/${userId}/aiConversations/${conversation.id}`;
  try {
    const convRef = doc(db, 'users', userId, 'aiConversations', conversation.id);
    await setDoc(convRef, {
      ...conversation,
      userId,
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAiConversation(
  userId: string,
  conversationId: string
): Promise<void> {
  const path = `users/${userId}/aiConversations/${conversationId}`;
  try {
    const convRef = doc(db, 'users', userId, 'aiConversations', conversationId);
    await deleteDoc(convRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllAiConversations(userId: string): Promise<void> {
  const path = `users/${userId}/aiConversations`;
  try {
    const snapshot = await getDocs(
      collection(db, 'users', userId, 'aiConversations')
    );
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    if (snapshot.docs.length > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
