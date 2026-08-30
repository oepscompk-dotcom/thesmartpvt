"use client";

import { useState } from "react";
import { Plus, Eye, Edit, Trash2, Building2, X, Save, RefreshCw } from "lucide-react";
import { useData, Company } from "@/lib/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

const PAGE_SIZE = 8;

export default function CompaniesPage() {
  const { companies, addCompany, updateCompany, deleteCompany } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const emptyForm: Company = { id: "", name: "", owner: "", email: "", mobile: "", address: "", city: "", province: "", status: "Active", password: "", franchiseCount: 0, createdAt: "", agreementStart: "", agreementEnd: "" };
  const [form, setForm] = useState<Company>(emptyForm);

  const filtered = companies.filter((c) => {
    const matchSearch = c.id.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()) || c.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openAdd = () => {
    setEditingCompany(null);
    const id = `COMP-${String(companies.length + 1).padStart(3, "0")}`;
    setForm({ ...emptyForm, id, createdAt: new Date().toISOString().split("T")[0] });
    setShowFormModal(true);
  };
  const openEdit = (c: Company) => { setEditingCompany(c); setForm({ ...c }); setShowFormModal(true); };
  const openView = (c: Company) => { setSelectedCompany(c); setShowViewModal(true); };

  const handleSave = () => {
    if (!form.id || !form.name || !form.owner) return;
    const saveForm = { ...form, id: form.id.trim().toUpperCase(), name: form.name.trim() };
    if (editingCompany) {
      updateCompany(editingCompany.id, saveForm);
    } else {
      addCompany(saveForm);
    }
    setShowFormModal(false);
  };

  const handleDelete = (id: string) => {
    deleteCompany(id);
    setShowDeleteConfirm(null);
  };

  const setField = (field: keyof Company, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let p = "Ts@";
    for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setForm((prev) => ({ ...prev, password: p }));
  };

  const submitSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Companies" }]}
        title="Company Management"
        description="Manage all company accounts that supervise multiple franchises"
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Company
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Search by ID, name, or owner..." value={search} onSearch={submitSearch} />
        <div className="flex flex-wrap gap-2">
          {["All", "Active", "Suspended"].map((s) => (
            <Button
              key={s}
              size="md"
              variant={statusFilter === s ? "primary" : "outline"}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Company</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Owner</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground lg:table-cell">Location</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground lg:table-cell">Franchises</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">{c.id.split("-")[1]}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <p className="text-sm text-foreground">{c.owner}</p>
                    <p className="font-mono text-xs text-muted-foreground">{c.mobile}</p>
                  </td>
                  <td className="hidden px-6 py-4 lg:table-cell">
                    <p className="text-sm text-foreground">{c.city}</p>
                    <p className="text-xs text-muted-foreground">{c.province}</p>
                  </td>
                  <td className="hidden px-6 py-4 lg:table-cell">
                    <span className="text-sm font-medium text-foreground">{c.franchiseCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill label={c.status} tone={toneForStatus(c.status)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openView(c)} title="View"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(c)} title="Edit"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setShowDeleteConfirm(c.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Building2} title="No companies found" description="Try adjusting your search or status filter." />
        ) : (
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        )}
      </Card>

      {/* View Modal */}
      {showViewModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowViewModal(false)}>
          <div className="w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">Company Details</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowViewModal(false)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4 p-6">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50 text-xl font-bold text-brand-700">
                  {selectedCompany.id.split("-")[1]}
                </div>
                <h4 className="text-lg font-bold text-foreground">{selectedCompany.name}</h4>
                <div className="mt-2">
                  <StatusPill label={selectedCompany.status} tone={toneForStatus(selectedCompany.status)} />
                </div>
              </div>
              {[
                ["Company ID", selectedCompany.id],
                ["Owner", selectedCompany.owner],
                ["Email", selectedCompany.email],
                ["Mobile", selectedCompany.mobile],
                ["Location", `${selectedCompany.city}, ${selectedCompany.province}`],
                ["Address", selectedCompany.address],
                ["Franchises", `${selectedCompany.franchiseCount}`],
                ["Created", selectedCompany.createdAt],
                ["Agreement Start", selectedCompany.agreementStart || "—"],
                ["Agreement End", selectedCompany.agreementEnd || "—"],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <span className={`text-sm font-medium text-foreground ${label === "Company ID" ? "font-mono text-xs text-muted-foreground" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button className="flex-1" onClick={() => { setShowViewModal(false); openEdit(selectedCompany); }}>Edit Company</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowFormModal(false)}>
          <div className="w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">{editingCompany ? "Edit Company" : "Add Company"}</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowFormModal(false)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              {[
                { label: "Company ID", field: "id" as const, type: "text", required: true },
                { label: "Company Name", field: "name" as const, type: "text", required: true },
                { label: "Owner Name", field: "owner" as const, type: "text", required: true },
                { label: "Email", field: "email" as const, type: "email", required: false },
                { label: "Mobile", field: "mobile" as const, type: "text", required: false },
                { label: "City", field: "city" as const, type: "text", required: false },
                { label: "Province", field: "province" as const, type: "text", required: false },
                { label: "Status", field: "status" as const, type: "select", options: ["Active", "Suspended"], required: true },
                { label: "Agreement Start", field: "agreementStart" as const, type: "date", required: false },
                { label: "Agreement End", field: "agreementEnd" as const, type: "date", required: false },
                { label: "Password", field: "password" as const, type: "text", required: false },
              ].map((f) => (
                <div key={f.field}>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                  {f.type === "select" ? (
                    <Select value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)}>
                      {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                    </Select>
                  ) : f.field === "password" ? (
                    <div className="flex gap-2">
                      <Input type="text" value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)} className="flex-1 font-mono" />
                      <Button type="button" onClick={generatePassword} title="Generate Password" variant="outline" className="whitespace-nowrap">
                        <RefreshCw className="h-4 w-4" /> Generate
                      </Button>
                    </div>
                  ) : (
                    <Input type={f.type} value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)} />
                  )}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Address</label>
                <textarea value={form.address} onChange={(e) => setField("address", e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowFormModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}><Save className="h-4 w-4" /> {editingCompany ? "Update" : "Create"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-foreground">Delete Company?</h3>
            <p className="mb-6 text-sm text-muted-foreground">This action cannot be undone. Company <span className="font-mono font-medium text-foreground">{showDeleteConfirm}</span> will be permanently removed. Associated franchises will become Self Work.</p>
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