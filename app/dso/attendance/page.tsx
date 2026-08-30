"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, MapPin, X, LogOut, AlertTriangle, Ban, FileText, Timer, Award } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoadById } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, QuickChip, toneForStatus } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dateFrom, dateTo]);

  const pagedRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

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
      checkIn: currentTime, checkOut: "", gps: "33.6063Â°N, 73.0479Â°E",
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

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "Attendance" }]}
        title="Attendance"
        description={`Work ${settings.workStart} - ${settings.workEnd} (${settings.requiredHours}h required)`}
        actions={
          <div className="flex gap-2">
            {!todayRecord ? (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowCheckIn(true)}>
                <Clock size={16} /> Check In
              </Button>
            ) : !todayRecord.checkOut ? (
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowCheckOut(true)}>
                <LogOut size={16} /> Check Out
              </Button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-700">
                <CheckCircle2 size={16} /> Done ({todayRecord.workingHours?.toFixed(1) || "0"}h)
              </div>
            )}
            <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setShowLeaveForm(true)}>
              <FileText size={16} /> Leave
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Present" value={stats.present} icon={CheckCircle2} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Absent" value={stats.absent} icon={XCircle} iconClass="text-red-600 bg-red-50" />
        <StatCard label="Late" value={stats.late} icon={Clock} iconClass="text-yellow-600 bg-yellow-50" />
        <StatCard label="Leave" value={stats.leave} icon={FileText} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="Fine" value={`PKR ${stats.totalFine.toLocaleString()}`} icon={Ban} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="Bonus" value={`PKR ${stats.totalBonus.toLocaleString()}`} icon={Award} iconClass="text-purple-600 bg-purple-50" />
      </div>

      {stats.consecAbsents >= 3 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={20} className="text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-800">Warning: {stats.consecAbsents} Consecutive Absences</p>
            <p className="text-xs text-red-600">Commission fine of PKR {(stats.consecAbsents * settings.finePerDay).toLocaleString()} may be deducted from salary</p>
          </div>
        </div>
      )}

      {todayRecord && !todayRecord.checkOut && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"><Timer size={18} className="text-blue-600" /></div>
              <div>
                <p className="text-sm font-bold text-blue-900">Checked In at {todayRecord.checkIn}</p>
                <p className="text-xs text-blue-600">{todayRecord.status === "Late" ? "Late entry" : "On time"}</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowCheckOut(true)}>Check Out</Button>
          </div>
        </div>
      )}

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
        {([["list", "Attendance"], ["leave", "Leave Requests"], ["warnings", "Warnings"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${tab === k ? "bg-brand-600 text-white shadow-sm" : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"}`}>
            {k === "list" ? <CalendarCheck size={14} /> : k === "leave" ? <FileText size={14} /> : <AlertTriangle size={14} />}
            {l}
            <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${tab === k ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {k === "list" ? myAttendance.length : k === "leave" ? myLeaveRequests.length : myWarnings.length}
            </span>
          </button>
        ))}
      </div>

      {tab === "list" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchInput placeholder="Search by date or status..." value={search} onSearch={setSearch} />
            <div className="flex gap-2 flex-wrap">
              {["All", "Present", "Absent", "Late", "Leave"].map((s) => (
                <QuickChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">From:</span>
              <div className="w-44">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">To:</span>
              <div className="w-44">
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            {(dateFrom || dateTo) && (
              <Button variant="secondary" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                <X size={12} /> Clear
              </Button>
            )}
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground w-14">Sr.No</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Check In</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Check Out</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Hours</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">GPS</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Fine</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Bonus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedRecords.map((a, idx) => {
                    const hours = a.workingHours || calcWorkingHours(a.checkIn, a.checkOut);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{formatDateDDMMYYYY(a.date)}</td>
                        <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{a.checkIn || "—"}</td>
                        <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{a.checkOut || "—"}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {hours > 0 ? (
                            <span className={`text-sm font-bold ${hours >= settings.requiredHours ? "text-green-600" : "text-red-600"}`}>
                              {hours.toFixed(1)}h
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={10} />{a.gps || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill label={a.status} tone={toneForStatus(a.status)} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {a.fine ? <span className="text-xs font-bold text-red-600">-PKR {a.fine}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {a.bonus ? <span className="text-xs font-bold text-green-600">+PKR {a.bonus}</span> : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <EmptyState icon={CalendarCheck} title="No attendance records found" description="Try adjusting your search or filters." />
            )}
            {filtered.length > 0 && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </Card>
        </>
      )}

      {tab === "leave" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground w-14">Sr.No</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Reviewed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaveRequests.sort((a, b) => b.date.localeCompare(a.date)).map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{formatDateDDMMYYYY(r.date)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.reason}</td>
                    <td className="px-4 py-3">
                      <StatusPill label={r.status} tone={toneForStatus(r.status)} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{r.reviewedBy || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {myLeaveRequests.length === 0 && (
            <EmptyState icon={FileText} title="No leave requests" description="Submit a leave request to see it here." />
          )}
        </Card>
      )}

      {tab === "warnings" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground w-14">Sr.No</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myWarnings.sort((a, b) => b.date.localeCompare(a.date)).map((w, idx) => (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 text-xs font-bold">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{formatDateDDMMYYYY(w.date)}</td>
                    <td className="px-4 py-3">
                      <StatusPill label={w.type.replace("_", " ").toUpperCase()} tone={w.type === "consecutive_absent" ? "negative" : "warning"} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{w.message}</td>
                    <td className="px-4 py-3 text-xs font-bold text-red-600">{w.fineAmount > 0 ? `PKR ${w.fineAmount.toLocaleString()}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {myWarnings.length === 0 && (
            <EmptyState icon={CheckCircle2} title="No warnings — all clear!" description="You have no active warnings." />
          )}
        </Card>
      )}

      {showCheckIn && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShowCheckIn(false)}>
          <div className="w-full border border-slate-200 bg-white shadow-2xl rounded-t-2xl sm:max-w-md sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground"><Clock size={18} /> Check In</h3>
              <button onClick={() => setShowCheckIn(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"><Clock size={32} className="text-green-600" /></div>
                <p className="text-3xl font-bold text-foreground">{currentTime}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatDateDDMMYYYY(today)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin size={14} className="text-brand-600" /> 33.6063°N, 73.0479°E</div>
              </div>
              {timeToMinutes(currentTime) > timeToMinutes(settings.lateAfter) && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="flex items-center gap-2 text-xs font-medium text-yellow-700"><AlertTriangle size={14} /> Late entry — after {settings.lateAfter}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4">
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCheckIn}>Confirm Check In</Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowCheckIn(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {showCheckOut && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShowCheckOut(false)}>
          <div className="w-full border border-slate-200 bg-white shadow-2xl rounded-t-2xl sm:max-w-md sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground"><LogOut size={18} /> Check Out</h3>
              <button onClick={() => setShowCheckOut(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100"><LogOut size={32} className="text-red-600" /></div>
                <p className="text-3xl font-bold text-foreground">{currentTime}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatDateDDMMYYYY(today)}</p>
              </div>
              {todayRecord && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Check In</span><span className="font-mono font-bold text-foreground">{todayRecord.checkIn}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Working Hours</span><span className="font-bold text-foreground">{calcWorkingHours(todayRecord.checkIn, currentTime).toFixed(1)}h / {settings.requiredHours}h</span></div>
                  {calcWorkingHours(todayRecord.checkIn, currentTime) < settings.requiredHours && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-2">
                      <p className="flex items-center gap-1 text-xs font-medium text-red-600"><Ban size={12} /> Fine: PKR {settings.finePerDay.toLocaleString()} (below {settings.requiredHours}h)</p>
                    </div>
                  )}
                  {calcWorkingHours(todayRecord.checkIn, currentTime) >= settings.requiredHours && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-2">
                      <p className="flex items-center gap-1 text-xs font-medium text-green-600"><Award size={12} /> Bonus: PKR {settings.bonusPerSale.toLocaleString()} (completed {settings.requiredHours}h+)</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4">
              <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleCheckOut}>Confirm Check Out</Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowCheckOut(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {showLeaveForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShowLeaveForm(false)}>
          <div className="w-full border border-slate-200 bg-white shadow-2xl rounded-t-2xl sm:max-w-md sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 font-semibold text-foreground"><FileText size={18} /> Request Leave</h3>
              <button onClick={() => setShowLeaveForm(false)} className="p-1 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-700">Your request will be sent to DSM for review. Status: Pending → Approved/Rejected</p>
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
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reason for Leave *</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for leave request..." className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
      </div>
      <div className="flex flex-col gap-3">
        <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => { if (reason.trim()) onSubmit(reason); }} disabled={!reason.trim()}>Submit Leave Request</Button>
        <Button variant="secondary" className="w-full" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
