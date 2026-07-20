"use client";

import { useState } from "react";
import { DollarSign, CreditCard, Search, Download, Plus, Edit, Trash2, X, Save } from "lucide-react";
import { useData, Payment } from "@/lib/DataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

export default function PaymentsPage() {
  const { payments, addPayment, updatePayment, deletePayment } = useData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const emptyForm: Payment = { id: "", franchise: "", amount: "", method: "Bank Transfer", date: new Date().toISOString().split("T")[0], status: "Pending", package: "Monthly" };
  const [form, setForm] = useState<Payment>(emptyForm);

  const filtered = payments.filter((p) => p.franchise.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));

  const totalRevenue = payments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = payments.filter((p) => p.status === "Pending").reduce((sum, p) => sum + Number(p.amount), 0);
  const overdueAmount = payments.filter((p) => p.status === "Overdue").reduce((sum, p) => sum + Number(p.amount), 0);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Payment) => { setEditing(p); setForm({ ...p }); setShowForm(true); };

  const handleSave = () => {
    if (!form.id || !form.franchise || !form.amount) return;
    if (editing) {
      updatePayment(editing.id, form);
    } else {
      addPayment(form);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deletePayment(id);
    setShowDeleteConfirm(null);
  };

  const setField = (field: keyof Payment, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const exportCSV = () => {
    const headers = ["Invoice", "Franchise", "Package", "Amount", "Method", "Date", "Status"];
    const rows = filtered.map((p) => [p.id, p.franchise, p.package, p.amount, p.method, p.date, p.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "payments-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Payments & Billing</h1>
          <p className="text-gray-500 text-sm mt-1">Manage invoices, payments, and billing</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, icon: <DollarSign size={18} className="text-green-600" />, color: "bg-green-50" },
          { label: "Pending Payments", value: `PKR ${pendingAmount.toLocaleString()}`, icon: <CreditCard size={18} className="text-yellow-600" />, color: "bg-yellow-50" },
          { label: "Overdue", value: `PKR ${overdueAmount.toLocaleString()}`, icon: <DollarSign size={18} className="text-red-600" />, color: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
              <div>
                <p className="text-xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 w-72 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
            <Search size={14} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
          </div>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Invoice</th>
                <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Franchise</th>
                <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Package</th>
                <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Method</th>
                <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Date</th>
                <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-right px-6 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-900 font-mono text-sm">{p.id}</td>
                  <td className="px-6 py-3 text-gray-600 text-sm font-mono">{p.franchise}</td>
                  <td className="px-6 py-3 hidden md:table-cell text-gray-600 text-sm">{p.package}</td>
                  <td className="px-6 py-3 text-gray-900 font-bold text-sm">PKR {Number(p.amount).toLocaleString()}</td>
                  <td className="px-6 py-3 hidden md:table-cell text-gray-600 text-sm">{p.method}</td>
                  <td className="px-6 py-3 hidden lg:table-cell text-gray-400 text-sm">{formatDateDDMMYYYY(p.date)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${p.status === "Paid" ? "bg-green-50 text-green-700" : p.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit"><Edit size={14} /></button>
                      <button onClick={() => setShowDeleteConfirm(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">{editing ? "Edit Invoice" : "New Invoice"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Invoice ID <span className="text-red-500">*</span></label>
                <input type="text" value={form.id} onChange={(e) => setField("id", e.target.value)} disabled={!!editing} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Franchise ID <span className="text-red-500">*</span></label>
                <input type="text" value={form.franchise} onChange={(e) => setField("franchise", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Amount (PKR) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.amount} onChange={(e) => setField("amount", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Package</label>
                  <select value={form.package} onChange={(e) => setField("package", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    <option>Monthly</option><option>Six Month</option><option>Annual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Payment Method</label>
                  <select value={form.method} onChange={(e) => setField("method", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    <option>Bank Transfer</option><option>Easypaisa</option><option>JazzCash</option><option>Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    <option>Paid</option><option>Pending</option><option>Overdue</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all inline-flex items-center justify-center gap-2"><Save size={14} /> {editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-gray-900 font-bold mb-2">Delete Invoice?</h3>
            <p className="text-gray-500 text-sm mb-6">This will permanently delete invoice <span className="font-mono font-medium">{showDeleteConfirm}</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
