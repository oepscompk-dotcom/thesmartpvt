"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Landmark, Plus, Edit, Trash2, X, Save, ArrowDown, ArrowUp } from "lucide-react";
import { useFranchiseData, Account } from "@/lib/FranchiseDataContext";

export default function AccountsPage() {
  const { bankAccounts, addAccount, updateAccount, deleteAccount } = useFranchiseData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const emptyForm: Account = { id: "", name: "", type: "Bank", accountNumber: "", balance: 0, status: "Active" };
  const [form, setForm] = useState<Account>(emptyForm);

  const filtered = bankAccounts.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()));
  const totalBalance = bankAccounts.filter((a) => a.status === "Active").reduce((s, a) => s + a.balance, 0);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, id: `ACC-${String(bankAccounts.length + 1).padStart(3, "0")}` }); setShowForm(true); };
  const openEdit = (a: Account) => { setEditing(a); setForm({ ...a }); setShowForm(true); };
  const handleSave = () => {
    if (!form.name) return;
    if (editing) updateAccount(editing.id, form);
    else addAccount(form);
    setShowForm(false);
  };
  const setField = (field: keyof Account, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Bank accounts and cash management</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Add Account
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
        <p className="text-gray-500 text-xs mb-1">Total Balance</p>
        <p className="text-3xl font-black text-[#0A2647]">PKR {totalBalance.toLocaleString()}</p>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Landmark size={18} /></div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${a.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>{a.status}</span>
            </div>
            <h3 className="text-gray-900 font-bold text-sm mb-1">{a.name}</h3>
            <p className="text-gray-400 text-xs font-mono mb-3">{a.accountNumber}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">{a.type}</span>
              <span className="text-lg font-black text-gray-900 ml-auto">PKR {a.balance.toLocaleString()}</span>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button onClick={() => openEdit(a)} className="flex-1 py-2 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-all">Edit</button>
              <button onClick={() => deleteAccount(a.id)} className="py-2 px-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-all"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">{editing ? "Edit Account" : "Add Account"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Account ID</label><input type="text" value={form.id} onChange={(e) => setField("id", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Name</label><input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Type</label><select value={form.type} onChange={(e) => setField("type", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">{["Bank", "Cash", "Digital Wallet"].map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Account Number</label><input type="text" value={form.accountNumber} onChange={(e) => setField("accountNumber", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Balance (PKR)</label><input type="number" value={form.balance || ""} onChange={(e) => setField("balance", Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Status</label><select value={form.status} onChange={(e) => setField("status", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">{["Active", "Inactive"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
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
