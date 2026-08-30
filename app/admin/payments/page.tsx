"use client";

import { useState } from "react";
import { DollarSign, CreditCard, Download, Plus, Edit, Trash2, X, Save, Receipt } from "lucide-react";
import { useData, Payment } from "@/lib/DataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const { payments, addPayment, updatePayment, deletePayment } = useData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const emptyForm: Payment = { id: "", franchise: "", amount: "", method: "Bank Transfer", date: new Date().toISOString().split("T")[0], status: "Pending", package: "Monthly" };
  const [form, setForm] = useState<Payment>(emptyForm);

  const filtered = payments.filter((p) => p.franchise.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  const submitSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Payments" }]}
        title="Payments & Billing"
        description="Manage invoices, payments, and billing"
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={`PKR ${totalRevenue.toLocaleString()}`} icon={DollarSign} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Pending Payments" value={`PKR ${pendingAmount.toLocaleString()}`} icon={CreditCard} iconClass="text-orange-600 bg-orange-50" />
        <StatCard label="Overdue" value={`PKR ${overdueAmount.toLocaleString()}`} icon={Receipt} iconClass="text-red-600 bg-red-50" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Invoices</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput placeholder="Search invoices..." value={search} onSearch={submitSearch} className="min-w-[200px] flex-1" />
            <Button variant="outline" size="md" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Franchise</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Amount</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Method</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground lg:table-cell">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-sm text-foreground">{p.id}</td>
                  <td className="px-6 py-3 font-mono text-sm text-muted-foreground">{p.franchise}</td>
                  <td className="hidden px-6 py-3 text-sm text-slate-600 md:table-cell">{p.package}</td>
                  <td className="px-6 py-3 text-sm font-bold text-foreground">PKR {Number(p.amount).toLocaleString()}</td>
                  <td className="hidden px-6 py-3 text-sm text-slate-600 md:table-cell">{p.method}</td>
                  <td className="hidden px-6 py-3 text-sm text-muted-foreground lg:table-cell">{formatDateDDMMYYYY(p.date)}</td>
                  <td className="px-6 py-3">
                    <StatusPill label={p.status} tone={toneForStatus(p.status)} />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(p)} title="Edit"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setShowDeleteConfirm(p.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices found" description="Try adjusting your search or create a new invoice." />
        ) : (
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        )}
      </Card>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">{editing ? "Edit Invoice" : "New Invoice"}</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowForm(false)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Invoice ID <span className="text-red-500">*</span></label>
                <Input type="text" value={form.id} onChange={(e) => setField("id", e.target.value)} disabled={!!editing} className="font-mono disabled:opacity-60" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Franchise ID <span className="text-red-500">*</span></label>
                <Input type="text" value={form.franchise} onChange={(e) => setField("franchise", e.target.value)} className="font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount (PKR) <span className="text-red-500">*</span></label>
                  <Input type="number" value={form.amount} onChange={(e) => setField("amount", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Package</label>
                  <Select value={form.package} onChange={(e) => setField("package", e.target.value)}>
                    <option>Monthly</option><option>Six Month</option><option>Annual</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Payment Method</label>
                  <Select value={form.method} onChange={(e) => setField("method", e.target.value)}>
                    <option>Bank Transfer</option><option>Easypaisa</option><option>JazzCash</option><option>Cash</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
                  <Select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                    <option>Paid</option><option>Pending</option><option>Overdue</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}><Save className="h-4 w-4" /> {editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="mb-2 text-base font-semibold text-foreground">Delete Invoice?</h3>
            <p className="mb-6 text-sm text-muted-foreground">This will permanently delete invoice <span className="font-mono font-medium text-foreground">{showDeleteConfirm}</span>.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(showDeleteConfirm)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}