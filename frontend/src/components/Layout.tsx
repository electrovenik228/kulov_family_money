import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Gauge,
  HandCoins,
  History,
  Landmark,
  LineChart,
  Menu,
  PiggyBank,
  ReceiptText,
  Search,
  Settings,
  Tags,
  Target,
  TrendingDown,
  TrendingUp,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPageLabel = nav.find((item) => item.id === page)?.label;

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const selectPage = (nextPage: Page) => {
    setPage(nextPage);
    setMobileMenuOpen(false);
  };

  const NavigationItems = ({ compact = false }: { compact?: boolean }) => (
    <>
      {nav.map((item) => {
        const Icon = item.icon;
        const active = page === item.id;
        return (
          <button
            key={item.id}
            className={`flex items-center gap-3 rounded-lg text-left font-semibold transition ${
              compact ? "h-12 px-3 text-base" : "h-11 px-3 text-sm"
            } ${active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
            onClick={() => selectPage(item.id as Page)}
          >
            <Icon size={compact ? 20 : 18} />
            {item.label}
          </button>
        );
      })}
    </>
  );

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
          <NavigationItems />
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f7f8fb]/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <button
                className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
                type="button"
                aria-label="Открыть меню"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={21} />
              </button>
              <div>
              <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 md:text-3xl">
                {currentPageLabel}
              </h1>
              <p className="mt-1 text-sm text-slate-500">Учет денег семьи без перегруженных экранов</p>
              </div>
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
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              className="absolute inset-0 h-full w-full bg-slate-950/40"
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside
              id="mobile-navigation"
              className="relative flex h-full w-[min(88vw,22rem)] flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white">
                    <Landmark size={22} />
                  </div>
                  <div>
                    <div className="font-extrabold leading-tight">Kulov Family</div>
                    <div className="text-sm text-slate-500">Money</div>
                  </div>
                </div>
                <button
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                  type="button"
                  aria-label="Закрыть меню"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={21} />
                </button>
              </div>
              <nav className="grid gap-1 overflow-y-auto pb-4">
                <NavigationItems compact />
              </nav>
            </aside>
          </div>
        )}
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
