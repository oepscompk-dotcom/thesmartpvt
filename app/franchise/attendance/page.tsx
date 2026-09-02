"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Search, Filter, AlertTriangle, FileText, Timer, Award, Ban, Eye, Plus, X, MapPin, Users, Settings, Trash2 } from "lucide-react";
import { useFranchiseData, AttendanceRecord } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoadById } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";

const defaultAttendanceSettings = { workStart: "09:00", workEnd: "18:00", lateAfter: "10:00", requiredHours: 8, finePerDay: 1000, bonusPerSale: 500 };

function calcWorkingHours(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  return Math.max(0, ((outH * 60 + outM) - (inH * 60 + inM)) / 60);
}

export default function FranchiseAttendancePage() {
  const { auth, attendance, dsms, dso, addAttendance, deleteAttendance } = useFranchiseData();
  const [settings, setSettings] = useState(defaultAttendanceSettings);

  useEffect(() => {
    (async () => {
      try {
        const s = await apiLoadById("franchiseData", "attendance-settings-" + auth.franchiseId);
        if (s?.data) setSettings(JSON.parse(s.data));
      } catch {}
    })();
  }, [auth?.franchiseId]);

  const [tab, setTab] = useState<"overview" | "dso" | "dsm" | "settings">("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allEmployees = useMemo(() => [
    ...dso.map((d) => ({ id: d.id, name: d.name, role: "DSO" as const })),
    ...dsms.map((d) => ({ id: d.id, name: d.name, role: "DSM" as const })),
  ], [dso, dsms]);

  const enrichedAttendance = useMemo(() => {
    return attendance.map((a) => {
      const emp = allEmployees.find((e) => e.id === a.employeeId);
      return { ...a, employeeName: emp?.name || a.employeeName, role: emp?.role || a.role };
    });
  }, [attendance, allEmployees]);

  const filtered = useMemo(() => {
    return enrichedAttendance.filter((a) => {
      const matchSearch = !search || a.employeeName.toLowerCase().includes(search.toLowerCase()) || a.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || a.status === statusFilter;
      const matchRole = roleFilter === "All" || a.role === roleFilter;
      let matchDate = true;
      if (dateFrom && a.date < dateFrom) matchDate = false;
      if (dateTo && a.date > dateTo) matchDate = false;
      return matchSearch && matchStatus && matchRole && matchDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [enrichedAttendance, search, statusFilter, roleFilter, dateFrom, dateTo]);

  const tabRows = useMemo(() => filtered.filter((a) => tab === "overview" || (tab === "dso" && a.role === "DSO") || (tab === "dsm" && a.role === "DSM")), [filtered, tab]);
  const allSelected = tabRows.length > 0 && tabRows.every((a) => selectedIds.includes(a.id));
  const toggleSelect = (id: string) => setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : tabRows.map((a) => a.id));
  const handleDeleteOne = async (id: string) => {
    if (!confirm("Delete this attendance record?")) return;
    await deleteAttendance(id);
    setSelectedIds((p) => p.filter((x) => x !== id));
  };
  const handleBulkDelete = async () => {
    if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} selected attendance record(s)?`)) return;
    await Promise.all(selectedIds.map((id) => deleteAttendance(id)));
    setSelectedIds([]);
  };

  const todayRecords = useMemo(() => enrichedAttendance.filter((a) => a.date === selectedDate), [enrichedAttendance, selectedDate]);

  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, leave = 0, totalHours = 0, totalFine = 0, totalBonus = 0;
    todayRecords.forEach((a) => {
      if (a.status === "Present") present++;
      else if (a.status === "Absent") absent++;
      else if (a.status === "Late") late++;
      else if (a.status === "Leave") leave++;
      const h = calcWorkingHours(a.checkIn, a.checkOut);
      totalHours += h;
      if (h > 0 && h < settings.requiredHours) totalFine += settings.finePerDay;
      if (h >= settings.requiredHours && h > 0) totalBonus += settings.bonusPerSale;
    });
    return { present, absent, late, leave, totalHours: totalHours.toFixed(1), totalFine, totalBonus, total: todayRecords.length };
  }, [todayRecords, settings]);

  const dsoStats = useMemo(() => {
    const dsoToday = todayRecords.filter((a) => a.role === "DSO");
    let present = 0, absent = 0, late = 0;
    dsoToday.forEach((a) => { if (a.status === "Present") present++; else if (a.status === "Absent") absent++; else if (a.status === "Late") late++; });
    return { present, absent, late, total: dsoToday.length };
  }, [todayRecords]);

  const dsmStats = useMemo(() => {
    const dsmToday = todayRecords.filter((a) => a.role === "DSM");
    let present = 0, absent = 0, late = 0;
    dsmToday.forEach((a) => { if (a.status === "Present") present++; else if (a.status === "Absent") absent++; else if (a.status === "Late") late++; });
    return { present, absent, late, total: dsmToday.length };
  }, [todayRecords]);

  const emptyForm: AttendanceRecord = { id: "", employeeId: "", employeeName: "", role: "DSO", date: new Date().toISOString().split("T")[0], checkIn: "", checkOut: "", gps: "", selfie: "", status: "Present", franchiseId: auth.franchiseId };
  const [form, setForm] = useState<AttendanceRecord>(emptyForm);

  const openMarkForm = () => {
    setForm({ ...emptyForm, id: `ATT-${String(attendance.length + 1).padStart(3, "0")}` });
    setShowMarkForm(true);
  };

  const handleSave = () => {
    if (!form.employeeId) return;
    const emp = allEmployees.find((e) => e.id === form.employeeId);
    if (emp) { form.employeeName = emp.name; form.role = emp.role; }
    addAttendance(form);
    setShowMarkForm(false);
  };

  const toggleSection = (key: string) => setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Attendance" }]}
        title="Attendance Management"
        description="Monitor DSO & DSM attendance, leave requests, and fines"
        actions={<Button onClick={openMarkForm}><Plus size={16} /> Mark Attendance</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 border border-slate-200">
          <CalendarCheck size={16} className="text-muted-foreground" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-sm text-slate-900 focus:outline-none" />
        </div>
        <div className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
            <CheckCircle2 size={12} /> {stats.present} Present
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            <XCircle size={12} /> {stats.absent} Absent
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-medium text-yellow-700">
            <Clock size={12} /> {stats.late} Late
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
            <FileText size={12} /> {stats.leave} Leave
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Present" value={stats.present} icon={CheckCircle2} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Absent" value={stats.absent} icon={XCircle} iconClass="text-red-600 bg-red-50" />
        <StatCard label="Late" value={stats.late} icon={Clock} iconClass="text-yellow-600 bg-yellow-50" />
        <StatCard label="Fine" value={`PKR ${stats.totalFine.toLocaleString()}`} icon={Ban} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="Bonus" value={`PKR ${stats.totalBonus.toLocaleString()}`} icon={Award} iconClass="text-purple-600 bg-purple-50" />
        <StatCard label="Total" value={stats.total} icon={Users} iconClass="text-blue-600 bg-blue-50" />
      </div>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
        {([["overview", "Overview"], ["dso", "DSO"], ["dsm", "DSM"], ["settings", "Settings"]] as const).map(([k, l]) => (
          <Button key={k} size="sm" variant={tab === k ? "primary" : "ghost"} onClick={() => setTab(k)} className="flex-1">
            {k === "overview" ? <CalendarCheck size={14} /> : k === "dso" ? <Users size={14} /> : k === "dsm" ? <Users size={14} /> : <Settings size={14} />}
            {l}
            {k !== "settings" && (
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${tab === k ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {k === "overview" ? todayRecords.length : k === "dso" ? dsoStats.total : dsmStats.total}
              </span>
            )}
          </Button>
        ))}
      </div>

      {(tab === "overview" || tab === "dso" || tab === "dsm") && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 flex-1 focus-within:border-brand-500/30 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
              <Search size={16} className="text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID..." className="w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Present", "Absent", "Late", "Leave"].map((s) => (
                <Button key={s} size="sm" variant={statusFilter === s ? "primary" : "outline"} onClick={() => setStatusFilter(s)}>
                  <Filter size={12} /> {s}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <span className="text-xs text-muted-foreground">From:</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent py-2 text-xs text-slate-900 focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <span className="text-xs text-muted-foreground">To:</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent py-2 text-xs text-slate-900 focus:outline-none" />
            </div>
            {(dateFrom || dateTo) && (
              <Button size="sm" variant="outline" className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                <X size={12} /> Clear
              </Button>
            )}
          </div>

          <Card>
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50/60 px-4 py-2.5">
                <p className="text-sm font-medium text-red-700">{selectedIds.length} selected</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>Clear</Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}><Trash2 size={12} /> Delete Selected</Button>
                </div>
              </div>
            )}
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="w-10 px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer accent-brand-600" />
                    </th>
                    <th className="w-14 px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Sr.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Check Out</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Fine</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Bonus</th>
                    <th className="w-20 px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tabRows.map((a, idx) => {
                    const hours = calcWorkingHours(a.checkIn, a.checkOut);
                    return (
                      <tr key={a.id} className={`border-b border-slate-100 text-sm transition-colors ${selectedIds.includes(a.id) ? "bg-brand-600/5" : "hover:bg-slate-50"}`}>
                        <td className="px-3 py-3 text-center">
                          <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)} className="h-4 w-4 cursor-pointer accent-brand-600" />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/10 text-xs font-black text-brand-600">{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">{a.employeeName}</p>
                          <p className="text-xs font-mono text-muted-foreground">{a.employeeId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill label={a.role} tone={a.role === "DSM" ? "accent" : "positive"} />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatDateDDMMYYYY(a.date)}</td>
                        <td className="px-4 py-3 font-mono text-sm text-slate-700">{a.checkIn || "\u2014"}</td>
                        <td className="px-4 py-3 font-mono text-sm text-slate-700">{a.checkOut || "\u2014"}</td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          {hours > 0 ? (
                            <span className={`text-sm font-bold ${hours >= settings.requiredHours ? "text-green-600" : "text-red-600"}`}>
                              {hours.toFixed(1)}h
                            </span>
                          ) : "\u2014"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill label={a.status} tone={toneForStatus(a.status)} />
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          {hours > 0 && hours < settings.requiredHours ? <span className="text-xs font-bold text-red-600">-PKR {settings.finePerDay.toLocaleString()}</span> : "\u2014"}
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          {hours >= settings.requiredHours && hours > 0 ? <span className="text-xs font-bold text-green-600">+PKR {settings.bonusPerSale.toLocaleString()}</span> : "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setViewRecord(a)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100" title="View">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => handleDeleteOne(a.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <CalendarCheck size={32} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-muted-foreground">No attendance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === "settings" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600"><Timer size={18} /></div><h3 className="font-bold text-slate-900">Current Attendance Rules</h3></div>
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <div><p className="mb-1 text-xs text-muted-foreground">Work Hours</p><p className="text-lg font-bold text-slate-900">{settings.workStart} - {settings.workEnd}</p></div>
                <div><p className="mb-1 text-xs text-muted-foreground">Late After</p><p className="text-lg font-bold text-slate-900">{settings.lateAfter}</p></div>
                <div><p className="mb-1 text-xs text-muted-foreground">Required Hours</p><p className="text-lg font-bold text-slate-900">{settings.requiredHours}h</p></div>
                <div><p className="mb-1 text-xs text-muted-foreground">Fine Per Day (below {settings.requiredHours}h)</p><p className="text-lg font-bold text-red-600">PKR {settings.finePerDay.toLocaleString()}</p></div>
                <div><p className="mb-1 text-xs text-muted-foreground">Bonus ({settings.requiredHours}h+ with sales)</p><p className="text-lg font-bold text-green-600">PKR {settings.bonusPerSale.toLocaleString()}</p></div>
                <div><p className="mb-1 text-xs text-muted-foreground">Consecutive Absent Warning</p><p className="text-lg font-bold text-amber-600">3+ days</p></div>
              </div>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-amber-700"><AlertTriangle size={14} /> Settings can be changed from Settings page. Rules apply to all DSO/DSM.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setViewRecord(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-900 font-bold flex items-center gap-2"><Eye size={18} /> Attendance Details</h3>
              <button onClick={() => setViewRecord(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${viewRecord.role === "DSM" ? "bg-blue-600" : "bg-green-600"}`}>{viewRecord.employeeName?.charAt(0)}</div>
                <div>
                  <p className="font-bold text-slate-900">{viewRecord.employeeName}</p>
                  <p className="text-xs font-mono text-muted-foreground">{viewRecord.employeeId} &middot; {viewRecord.role}</p>
                </div>
              </div>
              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium text-slate-900">{formatDateDDMMYYYY(viewRecord.date)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Check In</span><span className="font-mono font-bold text-slate-900">{viewRecord.checkIn || "\u2014"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Check Out</span><span className="font-mono font-bold text-slate-900">{viewRecord.checkOut || "\u2014"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Working Hours</span><span className={`font-bold ${calcWorkingHours(viewRecord.checkIn, viewRecord.checkOut) >= settings.requiredHours ? "text-green-600" : "text-red-600"}`}>{calcWorkingHours(viewRecord.checkIn, viewRecord.checkOut).toFixed(1)}h / {settings.requiredHours}h</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Status</span><StatusPill label={viewRecord.status} tone={toneForStatus(viewRecord.status)} /></div>
                {viewRecord.gps ? <div className="flex justify-between text-sm"><span className="text-slate-500">GPS</span><span className="text-slate-700 text-xs flex items-center gap-1"><MapPin size={10} /> {viewRecord.gps}</span></div> : null}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100">
              <button onClick={() => setViewRecord(null)} className="w-full py-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {showMarkForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowMarkForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-900 font-bold flex items-center gap-2"><Plus size={18} /> Mark Attendance</h3>
              <button onClick={() => setShowMarkForm(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Employee *</label>
                <Select value={form.employeeId} onChange={(e) => {
                  const emp = allEmployees.find((em) => em.id === e.target.value);
                  setForm((p) => ({ ...p, employeeId: e.target.value, employeeName: emp?.name || "", role: emp?.role || "DSO" }));
                }}>
                  <option value="">Select Employee...</option>
                  <optgroup label="DSOs">{dso.map((d) => <option key={d.id} value={d.id}>{d.id} - {d.name} (DSO)</option>)}</optgroup>
                  <optgroup label="DSMs">{dsms.map((d) => <option key={d.id} value={d.id}>{d.id} - {d.name} (DSM)</option>)}</optgroup>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label><Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Check In</label><Input type="time" value={form.checkIn} onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))} /></div>
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Check Out</label><Input type="time" value={form.checkOut} onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))} /></div>
              </div>
              <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label><Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>{["Present", "Absent", "Late", "Half Day", "Leave"].map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-700">Work: {settings.workStart} - {settings.workEnd} | Late after: {settings.lateAfter} | Fine: PKR {settings.finePerDay.toLocaleString()} | Bonus: PKR {settings.bonusPerSale.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowMarkForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.employeeId}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
