"use client";

import { useState } from "react";
import {
  BarChart3, Plus, Trash2, Landmark, Receipt, Wallet, TrendingUp, TrendingDown,
  Save, Search, Check, DollarSign, Smartphone, Clock, CheckCircle2,
} from "lucide-react";
import { useFranchiseData, AccountEntry, SIMRateCard, SIMSale } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY, toStorageDate } from "@/lib/dateUtils";

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
        {TabBtn("sales", "SIM Sales & Collections", <Smartphone size={14} />)}
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
            <button onClick={() => setEditingRate({ id: `RC-${Date.now()}`, supplier: "Default", simType: "New", customerRate: 0, commissionRate: 10, staffCommissionRate: 0, staffCommissionBvs: 0, staffCommissionFca: 0, staffCommissionIfca: 0, isFreeForCustomer: true, franchiseId: auth.franchiseId })}
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
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">DSO/DSM Comm BVS (PKR)</th>
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">FCA (PKR)</th>
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">IFCA (PKR)</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Free</th>
                <th className="w-20" />
              </tr></thead>
              <tbody>
                {simRateCards.length === 0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-gray-400 text-sm">No rate cards</td></tr>}
                {simRateCards.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-gray-900 text-sm font-medium">{r.supplier}</td>
                    <td className="px-5 py-3 text-gray-600 text-sm">{r.simType}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900">{r.customerRate.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-green-600">{(r.commissionRate || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-[#0A2647]">{(r.staffCommissionBvs ?? r.staffCommissionRate ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-[#0A2647]">{(r.staffCommissionFca ?? r.staffCommissionRate ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold text-[#0A2647]">{(r.staffCommissionIfca ?? r.staffCommissionRate ?? 0).toLocaleString()}</td>
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

      {/* SIM Sales & Collections tab */}
      {tab === "sales" && <SalesTab sales={simSales} onMarkReceived={(id, method) => markSIMCollectionReceived(id, method)} />}

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
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">DSO/DSM Commission (PKR per stage)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-400 text-[10px] font-medium mb-1">BVS</label>
                <input type="number" value={local.staffCommissionBvs ?? local.staffCommissionRate ?? 0} onChange={(e) => setLocal((p) => ({ ...p, staffCommissionBvs: Number(e.target.value) }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] font-medium mb-1">FCA</label>
                <input type="number" value={local.staffCommissionFca ?? local.staffCommissionRate ?? 0} onChange={(e) => setLocal((p) => ({ ...p, staffCommissionFca: Number(e.target.value) }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] font-medium mb-1">IFCA</label>
                <input type="number" value={local.staffCommissionIfca ?? local.staffCommissionRate ?? 0} onChange={(e) => setLocal((p) => ({ ...p, staffCommissionIfca: Number(e.target.value) }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm" />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Commission paid to DSO/DSM per verified stage — BVS, FCA and IFCA each pay out when the value is set to 1</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><TrendingUp size={18} /></div>
          <p className="text-2xl sm:text-3xl font-black text-green-600">PKR {totalIncome.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Auto Revenue</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-2"><Clock size={18} /></div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">PKR {pendingTotal.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Pending Collections ({sales.filter((r) => r.collectionStatus === "Pending").length})</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-2"><CheckCircle2 size={18} /></div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">PKR {receivedTotal.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Received Collections</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["All", "Pending", "Received", "N/A"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === s ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Smartphone size={16} className="text-[#0A2647]" /> Auto-Generated SIM Sales</h3>
          <span className="px-2.5 py-1 bg-[#0A2647]/10 text-[#0A2647] rounded-lg text-xs font-bold">{filtered.length} Sale(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">SIM</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Type / Stage</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">DSO/DSM</th>
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">Income (PKR)</th>
                <th className="text-right px-5 py-3 text-gray-500 text-xs font-medium uppercase">Staff Comm. (PKR)</th>
                <th className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">Collection</th>
                <th className="text-center px-5 py-3 text-gray-500 text-xs font-medium uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400 text-sm">No SIM sales yet. Verify SIMs in Active SIMs (BVS/FCA/IFCA = 1) to auto-generate sales.</td></tr>}
              {[...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600 text-sm">{formatDateDDMMYYYY(r.saleDate)}</td>
                  <td className="px-5 py-3">
                    <p className="text-gray-900 text-sm font-mono font-medium">{r.simNumber}</p>
                    {r.network && <p className="text-gray-400 text-[10px]">{r.network} &middot; {r.supplier}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-700 text-sm">{r.simType} <span className="text-gray-400 text-[10px]">({r.stage})</span></td>
                  <td className="px-5 py-3 text-gray-700 text-sm">{r.staffName} <span className="text-gray-400 text-[10px]">({r.staffRole})</span></td>
                  <td className="px-5 py-3 text-right font-bold text-green-600">+PKR {r.income.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-bold text-[#0A2647]">{r.staffCommission.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    {r.collectionStatus === "N/A" ? (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500">N/A</span>
                    ) : r.collectionStatus === "Received" ? (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-700">Received{r.receivedMethod ? ` (${r.receivedMethod})` : ""}</span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700">Pending PKR {r.collectionAmount.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {r.collectionStatus === "Pending" ? (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleMark(r.id, "Online")} disabled={!!markId}
                          className="px-3 py-1.5 bg-[#0A2647] text-white text-[11px] font-bold rounded-lg hover:bg-[#144272] disabled:opacity-40">Online</button>
                        <button onClick={() => handleMark(r.id, "Cash")} disabled={!!markId}
                          className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 disabled:opacity-40">Cash</button>
                      </div>
                    ) : <span className="text-gray-300 text-xs">{"\u2014"}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
        New SIMs: free for customer &mdash; income is the company commission, and DSO/DSM commission is credited to their wallet and salary. HLR (MNP/Replace/BYN): DSO/DSM collects the customer amount, shown as a pending collection here; mark <strong>Online</strong> or <strong>Cash</strong> when the franchise receives it to record income. Unreturned pending collections are auto-deducted from salary at payroll generation.
      </div>
    </div>
  );
}

