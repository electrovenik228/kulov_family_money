import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Bell,
  CalendarDays,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  SlidersHorizontal,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Layout, type Page } from "./components/Layout";
import { TransactionForm } from "./components/TransactionForm";
import { Button, Card, EmptyState, Field, Modal, ProgressBar, inputClass } from "./components/ui";
import { api, money } from "./lib/api";
import type { Account, Budget, Category, CategoryType, Debt, Goal, SavingEntry, Transaction, TransactionType } from "./lib/types";

const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));

const txLabels = {
  income: "Доход",
  expense: "Расход",
  transfer: "Перевод",
  return: "Возврат",
  saving: "Накопление",
};

type ModalState =
  | { type: "income"; item?: Transaction | null }
  | { type: "expense"; item?: Transaction | null }
  | { type: "category"; item?: Category | null }
  | { type: "account"; item?: Account | null }
  | { type: "debt"; item?: Debt | null }
  | { type: "goal"; item?: Goal | null }
  | { type: "saving"; item?: SavingEntry | null }
  | { type: "budget"; item?: Budget | null }
  | { type: "operation"; item?: Transaction | null }
  | null;

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savings, setSavings] = useState<SavingEntry[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [accountsData, categoriesData, txData, goalsData, debtsData, savingsData, budgetsData, dashboardData, analyticsData] =
      await Promise.all([
        api.accounts(),
        api.categories(),
        api.transactions(query ? `?q=${encodeURIComponent(query)}` : ""),
        api.goals(),
        api.debts(),
        api.savings(),
        api.budgets(),
        api.dashboard(),
        api.analytics(),
      ]);
    setAccounts(accountsData);
    setCategories(categoriesData);
    setTransactions(txData);
    setGoals(goalsData);
    setDebts(debtsData);
    setSavings(savingsData);
    setBudgets(budgetsData);
    setDashboard(dashboardData);
    setAnalytics(analyticsData);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [query]);

  const incomeCategories = categories.filter((category) => category.type === "income");
  const expenseCategories = categories.filter((category) => category.type === "expense");
  const openTransaction = (item: Transaction) => {
    if (item.type === "income" || item.type === "expense") {
      setModal({ type: item.type, item });
      return;
    }
    setModal({ type: "operation", item });
  };

  const pageContent = useMemo(() => {
    if (loading) {
      return <div className="grid min-h-96 place-items-center text-sm font-semibold text-slate-500">Загрузка финансов</div>;
    }
    if (!dashboard) {
      return <EmptyState text="Запустите backend и seed_demo, чтобы увидеть данные." />;
    }
    if (page === "dashboard") {
      return (
        <DashboardPage
          dashboard={dashboard}
          transactions={dashboard.recent_transactions}
          onAddIncome={() => setModal({ type: "income" })}
          onAddExpense={() => setModal({ type: "expense" })}
          onAddTransfer={() => setModal({ type: "operation", item: { type: "transfer" } as Transaction })}
          onEditTransaction={openTransaction}
          onDeleteTransaction={(id) => removeItem(() => api.deleteTransaction(id), load)}
        />
      );
    }
    if (page === "income" || page === "expenses") {
      const type = page === "income" ? "income" : "expense";
      return (
        <TransactionsPage
          title={page === "income" ? "Доходы" : "Расходы"}
          type={type}
          transactions={transactions.filter((tx) => tx.type === type)}
          categories={type === "income" ? incomeCategories : expenseCategories}
          accounts={accounts}
          onAdd={() => setModal({ type })}
          onEdit={(item) => setModal({ type, item })}
          onDelete={(id) => removeItem(() => api.deleteTransaction(id), load)}
        />
      );
    }
    if (page === "analytics") {
      return (
        <Suspense fallback={<div className="grid min-h-96 place-items-center text-sm font-semibold text-slate-500">Загрузка графиков</div>}>
          <AnalyticsPage analytics={analytics} />
        </Suspense>
      );
    }
    if (page === "accounts") {
      return (
        <AccountsPage
          accounts={accounts}
          onAdd={() => setModal({ type: "account" })}
          onEdit={(item) => setModal({ type: "account", item })}
          onDelete={(id) => removeItem(() => api.deleteAccount(id), load)}
        />
      );
    }
    if (page === "goals") {
      return (
        <GoalsPage
          goals={goals}
          onAdd={() => setModal({ type: "goal" })}
          onEdit={(item) => setModal({ type: "goal", item })}
          onDelete={(id) => removeItem(() => api.deleteGoal(id), load)}
        />
      );
    }
    if (page === "savings") {
      return (
        <SavingsPage
          savings={savings}
          onAdd={() => setModal({ type: "saving" })}
          onEdit={(item) => setModal({ type: "saving", item })}
          onDelete={(id) => removeItem(() => api.deleteSaving(id), load)}
        />
      );
    }
    if (page === "debts") {
      return (
        <DebtsPage
          debts={debts}
          onAdd={() => setModal({ type: "debt" })}
          onEdit={(item) => setModal({ type: "debt", item })}
          onDelete={(id) => removeItem(() => api.deleteDebt(id), load)}
        />
      );
    }
    if (page === "calendar") return <CalendarPage transactions={transactions} />;
    if (page === "categories") {
      return (
        <CategoriesPage
          categories={categories}
          onAdd={() => setModal({ type: "category" })}
          onEdit={(item) => setModal({ type: "category", item })}
          onDelete={(id) => removeItem(() => api.deleteCategory(id), load)}
        />
      );
    }
    if (page === "history") {
      return (
        <HistoryPage
          transactions={transactions}
          onEdit={openTransaction}
          onDelete={(id) => removeItem(() => api.deleteTransaction(id), load)}
        />
      );
    }
    return (
      <SettingsPage
        budgets={budgets}
        categories={expenseCategories}
        onAddBudget={() => setModal({ type: "budget" })}
        onEditBudget={(item) => setModal({ type: "budget", item })}
        onDeleteBudget={(id) => removeItem(() => api.deleteBudget(id), load)}
      />
    );
  }, [page, loading, dashboard, analytics, transactions, accounts, categories, goals, debts, savings, budgets]);

  return (
    <>
      <Layout page={page} setPage={setPage} query={query} setQuery={setQuery}>
        {pageContent}
      </Layout>
      <Modal title={modal?.type === "income" && modal.item ? "Редактировать доход" : "Добавить доход"} open={modal?.type === "income"} onClose={() => setModal(null)}>
        <TransactionForm type="income" accounts={accounts} categories={incomeCategories} transaction={modal?.type === "income" ? modal.item : null} onDone={() => afterModal(setModal, load)} />
      </Modal>
      <Modal title={modal?.type === "expense" && modal.item ? "Редактировать расход" : "Добавить расход"} open={modal?.type === "expense"} onClose={() => setModal(null)}>
        <TransactionForm type="expense" accounts={accounts} categories={expenseCategories} transaction={modal?.type === "expense" ? modal.item : null} onDone={() => afterModal(setModal, load)} />
      </Modal>
      <Modal title={modal?.type === "category" && modal.item ? "Редактировать категорию" : "Новая категория"} open={modal?.type === "category"} onClose={() => setModal(null)}>
        <CategoryForm category={modal?.type === "category" ? modal.item : null} onDone={() => afterModal(setModal, load)} />
      </Modal>
      <Modal title={modal?.type === "account" && modal.item ? "Редактировать счет" : "Новый счет"} open={modal?.type === "account"} onClose={() => setModal(null)}>
        <AccountForm account={modal?.type === "account" ? modal.item : null} onDone={() => afterModal(setModal, load)} />
      </Modal>
      <Modal title={modal?.type === "debt" && modal.item ? "Редактировать долг" : "Новый долг"} open={modal?.type === "debt"} onClose={() => setModal(null)}>
        <DebtForm debt={modal?.type === "debt" ? modal.item : null} onDone={() => afterModal(setModal, load)} />
      </Modal>
      <Modal title={modal?.type === "goal" && modal.item ? "Редактировать цель" : "Новая цель"} open={modal?.type === "goal"} onClose={() => setModal(null)}>
        <GoalForm goal={modal?.type === "goal" ? modal.item : null} onDone={() => afterModal(setModal, load)} />
      </Modal>
      <Modal title={modal?.type === "saving" && modal.item ? "Редактировать накопление" : "Новая запись накоплений"} open={modal?.type === "saving"} onClose={() => setModal(null)}>
        <SavingForm saving={modal?.type === "saving" ? modal.item : null} onDone={() => afterModal(setModal, load)} />
      </Modal>
      <Modal title={modal?.type === "budget" && modal.item ? "Редактировать бюджет" : "Новый бюджет"} open={modal?.type === "budget"} onClose={() => setModal(null)}>
        <BudgetForm budget={modal?.type === "budget" ? modal.item : null} categories={expenseCategories} onDone={() => afterModal(setModal, load)} />
      </Modal>
      <Modal title={modal?.type === "operation" && modal.item?.id ? "Редактировать операцию" : "Новая операция"} open={modal?.type === "operation"} onClose={() => setModal(null)}>
        <OperationForm transaction={modal?.type === "operation" ? modal.item : null} accounts={accounts} categories={categories} onDone={() => afterModal(setModal, load)} />
      </Modal>
    </>
  );
}

