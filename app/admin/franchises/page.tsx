"use client";

import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, Building2, X, Save, RefreshCw, Building } from "lucide-react";
import { useData, Franchise } from "@/lib/DataContext";

export default function FranchisesPage() {
  const { franchises, companies, addFranchise, updateFranchise, deleteFranchise } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Franchise Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all franchise accounts, subscriptions, and status</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Add Franchise
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name, or owner..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Pending", "Suspended"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Franchise</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Owner</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Location</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Package</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Company</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Team</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0A2647] flex items-center justify-center text-white text-xs font-bold">{f.id.split("-")[0]}</div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{f.id}</p>
                        <p className="text-gray-500 text-xs">{f.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-gray-700 text-sm">{f.owner}</p>
                    <p className="text-gray-400 text-xs">{f.mobile}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-gray-700 text-sm">{f.city}</p>
                    <p className="text-gray-400 text-xs">{f.province}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">{f.package}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${f.status === "Active" ? "bg-green-50 text-green-700" : f.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{f.status}</span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    {f.companyId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                        <Building size={10} /> {getCompanyName(f.companyId)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Self Work</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell text-gray-600 text-sm">DSM: {f.dsm} | DSO: {f.dso}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(f)} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-gray-100 rounded-lg transition-all" title="View"><Eye size={14} /></button>
                      <button onClick={() => openEdit(f)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit"><Edit size={14} /></button>
                      <button onClick={() => setShowDeleteConfirm(f.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No franchises found</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedFranchise && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Franchise Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C8A951] to-[#B8960E] flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#0A2647] font-black text-xl">{selectedFranchise.id.split("-")[0]}</span>
                </div>
                <h4 className="text-gray-900 font-bold text-lg">{selectedFranchise.name}</h4>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${selectedFranchise.status === "Active" ? "bg-green-50 text-green-700" : selectedFranchise.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{selectedFranchise.status}</span>
              </div>
              {[["Franchise ID", selectedFranchise.id], ["Owner", selectedFranchise.owner], ["CNIC", selectedFranchise.cnic], ["Mobile", selectedFranchise.mobile], ["Email", selectedFranchise.email], ["Location", `${selectedFranchise.city}, ${selectedFranchise.province}`], ["Package", selectedFranchise.package], ["Network", selectedFranchise.network || "—"], ["Company", selectedFranchise.companyId ? getCompanyName(selectedFranchise.companyId) : "Self Work"], ["Agreement", `${selectedFranchise.agreementStart} to ${selectedFranchise.agreementEnd}`], ["DSM Count", `${selectedFranchise.dsm}`], ["DSO Count", `${selectedFranchise.dso}`]].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setShowViewModal(false); openEdit(selectedFranchise); }} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all">Edit Franchise</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFormModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">{editingFranchise ? "Edit Franchise" : "Add Franchise"}</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                  {f.type === "select" && f.field !== "companyId" ? (
                    <select value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all">
                      {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
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
                            }} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${allSelected || selected ? "bg-[#0A2647] text-white border-[#0A2647]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                              {net}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-gray-400 text-[10px] mt-1">{form.network === "All" ? "All networks selected" : form.network || "No network selected"}</p>
                    </div>
                  ) : f.field === "companyId" ? (
                    <select value={form.companyId} onChange={(e) => setField("companyId", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all">
                      <option value="">Self Work (Independent)</option>
                      {companies.filter((c) => c.status === "Active").map((c) => (
                        <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                      ))}
                    </select>
                  ) : f.field === "password" ? (
                    <div className="flex gap-2">
                      <input type="text" value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all font-mono" />
                      <button type="button" onClick={generatePassword} title="Generate Password" className="px-3 py-2.5 bg-[#0A2647] text-white rounded-xl hover:bg-[#144272] transition-all inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                        <RefreshCw size={14} /> Generate
                      </button>
                    </div>
                  ) : (
                    <input type={f.type} value={form[f.field] as string} onChange={(e) => setField(f.field, f.type === "number" ? Number(e.target.value) : e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowFormModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all inline-flex items-center justify-center gap-2"><Save size={14} /> {editingFranchise ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-gray-900 font-bold mb-2">Delete Franchise?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. Franchise <span className="font-mono font-medium">{showDeleteConfirm}</span> will be permanently removed.</p>
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
