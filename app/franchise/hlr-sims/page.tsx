"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2, X, Save, Smartphone, Package, ChevronDown, Calendar, Check, CheckSquare, Square, Inbox } from "lucide-react";
import { useFranchiseData, SIM } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill, toneForStatus, QuickChip } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";

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

const STATUSES = ["All", "In Stock", "Issued", "Used", "Returned"];
const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(1);

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

  useEffect(() => { setPage(1); }, [search, searchField, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedList = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = hlrSIMs.length;
    const inStock = hlrSIMs.filter((s) => s.status === "In Stock").length;
    const issued = hlrSIMs.filter((s) => s.status === "Issued").length;
    const used = hlrSIMs.filter((s) => s.status === "Used" || s.status === "Active" || s.status === "Completed").length;
    const returned = hlrSIMs.filter((s) => s.status === "Returned").length;
    return { total, inStock, issued, used, returned };
  }, [hlrSIMs]);

  const networkColor: Record<string, string> = { Telenor: "bg-blue-50 text-blue-700", Jazz: "bg-red-50 text-red-700", Ufone: "bg-green-50 text-green-700", Zong: "bg-purple-50 text-purple-700" };

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
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "HLR SIMs" }]}
        title="HLR SIM Stock"
        description="Used for Replacement, MNP, and BYN"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowBulk(true)}>
              <Package size={16} /> Add Stock
            </Button>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add HLR SIM
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Total HLR SIMs" value={stats.total} icon={Smartphone} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="In Stock" value={stats.inStock} icon={Package} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Issued" value={stats.issued} icon={ChevronDown} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="Used" value={stats.used} icon={Check} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="Returned" value={stats.returned} icon={Package} iconClass="text-purple-600 bg-purple-50" />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3">
          <CheckSquare className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-medium text-brand-700">{selected.length} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowBulkEdit(true)}>Bulk Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => setShowBulkDelete(true)}>Delete Selected</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="w-40">
                {SEARCH_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </Select>
              <div className="flex-1">
                <SearchInput
                  placeholder={`Search by ${SEARCH_FIELDS.find((f) => f.value === searchField)?.label || "All Fields"}...`}
                  value={search}
                  onChange={(v) => setSearch(v)}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUSES.map((s) => (
                <QuickChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle>HLR SIM Records</CardTitle>
          <span className="text-sm text-muted-foreground">{filtered.length} of {hlrSIMs.length}</span>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="w-10 px-4 py-3 text-center">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center">
                      {selected.length === filtered.length && filtered.length > 0 ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} className="text-slate-300" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">HLR ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Network</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">SIM Number</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">ICCID</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground xl:table-cell">Device</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground xl:table-cell">Retailer ID</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground xl:table-cell">Issued To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground 2xl:table-cell">Issue Date</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground 2xl:table-cell">Active Date</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground 2xl:table-cell">Return Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedList.map((s) => {
                  const issueInfo = getIssueInfo(s.id);
                  return (
                    <tr key={s.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${selected.includes(s.id) ? "bg-brand-50" : ""}`}>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleSelect(s.id)} className="flex items-center justify-center">
                          {selected.includes(s.id) ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} className="text-slate-300" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-medium text-foreground">{s.id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${networkColor[s.network] || "bg-slate-50 text-slate-700"}`}>{s.network}</span>
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-sm text-foreground md:table-cell">{s.simNumber}</td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">{s.iccid}</td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground xl:table-cell">{s.deviceId || "\u2014"}</td>
                      <td className="hidden px-4 py-3 xl:table-cell">
                        {issueInfo?.retailerId ? (
                          <span className="rounded-lg bg-brand-50 px-2 py-1 font-mono text-xs font-medium text-brand-600">{issueInfo.retailerId}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">{issueInfo?.issuedTo || "\u2014"}</td>
                      <td className="px-4 py-3">
                        <StatusPill label={s.status} tone={toneForStatus(s.status)} />
                      </td>
                      <td className="hidden px-4 py-3 2xl:table-cell">
                        {issueInfo?.issueDate ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar size={10} className="text-slate-400" /> {formatDateDDMMYYYY(issueInfo.issueDate)}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="hidden px-4 py-3 2xl:table-cell">
                        {s.status === "Used" || s.status === "Active" ? (
                          <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                            <Calendar size={10} /> {formatDateDDMMYYYY(issueInfo?.issueDate || "")}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="hidden px-4 py-3 2xl:table-cell">
                        {issueInfo?.returnDate ? (
                          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <Calendar size={10} /> {formatDateDDMMYYYY(issueInfo.returnDate)}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-50" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => deleteSIM(s.id)} className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={pageCount} onChange={setPage} />
          {filtered.length === 0 && (
            <EmptyState icon={Inbox} title="No HLR SIMs found" description="No HLR SIMs match your filters." />
          )}
        </CardContent>
      </Card>

      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowBulk(false)}>
          <Card className="w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"><Package size={18} className="text-emerald-600" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Add Bulk HLR Stock</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Import multiple HLR SIMs at once</p>
                </div>
              </div>
              <button onClick={() => setShowBulk(false)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Network *</label>
                  <Select value={bulkNetwork} onChange={(e) => setBulkNetwork(e.target.value)}>
                    {["Telenor", "Jazz", "Ufone", "Zong"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Quantity *</label>
                  <input type="number" min={1} max={500} value={bulkQuantity} onChange={(e) => setBulkQuantity(Number(e.target.value))} className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                  <div className="mt-2 flex gap-1.5">
                    {[10, 25, 50, 100].map((n) => (
                      <button key={n} onClick={() => setBulkQuantity(n)} className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${bulkQuantity === n ? "bg-brand-600 text-white" : "bg-slate-100 text-muted-foreground hover:bg-slate-200"}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bind Device ID</label>
                  <Select value={bulkDeviceId} onChange={(e) => setBulkDeviceId(e.target.value)}>
                    <option value="">None</option>
                    {devices.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Entry Date</label>
                  <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Starting ICCID (optional)</label>
                <input type="text" value={bulkStartIccid} onChange={(e) => setBulkStartIccid(e.target.value)} placeholder="e.g. 876543230001" className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                {bulkStartIccid.trim() && (
                  <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-blue-700">Sequential ICCID Preview</p>
                      <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{bulkQuantity} SIMs</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: Math.min(bulkQuantity, 6) }).map((_, i) => (
                        <span key={i} className="rounded border border-blue-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-700">{incrementICCID(bulkStartIccid.trim(), i)}</span>
                      ))}
                      {bulkQuantity > 6 && <span className="px-2 py-0.5 text-[10px] font-medium text-blue-600">+{bulkQuantity - 6} more</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowBulk(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleBulkImport}>
                <Package size={14} /> Import {bulkQuantity} HLR SIMs
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showBulkEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowBulkEdit(false)}>
          <Card className="w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">Bulk Edit ({selected.length} HLR SIMs)</h3>
              <button onClick={() => setShowBulkEdit(false)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Change Device ID</label>
                <Select value={bulkEditDevice} onChange={(e) => setBulkEditDevice(e.target.value)}>
                  <option value="">-- No Change --</option>
                  <option value="">None (Clear)</option>
                  {devices.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Change Network</label>
                <Select value={bulkEditNetwork} onChange={(e) => setBulkEditNetwork(e.target.value)}>
                  <option value="">-- No Change --</option>
                  {["Telenor", "Jazz", "Ufone", "Zong"].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Change Status</label>
                <Select value={bulkEditStatus} onChange={(e) => setBulkEditStatus(e.target.value)}>
                  <option value="">-- No Change --</option>
                  {["In Stock", "Issued", "Returned"].map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowBulkEdit(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleBulkEdit}><Check size={14} /> Apply Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {showBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowBulkDelete(false)}>
          <Card className="w-full max-w-sm p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-semibold text-foreground">Delete {selected.length} HLR SIMs?</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowBulkDelete(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleBulkDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50"><Smartphone size={18} className="text-brand-600" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{editing ? "Edit HLR SIM" : "Add HLR SIM"}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{editing ? `Editing ${editing.id}` : "Fill in HLR SIM details"}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">HLR ID *</label>
                  <input type="text" value={form.id} onChange={(e) => setField("id", e.target.value)} disabled={!!editing} className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-brand-500 disabled:opacity-60" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Network *</label>
                  <Select value={form.network} onChange={(e) => setField("network", e.target.value)}>
                    {["Telenor", "Jazz", "Ufone", "Zong"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">SIM Number *</label>
                  <input type="text" value={form.simNumber} onChange={(e) => setField("simNumber", e.target.value)} placeholder="03XX-XXXXXXX" className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">ICCID</label>
                  <input type="text" value={form.iccid} onChange={(e) => setField("iccid", e.target.value)} placeholder="89..." className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Device ID</label>
                  <Select value={form.deviceId} onChange={(e) => setField("deviceId", e.target.value)}>
                    <option value="">None</option>
                    {devices.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status *</label>
                  <Select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                    {["In Stock", "Used", "Issued", "Returned"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Receive Date</label>
                <input type="date" value={form.receiveDate} onChange={(e) => setField("receiveDate", e.target.value)} className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}>
                <Save size={14} /> {editing ? "Update HLR SIM" : "Add HLR SIM"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
