"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDSMData } from "@/lib/DSMDataContext";
import {
  Plus, ArrowRightLeft, Repeat, Hash, Wallet, Target, TrendingUp,
  TrendingDown, CheckCircle, Clock, AlertTriangle, Smartphone, Bell,
  ChevronRight, ArrowRight, Shield, CreditCard, Activity, Zap,
  BarChart3, Home, Package, CircleDot, DollarSign, RefreshCw,
  CheckCircle2, FileText, Star, X, BookOpen, Search, Users
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoadById } from "@/lib/api";

export default function DSMDashboardPage() {
  const { activations, dsos, targets, wallet, notifications, attendance, settings, auth, hydrated, markNotificationRead, totalSales, sims } = useDSMData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "finance">("overview");
  const [showActivatePopup, setShowActivatePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dsmName = auth.dsmName || settings.dsmName || "DSM";
  const dsmId = auth.dsmId || "DSM-NRWP-001";

  const [mySalary, setMySalary] = useState<Record<string, number>>({});
  useEffect(() => {
    (async () => {
      try {
        const authData = await apiLoadById("franchiseData", "dsm-auth");
        if (authData?.data) {
          const parsed = JSON.parse(authData.data);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const me = list.find((d: any) => d.id === dsmId);
          if (me) {
            const fields = ["salary","fuelAllowance","mobileAllowance","dailyAllowance","residenceAllowance",
              "newSimCommission","mnpCommission","replacementCommission","bynCommission","hikeCommission",
              "otherCommission","targetBonus","bonus","advanceSalary","loanDeduction","otherDeduction"];
            const obj: Record<string, number> = {};
            fields.forEach((f) => { obj[f] = me[f] || 0; });
            setMySalary(obj);
          }
        }
      } catch {}
    })();
  }, [dsmId]);

  const simStock = useMemo(() => {
    const newS = sims.filter((s) => s.type === "new");
    const hlrS = sims.filter((s) => s.type === "hlr");
    const networkCounts: Record<string, number> = {};
    sims.forEach((s) => { networkCounts[s.network] = (networkCounts[s.network] || 0) + 1; });
    return { total: sims.length, new: newS.length, hlr: hlrS.length, networkCounts };
  }, [sims]);

  const safePct = (val: number, total: number) => total > 0 ? Math.min(100, Math.round((val / total) * 100)) : 0;

  const today = new Date().toISOString().split("T")[0];
  const todayDate = formatDateDDMMYYYY(today);

  const metrics = useMemo(() => {
    const todayActs = activations.filter((a) => a.createdAt.startsWith(today));
    const pBVS = activations.filter((a) => a.bvsStatus === "Pending").length;
    const pFCA = activations.filter((a) => a.fcaStatus === "Pending" && a.bvsStatus === "Completed").length;
    const pIFCA = activations.filter((a) => a.ifcaStatus === "Pending" && a.fcaStatus === "Completed").length;
    const completedT = activations.filter((a) => a.status === "Completed" && a.createdAt.startsWith(today)).length;
    const totalC = activations.filter((a) => a.status === "Completed").length;
    return { todayActs: todayActs.length, pendingBVS: pBVS, pendingFCA: pFCA, pendingIFCA: pIFCA, completedToday: completedT, totalCompleted: totalC, pendingTotal: pBVS + pFCA + pIFCA };
  }, [activations, today]);

  const walletInfo = useMemo(() => {
    const bal = wallet.length > 0 ? wallet[wallet.length - 1]?.balance ?? wallet[0].balance ?? 0 : 0;
    const totalCredits = wallet.filter((w) => w.type === "Credit").reduce((s, w) => s + w.amount, 0);
    const totalDebits = wallet.filter((w) => w.type === "Debit").reduce((s, w) => s + w.amount, 0);
    return { balance: bal, totalCredits, totalDebits, count: wallet.length };
  }, [wallet]);

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const monthTargets = targets.filter((t) => t.month === currentMonth);
  const totalMonthlyTarget = monthTargets.reduce((s, t) => s + t.monthly, 0);
  const totalMonthlyAchieved = monthTargets.reduce((s, t) => s + t.monthlyAchieved, 0);
  const targetProgress = totalMonthlyTarget > 0 ? Math.round((totalMonthlyAchieved / totalMonthlyTarget) * 100) : 0;

  const newSimTargets = monthTargets.filter((t) => t.type === "New SIM");
  const totalNewSimTarget = newSimTargets.reduce((s, t) => s + t.monthly, 0);
  const totalNewSimAchieved = newSimTargets.reduce((s, t) => s + t.monthlyAchieved, 0);

  const salarySummary = useMemo(() => {
    if (!mySalary.salary) return null;
    const totalAllow = (mySalary.fuelAllowance || 0) + (mySalary.mobileAllowance || 0) + (mySalary.dailyAllowance || 0) + (mySalary.residenceAllowance || 0);
    const totalBonus = (mySalary.targetBonus || 0) + (mySalary.bonus || 0);
    const totalDed = (mySalary.advanceSalary || 0) + (mySalary.loanDeduction || 0) + (mySalary.otherDeduction || 0);
    const gross = (mySalary.salary || 0) + totalAllow + totalBonus;
    const netPay = gross - totalDed;
    return { totalAllow, totalBonus, totalDed, gross, netPay };
  }, [mySalary]);

  const recentActivity = useMemo(() => {
    return activations.slice(0, 5).map((a) => ({
      icon: a.status === "Completed" ? CheckCircle2 : Clock,
      color: a.status === "Completed" ? "text-green-500 bg-green-50" : "text-amber-500 bg-amber-50",
      title: `${a.customerName} — ${a.type}`,
      detail: `${a.simNumber} | ${a.network}`,
      time: a.createdAt,
    })).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6);
  }, [activations]);

  const dsoPerformers = useMemo(() => {
    return dsos.map((d) => {
      const dsoActivations = activations.filter((a) => a.dsoId === d.id).length;
      const pct = d.target > 0 ? Math.round((dsoActivations / d.target) * 100) : 0;
      return { ...d, activations: dsoActivations, progress: pct };
    }).sort((a, b) => b.progress - a.progress).slice(0, 5);
  }, [dsos, activations]);

  const filteredActivations = useMemo(() => {
    if (!searchQuery) return activations;
    const q = searchQuery.toLowerCase();
    return activations.filter((a) =>
      a.customerName.toLowerCase().includes(q) ||
      a.simNumber.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.network.toLowerCase().includes(q)
    );
  }, [activations, searchQuery]);

  const activeDsoCount = dsos.filter((d) => d.status === "Active" || d.status === "Excellent" || d.status === "Good").length;
  const pendingActivations = activations.filter((a) => a.status !== "Completed").slice(0, 5);
  const unreadNotifs = notifications.filter((n) => !n.read);
  const topPerformer = [...dsos].sort((a, b) => b.monthlySales - a.monthlySales)[0];

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      "New SIM": "bg-blue-50 text-blue-700", "MNP": "bg-purple-50 text-purple-700",
      "Replacement": "bg-orange-50 text-orange-700", "BYN": "bg-teal-50 text-teal-700",
    };
    return styles[type] || "bg-gray-50 text-gray-600";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Completed": "bg-green-50 text-green-700", "Pending BVS": "bg-amber-50 text-amber-700",
      "Pending FCA": "bg-blue-50 text-blue-700", "Pending IFCA": "bg-purple-50 text-purple-700",
    };
    return styles[status] || "bg-gray-50 text-gray-600";
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center"><RefreshCw size={32} className="animate-spin text-[#0057FF] mx-auto mb-4" /><p className="text-gray-500">Loading dashboard...</p></div>
      </div>
    );
  }

  const primaryStats = [
    { label: "Today's Activations", value: metrics.todayActs, icon: Activity, color: "from-blue-500 to-blue-600", light: "bg-blue-50", trend: metrics.todayActs > 0 ? `+${metrics.todayActs}` : "0", up: metrics.todayActs > 0 },
    { label: "Pending Verifications", value: metrics.pendingTotal, icon: Clock, color: "from-amber-500 to-amber-600", light: "bg-amber-50", trend: `${metrics.pendingTotal}`, up: metrics.pendingTotal === 0 },
    { label: "Completed Today", value: metrics.completedToday, icon: CheckCircle, color: "from-emerald-500 to-emerald-600", light: "bg-emerald-50", trend: `+${metrics.completedToday}`, up: metrics.completedToday > 0 },
    { label: "Wallet", value: `PKR ${walletInfo.balance.toLocaleString()}`, icon: Wallet, color: "from-purple-500 to-purple-600", light: "bg-purple-50", trend: `+${walletInfo.count} txns`, up: true },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Activate Popup Modal ───────────────────────── */}
      {showActivatePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowActivatePopup(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">Select Activation Type</h3>
              <button onClick={() => setShowActivatePopup(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              {[
                { label: "New SIM Activation", href: "/dsm/activation", icon: Plus, color: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" },
                { label: "MNP Process", href: "/dsm/mnp", icon: ArrowRightLeft, color: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200" },
                { label: "SIM Replacement", href: "/dsm/replacement", icon: Repeat, color: "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200" },
                { label: "BYN Registration", href: "/dsm/byn", icon: Hash, color: "bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-200" },
              ].map((item) => (
                <button key={item.label} onClick={() => { setShowActivatePopup(false); router.push(item.href); }}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all ${item.color}`}>
                  <item.icon size={24} />
                  <span className="text-xs font-bold text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Greeting Header ──────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0057FF] via-[#0047CC] to-[#003DA5] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Home size={14} className="text-white/60" />
                  <span className="text-white/60 text-xs font-medium uppercase tracking-wider">DSM Dashboard</span>
                </div>
                <h1 className="text-2xl font-black">Welcome back, {dsmName}!</h1>
                <p className="text-white/70 text-sm mt-1">
                  {settings.franchiseName || "THE SMART ERP"} | {todayDate} | ID: {dsmId}
                </p>
              </div>
              <button onClick={() => setShowActivatePopup(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#C8A951] text-[#0A2647] rounded-xl font-bold text-sm hover:bg-[#d4b55e] transition-all shadow-lg">
                <Plus size={16} /> Activate
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push("/dsm/guideline")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">
                <BookOpen size={16} /> Guide
              </button>
              <button onClick={() => router.push("/dsm/notifications")}
                className="relative p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                <Bell size={18} />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { key: "overview" as const, label: "Overview", icon: Home },
          { key: "performance" as const, label: "Performance", icon: Target },
          { key: "finance" as const, label: "Finance", icon: Wallet },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key ? "bg-white text-[#0057FF] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {activeTab === "overview" && (
        <>
          {/* ─── Stats ───────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryStats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${s.light} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <s.icon size={20} className={s.color.split(" ")[0].replace("from-", "text-")} />
                  </div>
                  {s.trend && (
                    <span className={`flex items-center gap-0.5 text-xs font-bold ${s.up ? "text-green-600" : "text-red-600"}`}>
                      {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.trend}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ─── Secondary Stats ──────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Pending BVS", value: metrics.pendingBVS, icon: Shield, color: "text-amber-600", light: "bg-amber-50" },
              { label: "Pending FCA", value: metrics.pendingFCA, icon: FileText, color: "text-blue-600", light: "bg-blue-50" },
              { label: "Pending IFCA", value: metrics.pendingIFCA, icon: AlertTriangle, color: "text-purple-600", light: "bg-purple-50" },
              { label: "Total Completed", value: metrics.totalCompleted, icon: CheckCircle2, color: "text-green-600", light: "bg-green-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center`}>
                    <s.icon size={18} className={s.color} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900">{s.value}</p>
                    <p className="text-gray-500 text-[11px]">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Quick Actions + Search ───────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                <Zap size={16} className="text-[#C8A951]" /> Quick Actions
              </h3>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 max-w-xs">
                <Search size={14} className="text-gray-400" />
                <input placeholder="Search activations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 p-0 text-xs focus:outline-none w-full text-gray-700 placeholder:text-gray-400" />
                {searchQuery && <X size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchQuery("")} />}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "New SIM", href: "/dsm/activation", icon: Plus, color: "bg-blue-50 text-blue-600" },
                { label: "MNP", href: "/dsm/mnp", icon: ArrowRightLeft, color: "bg-purple-50 text-purple-600" },
                { label: "Replacement", href: "/dsm/replacement", icon: Repeat, color: "bg-orange-50 text-orange-600" },
                { label: "BYN", href: "/dsm/byn", icon: Hash, color: "bg-teal-50 text-teal-600" },
              ].map((a) => (
                <Link key={a.label} href={a.href}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${a.color} hover:scale-105 transition-all`}>
                  <a.icon size={20} />
                  <span className="text-[11px] font-bold">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Main Content Grid ────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Verification Pipeline */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <Shield size={16} className="text-[#0057FF]" /> Verification Pipeline
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "BVS Pending", count: metrics.pendingBVS, color: "bg-amber-50 text-amber-700 border-amber-200", href: "/dsm/pending-bvs" },
                      { label: "FCA Pending", count: metrics.pendingFCA, color: "bg-blue-50 text-blue-700 border-blue-200", href: "/dsm/pending-fca" },
                      { label: "IFCA Pending", count: metrics.pendingIFCA, color: "bg-purple-50 text-purple-700 border-purple-200", href: "/dsm/pending-ifca" },
                      { label: "Completed Today", count: metrics.completedToday, color: "bg-green-50 text-green-700 border-green-200", href: "" },
                    ].map((step, i) => (
                      <div key={step.label} className="flex items-center gap-2">
                        {step.href ? (
                          <Link href={step.href} className={`flex-1 ${step.color} rounded-xl p-4 border hover:scale-[1.03] transition-all group`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider">{step.label}</span>
                              <ChevronRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="text-gray-900 text-3xl font-black">{step.count}</p>
                          </Link>
                        ) : (
                          <div className={`flex-1 ${step.color} rounded-xl p-4 border`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider">{step.label}</span>
                            </div>
                            <p className="text-gray-900 text-3xl font-black">{step.count}</p>
                          </div>
                        )}
                        {i < 3 && <div className="hidden lg:flex items-center text-gray-300"><ArrowRight size={16} /></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activations with Search */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <Activity size={16} className="text-[#0057FF]" /> Recent Activations
                  </h3>
                  <span className="text-xs text-gray-400">{filteredActivations.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase hidden md:table-cell">SIM</th>
                        <th className="px-4 py-3 text-center text-gray-500 text-xs font-medium uppercase">Progress</th>
                        <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivations.slice(0, 6).map((a) => (
                        <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getTypeBadge(a.type)}`}>{a.type}</span></td>
                          <td className="px-4 py-3 font-medium text-gray-900">{a.customerName}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs font-mono">{a.simNumber}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-blue-500" : a.progress >= 33 ? "bg-amber-500" : "bg-gray-300"}`} style={{ width: `${a.progress}%` }} />
                              </div>
                              <span className="text-xs font-bold text-gray-600 w-8 text-right">{a.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                          <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{formatDateDDMMYYYY(a.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <BarChart3 size={16} className="text-[#0057FF]" /> Recent Activity
                  </h3>
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
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Target Gauges */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <Target size={16} className="text-[#0057FF]" /> Target Achievement
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Monthly", achieved: totalMonthlyAchieved, target: totalMonthlyTarget, color: "#0057FF" },
                      { label: "New SIMs", achieved: totalNewSimAchieved, target: totalNewSimTarget, color: "#22C55E" },
                      { label: "Team Sales", achieved: totalSales, target: dsos.length * 300 || 1, color: "#F59E0B" },
                      { label: "Active DSOs", achieved: activeDsoCount, target: dsos.length || 1, color: "#8B5CF6" },
                    ].map((g) => {
                      const pct = safePct(g.achieved, g.target);
                      const circ = 2 * Math.PI * 36;
                      const off = circ - (pct / 100) * circ;
                      return (
                        <div key={g.label} className="flex flex-col items-center">
                          <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                              <circle cx="40" cy="40" r="36" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                              <circle cx="40" cy="40" r="36" fill="none" stroke={g.color} strokeWidth="6"
                                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} className="transition-all duration-1000" />
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

              {/* Performance Bars */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#0057FF]" /> Performance Overview
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-[#0057FF]">{targetProgress}%</p>
                    <p className="text-gray-400 text-xs">Monthly Progress</p>
                  </div>
                  {[
                    { label: "Monthly Target", achieved: totalMonthlyAchieved, target: totalMonthlyTarget, color: "bg-blue-500" },
                    { label: "New SIMs", achieved: totalNewSimAchieved, target: totalNewSimTarget, color: "bg-green-500" },
                    { label: "Team Sales", achieved: totalSales, target: dsos.length * 300 || 1, color: "bg-amber-500" },
                  ].map((t) => {
                    const pct = safePct(t.achieved, t.target);
                    return (
                      <div key={t.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500 font-medium">{t.label}</span>
                          <span className="font-bold text-gray-700">{t.achieved}/{t.target}</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${t.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DSO Performance Rankings */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <BarChart3 size={16} className="text-[#0057FF]" /> DSO Rankings
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {dsoPerformers.slice(0, 5).map((d, i) => (
                    <div key={d.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${i === 0 ? "bg-amber-50 border border-amber-200" : "hover:bg-gray-50"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-gray-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-bold truncate">{d.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${d.progress >= 80 ? "bg-gradient-to-r from-green-400 to-green-600" : d.progress >= 50 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : "bg-gradient-to-r from-red-400 to-red-600"}`} style={{ width: `${Math.min(100, d.progress)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-12 text-right">{d.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 text-sm font-bold">{d.activations}/{d.target}</p>
                        <p className="text-gray-400 text-[10px]">SIMs</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <Bell size={16} className="text-[#0057FF]" /> Notifications
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.read ? "bg-gray-50" : "bg-blue-50/50"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === "warning" ? "bg-amber-100 text-amber-600" : n.type === "success" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                        {n.type === "warning" ? <AlertTriangle size={14} /> : n.type === "success" ? <CheckCircle size={14} /> : <Clock size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-xs font-bold truncate">{n.title}</p>
                        <p className="text-gray-400 text-[10px] truncate">{n.message}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No notifications</p>}
                </div>
              </div>

              {/* SIM Stock */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                    <Package size={16} className="text-[#0057FF]" /> My SIM Stock
                  </h3>
                  <Link href="/dsm/sim-stock" className="text-[10px] text-[#0057FF] font-bold hover:underline">View All</Link>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-blue-600">{simStock.total}</p>
                      <p className="text-gray-500 text-[10px]">Total</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-emerald-600">{simStock.new}</p>
                      <p className="text-gray-500 text-[10px]">New</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-purple-600">{simStock.hlr}</p>
                      <p className="text-gray-500 text-[10px]">HLR</p>
                    </div>
                  </div>
                  {sims.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {sims.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                          <div className="flex items-center gap-2 min-w-0">
                            <Smartphone size={14} className="text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{s.id}</p>
                              <p className="text-[10px] text-gray-400">{s.network} · {s.simNumber}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">{s.type === "new" ? "New" : "HLR"}</span>
                        </div>
                      ))}
                      {simStock.networkCounts && Object.keys(simStock.networkCounts).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                          {Object.entries(simStock.networkCounts).map(([net, cnt]) => (
                            <span key={net} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{net}: {cnt}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs text-center py-4">No SIMs issued yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════ PERFORMANCE TAB ═══════════ */}
      {activeTab === "performance" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Overall Progress", value: `${targetProgress}%`, icon: Target, color: "text-[#0057FF]", light: "bg-blue-50" },
              { label: "Total Activations", value: activations.length, icon: Activity, color: "text-blue-600", light: "bg-blue-50" },
              { label: "Completed", value: metrics.totalCompleted, icon: CheckCircle2, color: "text-green-600", light: "bg-green-50" },
              { label: "Pending", value: metrics.pendingTotal, icon: Clock, color: "text-amber-600", light: "bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center mb-3`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                <BarChart3 size={16} className="text-[#0057FF]" /> All Activations
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{filteredActivations.length} records</span>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <Search size={12} className="text-gray-400" />
                  <input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 p-0 text-xs focus:outline-none w-24 text-gray-700 placeholder:text-gray-400" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Network</th>
                    <th className="px-4 py-3 text-center text-gray-500 text-xs font-medium uppercase">Progress</th>
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivations.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">{a.id}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getTypeBadge(a.type)}`}>{a.type}</span></td>
                      <td className="px-4 py-3 font-medium text-gray-900">{a.customerName}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-sm">{a.network}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-blue-500" : a.progress >= 33 ? "bg-amber-500" : "bg-gray-300"}`} style={{ width: `${a.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-8 text-right">{a.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">{formatDateDDMMYYYY(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════ FINANCE TAB ═══════════ */}
      {activeTab === "finance" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Wallet Balance", value: `PKR ${walletInfo.balance.toLocaleString()}`, icon: Wallet, color: "text-green-600", light: "bg-green-50" },
              { label: "Total Credits", value: `PKR ${walletInfo.totalCredits.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", light: "bg-green-50" },
              { label: "Total Debits", value: `PKR ${walletInfo.totalDebits.toLocaleString()}`, icon: TrendingDown, color: "text-red-600", light: "bg-red-50" },
              { label: "Transactions", value: walletInfo.count, icon: CreditCard, color: "text-blue-600", light: "bg-blue-50" },
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

          {/* Salary Detail Link */}
          <Link href="/dsm/salary-detail"
            className="block bg-gradient-to-r from-[#0057FF] to-[#003DA5] rounded-2xl p-5 text-white hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign size={22} className="text-[#C8A951]" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Salary Detail</h3>
                  <p className="text-white/60 text-xs mt-0.5">View month-wise salary breakdown &amp; download payslips</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/40 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {salarySummary && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                  <DollarSign size={16} className="text-[#0057FF]" /> My Salary Summary
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-gray-500 text-xs font-bold uppercase mb-3">Earnings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Basic Salary</span><span className="font-bold text-gray-900">PKR {mySalary.salary.toLocaleString()}</span></div>
                      {mySalary.fuelAllowance > 0 && <div className="flex justify-between"><span className="text-gray-500">Fuel Allowance</span><span>PKR {mySalary.fuelAllowance.toLocaleString()}</span></div>}
                      {mySalary.mobileAllowance > 0 && <div className="flex justify-between"><span className="text-gray-500">Mobile Allowance</span><span>PKR {mySalary.mobileAllowance.toLocaleString()}</span></div>}
                      {mySalary.dailyAllowance > 0 && <div className="flex justify-between"><span className="text-gray-500">Daily Allowance</span><span>PKR {mySalary.dailyAllowance.toLocaleString()}</span></div>}
                      {mySalary.residenceAllowance > 0 && <div className="flex justify-between"><span className="text-gray-500">Residence Allowance</span><span>PKR {mySalary.residenceAllowance.toLocaleString()}</span></div>}
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-gray-900"><span>Total Allowances</span><span>PKR {salarySummary.totalAllow.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-500 text-xs font-bold uppercase mb-3">Commission Rates</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">New SIM</span><span className="font-medium text-green-600">Rs.{mySalary.newSimCommission}/activation</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">MNP</span><span className="font-medium text-green-600">Rs.{mySalary.mnpCommission}/transfer</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Replacement</span><span className="font-medium text-green-600">Rs.{mySalary.replacementCommission}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">BYN</span><span className="font-medium text-green-600">Rs.{mySalary.bynCommission}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Hike Commission</span><span className="font-medium text-green-600">Rs.{mySalary.hikeCommission}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Other Commission</span><span className="font-medium text-green-600">Rs.{mySalary.otherCommission}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-500 text-xs font-bold uppercase mb-3">Bonuses & Deductions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Target Bonus</span><span className="font-medium text-blue-600">PKR {mySalary.targetBonus.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Performance Bonus</span><span className="font-medium text-blue-600">PKR {mySalary.bonus.toLocaleString()}</span></div>
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <div className="flex justify-between text-red-500"><span>Advance Salary</span><span>-PKR {mySalary.advanceSalary.toLocaleString()}</span></div>
                        <div className="flex justify-between text-red-500"><span>Loan Deduction</span><span>-PKR {mySalary.loanDeduction.toLocaleString()}</span></div>
                        <div className="flex justify-between text-red-500"><span>Other Deduction</span><span>-PKR {mySalary.otherDeduction.toLocaleString()}</span></div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gradient-to-r from-[#0057FF] to-[#003DA5] rounded-xl text-white flex items-center justify-between">
                      <span className="text-sm font-semibold">Net Payable</span>
                      <span className="text-lg font-black">PKR {salarySummary.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
                <Wallet size={16} className="text-[#0057FF]" /> Wallet Transactions
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {wallet.slice(0, 10).map((w) => (
                <div key={w.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{w.note || w.type}</p>
                    <p className="text-gray-400 text-xs">{formatDateDDMMYYYY(w.date)}</p>
                  </div>
                  <span className={`text-sm font-bold ${w.type === "Credit" ? "text-green-600" : "text-red-600"}`}>
                    {w.type === "Credit" ? "+" : "-"}PKR {w.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {wallet.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No transactions recorded</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
