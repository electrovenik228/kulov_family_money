export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer" | "return" | "saving";

export interface Account {
  id: number;
  name: string;
  balance: string;
  currency: string;
  color: string;
  icon: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface Transaction {
  id: number;
  date: string;
  type: TransactionType;
  category: number | null;
  category_name?: string;
  category_color?: string;
  source: string;
  amount: string;
  account: number;
  account_name?: string;
  comment: string;
  payment_method: string;
  transfer_to: number | null;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  progress: number;
  color: string;
  due_date: string | null;
}

export interface Debt {
  id: number;
  type: "owed_by_me" | "owed_to_me";
  person: string;
  amount: string;
  date: string;
  due_date: string | null;
  status: "open" | "paid" | "overdue";
  comment: string;
}

export interface SavingEntry {
  id: number;
  date: string;
  deposit: string;
  withdrawal: string;
  balance: string;
  comment: string;
}

export interface Budget {
  id: number;
  category: number;
  category_name?: string;
  category_color?: string;
  limit: string;
  month: number;
  year: number;
}
