"use client";

import { useState } from "react";
import { Wallet as WalletIcon, Plus, ArrowDown, ArrowUp } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

export default function WalletPage() {
  const { auth, wallet, addWalletTransaction } = useFranchiseData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "Deposit" as "Deposit" | "Withdrawal", amount: 0, note: "" });

  const balance = wallet.reduce((sum, w) => w.type === "Deposit" ? sum + w.amount : sum - w.amount, 0);
  const deposits = wallet.filter((w) => w.type === "Deposit").reduce((s, w) => s + w.amount, 0);
  const withdrawals = wallet.filter((w) => w.type === "Withdrawal").reduce((s, w) => s + w.amount, 0);

  const handleSave = () => {
    if (form.amount <= 0) return;
    addWalletTransaction({ id: `WLT-${String(wallet.length + 1).padStart(3, "0")}`, franchiseId: auth.franchiseId, date: new Date().toISOString().split("T")[0], ...form });
    setShowForm(false);
    setForm({ type: "Deposit", amount: 0, note: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">Franchise wallet balance and transactions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><WalletIcon size={18} /></div>
          <p className="text-3xl font-black text-gray-900">PKR {balance.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Balance</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><ArrowDown size={18} /></div>
          <p className="text-3xl font-black text-green-600">PKR {deposits.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Deposits</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-2"><ArrowUp size={18} /></div>
          <p className="text-3xl font-black text-red-600">PKR {withdrawals.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Withdrawals</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Transaction ID</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Type</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {[...wallet].reverse().map((w) => (
                <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-900 text-sm font-medium">{w.id}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{formatDateDDMMYYYY(w.date)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${w.type === "Deposit" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{w.type}</span></td>
                  <td className="px-6 py-4 text-right"><span className={`font-bold text-sm ${w.type === "Deposit" ? "text-green-600" : "text-red-600"}`}>{w.type === "Deposit" ? "+" : "-"} PKR {w.amount.toLocaleString()}</span></td>
                  <td className="px-6 py-4 hidden md:table-cell text-gray-600 text-sm">{w.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {wallet.length === 0 && <div className="px-6 py-12 text-center"><WalletIcon size={32} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No transactions yet</p></div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Add Transaction</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Type</label><select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "Deposit" | "Withdrawal" }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50"><option value="Deposit">Deposit</option><option value="Withdrawal">Withdrawal</option></select></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Amount (PKR)</label><input type="number" value={form.amount || ""} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Note</label><input type="text" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272]">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
