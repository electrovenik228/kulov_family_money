import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Gauge,
  HandCoins,
  History,
  Landmark,
  LineChart,
  PiggyBank,
  ReceiptText,
  Search,
  Settings,
  Tags,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui";

export type Page =
  | "dashboard"
  | "income"
  | "expenses"
  | "analytics"
  | "accounts"
  | "goals"
  | "savings"
  | "debts"
  | "calendar"
  | "categories"
  | "history"
  | "settings";

const nav = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "income", label: "Доходы", icon: TrendingUp },
  { id: "expenses", label: "Расходы", icon: TrendingDown },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "accounts", label: "Счета", icon: CreditCard },
  { id: "goals", label: "Цели", icon: Target },
  { id: "savings", label: "Накопления", icon: PiggyBank },
  { id: "debts", label: "Долги", icon: HandCoins },
  { id: "calendar", label: "Календарь", icon: CalendarDays },
  { id: "categories", label: "Категории", icon: Tags },
  { id: "history", label: "История", icon: History },
  { id: "settings", label: "Настройки", icon: Settings },
] as const;

export function Layout({
  page,
  setPage,
  query,
  setQuery,
  children,
}: {
  page: Page;
  setPage: (page: Page) => void;
  query: string;
  setQuery: (query: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="mb-7 flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white">
            <Landmark size={22} />
          </div>
          <div>
            <div className="font-extrabold leading-tight">Kulov Family</div>
            <div className="text-sm text-slate-500">Money</div>
          </div>
        </div>
        <nav className="grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
                  active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
                onClick={() => setPage(item.id as Page)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f7f8fb]/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 md:text-3xl">
                {nav.find((item) => item.id === page)?.label}
              </h1>
              <p className="mt-1 text-sm text-slate-500">Учет денег семьи без перегруженных экранов</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-96">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  placeholder="Поиск по операциям, счетам, людям"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <Button variant="secondary" className="hidden md:inline-flex">
                <ReceiptText size={17} />
                CSV
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map((item) => (
              <button
                key={item.id}
                className={`h-9 shrink-0 rounded-lg px-3 text-sm font-semibold ${
                  page === item.id ? "bg-slate-950 text-white" : "bg-white text-slate-600"
                }`}
                onClick={() => setPage(item.id as Page)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
