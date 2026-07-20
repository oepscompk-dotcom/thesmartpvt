"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Wrench, Package, ArrowRightLeft, Tag, Filter, Calendar, ChevronDown, ChevronUp, User, CheckCircle, Clock, RotateCcw } from "lucide-react";
import { useFranchiseData, Equipment, EquipmentItemName, EquipmentIssueRecord } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Field Equipment</h1>
          <p className="text-gray-500 text-sm mt-1">Manage field equipment, issue/return and item names</p>
        </div>
        <div className="flex gap-2">
          {tab === "list" && (
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
              <Plus size={16} /> Add Equipment
            </button>
          )}
          {tab === "issues" && (
            <button onClick={() => setShowIssueForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
              <Plus size={16} /> Issue Equipment
            </button>
          )}
          {tab === "items" && (
            <button onClick={() => setShowItemForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
              <Plus size={16} /> Add Item Name
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-white rounded-2xl border border-gray-200 p-1.5">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === t.key ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
            <t.icon size={14} />
            {t.label}
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "list" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A2647]/10 flex items-center justify-center"><Package size={14} className="text-[#0A2647]" /></div>
              <div><p className="text-lg font-black text-gray-900">{eqStats.total}</p><p className="text-gray-500 text-[10px]">Total</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle size={14} className="text-green-600" /></div>
              <div><p className="text-lg font-black text-green-600">{eqStats.available}</p><p className="text-gray-500 text-[10px]">Available</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Clock size={14} className="text-blue-600" /></div>
              <div><p className="text-lg font-black text-blue-600">{eqStats.issued}</p><p className="text-gray-500 text-[10px]">Issued</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><RotateCcw size={14} className="text-gray-600" /></div>
              <div><p className="text-lg font-black text-gray-600">{eqStats.returned}</p><p className="text-gray-500 text-[10px]">Returned</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><Trash2 size={14} className="text-red-600" /></div>
              <div><p className="text-lg font-black text-red-600">{eqStats.damaged}</p><p className="text-gray-500 text-[10px]">Damaged</p></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
              <Search size={16} className="text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID, assigned to..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Available", "Issued", "Returned", "Damaged"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                  <span className="flex items-center gap-1.5"><Filter size={12} /> {s}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Item Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Equipment ID</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Price (PKR)</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Condition</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Assigned To</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Issue Date</th>
                    <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((e, idx) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 text-sm font-medium">{e.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{e.id}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-900 text-sm font-medium">PKR {e.price.toLocaleString()}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.condition === "New" ? "bg-green-50 text-green-600" : e.condition === "Good" ? "bg-blue-50 text-blue-600" : e.condition === "Fair" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>{e.condition}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-700 text-xs font-mono">{e.assignedTo || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${e.status === "Available" ? "bg-green-50 text-green-700" : e.status === "Issued" ? "bg-blue-50 text-blue-700" : e.status === "Returned" ? "bg-gray-50 text-gray-700" : "bg-red-50 text-red-700"}`}>{e.status}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(e.issueDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-all" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => deleteEquipment(e.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredEquipment.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Wrench size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No equipment found</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "issues" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0A2647]/10 flex items-center justify-center"><ArrowRightLeft size={14} className="text-[#0A2647]" /></div>
              <div><p className="text-lg font-black text-gray-900">{issueStats.total}</p><p className="text-gray-500 text-[10px]">Total</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Clock size={14} className="text-blue-600" /></div>
              <div><p className="text-lg font-black text-blue-600">{issueStats.active}</p><p className="text-gray-500 text-[10px]">Active</p></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle size={14} className="text-green-600" /></div>
              <div><p className="text-lg font-black text-green-600">{issueStats.returned}</p><p className="text-gray-500 text-[10px]">Returned</p></div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
            <Search size={16} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by equipment, person name or ID..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Equipment</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Person</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Role</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Issue Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Return Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                    <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((r, idx) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 text-sm font-medium">{r.equipmentName}</p>
                        <p className="text-gray-400 text-[10px] font-mono">{r.equipmentId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 text-sm">{r.personName}</p>
                        <p className="text-gray-400 text-[10px] font-mono">{r.personId}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.personRole === "dso" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>{r.personRole.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDateDDMMYYYY(r.issueDate)}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(r.returnDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${r.status === "Issued" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {r.status === "Issued" && (
                            <button onClick={() => handleReturn(r)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-all" title="Return"><RotateCcw size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredIssues.length === 0 && (
              <div className="px-6 py-12 text-center">
                <ArrowRightLeft size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No issue/return records</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "items" && (
        <>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
            <Search size={16} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item names..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Item Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Category</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">ID</th>
                    <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentItemNames
                    .filter((n) => !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.category.toLowerCase().includes(search.toLowerCase()))
                    .map((n, idx) => (
                    <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-sm font-medium">{n.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">{n.category}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{n.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button onClick={() => deleteEquipmentItemName(n.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {equipmentItemNames.filter((n) => !search || n.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <div className="px-6 py-12 text-center">
                <Tag size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No item names added yet</p>
              </div>
            )}
          </div>
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
                <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Equipment ID</label><input type="text" value={form.id} onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
                <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Name of Item *</label><select value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50"><option value="">Select item...</option>{equipmentItemNames.map((n) => <option key={n.id} value={n.name}>{n.name} ({n.category})</option>)}</select></div>
                <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Price (PKR)</label><input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
                <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Condition</label><select value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">{["New", "Good", "Fair", "Poor"].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div ref={assignedRef} className="relative"><label className="block text-gray-500 text-xs font-medium mb-1.5">Assigned To</label>
                  <div onClick={() => setShowAssignedDropdown(!showAssignedDropdown)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm cursor-pointer flex items-center justify-between focus-within:border-[#0A2647]/50">
                    <span className={form.assignedTo ? "text-gray-900" : "text-gray-400"}>
                      {form.assignedTo ? (() => { const p = allPersonnel.find((x) => x.id === form.assignedTo); return p ? `${p.id} - ${p.name} (${p.role.toUpperCase()})` : form.assignedTo; })() : "Type to search..."}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                  {showAssignedDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <div className="sticky top-0 bg-white border-b border-gray-100 p-2">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <Search size={14} className="text-gray-400" />
                          <input type="text" value={assignedToSearch} onChange={(e) => setAssignedToSearch(e.target.value)} placeholder="Search by name, ID, role..." className="bg-transparent text-gray-900 text-xs focus:outline-none w-full" autoFocus />
                        </div>
                      </div>
                      <div className="p-1">
                        <button onClick={() => { setForm((p) => ({ ...p, assignedTo: "" })); setShowAssignedDropdown(false); setAssignedToSearch(""); }} className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg transition-all">None</button>
                        {filteredAssignedPersonnel.map((p) => (
                          <button key={p.id} onClick={() => { setForm((prev) => ({ ...prev, assignedTo: p.id })); setShowAssignedDropdown(false); setAssignedToSearch(""); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
                            <p className="text-gray-900 text-xs font-medium">{p.name}</p>
                            <p className="text-gray-400 text-[10px] font-mono">{p.id} · <span className={`font-bold ${p.role === "dso" ? "text-blue-600" : "text-purple-600"}`}>{p.role.toUpperCase()}</span></p>
                          </button>
                        ))}
                        {filteredAssignedPersonnel.length === 0 && <p className="text-gray-400 text-xs text-center py-2">No results</p>}
                      </div>
                    </div>
                  )}
                </div>
                <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Status</label><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">{["Available", "Issued", "Returned", "Damaged"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="sm:col-span-2"><label className="block text-gray-500 text-xs font-medium mb-1.5">Notes</label><textarea value={form.assignedTo ? "" : ""} placeholder="Optional notes..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 h-20 resize-none" /></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { setShowForm(false); setShowAssignedDropdown(false); setAssignedToSearch(""); }} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={!form.name} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"><Save size={14} /> {editing ? "Update" : "Add"}</button>
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
            <div className="p-6 space-y-4">
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Equipment *</label><select value={issueForm.equipmentId} onChange={(e) => setIssueForm((p) => ({ ...p, equipmentId: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50"><option value="">Select equipment...</option>{equipment.filter((e) => e.status === "Available").map((e) => <option key={e.id} value={e.id}>{e.id} - {e.name}</option>)}</select></div>
              <div ref={personRef} className="relative"><label className="block text-gray-500 text-xs font-medium mb-1.5">Issue To *</label>
                <div onClick={() => setShowPersonDropdown(!showPersonDropdown)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm cursor-pointer flex items-center justify-between focus-within:border-[#0A2647]/50">
                  <span className={issueForm.personId ? "text-gray-900" : "text-gray-400"}>
                    {issueForm.personId ? (() => { const p = allPersonnel.find((x) => x.id === issueForm.personId); return p ? `${p.id} - ${p.name} (${p.role.toUpperCase()})` : issueForm.personId; })() : "Type to search..."}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                {showPersonDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-100 p-2">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <Search size={14} className="text-gray-400" />
                        <input type="text" value={personSearch} onChange={(e) => setPersonSearch(e.target.value)} placeholder="Search by name, ID, role..." className="bg-transparent text-gray-900 text-xs focus:outline-none w-full" autoFocus />
                      </div>
                    </div>
                    <div className="p-1">
                      {filteredIssuePersonnel.map((p) => (
                        <button key={p.id} onClick={() => { setIssueForm((prev) => ({ ...prev, personId: p.id, personRole: p.role })); setShowPersonDropdown(false); setPersonSearch(""); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-all">
                          <p className="text-gray-900 text-xs font-medium">{p.name}</p>
                          <p className="text-gray-400 text-[10px] font-mono">{p.id} · <span className={`font-bold ${p.role === "dso" ? "text-blue-600" : "text-purple-600"}`}>{p.role.toUpperCase()}</span></p>
                        </button>
                      ))}
                      {filteredIssuePersonnel.length === 0 && <p className="text-gray-400 text-xs text-center py-2">No results</p>}
                    </div>
                  </div>
                )}
              </div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Role (Auto-filled)</label><div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 text-sm font-bold">{issueForm.personRole === "dso" ? "DSO" : "DSM"}</div></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Notes</label><textarea value={issueForm.notes} onChange={(e) => setIssueForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 h-20 resize-none" /></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setShowIssueForm(false); setShowPersonDropdown(false); setPersonSearch(""); }} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={() => { handleIssue(); setShowPersonDropdown(false); setPersonSearch(""); }} disabled={!issueForm.equipmentId || !issueForm.personId} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"><ArrowRightLeft size={14} /> Issue</button>
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
            <div className="p-6 space-y-4">
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Item Name *</label><input type="text" value={itemForm.name} onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Umbrella, Table, Banner..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Category</label><select value={itemForm.category} onChange={(e) => setItemForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">{["General", "Marketing", "Furniture", "Uniform", "Electronics", "Tools"].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowItemForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleAddItem} disabled={!itemForm.name} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"><Plus size={14} /> Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
