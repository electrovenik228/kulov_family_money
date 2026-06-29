import type { Account, Budget, Category, Debt, Goal, SavingEntry, Transaction } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api";

type Paginated<T> = { results: T[] };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function emptyRequest(path: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
}

function list<T>(path: string) {
  return request<Paginated<T> | T[]>(path).then((data) => (Array.isArray(data) ? data : data.results));
}

export const api = {
  dashboard: () => request<{
    cards: Record<string, number>;
    recent_transactions: Transaction[];
  }>("/dashboard/"),
  analytics: () => request<{
    monthly: Array<Record<string, number | string>>;
    income_categories: Array<{ name: string; value: number; color: string }>;
    expense_categories: Array<{ name: string; value: number; color: string }>;
  }>("/analytics/"),
  accounts: () => list<Account>("/accounts/"),
  categories: (type?: string) => list<Category>(`/categories/${type ? `?type=${type}` : ""}`),
  transactions: (query = "") => list<Transaction>(`/transactions/${query}`),
  savings: () => list<SavingEntry>("/savings/"),
  debts: () => list<Debt>("/debts/"),
  goals: () => list<Goal>("/goals/"),
  budgets: () => list<Budget>("/budgets/"),
  createTransaction: (payload: Partial<Transaction>) =>
    request<Transaction>("/transactions/", { method: "POST", body: JSON.stringify(payload) }),
  updateTransaction: (id: number, payload: Partial<Transaction>) =>
    request<Transaction>(`/transactions/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteTransaction: (id: number) => emptyRequest(`/transactions/${id}/`, { method: "DELETE" }),
  createCategory: (payload: Partial<Category>) =>
    request<Category>("/categories/", { method: "POST", body: JSON.stringify(payload) }),
  updateCategory: (id: number, payload: Partial<Category>) =>
    request<Category>(`/categories/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteCategory: (id: number) => emptyRequest(`/categories/${id}/`, { method: "DELETE" }),
  createAccount: (payload: Partial<Account>) =>
    request<Account>("/accounts/", { method: "POST", body: JSON.stringify(payload) }),
  updateAccount: (id: number, payload: Partial<Account>) =>
    request<Account>(`/accounts/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAccount: (id: number) => emptyRequest(`/accounts/${id}/`, { method: "DELETE" }),
  createDebt: (payload: Partial<Debt>) => request<Debt>("/debts/", { method: "POST", body: JSON.stringify(payload) }),
  updateDebt: (id: number, payload: Partial<Debt>) =>
    request<Debt>(`/debts/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteDebt: (id: number) => emptyRequest(`/debts/${id}/`, { method: "DELETE" }),
  createGoal: (payload: Partial<Goal>) => request<Goal>("/goals/", { method: "POST", body: JSON.stringify(payload) }),
  updateGoal: (id: number, payload: Partial<Goal>) =>
    request<Goal>(`/goals/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteGoal: (id: number) => emptyRequest(`/goals/${id}/`, { method: "DELETE" }),
  createSaving: (payload: Partial<SavingEntry>) =>
    request<SavingEntry>("/savings/", { method: "POST", body: JSON.stringify(payload) }),
  updateSaving: (id: number, payload: Partial<SavingEntry>) =>
    request<SavingEntry>(`/savings/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteSaving: (id: number) => emptyRequest(`/savings/${id}/`, { method: "DELETE" }),
  createBudget: (payload: Partial<Budget>) => request<Budget>("/budgets/", { method: "POST", body: JSON.stringify(payload) }),
  updateBudget: (id: number, payload: Partial<Budget>) =>
    request<Budget>(`/budgets/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteBudget: (id: number) => emptyRequest(`/budgets/${id}/`, { method: "DELETE" }),
};

export function money(value: number | string | undefined, currency = "KGS") {
  const numberValue = Number(value ?? 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numberValue);
}
