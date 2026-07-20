"use client";

import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, Building2, X, Save, RefreshCw } from "lucide-react";
import { useData, Company } from "@/lib/DataContext";

export default function CompaniesPage() {
  const { companies, addCompany, updateCompany, deleteCompany } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Company Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all company accounts that supervise multiple franchises</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Add Company
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name, or owner..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Suspended"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Company</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Owner</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Location</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Franchises</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{c.id.split("-")[1]}</div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{c.id}</p>
                        <p className="text-gray-500 text-xs">{c.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-gray-700 text-sm">{c.owner}</p>
                    <p className="text-gray-400 text-xs">{c.mobile}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-gray-700 text-sm">{c.city}</p>
                    <p className="text-gray-400 text-xs">{c.province}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700 text-sm font-medium">{c.franchiseCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${c.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(c)} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-gray-100 rounded-lg transition-all" title="View"><Eye size={14} /></button>
                      <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit"><Edit size={14} /></button>
                      <button onClick={() => setShowDeleteConfirm(c.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
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
            <p className="text-gray-400 text-sm">No companies found</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Company Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-black text-xl">{selectedCompany.id.split("-")[1]}</span>
                </div>
                <h4 className="text-gray-900 font-bold text-lg">{selectedCompany.name}</h4>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${selectedCompany.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{selectedCompany.status}</span>
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
                <div key={label as string} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setShowViewModal(false); openEdit(selectedCompany); }} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all">Edit Company</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFormModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">{editingCompany ? "Edit Company" : "Add Company"}</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                  {f.type === "select" ? (
                    <select value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all">
                      {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.field === "password" ? (
                    <div className="flex gap-2">
                      <input type="text" value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all font-mono" />
                      <button type="button" onClick={generatePassword} title="Generate Password" className="px-3 py-2.5 bg-[#0A2647] text-white rounded-xl hover:bg-[#144272] transition-all inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                        <RefreshCw size={14} /> Generate
                      </button>
                    </div>
                  ) : (
                    <input type={f.type} value={form[f.field] as string} onChange={(e) => setField(f.field, e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
                  )}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Address</label>
                <textarea value={form.address} onChange={(e) => setField("address", e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowFormModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all inline-flex items-center justify-center gap-2"><Save size={14} /> {editingCompany ? "Update" : "Create"}</button>
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
            <h3 className="text-gray-900 font-bold mb-2">Delete Company?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. Company <span className="font-mono font-medium">{showDeleteConfirm}</span> will be permanently removed. Associated franchises will become Self Work.</p>
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
