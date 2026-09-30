export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'paid' | 'pending';

export type CategoryId =
  | 'alimentacao'
  | 'moradia'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'compras'
  | 'servicos'
  | 'salario'
  | 'ferias'
  | 'decimo_terceiro'
  | 'investimentos'
  | 'freelance'
  | 'outros';

export interface Category {
  id: CategoryId;
  label: string;
  type: TransactionType | 'both';
  icon: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Stored as positive float, e.g. 120.50
  type: TransactionType;
  category: CategoryId;
  date: string; // ISO string YYYY-MM-DD
  status?: TransactionStatus; // 'pending' = gasto previsto a pagar, 'paid' = efetivado/pago
  createdAt: number;
  tag?: string; // e.g. 'Guardado'
  isSavedBox?: boolean; // indicates saved money allocated to a box
  boxId?: string; // id of the associated saving box
}

export type BoxDeadlineType = 'none' | 'weeks' | 'months' | 'years' | 'date';

export interface SavingBox {
  id: string;
  name: string;
  category: string;
  icon: string;
  currentAmount: number;
  targetAmount?: number;
  deadlineType?: BoxDeadlineType;
  deadlineValue?: number;
  targetDate?: string;
  createdAt: number;
  color?: string;
  isFinalized?: boolean;
  finalizedAt?: number;
}

export type FilterType = 'all' | 'income' | 'expense' | 'pending';

export interface CalculationRecord {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
  messages: AiMessage[];
}

