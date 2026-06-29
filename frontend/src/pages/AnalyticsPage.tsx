import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../components/ui";
import { money } from "../lib/api";

export function AnalyticsPage({ analytics }: { analytics: any }) {
  const monthly = analytics?.monthly ?? [];
  const incomeCategories = analytics?.income_categories ?? [];
  const expenseCategories = analytics?.expense_categories ?? [];
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Доходы по месяцам"><LineChartBlock data={monthly} dataKey="income" color="#16a34a" /></ChartCard>
      <ChartCard title="Расходы по месяцам"><BarChartBlock data={monthly} dataKey="expenses" color="#ef4444" /></ChartCard>
      <ChartCard title="Расходы по категориям"><PieChartBlock data={expenseCategories} /></ChartCard>
      <ChartCard title="Доходы по категориям"><PieChartBlock data={incomeCategories} /></ChartCard>
      <ChartCard title="Доходы vs Расходы"><AreaChartBlock data={monthly} /></ChartCard>
      <ChartCard title="Финансовая динамика"><LineChartBlock data={monthly} dataKey="cumulative" color="#2563eb" /></ChartCard>
      <ChartCard title="Остаток средств"><LineChartBlock data={monthly} dataKey="balance" color="#7c3aed" /></ChartCard>
      <ChartCard title="Прогноз расходов AI"><LineChartBlock data={monthly} dataKey="forecast" color="#f97316" /></ChartCard>
    </div>
  );
}

export default AnalyticsPage;

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="h-72">{children}</div>
    </Card>
  );
}

function LineChartBlock({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => money(Number(value))} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChartBlock({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => money(Number(value))} />
        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AreaChartBlock({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => money(Number(value))} />
        <Area type="monotone" dataKey="income" stroke="#16a34a" fill="#bbf7d0" />
        <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#fecdd3" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function PieChartBlock({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={98} paddingAngle={3}>
          {data.map((item) => (
            <Cell key={item.name} fill={item.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => money(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  );
}
