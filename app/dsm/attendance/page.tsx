"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Timer, Award, Ban, Eye, CheckCircle, X } from "lucide-react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoadById } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

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

const statusTone: Record<string, "positive" | "warning" | "negative" | "neutral"> = {
  Present: "positive",
  Late: "warning",
  Absent: "negative",
};

export default function DSMDsoAttendancePage() {
  const { attendance, auth, hydrated, leaveRequests, warnings, reviewLeaveRequest } = useDSMData();
  const [settings, setSettings] = useState<{ workStart: string; workEnd: string; lateAfter: string; requiredHours: number; finePerDay: number; bonusPerSale: number }>({ workStart: "09:00", workEnd: "18:00", lateAfter: "10:00", requiredHours: 8, finePerDay: 1000, bonusPerSale: 500 });
  useEffect(() => {
    getAttendanceSettings(auth.franchiseId).then(setSettings);
  }, [auth.franchiseId]);
  const [tab, setTab] = useState<"attendance" | "leave" | "warnings">("attendance");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewRecord, setViewRecord] = useState<any>(null);

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
    todayRecords.forEach((a) => {
      const h = a.hoursWorked || 0;
      if (h > 0 && h < settings.requiredHours) totalFine += settings.finePerDay;
      if (h >= settings.requiredHours) totalBonus += settings.bonusPerSale;
    });
    return { present, absent, late, totalHours: totalHours.toFixed(1), totalFine, totalBonus, total: count };
  }, [attendance, selectedDate, settings]);

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Team" }, { label: "Attendance" }]}
        title="DSO Attendance"
        description="Monitor daily attendance for all DSOs"
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 items-start sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-foreground text-sm focus:outline-none" />
          </div>
          <div className="flex-1" />
          <div className="flex gap-2 flex-wrap">
            <StatusPill label={`${stats.present} Present`} tone="positive" />
            <StatusPill label={`${stats.absent} Absent`} tone="negative" />
            <StatusPill label={`${stats.late} Late`} tone="warning" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Present" value={stats.present} icon={CheckCircle2} iconClass="bg-green-50 text-green-600" />
        <StatCard label="Absent" value={stats.absent} icon={XCircle} iconClass="bg-red-50 text-red-600" />
        <StatCard label="Late" value={stats.late} icon={Clock} iconClass="bg-yellow-50 text-yellow-600" />
        <StatCard label="Total Hours" value={`${stats.totalHours}h`} icon={Timer} iconClass="bg-blue-50 text-blue-600" />
        <StatCard label="Fine" value={`PKR ${stats.totalFine.toLocaleString()}`} icon={Ban} iconClass="bg-amber-50 text-amber-600" />
        <StatCard label="Bonus" value={`PKR ${stats.totalBonus.toLocaleString()}`} icon={Award} iconClass="bg-purple-50 text-purple-600" />
      </div>

      <Card>
        <div className="flex p-1.5">
          {([["attendance", "Attendance"], ["leave", "Leave Requests"], ["warnings", "Warnings"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === k ? "bg-brand-600 text-white shadow-md" : "text-muted-foreground hover:bg-slate-50"}`}>
              {k === "attendance" ? <CalendarCheck className="h-3.5 w-3.5" /> : k === "leave" ? <FileText className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {l}
            </button>
          ))}
        </div>
      </Card>

      {tab === "attendance" && (
        <>
          <Card>
            <div className="flex flex-col sm:flex-row gap-3 p-4">
              <SearchInput
                placeholder="Search by DSO name or ID..."
                value={search}
                onSearch={setSearch}
                className="max-w-sm"
              />
              <div className="flex gap-2 flex-wrap">
                {["All", "Present", "Absent", "Late"].map((s) => (
                  <QuickChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 p-4 pt-0">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <span className="text-xs text-muted-foreground">From:</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-foreground text-xs focus:outline-none" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <span className="text-xs text-muted-foreground">To:</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-foreground text-xs focus:outline-none" />
              </div>
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-all">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground w-14">Sr.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">DSO</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">Fine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">Bonus</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground w-14">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((a, idx) => {
                    const hours = a.hoursWorked || calcWorkingHours(a.checkIn, a.checkOut);
                    return (
                      <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-xs font-black">{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground text-sm font-medium">{a.dsoName}</p>
                          <p className="text-muted-foreground text-xs font-mono">{a.dsoId}</p>
                        </td>
                        <td className="px-4 py-3 text-foreground text-sm font-medium">{formatDateDDMMYYYY(a.date)}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm font-mono">{a.checkIn || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm font-mono">{a.checkOut || "—"}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {hours > 0 ? (
                            <span className={`text-sm font-bold ${hours >= settings.requiredHours ? "text-green-600" : "text-red-600"}`}>
                              {hours.toFixed(1)}h
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill label={a.status} tone={statusTone[a.status] || "neutral"} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {(a as any).fine ? <span className="text-red-600 text-xs font-bold">-PKR {(a as any).fine}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {(a as any).bonus ? <span className="text-green-600 text-xs font-bold">+PKR {(a as any).bonus}</span> : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setViewRecord(a)} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredAttendance.length === 0 && (
              <EmptyState
                icon={CalendarCheck}
                title="No attendance records found"
                description="Try adjusting your search or date range."
              />
            )}
          </Card>
        </>
      )}

      {tab === "leave" && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-foreground text-sm font-medium">Leave requests from DSOs</p>
            <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">{leaveRequests.filter((r) => r.status === "Pending").length} Pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground w-14">Sr.No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">DSO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">Reviewed By</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.sort((a, b) => b.date.localeCompare(a.date)).map((r, idx) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-xs font-black">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground text-sm font-medium">{r.dsoName}</p>
                      <p className="text-muted-foreground text-xs font-mono">{r.dsoId}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm font-medium">{formatDateDDMMYYYY(r.date)}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm max-w-[200px] truncate" title={r.reason}>{r.reason}</td>
                    <td className="px-4 py-3">
                      <StatusPill label={r.status} tone={r.status === "Approved" ? "positive" : r.status === "Rejected" ? "negative" : "warning"} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{r.reviewedBy || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {r.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => reviewLeaveRequest(r.id, "Approved")} className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => reviewLeaveRequest(r.id, "Rejected")} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors" title="Reject">
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{r.reviewedBy ? "Done" : "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leaveRequests.length === 0 && (
            <EmptyState
              icon={FileText}
              title="No leave requests from DSOs"
              description="DSO leave requests will appear here for review"
            />
          )}
        </Card>
      )}

      {tab === "warnings" && (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-foreground text-sm font-medium">DSO attendance warnings and fines</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase text-muted-foreground w-14">Sr.No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">DSO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Fine</th>
                </tr>
              </thead>
              <tbody>
                {warnings.sort((a, b) => b.date.localeCompare(a.date)).map((w, idx) => (
                  <tr key={w.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 text-xs font-black">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground text-sm font-medium">{w.dsoId}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground text-sm font-medium">{formatDateDDMMYYYY(w.date)}</td>
                    <td className="px-4 py-3">
                      <StatusPill label={w.type.replace("_", " ").toUpperCase()} tone={w.type === "consecutive_absent" ? "negative" : w.type === "late" ? "warning" : "neutral"} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{w.message}</td>
                    <td className="px-4 py-3 text-red-600 text-xs font-bold">{w.fineAmount > 0 ? `PKR ${w.fineAmount.toLocaleString()}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {warnings.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="No warnings — all clear!"
            />
          )}
        </Card>
      )}

      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4" onClick={() => setViewRecord(null)}>
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Eye className="h-4 w-4" /> Attendance Details</h3>
              <button onClick={() => setViewRecord(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{viewRecord.dsoName?.charAt(0)}</div>
                <div>
                  <p className="font-bold text-foreground">{viewRecord.dsoName}</p>
                  <p className="text-xs font-mono text-muted-foreground">{viewRecord.dsoId}</p>
                </div>
              </div>
              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{formatDateDDMMYYYY(viewRecord.date)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Check In</span><span className="font-mono font-bold text-foreground">{viewRecord.checkIn || "—"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Check Out</span><span className="font-mono font-bold text-foreground">{viewRecord.checkOut || "—"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Working Hours</span><span className={`font-bold ${(viewRecord.hoursWorked || 0) >= settings.requiredHours ? "text-green-600" : "text-red-600"}`}>{(viewRecord.hoursWorked || 0).toFixed(1)}h / {settings.requiredHours}h</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><StatusPill label={viewRecord.status} tone={statusTone[viewRecord.status] || "neutral"} /></div>
                {viewRecord.fine ? <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fine</span><span className="font-bold text-red-600">PKR {viewRecord.fine.toLocaleString()}</span></div> : null}
                {viewRecord.bonus ? <div className="flex justify-between text-sm"><span className="text-muted-foreground">Bonus</span><span className="font-bold text-green-600">PKR {viewRecord.bonus.toLocaleString()}</span></div> : null}
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4">
              <button onClick={() => setViewRecord(null)} className="w-full rounded-xl bg-slate-100 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}