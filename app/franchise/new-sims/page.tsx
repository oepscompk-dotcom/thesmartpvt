"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Smartphone, Package, ArrowRight, CheckSquare, Square, Check, ChevronDown, Calendar, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { useFranchiseData, SIM } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

function randAlpha(len: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < len; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function generateSimNumber(network: string): string {
  const prefixes: Record<string, string> = { Telenor: "034", Zong: "032", Jazz: "030", Ufone: "033" };
  return (prefixes[network] || "030") + randAlpha(7);
}

function generateICCID(): string {
  return "89" + randAlpha(2) + String(Math.floor(Math.random() * 10000000000)).padStart(10, "0");
}

function incrementICCID(startIccid: string, offset: number): string {
  const num = BigInt(startIccid);
  const result = num + BigInt(offset);
  return result.toString().padStart(startIccid.length, "0");
}

const NETWORKS = ["All", "Telenor", "Jazz", "Ufone", "Zong"];
const STATUSES = ["All", "In Stock", "Issued", "Activated", "Returned"];

export default function NewSIMsPage() {
  const { auth, sims, devices, addSIM, addSIMs, updateSIM, deleteSIM, deleteSIMs, issueRecords } = useFranchiseData();
  const [search, setSearch] = useState("");
  const [networkFilter, setNetworkFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SIM | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkEditDevice, setBulkEditDevice] = useState("");
  const [bulkEditNetwork, setBulkEditNetwork] = useState("");
  const [bulkEditStatus, setBulkEditStatus] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [bulkNetwork, setBulkNetwork] = useState("Jazz");
  const [bulkQuantity, setBulkQuantity] = useState(25);
  const [bulkDeviceId, setBulkDeviceId] = useState("");
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split("T")[0]);
  const [bulkStartIccid, setBulkStartIccid] = useState("");

  const newSIMs = sims.filter((s) => s.type === "new");
  const emptyForm: SIM = { id: "", network: "Jazz", simNumber: "", iccid: "", deviceId: "", status: "In Stock", receiveDate: new Date().toISOString().split("T")[0], franchiseId: auth.franchiseId, type: "new", statusDate: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState<SIM>(emptyForm);

  const getIssueInfo = (simId: string) => issueRecords.find((r) => r.simIds.includes(simId)) || null;

  const filtered = useMemo(() => {
    return newSIMs.filter((s) => {
      if (networkFilter !== "All" && s.network !== networkFilter) return false;
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      if (dateFrom && s.receiveDate < dateFrom) return false;
      if (dateTo && s.receiveDate > dateTo) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      const issueInfo = getIssueInfo(s.id);
      return (
        s.id.toLowerCase().includes(q) ||
        s.simNumber.toLowerCase().includes(q) ||
        s.iccid.toLowerCase().includes(q) ||
        (s.deviceId || "").toLowerCase().includes(q) ||
        (issueInfo?.retailerId || "").toLowerCase().includes(q) ||
        (issueInfo?.issuedTo || "").toLowerCase().includes(q)
      );
    });
  }, [newSIMs, search, networkFilter, statusFilter, dateFrom, dateTo, issueRecords]);

  const stats = useMemo(() => {
    const total = newSIMs.length;
    const inStock = newSIMs.filter((s) => s.status === "In Stock").length;
    const issued = newSIMs.filter((s) => s.status === "Issued").length;
    const activated = newSIMs.filter((s) => s.status === "Activated").length;
    const networkCounts: Record<string, number> = {};
    for (const s of newSIMs) networkCounts[s.network] = (networkCounts[s.network] || 0) + 1;
    return { total, inStock, issued, activated, networkCounts };
  }, [newSIMs]);

  const statusColors: Record<string, string> = {
    "In Stock": "bg-green-50 text-green-700 border border-green-200",
    "Issued": "bg-amber-50 text-amber-700 border border-amber-200",
    "Activated": "bg-blue-50 text-blue-700 border border-blue-200",
    "Returned": "bg-purple-50 text-purple-700 border border-purple-200",
    "Active": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  const networkColor: Record<string, string> = { Telenor: "bg-blue-50 text-blue-700 border border-blue-200", Jazz: "bg-red-50 text-red-700 border border-red-200", Ufone: "bg-green-50 text-green-700 border border-green-200", Zong: "bg-purple-50 text-purple-700 border border-purple-200" };
  const networkPrefix: Record<string, string> = { Telenor: "T", Jazz: "J", Ufone: "U", Zong: "Z" };

  const toggleSelect = (id: string) => setSelected((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]);
  const toggleSelectAll = () => selected.length === filtered.length ? setSelected([]) : setSelected(filtered.map((s) => s.id));

  const handleBulkDelete = () => { deleteSIMs(selected); setSelected([]); setShowBulkDelete(false); };
  const handleBulkEdit = () => {
    selected.forEach((id) => {
      const updates: Partial<SIM> = {};
      if (bulkEditDevice) updates.deviceId = bulkEditDevice;
      if (bulkEditNetwork) updates.network = bulkEditNetwork;
      if (bulkEditStatus) updates.status = bulkEditStatus;
      if (Object.keys(updates).length > 0) updateSIM(id, { ...newSIMs.find((s) => s.id === id)!, ...updates });
    });
    setSelected([]); setShowBulkEdit(false); setBulkEditDevice(""); setBulkEditNetwork(""); setBulkEditStatus("");
  };

  const openAdd = () => {
    setEditing(null);
    const prefix = networkPrefix[form.network] || "J";
    const num = newSIMs.filter((s) => s.network === form.network).length + 1;
    setForm({ ...emptyForm, id: `${prefix}-${String(num).padStart(4, "0")}` });
    setShowForm(true);
  };
  const openEdit = (s: SIM) => { setEditing(s); setForm({ ...s }); setShowForm(true); };
  const handleSave = () => {
    if (!form.simNumber) return;
    if (editing) updateSIM(editing.id, form);
    else addSIM(form);
    setShowForm(false);
  };
  const setField = (field: keyof SIM, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleBulkImport = () => {
    if (bulkQuantity <= 0) return;
    const prefix = networkPrefix[bulkNetwork] || "J";
    const startIdx = newSIMs.filter((s) => s.network === bulkNetwork).length + 1;
    const useSequentialIccid = bulkStartIccid.trim().length > 0;
    const list: SIM[] = [];
    for (let i = 0; i < bulkQuantity; i++) {
      list.push({
        id: `${prefix}-${String(startIdx + i).padStart(4, "0")}`,
        network: bulkNetwork, simNumber: generateSimNumber(bulkNetwork),
        iccid: useSequentialIccid ? incrementICCID(bulkStartIccid.trim(), i) : generateICCID(),
        deviceId: bulkDeviceId, status: "In Stock", receiveDate: bulkDate, franchiseId: auth.franchiseId, type: "new",
        statusDate: bulkDate,
      });
    }
    addSIMs(list); setShowBulk(false); setBulkStartIccid("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">New SIM Stock</h1>
          <p className="text-gray-500 text-sm mt-1">Manage new SIM inventory</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-md transition-all hover:scale-105">
            <Package size={16} /> Add Stock
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
            <Plus size={16} /> Add SIM
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total SIMs", value: stats.total, icon: Smartphone, color: "bg-[#0A2647]" },
          { label: "In Stock", value: stats.inStock, icon: Package, color: "bg-green-500" },
          { label: "Issued", value: stats.issued, icon: ArrowRight, color: "bg-amber-500" },
          { label: "Activated", value: stats.activated, icon: Check, color: "bg-blue-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}><s.icon size={18} className="text-white" /></div>
            <div>
              <p className="text-gray-400 text-xs font-medium">{s.label}</p>
              <p className="text-gray-900 text-lg font-black">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {NETWORKS.map((n) => {
          const count = n === "All" ? stats.total : (stats.networkCounts[n] || 0);
          return (
            <button key={n} onClick={() => setNetworkFilter(n)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${networkFilter === n ? "bg-[#0A2647] text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-[#0A2647]/30"}`}>
              <span>{n}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${networkFilter === n ? "bg-white/20" : "bg-gray-100"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-blue-700 text-sm font-medium">{selected.length} selected</span>
          <button onClick={() => setShowBulkEdit(true)} className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600">Bulk Edit</button>
          <button onClick={() => setShowBulkDelete(true)} className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600">Delete Selected</button>
          <button onClick={() => setSelected([])} className="text-blue-400 hover:text-blue-600 text-xs">Clear</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
            <Search size={16} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SIM ID, Number, ICCID, Device, Retailer..."
              className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="h-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none appearance-none cursor-pointer">
                {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex items-center gap-1">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#0A2647]/50" />
              <span className="text-gray-400 text-xs">to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#0A2647]/50" />
            </div>
            {(dateFrom || dateTo || statusFilter !== "All" || networkFilter !== "All" || search) && (
              <button onClick={() => { setSearch(""); setNetworkFilter("All"); setStatusFilter("All"); setDateFrom(""); setDateTo(""); }}
                className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-all">
                <X size={12} /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3.5 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#0A2647]">
                    {selected.length === filtered.length && filtered.length > 0 ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5 text-gray-500 text-xs font-medium uppercase">SIM ID</th>
                <th className="text-left px-4 py-3.5 text-gray-500 text-xs font-medium uppercase">Network</th>
                <th className="text-left px-4 py-3.5 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">SIM Number</th>
                <th className="text-left px-4 py-3.5 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">ICCID</th>
                <th className="text-left px-4 py-3.5 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-left px-4 py-3.5 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Status Date</th>
                <th className="text-left px-4 py-3.5 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Stock Date</th>
                <th className="text-right px-4 py-3.5 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected.includes(s.id) ? "bg-blue-50" : ""}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(s.id)} className="text-gray-400 hover:text-[#0A2647]">
                      {selected.includes(s.id) ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-gray-900 text-sm font-bold">{s.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${networkColor[s.network] || "bg-gray-50 text-gray-700"}`}>{s.network}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-mono text-gray-700 text-sm">{s.simNumber}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="font-mono text-gray-400 text-xs">{s.iccid}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusColors[s.status] || "bg-gray-50 text-gray-700"}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {s.statusDate ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Calendar size={10} className="text-gray-400" /> {formatDateDDMMYYYY(s.statusDate)}
                        </div>
                        {s.statusChangedFrom && (
                          <span className="text-[10px] text-gray-400 mt-0.5">from {s.statusChangedFrom}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Calendar size={10} className="text-gray-400" /> {formatDateDDMMYYYY(s.receiveDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit"><Edit size={14} /></button>
                      <button onClick={() => setShowDelete(s.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Smartphone size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No SIMs found</p>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-xs">Showing {filtered.length} of {newSIMs.length} SIMs</p>
          </div>
        )}
      </div>

      {showBulk && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulk(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Package size={18} className="text-emerald-600" /></div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm">Add Bulk Stock</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Import multiple SIMs at once</p>
                </div>
              </div>
              <button onClick={() => setShowBulk(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Network *</label>
                  <select value={bulkNetwork} onChange={(e) => setBulkNetwork(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    {["Telenor", "Jazz", "Ufone", "Zong"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Quantity *</label>
                  <input type="number" min={1} max={500} value={bulkQuantity} onChange={(e) => setBulkQuantity(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                  <div className="flex gap-1.5 mt-2">
                    {[10, 25, 50, 100].map((n) => (
                      <button key={n} onClick={() => setBulkQuantity(n)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${bulkQuantity === n ? "bg-[#0A2647] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Bind Device ID</label>
                  <select value={bulkDeviceId} onChange={(e) => setBulkDeviceId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    <option value="">None</option>
                    {devices.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Entry Date</label>
                  <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Starting ICCID (optional)</label>
                <input type="text" value={bulkStartIccid} onChange={(e) => setBulkStartIccid(e.target.value)} placeholder="e.g. 876543230001" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50" />
                {bulkStartIccid.trim() && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-blue-700 text-xs font-medium">Sequential ICCID Preview</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg">{bulkQuantity} SIMs</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: Math.min(bulkQuantity, 6) }).map((_, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white rounded border border-blue-200 text-[10px] font-mono text-gray-700">{incrementICCID(bulkStartIccid.trim(), i)}</span>
                      ))}
                      {bulkQuantity > 6 && <span className="px-2 py-0.5 text-[10px] text-blue-600 font-medium">+{bulkQuantity - 6} more</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowBulk(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleBulkImport} className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 inline-flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]">
                <Package size={14} /> Import {bulkQuantity} SIMs
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulkEdit(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Bulk Edit ({selected.length} SIMs)</h3>
              <button onClick={() => setShowBulkEdit(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Change Network</label>
                <select value={bulkEditNetwork} onChange={(e) => setBulkEditNetwork(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option value="">-- No Change --</option>
                  {["Telenor", "Jazz", "Ufone", "Zong"].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Change Status</label>
                <select value={bulkEditStatus} onChange={(e) => setBulkEditStatus(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option value="">-- No Change --</option>
                  {["In Stock", "Issued", "Activated", "Returned"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Change Device ID</label>
                <select value={bulkEditDevice} onChange={(e) => setBulkEditDevice(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option value="">-- No Change --</option>
                  <option value="">None (Clear)</option>
                  {devices.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowBulkEdit(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleBulkEdit} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center justify-center gap-2"><Check size={14} /> Apply Changes</button>
            </div>
          </div>
        </div>
      )}

      {showBulkDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulkDelete(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-gray-900 font-bold mb-1">Delete {selected.length} SIMs?</h3>
            <p className="text-gray-500 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowBulkDelete(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A2647]/10 flex items-center justify-center"><Smartphone size={18} className="text-[#0A2647]" /></div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm">{editing ? "Edit SIM" : "Add New SIM"}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{editing ? `Editing ${editing.id}` : "Fill in SIM details"}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">SIM ID *</label>
                  <input type="text" value={form.id} onChange={(e) => setField("id", e.target.value)} disabled={!!editing} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50 disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Network *</label>
                  <select value={form.network} onChange={(e) => setField("network", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    {["Telenor", "Jazz", "Ufone", "Zong"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">SIM Number *</label>
                  <input type="text" value={form.simNumber} onChange={(e) => setField("simNumber", e.target.value)} placeholder="03XX-XXXXXXX" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">ICCID</label>
                  <input type="text" value={form.iccid} onChange={(e) => setField("iccid", e.target.value)} placeholder="89..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Device ID</label>
                  <select value={form.deviceId} onChange={(e) => setField("deviceId", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    <option value="">None</option>
                    {devices.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Status *</label>
                  <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                    {["In Stock", "Issued", "Activated", "Returned"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Stock Date</label>
                <input type="date" value={form.receiveDate} onChange={(e) => setField("receiveDate", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] inline-flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]">
                <Save size={14} /> {editing ? "Update SIM" : "Add SIM"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDelete(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-gray-900 font-bold mb-1">Delete SIM?</h3>
            <p className="text-gray-500 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDelete(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={() => { deleteSIM(showDelete); setShowDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
