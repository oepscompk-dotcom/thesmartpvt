"use client";

import { useState } from "react";
import {
  BarChart3, Plus, Trash2, Landmark, Receipt, Wallet, TrendingUp, TrendingDown,
  Save, Search, Check, DollarSign, Smartphone,
} from "lucide-react";
import { useFranchiseData, AccountEntry, SIMRateCard } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY, toStorageDate } from "@/lib/dateUtils";

const SUPPLIERS = ["Telenor", "Jazz", "Zong", "Ufone", "Default"];
const SIM_TYPES: SIMRateCard["simType"][] = ["New", "HLR-MNP", "HLR-Replace", "HLR-BYN"];
const EXPENSE_CATEGORIES = ["Loan/Advance to Staff", "SIM Package Cost", "Mobile Load", "Commission Paid", "Other"];
const INCOME_CATEGORIES = ["SIM Sales Revenue", "Loan/Advance Repayment", "Commission Income", "Other"];

type Tab = "income" | "expenses" | "rates" | "sale";

export default function AccountingPage() {
  const {
    auth, accounts, expenses, simRateCards, upsertSimRateCard, deleteSimRateCard,
    addAccountingEntry, deleteAccountingEntry, deleteExpense, dso, dsms,
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
    <button onClick={() => setTab(t)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
      {icon}{label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Accounting</h1>
        <p className="text-gray-500 text-sm mt-1">Income, expenses and SIM rate cards</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TabBtn("income", "Income", <TrendingUp size={14} />)}
        {TabBtn("expenses", "Expenses", <TrendingDown size={14} />)}
        {TabBtn("rates", "SIM Rate Cards", <DollarSign size={14} />)}
        {TabBtn("sale", "Record SIM Sale", <Smartphone size={14} />)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><TrendingUp size={18} /></div>
          <p className="text-3xl font-black text-green-600">PKR {totalIncome.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Income</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-2"><TrendingDown size={18} /></div>
          <p className="text-3xl font-black text-red-600">PKR {totalExpense.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Expenses</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2647]/20 focus:border-[#0A2647]" />
        </div>
        {(tab === "income" || tab === "expenses") && (
          <button onClick={() => { setForm({ type: tab === "income" ? "income" : "expense", category: tab === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0], amount: 0, date: toStorageDate(), description: "" }); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272]">
            <Plus size={14} /> Add {tab === "income" ? "Income" : "Expense"}
          </button>
        )}
      </div>

      {/* Income tab */}
      {tab === "income" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100"><h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><TrendingUp size={16} className="text-green-600" /> Income Entries</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Category</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Description</th>
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">Amount</th>
                <th className="w-12" />
              </tr></thead>
              <tbody>
                {incomeFiltered.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No income entries</td></tr>}
                {incomeFiltered.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600 text-sm">{formatDateDDMMYYYY(a.date)}</td>
                    <td className="px-5 py-3 text-gray-900 text-sm font-medium">{a.category}</td>
                    <td className="px-5 py-3 text-gray-500 text-sm">{a.description}</td>
                    <td className="px-5 py-3 text-right font-bold text-green-600">+PKR {a.amount.toLocaleString()}</td>
                    <td className="px-2 py-3"><button onClick={() => deleteAccountingEntry(a.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses tab */}
      {tab === "expenses" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100"><h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><TrendingDown size={16} className="text-red-600" /> Expense Entries</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Category</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Description</th>
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">Amount</th>
                <th className="w-12" />
              </tr></thead>
              <tbody>
                {allExpenses.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No expense entries</td></tr>}
                {allExpenses.map((a: any) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600 text-sm">{formatDateDDMMYYYY(a.date)}</td>
                    <td className="px-5 py-3 text-gray-900 text-sm font-medium">{a.category}{a.source === "expenses" && <span className="ml-1 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Expenses</span>}</td>
                    <td className="px-5 py-3 text-gray-500 text-sm">{a.description || a.note || "\u2014"}</td>
                    <td className="px-5 py-3 text-right font-bold text-red-600">-PKR {a.amount.toLocaleString()}</td>
                    <td className="px-2 py-3">{a.source === "expenses" ? <button onClick={() => deleteExpense(a.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button> : <span />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rate cards tab */}
      {tab === "rates" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><DollarSign size={16} className="text-[#0A2647]" /> SIM Rate Cards</h3>
            <button onClick={() => setEditingRate({ id: `RC-${Date.now()}`, supplier: "Default", simType: "New", customerRate: 0, commissionRate: 10, isFreeForCustomer: true, franchiseId: auth.franchiseId })}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A2647] text-white text-xs font-bold rounded-lg hover:bg-[#144272]">
              <Plus size={12} /> Add Rate
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Supplier</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">SIM Type</th>
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">Customer Rate (PKR)</th>
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">Commission (PKR)</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Free</th>
                <th className="w-20" />
              </tr></thead>
              <tbody>
                {simRateCards.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No rate cards</td></tr>}
                {simRateCards.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-gray-900 text-sm font-medium">{r.supplier}</td>
                    <td className="px-5 py-3 text-gray-600 text-sm">{r.simType}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900">{r.customerRate.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-green-600">{(r.commissionRate || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-green-600 text-xs font-medium">{r.isFreeForCustomer ? "Yes" : "No"}</td>
                    <td className="px-2 py-3 flex gap-1">
                      <button onClick={() => setEditingRate(r)} className="text-gray-400 hover:text-[#0A2647] p-1"><DollarSign size={14} /></button>
                      <button onClick={() => deleteSimRateCard(r.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record SIM Sale tab */}
      {tab === "sale" && <SaleForm onComplete={() => setTab("income")} />}

      {/* Add entry modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Add {form.type === "income" ? "Income" : "Expense"} Entry</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><Landmark size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "income" | "expense" }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm">
                  <option value="">Select category</option>
                  {(form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Amount (PKR)</label>
                <input type="number" value={form.amount || ""} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
              </div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
              </div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional notes" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveEntry} disabled={!form.category || form.amount <= 0 || sending} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] disabled:opacity-40">
                <Save size={14} /> {sending ? "Saving..." : "Save Entry"}
              </button>
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-gray-900 font-bold">Edit Rate Card</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><Landmark size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Supplier</label>
            <select value={local.supplier} onChange={(e) => setLocal((p) => ({ ...p, supplier: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm">
              {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">SIM Type</label>
            <select value={local.simType} onChange={(e) => setLocal((p) => ({ ...p, simType: e.target.value as any }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm">
              {simTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Customer Rate (PKR)</label>
            <input type="number" value={local.customerRate || ""} onChange={(e) => setLocal((p) => ({ ...p, customerRate: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
          </div>
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Company Commission (PKR)</label>
            <input type="number" value={local.commissionRate ?? 0} onChange={(e) => setLocal((p) => ({ ...p, commissionRate: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
            <p className="text-[10px] text-gray-400 mt-1">Income earned from the company per SIM sold (e.g. New SIM commission Rs 10)</p>
          </div>
          <div className="flex items-center gap-3"><input type="checkbox" id="freeCb" checked={local.isFreeForCustomer} onChange={(e) => setLocal((p) => ({ ...p, isFreeForCustomer: e.target.checked }))} />
            <label htmlFor="freeCb" className="text-gray-900 text-sm font-medium">Free for customer (no charge)</label>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] disabled:opacity-40">
            <Save size={14} /> {saving ? "Saving..." : "Save Rate Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SaleForm({ onComplete }: { onComplete: () => void }) {
  const { simRateCards, addAccountingEntry, dso, dsms } = useFranchiseData();
  const [supplier, setSupplier] = useState("Telenor");
  const [simType, setSimType] = useState<SIMRateCard["simType"]>("New");
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState("");
  const [customerType, setCustomerType] = useState<"DSO" | "DSM">("DSO");
  const [submitting, setSubmitting] = useState(false);

  const staffList = customerType === "DSO" ? dso : dsms;
  const matchedRate = simRateCards.find((r) => (r.supplier === supplier || r.supplier === "Default") && r.simType === simType);
  const isFree = matchedRate?.isFreeForCustomer ?? (simType === "New");
  const rate = matchedRate?.customerRate ?? 0;
  const commission = matchedRate?.commissionRate ?? (simType === "New" ? 10 : 0);
  const customerTotal = isFree ? 0 : Math.round(rate * quantity);
  const commissionTotal = Math.round(commission * quantity);
  const total = customerTotal + commissionTotal;

  const handleSubmit = async () => {
    if (!customer || quantity <= 0) return;
    const staff = staffList.find((s) => s.id === customer);
    if (!staff) return;
    setSubmitting(true);
    try {
      const parts = [`${supplier} ${simType} sale x${quantity} to ${staff.name} (${staff.id})`];
      if (customerTotal > 0) parts.push(`Customer paid PKR ${customerTotal}`);
      if (commissionTotal > 0) parts.push(`Company commission PKR ${commissionTotal}`);
      if (isFree) parts.push("[FREE to customer]");
      await addAccountingEntry({
        type: "income",
        category: "SIM Sales Revenue",
        amount: total,
        date: toStorageDate(),
        description: parts.join(" - "),
        staffId: staff.id,
        staffName: staff.name,
      });
      setSupplier("Telenor"); setSimType("New"); setQuantity(1); setCustomer("");
      onComplete();
    } catch (e) {
      console.error(e);
      alert("Failed to record sale.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100"><h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Smartphone size={16} className="text-[#0A2647]" /> Record SIM Sale</h3></div>
      <div className="p-5 grid sm:grid-cols-2 gap-4">
        <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Supplier</label>
          <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm">
            {["Telenor", "Jazz", "Zong", "Ufone", "Default"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label className="block text-gray-500 text-xs font-medium mb-1.5">SIM Type</label>
          <select value={simType} onChange={(e) => setSimType(e.target.value as any)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm">
            {(["New", "HLR-MNP", "HLR-Replace", "HLR-BYN"] as const).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Quantity</label>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
        </div>
        <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Customer (DSO/DSM)</label>
          <div className="flex gap-2">
            <select value={customerType} onChange={(e) => { setCustomerType(e.target.value as any); setCustomer(""); }} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm">
              <option value="DSO">DSO</option><option value="DSM">DSM</option>
            </select>
            <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm">
              <option value="">Select staff</option>
              {staffList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-medium">Income to record</p>
            <p className="text-gray-900 font-bold">
              {total > 0 ? `PKR ${total.toLocaleString()}` : "PKR 0"}{" "}
              {isFree && customerTotal === 0 && <span className="text-green-600 font-medium">(FREE to customer{commissionTotal > 0 ? `, commission PKR ${commissionTotal.toLocaleString()}` : ""})</span>}
              {!isFree && customerTotal > 0 && <span className="text-gray-500 font-medium">(Customer pays PKR {customerTotal.toLocaleString()}{commissionTotal > 0 ? ` + commission PKR ${commissionTotal.toLocaleString()}` : ""})</span>}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">New SIMs: free to customer, income = company commission. HLR SIMs: income = amount collected from customer.</p>
          </div>
          <button onClick={handleSubmit} disabled={!customer || quantity <= 0 || submitting}
            className="px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-40 inline-flex items-center gap-2">
            <Check size={14} /> {submitting ? "Recording..." : "Record Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
