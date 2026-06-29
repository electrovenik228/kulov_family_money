import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../lib/api";
import type { Account, Category, Transaction, TransactionType } from "../lib/types";
import { Button, Field, inputClass } from "./ui";

export function TransactionForm({
  type,
  accounts,
  categories,
  onDone,
  transaction,
}: {
  type: TransactionType;
  accounts: Account[];
  categories: Category[];
  onDone: () => void;
  transaction?: Transaction | null;
}) {
  const [form, setForm] = useState({
    date: transaction?.date ?? new Date().toISOString().slice(0, 10),
    category: transaction?.category ?? categories[0]?.id ?? null,
    source: transaction?.source ?? "",
    amount: transaction?.amount ?? "",
    account: transaction?.account ?? accounts[0]?.id ?? 0,
    comment: transaction?.comment ?? "",
    payment_method: transaction?.payment_method ?? (type === "expense" ? "Карта" : ""),
  });
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      type,
      amount: form.amount || "0",
      category: form.category,
    };
    if (transaction) {
      await api.updateTransaction(transaction.id, payload);
    } else {
      await api.createTransaction(payload);
    }
    setSaving(false);
    onDone();
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Дата">
          <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="Сумма">
          <input className={inputClass} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Категория">
          <select className={inputClass} value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: Number(e.target.value) })}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Счет">
          <select className={inputClass} value={form.account} onChange={(e) => setForm({ ...form, account: Number(e.target.value) })}>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {type === "income" && (
        <Field label="Источник">
          <input className={inputClass} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        </Field>
      )}
      {type === "expense" && (
        <Field label="Способ оплаты">
          <input className={inputClass} value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
        </Field>
      )}
      <Field label="Комментарий">
        <textarea
          className={`${inputClass} min-h-24 py-3`}
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />
      </Field>
      <Button className="w-full" disabled={saving}>
        <Plus size={17} />
        {saving ? "Сохранение" : transaction ? "Сохранить" : "Добавить"}
      </Button>
    </form>
  );
}
