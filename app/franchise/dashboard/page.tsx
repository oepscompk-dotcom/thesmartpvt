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
  Briefcase, Layers, CircleDot, RefreshCw, Wifi, Star, X,
  Download, Eye, Home, Filter
} from "lucide-react";

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

  // â”€â”€â”€ All Memoized Metrics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        title: `${r.issuedTo} â€” ${r.status === "Issued" ? "SIMs Issued" : "SIMs Returned"}`,
        detail: `${r.simIds.length} SIM(s) | ${r.retailerId}`,
        time: r.issueDate || r.returnDate || "",
      });
    });
    equipmentIssueRecords.slice(0, 2).forEach((r) => {
      items.push({
        icon: Briefcase, color: "text-indigo-500 bg-indigo-50",
        title: `${r.personName} â€” Equipment ${r.status === "Returned" ? "Returned" : "Issued"}`,
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
        <div className="text-center"><RefreshCw size={32} className="animate-spin text-[#0A2647] mx-auto mb-4" /><p className="text-gray-500">Loading dashboard...</p></div>
      </div>
    );
  }

  const statCards = [
    { label: "Active DSM", value: metrics.activeDSM, sub: `of ${metrics.totalDSM} total`, icon: Users, color: "from-blue-500 to-blue-600", light: "bg-blue-50", trend: metrics.totalDSM > 0 ? `+${metrics.activeDSM}` : "0", up: metrics.activeDSM >= metrics.totalDSM * 0.5 },
    { label: "Active DSO", value: metrics.activeDSO, sub: `of ${metrics.totalDSO} total`, icon: UserCheck, color: "from-emerald-500 to-emerald-600", light: "bg-emerald-50", trend: metrics.totalDSO > 0 ? `+${metrics.activeDSO}` : "0", up: metrics.activeDSO >= metrics.totalDSO * 0.5 },
    { label: "Devices Issued", value: metrics.issuedDevices, sub: `${metrics.inStockDevices} in stock Â· ${metrics.totalDevices} total`, icon: Smartphone, color: "from-purple-500 to-purple-600", light: "bg-purple-50", trend: metrics.totalDevices > 0 ? `${Math.round((metrics.issuedDevices / metrics.totalDevices) * 100)}%` : "0%", up: true },
    { label: "Active SIMs", value: metrics.activatedSIMs, sub: `${metrics.issuedSIMs} issued Â· ${metrics.totalSIMs} total`, icon: CreditCard, color: "from-cyan-500 to-cyan-600", light: "bg-cyan-50", trend: metrics.totalSIMs > 0 ? `${safePct(metrics.activatedSIMs, metrics.totalSIMs)}%` : "0%", up: true },
  ];

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

  const secondaryStats = [
    { label: "New SIM Stock", value: metrics.newSIMStock, icon: Package, color: "text-cyan-600", light: "bg-cyan-50", pct: metrics.newSIMTotal > 0 ? safePct(metrics.newSIMStock, metrics.newSIMTotal) : 0 },
    { label: "HLR SIM Stock", value: metrics.hlrStock, icon: Layers, color: "text-orange-600", light: "bg-orange-50", pct: metrics.hlrSIMTotal > 0 ? safePct(metrics.hlrStock, metrics.hlrSIMTotal) : 0 },
    { label: "Today Present", value: attendanceToday.present, sub: attendanceToday.total > 0 ? `${safePct(attendanceToday.present, attendanceToday.total)}%` : "â€”", icon: CheckCircle2, color: "text-green-600", light: "bg-green-50", pct: safePct(attendanceToday.present, attendanceToday.total || 1) },
    { label: "Unread Alerts", value: notifStats.unread, icon: Bell, color: notifStats.unread > 0 ? "text-red-600" : "text-gray-400", light: notifStats.unread > 0 ? "bg-red-50" : "bg-gray-50", pct: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* â”€â”€â”€ Greeting Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-gradient-to-r from-[#0A2647] via-[#144272] to-[#205295] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Home size={16} className="text-white/60" />
                <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Franchise Dashboard</span>
              </div>
              <h1 className="text-2xl font-black">Welcome back, {settings.ownerName || "Franchise Owner"}!</h1>
              <p className="text-white/70 text-sm mt-1">
                {settings.franchiseName || "THE SMART ERP"} | {formatDateDDMMYYYY(today)} | {metrics.activeDSM + metrics.activeDSO} active staff
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-white/60" />
                <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                  className="bg-transparent border-0 p-0 text-white text-xs focus:outline-none [color-scheme:dark]" />
              </div>
              <button onClick={() => router.push("/franchise/notifications")}
                className="relative p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                <Bell size={18} />
                {notifStats.unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">{notifStats.unread}</span>}
              </button>
              <button onClick={() => router.push("/franchise/settings")}
                className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Shield size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€â”€ Tab Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { key: "overview" as const, label: "Overview", icon: Home },
          { key: "performance" as const, label: "Performance", icon: Target },
          { key: "finance" as const, label: "Finance", icon: DollarSign },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key ? "bg-white text-[#0A2647] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â• OVERVIEW TAB â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === "overview" && (
        <>
          {/* â”€â”€â”€ Primary Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${s.light} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <s.icon size={20} className={s.color.split(" ")[0].replace("from-", "text-")} />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-bold ${s.up ? "text-green-600" : "text-red-600"}`}>
                    {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.trend}
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs font-medium mt-0.5">{s.label}</p>
                <p className="text-gray-400 text-[10px] mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* â”€â”€â”€ Secondary Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryStats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center`}>
                    <s.icon size={18} className={s.color} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900">{s.value}</p>
                    <p className="text-gray-500 text-[11px]">{s.label} {s.sub && `Â· ${s.sub}`}</p>
                    {s.pct > 0 && (
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${s.label === "Today Present" ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${s.pct}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* â”€â”€â”€ Quick Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2">
              <Zap size={16} className="text-[#C8A951]" /> Quick Actions
            </h3>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
              {quickActions.map((a) => (
                <button key={a.label} onClick={() => router.push(a.href)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${a.color} hover:scale-105 transition-all`}>
                  <a.icon size={20} />
                  <span className="text-[11px] font-bold whitespace-nowrap">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* â”€â”€â”€ Main Content Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              {/* DSO Performance Rankings */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <BarChart3 size={16} className="text-[#0A2647]" /> DSO Performance Rankings
                    <span className="text-gray-400 font-normal text-xs">({targetsData.dsoTargets.length} DSOs)</span>
                  </h3>
                  <button onClick={() => router.push("/franchise/targets")}
                    className="text-[#0A2647] text-xs font-medium hover:underline flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </button>
                </div>
                <div className="p-4">
                  {topPerformers.length > 0 ? (
                    <div className="space-y-3">
                      {topPerformers.map((t, i) => (
                        <div key={t.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${i === 0 ? "bg-amber-50 border border-amber-200" : "hover:bg-gray-50"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-gray-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900 text-sm font-bold truncate">{t.employeeName}</p>
                              {i === 0 && <Star size={12} className="text-amber-400 fill-amber-400" />}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${t.progress >= 80 ? "bg-gradient-to-r from-green-400 to-green-600" : t.progress >= 50 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}
                                  style={{ width: `${Math.min(100, t.progress)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-gray-600 w-12 text-right">{t.progress}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900 text-sm font-bold">{t.achieved}/{t.monthlyTarget}</p>
                            <p className="text-gray-400 text-[10px]">SIMs</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No targets set yet. <button onClick={() => router.push("/franchise/targets")} className="text-[#0A2647] underline">Set targets</button></p>
                  )}
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <Activity size={16} className="text-[#0A2647]" /> Recent Activity
                  </h3>
                  <span className="text-gray-400 text-xs">{recentActivity.length} events</span>
                </div>
                <div className="p-4">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                            <item.icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-medium truncate">{item.title}</p>
                            <p className="text-gray-400 text-xs">{item.detail}</p>
                          </div>
                          <span className="text-gray-400 text-[10px] whitespace-nowrap">{formatDateDDMMYYYY(item.time)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No recent activity</p>
                  )}
                </div>
              </div>

              {/* SIM Network Distribution */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <PieChart size={16} className="text-[#0A2647]" /> SIM Network Distribution
                  </h3>
                </div>
                <div className="p-6">
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
                                <span className="text-gray-700 text-sm font-medium">{network}</span>
                              </div>
                              <span className="text-gray-500 text-xs">{count} SIMs ({pct}%)</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${networkColors[network] || "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-4">No SIMs in stock</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - 1 col */}
            <div className="space-y-6">
              {/* Target Achievement Gauges */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <Target size={16} className="text-[#0A2647]" /> Target Achievement
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "SIM Target", achieved: targetsData.simAchieved, target: targetsData.simTargetVal, color: "#0A2647" },
                      { label: "Device Target", achieved: targetsData.deviceAchieved, target: targetsData.deviceTargetVal, color: "#C8A951" },
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
                              <span className="text-sm font-black text-gray-900">{pct}%</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-xs font-bold mt-2">{g.label}</p>
                          <p className="text-gray-400 text-[10px]">{g.achieved}/{g.target}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <DollarSign size={16} className="text-[#0A2647]" /> Financial Summary
                    <span className="text-gray-400 font-normal text-xs">({currentMonth})</span>
                  </h3>
                  <button onClick={() => router.push("/franchise/accounts")}
                    className="text-[#0A2647] text-xs font-medium hover:underline flex items-center gap-1">
                    Details <ChevronRight size={12} />
                  </button>
                </div>
                <div className="p-4 space-y-3">
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
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#0A2647] to-[#144272] rounded-xl text-white">
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
                </div>
              </div>

              {/* Today's Attendance */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-[#0A2647]" /> Today&apos;s Attendance
                  </h3>
                  <button onClick={() => router.push("/franchise/attendance")}
                    className="text-[#0A2647] text-xs font-medium hover:underline flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { label: "Present", value: attendanceToday.present, color: "text-green-600", bg: "bg-green-50" },
                      { label: "Late", value: attendanceToday.late, color: "text-yellow-600", bg: "bg-yellow-50" },
                      { label: "Absent", value: attendanceToday.absent, color: "text-red-600", bg: "bg-red-50" },
                      { label: "Leave", value: attendanceToday.leave, color: "text-blue-600", bg: "bg-blue-50" },
                    ].map((s) => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-gray-500 text-[10px] font-medium">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
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
                    <span className="text-gray-400 text-[10px]">
                      {attendanceToday.total > 0 ? `${safePct(attendanceToday.present, attendanceToday.total)}% attendance rate` : "No records today"}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] text-green-600"><CircleDot size={8} className="fill-green-600" /> Present</span>
                      <span className="flex items-center gap-1 text-[10px] text-yellow-600"><CircleDot size={8} className="fill-yellow-600" /> Late</span>
                      <span className="flex items-center gap-1 text-[10px] text-red-600"><CircleDot size={8} className="fill-red-600" /> Absent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Status */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <Package size={16} className="text-[#0A2647]" /> Inventory Status
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: "New SIMs", inStock: metrics.newSIMStock, issued: metrics.issuedSIMs, total: metrics.newSIMTotal, color: "bg-cyan-500", icon: Package },
                    { label: "HLR SIMs", inStock: metrics.hlrStock, issued: metrics.issuedSIMs, total: metrics.hlrSIMTotal, color: "bg-orange-500", icon: Layers },
                    { label: "Devices", inStock: metrics.inStockDevices, issued: metrics.issuedDevices, total: metrics.totalDevices, color: "bg-purple-500", icon: Smartphone },
                    { label: "Equipment", inStock: equipmentStats.available, issued: equipmentStats.issued, total: equipmentStats.total, color: "bg-indigo-500", icon: Briefcase },
                  ].map((item) => {
                    const stockPct = safePct(item.inStock, item.total || 1);
                    return (
                      <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <item.icon size={14} className="text-gray-500" />
                            <span className="text-gray-700 text-sm font-medium">{item.label}</span>
                          </div>
                          <span className="text-gray-500 text-xs">{item.inStock}/{item.total} in stock</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${stockPct}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-gray-400 text-[10px]">{stockPct}% available</span>
                          <span className="text-gray-400 text-[10px]">{item.issued} issued</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â• PERFORMANCE TAB â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === "performance" && (
        <>
          {/* Target Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Overall Progress", value: `${targetsData.overallPct}%`, sub: `${targetsData.totalAchieved}/${targetsData.totalTargetVal}`, icon: Target, color: "text-[#0A2647]", light: "bg-blue-50" },
              { label: "SIM Achievement", value: `${safePct(targetsData.simAchieved, targetsData.simTargetVal)}%`, sub: `${targetsData.simAchieved}/${targetsData.simTargetVal}`, icon: CreditCard, color: "text-amber-600", light: "bg-amber-50" },
              { label: "Device Achievement", value: `${safePct(targetsData.deviceAchieved, targetsData.deviceTargetVal)}%`, sub: `${targetsData.deviceAchieved}/${targetsData.deviceTargetVal}`, icon: Smartphone, color: "text-purple-600", light: "bg-purple-50" },
              { label: "Active Issue Records", value: issueStats.activeIssues, sub: `${issueStats.returnedIssues} returned`, icon: Activity, color: "text-emerald-600", light: "bg-emerald-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center mb-3`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
                {s.sub && <p className="text-gray-400 text-[10px] mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* DSO Performance Table */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                  <UserCheck size={16} className="text-[#0A2647]" /> DSO Performance
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">DSO</th>
                      <th className="px-4 py-3 text-right text-gray-500 text-xs font-medium uppercase">Target</th>
                      <th className="px-4 py-3 text-right text-gray-500 text-xs font-medium uppercase">Achieved</th>
                      <th className="px-4 py-3 text-center text-gray-500 text-xs font-medium uppercase">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((t, i) => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-gray-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {i + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{t.employeeName}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{t.monthlyTarget}</td>
                        <td className="px-4 py-3 text-right text-gray-900 font-bold">{t.achieved}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${t.progress >= 80 ? "bg-green-500" : t.progress >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, t.progress)}%` }} />
                            </div>
                            <span className="text-xs font-bold w-10 text-right">{t.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {topPerformers.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No DSO targets found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DSM Performance Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                  <Users size={16} className="text-[#0A2647]" /> DSM Performance
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-blue-600">{metrics.activeDSM}</p>
                    <p className="text-gray-500 text-xs">Active DSMs</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-indigo-600">{metrics.totalDSM}</p>
                    <p className="text-gray-500 text-xs">Total DSMs</p>
                  </div>
                </div>
                {dsmTargets.dsmTargets.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-700 text-sm font-medium">Target Achievement</span>
                      <span className="text-gray-900 text-sm font-bold">{dsmTargets.pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${dsmTargets.pct >= 80 ? "bg-green-500" : dsmTargets.pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(100, dsmTargets.pct)}%` }} />
                    </div>
                    <p className="text-gray-400 text-[11px] text-center">{dsmTargets.achieved}/{dsmTargets.total} achieved</p>
                  </div>
                )}
                {dsmTargets.dsmTargets.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-6">No DSM targets configured</p>
                )}
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                <PieChart size={16} className="text-[#0A2647]" /> Expense Breakdown by Category
              </h3>
            </div>
            <div className="p-5">
              {expenseByCategory.categories.length > 0 ? (
                <div className="space-y-3">
                  {expenseByCategory.categories.map(([cat, amt]) => {
                    const pct = safePct(amt, expenseByCategory.total);
                    const catColors: Record<string, string> = { Payroll: "bg-red-500", Salary: "bg-red-400", Rent: "bg-blue-500", Utilities: "bg-yellow-500", "Office Supplies": "bg-purple-500", Marketing: "bg-pink-500", Travel: "bg-cyan-500", Other: "bg-gray-400" };
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${catColors[cat] || "bg-gray-400"}`} />
                            <span className="text-gray-700 text-sm font-medium">{cat}</span>
                          </div>
                          <span className="text-gray-500 text-xs">PKR {amt.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${catColors[cat] || "bg-gray-400"} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No expense data</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â• FINANCE TAB â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === "finance" && (
        <>
          {/* Period Summary */}
          <div className="bg-gradient-to-r from-[#0A2647] to-[#144272] rounded-2xl p-5 text-white">
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
                <p className="text-green-400 text-xs">Income</p>
                <p className="text-xl font-black">PKR {periodIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-red-400 text-xs">Expenses</p>
                <p className="text-xl font-black">PKR {periodExpense.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs">Net</p>
                <p className={`text-xl font-black ${periodIncome - periodExpense >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {periodIncome - periodExpense >= 0 ? "+" : ""}PKR {(periodIncome - periodExpense).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Income", value: `PKR ${finance.totalIncome.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", light: "bg-green-50" },
              { label: "Total Expenses", value: `PKR ${finance.totalExpensesAll.toLocaleString()}`, icon: TrendingDown, color: "text-red-600", light: "bg-red-50" },
              { label: "Total Payroll", value: `PKR ${finance.totalPayroll.toLocaleString()}`, icon: Receipt, color: "text-blue-600", light: "bg-blue-50" },
              { label: "Wallet Balance", value: `PKR ${finance.walletBal.toLocaleString()}`, icon: Wallet, color: "text-amber-600", light: "bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center mb-3`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <p className="text-xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bank Accounts & Recent Expenses */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                  <Building2 size={16} className="text-[#0A2647]" /> Bank Accounts
                </h3>
                <button onClick={() => router.push("/franchise/accounts")}
                  className="text-[#0A2647] text-xs font-medium hover:underline">View All</button>
              </div>
              <div className="p-4 space-y-3">
                {bankAccounts.length > 0 ? bankAccounts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{a.name}</p>
                        <p className="text-gray-400 text-xs font-mono">{a.accountNumber}</p>
                      </div>
                    </div>
                    <span className="text-gray-900 text-sm font-bold">PKR {a.balance.toLocaleString()}</span>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm text-center py-4">No bank accounts</p>
                )}
              </div>
            </div>

            {/* Expense Breakdown Pie */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                  <PieChart size={16} className="text-[#0A2647]" /> Expense Breakdown
                </h3>
                <button onClick={() => router.push("/franchise/expenses")}
                  className="text-[#0A2647] text-xs font-medium hover:underline">View All</button>
              </div>
              <div className="p-4 space-y-2">
                {expenseByCategory.categories.length > 0 ? expenseByCategory.categories.slice(0, 6).map(([cat, amt]) => {
                  const pct = safePct(amt, expenseByCategory.total);
                  const catColors: Record<string, string> = { Payroll: "bg-red-500", Salary: "bg-red-400", Rent: "bg-blue-500", Utilities: "bg-yellow-500", "Office Supplies": "bg-purple-500", Marketing: "bg-pink-500", Travel: "bg-cyan-500", Other: "bg-gray-400" };
                  return (
                    <div key={cat} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${catColors[cat] || "bg-gray-400"}`} />
                        <span className="text-gray-700 text-xs">{cat}</span>
                      </div>
                      <span className="text-gray-900 text-xs font-medium">PKR {amt.toLocaleString()} ({pct}%)</span>
                    </div>
                  );
                }) : (
                  <p className="text-gray-400 text-sm text-center py-4">No expenses</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Payroll */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                <Briefcase size={16} className="text-[#0A2647]" /> Recent Payroll
              </h3>
              <button onClick={() => router.push("/franchise/payroll")}
                className="text-[#0A2647] text-xs font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Month</th>
                    <th className="px-4 py-3 text-right text-gray-500 text-xs font-medium uppercase">Basic</th>
                    <th className="px-4 py-3 text-right text-gray-500 text-xs font-medium uppercase">Commission</th>
                    <th className="px-4 py-3 text-right text-gray-500 text-xs font-medium uppercase">Net Pay</th>
                    <th className="px-4 py-3 text-center text-gray-500 text-xs font-medium uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.slice(0, 8).map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.employeeName}</td>
                      <td className="px-4 py-3 text-gray-600">{p.role}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.month}</td>
                      <td className="px-4 py-3 text-right text-gray-600">PKR {(p.basicSalary || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">PKR {(p.totalCommission || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-bold">PKR {(p.netPay || p.net || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${p.paid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                          {p.paid ? "Paid" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payroll.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No payroll records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
