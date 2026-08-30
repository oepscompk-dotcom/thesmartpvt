"use client";

import { useState, useMemo, useEffect } from "react";
import { Smartphone, Plus, Edit, Trash2, X, Save, Square, Eye, RotateCcw, Package, ArrowUpCircle, ArrowDownCircle, Calendar, ChevronDown, ChevronRight, Fingerprint, ShieldCheck, Send, UserCheck, History } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import type { ToneValue } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
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
  const [page, setPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  useEffect(() => { setPage(1); setHistoryPage(1); }, [tab, search]);
  const PAGE_SIZE = 10;

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedFiltered = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const historyPageCount = Math.max(1, Math.ceil(deviceIssueRecords.length / PAGE_SIZE));
  const pagedHistory = useMemo(() => deviceIssueRecords.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE), [deviceIssueRecords, historyPage]);

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

  const getDeviceTone = (status: string): ToneValue => {
    switch (status) {
      case "Available": case "In Stock": return "positive";
      case "Assigned": case "Issued": return "brand";
      case "Damaged": case "Lost": return "negative";
      case "Repair": return "warning";
      case "Returned": return "accent";
      default: return "neutral";
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
        <PageHeader
          breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Devices", href: "/franchise/devices" }, { label: "Device Details" }]}
          title="Device Details"
          description={viewDevice.id}
          actions={
            <Button variant="outline" onClick={() => { setViewMode("list"); setViewDevice(null); }}>
              <X className="h-4 w-4" /> Back to List
            </Button>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-brand-600" /> Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[ ["Device ID", viewDevice.id], ["Brand", viewDevice.brand], ["Model", viewDevice.model], ["IMEI", viewDevice.imei], ["BVS Number", viewDevice.bvsNumber], ["Purchase Date", formatDateDDMMYYYY(viewDevice.purchaseDate)], ["Status", viewDevice.status], ["Assigned DSO", getDSOName(viewDevice.assignedDSO)], ["Retailer ID", (viewDevice.status === "Issued" || viewDevice.status === "Assigned") ? (getActiveDeviceIssue(deviceIssueRecords, viewDevice.id)?.retailerId || viewDevice.retailerId || "â€”") : (viewDevice.retailerId || "â€”")], ["Base Retailer ID", viewDevice.originalRetailerId || "â€”"], ["Issue Date", formatDateDDMMYYYY(viewDevice.issueDate)], ["Return Date", formatDateDDMMYYYY(viewDevice.returnDate)] ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="h-4 w-4 text-brand-600" /> Related SIMs</CardTitle>
            </CardHeader>
            <CardContent>
              {simInfo.total === 0 ? (
                <EmptyState icon={Package} title="No SIMs assigned" description="No SIMs assigned to this device." />
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {Object.entries(simInfo.breakdown).map(([status, count]) => (
                      <div key={status} className="rounded-lg bg-slate-50 px-3 py-2 text-center">
                        <p className="text-lg font-bold text-brand-700">{count}</p>
                        <p className="text-xs text-muted-foreground">{status}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-brand-700">{simInfo.total}</p>
                    <p className="text-xs text-muted-foreground">Total SIMs</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Issue History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-brand-600" /> Issue History</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const issues = deviceIssueRecords.filter((r) => r.deviceId === viewDevice.id);
              if (issues.length === 0) return <EmptyState icon={History} title="No issue records" description="No issue records for this device." />;
              return (
                <div className="space-y-2">
                  {issues.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.status === "Issued" ? "bg-brand-50" : "bg-purple-50"}`}>
                          {r.status === "Issued" ? <ArrowUpCircle className="h-4 w-4 text-brand-600" /> : <RotateCcw className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.assignedToName}</p>
                          <p className="text-xs text-muted-foreground">{r.assignedToRole} · <span className="font-mono">{r.retailerId}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusPill label={r.status} tone={r.status === "Issued" ? "brand" : "accent"} />
                        <p className="mt-1 text-[10px] text-muted-foreground">Issued: {formatDateDDMMYYYY(r.issueDate)}{r.returnDate ? ` · Returned: ${formatDateDDMMYYYY(r.returnDate)}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Devices" }]}
        title="Device Management"
        description="Manage franchise devices, issue and return tracking"
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Device
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Devices" value={devices.length} icon={Smartphone} />
        <StatCard label="Available" value={devices.filter((d) => d.status === "Available" || d.status === "In Stock").length} icon={Square} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Issued" value={issuedDevices.length} icon={ArrowUpCircle} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="Returned" value={returnedDevices.length} icon={ArrowDownCircle} iconClass="text-purple-600 bg-purple-50" />
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="flex flex-wrap gap-1.5 py-3">
          {tabs.map((t) => (
            <QuickChip key={t.key} label={t.label} count={t.count} active={tab === t.key} onClick={() => setTab(t.key)} />
          ))}
        </CardContent>
      </Card>

      {/* Search */}
      <SearchInput placeholder="Search by device ID, brand, model, IMEI..." value={search} onChange={(v) => setSearch(v)} />

      {/* Issued Tab - Date-wise grouped */}
      {(tab === "issued" || tab === "all") && issuedDevices.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 bg-blue-50/50 px-6 py-4">
            <ArrowUpCircle className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-foreground">Issued Devices ({issuedDevices.length})</h3>
          </div>
          {tab === "issued" ? (
            <div className="space-y-3 p-4">
              {groupByDate(issuedDevices, "issueDate").map(([date, devs]) => (
                <div key={date} className="overflow-hidden rounded-lg border border-slate-100">
                  <button onClick={() => toggleDateGroup(`issued-${date}`)} className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{formatDateDDMMYYYY(date)}</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{devs.length} devices</span>
                    </div>
                    {expandedDates[`issued-${date}`] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {expandedDates[`issued-${date}`] && (
                    <div className="divide-y divide-slate-100">
                      {devs.map((d) => (
                        <div key={d.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><Smartphone className="h-4 w-4 text-blue-600" /></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{d.brand} {d.model}</p>
                              <p className="font-mono text-xs text-muted-foreground">{d.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground">{getDSOName(d.assignedDSO)}</p>
                            <p className="font-mono text-xs text-muted-foreground">{getActiveDeviceIssue(deviceIssueRecords, d.id)?.retailerId || d.retailerId}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openReturn(d)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-purple-50 hover:text-purple-600" title="Return"><RotateCcw className="h-4 w-4" /></button>
                            <button onClick={() => { setViewDevice(d); setViewMode("details"); }} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600" title="View"><Eye className="h-4 w-4" /></button>
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
              <table className="w-full min-w-[900px] text-sm">
                <thead><tr className="border-b bg-slate-50 text-xs font-medium uppercase tracking-wide text-muted-foreground"><th className="px-6 py-3 text-left">Device</th><th className="hidden px-6 py-3 text-left md:table-cell">DSO</th><th className="hidden px-6 py-3 text-left lg:table-cell">Retailer ID</th><th className="hidden px-6 py-3 text-left lg:table-cell">Issue Date</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {issuedDevices.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                      <td className="px-6 py-3"><p className="text-sm font-medium text-foreground">{d.brand} {d.model}</p><p className="font-mono text-xs text-muted-foreground">{d.id}</p></td>
                      <td className="hidden px-6 py-3 text-sm text-foreground md:table-cell">{getDSOName(d.assignedDSO)}</td>
                      <td className="hidden px-6 py-3 font-mono text-xs text-muted-foreground lg:table-cell">{getActiveDeviceIssue(deviceIssueRecords, d.id)?.retailerId || d.retailerId}</td>
                      <td className="hidden px-6 py-3 text-xs text-muted-foreground lg:table-cell">{formatDateDDMMYYYY(d.issueDate)}</td>
                      <td className="px-6 py-3 text-right"><Button size="sm" variant="secondary" onClick={() => openReturn(d)}><RotateCcw className="h-3.5 w-3.5" /> Return</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Returned Tab - Date-wise grouped */}
      {(tab === "returned" || tab === "all") && returnedDevices.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 bg-purple-50/50 px-6 py-4">
            <ArrowDownCircle className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-foreground">Returned Devices ({returnedDevices.length})</h3>
          </div>
          {tab === "returned" ? (
            <div className="space-y-3 p-4">
              {groupByDate(returnedDevices, "returnDate").map(([date, devs]) => (
                <div key={date} className="overflow-hidden rounded-lg border border-slate-100">
                  <button onClick={() => toggleDateGroup(`returned-${date}`)} className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{formatDateDDMMYYYY(date)}</span>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">{devs.length} devices</span>
                    </div>
                    {expandedDates[`returned-${date}`] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {expandedDates[`returned-${date}`] && (
                    <div className="divide-y divide-slate-100">
                      {devs.map((d) => (
                        <div key={d.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50"><Smartphone className="h-4 w-4 text-purple-600" /></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{d.brand} {d.model}</p>
                              <p className="font-mono text-xs text-muted-foreground">{d.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground">Was: {getDSOName(d.assignedDSO)}</p>
                            <p className="text-xs text-muted-foreground">Issued: {formatDateDDMMYYYY(d.issueDate)}</p>
                          </div>
                          <button onClick={() => { setViewDevice(d); setViewMode("details"); }} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead><tr className="border-b bg-slate-50 text-xs font-medium uppercase tracking-wide text-muted-foreground"><th className="px-6 py-3 text-left">Device</th><th className="hidden px-6 py-3 text-left md:table-cell">Previous DSO</th><th className="hidden px-6 py-3 text-left lg:table-cell">Issue Date</th><th className="hidden px-6 py-3 text-left lg:table-cell">Return Date</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {returnedDevices.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                      <td className="px-6 py-3"><p className="text-sm font-medium text-foreground">{d.brand} {d.model}</p><p className="font-mono text-xs text-muted-foreground">{d.id}</p></td>
                      <td className="hidden px-6 py-3 text-sm text-foreground md:table-cell">{getDSOName(d.assignedDSO)}</td>
                      <td className="hidden px-6 py-3 text-xs text-muted-foreground lg:table-cell">{formatDateDDMMYYYY(d.issueDate)}</td>
                      <td className="hidden px-6 py-3 text-xs text-muted-foreground lg:table-cell">{formatDateDDMMYYYY(d.returnDate)}</td>
                      <td className="px-6 py-3 text-right"><button onClick={() => { setViewDevice(d); setViewMode("details"); }} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600"><Eye className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Issue History Tab */}
      {tab === "history" && (
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 bg-indigo-50/50 px-6 py-4">
            <History className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-foreground">All Issue Records ({deviceIssueRecords.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead><tr className="border-b bg-slate-50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 text-left">Issue ID</th>
                <th className="hidden px-6 py-3 text-left md:table-cell">Device</th>
                <th className="hidden px-6 py-3 text-left lg:table-cell">Assigned To</th>
                <th className="px-6 py-3 text-left">Retailer ID</th>
                <th className="hidden px-6 py-3 text-left lg:table-cell">Issue Date</th>
                <th className="hidden px-6 py-3 text-left lg:table-cell">Return Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {pagedHistory.map((r) => {
                  const dev = devices.find((d) => d.id === r.deviceId);
                  return (
                    <tr key={r.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                      <td className="px-6 py-3"><p className="font-mono text-sm font-medium text-foreground">{r.id}</p></td>
                      <td className="hidden px-6 py-3 md:table-cell"><p className="text-sm font-medium text-foreground">{dev ? `${dev.brand} ${dev.model}` : r.deviceId}</p><p className="font-mono text-xs text-muted-foreground">{r.deviceId}</p></td>
                      <td className="hidden px-6 py-3 lg:table-cell"><p className="text-sm text-foreground">{r.assignedToName}</p><p className="text-xs text-muted-foreground">{r.assignedToRole}</p></td>
                      <td className="px-6 py-3"><span className="rounded-lg bg-indigo-50 px-2 py-1 font-mono text-xs font-bold text-indigo-700">{r.retailerId}</span></td>
                      <td className="hidden px-6 py-3 text-xs text-muted-foreground lg:table-cell">{formatDateDDMMYYYY(r.issueDate)}</td>
                      <td className="hidden px-6 py-3 text-xs text-muted-foreground lg:table-cell">{r.returnDate ? formatDateDDMMYYYY(r.returnDate) : "â€”"}</td>
                      <td className="px-6 py-3"><StatusPill label={r.status} tone={r.status === "Issued" ? "brand" : "accent"} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={historyPage} totalPages={historyPageCount} onChange={setHistoryPage} />
          {deviceIssueRecords.length === 0 && (
            <EmptyState icon={History} title="No issue records" description="No issue records found." />
          )}
        </Card>
      )}

      {/* All Devices Table */}
      {(tab === "all" || tab === "available") && (
        <Card>
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <Smartphone className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-foreground">{tab === "available" ? "Available Devices" : "All Devices"}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead><tr className="border-b bg-slate-50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 text-left">Device ID</th>
                <th className="hidden px-6 py-3 text-left md:table-cell">Brand / Model</th>
                <th className="hidden px-6 py-3 text-left lg:table-cell">IMEI</th>
                <th className="hidden px-6 py-3 text-left xl:table-cell">Assigned DSO</th>
                <th className="hidden px-6 py-3 text-left xl:table-cell">Retailer ID</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {pagedFiltered.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-6 py-3"><p className="font-mono text-sm font-medium text-foreground">{d.id}</p><p className="text-xs text-muted-foreground">{d.bvsNumber}</p></td>
                    <td className="hidden px-6 py-3 md:table-cell"><p className="text-sm font-medium text-foreground">{d.brand}</p><p className="text-xs text-muted-foreground">{d.model}</p></td>
                    <td className="hidden px-6 py-3 font-mono text-xs text-muted-foreground lg:table-cell">{d.imei}</td>
                    <td className="hidden px-6 py-3 text-sm text-foreground xl:table-cell">{getDSOName(d.assignedDSO)}</td>
                    <td className="hidden px-6 py-3 font-mono text-xs text-muted-foreground xl:table-cell">{(d.status === "Issued" || d.status === "Assigned") ? (getActiveDeviceIssue(deviceIssueRecords, d.id)?.retailerId || d.retailerId || "â€”") : (d.retailerId || "â€”")}</td>
                    <td className="px-6 py-3"><StatusPill label={d.status} tone={getDeviceTone(d.status)} /></td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setViewDevice(d); setViewMode("details"); }} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600" title="View Details"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(d)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-600" title="Edit"><Edit className="h-4 w-4" /></button>
                        {d.status === "Available" && <button onClick={() => openIssue(d)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600" title="Issue Device"><ArrowUpCircle className="h-4 w-4" /></button>}
                        {d.status === "In Stock" && <button onClick={() => openIssue(d)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600" title="Re-Issue Device"><ArrowUpCircle className="h-4 w-4" /></button>}
                        {(d.status === "Issued" || d.status === "Assigned") && <button onClick={() => openReturn(d)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-purple-50 hover:text-purple-600" title="Return Device"><RotateCcw className="h-4 w-4" /></button>}
                        <button onClick={() => setShowDelete(d.id)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={pageCount} onChange={setPage} />
          {filtered.length === 0 && (
            <EmptyState icon={Smartphone} title="No devices found" description="No devices found." />
          )}
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Smartphone className="h-4 w-4 text-brand-600" /> {editing ? "Edit Device" : "Add Device"}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Device ID - Prefix + Manual Number */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Device ID</label>
                <div className="flex items-center">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 px-4 text-sm font-mono font-bold text-muted-foreground">{auth.franchiseId}-</span>
                  <input type="text" value={deviceNum} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setDeviceNum(v); setForm((p) => ({ ...p, id: `${auth.franchiseId}-${v}` })); }} className="flex-1 rounded-r-lg border border-slate-200 bg-background px-4 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="e.g. 841" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Final ID: <span className="font-mono font-medium">{auth.franchiseId}-{deviceNum || "XXX"}</span></p>
              </div>

              {/* BVS Number / Retailer ID - Live Searchable Dropdown */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Fingerprint className="h-3.5 w-3.5 text-blue-600" /> BVS Number (Retailer ID)</label>
                <p className="mb-2 text-xs text-muted-foreground">Search by name, ID, retailer ID, or mobile to pair DSO/DSM</p>
                <div className="relative">
                  <input type="text" value={bvsSearch} onChange={(e) => { setBvsSearch(e.target.value); if (e.target.value.length >= 1) searchBVS(); else setBvsResults([]); setMatchedPerson(null); }} placeholder="Type name, ID, retailer ID or mobile..." className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100" autoComplete="off" />
                  {bvsResults.length > 0 && !matchedPerson && (
                    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                      {bvsResults.map((p) => (
                        <button key={p.id} onClick={() => selectPerson(p)} className="flex w-full items-center gap-3 border-b border-slate-50 px-3 py-3 text-left transition-colors last:border-0 hover:bg-blue-50">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><UserCheck className="h-4 w-4" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.role} · <span className="font-mono">{p.id}</span></p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-mono text-xs font-bold text-foreground">{p.retailerId}</p>
                            <p className="text-[10px] text-muted-foreground">{p.mobile}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {!matchedPerson && bvsSearch.length > 0 && bvsResults.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">No DSO/DSM found matching &ldquo;<span className="font-medium">{bvsSearch}</span>&rdquo;</p>
                  )}
                </div>

                {/* Matched Person Card */}
                {matchedPerson && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-white p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50"><UserCheck className="h-4 w-4 text-green-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{matchedPerson.name}</p>
                        <p className="text-xs text-muted-foreground">{matchedPerson.role} | {matchedPerson.id}</p>
                      </div>
                      <span className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Paired</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-[10px] text-muted-foreground">Mobile</p><p className="text-xs font-medium text-foreground">{matchedPerson.mobile}</p></div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-[10px] text-muted-foreground">Retailer ID</p><p className="font-mono text-xs font-medium text-foreground">{matchedPerson.retailerId}</p></div>
                    </div>

                    {/* OTP Section */}
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      {!otpSent ? (
                        <Button className="inline-flex w-full items-center justify-center gap-2" onClick={sendOTP}><Send className="h-4 w-4" /> Send OTP to {matchedPerson.mobile}</Button>
                      ) : !otpVerified ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-xs text-amber-700">OTP sent — Code: <span className="font-mono font-bold">{otpCode}</span></span>
                          </div>
                          <div className="flex gap-2">
                            <input type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className="flex-1 rounded-lg border border-slate-200 bg-background px-4 py-2.5 text-center font-mono text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="Enter 6-digit OTP" maxLength={6} />
                            <Button variant="outline" onClick={verifyOTP} className="inline-flex items-center gap-1.5" ><ShieldCheck className="h-4 w-4" /> Verify</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-xs font-medium text-green-700">OTP Verified — Device paired to {matchedPerson.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Device Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Brand</label>
                  <input type="text" value={form.brand} onChange={(e) => setField("brand", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="Samsung, Oppo..." />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Model</label>
                  <input type="text" value={form.model} onChange={(e) => setField("model", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="Galaxy A14..." />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">IMEI</label>
                  <input type="text" value={form.imei} onChange={(e) => setField("imei", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="15-digit IMEI" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date Received</label>
                  <input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                </div>
              </div>

              {/* Status Summary */}
              {matchedPerson && (
                <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${otpVerified ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
                  <Smartphone className={`h-4 w-4 ${otpVerified ? "text-green-600" : "text-blue-600"}`} />
                  <div>
                    <p className={`text-sm font-medium ${otpVerified ? "text-green-800" : "text-blue-800"}`}>
                      {otpVerified ? "Device ready to save — paired to " + matchedPerson.name : "Complete OTP verification to pair device"}
                    </p>
                    <p className="text-xs text-muted-foreground">Retailer ID: {matchedPerson.retailerId} (fixed, will not change on re-issue)</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!!matchedPerson && !otpVerified}><Save className="h-4 w-4" /> {editing ? "Update" : "Add Device"}</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Issue Device Modal */}
      {showIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowIssue(null)}>
          <Card className="w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-blue-50/50 px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><ArrowUpCircle className="h-4 w-4 text-blue-600" /> Issue Device</h3>
              <button onClick={() => setShowIssue(null)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-xs text-muted-foreground">Device</p>
                <p className="text-sm font-medium text-foreground">{showIssue.brand} {showIssue.model}</p>
                <p className="font-mono text-xs text-muted-foreground">{showIssue.id}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Assign to DSO *</label>
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
}} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                  <option value="">Select DSO...</option>
                  {dso.filter((d) => d.status === "Active").map((d) => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
                </select>
              </div>
              {issueForm.retailerId && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                  <p className="mb-1 text-xs text-muted-foreground">Retailer ID (auto-assigned)</p>
                  <p className="font-mono text-sm font-bold text-blue-700">{issueForm.retailerId}</p>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</label>
                <textarea value={issueForm.notes} onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 h-20 resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowIssue(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleIssue} disabled={!issueForm.dsoId}><ArrowUpCircle className="h-4 w-4" /> Issue Now</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Return Device Modal */}
      {showReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowReturn(null)}>
          <Card className="w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-purple-50/50 px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><ArrowDownCircle className="h-4 w-4 text-purple-600" /> Return Device</h3>
              <button onClick={() => setShowReturn(null)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-xs text-muted-foreground">Device</p>
                <p className="text-sm font-medium text-foreground">{showReturn.brand} {showReturn.model}</p>
                <p className="font-mono text-xs text-muted-foreground">{showReturn.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Issued To</p>
                  <p className="text-sm font-medium text-foreground">{getDSOName(showReturn.assignedDSO)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Issue Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDateDDMMYYYY(showReturn.issueDate)}</p>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="mb-1 text-xs text-muted-foreground">Retailer ID</p>
                <p className="font-mono text-sm font-bold text-foreground">{getActiveDeviceIssue(deviceIssueRecords, showReturn.id)?.retailerId || showReturn.retailerId}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Return Notes</label>
                <textarea value={returnForm.notes} onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 h-20 resize-none" placeholder="Optional return notes..." />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowReturn(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleReturn}><RotateCcw className="h-4 w-4" /> Confirm Return</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowDelete(null)}>
          <Card className="w-full max-w-sm p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50"><Trash2 className="h-5 w-5 text-red-600" /></div>
            <h3 className="mb-2 text-base font-semibold text-foreground">Delete Device?</h3>
            <p className="mb-4 text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDelete(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { deleteDevice(showDelete); setShowDelete(null); }}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