function afterModal(setModal: (value: null) => void, load: () => Promise<void>) {
  setModal(null);
  load();
}

async function removeItem(remove: () => Promise<void>, load: () => Promise<void>) {
  if (!window.confirm("Удалить запись?")) return;
  await remove();
  await load();
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={onEdit} aria-label="Редактировать">
        <Pencil size={16} />
      </button>
      <button className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-50" onClick={onDelete} aria-label="Удалить">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function DashboardPage({
  dashboard,
  transactions,
  onAddIncome,
  onAddExpense,
  onAddTransfer,
  onEditTransaction,
  onDeleteTransaction,
}: {
  dashboard: any;
  transactions: Transaction[];
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddTransfer: () => void;
  onEditTransaction: (item: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
}) {
  const cards = [
    ["Общий баланс", dashboard.cards.total_balance, "Все счета семьи", "balance"],
    ["Доходы за месяц", dashboard.cards.monthly_income, "Текущий месяц", "income"],
    ["Расходы за месяц", dashboard.cards.monthly_expenses, "Текущий месяц", "expense"],
    ["Экономия", dashboard.cards.savings, "Накопления", "saving"],
    ["Остаток", dashboard.cards.remaining, "Доходы минус расходы", "remaining"],
    ["% расходов", `${dashboard.cards.expense_ratio}%`, "От доходов", "ratio"],
  ];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(([title, value, note, kind]) => (
            <Card key={title} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{title}</p>
                  <p className="mt-3 text-2xl font-extrabold tracking-normal">{typeof value === "number" ? money(value) : value}</p>
                  <p className="mt-2 text-sm text-slate-500">{note}</p>
                </div>
                <div
                  className={`grid h-11 w-11 place-items-center rounded-lg ${
                    kind === "income" ? "bg-emerald-50 text-emerald-700" : kind === "expense" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {kind === "income" ? <TrendingUp size={20} /> : kind === "expense" ? <TrendingDown size={20} /> : <Target size={20} />}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <TransactionTable title="Последние операции" transactions={transactions} compact onEdit={onEditTransaction} onDelete={onDeleteTransaction} />
      </div>
      <Card className="h-fit p-5">
        <h2 className="text-lg font-bold">Быстрые действия</h2>
        <div className="mt-4 grid gap-3">
          <Button onClick={onAddIncome}>
            <TrendingUp size={17} />
            Добавить доход
          </Button>
          <Button variant="secondary" onClick={onAddExpense}>
            <TrendingDown size={17} />
            Добавить расход
          </Button>
          <Button variant="secondary" onClick={onAddTransfer}>
            <ArrowRightLeft size={17} />
            Перевод между счетами
          </Button>
        </div>
        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <Bell size={17} />
            Уведомления
          </div>
          <p className="mt-2">Проверяйте крупные расходы, долги и превышение бюджета в настройках.</p>
        </div>
      </Card>
    </div>
  );
}

function TransactionsPage({
  title,
  type,
  transactions,
  categories,
  accounts,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  type: "income" | "expense";
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onAdd: () => void;
  onEdit: (item: Transaction) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid gap-5">
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <select className={inputClass}>
            <option>Месяц</option>
          </select>
          <select className={inputClass}>
            <option>2026</option>
          </select>
          <select className={inputClass}>
            <option>Все категории</option>
            {categories.map((category) => (
              <option key={category.id}>{category.name}</option>
            ))}
          </select>
          <select className={inputClass}>
            <option>Все счета</option>
            {accounts.map((account) => (
              <option key={account.id}>{account.name}</option>
            ))}
          </select>
          <Button onClick={onAdd}>
            <Plus size={17} />
            {type === "income" ? "Добавить доход" : "Добавить расход"}
          </Button>
        </div>
      </Card>
      <TransactionTable title={title} transactions={transactions} showExport={type === "expense"} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function TransactionTable({
  title,
  transactions,
  compact = false,
  showExport = false,
  onEdit,
  onDelete,
}: {
  title: string;
  transactions: Transaction[];
  compact?: boolean;
  showExport?: boolean;
  onEdit?: (item: Transaction) => void;
  onDelete?: (id: number) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {showExport && (
          <Button variant="secondary">
            <Download size={17} />
            Excel
          </Button>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Дата</th>
              <th className="px-5 py-3">Категория</th>
              {!compact && <th className="px-5 py-3">Источник</th>}
              <th className="px-5 py-3">Сумма</th>
              <th className="px-5 py-3">Счет</th>
              {!compact && <th className="px-5 py-3">Комментарий</th>}
              {!compact && <th className="px-5 py-3">Способ</th>}
              {(onEdit || onDelete) && <th className="px-5 py-3 text-right">Действия</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-600">{tx.date}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold">
                    <span className="h-2 w-2 rounded-full" style={{ background: tx.category_color ?? "#94a3b8" }} />
                    {tx.category_name ?? txLabels[tx.type]}
                  </span>
                </td>
                {!compact && <td className="px-5 py-4 text-slate-600">{tx.source || "-"}</td>}
                <td className={`px-5 py-4 font-extrabold ${tx.type === "expense" ? "text-rose-600" : "text-emerald-600"}`}>
                  {tx.type === "expense" ? "-" : "+"}
                  {money(tx.amount)}
                </td>
                <td className="px-5 py-4 text-slate-600">{tx.account_name}</td>
                {!compact && <td className="max-w-xs truncate px-5 py-4 text-slate-600">{tx.comment || "-"}</td>}
                {!compact && <td className="px-5 py-4 text-slate-600">{tx.payment_method || "-"}</td>}
                {(onEdit || onDelete) && (
                  <td className="px-5 py-4">
                    <RowActions onEdit={() => onEdit?.(tx)} onDelete={() => onDelete?.(tx.id)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AccountsPage({
  accounts,
  onAdd,
  onEdit,
  onDelete,
}: {
  accounts: Account[];
  onAdd: () => void;
  onEdit: (item: Account) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {accounts.map((account) => (
        <Card key={account.id} className="p-5">
          <div className="h-2 w-16 rounded-full" style={{ background: account.color }} />
          <h2 className="mt-5 text-lg font-bold">{account.name}</h2>
          <p className="mt-3 text-2xl font-extrabold">{money(account.balance, account.currency)}</p>
          <p className="mt-2 text-sm text-slate-500">{account.currency} · {account.icon}</p>
          <div className="mt-4">
            <RowActions onEdit={() => onEdit(account)} onDelete={() => onDelete(account.id)} />
          </div>
        </Card>
      ))}
      <button className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-left text-slate-500 hover:border-slate-400" onClick={onAdd}>
        <Plus size={22} />
        <span className="mt-4 block font-bold text-slate-800">Добавить счет</span>
      </button>
    </div>
  );
}

function GoalsPage({
  goals,
  onAdd,
  onEdit,
  onDelete,
}: {
  goals: Goal[];
  onAdd: () => void;
  onEdit: (item: Goal) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex justify-end">
        <Button onClick={onAdd}><Plus size={17} />Добавить цель</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{goal.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{money(goal.current_amount)} из {money(goal.target_amount)}</p>
              </div>
              <div className="text-2xl font-extrabold">{Math.round(goal.progress)}%</div>
            </div>
            <div className="mt-5"><ProgressBar value={goal.progress} color={goal.color} /></div>
            <div className="mt-4"><RowActions onEdit={() => onEdit(goal)} onDelete={() => onDelete(goal.id)} /></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SavingsPage({
  savings,
  onAdd,
  onEdit,
  onDelete,
}: {
  savings: SavingEntry[];
  onAdd: () => void;
  onEdit: (item: SavingEntry) => void;
  onDelete: (id: number) => void;
}) {
  const latest = savings[0];
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5"><p className="text-sm text-slate-500">Общие накопления</p><p className="mt-3 text-2xl font-extrabold">{money(latest?.balance)}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Цель накопления</p><p className="mt-3 text-2xl font-extrabold">{money(2000000)}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Выполнено</p><p className="mt-3 text-2xl font-extrabold">32%</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Осталось</p><p className="mt-3 text-2xl font-extrabold">{money(1350000)}</p></Card>
      </div>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold">История накоплений</h2>
          <Button onClick={onAdd}><Plus size={17} />Добавить</Button>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Дата</th><th className="px-5 py-3">Пополнение</th><th className="px-5 py-3">Снятие</th><th className="px-5 py-3">Баланс</th><th className="px-5 py-3 text-right">Действия</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{savings.map((row) => <tr key={row.id}><td className="px-5 py-4">{row.date}</td><td className="px-5 py-4 text-emerald-600">{money(row.deposit)}</td><td className="px-5 py-4 text-rose-600">{money(row.withdrawal)}</td><td className="px-5 py-4 font-bold">{money(row.balance)}</td><td className="px-5 py-4"><RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} /></td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}

function DebtsPage({
  debts,
  onAdd,
  onEdit,
  onDelete,
}: {
  debts: Debt[];
  onAdd: () => void;
  onEdit: (item: Debt) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex justify-end">
        <Button onClick={onAdd}><Plus size={17} />Добавить долг</Button>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {(["owed_by_me", "owed_to_me"] as const).map((type) => (
          <Card key={type} className="p-5">
            <h2 className="text-lg font-bold">{type === "owed_by_me" ? "Я должен" : "Мне должны"}</h2>
            <div className="mt-4 grid gap-3">
              {debts.filter((debt) => debt.type === type).map((debt) => (
                <div key={debt.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex justify-between gap-3"><b>{debt.person}</b><b>{money(debt.amount)}</b></div>
                  <p className="mt-2 text-sm text-slate-500">{debt.date} · возврат {debt.due_date ?? "-"} · {debt.status}</p>
                  <p className="mt-2 text-sm text-slate-600">{debt.comment}</p>
                  <div className="mt-3"><RowActions onEdit={() => onEdit(debt)} onDelete={() => onDelete(debt.id)} /></div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CalendarPage({ transactions }: { transactions: Transaction[] }) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  return (
    <Card className="p-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {days.map((day) => {
          const dayTx = transactions.filter((tx) => Number(tx.date.slice(-2)) === day);
          const income = dayTx.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0);
          const expenses = dayTx.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0);
          return (
            <div key={day} className="min-h-28 rounded-lg border border-slate-100 bg-white p-3">
              <div className="flex items-center justify-between"><b>{day}</b><CalendarDays size={15} className="text-slate-400" /></div>
              <p className="mt-3 text-xs text-emerald-600">+ {money(income)}</p>
              <p className="mt-1 text-xs text-rose-600">- {money(expenses)}</p>
              <p className="mt-1 text-xs font-bold">{money(income - expenses)}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CategoriesPage({
  categories,
  onAdd,
  onEdit,
  onDelete,
}: {
  categories: Category[];
  onAdd: () => void;
  onEdit: (item: Category) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex justify-end"><Button onClick={onAdd}><Plus size={17} />Добавить категорию</Button></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-5">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-lg" style={{ background: category.color }} />
              <div><h2 className="font-bold">{category.name}</h2><p className="text-sm text-slate-500">{category.type === "income" ? "Доход" : "Расход"} · {category.icon}</p></div>
            </div>
            <div className="mt-4"><RowActions onEdit={() => onEdit(category)} onDelete={() => onDelete(category.id)} /></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HistoryPage({
  transactions,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  onEdit: (item: Transaction) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid gap-5">
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input className={inputClass} type="date" />
          <select className={inputClass}><option>Категория</option></select>
          <input className={inputClass} placeholder="Сумма" />
          <select className={inputClass}><option>Счет</option></select>
          <Button variant="secondary"><SlidersHorizontal size={17} />Фильтр</Button>
        </div>
      </Card>
      <TransactionTable title="Единая история операций" transactions={transactions} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function SettingsPage({
  budgets,
  categories,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
}: {
  budgets: Budget[];
  categories: Category[];
  onAddBudget: () => void;
  onEditBudget: (item: Budget) => void;
  onDeleteBudget: (id: number) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Бюджеты</h2>
          <Button onClick={onAddBudget}><Plus size={17} />Лимит</Button>
        </div>
        <div className="mt-4 grid gap-3">
          {budgets.map((budget) => (
            <div key={budget.id} className="rounded-lg border border-slate-100 p-4">
              <div className="flex items-center justify-between"><b>{budget.category_name}</b><b>{money(budget.limit)}</b></div>
              <p className="mt-2 text-sm text-slate-500">{budget.month}.{budget.year}</p>
              <div className="mt-3"><RowActions onEdit={() => onEditBudget(budget)} onDelete={() => onDeleteBudget(budget.id)} /></div>
            </div>
          ))}
          {!budgets.length && <EmptyState text={categories.length ? "Добавьте первый лимит бюджета." : "Сначала создайте категорию расходов."} />}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-lg font-bold">Доступ и администрирование</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <p>Экспорт: Excel, PDF, CSV.</p>
          <p>API поддерживает создание, чтение, редактирование и удаление записей.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <a className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50" href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> Django Admin
            </a>
            <a className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50" href="http://127.0.0.1:8000/api/" target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> DRF API
            </a>
          </div>
          <p>Production-доступ можно усилить через Email, Google, GitHub и права DRF.</p>
        </div>
      </Card>
    </div>
  );
}

function CategoryForm({ category, onDone }: { category?: Category | null; onDone: () => void }) {
  const [form, setForm] = useState({
    name: category?.name ?? "",
    type: category?.type ?? "expense",
    color: category?.color ?? "#2563eb",
    icon: category?.icon ?? "tag",
  });
  return (
    <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); category ? await api.updateCategory(category.id, form as any) : await api.createCategory(form as any); onDone(); }}>
      <Field label="Название"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Тип"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}><option value="income">Доход</option><option value="expense">Расход</option></select></Field>
      <Field label="Цвет"><input className={inputClass} type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
      <Field label="Иконка"><input className={inputClass} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></Field>
      <Button>Сохранить</Button>
    </form>
  );
}

function AccountForm({ account, onDone }: { account?: Account | null; onDone: () => void }) {
  const [form, setForm] = useState({
    name: account?.name ?? "",
    balance: account?.balance ?? "0",
    currency: account?.currency ?? "KGS",
    color: account?.color ?? "#111827",
    icon: account?.icon ?? "wallet",
  });
  return (
    <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); account ? await api.updateAccount(account.id, form) : await api.createAccount(form); onDone(); }}>
      <Field label="Название"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Баланс"><input className={inputClass} type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></Field>
      <Field label="Валюта"><input className={inputClass} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Field>
      <Field label="Цвет"><input className={inputClass} type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
      <Field label="Иконка"><input className={inputClass} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></Field>
      <Button>Сохранить</Button>
    </form>
  );
}

function DebtForm({ debt, onDone }: { debt?: Debt | null; onDone: () => void }) {
  const [form, setForm] = useState({
    type: debt?.type ?? "owed_to_me",
    person: debt?.person ?? "",
    amount: debt?.amount ?? "",
    date: debt?.date ?? new Date().toISOString().slice(0, 10),
    due_date: debt?.due_date ?? "",
    status: debt?.status ?? "open",
    comment: debt?.comment ?? "",
  });
  return (
    <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); const payload = { ...form, due_date: form.due_date || null }; debt ? await api.updateDebt(debt.id, payload as any) : await api.createDebt(payload as any); onDone(); }}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Тип"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Debt["type"] })}><option value="owed_to_me">Мне должны</option><option value="owed_by_me">Я должен</option></select></Field>
        <Field label="Статус"><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Debt["status"] })}><option value="open">Открыт</option><option value="paid">Закрыт</option><option value="overdue">Просрочен</option></select></Field>
      </div>
      <Field label="Человек"><input className={inputClass} value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} /></Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Сумма"><input className={inputClass} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Дата"><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Дата возврата"><input className={inputClass} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Field>
      </div>
      <Field label="Комментарий"><textarea className={`${inputClass} min-h-24 py-3`} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></Field>
      <Button>Сохранить</Button>
    </form>
  );
}

function GoalForm({ goal, onDone }: { goal?: Goal | null; onDone: () => void }) {
  const [form, setForm] = useState({
    name: goal?.name ?? "",
    target_amount: goal?.target_amount ?? "",
    current_amount: goal?.current_amount ?? "0",
    color: goal?.color ?? "#2563eb",
    due_date: goal?.due_date ?? "",
  });
  return (
    <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); const payload = { ...form, due_date: form.due_date || null }; goal ? await api.updateGoal(goal.id, payload as any) : await api.createGoal(payload as any); onDone(); }}>
      <Field label="Название"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Стоимость"><input className={inputClass} type="number" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} /></Field>
        <Field label="Сейчас"><input className={inputClass} type="number" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Цвет"><input className={inputClass} type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
        <Field label="Дата цели"><input className={inputClass} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Field>
      </div>
      <Button>Сохранить</Button>
    </form>
  );
}

function SavingForm({ saving, onDone }: { saving?: SavingEntry | null; onDone: () => void }) {
  const [form, setForm] = useState({
    date: saving?.date ?? new Date().toISOString().slice(0, 10),
    deposit: saving?.deposit ?? "0",
    withdrawal: saving?.withdrawal ?? "0",
    balance: saving?.balance ?? "0",
    comment: saving?.comment ?? "",
  });
  return (
    <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); saving ? await api.updateSaving(saving.id, form) : await api.createSaving(form); onDone(); }}>
      <Field label="Дата"><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Пополнение"><input className={inputClass} type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></Field>
        <Field label="Снятие"><input className={inputClass} type="number" value={form.withdrawal} onChange={(e) => setForm({ ...form, withdrawal: e.target.value })} /></Field>
        <Field label="Баланс"><input className={inputClass} type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></Field>
      </div>
      <Field label="Комментарий"><input className={inputClass} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></Field>
      <Button>Сохранить</Button>
    </form>
  );
}

function BudgetForm({ budget, categories, onDone }: { budget?: Budget | null; categories: Category[]; onDone: () => void }) {
  const today = new Date();
  const [form, setForm] = useState({
    category: budget?.category ?? categories[0]?.id ?? 0,
    limit: budget?.limit ?? "",
    month: budget?.month ?? today.getMonth() + 1,
    year: budget?.year ?? today.getFullYear(),
  });
  return (
    <form className="grid gap-4" onSubmit={async (e) => { e.preventDefault(); budget ? await api.updateBudget(budget.id, form) : await api.createBudget(form); onDone(); }}>
      <Field label="Категория">
        <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: Number(e.target.value) })}>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Лимит"><input className={inputClass} type="number" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} /></Field>
        <Field label="Месяц"><input className={inputClass} type="number" min={1} max={12} value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} /></Field>
        <Field label="Год"><input className={inputClass} type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></Field>
      </div>
      <Button>Сохранить</Button>
    </form>
  );
}

function OperationForm({
  transaction,
  accounts,
  categories,
  onDone,
}: {
  transaction?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    type: transaction?.type ?? "transfer",
    date: transaction?.date ?? new Date().toISOString().slice(0, 10),
    category: transaction?.category ?? null,
    source: transaction?.source ?? "",
    amount: transaction?.amount ?? "",
    account: transaction?.account ?? accounts[0]?.id ?? 0,
    transfer_to: transaction?.transfer_to ?? accounts[1]?.id ?? null,
    comment: transaction?.comment ?? "",
    payment_method: transaction?.payment_method ?? "",
  });
  const filteredCategories = categories.filter((category) => category.type === form.type);
  const needsCategory = form.type === "income" || form.type === "expense";
  const needsTransferTo = form.type === "transfer";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      amount: form.amount || "0",
      category: needsCategory ? form.category ?? filteredCategories[0]?.id ?? null : null,
      transfer_to: needsTransferTo ? form.transfer_to : null,
    };
    if (transaction?.id) {
      await api.updateTransaction(transaction.id, payload as any);
    } else {
      await api.createTransaction(payload as any);
    }
    onDone();
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Тип">
          <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}>
            <option value="transfer">Перевод</option>
            <option value="return">Возврат</option>
            <option value="saving">Накопление</option>
            <option value="income">Доход</option>
            <option value="expense">Расход</option>
          </select>
        </Field>
        <Field label="Дата"><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Сумма"><input className={inputClass} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Счет">
          <select className={inputClass} value={form.account} onChange={(e) => setForm({ ...form, account: Number(e.target.value) })}>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </Field>
      </div>
      {needsTransferTo && (
        <Field label="Счет назначения">
          <select className={inputClass} value={form.transfer_to ?? ""} onChange={(e) => setForm({ ...form, transfer_to: Number(e.target.value) })}>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </Field>
      )}
      {needsCategory && (
        <Field label="Категория">
          <select className={inputClass} value={form.category ?? filteredCategories[0]?.id ?? ""} onChange={(e) => setForm({ ...form, category: Number(e.target.value) })}>
            {filteredCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Источник"><input className={inputClass} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></Field>
      <Field label="Комментарий"><textarea className={`${inputClass} min-h-24 py-3`} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></Field>
      <Button>Сохранить</Button>
    </form>
  );
}
