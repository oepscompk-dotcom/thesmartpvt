"use client";

import { useState } from "react";
import { Plus, Eye, Edit, Trash2, Building2, X, Save, RefreshCw } from "lucide-react";
import { useData, Franchise } from "@/lib/DataContext";
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

export default function FranchisesPage() {
  const { franchises, companies, addFranchise, updateFranchise, deleteFranchise } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);

  const emptyForm: Franchise = { id: "", name: "", owner: "", cnic: "", mobile: "", email: "", province: "", city: "", package: "Monthly", status: "Active", agreementStart: "", agreementEnd: "", dsm: 0, dso: 0, password: "", companyId: "", network: "" };
  const [form, setForm] = useState<Franchise>(emptyForm);

  const getCompanyName = (companyId: string) => {
    if (!companyId) return "";
    const c = companies.find((c) => c.id === companyId);
    return c ? c.name : companyId;
  };

  const filtered = franchises.filter((f) => {
    const matchSearch = f.id.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase()) || f.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openAdd = () => { setEditingFranchise(null); setForm(emptyForm); setShowFormModal(true); };
  const openEdit = (f: Franchise) => { setEditingFranchise(f); setForm({ ...emptyForm, ...f, network: f.network || "" }); setShowFormModal(true); };
  const openView = (f: Franchise) => { setSelectedFranchise(f); setShowViewModal(true); };

  const handleSave = () => {
    if (!form.id || !form.name || !form.owner) return;
    const saveForm = { ...form, id: form.id.trim().toUpperCase(), name: form.name.trim() };
    if (editingFranchise) {
      updateFranchise(editingFranchise.id, saveForm);
    } else {
      addFranchise(saveForm);
    }
    setShowFormModal(false);
  };

  const handleDelete = (id: string) => {
    deleteFranchise(id);
    setShowDeleteConfirm(null);
  };

  const setField = (field: keyof Franchise, value: string | number) => {
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
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Franchises" }]}
        title="Franchise Management"
        description="Manage all franchise accounts, subscriptions, and status"
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Franchise
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Search by ID, name, or owner..." value={search} onSearch={submitSearch} />
        <div className="flex flex-wrap gap-2">
          {["All", "Active", "Pending", "Suspended"].map((s) => (
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
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left">Sr.No</th>
                <th className="px-4 py-3 text-left">Franchise</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Owner</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Location</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Package</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="hidden px-4 py-3 text-left xl:table-cell">Company</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((f, idx) => (
                <tr key={f.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-[10px] font-bold text-brand-700">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                        {f.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{f.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <p className="text-sm text-foreground">{f.owner}</p>
                    <p className="font-mono text-xs text-muted-foreground">{f.mobile}</p>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <p className="text-sm text-foreground">{f.city}</p>
                    <p className="text-xs text-muted-foreground">{f.province}</p>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <StatusPill label={f.package} tone="brand" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill label={f.status} tone={toneForStatus(f.status)} />
                  </td>
                  <td className="hidden px-4 py-3 xl:table-cell">
                    {f.companyId ? (
                      <StatusPill label={getCompanyName(f.companyId)} tone="brand" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Self Work</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(f)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(f)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(f.id)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Building2} title="No franchises found" description="Try adjusting your search or status filter." />
        ) : (
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        )}
      </Card>

      {/* View Modal */}
      {showViewModal && selectedFranchise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowViewModal(false)}>
          <div className="w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">Franchise Details</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowViewModal(false)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4 p-6">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50 text-xl font-bold text-brand-700">
                  {selectedFranchise.id.split("-")[0]}
                </div>
                <h4 className="text-lg font-bold text-foreground">{selectedFranchise.name}</h4>
                <div className="mt-2">
                  <StatusPill label={selectedFranchise.status} tone={toneForStatus(selectedFranchise.status)} />
                </div>
              </div>
              {[["Franchise ID", selectedFranchise.id], ["Owner", selectedFranchise.owner], ["CNIC", selectedFranchise.cnic], ["Mobile", selectedFranchise.mobile], ["Email", selectedFranchise.email], ["Location", `${selectedFranchise.city}, ${selectedFranchise.province}`], ["Package", selectedFranchise.package], ["Network", selectedFranchise.network || "—"], ["Company", selectedFranchise.companyId ? getCompanyName(selectedFranchise.companyId) : "Self Work"], ["Agreement", `${selectedFranchise.agreementStart} to ${selectedFranchise.agreementEnd}`], ["DSM Count", `${selectedFranchise.dsm}`], ["DSO Count", `${selectedFranchise.dso}`]].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <span className={`text-sm font-medium text-foreground ${label === "Franchise ID" ? "font-mono text-xs text-muted-foreground" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button className="flex-1" onClick={() => { setShowViewModal(false); openEdit(selectedFranchise); }}>Edit Franchise</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowFormModal(false)}>
          <div className="w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">{editingFranchise ? "Edit Franchise" : "Add Franchise"}</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowFormModal(false)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              {[
                { label: "Franchise ID", field: "id" as const, type: "text", required: true, colSpan: false },
                { label: "Name", field: "name" as const, type: "text", required: true, colSpan: false },
                { label: "Owner Name", field: "owner" as const, type: "text", required: true, colSpan: false },
                { label: "CNIC", field: "cnic" as const, type: "text", required: false, colSpan: false },
                { label: "Mobile", field: "mobile" as const, type: "text", required: false, colSpan: false },
                { label: "Email", field: "email" as const, type: "email", required: false, colSpan: false },
                { label: "Province", field: "province" as const, type: "text", required: false, colSpan: false },
                { label: "City", field: "city" as const, type: "text", required: false, colSpan: false },
                { label: "Package", field: "package" as const, type: "select", options: ["Monthly", "Six Month", "Annual"], required: true, colSpan: false },
                { label: "Status", field: "status" as const, type: "select", options: ["Active", "Pending", "Suspended"], required: true, colSpan: false },
                { label: "Network", field: "network" as const, type: "network", required: false, colSpan: true },
                { label: "Company", field: "companyId" as const, type: "select", options: companies.filter((c) => c.status === "Active").map((c) => c.id), required: false, colSpan: false },
                { label: "Agreement Start", field: "agreementStart" as const, type: "date", required: false, colSpan: false },
                { label: "Agreement End", field: "agreementEnd" as const, type: "date", required: false, colSpan: false },
                { label: "Password", field: "password" as const, type: "text", required: false, colSpan: false },
              ].map((f) => (
                <div key={f.field} className={f.colSpan ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                  {f.type === "select" && f.field !== "companyId" ? (
                    <Select value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)}>
                      {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                    </Select>
                  ) : f.field === "network" ? (
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {["Telenor", "Jazz", "Ufone", "Zong", "SCO", "Warid"].map((net) => {
                          const selected = (form.network || "").split(",").includes(net);
                          const allSelected = form.network === "All";
                          return (
                            <button key={net} type="button" onClick={() => {
                              if (allSelected) { setField("network", net); return; }
                              const current = form.network ? form.network.split(",") : [];
                              const next = current.includes(net) ? current.filter((n) => n !== net) : [...current, net];
                              setField("network", next.length === 6 ? "All" : next.join(","));
                            }} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${allSelected || selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"}`}>
                              {net}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">{form.network === "All" ? "All networks selected" : form.network || "No network selected"}</p>
                    </div>
                  ) : f.field === "companyId" ? (
                    <Select value={form.companyId} onChange={(e) => setField("companyId", e.target.value)}>
                      <option value="">Self Work (Independent)</option>
                      {companies.filter((c) => c.status === "Active").map((c) => (
                        <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                      ))}
                    </Select>
                  ) : f.field === "password" ? (
                    <div className="flex gap-2">
                      <Input type="text" value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)} className="flex-1 font-mono" />
                      <Button type="button" onClick={generatePassword} title="Generate Password" variant="outline" className="whitespace-nowrap">
                        <RefreshCw className="h-4 w-4" /> Generate
                      </Button>
                    </div>
                  ) : (
                    <Input type={f.type} value={form[f.field] as string} onChange={(e) => setField(f.field, f.type === "number" ? Number(e.target.value) : e.target.value)} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowFormModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}><Save className="h-4 w-4" /> {editingFranchise ? "Update" : "Create"}</Button>
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
            <h3 className="mb-2 text-base font-semibold text-foreground">Delete Franchise?</h3>
            <p className="mb-6 text-sm text-muted-foreground">This action cannot be undone. Franchise <span className="font-mono font-medium text-foreground">{showDeleteConfirm}</span> will be permanently removed.</p>
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