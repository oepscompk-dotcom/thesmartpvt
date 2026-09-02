"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDSOData } from "@/lib/DSODataContext";
import {
  Plus, ArrowRightLeft, Repeat, Hash, Wallet, Target, TrendingUp,
  TrendingDown, Fingerprint, PhoneCall, Wifi, CheckCircle, Clock,
  AlertTriangle, ClipboardCheck, Smartphone, Bell, ChevronRight, ArrowRight,
  Shield, UserCheck, CreditCard, Activity, Zap,
  BarChart3, Home, DollarSign, RefreshCw,
  CheckCircle2, X, BookOpen, Package
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoadById } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";

export default function DSODashboardPage() {
  const { activations, attendance, wallet, targets, device, notifications, settings, auth, hydrated, sims } = useDSOData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "finance">("overview");
  const [showActivatePopup, setShowActivatePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [mySalary, setMySalary] = useState<Record<string, number>>({});
  useEffect(() => {
    (async () => {
      try {
        const authData = await apiLoadById("franchiseData", "dso-auth");
        if (authData?.data) {
          const parsed = JSON.parse(authData.data);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const me = list.find((d: any) => d.id === auth.dsoId);
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
  }, [auth.dsoId]);

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
  const todayAttendance = attendance.find((a) => a.date === today);

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

  const targetData = useMemo(() => {
    const totalT = targets.newSIM + targets.mnp + targets.replacement + targets.byn;
    const totalA = targets.newSIMAchieved + targets.mnpAchieved + targets.replacementAchieved + targets.bynAchieved;
    return {
      total: totalT, achieved: totalA, progress: safePct(totalA, totalT),
      items: [
        { label: "New SIM", target: targets.newSIM, achieved: targets.newSIMAchieved, color: "bg-blue-500" },
        { label: "MNP", target: targets.mnp, achieved: targets.mnpAchieved, color: "bg-purple-500" },
        { label: "Replacement", target: targets.replacement, achieved: targets.replacementAchieved, color: "bg-orange-500" },
        { label: "BYN", target: targets.byn, achieved: targets.bynAchieved, color: "bg-teal-500" },
      ],
    };
  }, [targets]);

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
        <div className="text-center"><RefreshCw size={32} className="animate-spin text-[#0A2647] mx-auto mb-4" /><p className="text-gray-500">Loading dashboard...</p></div>
      </div>
    );
  }

  const primaryStats = [
    { label: "Today's Activations", value: metrics.todayActs, icon: Activity, iconClass: "text-blue-600 bg-blue-50", trend: metrics.todayActs > 0 ? `+${metrics.todayActs}` : "0", up: metrics.todayActs > 0 },
    { label: "Pending Verifications", value: metrics.pendingTotal, icon: Clock, iconClass: "text-amber-600 bg-amber-50", trend: `${metrics.pendingTotal}`, up: metrics.pendingTotal === 0 },
    { label: "Completed Today", value: metrics.completedToday, icon: CheckCircle, iconClass: "text-emerald-600 bg-emerald-50", trend: `+${metrics.completedToday}`, up: metrics.completedToday > 0 },
    { label: "Wallet", value: `PKR ${walletInfo.balance.toLocaleString()}`, icon: Wallet, iconClass: "text-purple-600 bg-purple-50", trend: `+${walletInfo.count} txns`, up: true },
  ];

  return (
    <div className="space-y-6">
      {/* â”€â”€â”€ Activate Popup Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                { label: "New SIM Activation", href: "/dso/activation", icon: Plus, color: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" },
                { label: "MNP Process", href: "/dso/mnp", icon: ArrowRightLeft, color: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200" },
                { label: "SIM Replacement", href: "/dso/replacement", icon: Repeat, color: "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200" },
                { label: "BYN Registration", href: "/dso/byn", icon: Hash, color: "bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-200" },
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

      {/* â”€â”€â”€ Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <PageHeader
        breadcrumb={[{ label: "DSO", href: "/dso" }, { label: "Dashboard" }]}
        title={`Welcome back, ${settings.dsoName || auth.dsoName || "DSO"}!`}
        description={
          <span className="flex flex-wrap gap-x-2 gap-y-0.5">
            <span className="truncate">{settings.franchiseName || "THE SMART ERP"}</span>
            <span>| {todayDate}</span>
            <span>| ID: {auth.dsoId}</span>
          </span>
        }
        actions={
          <>
            <Button onClick={() => setShowActivatePopup(true)}>
              <Plus size={16} /> Activate
            </Button>
            <Button variant="outline" onClick={() => router.push("/dso/guideline")}>
              <BookOpen size={16} /> Guide
            </Button>
            <button
              onClick={() => router.push("/dso/notifications")}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
          </>
        }
      />

      {/* â”€â”€â”€ Tab Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center gap-6 border-b border-slate-200">
        {[
          { key: "overview" as const, label: "Overview", icon: Home },
          { key: "performance" as const, label: "Performance", icon: Target },
          { key: "finance" as const, label: "Finance", icon: Wallet },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`-mb-px inline-flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-brand-600 font-semibold text-brand-700"
                : "border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground"
            }`}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â• OVERVIEW TAB â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === "overview" && (
        <>
          {/* â”€â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryStats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconClass={s.iconClass} trend={s.trend} trendUp={s.up} />
            ))}
          </div>

          {/* â”€â”€â”€ Secondary Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Pending BVS", value: metrics.pendingBVS, icon: Fingerprint, iconClass: "text-amber-600 bg-amber-50" },
              { label: "Pending FCA", value: metrics.pendingFCA, icon: PhoneCall, iconClass: "text-blue-600 bg-blue-50" },
              { label: "Pending IFCA", value: metrics.pendingIFCA, icon: Wifi, iconClass: "text-purple-600 bg-purple-50" },
              { label: "Total Completed", value: metrics.totalCompleted, icon: CheckCircle2, iconClass: "text-green-600 bg-green-50" },
            ].map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconClass={s.iconClass} />
            ))}
          </div>

          {/* â”€â”€â”€ Quick Actions + Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Card>
            <CardHeader className="flex-row items-center justify-between sm:items-center gap-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Zap size={16} className="text-brand-600" /> Quick Actions
              </h3>
              <div className="flex items-center gap-2">
                <SearchInput
                  placeholder="Search activations..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="min-w-[200px] max-w-[220px]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-muted-foreground transition-colors hover:bg-slate-50" aria-label="Clear search">
                    <X size={14} />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "New SIM", href: "/dso/activation", icon: Plus, color: "bg-blue-50 text-blue-600" },
                  { label: "MNP", href: "/dso/mnp", icon: ArrowRightLeft, color: "bg-purple-50 text-purple-600" },
                  { label: "Replacement", href: "/dso/replacement", icon: Repeat, color: "bg-orange-50 text-orange-600" },
                  { label: "BYN", href: "/dso/byn", icon: Hash, color: "bg-teal-50 text-teal-600" },
                ].map((a) => (
                  <Link key={a.label} href={a.href}
                    className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${a.color}`}>
                      <a.icon size={20} />
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{a.label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* â”€â”€â”€ Main Content Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Verification Pipeline */}
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Shield size={16} className="text-brand-600" /> Verification Pipeline
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "BVS Pending", count: metrics.pendingBVS, dot: "bg-amber-500", href: "/dso/pending-bvs" },
                      { label: "FCA Pending", count: metrics.pendingFCA, dot: "bg-blue-500", href: "/dso/pending-fca" },
                      { label: "IFCA Pending", count: metrics.pendingIFCA, dot: "bg-purple-500", href: "/dso/pending-ifca" },
                      { label: "Completed Today", count: metrics.completedToday, dot: "bg-green-500", href: "" },
                    ].map((step, i) => (
                      <div key={step.label} className="flex items-center gap-2">
                        {step.href ? (
                          <Link href={step.href} className="group flex-1 rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                <span className={`h-2 w-2 rounded-full ${step.dot}`} /> {step.label}
                              </span>
                              <ChevronRight size={14} className="text-slate-300 transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{step.count}</p>
                          </Link>
                        ) : (
                          <div className="flex-1 rounded-xl border border-slate-200/80 bg-white p-4">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                <span className={`h-2 w-2 rounded-full ${step.dot}`} /> {step.label}
                              </span>
                            </div>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{step.count}</p>
                          </div>
                        )}
                        {i < 3 && <div className="hidden lg:flex items-center text-slate-300"><ArrowRight size={16} /></div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activations with Search */}
              <Card className="overflow-hidden">
                <CardHeader className="flex-row items-center justify-between sm:items-center">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Activity size={16} className="text-brand-600" /> Recent Activations
                  </h3>
                  <span className="text-sm text-muted-foreground">{filteredActivations.length} records</span>
                </CardHeader>
                <CardContent className="p-0">
                <div className="md:hidden divide-y divide-gray-50">
                  {filteredActivations.slice(0, 6).map((a) => (
                    <div key={a.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getTypeBadge(a.type)}`}>{a.type}</span>
                          <span className="text-gray-400 text-[10px] font-mono truncate">{a.simNumber}</span>
                        </div>
                        <p className="text-gray-900 text-sm font-medium truncate mt-1">{a.customerName}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 max-w-[130px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-blue-500" : a.progress >= 33 ? "bg-amber-500" : "bg-gray-300"}`} style={{ width: `${a.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{a.progress}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${getStatusBadge(a.status)}`}>{a.status}</span>
                        <span className="text-gray-400 text-[10px]">{formatDateDDMMYYYY(a.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  {filteredActivations.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No activations found</p>}
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">SIM</th>
                        <th className="px-4 py-3 text-center text-slate-500 text-xs font-semibold uppercase tracking-wider">Progress</th>
                        <th className="px-4 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-slate-500 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivations.slice(0, 6).map((a) => (
                        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
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
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 size={16} className="text-brand-600" /> Recent Activity
                  </h3>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Target Gauges */}
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Target size={16} className="text-brand-600" /> Target Achievement
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "New SIM", achieved: targets.newSIMAchieved, target: targets.newSIM, color: "#0A2647" },
                      { label: "MNP", achieved: targets.mnpAchieved, target: targets.mnp, color: "#FFFB63" },
                      { label: "Replacement", achieved: targets.replacementAchieved, target: targets.replacement, color: "#4DA8DA" },
                      { label: "BYN", achieved: targets.bynAchieved, target: targets.byn, color: "#22C55E" },
                    ].map((g) => {
                      const pct = safePct(g.achieved, g.target);
                      const circ = 2 * Math.PI * 36;
                      const off = circ - (pct / 100) * circ;
                      return (
                        <div key={g.label} className="flex flex-col items-center">
                          <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                              <circle cx="40" cy="40" r="36" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                              <circle cx="40" cy="40" r="36" fill="none" stroke={g.color} strokeWidth="5"
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
                </CardContent>
              </Card>

              {/* Performance Bars */}
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-600" /> Performance Overview
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-brand-700">{targetData.progress}%</p>
                    <p className="text-muted-foreground text-xs">Monthly Progress</p>
                  </div>
                  {targetData.items.map((t) => {
                    const pct = safePct(t.achieved, t.target);
                    return (
                      <div key={t.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-medium">{t.label}</span>
                          <span className="font-bold text-foreground">{t.achieved}/{t.target}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${t.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Attendance */}
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-brand-600" /> Today&apos;s Attendance
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-green-600">{todayAttendance?.checkIn || "--:--"}</p>
                      <p className="text-gray-500 text-[10px] font-medium">Check-In</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-red-600">{todayAttendance?.checkOut || "--:--"}</p>
                      <p className="text-gray-500 text-[10px] font-medium">Check-Out</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center justify-between ${todayAttendance?.status === "Present" ? "bg-green-50" : todayAttendance?.status === "Late" ? "bg-amber-50" : todayAttendance?.status === "Absent" ? "bg-red-50" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className={todayAttendance?.status === "Present" ? "text-green-600" : todayAttendance?.status === "Late" ? "text-amber-600" : todayAttendance?.status === "Absent" ? "text-red-600" : "text-gray-400"} />
                      <span className={`text-sm font-bold ${todayAttendance?.status === "Present" ? "text-green-600" : todayAttendance?.status === "Late" ? "text-amber-600" : todayAttendance?.status === "Absent" ? "text-red-600" : "text-gray-500"}`}>
                        {todayAttendance?.status || "Not Marked"}
                      </span>
                    </div>
                    {todayAttendance?.workingHours && <span className="text-xs text-gray-500">{todayAttendance.workingHours}h</span>}
                  </div>
                  {!todayAttendance && (
                    <Link href="/dso/attendance" className="mt-3 block">
                      <Button size="lg" className="w-full">
                        <ClipboardCheck size={16} /> Mark Attendance
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Bell size={16} className="text-brand-600" /> Notifications
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
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
                </CardContent>
              </Card>

              {/* SIM Stock */}
              <Card>
                <CardHeader className="flex-row items-center justify-between sm:items-center">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Package size={16} className="text-brand-600" /> My SIM Stock
                  </h3>
                  <Link href="/dso/sim-stock" className="text-xs text-brand-600 font-semibold hover:underline">View All</Link>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Assigned Device */}
              {device && (
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Smartphone size={16} className="text-brand-600" /> Assigned Device
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Smartphone size={18} /></span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{device.brand} {device.model}</p>
                          <p className="text-xs font-mono text-muted-foreground">{device.id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-muted-foreground text-[10px] uppercase">IMEI</p>
                        <p className="text-slate-900 font-mono">{device.imei}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-muted-foreground text-[10px] uppercase">BVS #</p>
                        <p className="text-slate-900 font-mono">{device.bvsNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â• PERFORMANCE TAB â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === "performance" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Overall Progress", value: `${targetData.progress}%`, icon: Target, iconClass: "text-brand-700 bg-brand-50" },
              { label: "Total Activations", value: activations.length, icon: Activity, iconClass: "text-blue-600 bg-blue-50" },
              { label: "Completed", value: metrics.totalCompleted, icon: CheckCircle2, iconClass: "text-green-600 bg-green-50" },
              { label: "Pending", value: metrics.pendingTotal, icon: Clock, iconClass: "text-amber-600 bg-amber-50" },
            ].map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconClass={s.iconClass} />
            ))}
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between sm:items-center gap-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <BarChart3 size={16} className="text-brand-600" /> All Activations
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{filteredActivations.length} records</span>
                <SearchInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="min-w-[160px] max-w-[220px]"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="md:hidden divide-y divide-slate-100">
                {filteredActivations.map((a) => (
                  <div key={a.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-muted-foreground text-[10px]">{a.id}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getTypeBadge(a.type)}`}>{a.type}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${getStatusBadge(a.status)}`}>{a.status}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{a.customerName}</p>
                        <p className="text-gray-400 text-[10px] truncate">{a.network} | {a.simNumber}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-blue-500" : a.progress >= 33 ? "bg-amber-500" : "bg-gray-300"}`} style={{ width: `${a.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 w-7 text-right">{a.progress}%</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-[10px] mt-1.5">{formatDateDDMMYYYY(a.createdAt)}</p>
                  </div>
                ))}
                {filteredActivations.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No activations found</p>}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Network</th>
                      <th className="px-4 py-3 text-center text-muted-foreground text-xs font-semibold uppercase tracking-wider">Progress</th>
                      <th className="px-4 py-3 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-muted-foreground text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivations.map((a) => (
                      <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{a.id}</td>
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
            </CardContent>
          </Card>
        </>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â• FINANCE TAB â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === "finance" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Wallet Balance", value: `PKR ${walletInfo.balance.toLocaleString()}`, icon: Wallet, iconClass: "text-green-600 bg-green-50" },
              { label: "Total Credits", value: `PKR ${walletInfo.totalCredits.toLocaleString()}`, icon: TrendingUp, iconClass: "text-green-600 bg-green-50" },
              { label: "Total Debits", value: `PKR ${walletInfo.totalDebits.toLocaleString()}`, icon: TrendingDown, iconClass: "text-red-600 bg-red-50" },
              { label: "Transactions", value: walletInfo.count, icon: CreditCard, iconClass: "text-blue-600 bg-blue-50" },
            ].map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconClass={s.iconClass} />
            ))}
          </div>

          {/* Salary Detail Link */}
          <Link href="/dso/salary-detail"
            className="group block rounded-xl border border-slate-200/80 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform group-hover:scale-105">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Salary Detail</h3>
                  <p className="text-xs text-muted-foreground">View month-wise salary breakdown &amp; download payslips</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          {salarySummary && (
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <DollarSign size={16} className="text-brand-600" /> My Salary Summary
                </h3>
              </CardHeader>
              <CardContent>
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
                    <div className="mt-4 p-3 rounded-xl border border-brand-100 bg-brand-50/60 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">Net Payable</span>
                      <span className="text-lg font-bold whitespace-nowrap text-brand-700">PKR {salarySummary.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
          )}

          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Wallet size={16} className="text-brand-600" /> Wallet Transactions
              </h3>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
