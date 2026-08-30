"use client";

import { useState } from "react";
import {
  Plus, Trash2, TrendingUp, TrendingDown,
  Save, DollarSign, Smartphone, Clock, CheckCircle2, X,
} from "lucide-react";
import { useFranchiseData, AccountEntry, SIMRateCard, SIMSale } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY, toStorageDate } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const SUPPLIERS = ["Telenor", "Jazz", "Zong", "Ufone", "Default"];
const SIM_TYPES: SIMRateCard["simType"][] = ["New", "HLR-MNP", "HLR-Replace", "HLR-BYN"];
const EXPENSE_CATEGORIES = ["Loan/Advance to Staff", "SIM Package Cost", "Mobile Load", "Commission Paid", "Other"];
const INCOME_CATEGORIES = ["SIM Sales Revenue", "Loan/Advance Repayment", "Commission Income", "Other"];

type Tab = "income" | "expenses" | "rates" | "sales";

export default function AccountingPage() {
  const {
    auth, accounts, expenses, simRateCards, upsertSimRateCard, deleteSimRateCard,
    addAccountingEntry, deleteAccountingEntry, deleteExpense,
    simSales, markSIMCollectionReceived,
  } = useFranchiseData();
  const [tab, setTab] = useState<Tab>("income");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ type: "income" | "expense"; category: string; amount: number; date: string; description: string }>(
    { type: "income", category: "", amount: 0, date: toStorageDate(), description: "" }
  );
  const [sending, setSending] = useState(false);
  const [editingRate, setEditingRate] = useState<SIMRateCard | null>(null);

  const incomeEntries = accounts.filter((a) => a.type === "income");
  const expenseEntries = accounts.filter((a) => a.type === "expense");
  const today = toStorageDate();

  const incomeFiltered = incomeEntries.filter((a) => search === "" || a.category.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
  const expenseFiltered = expenseEntries.filter((a) => search === "" || (a.category || "").toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
  const expenseAll = expenseFiltered.map((e) => ({ source: "accounting", ...e }));
  const expenseExpenses = expenses.filter((e) => search === "" || (e.category || "").toLowerCase().includes(search.toLowerCase()) || (e.note || "").toLowerCase().includes(search.toLowerCase())).map((e) => ({ source: "expenses", id: e.id, category: e.category || "Other", amount: e.amount, date: e.date, note: e.note || "" }));
  const allExpenses = [...expenseAll, ...expenseExpenses];

  const handleSaveEntry = async () => {
    if (!form.category || form.amount <= 0) return;
    setSending(true);
    try {
      await addAccountingEntry({
        type: form.type, category: form.category, amount: form.amount, date: form.date,
        description: form.description,
      });
      setShowForm(false);
      setForm({ type: "income", category: "", amount: 0, date: toStorageDate(), description: "" });
    } catch (e) {
      console.error(e);
      alert("Failed to add entry.");
    } finally {
      setSending(false);
    }
  };

  const totalIncome = incomeEntries.reduce((s, a) => s + a.amount, 0);
  const totalExpense = expenseEntries.reduce((s, a) => s + a.amount, 0);

  const TabBtn = (t: Tab, label: string, icon: any) => (
    <Button key={t} variant={tab === t ? "primary" : "outline"} onClick={() => setTab(t)}>
      {icon}{label}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Accounting" }]}
        title="Accounting"
        description="Income, expenses and SIM rate cards"
        actions={tab === "income" || tab === "expenses" ? (
          <Button onClick={() => { setForm({ type: tab === "income" ? "income" : "expense", category: tab === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0], amount: 0, date: toStorageDate(), description: "" }); setShowForm(true); }}>
            <Plus size={14} /> Add {tab === "income" ? "Income" : "Expense"}
          </Button>
        ) : undefined}
      />

      <div className="flex flex-wrap gap-2">
        {TabBtn("income", "Income", <TrendingUp size={14} />)}
        {TabBtn("expenses", "Expenses", <TrendingDown size={14} />)}
        {TabBtn("rates", "SIM Rate Cards", <DollarSign size={14} />)}
        {TabBtn("sales", "SIM Sales & Collections", <Smartphone size={14} />)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Income" value={`PKR ${totalIncome.toLocaleString()}`} icon={TrendingUp} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Total Expenses" value={`PKR ${totalExpense.toLocaleString()}`} icon={TrendingDown} iconClass="text-red-600 bg-red-50" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search..." className="flex-1" />
      </div>

      {/* Income tab */}
      {tab === "income" && (
        <Card>
          <CardHeader className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold"><TrendingUp size={16} className="text-green-600" /> Income Entries</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100 bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Description</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Amount</th>
                <th className="w-12" />
              </tr></thead>
              <tbody>
                {incomeFiltered.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No income entries</td></tr>}
                {incomeFiltered.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 text-sm hover:bg-slate-50">
                    <td className="px-5 py-3 text-muted-foreground">{formatDateDDMMYYYY(a.date)}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{a.category}</td>
                    <td className="px-5 py-3 text-muted-foreground">{a.description}</td>
                    <td className="px-5 py-3 text-right font-bold text-green-600">+PKR {a.amount.toLocaleString()}</td>
                    <td className="px-2 py-3"><button onClick={() => deleteAccountingEntry(a.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Expenses tab */}
      {tab === "expenses" && (
        <Card>
          <CardHeader className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold"><TrendingDown size={16} className="text-red-600" /> Expense Entries</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100 bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Description</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Amount</th>
                <th className="w-12" />
              </tr></thead>
              <tbody>
                {allExpenses.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No expense entries</td></tr>}
                {allExpenses.map((a: any) => (
                  <tr key={a.id} className="border-b border-slate-100 text-sm hover:bg-slate-50">
                    <td className="px-5 py-3 text-muted-foreground">{formatDateDDMMYYYY(a.date)}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{a.category}{a.source === "expenses" && <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-muted-foreground">Expenses</span>}</td>
                    <td className="px-5 py-3 text-muted-foreground">{a.description || a.note || "\u2014"}</td>
                    <td className="px-5 py-3 text-right font-bold text-red-600">-PKR {a.amount.toLocaleString()}</td>
                    <td className="px-2 py-3">{a.source === "expenses" ? <button onClick={() => deleteExpense(a.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button> : <span />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Rate cards tab */}
      {tab === "rates" && (
        <Card>
          <CardHeader className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold"><DollarSign size={16} className="text-brand-600" /> SIM Rate Cards</CardTitle>
            <Button size="sm" onClick={() => setEditingRate({ id: `RC-${Date.now()}`, supplier: "Default", simType: "New", customerRate: 0, commissionRate: 10, staffCommissionRate: 0, staffCommissionBvs: 0, staffCommissionFca: 0, staffCommissionIfca: 0, isFreeForCustomer: true, franchiseId: auth.franchiseId })}>
              <Plus size={12} /> Add Rate
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100 bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Supplier</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">SIM Type</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Customer Rate (PKR)</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Commission (PKR)</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">DSO/DSM Comm BVS (PKR)</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">FCA (PKR)</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">IFCA (PKR)</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Free</th>
                <th className="w-20" />
              </tr></thead>
              <tbody>
                {simRateCards.length === 0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-sm text-muted-foreground">No rate cards</td></tr>}
                {simRateCards.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 text-sm">
                    <td className="px-5 py-3 font-medium text-slate-900">{r.supplier}</td>
                    <td className="px-5 py-3 text-slate-600">{r.simType}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900">{r.customerRate.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-green-600">{(r.commissionRate || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-brand-600">{(r.staffCommissionBvs ?? r.staffCommissionRate ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-brand-600">{(r.staffCommissionFca ?? r.staffCommissionRate ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-brand-600">{(r.staffCommissionIfca ?? r.staffCommissionRate ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-xs font-medium text-green-600">{r.isFreeForCustomer ? "Yes" : "No"}</td>
                    <td className="flex gap-1 px-2 py-3">
                      <button onClick={() => setEditingRate(r)} className="p-1 text-slate-400 hover:text-brand-600"><DollarSign size={14} /></button>
                      <button onClick={() => deleteSimRateCard(r.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* SIM Sales & Collections tab */}
      {tab === "sales" && <SalesTab sales={simSales} onMarkReceived={(id, method) => markSIMCollectionReceived(id, method)} />}

      {/* Add entry modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-bold text-slate-900">Add {form.type === "income" ? "Income" : "Expense"} Entry</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-muted-foreground hover:text-slate-900"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
                <Select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "income" | "expense" }))}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
                <Select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {(form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount (PKR)</label>
                <Input type="number" value={form.amount || ""} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} />
              </div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                <Input type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional notes" />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveEntry} disabled={!form.category || form.amount <= 0 || sending}>
                <Save size={14} /> {sending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rate card edit modal */}
      {editingRate && (
        <RateCardModal card={editingRate} onClose={() => setEditingRate(null)} onSave={async (c) => { await upsertSimRateCard(c); setEditingRate(null); }} suppliers={SUPPLIERS} simTypes={SIM_TYPES} />
      )}
    </div>
  );
}

function RateCardModal({ card, onClose, onSave, suppliers, simTypes }: {
  card: SIMRateCard; onClose: () => void; onSave: (c: Omit<SIMRateCard, "franchiseId">) => Promise<void>;
  suppliers: string[]; simTypes: SIMRateCard["simType"][];
}) {
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(card);
  const handleSave = async () => {
    if (!local.supplier || !local.simType || local.customerRate < 0) return;
    setSaving(true);
    try { await onSave(local); } catch (e) { alert("Failed"); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-slate-900">Edit Rate Card</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-slate-900"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-6">
          <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Supplier</label>
            <Select value={local.supplier} onChange={(e) => setLocal((p) => ({ ...p, supplier: e.target.value }))}>
              {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">SIM Type</label>
            <Select value={local.simType} onChange={(e) => setLocal((p) => ({ ...p, simType: e.target.value as any }))}>
              {simTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Customer Rate (PKR)</label>
            <Input type="number" value={local.customerRate || ""} onChange={(e) => setLocal((p) => ({ ...p, customerRate: Number(e.target.value) }))} />
          </div>
          <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Company Commission (PKR)</label>
            <Input type="number" value={local.commissionRate ?? 0} onChange={(e) => setLocal((p) => ({ ...p, commissionRate: Number(e.target.value) }))} />
            <p className="mt-1 text-[10px] text-muted-foreground">Income earned from the company per SIM sold (e.g. New SIM commission Rs 10)</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">DSO/DSM Commission (PKR per stage)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">BVS</label>
                <Input type="number" value={local.staffCommissionBvs ?? local.staffCommissionRate ?? 0} onChange={(e) => setLocal((p) => ({ ...p, staffCommissionBvs: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">FCA</label>
                <Input type="number" value={local.staffCommissionFca ?? local.staffCommissionRate ?? 0} onChange={(e) => setLocal((p) => ({ ...p, staffCommissionFca: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">IFCA</label>
                <Input type="number" value={local.staffCommissionIfca ?? local.staffCommissionRate ?? 0} onChange={(e) => setLocal((p) => ({ ...p, staffCommissionIfca: Number(e.target.value) }))} />
              </div>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Commission paid to DSO/DSM per verified stage — BVS, FCA and IFCA each pay out when the value is set to 1</p>
          </div>
          <div className="flex items-center gap-3"><input type="checkbox" id="freeCb" checked={local.isFreeForCustomer} onChange={(e) => setLocal((p) => ({ ...p, isFreeForCustomer: e.target.checked }))} />
            <label htmlFor="freeCb" className="text-sm font-medium text-slate-900">Free for customer (no charge)</label>
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            <Save size={14} /> {saving ? "Saving..." : "Save Rate Card"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SalesTab({ sales, onMarkReceived }: { sales: SIMSale[]; onMarkReceived: (id: string, method: string) => Promise<void> }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [markId, setMarkId] = useState("");

  const totalIncome = sales.reduce((s, r) => s + r.income, 0);
  const pendingTotal = sales.filter((r) => r.collectionStatus === "Pending").reduce((s, r) => s + r.collectionAmount, 0);
  const receivedTotal = sales.filter((r) => r.collectionStatus === "Received").reduce((s, r) => s + r.collectionAmount, 0);

  const filtered = sales.filter((r) => statusFilter === "All" || r.collectionStatus === statusFilter);

  const handleMark = async (saleId: string, method: string) => {
    if (markId) return;
    setMarkId(saleId);
    try {
      await onMarkReceived(saleId, method);
    } catch (e) {
      console.error(e);
      alert("Failed to mark collection received.");
    } finally {
      setMarkId("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Auto Revenue" value={`PKR ${totalIncome.toLocaleString()}`} icon={TrendingUp} iconClass="text-green-600 bg-green-50" />
        <StatCard label={`Pending Collections (${sales.filter((r) => r.collectionStatus === "Pending").length})`} value={`PKR ${pendingTotal.toLocaleString()}`} icon={Clock} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="Received Collections" value={`PKR ${receivedTotal.toLocaleString()}`} icon={CheckCircle2} iconClass="text-blue-600 bg-blue-50" />
      </div>

      <div className="flex gap-2">
        {["All", "Pending", "Received", "N/A"].map((s) => (
          <Button key={s} size="sm" variant={statusFilter === s ? "primary" : "outline"} onClick={() => setStatusFilter(s)}>
            {s}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold"><Smartphone size={16} className="text-brand-600" /> Auto-Generated SIM Sales</CardTitle>
          <span className="rounded-lg bg-brand-600/10 px-2.5 py-1 text-xs font-bold text-brand-600">{filtered.length} Sale(s)</span>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">SIM</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type / Stage</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">DSO/DSM</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Income (PKR)</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Staff Comm. (PKR)</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Collection</th>
                <th className="px-5 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">No SIM sales yet. Verify SIMs in Active SIMs (BVS/FCA/IFCA = 1) to auto-generate sales.</td></tr>}
              {[...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((r) => (
                <tr key={r.id} className="border-b border-slate-100 text-sm hover:bg-slate-50">
                  <td className="px-5 py-3 text-muted-foreground">{formatDateDDMMYYYY(r.saleDate)}</td>
                  <td className="px-5 py-3">
                    <p className="font-mono font-medium text-slate-900">{r.simNumber}</p>
                    {r.network && <p className="text-[10px] text-muted-foreground">{r.network} &middot; {r.supplier}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-700">{r.simType} <span className="text-[10px] text-muted-foreground">({r.stage})</span></td>
                  <td className="px-5 py-3 text-slate-700">{r.staffName} <span className="text-[10px] text-muted-foreground">({r.staffRole})</span></td>
                  <td className="px-5 py-3 text-right font-bold text-green-600">+PKR {r.income.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-bold text-brand-600">{r.staffCommission.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    {r.collectionStatus === "N/A" ? (
                      <StatusPill label="N/A" tone="muted" />
                    ) : r.collectionStatus === "Received" ? (
                      <StatusPill label={`Received${r.receivedMethod ? ` (${r.receivedMethod})` : ""}`} tone="positive" />
                    ) : (
                      <StatusPill label={`Pending PKR ${r.collectionAmount.toLocaleString()}`} tone="warning" />
                    )}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {r.collectionStatus === "Pending" ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" onClick={() => handleMark(r.id, "Online")} disabled={!!markId}>Online</Button>
                        <Button size="sm" variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleMark(r.id, "Cash")} disabled={!!markId}>Cash</Button>
                      </div>
                    ) : <span className="text-xs text-slate-300">{"\u2014"}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
        New SIMs: free for customer &mdash; income is the company commission, and DSO/DSM commission is credited to their wallet and salary. HLR (MNP/Replace/BYN): DSO/DSM collects the customer amount, shown as a pending collection here; mark <strong>Online</strong> or <strong>Cash</strong> when the franchise receives it to record income. Unreturned pending collections are auto-deducted from salary at payroll generation.
      </div>
    </div>
  );
}

