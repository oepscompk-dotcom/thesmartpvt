"use client";

import { useState } from "react";
import { Wallet, Plus, ArrowDown, ArrowUp, X, Receipt, Smartphone, Landmark } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

export default function DSOWalletPage() {
  const { wallet, addWalletEntry, auth, staffWalletPayments } = useDSOData();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "Credit" as "Credit" | "Debit", amount: 0, note: "" });

  const balance = wallet.length > 0 ? wallet[0].balance : 0;
  const totalCredits = wallet.filter((w) => w.type === "Credit").reduce((s, w) => s + w.amount, 0);
  const totalDebits = wallet.filter((w) => w.type === "Debit").reduce((s, w) => s + w.amount, 0);

  const myPayments = staffWalletPayments.filter((p) => p.role === "DSO" && p.staffId === auth.dsoId);
  const myLoans = myPayments.filter((p) => p.type !== "Package");
  const myPackages = myPayments.filter((p) => p.type === "Package");
  const myOutstanding = myLoans.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);

  const handleSave = () => {
    if (form.amount <= 0) return;
    const newBalance = form.type === "Credit" ? balance + form.amount : balance - form.amount;
    addWalletEntry({
      id: `DSW-${String(wallet.length + 1).padStart(3, "0")}`,
      type: form.type,
      amount: form.amount,
      balance: newBalance,
      note: form.note,
      date: new Date().toISOString().split("T")[0],
      franchiseId: auth.franchiseId,
    });
    setShowModal(false);
    setForm({ type: "Credit", amount: 0, note: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">Your balance and transactions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#0A2647]/10 flex items-center justify-center text-[#0A2647] mx-auto mb-2"><Wallet size={18} /></div>
          <p className="text-3xl font-black text-gray-900">PKR {balance.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Balance</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><ArrowDown size={18} /></div>
          <p className="text-3xl font-black text-green-600">PKR {totalCredits.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Credits</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-2"><ArrowUp size={18} /></div>
          <p className="text-3xl font-black text-red-600">PKR {totalDebits.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Debits</p>
        </div>
      </div>

      {/* Loan / Advance & Package Earnings */}
      {(myLoans.length > 0 || myPackages.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Receipt size={16} className="text-[#0A2647]" /> Loan / Advance &amp; Package Earnings</h3>
            {myOutstanding > 0 && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">Outstanding: PKR {myOutstanding.toLocaleString()}</span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {[...myLoans].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    {p.type === "Advance" ? <Wallet size={15} className="text-purple-600" /> : <Landmark size={15} className="text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{p.type} Payment</p>
                    <p className="text-gray-400 text-xs">
                      {formatDateDDMMYYYY(p.paymentDate)} {p.note ? ` &middot; ${p.note}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+PKR {p.amount.toLocaleString()}</p>
                  <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === "Deducted" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status === "Deducted" ? "Deducted from Salary" : "Outstanding"}
                  </span>
                </div>
              </div>
            ))}
            {[...myPackages].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Smartphone size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">SIM Package</p>
                    <p className="text-gray-400 text-xs font-mono">{p.iccid || p.simNumber || p.simId || "\u2014"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+PKR {p.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">{formatDateDDMMYYYY(p.paymentDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Type</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Note</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Balance</th>
              </tr>
            </thead>
            <tbody>
              {[...wallet].map((w) => (
                <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 text-sm">{formatDateDDMMYYYY(w.date)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${w.type === "Credit" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{w.type}</span></td>
                  <td className="px-6 py-4 text-right"><span className={`font-bold text-sm ${w.type === "Credit" ? "text-green-600" : "text-red-600"}`}>{w.type === "Credit" ? "+" : "-"} PKR {w.amount.toLocaleString()}</span></td>
                  <td className="px-6 py-4 hidden md:table-cell text-gray-600 text-sm">{w.note}</td>
                  <td className="px-6 py-4 text-right font-bold text-sm text-gray-900">PKR {w.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {wallet.length === 0 && <div className="px-6 py-12 text-center"><Wallet size={32} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No transactions yet</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Add Transaction</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "Credit" | "Debit" }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Amount (PKR)</label>
                <input type="number" value={form.amount || ""} onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Note</label>
                <input type="text" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={form.amount <= 0} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
