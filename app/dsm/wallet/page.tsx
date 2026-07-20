"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { Wallet, ArrowUpRight, ArrowDownLeft, Search, Filter, CreditCard } from "lucide-react";

export default function WalletPage() {
  const { wallet } = useDSMData();
  const [filter, setFilter] = useState<"all" | "Credit" | "Debit">("all");
  const [search, setSearch] = useState("");

  const totalCredits = wallet.filter((t) => t.type === "Credit").reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = wallet.filter((t) => t.type === "Debit").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalCredits - totalDebits;

  const filtered = wallet
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) => search === "" || t.note.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Wallet</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your transactions</p>

        <div className="bg-gradient-to-br from-[#0057FF] to-[#003FCC] rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Net Balance</p>
              <p className="text-3xl font-bold">PKR {netBalance.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={16} className="text-green-300" />
                <span className="text-white/70 text-sm">Total Credits</span>
              </div>
              <p className="text-xl font-bold text-green-300">PKR {totalCredits.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft size={16} className="text-red-300" />
                <span className="text-white/70 text-sm">Total Debits</span>
              </div>
              <p className="text-xl font-bold text-red-300">PKR {totalDebits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "Credit", "Debit"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  filter === f ? "bg-[#0057FF] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "Credit" ? "bg-green-100" : "bg-red-100"}`}>
                      {t.type === "Credit" ? (
                        <ArrowUpRight size={18} className="text-green-600" />
                      ) : (
                        <ArrowDownLeft size={18} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.note}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateDDMMYYYY(t.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.type === "Credit" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "Credit" ? "+" : "-"}PKR {t.amount.toLocaleString()}
                    </p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${t.type === "Credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {t.type === "Credit" ? "Credit" : "Debit"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
