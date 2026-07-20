"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Search, Filter, AlertTriangle, FileText, ArrowLeft, Timer, Award, Ban, Eye, Plus, X, MapPin, Users, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useFranchiseData, AttendanceRecord } from "@/lib/FranchiseDataContext";
import Link from "next/link";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoadById } from "@/lib/api";

const defaultAttendanceSettings = { workStart: "09:00", workEnd: "18:00", lateAfter: "10:00", requiredHours: 8, finePerDay: 1000, bonusPerSale: 500 };

function calcWorkingHours(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  return Math.max(0, ((outH * 60 + outM) - (inH * 60 + inM)) / 60);
}

export default function FranchiseAttendancePage() {
  const { auth, attendance, dsms, dso, addAttendance } = useFranchiseData();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/franchise/dashboard" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Attendance Management</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor DSO & DSM attendance, leave requests, and fines</p>
          </div>
        </div>
        <button onClick={openMarkForm} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Mark Attendance
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200">
          <CalendarCheck size={16} className="text-gray-400" />
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-gray-900 text-sm focus:outline-none" />
        </div>
        <div className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 size={12} /> {stats.present} Present
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> {stats.absent} Absent
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            <Clock size={12} /> {stats.late} Late
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <FileText size={12} /> {stats.leave} Leave
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle2 size={14} className="text-green-600" /></div>
          <div><p className="text-lg font-black text-green-600">{stats.present}</p><p className="text-gray-500 text-[10px]">Present</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><XCircle size={14} className="text-red-600" /></div>
          <div><p className="text-lg font-black text-red-600">{stats.absent}</p><p className="text-gray-500 text-[10px]">Absent</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center"><Clock size={14} className="text-yellow-600" /></div>
          <div><p className="text-lg font-black text-yellow-600">{stats.late}</p><p className="text-gray-500 text-[10px]">Late</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Ban size={14} className="text-amber-600" /></div>
          <div><p className="text-lg font-black text-amber-600">PKR {stats.totalFine.toLocaleString()}</p><p className="text-gray-500 text-[10px]">Fine</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Award size={14} className="text-purple-600" /></div>
          <div><p className="text-lg font-black text-purple-600">PKR {stats.totalBonus.toLocaleString()}</p><p className="text-gray-500 text-[10px]">Bonus</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Users size={14} className="text-blue-600" /></div>
          <div><p className="text-lg font-black text-blue-600">{stats.total}</p><p className="text-gray-500 text-[10px]">Total</p></div>
        </div>
      </div>

      <div className="flex gap-2 bg-white rounded-2xl border border-gray-200 p-1.5">
        {([["overview", "Overview"], ["dso", "DSO"], ["dsm", "DSM"], ["settings", "Settings"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === k ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
            {k === "overview" ? <CalendarCheck size={14} /> : k === "dso" ? <Users size={14} /> : k === "dsm" ? <Users size={14} /> : <Settings size={14} />}
            {l}
            {k !== "settings" && (
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${tab === k ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {k === "overview" ? todayRecords.length : k === "dso" ? dsoStats.total : dsmStats.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {(tab === "overview" || tab === "dso" || tab === "dsm") && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
              <Search size={16} className="text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Present", "Absent", "Late", "Leave"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                  <span className="flex items-center gap-1.5"><Filter size={12} /> {s}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
              <span className="text-gray-500 text-xs">From:</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-gray-900 text-xs focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
              <span className="text-gray-500 text-xs">To:</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-gray-900 text-xs focus:outline-none" />
            </div>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Employee</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Role</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Check In</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Check Out</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Hours</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Fine</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Bonus</th>
                    <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase w-14">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.filter((a) => tab === "overview" || (tab === "dso" && a.role === "DSO") || (tab === "dsm" && a.role === "DSM")).map((a, idx) => {
                    const hours = calcWorkingHours(a.checkIn, a.checkOut);
                    return (
                      <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900 text-sm font-medium">{a.employeeName}</p>
                          <p className="text-gray-400 text-xs font-mono">{a.employeeId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${a.role === "DSM" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{a.role}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-900 text-sm font-medium">{formatDateDDMMYYYY(a.date)}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm font-mono">{a.checkIn || "—"}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm font-mono">{a.checkOut || "—"}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {hours > 0 ? (
                            <span className={`text-sm font-bold ${hours >= settings.requiredHours ? "text-green-600" : "text-red-600"}`}>
                              {hours.toFixed(1)}h
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${a.status === "Present" ? "bg-green-50 text-green-700" : a.status === "Absent" ? "bg-red-50 text-red-700" : a.status === "Late" ? "bg-yellow-50 text-yellow-700" : a.status === "Leave" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}`}>{a.status}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {hours > 0 && hours < settings.requiredHours ? <span className="text-red-600 text-xs font-bold">-PKR {settings.finePerDay.toLocaleString()}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {hours >= settings.requiredHours && hours > 0 ? <span className="text-green-600 text-xs font-bold">+PKR {settings.bonusPerSale.toLocaleString()}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setViewRecord(a)} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <CalendarCheck size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No attendance records found</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600"><Timer size={18} /></div><h3 className="text-gray-900 font-bold">Current Attendance Rules</h3></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-xs mb-1">Work Hours</p><p className="text-gray-900 text-lg font-bold">{settings.workStart} - {settings.workEnd}</p></div>
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-xs mb-1">Late After</p><p className="text-gray-900 text-lg font-bold">{settings.lateAfter}</p></div>
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-xs mb-1">Required Hours</p><p className="text-gray-900 text-lg font-bold">{settings.requiredHours}h</p></div>
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-xs mb-1">Fine Per Day (below {settings.requiredHours}h)</p><p className="text-red-600 text-lg font-bold">PKR {settings.finePerDay.toLocaleString()}</p></div>
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-xs mb-1">Bonus ({settings.requiredHours}h+ with sales)</p><p className="text-green-600 text-lg font-bold">PKR {settings.bonusPerSale.toLocaleString()}</p></div>
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-xs mb-1">Consecutive Absent Warning</p><p className="text-amber-600 text-lg font-bold">3+ days</p></div>
            </div>
            <div className="mt-4 bg-amber-50 rounded-xl p-3 border border-amber-200">
              <p className="text-amber-700 text-xs font-medium flex items-center gap-2"><AlertTriangle size={14} /> Settings can be changed from Settings page. Rules apply to all DSO/DSM.</p>
            </div>
          </div>
        </div>
      )}

      {viewRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setViewRecord(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Eye size={18} /> Attendance Details</h3>
              <button onClick={() => setViewRecord(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${viewRecord.role === "DSM" ? "bg-blue-600" : "bg-green-600"}`}>{viewRecord.employeeName?.charAt(0)}</div>
                <div>
                  <p className="text-gray-900 font-bold">{viewRecord.employeeName}</p>
                  <p className="text-gray-500 text-xs font-mono">{viewRecord.employeeId} · {viewRecord.role}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{formatDateDDMMYYYY(viewRecord.date)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Check In</span><span className="font-mono font-bold text-gray-900">{viewRecord.checkIn || "—"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Check Out</span><span className="font-mono font-bold text-gray-900">{viewRecord.checkOut || "—"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Working Hours</span><span className={`font-bold ${calcWorkingHours(viewRecord.checkIn, viewRecord.checkOut) >= settings.requiredHours ? "text-green-600" : "text-red-600"}`}>{calcWorkingHours(viewRecord.checkIn, viewRecord.checkOut).toFixed(1)}h / {settings.requiredHours}h</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`px-2 py-1 rounded-lg text-xs font-medium ${viewRecord.status === "Present" ? "bg-green-50 text-green-700" : viewRecord.status === "Late" ? "bg-yellow-50 text-yellow-700" : viewRecord.status === "Leave" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>{viewRecord.status}</span></div>
                {viewRecord.gps ? <div className="flex justify-between text-sm"><span className="text-gray-500">GPS</span><span className="text-gray-700 text-xs flex items-center gap-1"><MapPin size={10} /> {viewRecord.gps}</span></div> : null}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setViewRecord(null)} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {showMarkForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowMarkForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Plus size={18} /> Mark Attendance</h3>
              <button onClick={() => setShowMarkForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Employee *</label>
                <select value={form.employeeId} onChange={(e) => {
                  const emp = allEmployees.find((em) => em.id === e.target.value);
                  setForm((p) => ({ ...p, employeeId: e.target.value, employeeName: emp?.name || "", role: emp?.role || "DSO" }));
                }} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option value="">Select Employee...</option>
                  <optgroup label="DSOs">{dso.map((d) => <option key={d.id} value={d.id}>{d.id} - {d.name} (DSO)</option>)}</optgroup>
                  <optgroup label="DSMs">{dsms.map((d) => <option key={d.id} value={d.id}>{d.id} - {d.name} (DSM)</option>)}</optgroup>
                </select>
              </div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Date</label><input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Check In</label><input type="time" value={form.checkIn} onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
                <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Check Out</label><input type="time" value={form.checkOut} onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              </div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Status</label><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">{["Present", "Absent", "Late", "Half Day", "Leave"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-blue-700 text-xs font-medium">Work: {settings.workStart} - {settings.workEnd} | Late after: {settings.lateAfter} | Fine: PKR {settings.finePerDay.toLocaleString()} | Bonus: PKR {settings.bonusPerSale.toLocaleString()}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowMarkForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={!form.employeeId} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
