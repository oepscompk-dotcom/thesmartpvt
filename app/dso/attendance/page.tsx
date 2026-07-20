"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, MapPin, Plus, X, ArrowLeft, LogOut, Search, Filter, AlertTriangle, Ban, FileText, ChevronDown, Timer, Award, Frown } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import Link from "next/link";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoadById } from "@/lib/api";

async function getAttendanceSettings(franchiseId?: string) {
  try {
    if (franchiseId) {
      const settings = await apiLoadById("franchiseData", "attendance-settings-" + franchiseId);
      if (settings?.data) return JSON.parse(settings.data);
    }
  } catch {}
  return { workStart: "09:00", workEnd: "18:00", lateAfter: "10:00", requiredHours: 8, finePerDay: 1000, bonusPerSale: 500 };
}

function calcWorkingHours(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  return Math.max(0, ((outH * 60 + outM) - (inH * 60 + inM)) / 60);
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function DSOAttendancePage() {
  const { attendance, addAttendance, updateAttendance, leaveRequests, addLeaveRequest, warnings, auth } = useDSOData();
  const [settings, setSettings] = useState<{ workStart: string; workEnd: string; lateAfter: string; requiredHours: number; finePerDay: number; bonusPerSale: number }>({ workStart: "09:00", workEnd: "18:00", lateAfter: "10:00", requiredHours: 8, finePerDay: 1000, bonusPerSale: 500 });
  useEffect(() => {
    getAttendanceSettings(auth.franchiseId).then(setSettings);
  }, [auth.franchiseId]);

  const [tab, setTab] = useState<"list" | "leave" | "warnings">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const myAttendance = useMemo(() => attendance.filter((a) => a.dsoId === auth.dsoId), [attendance, auth.dsoId]);
  const myLeaveRequests = useMemo(() => leaveRequests.filter((r) => r.dsoId === auth.dsoId), [leaveRequests, auth.dsoId]);
  const myWarnings = useMemo(() => warnings.filter((w) => w.dsoId === auth.dsoId), [warnings, auth.dsoId]);

  useEffect(() => {
    const rec = myAttendance.find((a) => a.date === today);
    setTodayRecord(rec || null);
  }, [myAttendance, today]);

  const filtered = useMemo(() => {
    return myAttendance.filter((a) => {
      const matchSearch = !search || a.date.includes(search) || a.status.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || a.status === statusFilter;
      let matchDate = true;
      if (dateFrom && a.date < dateFrom) matchDate = false;
      if (dateTo && a.date > dateTo) matchDate = false;
      return matchSearch && matchStatus && matchDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [myAttendance, search, statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, leave = 0, totalHours = 0, totalFine = 0, totalBonus = 0;
    myAttendance.forEach((a) => {
      if (a.status === "Present") present++;
      else if (a.status === "Absent") absent++;
      else if (a.status === "Late") late++;
      else if (a.status === "Leave") leave++;
      totalHours += a.workingHours || 0;
      totalFine += a.fine || 0;
      totalBonus += a.bonus || 0;
    });
    const consecAbsents = getConsecutiveAbsents(myAttendance);
    return { present, absent, late, leave, totalHours: totalHours.toFixed(1), totalFine, totalBonus, consecAbsents };
  }, [myAttendance]);

  function getConsecutiveAbsents(records: any[]): number {
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    for (const r of sorted) {
      if (r.status === "Absent") count++;
      else break;
    }
    return count;
  }

  const handleCheckIn = () => {
    const isLate = timeToMinutes(currentTime) > timeToMinutes(settings.lateAfter);
    addAttendance({
      id: `DSA-${Date.now()}`, dsoId: auth.dsoId, date: today,
      checkIn: currentTime, checkOut: "", gps: "33.6063°N, 73.0479°E",
      selfie: "", status: isLate ? "Late" : "Present", franchiseId: auth.franchiseId,
    });
    setShowCheckIn(false);
    window.location.reload();
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    const hours = calcWorkingHours(todayRecord.checkIn, currentTime);
    const isLate = todayRecord.status === "Late";
    let fine = 0;
    let bonus = 0;
    if (hours < settings.requiredHours) fine = settings.finePerDay;
    if (hours >= settings.requiredHours) bonus = settings.bonusPerSale;
    updateAttendance(todayRecord.id, {
      checkOut: currentTime, workingHours: hours, fine, bonus,
    });
    setShowCheckOut(false);
    window.location.reload();
  };

  const handleLeaveRequest = (reason: string) => {
    addLeaveRequest({
      id: `LR-${Date.now()}`, dsoId: auth.dsoId, dsoName: auth.dsoName,
      date: today, reason, status: "Pending", reviewedBy: "", reviewedAt: "",
      franchiseId: auth.franchiseId,
    });
    setShowLeaveForm(false);
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dso/dashboard" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Attendance</h1>
            <p className="text-gray-500 text-sm mt-1">Work {settings.workStart} - {settings.workEnd} ({settings.requiredHours}h required)</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!todayRecord ? (
            <button onClick={() => setShowCheckIn(true)} className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 py-3 bg-green-600 text-white font-bold text-base rounded-xl hover:bg-green-700 shadow-md transition-all hover:scale-105">
              <Clock size={20} /> Check In
            </button>
          ) : !todayRecord.checkOut ? (
            <button onClick={() => setShowCheckOut(true)} className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 py-3 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 shadow-md transition-all hover:scale-105">
              <LogOut size={20} /> Check Out
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 min-h-[56px] px-6 py-3 bg-green-50 text-green-700 font-bold text-base rounded-xl border border-green-200">
              <CheckCircle2 size={20} /> Done ({todayRecord.workingHours?.toFixed(1) || "0"}h)
            </div>
          )}
          <button onClick={() => setShowLeaveForm(true)} className="inline-flex items-center justify-center gap-2 min-h-[56px] px-6 py-3 bg-amber-500 text-white font-bold text-base rounded-xl hover:bg-amber-600 shadow-md transition-all hover:scale-105">
            <FileText size={20} /> Leave
          </button>
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
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><FileText size={14} className="text-blue-600" /></div>
          <div><p className="text-lg font-black text-blue-600">{stats.leave}</p><p className="text-gray-500 text-[10px]">Leave</p></div>
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

      {stats.consecAbsents >= 3 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600" />
          <div>
            <p className="text-red-800 text-sm font-bold">Warning: {stats.consecAbsents} Consecutive Absences</p>
            <p className="text-red-600 text-xs">Commission fine of PKR {(stats.consecAbsents * settings.finePerDay).toLocaleString()} may be deducted from salary</p>
          </div>
        </div>
      )}

      {todayRecord && !todayRecord.checkOut && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Timer size={18} className="text-blue-600" /></div>
              <div>
                <p className="text-blue-900 text-sm font-bold">Checked In at {todayRecord.checkIn}</p>
                <p className="text-blue-600 text-xs">{todayRecord.status === "Late" ? "Late entry" : "On time"} — {settings.requiredHours}h required</p>
              </div>
            </div>
            <button onClick={() => setShowCheckOut(true)} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all">Check Out</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 bg-white rounded-2xl border border-gray-200 p-1.5">
        {([["list", "Attendance"], ["leave", "Leave Requests"], ["warnings", "Warnings"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === k ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
            {k === "list" ? <CalendarCheck size={14} /> : k === "leave" ? <FileText size={14} /> : <AlertTriangle size={14} />}
            {l}
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${tab === k ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {k === "list" ? myAttendance.length : k === "leave" ? myLeaveRequests.length : myWarnings.length}
            </span>
          </button>
        ))}
      </div>

      {tab === "list" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0057FF]/30 focus-within:ring-2 focus-within:ring-[#0057FF]/10 transition-all">
              <Search size={16} className="text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by date or status..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "Present", "Absent", "Late", "Leave"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-[#0057FF] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
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
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Check In</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Check Out</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Hours</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">GPS</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Fine</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, idx) => {
                    const hours = a.workingHours || calcWorkingHours(a.checkIn, a.checkOut);
                    return (
                      <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0057FF]/10 text-[#0057FF] text-xs font-black">{idx + 1}</span>
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
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 text-gray-500 text-xs"><MapPin size={10} />{a.gps || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${a.status === "Present" ? "bg-green-50 text-green-700" : a.status === "Absent" ? "bg-red-50 text-red-700" : a.status === "Late" ? "bg-yellow-50 text-yellow-700" : a.status === "Leave" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}`}>{a.status}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {a.fine ? <span className="text-red-600 text-xs font-bold">-PKR {a.fine}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {a.bonus ? <span className="text-green-600 text-xs font-bold">+PKR {a.bonus}</span> : "—"}
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

      {tab === "leave" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Reason</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {myLeaveRequests.sort((a, b) => b.date.localeCompare(a.date)).map((r, idx) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0057FF]/10 text-[#0057FF] text-xs font-black">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-sm font-medium">{formatDateDDMMYYYY(r.date)}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${r.status === "Approved" ? "bg-green-50 text-green-700" : r.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{r.reviewedBy || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {myLeaveRequests.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FileText size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No leave requests</p>
            </div>
          )}
        </div>
      )}

      {tab === "warnings" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Message</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Fine</th>
                </tr>
              </thead>
              <tbody>
                {myWarnings.sort((a, b) => b.date.localeCompare(a.date)).map((w, idx) => (
                  <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 text-xs font-black">{idx + 1}</span>
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
          {myWarnings.length === 0 && (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 size={32} className="text-green-300 mx-auto mb-3" />
              <p className="text-green-500 text-sm font-medium">No warnings — all clear!</p>
            </div>
          )}
        </div>
      )}

      {showCheckIn && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowCheckIn(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><Clock size={18} /> Check In</h3>
              <button onClick={() => setShowCheckIn(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><Clock size={32} className="text-green-600" /></div>
                <p className="text-3xl font-black text-gray-900">{currentTime}</p>
                <p className="text-gray-500 text-sm mt-1">{formatDateDDMMYYYY(today)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={14} className="text-[#C8A951]" /> 33.6063°N, 73.0479°E</div>
              </div>
              {timeToMinutes(currentTime) > timeToMinutes(settings.lateAfter) && (
                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                  <p className="text-yellow-700 text-xs font-medium flex items-center gap-2"><AlertTriangle size={14} /> Late entry — after {settings.lateAfter}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col gap-3">
              <button onClick={handleCheckIn} className="w-full min-h-[56px] py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700">Confirm Check In</button>
              <button onClick={() => setShowCheckIn(false)} className="w-full min-h-[56px] py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCheckOut && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowCheckOut(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><LogOut size={18} /> Check Out</h3>
              <button onClick={() => setShowCheckOut(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><LogOut size={32} className="text-red-600" /></div>
                <p className="text-3xl font-black text-gray-900">{currentTime}</p>
                <p className="text-gray-500 text-sm mt-1">{formatDateDDMMYYYY(today)}</p>
              </div>
              {todayRecord && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Check In</span><span className="font-mono font-bold">{todayRecord.checkIn}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Working Hours</span><span className="font-bold">{calcWorkingHours(todayRecord.checkIn, currentTime).toFixed(1)}h / {settings.requiredHours}h</span></div>
                  {calcWorkingHours(todayRecord.checkIn, currentTime) < settings.requiredHours && (
                    <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                      <p className="text-red-600 text-xs font-medium flex items-center gap-1"><Ban size={12} /> Fine: PKR {settings.finePerDay.toLocaleString()} (below {settings.requiredHours}h)</p>
                    </div>
                  )}
                  {calcWorkingHours(todayRecord.checkIn, currentTime) >= settings.requiredHours && (
                    <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                      <p className="text-green-600 text-xs font-medium flex items-center gap-1"><Award size={12} /> Bonus: PKR {settings.bonusPerSale.toLocaleString()} (completed {settings.requiredHours}h+)</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col gap-3">
              <button onClick={handleCheckOut} className="w-full min-h-[56px] py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700">Confirm Check Out</button>
              <button onClick={() => setShowCheckOut(false)} className="w-full min-h-[56px] py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLeaveForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowLeaveForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 w-full sm:max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold flex items-center gap-2"><FileText size={18} /> Request Leave</h3>
              <button onClick={() => setShowLeaveForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-blue-700 text-xs font-medium">Your request will be sent to DSM for review. Status: Pending → Approved/Rejected</p>
              </div>
              <LeaveForm onSubmit={handleLeaveRequest} onCancel={() => setShowLeaveForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaveForm({ onSubmit, onCancel }: { onSubmit: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-500 text-xs font-medium mb-1.5">Reason for Leave *</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for leave request..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0057FF]/50 h-24 resize-none" />
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={() => { if (reason.trim()) onSubmit(reason); }} disabled={!reason.trim()} className="w-full min-h-[56px] py-3 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed">Submit Leave Request</button>
        <button onClick={onCancel} className="w-full min-h-[56px] py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
      </div>
    </div>
  );
}
