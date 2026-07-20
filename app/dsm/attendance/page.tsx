"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, Search, Filter, AlertTriangle, FileText, ArrowLeft, Timer, Award, Ban, Eye, CheckCircle, X } from "lucide-react";
import { useDSMData } from "@/lib/DSMDataContext";
import Link from "next/link";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

function getAttendanceSettings() {
  try {
    const stored = localStorage.getItem("franchise-attendance-settings");
    if (stored) return JSON.parse(stored);
  } catch {}
  return { workStart: "09:00", workEnd: "18:00", lateAfter: "10:00", requiredHours: 8, finePerDay: 1000, bonusPerSale: 500 };
}

function calcWorkingHours(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut || checkIn === "-" || checkOut === "-") return 0;
  const parse = (t: string) => {
    const m = t.match(/(\d+):(\d+)/);
    if (!m) return 0;
    let h = parseInt(m[1]); const min = parseInt(m[2]);
    if (t.toLowerCase().includes("pm") && h < 12) h += 12;
    if (t.toLowerCase().includes("am") && h === 12) h = 0;
    return h * 60 + min;
  };
  return Math.max(0, (parse(checkOut) - parse(checkIn)) / 60);
}

export default function DSMDsoAttendancePage() {
  const { dsos, attendance, auth, hydrated, leaveRequests, warnings, reviewLeaveRequest } = useDSMData();
  const settings = getAttendanceSettings();
  const [tab, setTab] = useState<"attendance" | "leave" | "warnings">("attendance");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewRecord, setViewRecord] = useState<any>(null);

  const myDsoIds = useMemo(() => dsos.map((d) => d.id), [dsos]);

  const today = new Date().toISOString().split("T")[0];

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchSearch = !search || a.dsoName.toLowerCase().includes(search.toLowerCase()) || a.dsoId.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || a.status === statusFilter;
      let matchDate = true;
      if (dateFrom && a.date < dateFrom) matchDate = false;
      if (dateTo && a.date > dateTo) matchDate = false;
      return matchSearch && matchStatus && matchDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, search, statusFilter, dateFrom, dateTo]);

  const todayAttendance = useMemo(() => filteredAttendance.filter((a) => a.date === selectedDate), [filteredAttendance, selectedDate]);

  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, totalHours = 0, totalFine = 0, totalBonus = 0, count = 0;
    const todayRecords = attendance.filter((a) => a.date === selectedDate);
    todayRecords.forEach((a) => {
      count++;
      if (a.status === "Present") present++;
      else if (a.status === "Absent") absent++;
      else if (a.status === "Late") late++;
      totalHours += a.hoursWorked || 0;
    });
    const settings = getAttendanceSettings();
    todayRecords.forEach((a) => {
      const h = a.hoursWorked || 0;
      if (h > 0 && h < settings.requiredHours) totalFine += settings.finePerDay;
      if (h >= settings.requiredHours) totalBonus += settings.bonusPerSale;
    });
    return { present, absent, late, totalHours: totalHours.toFixed(1), totalFine, totalBonus, total: count };
  }, [attendance, selectedDate]);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dsm/dashboard" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">DSO Attendance</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor daily attendance for all DSOs</p>
          </div>
        </div>
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
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Timer size={14} className="text-blue-600" /></div>
          <div><p className="text-lg font-black text-blue-600">{stats.totalHours}h</p><p className="text-gray-500 text-[10px]">Total Hours</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Ban size={14} className="text-amber-600" /></div>
          <div><p className="text-lg font-black text-amber-600">PKR {stats.totalFine.toLocaleString()}</p><p className="text-gray-500 text-[10px]">Fine</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Award size={14} className="text-purple-600" /></div>
          <div><p className="text-lg font-black text-purple-600">PKR {stats.totalBonus.toLocaleString()}</p><p className="text-gray-500 text-[10px]">Bonus</p></div>
        </div>
      </div>

      <div className="flex gap-2 bg-white rounded-2xl border border-gray-200 p-1.5">
        {([["attendance", "Attendance"], ["leave", "Leave Requests"], ["warnings", "Warnings"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === k ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
            {k === "attendance" ? <CalendarCheck size={14} /> : k === "leave" ? <FileText size={14} /> : <AlertTriangle size={14} />}
            {l}
          </button>
        ))}
      </div>

      {tab === "attendance" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
              <Search size={16} className="text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by DSO name or ID..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Present", "Absent", "Late"].map((s) => (
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
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">DSO</th>
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
                  {filteredAttendance.map((a, idx) => {
                    const hours = a.hoursWorked || calcWorkingHours(a.checkIn, a.checkOut);
                    return (
                      <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900 text-sm font-medium">{a.dsoName}</p>
                          <p className="text-gray-400 text-xs font-mono">{a.dsoId}</p>
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
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${a.status === "Present" ? "bg-green-50 text-green-700" : a.status === "Absent" ? "bg-red-50 text-red-700" : a.status === "Late" ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-700"}`}>{a.status}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {(a as any).fine ? <span className="text-red-600 text-xs font-bold">-PKR {(a as any).fine}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {(a as any).bonus ? <span className="text-green-600 text-xs font-bold">+PKR {(a as any).bonus}</span> : "—"}
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
            {filteredAttendance.length === 0 && (
              <div className="px-6 py-12 text-center">
                <CalendarCheck size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No attendance records found</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "leave" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-gray-700 text-sm font-medium">Leave requests from DSOs</p>
            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">{leaveRequests.filter((r) => r.status === "Pending").length} Pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">DSO</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Reason</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Reviewed By</th>
                  <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.sort((a, b) => b.date.localeCompare(a.date)).map((r, idx) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 text-sm font-medium">{r.dsoName}</p>
                      <p className="text-gray-400 text-xs font-mono">{r.dsoId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-sm font-medium">{formatDateDDMMYYYY(r.date)}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm max-w-[200px] truncate" title={r.reason}>{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${r.status === "Approved" ? "bg-green-50 text-green-700" : r.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{r.reviewedBy || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {r.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => reviewLeaveRequest(r.id, "Approved")} className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => reviewLeaveRequest(r.id, "Rejected")} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">{r.reviewedBy ? "Done" : "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leaveRequests.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FileText size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No leave requests from DSOs</p>
              <p className="text-gray-400 text-xs mt-1">DSO leave requests will appear here for review</p>
            </div>
          )}
        </div>
      )}

      {tab === "warnings" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <p className="text-gray-700 text-sm font-medium">DSO attendance warnings and fines</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">DSO</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Message</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Fine</th>
                </tr>
              </thead>
              <tbody>
                {warnings.sort((a, b) => b.date.localeCompare(a.date)).map((w, idx) => (
                  <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 text-xs font-black">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 text-sm font-medium">{w.dsoId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-sm font-medium">{formatDateDDMMYYYY(w.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${w.type === "consecutive_absent" ? "bg-red-50 text-red-700" : w.type === "late" ? "bg-yellow-50 text-yellow-700" : "bg-amber-50 text-amber-700"}`}>{w.type.replace("_", " ").toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{w.message}</td>
                    <td className="px-4 py-3 text-red-600 text-xs font-bold">{w.fineAmount > 0 ? `PKR ${w.fineAmount.toLocaleString()}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {warnings.length === 0 && (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 size={32} className="text-green-300 mx-auto mb-3" />
              <p className="text-green-500 text-sm font-medium">No warnings — all clear!</p>
            </div>
          )}
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
                <div className="w-12 h-12 rounded-full bg-[#0A2647] flex items-center justify-center text-white font-bold">{viewRecord.dsoName?.charAt(0)}</div>
                <div>
                  <p className="text-gray-900 font-bold">{viewRecord.dsoName}</p>
                  <p className="text-gray-500 text-xs font-mono">{viewRecord.dsoId}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{formatDateDDMMYYYY(viewRecord.date)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Check In</span><span className="font-mono font-bold text-gray-900">{viewRecord.checkIn || "—"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Check Out</span><span className="font-mono font-bold text-gray-900">{viewRecord.checkOut || "—"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Working Hours</span><span className={`font-bold ${(viewRecord.hoursWorked || 0) >= settings.requiredHours ? "text-green-600" : "text-red-600"}`}>{(viewRecord.hoursWorked || 0).toFixed(1)}h / {settings.requiredHours}h</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`px-2 py-1 rounded-lg text-xs font-medium ${viewRecord.status === "Present" ? "bg-green-50 text-green-700" : viewRecord.status === "Late" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{viewRecord.status}</span></div>
                {viewRecord.fine ? <div className="flex justify-between text-sm"><span className="text-gray-500">Fine</span><span className="text-red-600 font-bold">PKR {viewRecord.fine.toLocaleString()}</span></div> : null}
                {viewRecord.bonus ? <div className="flex justify-between text-sm"><span className="text-gray-500">Bonus</span><span className="text-green-600 font-bold">PKR {viewRecord.bonus.toLocaleString()}</span></div> : null}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setViewRecord(null)} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
