"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Receipt } from "lucide-react";
import { useFranchiseData, Expense } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

export default function ExpensesPage() {
  const { auth, expenses, addExpense, updateExpense, deleteExpense } = useFranchiseData();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const emptyForm: Expense = { id: "", category: "", amount: 0, note: "", date: new Date().toISOString().split("T")[0], franchiseId: auth.franchiseId };
  const [form, setForm] = useState<Expense>(emptyForm);

  const categories = ["Rent", "Utilities", "Staff Salary", "Marketing", "Travel", "Maintenance", "Office Supplies", "Internet", "Other"];
  const filtered = expenses.filter((e) => e.date.startsWith(month) && ((e.category || "").toLowerCase().includes(search.toLowerCase()) || (e.note || "").toLowerCase().includes(search.toLowerCase())));
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, id: `EXP-${String(expenses.length + 1).padStart(3, "0")}` }); setShowForm(true); };
  const openEdit = (e: Expense) => { setEditing(e); setForm({ ...e }); setShowForm(true); };
  const handleSave = () => {
    if (!form.category) return;
    if (editing) updateExpense(editing.id, form);
    else addExpense(form);
    setShowForm(false);
  };
  const setField = (field: keyof Expense, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const grouped = categories.map((c) => ({ category: c, total: filtered.filter((e) => (e.category || "") === c).reduce((s, e) => s + e.amount, 0) })).filter((g) => g.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Track franchise expenses</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center"><p className="text-3xl font-black text-red-600">PKR {total.toLocaleString()}</p><p className="text-gray-500 text-xs mt-1">Total Expenses ({month})</p></div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200"><p className="text-gray-900 font-bold text-sm mb-2">Top Categories</p>{grouped.slice(0, 3).map((g) => <div key={g.category} className="flex justify-between text-xs mb-1"><span className="text-gray-500">{g.category}</span><span className="font-medium text-gray-900">PKR {g.total.toLocaleString()}</span></div>)}{grouped.length === 0 && <p className="text-gray-400 text-xs">No expenses</p>}</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Category</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Note</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 text-sm">{formatDateDDMMYYYY(e.date)}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">{e.category}</span></td>
                  <td className="px-6 py-4 text-right font-bold text-red-600 text-sm">PKR {e.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-gray-600 text-sm">{e.note}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(e)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit size={14} /></button>
                      <button onClick={() => deleteExpense(e.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="px-6 py-12 text-center"><Receipt size={32} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No expenses found</p></div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">{editing ? "Edit Expense" : "Add Expense"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Category</label><select value={form.category} onChange={(e) => setField("category", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50"><option value="">Select...</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Amount (PKR)</label><input type="number" value={form.amount || ""} onChange={(e) => setField("amount", Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Date</label><input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Note</label><input type="text" value={form.note} onChange={(e) => setField("note", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center justify-center gap-2"><Save size={14} /> {editing ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
