"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Smartphone, Package, ArrowRight, CheckSquare, Square, Check, ChevronDown, Calendar } from "lucide-react";
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

const SEARCH_FIELDS = [
  { value: "all", label: "All Fields" },
  { value: "id", label: "SIM ID" },
  { value: "simNumber", label: "SIM Number" },
  { value: "iccid", label: "ICCID" },
  { value: "deviceId", label: "Device" },
  { value: "status", label: "Status" },
  { value: "retailerId", label: "Retailer ID" },
  { value: "issuedTo", label: "Issued To" },
];

export default function HLRSIMsPage() {
  const { auth, sims, devices, addSIM, addSIMs, updateSIM, deleteSIM, deleteSIMs, issueRecords } = useFranchiseData();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SIM | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkEditDevice, setBulkEditDevice] = useState("");
  const [bulkEditNetwork, setBulkEditNetwork] = useState("");
  const [bulkEditStatus, setBulkEditStatus] = useState("");

  const [showBulk, setShowBulk] = useState(false);
  const [bulkNetwork, setBulkNetwork] = useState("Jazz");
  const [bulkQuantity, setBulkQuantity] = useState(20);
  const [bulkDeviceId, setBulkDeviceId] = useState("");
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split("T")[0]);
  const [bulkStartIccid, setBulkStartIccid] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");

  const hlrSIMs = sims.filter((s) => s.type === "hlr");
  const emptyForm: SIM = { id: "", network: "Jazz", simNumber: "", iccid: "", deviceId: "", status: "In Stock", receiveDate: new Date().toISOString().split("T")[0], franchiseId: auth.franchiseId, type: "hlr" };
  const [form, setForm] = useState<SIM>(emptyForm);

  const getIssueInfo = (simId: string) => {
    return issueRecords.find((r) => r.simIds.includes(simId)) || null;
  };

  const filtered = useMemo(() => {
    return hlrSIMs.filter((s) => {
      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      const q = search.toLowerCase();
      if (!q) return matchStatus;
      const issueInfo = getIssueInfo(s.id);
      const retailerId = issueInfo?.retailerId || "";
      const issuedTo = issueInfo?.issuedTo || "";
      let matchSearch = false;
      switch (searchField) {
        case "id": matchSearch = s.id.toLowerCase().includes(q); break;
        case "simNumber": matchSearch = s.simNumber.toLowerCase().includes(q); break;
        case "iccid": matchSearch = s.iccid.toLowerCase().includes(q); break;
        case "deviceId": matchSearch = (s.deviceId || "").toLowerCase().includes(q); break;
        case "status": matchSearch = s.status.toLowerCase().includes(q); break;
        case "retailerId": matchSearch = retailerId.toLowerCase().includes(q); break;
        case "issuedTo": matchSearch = issuedTo.toLowerCase().includes(q); break;
        default: matchSearch = s.id.toLowerCase().includes(q) || s.simNumber.toLowerCase().includes(q) || s.iccid.toLowerCase().includes(q) || (s.deviceId || "").toLowerCase().includes(q) || retailerId.toLowerCase().includes(q) || issuedTo.toLowerCase().includes(q);
      }
      return matchSearch && matchStatus;
    });
  }, [hlrSIMs, search, searchField, statusFilter, issueRecords]);

  const statusColors: Record<string, string> = {
    "In Stock": "bg-green-50 text-green-700",
    "Issued": "bg-amber-50 text-amber-700",
    "Used": "bg-blue-50 text-blue-700",
    "Returned": "bg-purple-50 text-purple-700",
    "Active": "bg-emerald-50 text-emerald-700",
    "Completed": "bg-teal-50 text-teal-700",
  };

  const hlrPrefix: Record<string, string> = { Telenor: "TH", Jazz: "JH", Ufone: "UH", Zong: "ZH" };

  const toggleSelect = (id: string) => setSelected((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]);
  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((s) => s.id));
  };

  const handleBulkDelete = () => {
    deleteSIMs(selected);
    setSelected([]);
    setShowBulkDelete(false);
  };

  const handleBulkEdit = () => {
    selected.forEach((id) => {
      const existing = hlrSIMs.find((s) => s.id === id);
      if (!existing) return;
      const updates: Partial<SIM> = {};
      if (bulkEditDevice) updates.deviceId = bulkEditDevice;
      if (bulkEditNetwork) updates.network = bulkEditNetwork;
      if (bulkEditStatus) updates.status = bulkEditStatus;
      if (Object.keys(updates).length > 0) updateSIM(id, { ...existing, ...updates });
    });
    setSelected([]);
    setShowBulkEdit(false);
    setBulkEditDevice("");
    setBulkEditNetwork("");
    setBulkEditStatus("");
  };

  const openAdd = () => {
    setEditing(null);
    const prefix = hlrPrefix[form.network] || "JH";
    const num = hlrSIMs.filter((s) => s.network === form.network).length + 1;
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
    const prefix = hlrPrefix[bulkNetwork] || "JH";
    const startIdx = hlrSIMs.filter((s) => s.network === bulkNetwork).length + 1;
    const useSequentialIccid = bulkStartIccid.trim().length > 0;
    const newSIMsList: SIM[] = [];
    for (let i = 0; i < bulkQuantity; i++) {
      newSIMsList.push({
        id: `${prefix}-${String(startIdx + i).padStart(4, "0")}`,
        network: bulkNetwork,
        simNumber: generateSimNumber(bulkNetwork),
        iccid: useSequentialIccid ? incrementICCID(bulkStartIccid.trim(), i) : generateICCID(),
        deviceId: bulkDeviceId,
        status: "In Stock",
        receiveDate: bulkDate,
        franchiseId: auth.franchiseId,
        type: "hlr",
      });
    }
    addSIMs(newSIMsList);
    setShowBulk(false);
    setBulkStartIccid("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">HLR SIM Stock</h1>
          <p className="text-gray-500 text-sm mt-1">Used for Replacement, MNP, and BYN</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-md transition-all hover:scale-105">
            <Package size={16} /> Add Stock
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
            <Plus size={16} /> Add HLR SIM
          </button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-blue-700 text-sm font-medium">{selected.length} selected</span>
          <button onClick={() => setShowBulkEdit(true)} className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600">Bulk Edit</button>
          <button onClick={() => setShowBulkDelete(true)} className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600">Delete Selected</button>
          <button onClick={() => setSelected([])} className="text-blue-400 hover:text-blue-600 text-xs">Clear</button>
        </div>
      )}

      {/* Advanced Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-shrink-0">
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)}
              className="h-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#0A2647]/50 appearance-none cursor-pointer">
              {SEARCH_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
            <Search size={16} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search by ${SEARCH_FIELDS.find((f) => f.value === searchField)?.label || "All Fields"}...`}
              className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "In Stock", "Issued", "Used", "Returned"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-[#0A2647] text-white shadow-md" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#0A2647]">
                    {selected.length === filtered.length && filtered.length > 0 ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} />}
                  </button>
                </th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase">HLR ID</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase">Network</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">SIM Number</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">ICCID</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Device</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Retailer ID</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Issued To</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase hidden 2xl:table-cell">Issue Date</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase hidden 2xl:table-cell">Active Date</th>
                <th className="text-left px-4 py-4 text-gray-500 text-xs font-medium uppercase hidden 2xl:table-cell">Return Date</th>
                <th className="text-right px-4 py-4 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const issueInfo = getIssueInfo(s.id);
                return (
                  <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected.includes(s.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(s.id)} className="text-gray-400 hover:text-[#0A2647]">
                        {selected.includes(s.id) ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-900 text-sm font-medium">{s.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${s.network === "Jazz" ? "bg-red-50 text-red-700" : s.network === "Telenor" ? "bg-blue-50 text-blue-700" : s.network === "Ufone" ? "bg-green-50 text-green-700" : "bg-purple-50 text-purple-700"}`}>{s.network}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell font-mono text-gray-600 text-sm">{s.simNumber}</td>
                    <td className="px-4 py-3 hidden lg:table-cell font-mono text-gray-400 text-xs">{s.iccid}</td>
                    <td className="px-4 py-3 hidden xl:table-cell font-mono text-gray-500 text-xs">{s.deviceId || "\u2014"}</td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {issueInfo?.retailerId ? (
                        <span className="font-mono text-xs text-[#0A2647] font-medium bg-[#0A2647]/5 px-2 py-1 rounded-lg">{issueInfo.retailerId}</span>
                      ) : <span className="text-gray-300">\u2014</span>}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-gray-600 text-xs">{issueInfo?.issuedTo || "\u2014"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[s.status] || "bg-gray-50 text-gray-700"}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden 2xl:table-cell">
                      {issueInfo?.issueDate ? (
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <Calendar size={10} className="text-gray-400" /> {formatDateDDMMYYYY(issueInfo.issueDate)}
                        </div>
                      ) : <span className="text-gray-300">\u2014</span>}
                    </td>
                    <td className="px-4 py-3 hidden 2xl:table-cell">
                      {s.status === "Used" || s.status === "Active" ? (
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                          <Calendar size={10} /> {formatDateDDMMYYYY(issueInfo?.issueDate || "")}
                        </div>
                      ) : <span className="text-gray-300">\u2014</span>}
                    </td>
                    <td className="px-4 py-3 hidden 2xl:table-cell">
                      {issueInfo?.returnDate ? (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <Calendar size={10} /> {formatDateDDMMYYYY(issueInfo.returnDate)}
                        </div>
                      ) : <span className="text-gray-300">\u2014</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit size={14} /></button>
                        <button onClick={() => deleteSIM(s.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="px-6 py-12 text-center"><Smartphone size={32} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No HLR SIMs found</p></div>}
      </div>

      {showBulk && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulk(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Package size={18} className="text-emerald-600" /></div>
                <div>
                  <h3 className="text-gray-900 font-bold text-sm">Add Bulk HLR Stock</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Import multiple HLR SIMs at once</p>
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
                <Package size={14} /> Import {bulkQuantity} HLR SIMs
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulkEdit(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Bulk Edit ({selected.length} HLR SIMs)</h3>
              <button onClick={() => setShowBulkEdit(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Change Device ID</label>
                <select value={bulkEditDevice} onChange={(e) => setBulkEditDevice(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option value="">-- No Change --</option>
                  <option value="">None (Clear)</option>
                  {devices.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
                </select>
              </div>
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
                  {["In Stock", "Issued", "Returned"].map((s) => <option key={s} value={s}>{s}</option>)}
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
            <h3 className="text-gray-900 font-bold mb-2">Delete {selected.length} HLR SIMs?</h3>
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
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">{editing ? "Edit HLR SIM" : "Add HLR SIM"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">HLR ID</label><input type="text" value={form.id} onChange={(e) => setField("id", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Network</label><select value={form.network} onChange={(e) => setField("network", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">{["Telenor", "Jazz", "Ufone", "Zong"].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">SIM Number</label><input type="text" value={form.simNumber} onChange={(e) => setField("simNumber", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">ICCID</label><input type="text" value={form.iccid} onChange={(e) => setField("iccid", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Device ID</label>
                <select value={form.deviceId} onChange={(e) => setField("deviceId", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option value="">None</option>
                  {devices.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
                </select>
              </div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Status</label><select value={form.status} onChange={(e) => setField("status", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">{["In Stock", "Used", "Issued", "Returned"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Receive Date</label><input type="date" value={form.receiveDate} onChange={(e) => setField("receiveDate", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center justify-center gap-2"><Save size={14} /> {editing ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
