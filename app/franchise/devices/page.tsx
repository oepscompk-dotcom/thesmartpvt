"use client";

import { useState, useMemo, useEffect } from "react";
import { Smartphone, Plus, Edit, Trash2, X, Save, Search, Filter, CheckSquare, Square, Eye, RotateCcw, Package, ArrowUpCircle, ArrowDownCircle, Calendar, ChevronDown, ChevronRight, Fingerprint, ShieldCheck, Send, UserCheck, History, User, BadgeCheck } from "lucide-react";
import { useFranchiseData, Device, DeviceIssueRecord } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoad } from "@/lib/api";

type Tab = "all" | "available" | "issued" | "returned" | "history";
type View = "list" | "details";

interface SIMRecord { id: string; network: string; simNumber: string; iccid: string; deviceId: string; status: string; receiveDate: string; franchiseId: string; type: "new" | "hlr"; }

async function loadSims(franchiseId: string): Promise<SIMRecord[]> { try { return (await apiLoad("sim", franchiseId)) || []; } catch { return []; } }

function getNextDeviceRecordSubId(records: DeviceIssueRecord[], baseRetailerId: string): string {
  const matching = records.filter((r) => r.baseRetailerId === baseRetailerId);
  if (matching.length === 0) return `${baseRetailerId}-1`;
  const maxSuffix = matching.reduce((max, r) => {
    const part = r.retailerId.replace(baseRetailerId, "").replace("-", "");
    const num = parseInt(part, 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `${baseRetailerId}-${maxSuffix + 1}`;
}

function getActiveDeviceIssue(records: DeviceIssueRecord[], deviceId: string): DeviceIssueRecord | undefined {
  return records.find((r) => r.deviceId === deviceId && r.status === "Issued");
}

function getPersonName(dsoList: any[], dsmList: any[], personId: string): string {
  const found = [...dsoList, ...dsmList].find((p: any) => p.id === personId);
  return found ? found.name : personId;
}

export default function DevicesPage() {
  const { auth, devices, dso, dsms, addDevice, updateDevice, deleteDevice, deviceIssueRecords, addDeviceIssueRecord, returnDeviceIssueRecord } = useFranchiseData();

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Device | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [viewDevice, setViewDevice] = useState<Device | null>(null);
  const [viewMode, setViewMode] = useState<View>("list");
  const [showIssue, setShowIssue] = useState<Device | null>(null);
  const [showReturn, setShowReturn] = useState<Device | null>(null);
  const [issueForm, setIssueForm] = useState({ dsoId: "", retailerId: "", notes: "" });
  const [returnForm, setReturnForm] = useState({ notes: "" });
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const emptyForm: Device = { id: "", bvsNumber: "", imei: "", brand: "", model: "", purchaseDate: new Date().toISOString().split("T")[0], status: "Available", assignedDSO: "", retailerId: "", franchiseId: auth.franchiseId, issueDate: "", returnDate: "", originalRetailerId: "" };
  const [form, setForm] = useState<Device>(emptyForm);

  const [bvsSearch, setBvsSearch] = useState("");
  const [bvsResults, setBvsResults] = useState<{ id: string; name: string; mobile: string; retailerId: string; role: "DSO" | "DSM" }[]>([]);
  const [matchedPerson, setMatchedPerson] = useState<{ id: string; name: string; mobile: string; retailerId: string; role: "DSO" | "DSM" } | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [deviceNum, setDeviceNum] = useState("");

  const [allSims, setAllSims] = useState<SIMRecord[]>([]);

  useEffect(() => {
    loadSims(auth.franchiseId).then(setAllSims);
  }, [auth.franchiseId]);

  const filtered = useMemo(() => {
    let list = devices;
    if (tab === "available") list = devices.filter((d) => d.status === "Available" || d.status === "In Stock");
    else if (tab === "issued") list = devices.filter((d) => d.status === "Issued" || d.status === "Assigned");
    else if (tab === "returned") list = devices.filter((d) => d.returnDate && d.status !== "Issued" && d.status !== "Assigned");
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((d) => d.id.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q) || d.model.toLowerCase().includes(q) || d.imei.toLowerCase().includes(q)); }
    return list;
  }, [devices, tab, search]);

  const issuedDevices = devices.filter((d) => d.status === "Issued" || d.status === "Assigned");
  const inStockDevices = devices.filter((d) => d.status === "In Stock");
  const returnedDevices = devices.filter((d) => d.returnDate && d.status !== "Issued" && d.status !== "Assigned");

  const getDSOName = (dsoId: string) => { const found = dso.find((d) => d.id === dsoId); return found ? found.name : dsoId || "â€”"; };
  const getDeviceSIMs = (deviceId: string) => allSims.filter((s) => s.deviceId === deviceId);

  const openAdd = () => {
    setEditing(null);
    const num = devices.length + 841;
    setDeviceNum(String(num));
    setForm({ ...emptyForm, id: `${auth.franchiseId}-${num}` });
    setBvsSearch("");
    setBvsResults([]);
    setMatchedPerson(null);
    setOtpSent(false);
    setOtpValue("");
    setOtpVerified(false);
    setReceiveDate(new Date().toISOString().split("T")[0]);
    setShowForm(true);
  };

  const searchBVS = () => {
    if (!bvsSearch.trim()) { setBvsResults([]); return; }
    const q = bvsSearch.replace(/[\s+\-()]/g, "").trim().toLowerCase();
    const results: { id: string; name: string; mobile: string; retailerId: string; role: "DSO" | "DSM" }[] = [];
    const match = (val: string | undefined) => val && val.replace(/[\s+\-()]/g, "").toLowerCase().includes(q);
    dso.forEach((d) => {
      if (match(d.retailerId) || match(d.mobile) || match(d.id) || match(d.name))
        results.push({ id: d.id, name: d.name, mobile: d.mobile, retailerId: d.retailerId, role: "DSO" });
    });
    dsms.forEach((d) => {
      if (match(d.retailerId) || match(d.mobile) || match(d.id) || match(d.name))
        results.push({ id: d.id, name: d.name, mobile: d.mobile, retailerId: d.retailerId, role: "DSM" });
    });
    setBvsResults(results);
    setMatchedPerson(null);
  };

  const selectPerson = (person: { id: string; name: string; mobile: string; retailerId: string; role: "DSO" | "DSM" }) => {
    setMatchedPerson(person);
    setForm((p) => ({ ...p, bvsNumber: person.retailerId, assignedDSO: person.id, retailerId: person.retailerId, status: "Issued" }));
    setBvsResults([]);
    setOtpSent(false);
    setOtpValue("");
    setOtpVerified(false);
  };

  const sendOTP = () => { setOtpSent(true); setOtpValue(""); setOtpVerified(false); };

  const verifyOTP = () => {
    if (otpValue === otpCode) { setOtpVerified(true); } else { alert("Invalid OTP. Please try again."); }
  };
  const openEdit = (d: Device) => { setEditing(d); setForm({ ...d }); setShowForm(true); };

  const handleSave = () => {
    if (!form.brand || !form.model) return;
    const deviceToSave = { ...form, issueDate: matchedPerson ? receiveDate : "", returnDate: "", originalRetailerId: matchedPerson ? form.retailerId : "" };
    if (editing) updateDevice(editing.id, deviceToSave);
    else addDevice(deviceToSave);
    if (matchedPerson) {
      const issueRecord: DeviceIssueRecord = {
        id: `DEI-${Date.now()}`,
        deviceId: deviceToSave.id,
        assignedToId: matchedPerson.id,
        assignedToName: matchedPerson.name,
        assignedToRole: matchedPerson.role,
        retailerId: form.retailerId,
        baseRetailerId: form.retailerId,
        issueDate: receiveDate,
        returnDate: "",
        status: "Issued",
        notes: "",
        franchiseId: auth.franchiseId,
      };
      addDeviceIssueRecord(issueRecord);
    }
    setShowForm(false);
  };

  const openIssue = (d: Device) => {
    setShowIssue(d);
    setIssueForm({ dsoId: "", retailerId: "", notes: "" });
  };

  const handleIssue = () => {
    if (!showIssue || !issueForm.dsoId) return;
    const selectedDso = dso.find((d) => d.id === issueForm.dsoId);
    if (!selectedDso) return;
    const today = new Date().toISOString().split("T")[0];
    const dsoBaseId = selectedDso.retailerId || selectedDso.mobile.replace(/[\s+\-()]/g, "").slice(-11);
    const baseRetailerId = showIssue.originalRetailerId || "";
    const isFirstIssue = !showIssue.originalRetailerId;
    const lastIssue = deviceIssueRecords.filter((r) => r.deviceId === showIssue.id).sort((a, b) => b.issueDate.localeCompare(a.issueDate))[0];
    const isSamePerson = lastIssue && lastIssue.assignedToId === issueForm.dsoId;
    let issueRetailerId: string;
    if (isFirstIssue) {
      issueRetailerId = dsoBaseId;
    } else if (isSamePerson) {
      issueRetailerId = lastIssue.retailerId;
    } else {
      issueRetailerId = getNextDeviceRecordSubId(deviceIssueRecords, baseRetailerId);
    }
    if (isFirstIssue) {
      updateDevice(showIssue.id, {
        ...showIssue,
        status: "Issued",
        assignedDSO: issueForm.dsoId,
        retailerId: issueRetailerId,
        originalRetailerId: issueRetailerId,
        issueDate: today,
        returnDate: "",
      });
    } else {
      updateDevice(showIssue.id, {
        ...showIssue,
        status: "Issued",
        assignedDSO: issueForm.dsoId,
        issueDate: today,
        returnDate: "",
      });
    }
    const issueRecord: DeviceIssueRecord = {
      id: `DEI-${Date.now()}`,
      deviceId: showIssue.id,
      assignedToId: issueForm.dsoId,
      assignedToName: selectedDso.name,
      assignedToRole: "DSO",
      retailerId: issueRetailerId,
      baseRetailerId: isFirstIssue ? issueRetailerId : baseRetailerId,
      issueDate: today,
      returnDate: "",
      status: "Issued",
      notes: issueForm.notes,
      franchiseId: auth.franchiseId,
    };
    addDeviceIssueRecord(issueRecord);
    setShowIssue(null);
  };

  const openReturn = (d: Device) => {
    setShowReturn(d);
    setReturnForm({ notes: "" });
  };

  const handleReturn = () => {
    if (!showReturn) return;
    const today = new Date().toISOString().split("T")[0];
    const active = getActiveDeviceIssue(deviceIssueRecords, showReturn.id);
    if (active) returnDeviceIssueRecord(active.id);
    updateDevice(showReturn.id, {
      ...showReturn,
      status: "In Stock",
      assignedDSO: "",
      returnDate: today,
    });
    setShowReturn(null);
  };

  const setField = (field: keyof Device, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const tabs: { key: Tab; label: string; count: number; icon: typeof Smartphone }[] = [
    { key: "all", label: "All Devices", count: devices.length, icon: Smartphone },
    { key: "available", label: "Available", count: devices.filter((d) => d.status === "Available" || d.status === "In Stock").length, icon: Square },
    { key: "issued", label: "Issued", count: issuedDevices.length, icon: ArrowUpCircle },
    { key: "returned", label: "Returned", count: returnedDevices.length, icon: ArrowDownCircle },
    { key: "history", label: "Issue History", count: deviceIssueRecords.length, icon: History },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-50 text-green-700 border border-green-200";
      case "In Stock": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Assigned": case "Issued": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Damaged": case "Lost": return "bg-red-50 text-red-700 border border-red-200";
      case "Repair": return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "Returned": return "bg-purple-50 text-purple-700 border border-purple-200";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getSimStatusBreakdown = (deviceId: string) => {
    const sims = getDeviceSIMs(deviceId);
    const breakdown: Record<string, number> = { "In Stock": 0, Issued: 0, Active: 0, Returned: 0 };
    sims.forEach((s) => { if (s.status === "In Stock") breakdown["In Stock"]++; else if (s.status === "Issued") breakdown["Issued"]++; else if (s.status === "Activated") breakdown["Active"]++; else if (s.status === "Returned") breakdown["Returned"]++; });
    return { total: sims.length, breakdown };
  };

  // Group devices by date for issued/returned tabs
  const groupByDate = (list: Device[], dateField: "issueDate" | "returnDate") => {
    const groups: Record<string, Device[]> = {};
    list.forEach((d) => { const date = d[dateField] || "Unknown"; if (!groups[date]) groups[date] = []; groups[date].push(d); });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const toggleDateGroup = (key: string) => setExpandedDates((p) => ({ ...p, [key]: !p[key] }));

  // Device Details View
  if (viewMode === "details" && viewDevice) {
    const simInfo = getSimStatusBreakdown(viewDevice.id);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => { setViewMode("list"); setViewDevice(null); }} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"><X size={18} className="text-gray-600" /></button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Device Details</h1>
            <p className="text-gray-500 text-sm mt-1">{viewDevice.id}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><Smartphone size={16} className="text-[#0A2647]" /> Device Information</h3>
            <div className="space-y-3">
              {[ ["Device ID", viewDevice.id], ["Brand", viewDevice.brand], ["Model", viewDevice.model], ["IMEI", viewDevice.imei], ["BVS Number", viewDevice.bvsNumber], ["Purchase Date", formatDateDDMMYYYY(viewDevice.purchaseDate)], ["Status", viewDevice.status], ["Assigned DSO", getDSOName(viewDevice.assignedDSO)], ["Retailer ID", (viewDevice.status === "Issued" || viewDevice.status === "Assigned") ? (getActiveDeviceIssue(deviceIssueRecords, viewDevice.id)?.retailerId || viewDevice.retailerId || "â€”") : (viewDevice.retailerId || "â€”")], ["Base Retailer ID", viewDevice.originalRetailerId || "â€”"], ["Issue Date", formatDateDDMMYYYY(viewDevice.issueDate)], ["Return Date", formatDateDDMMYYYY(viewDevice.returnDate)] ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500 text-xs">{label}</span>
                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><Package size={16} className="text-[#0A2647]" /> Related SIMs</h3>
            {simInfo.total === 0 ? (
              <div className="text-center py-8"><Package size={24} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-xs">No SIMs assigned to this device</p></div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Object.entries(simInfo.breakdown).map(([status, count]) => (
                    <div key={status} className="bg-gray-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-lg font-bold text-[#0A2647]">{count}</p>
                      <p className="text-gray-500 text-xs">{status}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-black text-[#0A2647]">{simInfo.total}</p>
                  <p className="text-gray-500 text-xs">Total SIMs</p>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Issue History */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><History size={16} className="text-[#0A2647]" /> Issue History</h3>
          {(() => {
            const issues = deviceIssueRecords.filter((r) => r.deviceId === viewDevice.id);
            if (issues.length === 0) return <div className="text-center py-8"><History size={24} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-xs">No issue records for this device</p></div>;
            return (
              <div className="space-y-2">
                {issues.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.status === "Issued" ? "bg-blue-50" : "bg-purple-50"}`}>
                        {r.status === "Issued" ? <ArrowUpCircle size={14} className="text-blue-600" /> : <RotateCcw size={14} className="text-purple-600" />}
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{r.assignedToName}</p>
                        <p className="text-gray-400 text-xs">{r.assignedToRole} Â· <span className="font-mono">{r.retailerId}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${r.status === "Issued" ? "text-blue-600" : "text-purple-600"}`}>{r.status}</p>
                      <p className="text-gray-400 text-[10px]">Issued: {formatDateDDMMYYYY(r.issueDate)}{r.returnDate ? ` Â· Returned: ${formatDateDDMMYYYY(r.returnDate)}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Device Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage franchise devices, issue and return tracking</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Add Device
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl border border-gray-200 p-1.5 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === t.key ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
              <Icon size={14} /> {t.label}
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
        <Search size={16} className="text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by device ID, brand, model, IMEI..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
      </div>

      {/* Issued Tab - Date-wise grouped */}
      {(tab === "issued" || tab === "all") && issuedDevices.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><ArrowUpCircle size={16} className="text-blue-600" /> Issued Devices ({issuedDevices.length})</h3>
          </div>
          {tab === "issued" ? (
            <div className="p-4 space-y-3">
              {groupByDate(issuedDevices, "issueDate").map(([date, devs]) => (
                <div key={date} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={() => toggleDateGroup(`issued-${date}`)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{formatDateDDMMYYYY(date)}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">{devs.length} devices</span>
                    </div>
                    {expandedDates[`issued-${date}`] ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  </button>
                  {expandedDates[`issued-${date}`] && (
                    <div className="divide-y divide-gray-50">
                      {devs.map((d) => (
                        <div key={d.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Smartphone size={16} className="text-blue-600" /></div>
                            <div>
                              <p className="text-gray-900 text-sm font-medium">{d.brand} {d.model}</p>
                              <p className="text-gray-400 text-xs font-mono">{d.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-700 text-sm">{getDSOName(d.assignedDSO)}</p>
                            <p className="text-gray-400 text-xs font-mono">{getActiveDeviceIssue(deviceIssueRecords, d.id)?.retailerId || d.retailerId}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openReturn(d)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Return"><RotateCcw size={14} /></button>
                            <button onClick={() => { setViewDevice(d); setViewMode("details"); }} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-blue-50 rounded-lg transition-all" title="View"><Eye size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100"><th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Device</th><th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">DSO</th><th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Retailer ID</th><th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Issue Date</th><th className="text-right px-6 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th></tr></thead>
                <tbody>
                  {issuedDevices.map((d) => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3"><p className="text-gray-900 text-sm font-medium">{d.brand} {d.model}</p><p className="text-gray-400 text-xs font-mono">{d.id}</p></td>
                      <td className="px-6 py-3 hidden md:table-cell text-gray-600 text-sm">{getDSOName(d.assignedDSO)}</td>
                      <td className="px-6 py-3 hidden lg:table-cell text-gray-500 text-xs font-mono">{getActiveDeviceIssue(deviceIssueRecords, d.id)?.retailerId || d.retailerId}</td>
                      <td className="px-6 py-3 hidden lg:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(d.issueDate)}</td>
                      <td className="px-6 py-3 text-right"><button onClick={() => openReturn(d)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-100 border border-purple-200 transition-all"><RotateCcw size={12} /> Return</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Returned Tab - Date-wise grouped */}
      {(tab === "returned" || tab === "all") && returnedDevices.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-purple-50/50">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><ArrowDownCircle size={16} className="text-purple-600" /> Returned Devices ({returnedDevices.length})</h3>
          </div>
          {tab === "returned" ? (
            <div className="p-4 space-y-3">
              {groupByDate(returnedDevices, "returnDate").map(([date, devs]) => (
                <div key={date} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={() => toggleDateGroup(`returned-${date}`)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{formatDateDDMMYYYY(date)}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold">{devs.length} devices</span>
                    </div>
                    {expandedDates[`returned-${date}`] ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  </button>
                  {expandedDates[`returned-${date}`] && (
                    <div className="divide-y divide-gray-50">
                      {devs.map((d) => (
                        <div key={d.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Smartphone size={16} className="text-purple-600" /></div>
                            <div>
                              <p className="text-gray-900 text-sm font-medium">{d.brand} {d.model}</p>
                              <p className="text-gray-400 text-xs font-mono">{d.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-700 text-sm">Was: {getDSOName(d.assignedDSO)}</p>
                            <p className="text-gray-400 text-xs">Issued: {formatDateDDMMYYYY(d.issueDate)}</p>
                          </div>
                          <button onClick={() => { setViewDevice(d); setViewMode("details"); }} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-blue-50 rounded-lg transition-all"><Eye size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100"><th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Device</th><th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Previous DSO</th><th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Issue Date</th><th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Return Date</th><th className="text-right px-6 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th></tr></thead>
                <tbody>
                  {returnedDevices.map((d) => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3"><p className="text-gray-900 text-sm font-medium">{d.brand} {d.model}</p><p className="text-gray-400 text-xs font-mono">{d.id}</p></td>
                      <td className="px-6 py-3 hidden md:table-cell text-gray-600 text-sm">{getDSOName(d.assignedDSO)}</td>
                      <td className="px-6 py-3 hidden lg:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(d.issueDate)}</td>
                      <td className="px-6 py-3 hidden lg:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(d.returnDate)}</td>
                      <td className="px-6 py-3 text-right"><button onClick={() => { setViewDevice(d); setViewMode("details"); }} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-blue-50 rounded-lg transition-all"><Eye size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Issue History Tab */}
      {tab === "history" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><History size={16} className="text-indigo-600" /> All Issue Records ({deviceIssueRecords.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Issue ID</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Device</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Assigned To</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Retailer ID</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Issue Date</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Return Date</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
              </tr></thead>
              <tbody>
                {deviceIssueRecords.map((r) => {
                  const dev = devices.find((d) => d.id === r.deviceId);
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><p className="text-gray-900 text-sm font-mono font-medium">{r.id}</p></td>
                      <td className="px-6 py-4 hidden md:table-cell"><p className="text-gray-700 text-sm font-medium">{dev ? `${dev.brand} ${dev.model}` : r.deviceId}</p><p className="text-gray-400 text-xs font-mono">{r.deviceId}</p></td>
                      <td className="px-6 py-4 hidden lg:table-cell"><p className="text-gray-600 text-sm">{r.assignedToName}</p><p className="text-gray-400 text-xs">{r.assignedToRole}</p></td>
                      <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">{r.retailerId}</span></td>
                      <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(r.issueDate)}</td>
                      <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">{r.returnDate ? formatDateDDMMYYYY(r.returnDate) : "â€”"}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${r.status === "Issued" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>{r.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {deviceIssueRecords.length === 0 && <div className="px-6 py-12 text-center"><History size={32} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No issue records found</p></div>}
        </div>
      )}

      {/* All Devices Table */}
      {(tab === "all" || tab === "available") && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Smartphone size={16} className="text-[#0A2647]" /> {tab === "available" ? "Available Devices" : "All Devices"}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Device ID</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Brand / Model</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">IMEI</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Assigned DSO</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Retailer ID</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><p className="text-gray-900 text-sm font-mono font-medium">{d.id}</p><p className="text-gray-400 text-xs">{d.bvsNumber}</p></td>
                    <td className="px-6 py-4 hidden md:table-cell"><p className="text-gray-700 text-sm font-medium">{d.brand}</p><p className="text-gray-400 text-xs">{d.model}</p></td>
                    <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs font-mono">{d.imei}</td>
                    <td className="px-6 py-4 hidden xl:table-cell text-gray-600 text-sm">{getDSOName(d.assignedDSO)}</td>
                    <td className="px-6 py-4 hidden xl:table-cell text-gray-600 text-xs font-mono">{(d.status === "Issued" || d.status === "Assigned") ? (getActiveDeviceIssue(deviceIssueRecords, d.id)?.retailerId || d.retailerId || "â€”") : (d.retailerId || "â€”")}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyle(d.status)}`}>{d.status}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setViewDevice(d); setViewMode("details"); }} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-blue-50 rounded-lg transition-all" title="View Details"><Eye size={14} /></button>
                        <button onClick={() => openEdit(d)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit"><Edit size={14} /></button>
                        {d.status === "Available" && <button onClick={() => openIssue(d)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Issue Device"><ArrowUpCircle size={14} /></button>}
                        {d.status === "In Stock" && <button onClick={() => openIssue(d)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Re-Issue Device"><ArrowUpCircle size={14} /></button>}
                        {(d.status === "Issued" || d.status === "Assigned") && <button onClick={() => openReturn(d)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Return Device"><RotateCcw size={14} /></button>}
                        <button onClick={() => setShowDelete(d.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="px-6 py-12 text-center"><Smartphone size={32} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No devices found</p></div>}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Smartphone size={16} className="text-[#0A2647]" /> {editing ? "Edit Device" : "Add Device"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Device ID - Prefix + Manual Number */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Device ID</label>
                <div className="flex items-center">
                  <span className="px-4 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-mono font-bold">{auth.franchiseId}-</span>
                  <input type="text" value={deviceNum} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setDeviceNum(v); setForm((p) => ({ ...p, id: `${auth.franchiseId}-${v}` })); }} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl text-gray-900 text-sm font-mono focus:outline-none focus:border-[#0A2647]/50" placeholder="e.g. 841" />
                </div>
                <p className="text-gray-400 text-xs mt-1">Final ID: <span className="font-mono font-medium text-gray-600">{auth.franchiseId}-{deviceNum || "XXX"}</span></p>
              </div>

              {/* BVS Number / Retailer ID - Live Searchable Dropdown */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <label className="block text-gray-700 text-xs font-bold mb-2 flex items-center gap-1.5"><Fingerprint size={14} className="text-blue-600" /> BVS Number (Retailer ID)</label>
                <p className="text-gray-500 text-xs mb-2">Search by name, ID, retailer ID, or mobile to pair DSO/DSM</p>
                <div className="relative">
                  <input type="text" value={bvsSearch} onChange={(e) => { setBvsSearch(e.target.value); if (e.target.value.length >= 1) searchBVS(); else setBvsResults([]); setMatchedPerson(null); }} placeholder="Type name, ID, retailer ID or mobile..." className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" autoComplete="off" />
                  {bvsResults.length > 0 && !matchedPerson && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                      {bvsResults.map((p) => (
                        <button key={p.id} onClick={() => selectPerson(p)} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-50 transition-all text-left border-b border-gray-50 last:border-0">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0"><UserCheck size={15} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-gray-400 text-xs">{p.role} Â· <span className="font-mono">{p.id}</span></p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-gray-700 text-xs font-mono font-bold">{p.retailerId}</p>
                            <p className="text-gray-400 text-[10px]">{p.mobile}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {!matchedPerson && bvsSearch.length > 0 && bvsResults.length === 0 && (
                    <p className="mt-1 text-amber-600 text-xs">No DSO/DSM found matching &ldquo;<span className="font-medium">{bvsSearch}</span>&rdquo;</p>
                  )}
                </div>

                {/* Matched Person Card */}
                {matchedPerson && (
                  <div className="mt-3 bg-white border border-green-200 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><UserCheck size={16} className="text-green-600" /></div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm font-bold">{matchedPerson.name}</p>
                        <p className="text-gray-500 text-xs">{matchedPerson.role} | {matchedPerson.id}</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-200">Paired</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-gray-400 text-[10px]">Mobile</p><p className="text-gray-900 text-xs font-medium">{matchedPerson.mobile}</p></div>
                      <div className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-gray-400 text-[10px]">Retailer ID</p><p className="text-gray-900 text-xs font-mono font-medium">{matchedPerson.retailerId}</p></div>
                    </div>

                    {/* OTP Section */}
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      {!otpSent ? (
                        <button onClick={sendOTP} className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 inline-flex items-center justify-center gap-2"><Send size={14} /> Send OTP to {matchedPerson.mobile}</button>
                      ) : !otpVerified ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                            <ShieldCheck size={14} className="text-amber-600" />
                            <span className="text-amber-700 text-xs">OTP sent â€” Code: <span className="font-mono font-bold">{otpCode}</span></span>
                          </div>
                          <div className="flex gap-2">
                            <input type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-mono text-center focus:outline-none focus:border-blue-400" placeholder="Enter 6-digit OTP" maxLength={6} />
                            <button onClick={verifyOTP} className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Verify</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                          <ShieldCheck size={14} className="text-green-600" />
                          <span className="text-green-700 text-xs font-medium">OTP Verified â€” Device paired to {matchedPerson.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Device Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Brand</label>
                  <input type="text" value={form.brand} onChange={(e) => setField("brand", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" placeholder="Samsung, Oppo..." />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Model</label>
                  <input type="text" value={form.model} onChange={(e) => setField("model", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" placeholder="Galaxy A14..." />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">IMEI</label>
                  <input type="text" value={form.imei} onChange={(e) => setField("imei", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" placeholder="15-digit IMEI" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Date Received</label>
                  <input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>

              {/* Status Summary */}
              {matchedPerson && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 border ${otpVerified ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}>
                  <Smartphone size={16} className={otpVerified ? "text-green-600" : "text-blue-600"} />
                  <div>
                    <p className={`text-sm font-medium ${otpVerified ? "text-green-800" : "text-blue-800"}`}>
                      {otpVerified ? "Device ready to save â€” paired to " + matchedPerson.name : "Complete OTP verification to pair device"}
                    </p>
                    <p className="text-xs text-gray-500">Retailer ID: {matchedPerson.retailerId} (fixed, will not change on re-issue)</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={!!matchedPerson && !otpVerified} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Save size={14} /> {editing ? "Update" : "Add Device"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Device Modal */}
      {showIssue && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowIssue(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><ArrowUpCircle size={16} className="text-blue-600" /> Issue Device</h3>
              <button onClick={() => setShowIssue(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Device</p>
                <p className="text-gray-900 text-sm font-medium">{showIssue.brand} {showIssue.model}</p>
                <p className="text-gray-400 text-xs font-mono">{showIssue.id}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Assign to DSO *</label>
                <select value={issueForm.dsoId} onChange={(e) => {
  const sel = dso.find((d) => d.id === e.target.value);
  const base = sel?.retailerId || sel?.mobile.replace(/[\s+\-()]/g, "").slice(-11) || "";
  const baseRet = showIssue.originalRetailerId || "";
  let retId: string;
  if (!baseRet) {
    retId = base;
  } else {
    const last = deviceIssueRecords.filter((r) => r.deviceId === showIssue.id).sort((a, b) => b.issueDate.localeCompare(a.issueDate))[0];
    if (last && last.assignedToId === e.target.value) {
      retId = last.retailerId;
    } else {
      retId = getNextDeviceRecordSubId(deviceIssueRecords, baseRet);
    }
  }
  setIssueForm({ ...issueForm, dsoId: e.target.value, retailerId: retId });
}} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option value="">Select DSO...</option>
                  {dso.filter((d) => d.status === "Active").map((d) => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
                </select>
              </div>
              {issueForm.retailerId && (
                <div className="bg-blue-50 rounded-xl px-4 py-3">
                  <p className="text-gray-500 text-xs mb-1">Retailer ID (auto-assigned)</p>
                  <p className="text-blue-700 text-sm font-mono font-bold">{issueForm.retailerId}</p>
                </div>
              )}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Notes</label>
                <textarea value={issueForm.notes} onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 h-20 resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowIssue(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleIssue} disabled={!issueForm.dsoId} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><ArrowUpCircle size={14} /> Issue Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Device Modal */}
      {showReturn && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReturn(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><ArrowDownCircle size={16} className="text-purple-600" /> Return Device</h3>
              <button onClick={() => setShowReturn(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Device</p>
                <p className="text-gray-900 text-sm font-medium">{showReturn.brand} {showReturn.model}</p>
                <p className="text-gray-400 text-xs font-mono">{showReturn.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Issued To</p>
                  <p className="text-gray-900 text-sm font-medium">{getDSOName(showReturn.assignedDSO)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Issue Date</p>
                  <p className="text-gray-900 text-sm font-medium">{formatDateDDMMYYYY(showReturn.issueDate)}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-gray-500 text-xs mb-1">Retailer ID</p>
                <p className="text-gray-900 text-sm font-mono font-bold">{getActiveDeviceIssue(deviceIssueRecords, showReturn.id)?.retailerId || showReturn.retailerId}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Return Notes</label>
                <textarea value={returnForm.notes} onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 h-20 resize-none" placeholder="Optional return notes..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowReturn(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleReturn} className="flex-1 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 inline-flex items-center justify-center gap-2"><RotateCcw size={14} /> Confirm Return</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDelete(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-gray-900 font-bold mb-2">Delete Device?</h3>
            <p className="text-gray-500 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={() => { deleteDevice(showDelete); setShowDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
