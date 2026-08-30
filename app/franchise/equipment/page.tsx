"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Wrench, Package, ArrowRightLeft, Tag, Filter, Calendar, ChevronDown, User, CheckCircle, Clock, RotateCcw } from "lucide-react";
import { useFranchiseData, Equipment, EquipmentItemName, EquipmentIssueRecord } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

type Tab = "list" | "issues" | "items";

export default function EquipmentPage() {
  const { auth, equipment, equipmentItemNames, equipmentIssueRecords, dso, dsms, settings,
    addEquipment, updateEquipment, deleteEquipment,
    addEquipmentItemName, deleteEquipmentItemName,
    addEquipmentIssueRecord, updateEquipmentIssueRecord, returnEquipment } = useFranchiseData();

  const [tab, setTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const [form, setForm] = useState<Equipment>({
    id: "", name: "", price: 0, condition: "New", assignedTo: "",
    issueDate: "", returnDate: "", status: "Available", franchiseId: auth.franchiseId,
  });
  const [issueForm, setIssueForm] = useState({
    equipmentId: "", personId: "", personRole: "dso", notes: "",
  });
  const [itemForm, setItemForm] = useState({ name: "", category: "General" });

  const [assignedToSearch, setAssignedToSearch] = useState("");
  const [showAssignedDropdown, setShowAssignedDropdown] = useState(false);
  const [personSearch, setPersonSearch] = useState("");
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const assignedRef = useRef<HTMLDivElement>(null);
  const personRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (assignedRef.current && !assignedRef.current.contains(e.target as Node)) setShowAssignedDropdown(false);
      if (personRef.current && !personRef.current.contains(e.target as Node)) setShowPersonDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((e) => {
      const matchSearch = !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.id.toLowerCase().includes(search.toLowerCase()) ||
        e.assignedTo?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [equipment, search, statusFilter]);

  const filteredIssues = useMemo(() => {
    return equipmentIssueRecords.filter((r) => {
      const matchSearch = !search ||
        r.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
        r.personName.toLowerCase().includes(search.toLowerCase()) ||
        r.personId.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [equipmentIssueRecords, search]);

  const eqStats = useMemo(() => {
    let available = 0, issued = 0, returned = 0, damaged = 0;
    equipment.forEach((e) => {
      if (e.status === "Available") available++;
      else if (e.status === "Issued") issued++;
      else if (e.status === "Returned") returned++;
      else if (e.status === "Damaged") damaged++;
    });
    return { total: equipment.length, available, issued, returned, damaged };
  }, [equipment]);

  const issueStats = useMemo(() => {
    let active = 0, returned = 0;
    equipmentIssueRecords.forEach((r) => {
      if (r.status === "Issued") active++;
      else if (r.status === "Returned") returned++;
    });
    return { total: equipmentIssueRecords.length, active, returned };
  }, [equipmentIssueRecords]);

  const openAdd = () => {
    setEditing(null);
    setForm({ id: `EQ-${String(equipment.length + 1).padStart(3, "0")}`, name: "", price: 0, condition: "New", assignedTo: "", issueDate: "", returnDate: "", status: "Available", franchiseId: auth.franchiseId });
    setShowForm(true);
  };
  const openEdit = (e: Equipment) => { setEditing(e); setForm({ ...e }); setShowForm(true); };
  const handleSave = () => {
    if (!form.name) return;
    if (editing) updateEquipment(editing.id, form);
    else addEquipment(form);
    setShowForm(false);
  };

  const handleIssue = () => {
    if (!issueForm.equipmentId || !issueForm.personId) return;
    const eq = equipment.find((e) => e.id === issueForm.equipmentId);
    if (!eq) return;
    const personList = issueForm.personRole === "dso" ? dso : dsms;
    const person = personList.find((p: any) => p.id === issueForm.personId);
    const record: EquipmentIssueRecord = {
      id: `EQI-${Date.now()}`, equipmentId: eq.id, equipmentName: eq.name,
      personId: issueForm.personId, personName: person?.name || issueForm.personId,
      personRole: issueForm.personRole, issueDate: new Date().toISOString().split(" ")[0],
      returnDate: "", status: "Issued", notes: issueForm.notes, franchiseId: auth.franchiseId,
    };
    addEquipmentIssueRecord(record);
    updateEquipment(eq.id, { ...eq, status: "Issued", assignedTo: issueForm.personId, issueDate: record.issueDate });
    setShowIssueForm(false);
    setIssueForm({ equipmentId: "", personId: "", personRole: "dso", notes: "" });
  };

  const handleReturn = (record: EquipmentIssueRecord) => {
    returnEquipment(record.id);
    const eq = equipment.find((e) => e.id === record.equipmentId);
    if (eq) updateEquipment(eq.id, { ...eq, status: "Available", assignedTo: "", returnDate: new Date().toISOString().split(" ")[0] });
  };

  const handleAddItem = () => {
    if (!itemForm.name) return;
    addEquipmentItemName({ id: `EIN-${Date.now()}`, name: itemForm.name, category: itemForm.category, franchiseId: auth.franchiseId });
    setItemForm({ name: "", category: "General" });
  };

  const allPersonnel = useMemo(() => {
    const dsoList = dso.map((d) => ({ id: d.id, name: d.name, role: "dso" }));
    const dsmList = dsms.map((d) => ({ id: d.id, name: d.name, role: "dsm" }));
    return [...dsoList, ...dsmList];
  }, [dso, dsms]);

  const filteredAssignedPersonnel = useMemo(() => {
    if (!assignedToSearch) return allPersonnel;
    const q = assignedToSearch.toLowerCase();
    return allPersonnel.filter((p) => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  }, [allPersonnel, assignedToSearch]);

  const filteredIssuePersonnel = useMemo(() => {
    if (!personSearch) return allPersonnel;
    const q = personSearch.toLowerCase();
    return allPersonnel.filter((p) => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  }, [allPersonnel, personSearch]);

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "list", label: "Equipment List", icon: Package, count: equipment.length },
    { key: "issues", label: "Issue / Return", icon: ArrowRightLeft, count: equipmentIssueRecords.length },
    { key: "items", label: "Item Names", icon: Tag, count: equipmentItemNames.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Field Equipment" }]}
        title="Field Equipment"
        description="Manage field equipment, issue/return and item names"
        actions={<>
          {tab === "list" && <Button onClick={openAdd}><Plus size={16} /> Add Equipment</Button>}
          {tab === "issues" && <Button onClick={() => setShowIssueForm(true)}><Plus size={16} /> Issue Equipment</Button>}
          {tab === "items" && <Button onClick={() => setShowItemForm(true)}><Plus size={16} /> Add Item Name</Button>}
        </>}
      />

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
        {tabs.map((t) => (
          <Button key={t.key} size="sm" variant={tab === t.key ? "primary" : "ghost"} onClick={() => { setTab(t.key); setSearch(""); }} className="flex-1">
            <t.icon size={14} />
            {t.label}
            <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${tab === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{t.count}</span>
          </Button>
        ))}
      </div>

      {tab === "list" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatCard label="Total" value={eqStats.total} icon={Package} iconClass="text-brand-600 bg-brand-50" />
            <StatCard label="Available" value={eqStats.available} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
            <StatCard label="Issued" value={eqStats.issued} icon={Clock} iconClass="text-blue-600 bg-blue-50" />
            <StatCard label="Returned" value={eqStats.returned} icon={RotateCcw} iconClass="text-slate-600 bg-slate-100" />
            <StatCard label="Damaged" value={eqStats.damaged} icon={Trash2} iconClass="text-red-600 bg-red-50" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name, ID, assigned to..." className="flex-1" />
            <div className="flex gap-2 flex-wrap">
              {["All", "Available", "Issued", "Returned", "Damaged"].map((s) => (
                <Button key={s} size="sm" variant={statusFilter === s ? "primary" : "outline"} onClick={() => setStatusFilter(s)}>
                  <Filter size={12} /> {s}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-muted/50">
                    <th className="w-14 px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Sr.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Equipment ID</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Price (PKR)</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Condition</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground lg:table-cell">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground lg:table-cell">Issue Date</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((e, idx) => (
                    <tr key={e.id} className="border-b border-slate-100 text-sm transition-colors hover:bg-slate-50">
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-xs font-black text-brand-600">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{e.name}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.id}</td>
                      <td className="hidden px-4 py-3 font-medium text-slate-900 md:table-cell">PKR {e.price.toLocaleString()}</td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <StatusPill label={e.condition} tone={e.condition === "New" ? "positive" : e.condition === "Good" ? "accent" : e.condition === "Fair" ? "warning" : "negative"} />
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-slate-700 lg:table-cell">{e.assignedTo || "\u2014"}</td>
                      <td className="px-4 py-3">
                        <StatusPill label={e.status} tone={e.status === "Available" ? "positive" : e.status === "Issued" ? "accent" : e.status === "Returned" ? "neutral" : "negative"} />
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{formatDateDDMMYYYY(e.issueDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(e)} className="rounded-lg p-1.5 text-amber-600 transition-all hover:bg-amber-50" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => deleteEquipment(e.id)} className="rounded-lg p-1.5 text-red-600 transition-all hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEquipment.length === 0 && (
                <EmptyState icon={Wrench} title="No equipment found" description="No equipment matches your search." />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === "issues" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total" value={issueStats.total} icon={ArrowRightLeft} iconClass="text-brand-600 bg-brand-50" />
            <StatCard label="Active" value={issueStats.active} icon={Clock} iconClass="text-blue-600 bg-blue-50" />
            <StatCard label="Returned" value={issueStats.returned} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
          </div>

          <SearchInput value={search} onChange={setSearch} placeholder="Search by equipment, person name or ID..." />

          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-muted/50">
                    <th className="w-14 px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Sr.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Equipment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Person</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Issue Date</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Return Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((r, idx) => (
                    <tr key={r.id} className="border-b border-slate-100 text-sm transition-colors hover:bg-slate-50">
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-xs font-black text-brand-600">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{r.equipmentName}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{r.equipmentId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-900">{r.personName}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{r.personId}</p>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <StatusPill label={r.personRole.toUpperCase()} tone={r.personRole === "dso" ? "accent" : "neutral"} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateDDMMYYYY(r.issueDate)}</td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{formatDateDDMMYYYY(r.returnDate)}</td>
                      <td className="px-4 py-3">
                        <StatusPill label={r.status} tone={r.status === "Issued" ? "accent" : "positive"} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {r.status === "Issued" && (
                            <button onClick={() => handleReturn(r)} className="rounded-lg p-1.5 text-green-600 transition-all hover:bg-green-50" title="Return"><RotateCcw size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredIssues.length === 0 && (
                <EmptyState icon={ArrowRightLeft} title="No issue/return records" description="No issue/return records match your search." />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === "items" && (
        <>
          <SearchInput value={search} onChange={setSearch} placeholder="Search item names..." />

          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-muted/50">
                    <th className="w-14 px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Sr.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">ID</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentItemNames
                    .filter((n) => !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.category.toLowerCase().includes(search.toLowerCase()))
                    .map((n, idx) => (
                    <tr key={n.id} className="border-b border-slate-100 text-sm transition-colors hover:bg-slate-50">
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-xs font-black text-brand-600">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{n.name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{n.category}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{n.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button onClick={() => deleteEquipmentItemName(n.id)} className="rounded-lg p-1.5 text-red-600 transition-all hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {equipmentItemNames.filter((n) => !search || n.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <EmptyState icon={Tag} title="No item names added yet" description="Add an item name to get started." />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setShowAssignedDropdown(false); setAssignedToSearch(""); }}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Wrench size={18} /> {editing ? "Edit Equipment" : "Add Equipment"}</h3>
              <button onClick={() => { setShowForm(false); setShowAssignedDropdown(false); setAssignedToSearch(""); }} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Equipment ID</label><Input type="text" value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name of Item *</label><Select value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}><option value="">Select item...</option>{equipmentItemNames.map((n) => <option key={n.id} value={n.name}>{n.name} ({n.category})</option>)}</Select></div>
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price (PKR)</label><Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Condition</label><Select value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}>{["New", "Good", "Fair", "Poor"].map((c) => <option key={c} value={c}>{c}</option>)}</Select></div>
                <div ref={assignedRef} className="relative"><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Assigned To</label>
                  <div onClick={() => setShowAssignedDropdown(!showAssignedDropdown)} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <span className={form.assignedTo ? "text-slate-900" : "text-muted-foreground"}>
                      {form.assignedTo ? (() => { const p = allPersonnel.find((x) => x.id === form.assignedTo); return p ? `${p.id} - ${p.name} (${p.role.toUpperCase()})` : form.assignedTo; })() : "Type to search..."}
                    </span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </div>
                  {showAssignedDropdown && (
                    <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                          <Search size={14} className="text-muted-foreground" />
                          <input type="text" value={assignedToSearch} onChange={(e) => setAssignedToSearch(e.target.value)} placeholder="Search by name, ID, role..." className="w-full bg-transparent text-xs text-slate-900 focus:outline-none" autoFocus />
                        </div>
                      </div>
                      <div className="p-1">
                        <button onClick={() => { setForm((p) => ({ ...p, assignedTo: "" })); setShowAssignedDropdown(false); setAssignedToSearch(""); }} className="w-full rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:bg-slate-50">None</button>
                        {filteredAssignedPersonnel.map((p) => (
                          <button key={p.id} onClick={() => { setForm((prev) => ({ ...prev, assignedTo: p.id })); setShowAssignedDropdown(false); setAssignedToSearch(""); }} className="w-full rounded-lg px-3 py-2 text-left transition-all hover:bg-slate-50">
                            <p className="text-xs font-medium text-slate-900">{p.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{p.id} &middot; <span className={`font-bold ${p.role === "dso" ? "text-blue-600" : "text-purple-600"}`}>{p.role.toUpperCase()}</span></p>
                          </button>
                        ))}
                        {filteredAssignedPersonnel.length === 0 && <p className="py-2 text-center text-xs text-muted-foreground">No results</p>}
                      </div>
                    </div>
                  )}
                </div>
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label><Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>{["Available", "Issued", "Returned", "Damaged"].map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
                <div className="sm:col-span-2"><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</label><textarea value={form.assignedTo ? "" : ""} placeholder="Optional notes..." className="h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" /></div>
              </div>
            </div>
            <div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); setShowAssignedDropdown(false); setAssignedToSearch(""); }}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.name}><Save size={14} /> {editing ? "Update" : "Add"}</Button>
            </div>
          </div>
        </div>
      )}

      {showIssueForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowIssueForm(false); setShowPersonDropdown(false); setPersonSearch(""); }}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><ArrowRightLeft size={18} /> Issue Equipment</h3>
              <button onClick={() => { setShowIssueForm(false); setShowPersonDropdown(false); setPersonSearch(""); }} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Equipment *</label><Select value={issueForm.equipmentId} onChange={(e) => setIssueForm((p) => ({ ...p, equipmentId: e.target.value }))}><option value="">Select equipment...</option>{equipment.filter((e) => e.status === "Available").map((e) => <option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}</Select></div>
              <div ref={personRef} className="relative"><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Issue To *</label>
                <div onClick={() => setShowPersonDropdown(!showPersonDropdown)} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <span className={issueForm.personId ? "text-slate-900" : "text-muted-foreground"}>
                    {issueForm.personId ? (() => { const p = allPersonnel.find((x) => x.id === issueForm.personId); return p ? `${p.id} - ${p.name} (${p.role.toUpperCase()})` : issueForm.personId; })() : "Type to search..."}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </div>
                {showPersonDropdown && (
                  <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <Search size={14} className="text-muted-foreground" />
                        <input type="text" value={personSearch} onChange={(e) => setPersonSearch(e.target.value)} placeholder="Search by name, ID, role..." className="w-full bg-transparent text-xs text-slate-900 focus:outline-none" autoFocus />
                      </div>
                    </div>
                    <div className="p-1">
                      {filteredIssuePersonnel.map((p) => (
                        <button key={p.id} onClick={() => { setIssueForm((prev) => ({ ...prev, personId: p.id, personRole: p.role })); setShowPersonDropdown(false); setPersonSearch(""); }} className="w-full rounded-lg px-3 py-2 text-left transition-all hover:bg-slate-50">
                          <p className="text-xs font-medium text-slate-900">{p.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{p.id} &middot; <span className={`font-bold ${p.role === "dso" ? "text-blue-600" : "text-purple-600"}`}>{p.role.toUpperCase()}</span></p>
                        </button>
                      ))}
                      {filteredIssuePersonnel.length === 0 && <p className="py-2 text-center text-xs text-muted-foreground">No results</p>}
                    </div>
                  </div>
                )}
              </div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Role (Auto-filled)</label><div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-900">{issueForm.personRole === "dso" ? "DSO" : "DSM"}</div></div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</label><textarea value={issueForm.notes} onChange={(e) => setIssueForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." className="h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" /></div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowIssueForm(false); setShowPersonDropdown(false); setPersonSearch(""); }}>Cancel</Button>
              <Button className="flex-1" onClick={() => { handleIssue(); setShowPersonDropdown(false); setPersonSearch(""); }} disabled={!issueForm.equipmentId || !issueForm.personId}><ArrowRightLeft size={14} /> Issue</Button>
            </div>
          </div>
        </div>
      )}

      {showItemForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowItemForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Tag size={18} /> Add Item Name</h3>
              <button onClick={() => setShowItemForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Item Name *</label><Input type="text" value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Umbrella, Table, Banner..." /></div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label><Select value={itemForm.category} onChange={(e) => setItemForm((p) => ({ ...p, category: e.target.value }))}>{["General", "Marketing", "Furniture", "Uniform", "Electronics", "Tools"].map((c) => <option key={c} value={c}>{c}</option>)}</Select></div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowItemForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddItem} disabled={!itemForm.name}><Plus size={14} /> Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
