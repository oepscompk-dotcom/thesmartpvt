"use client";

import { useState, useMemo } from "react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import {
  Users, Smartphone, ClipboardCheck, DollarSign, Target, Wallet,
  TrendingUp, TrendingDown, Package, CreditCard, AlertCircle,
  CheckCircle2, Clock, ChevronRight, Activity, BarChart3, PieChart,
  Zap, Shield, Bell, UserCheck, Calendar, Receipt, Building2,
  Briefcase, Layers, CircleDot, RefreshCw, Wifi, Star, Home,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FranchiseDashboardPage() {
  const {
    dsms, dso, devices, sims, attendance, targets, wallet, payroll,
    expenses, accounts, bankAccounts, notifications, issueRecords,
    equipment, equipmentIssueRecords, settings, hydrated
  } = useFranchiseData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "finance">("overview");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);

  const safePct = (val: number, total: number) => total > 0 ? Math.round((val / total) * 100) : 0;
  const safeDiv = (val: number, total: number) => total > 0 ? val / total : 0;

  const metrics = useMemo(() => ({
    activeDSM: dsms.filter((d) => d.status === "Active").length,
    totalDSM: dsms.length,
    activeDSO: dso.filter((d) => d.status === "Active").length,
    totalDSO: dso.length,
    issuedDevices: devices.filter((d) => d.status === "Issued").length,
    inStockDevices: devices.filter((d) => d.status === "In Stock").length,
    totalDevices: devices.length,
    newSIMStock: sims.filter((s) => s.type === "new" && s.status === "In Stock").length,
    hlrStock: sims.filter((s) => s.type === "hlr" && s.status === "In Stock").length,
    issuedSIMs: sims.filter((s) => s.status === "Issued").length,
    activatedSIMs: sims.filter((s) => s.status === "Activated" || s.status === "Active").length,
    totalSIMs: sims.length,
    activatedNewSIMs: sims.filter((s) => (s.status === "Activated" || s.status === "Active") && s.type === "new").length,
    activatedHLRSIMs: sims.filter((s) => (s.status === "Activated" || s.status === "Active") && s.type === "hlr").length,
    newSIMTotal: sims.filter((s) => s.type === "new").length,
    hlrSIMTotal: sims.filter((s) => s.type === "hlr").length,
  }), [dsms, dso, devices, sims]);

  const attendanceToday = useMemo(() => {
    const todayRecs = attendance.filter((a) => a.date === today);
    const present = todayRecs.filter((a) => a.status === "Present").length;
    const late = todayRecs.filter((a) => a.status === "Late").length;
    const absent = todayRecs.filter((a) => a.status === "Absent").length;
    const leave = todayRecs.filter((a) => a.status === "Leave").length;
    return { present, late, absent, leave, total: todayRecs.length };
  }, [attendance, today]);

  const finance = useMemo(() => {
    const monthlyIncome = accounts.filter((a) => a.type === "income" && a.date.startsWith(currentMonth)).reduce((s, a) => s + a.amount, 0);
    const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);
    const monthlyPayroll = payroll.filter((p) => p.month === currentMonth).reduce((s, p) => s + (p.netPay || p.net || 0), 0);
    const totalIncome = accounts.filter((a) => a.type === "income").reduce((s, a) => s + a.amount, 0);
    const totalExpensesAll = expenses.reduce((s, e) => s + e.amount, 0);
    const totalPayroll = payroll.reduce((s, p) => s + (p.netPay || p.net || 0), 0);
    const netProfit = totalIncome - totalExpensesAll;
    const walletBal = wallet.length > 0 ? wallet[wallet.length - 1]?.balance ?? 0 : 0;
    const lastMonthIncome = accounts.filter((a) => a.type === "income" && a.date.startsWith(prevMonth(currentMonth))).reduce((s, a) => s + a.amount, 0);
    const incomeTrend = lastMonthIncome > 0 ? Math.round(((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100) : 0;
    return { monthlyIncome, monthlyExpenses, monthlyPayroll, totalIncome, totalExpensesAll, totalPayroll, netProfit, walletBal, incomeTrend, lastMonthIncome };
  }, [accounts, expenses, payroll, wallet, currentMonth]);

  const targetsData = useMemo(() => {
    const dsoTargets = targets.filter((t) => t.role === "DSO");
    const totalAchieved = dsoTargets.reduce((s, t) => s + t.achieved, 0);
    const totalTargetVal = dsoTargets.reduce((s, t) => s + t.monthlyTarget, 0);
    const overallPct = safePct(totalAchieved, totalTargetVal);
    const simAchieved = dsoTargets.reduce((s, t) => s + (t.simAchieved || 0), 0);
    const simTargetVal = dsoTargets.reduce((s, t) => s + (t.simTarget || 0), 0);
    const deviceAchieved = dsoTargets.reduce((s, t) => s + (t.deviceAchieved || 0), 0);
    const deviceTargetVal = dsoTargets.reduce((s, t) => s + (t.deviceTarget || 0), 0);
    return { dsoTargets, totalAchieved, totalTargetVal, overallPct, simAchieved, simTargetVal, deviceAchieved, deviceTargetVal };
  }, [targets]);

  const topPerformers = useMemo(() => {
    return targetsData.dsoTargets
      .map((t) => ({ ...t, progress: safePct(t.achieved, t.monthlyTarget) }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [targetsData.dsoTargets]);

  const dsmTargets = useMemo(() => {
    const d = targets.filter((t) => t.role === "DSM");
    const achieved = d.reduce((s, t) => s + t.achieved, 0);
    const total = d.reduce((s, t) => s + t.monthlyTarget, 0);
    return { dsmTargets: d, achieved, total, pct: safePct(achieved, total) };
  }, [targets]);

  const recentActivity = useMemo(() => {
    const items: { icon: any; color: string; title: string; detail: string; time: string }[] = [];
    attendance.slice(0, 4).forEach((a) => {
      const icon = a.status === "Present" ? CheckCircle2 : a.status === "Late" ? Clock : AlertCircle;
      const color = a.status === "Present" ? "text-green-500 bg-green-50" : a.status === "Late" ? "text-yellow-500 bg-yellow-50" : "text-red-500 bg-red-50";
      const action = a.status === "Present" ? "checked in" : a.status === "Late" ? "arrived late" : a.status === "Leave" ? "is on leave" : "marked absent";
      items.push({ icon, color, title: `${a.employeeName} ${action}`, detail: `${a.role} ${a.checkIn ? "| " + a.checkIn : ""}`, time: a.date });
    });
    issueRecords.slice(0, 3).forEach((r) => {
      items.push({
        icon: r.status === "Issued" ? TrendingUp : TrendingDown,
        color: r.status === "Issued" ? "text-blue-500 bg-blue-50" : "text-green-500 bg-green-50",
        title: `${r.issuedTo} — ${r.status === "Issued" ? "SIMs Issued" : "SIMs Returned"}`,
        detail: `${r.simIds.length} SIM(s) | ${r.retailerId}`,
        time: r.issueDate || r.returnDate || "",
      });
    });
    equipmentIssueRecords.slice(0, 2).forEach((r) => {
      items.push({
        icon: Briefcase, color: "text-indigo-500 bg-indigo-50",
        title: `${r.personName} — Equipment ${r.status === "Returned" ? "Returned" : "Issued"}`,
        detail: `${r.equipmentName} | ${r.personRole}`,
        time: r.issueDate || r.returnDate || "",
      });
    });
    return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
  }, [attendance, issueRecords, equipmentIssueRecords]);

  const networkDist = useMemo(() => {
    const dist: Record<string, number> = {};
    sims.forEach((s) => { dist[s.network] = (dist[s.network] || 0) + 1; });
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  }, [sims]);

  const expenseByCategory = useMemo(() => {
    const cat: Record<string, number> = {};
    expenses.forEach((e) => { const c = e.category || "Other"; cat[c] = (cat[c] || 0) + e.amount; });
    const total = Object.values(cat).reduce((s, v) => s + v, 0);
    return { categories: Object.entries(cat).sort((a, b) => b[1] - a[1]), total };
  }, [expenses]);

  const issueStats = useMemo(() => ({
    activeIssues: issueRecords.filter((r) => r.status === "Issued").length,
    returnedIssues: issueRecords.filter((r) => r.status === "Returned").length,
  }), [issueRecords]);

  const equipmentStats = useMemo(() => ({
    total: equipment.length,
    available: equipment.filter((e) => e.status === "In Stock" || e.status === "Available").length,
    issued: equipmentIssueRecords.filter((r) => r.status !== "Returned").length,
  }), [equipment, equipmentIssueRecords]);

  const notifStats = useMemo(() => ({
    unread: notifications.filter((n) => !n.read).length,
    total: notifications.length,
  }), [notifications]);

  const periodIncome = useMemo(() => {
    return accounts.filter((a) => a.type === "income" && a.date.startsWith(period)).reduce((s, a) => s + a.amount, 0);
  }, [accounts, period]);

  const periodExpense = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(period)).reduce((s, e) => s + e.amount, 0);
  }, [expenses, period]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center"><RefreshCw size={32} className="animate-spin text-brand-600 mx-auto mb-4" /><p className="text-muted-foreground">Loading dashboard...</p></div>
      </div>
    );
  }

  const quickActions = [
    { label: "DSM", href: "/franchise/dsm", icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "DSO", href: "/franchise/dso", icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: "Devices", href: "/franchise/devices", icon: Smartphone, color: "bg-purple-50 text-purple-600" },
    { label: "New SIMs", href: "/franchise/new-sims", icon: Package, color: "bg-cyan-50 text-cyan-600" },
    { label: "HLR SIMs", href: "/franchise/hlr-sims", icon: Layers, color: "bg-orange-50 text-orange-600" },
    { label: "Payroll", href: "/franchise/payroll", icon: Briefcase, color: "bg-green-50 text-green-600" },
    { label: "Attendance", href: "/franchise/attendance", icon: ClipboardCheck, color: "bg-teal-50 text-teal-600" },
    { label: "Reports", href: "/franchise/reports", icon: BarChart3, color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Dashboard" }]}
        title={`Welcome back, ${settings.ownerName || "Franchise Owner"}!`}
        description={`${settings.franchiseName || "THE SMART ERP"} | ${formatDateDDMMYYYY(today)} | ${metrics.activeDSM + metrics.activeDSO} active staff`}
        actions={
          <>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
              <Calendar size={14} className="text-muted-foreground" />
              <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent border-0 p-0 text-xs outline-none" />
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/franchise/notifications")} className="relative">
              <Bell size={16} />
              {notifStats.unread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notifStats.unread}
                </span>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/franchise/settings")}>
              <Shield size={16} />
            </Button>
          </>
        }
      />

      <div className="flex gap-0 border-b border-slate-200 w-fit">
        {[
          { key: "overview" as const, label: "Overview", icon: Home },
          { key: "performance" as const, label: "Performance", icon: Target },
          { key: "finance" as const, label: "Finance", icon: DollarSign },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === tab.key ? "border-brand-600 text-brand-600" : "border-transparent text-muted-foreground hover:text-slate-700"}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard label="Active DSM" value={metrics.activeDSM} sub={`of ${metrics.totalDSM} total`} icon={Users} iconClass="text-blue-600 bg-blue-50" trend={metrics.totalDSM > 0 ? `+${metrics.activeDSM}` : "0"} trendUp={metrics.activeDSM >= metrics.totalDSM * 0.5} />
            <StatCard label="Active DSO" value={metrics.activeDSO} sub={`of ${metrics.totalDSO} total`} icon={UserCheck} iconClass="text-emerald-600 bg-emerald-50" trend={metrics.totalDSO > 0 ? `+${metrics.activeDSO}` : "0"} trendUp={metrics.activeDSO >= metrics.totalDSO * 0.5} />
            <StatCard label="Devices Issued" value={metrics.issuedDevices} sub={`${metrics.inStockDevices} in stock · ${metrics.totalDevices} total`} icon={Smartphone} iconClass="text-purple-600 bg-purple-50" trend={metrics.totalDevices > 0 ? `${Math.round((metrics.issuedDevices / metrics.totalDevices) * 100)}%` : "0%"} trendUp />
            <StatCard label="Active SIMs" value={metrics.activatedSIMs} sub={`${metrics.issuedSIMs} issued · ${metrics.totalSIMs} total`} icon={CreditCard} iconClass="text-cyan-600 bg-cyan-50" trend={metrics.totalSIMs > 0 ? `${safePct(metrics.activatedSIMs, metrics.totalSIMs)}%` : "0%"} trendUp />
            <StatCard label="New SIM Stock" value={metrics.newSIMStock} icon={Package} iconClass="text-cyan-600 bg-cyan-50" progress={metrics.newSIMTotal > 0 ? safePct(metrics.newSIMStock, metrics.newSIMTotal) : 0} />
            <StatCard label="HLR SIM Stock" value={metrics.hlrStock} icon={Layers} iconClass="text-orange-600 bg-orange-50" progress={metrics.hlrSIMTotal > 0 ? safePct(metrics.hlrStock, metrics.hlrSIMTotal) : 0} />
            <StatCard label="Today Present" value={attendanceToday.present} sub={attendanceToday.total > 0 ? `${safePct(attendanceToday.present, attendanceToday.total)}%` : "—"} icon={CheckCircle2} iconClass="text-green-600 bg-green-50" progress={safePct(attendanceToday.present, attendanceToday.total || 1)} progressClass="bg-green-500" />
            <StatCard label="Unread Alerts" value={notifStats.unread} icon={Bell} iconClass={notifStats.unread > 0 ? "text-red-600 bg-red-50" : "text-slate-400 bg-slate-50"} />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Zap size={16} className="text-amber-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                {quickActions.map((a) => (
                  <button key={a.label} onClick={() => router.push(a.href)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl ${a.color} hover:scale-105 transition-all`}>
                    <a.icon size={20} />
                    <span className="text-[11px] font-bold whitespace-nowrap">{a.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between p-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <BarChart3 size={16} className="text-brand-600" /> DSO Performance Rankings
                    <span className="text-muted-foreground font-normal text-xs">({targetsData.dsoTargets.length} DSOs)</span>
                  </CardTitle>
                  <button onClick={() => router.push("/franchise/targets")}
                    className="text-brand-600 text-xs font-medium hover:underline flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </button>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  {topPerformers.length > 0 ? (
                    <div className="space-y-3">
                      {topPerformers.map((t, i) => (
                        <div key={t.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${i === 0 ? "bg-amber-50 border border-amber-200" : "hover:bg-slate-50"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-slate-900 text-sm font-bold truncate">{t.employeeName}</p>
                              {i === 0 && <Star size={12} className="text-amber-400 fill-amber-400" />}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${t.progress >= 80 ? "bg-gradient-to-r from-green-400 to-green-600" : t.progress >= 50 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}
                                  style={{ width: `${Math.min(100, t.progress)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-slate-600 w-12 text-right">{t.progress}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-900 text-sm font-bold">{t.achieved}/{t.monthlyTarget}</p>
                            <p className="text-muted-foreground text-[10px]">SIMs</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Target}
                      title="No targets set yet"
                      actions={<Button variant="outline" size="sm" onClick={() => router.push("/franchise/targets")}>Set targets</Button>}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between p-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Activity size={16} className="text-brand-600" /> Recent Activity
                  </CardTitle>
                  <span className="text-muted-foreground text-xs">{recentActivity.length} events</span>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                            <item.icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 text-sm font-medium truncate">{item.title}</p>
                            <p className="text-muted-foreground text-xs">{item.detail}</p>
                          </div>
                          <span className="text-muted-foreground text-[10px] whitespace-nowrap">{formatDateDDMMYYYY(item.time)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Activity} title="No recent activity" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <PieChart size={16} className="text-brand-600" /> SIM Network Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {networkDist.length > 0 ? (
                    <div className="space-y-4">
                      {networkDist.map(([network, count]) => {
                        const pct = safePct(count, metrics.totalSIMs);
                        const networkColors: Record<string, string> = { Jazz: "bg-red-500", Telenor: "bg-blue-500", Ufone: "bg-green-500", Zong: "bg-purple-500" };
                        return (
                          <div key={network}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <Wifi size={14} className={network === "Jazz" ? "text-red-500" : network === "Telenor" ? "text-blue-500" : network === "Ufone" ? "text-green-500" : "text-purple-500"} />
                                <span className="text-slate-700 text-sm font-medium">{network}</span>
                              </div>
                              <span className="text-muted-foreground text-xs">{count} SIMs ({pct}%)</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${networkColors[network] || "bg-slate-400"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState icon={Wifi} title="No SIMs in stock" />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="p-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Target size={16} className="text-brand-600" /> Target Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "SIM Target", achieved: targetsData.simAchieved, target: targetsData.simTargetVal, color: "#2D28CD" },
                      { label: "Device Target", achieved: targetsData.deviceAchieved, target: targetsData.deviceTargetVal, color: "#6366f1" },
                      { label: "Overall", achieved: targetsData.totalAchieved, target: targetsData.totalTargetVal, color: "#4DA8DA" },
                      { label: "Attendance", achieved: attendanceToday.present, target: attendanceToday.total, color: "#22C55E" },
                    ].map((g) => {
                      const pct = safePct(g.achieved, g.target);
                      const circumference = 2 * Math.PI * 36;
                      const offset = circumference - (pct / 100) * circumference;
                      return (
                        <div key={g.label} className="flex flex-col items-center">
                          <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                              <circle cx="40" cy="40" r="36" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                              <circle cx="40" cy="40" r="36" fill="none" stroke={g.color} strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-black text-slate-900">{pct}%</span>
                            </div>
                          </div>
                          <p className="text-slate-700 text-xs font-bold mt-2">{g.label}</p>
                          <p className="text-muted-foreground text-[10px]">{g.achieved}/{g.target}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between p-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <DollarSign size={16} className="text-brand-600" /> Financial Summary
                    <span className="text-muted-foreground font-normal text-xs">({currentMonth})</span>
                  </CardTitle>
                  <button onClick={() => router.push("/franchise/accounts")}
                    className="text-brand-600 text-xs font-medium hover:underline flex items-center gap-1">
                    Details <ChevronRight size={12} />
                  </button>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-green-600" />
                      <div><span className="text-green-700 text-sm font-medium">Monthly Income</span>
                        {finance.incomeTrend !== 0 && <span className={`text-xs ml-2 ${finance.incomeTrend >= 0 ? "text-green-500" : "text-red-500"}`}>({finance.incomeTrend >= 0 ? "+" : ""}{finance.incomeTrend}%)</span>}
                      </div>
                    </div>
                    <span className="text-green-800 text-sm font-bold">PKR {finance.monthlyIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={16} className="text-red-600" />
                      <span className="text-red-700 text-sm font-medium">Monthly Expenses</span>
                    </div>
                    <span className="text-red-800 text-sm font-bold">PKR {finance.monthlyExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-blue-600" />
                      <span className="text-blue-700 text-sm font-medium">Monthly Payroll</span>
                    </div>
                    <span className="text-blue-800 text-sm font-bold">PKR {finance.monthlyPayroll.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl text-white">
                      <div className="flex items-center gap-2">
                        <Wallet size={16} />
                        <span className="text-sm font-medium">Wallet Balance</span>
                      </div>
                      <span className="text-sm font-bold">PKR {finance.walletBal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: finance.netProfit >= 0 ? "#f0fdf4" : "#fef2f2" }}>
                    <span className={`text-sm font-medium ${finance.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>Net Profit (All-time)</span>
                    <span className={`text-sm font-bold ${finance.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {finance.netProfit >= 0 ? "+" : ""}PKR {finance.netProfit.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between p-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <ClipboardCheck size={16} className="text-brand-600" /> Today&apos;s Attendance
                  </CardTitle>
                  <button onClick={() => router.push("/franchise/attendance")}
                    className="text-brand-600 text-xs font-medium hover:underline flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </button>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { label: "Present", value: attendanceToday.present, color: "text-green-600", bg: "bg-green-50" },
                      { label: "Late", value: attendanceToday.late, color: "text-yellow-600", bg: "bg-yellow-50" },
                      { label: "Absent", value: attendanceToday.absent, color: "text-red-600", bg: "bg-red-50" },
                      { label: "Leave", value: attendanceToday.leave, color: "text-blue-600", bg: "bg-blue-50" },
                    ].map((s) => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-muted-foreground text-[10px] font-medium">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    {attendanceToday.total > 0 && (
                      <>
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${safeDiv(attendanceToday.present, attendanceToday.total) * 100}%` }} />
                        <div className="h-full bg-yellow-500 transition-all" style={{ width: `${safeDiv(attendanceToday.late, attendanceToday.total) * 100}%` }} />
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${safeDiv(attendanceToday.absent, attendanceToday.total) * 100}%` }} />
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${safeDiv(attendanceToday.leave, attendanceToday.total) * 100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-muted-foreground text-[10px]">
                      {attendanceToday.total > 0 ? `${safePct(attendanceToday.present, attendanceToday.total)}% attendance rate` : "No records today"}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] text-green-600"><CircleDot size={8} className="fill-green-600" /> Present</span>
                      <span className="flex items-center gap-1 text-[10px] text-yellow-600"><CircleDot size={8} className="fill-yellow-600" /> Late</span>
                      <span className="flex items-center gap-1 text-[10px] text-red-600"><CircleDot size={8} className="fill-red-600" /> Absent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Package size={16} className="text-brand-600" /> Inventory Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  {[
                    { label: "New SIMs", inStock: metrics.newSIMStock, issued: metrics.issuedSIMs, total: metrics.newSIMTotal, color: "bg-cyan-500", icon: Package },
                    { label: "HLR SIMs", inStock: metrics.hlrStock, issued: metrics.issuedSIMs, total: metrics.hlrSIMTotal, color: "bg-orange-500", icon: Layers },
                    { label: "Devices", inStock: metrics.inStockDevices, issued: metrics.issuedDevices, total: metrics.totalDevices, color: "bg-purple-500", icon: Smartphone },
                    { label: "Equipment", inStock: equipmentStats.available, issued: equipmentStats.issued, total: equipmentStats.total, color: "bg-indigo-500", icon: Briefcase },
                  ].map((item) => {
                    const stockPct = safePct(item.inStock, item.total || 1);
                    return (
                      <div key={item.label} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <item.icon size={14} className="text-muted-foreground" />
                            <span className="text-slate-700 text-sm font-medium">{item.label}</span>
                          </div>
                          <span className="text-muted-foreground text-xs">{item.inStock}/{item.total} in stock</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${stockPct}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-muted-foreground text-[10px]">{stockPct}% available</span>
                          <span className="text-muted-foreground text-[10px]">{item.issued} issued</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {activeTab === "performance" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Overall Progress" value={`${targetsData.overallPct}%`} sub={`${targetsData.totalAchieved}/${targetsData.totalTargetVal}`} icon={Target} iconClass="text-brand-600 bg-brand-50" />
            <StatCard label="SIM Achievement" value={`${safePct(targetsData.simAchieved, targetsData.simTargetVal)}%`} sub={`${targetsData.simAchieved}/${targetsData.simTargetVal}`} icon={CreditCard} iconClass="text-amber-600 bg-amber-50" />
            <StatCard label="Device Achievement" value={`${safePct(targetsData.deviceAchieved, targetsData.deviceTargetVal)}%`} sub={`${targetsData.deviceAchieved}/${targetsData.deviceTargetVal}`} icon={Smartphone} iconClass="text-purple-600 bg-purple-50" />
            <StatCard label="Active Issue Records" value={issueStats.activeIssues} sub={`${issueStats.returnedIssues} returned`} icon={Activity} iconClass="text-emerald-600 bg-emerald-50" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <UserCheck size={16} className="text-brand-600" /> DSO Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">DSO</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Target</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Achieved</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((t, i) => (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {i + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{t.employeeName}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{t.monthlyTarget}</td>
                        <td className="px-4 py-3 text-right text-slate-900 font-bold">{t.achieved}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${t.progress >= 80 ? "bg-green-500" : t.progress >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, t.progress)}%` }} />
                            </div>
                            <span className="text-xs font-bold w-10 text-right">{t.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {topPerformers.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No DSO targets found</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <Users size={16} className="text-brand-600" /> DSM Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-blue-600">{metrics.activeDSM}</p>
                    <p className="text-muted-foreground text-xs">Active DSMs</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-indigo-600">{metrics.totalDSM}</p>
                    <p className="text-muted-foreground text-xs">Total DSMs</p>
                  </div>
                </div>
                {dsmTargets.dsmTargets.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-700 text-sm font-medium">Target Achievement</span>
                      <span className="text-slate-900 text-sm font-bold">{dsmTargets.pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${dsmTargets.pct >= 80 ? "bg-green-500" : dsmTargets.pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(100, dsmTargets.pct)}%` }} />
                    </div>
                    <p className="text-muted-foreground text-[11px] text-center">{dsmTargets.achieved}/{dsmTargets.total} achieved</p>
                  </div>
                ) : (
                  <EmptyState icon={Target} title="No DSM targets configured" />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-5">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <PieChart size={16} className="text-brand-600" /> Expense Breakdown by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {expenseByCategory.categories.length > 0 ? (
                <div className="space-y-3">
                  {expenseByCategory.categories.map(([cat, amt]) => {
                    const pct = safePct(amt, expenseByCategory.total);
                    const catColors: Record<string, string> = { Payroll: "bg-red-500", Salary: "bg-red-400", Rent: "bg-blue-500", Utilities: "bg-yellow-500", "Office Supplies": "bg-purple-500", Marketing: "bg-pink-500", Travel: "bg-cyan-500", Other: "bg-slate-400" };
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${catColors[cat] || "bg-slate-400"}`} />
                            <span className="text-slate-700 text-sm font-medium">{cat}</span>
                          </div>
                          <span className="text-muted-foreground text-xs">PKR {amt.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${catColors[cat] || "bg-slate-400"} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={PieChart} title="No expense data" />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "finance" && (
        <>
          <Card className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-xs">Financial Summary for</span>
                <div className="bg-white/10 rounded-lg px-3 py-1 flex items-center gap-2">
                  <Calendar size={12} className="text-white/60" />
                  <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                    className="bg-transparent border-0 p-0 text-white text-xs focus:outline-none [color-scheme:dark]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-green-300 text-xs">Income</p>
                  <p className="text-xl font-black">PKR {periodIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-red-300 text-xs">Expenses</p>
                  <p className="text-xl font-black">PKR {periodExpense.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">Net</p>
                  <p className={`text-xl font-black ${periodIncome - periodExpense >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {periodIncome - periodExpense >= 0 ? "+" : ""}PKR {(periodIncome - periodExpense).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Income" value={`PKR ${finance.totalIncome.toLocaleString()}`} icon={TrendingUp} iconClass="text-green-600 bg-green-50" />
            <StatCard label="Total Expenses" value={`PKR ${finance.totalExpensesAll.toLocaleString()}`} icon={TrendingDown} iconClass="text-red-600 bg-red-50" />
            <StatCard label="Total Payroll" value={`PKR ${finance.totalPayroll.toLocaleString()}`} icon={Receipt} iconClass="text-blue-600 bg-blue-50" />
            <StatCard label="Wallet Balance" value={`PKR ${finance.walletBal.toLocaleString()}`} icon={Wallet} iconClass="text-amber-600 bg-amber-50" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-5">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <Building2 size={16} className="text-brand-600" /> Bank Accounts
                </CardTitle>
                <button onClick={() => router.push("/franchise/accounts")}
                  className="text-brand-600 text-xs font-medium hover:underline">View All</button>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {bankAccounts.length > 0 ? bankAccounts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-slate-900 text-sm font-medium">{a.name}</p>
                        <p className="text-muted-foreground text-xs font-mono">{a.accountNumber}</p>
                      </div>
                    </div>
                    <span className="text-slate-900 text-sm font-bold">PKR {a.balance.toLocaleString()}</span>
                  </div>
                )) : (
                  <EmptyState icon={Building2} title="No bank accounts" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-5">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <PieChart size={16} className="text-brand-600" /> Expense Breakdown
                </CardTitle>
                <button onClick={() => router.push("/franchise/expenses")}
                  className="text-brand-600 text-xs font-medium hover:underline">View All</button>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2">
                {expenseByCategory.categories.length > 0 ? expenseByCategory.categories.slice(0, 6).map(([cat, amt]) => {
                  const pct = safePct(amt, expenseByCategory.total);
                  const catColors: Record<string, string> = { Payroll: "bg-red-500", Salary: "bg-red-400", Rent: "bg-blue-500", Utilities: "bg-yellow-500", "Office Supplies": "bg-purple-500", Marketing: "bg-pink-500", Travel: "bg-cyan-500", Other: "bg-slate-400" };
                  return (
                    <div key={cat} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${catColors[cat] || "bg-slate-400"}`} />
                        <span className="text-slate-700 text-xs">{cat}</span>
                      </div>
                      <span className="text-slate-900 text-xs font-medium">PKR {amt.toLocaleString()} ({pct}%)</span>
                    </div>
                  );
                }) : (
                  <EmptyState icon={PieChart} title="No expenses" />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-5">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Briefcase size={16} className="text-brand-600" /> Recent Payroll
              </CardTitle>
              <button onClick={() => router.push("/franchise/payroll")}
                className="text-brand-600 text-xs font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </button>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Month</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Basic</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Commission</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Net Pay</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.slice(0, 8).map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.employeeName}</td>
                      <td className="px-4 py-3 text-slate-600">{p.role}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.month}</td>
                      <td className="px-4 py-3 text-right text-slate-600">PKR {(p.basicSalary || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">PKR {(p.totalCommission || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-900 font-bold">PKR {(p.netPay || p.net || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusPill label={p.paid ? "Paid" : "Pending"} tone={p.paid ? "positive" : "warning"} />
                      </td>
                    </tr>
                  ))}
                  {payroll.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No payroll records</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function prevMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
