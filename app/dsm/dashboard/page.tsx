"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDSMData } from "@/lib/DSMDataContext";
import {
  Plus, ArrowRightLeft, Repeat, Hash, Wallet, Target, TrendingUp,
  TrendingDown, CheckCircle, Clock, AlertTriangle, Smartphone, Bell,
  ChevronRight, ArrowRight, Shield, CreditCard, Activity, Zap,
  BarChart3, Home, Package, DollarSign, RefreshCw,
  CheckCircle2, FileText, BookOpen, X
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoadById } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";

export default function DSMDashboardPage() {
  const { activations, dsos, targets, wallet, notifications, settings, auth, hydrated, totalSales, sims } = useDSMData();
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
  const unreadNotifs = notifications.filter((n) => !n.read);

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
        <div className="text-center"><RefreshCw className="animate-spin h-8 w-8 text-brand-600 mx-auto mb-4" /><p className="text-muted-foreground">Loading dashboard...</p></div>
      </div>
    );
  }

  const primaryStats = [
    { label: "Today's Activations", value: metrics.todayActs, icon: Activity, iconClass: "bg-blue-50 text-blue-600", trend: `+${metrics.todayActs}`, trendUp: metrics.todayActs > 0 },
    { label: "Pending Verifications", value: metrics.pendingTotal, icon: Clock, iconClass: "bg-amber-50 text-amber-600", trend: `${metrics.pendingTotal}`, trendUp: metrics.pendingTotal === 0 },
    { label: "Completed Today", value: metrics.completedToday, icon: CheckCircle, iconClass: "bg-emerald-50 text-emerald-600", trend: `+${metrics.completedToday}`, trendUp: metrics.completedToday > 0 },
    { label: "Wallet", value: `PKR ${walletInfo.balance.toLocaleString()}`, icon: Wallet, iconClass: "bg-purple-50 text-purple-600", trend: `+${walletInfo.count} txns`, trendUp: true },
  ];

  return (
    <div className="space-y-6">
      {showActivatePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowActivatePopup(false)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-black text-foreground">Select Activation Type</h3>
              <button onClick={() => setShowActivatePopup(false)} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
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

      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Dashboard" }]}
        title={`Welcome back, ${dsmName}!`}
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>{settings.franchiseName || "THE SMART ERP"}</span>
            <span aria-hidden="true">|</span>
            <span>{todayDate}</span>
            <span aria-hidden="true">|</span>
            <span>ID: {dsmId}</span>
          </span>
        }
        actions={
          <>
            <button onClick={() => setShowActivatePopup(true)}
              className="flex items-center gap-2 rounded-lg bg-[#C8A951] px-4 py-2 text-sm font-bold text-[#0A2647] shadow-sm transition-colors hover:bg-[#d4b55e]">
              <Plus className="h-4 w-4" /> Activate
            </button>
            <Button variant="outline" onClick={() => router.push("/dsm/guideline")}>
              <BookOpen className="h-4 w-4" /> Guide
            </Button>
            <button
              onClick={() => router.push("/dsm/notifications")}
              className="relative rounded-lg border border-slate-200 bg-white p-2 text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadNotifs.length}
                </span>
              )}
            </button>
          </>
        }
      />

      <Card>
        <div className="flex gap-1 p-1">
          {[
            { key: "overview" as const, label: "Overview", icon: Home },
            { key: "performance" as const, label: "Performance", icon: Target },
            { key: "finance" as const, label: "Finance", icon: Wallet },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${activeTab === tab.key ? "bg-brand-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryStats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconClass={s.iconClass} trend={s.trend} trendUp={s.trendUp} />
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Pending BVS" value={metrics.pendingBVS} icon={Shield} iconClass="bg-amber-50 text-amber-600" />
            <StatCard label="Pending FCA" value={metrics.pendingFCA} icon={FileText} iconClass="bg-blue-50 text-blue-600" />
            <StatCard label="Pending IFCA" value={metrics.pendingIFCA} icon={AlertTriangle} iconClass="bg-purple-50 text-purple-600" />
            <StatCard label="Total Completed" value={metrics.totalCompleted} icon={CheckCircle2} iconClass="bg-green-50 text-green-600" />
          </div>

          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Zap className="h-4 w-4 text-[#C8A951]" /> Quick Actions
              </h3>
              <SearchInput placeholder="Search activations..." value={searchQuery} onSearch={setSearchQuery} className="max-w-xs" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 pt-0">
              {[
                { label: "New SIM", href: "/dsm/activation", icon: Plus, color: "bg-blue-50 text-blue-600" },
                { label: "MNP", href: "/dsm/mnp", icon: ArrowRightLeft, color: "bg-purple-50 text-purple-600" },
                { label: "Replacement", href: "/dsm/replacement", icon: Repeat, color: "bg-orange-50 text-orange-600" },
                { label: "BYN", href: "/dsm/byn", icon: Hash, color: "bg-teal-50 text-teal-600" },
              ].map((a) => (
                <Link key={a.label} href={a.href}
                  className={`flex flex-col items-center gap-2 rounded-xl p-3 ${a.color} transition-transform hover:scale-105`}>
                  <a.icon className="h-5 w-5" />
                  <span className="text-[11px] font-bold">{a.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Shield className="h-4 w-4 text-brand-600" /> Verification Pipeline
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      { label: "BVS Pending", count: metrics.pendingBVS, color: "bg-amber-50 text-amber-700 border-amber-200", href: "/dsm/pending-bvs" },
                      { label: "FCA Pending", count: metrics.pendingFCA, color: "bg-blue-50 text-blue-700 border-blue-200", href: "/dsm/pending-fca" },
                      { label: "IFCA Pending", count: metrics.pendingIFCA, color: "bg-purple-50 text-purple-700 border-purple-200", href: "/dsm/pending-ifca" },
                      { label: "Completed Today", count: metrics.completedToday, color: "bg-green-50 text-green-700 border-green-200", href: "" },
                    ].map((step, i) => (
                      <div key={step.label} className="flex items-center gap-2">
                        {step.href ? (
                          <Link href={step.href} className={`flex-1 ${step.color} rounded-xl border p-4 transition-all hover:scale-[1.03] group`}>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider">{step.label}</span>
                              <ChevronRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-1" />
                            </div>
                            <p className="text-3xl font-black text-foreground">{step.count}</p>
                          </Link>
                        ) : (
                          <div className={`flex-1 ${step.color} rounded-xl border p-4`}>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider">{step.label}</span>
                            </div>
                            <p className="text-3xl font-black text-foreground">{step.count}</p>
                          </div>
                        )}
                        {i < 3 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 lg:flex" />}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Activity className="h-4 w-4 text-brand-600" /> Recent Activations
                  </h3>
                  <span className="text-xs text-muted-foreground">{filteredActivations.length} records</span>
                </div>
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredActivations.slice(0, 6).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${getTypeBadge(a.type)}`}>{a.type}</span>
                          <span className="truncate font-mono text-[10px] text-muted-foreground">{a.simNumber}</span>
                        </div>
                        <p className="truncate text-sm font-medium text-foreground mt-1">{a.customerName}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 max-w-[130px] flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-blue-500" : a.progress >= 33 ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${a.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600">{a.progress}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <StatusPill label={a.status} tone={toneForStatus(a.status)} />
                        <span className="text-[10px] text-muted-foreground">{formatDateDDMMYYYY(a.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  {filteredActivations.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No activations found</p>}
                </div>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">SIM</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Progress</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivations.slice(0, 6).map((a) => (
                        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3"><span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${getTypeBadge(a.type)}`}>{a.type}</span></td>
                          <td className="px-4 py-3 font-medium text-foreground">{a.customerName}</td>
                          <td className="px-4 py-3 hidden font-mono text-xs text-muted-foreground md:table-cell">{a.simNumber}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-blue-500" : a.progress >= 33 ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${a.progress}%` }} />
                              </div>
                              <span className="w-8 text-right text-xs font-bold text-slate-600">{a.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><StatusPill label={a.status} tone={toneForStatus(a.status)} /></td>
                          <td className="px-4 py-3 hidden text-xs text-muted-foreground lg:table-cell">{formatDateDDMMYYYY(a.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <BarChart3 className="h-4 w-4 text-brand-600" /> Recent Activity
                  </h3>
                </div>
                <div className="p-4">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-slate-50">
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.detail}</p>
                          </div>
                          <span className="whitespace-nowrap text-[10px] text-muted-foreground">{formatDateDDMMYYYY(item.time)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Target className="h-4 w-4 text-brand-600" /> Target Achievement
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
                          <div className="relative h-20 w-20">
                            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                              <circle cx="40" cy="40" r="36" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                              <circle cx="40" cy="40" r="36" fill="none" stroke={g.color} strokeWidth="6"
                                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-black text-foreground">{pct}%</span>
                            </div>
                          </div>
                          <p className="mt-2 text-xs font-bold text-slate-600">{g.label}</p>
                          <p className="text-[10px] text-muted-foreground">{g.achieved}/{g.target}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <TrendingUp className="h-4 w-4 text-brand-600" /> Performance Overview
                  </h3>
                </div>
                <div className="space-y-4 p-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-brand-600">{targetProgress}%</p>
                    <p className="text-xs text-muted-foreground">Monthly Progress</p>
                  </div>
                  {[
                    { label: "Monthly Target", achieved: totalMonthlyAchieved, target: totalMonthlyTarget, color: "bg-blue-500" },
                    { label: "New SIMs", achieved: totalNewSimAchieved, target: totalNewSimTarget, color: "bg-green-500" },
                    { label: "Team Sales", achieved: totalSales, target: dsos.length * 300 || 1, color: "bg-amber-500" },
                  ].map((t) => {
                    const pct = safePct(t.achieved, t.target);
                    return (
                      <div key={t.label}>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">{t.label}</span>
                          <span className="font-bold text-slate-600">{t.achieved}/{t.target}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full transition-all duration-700 ${t.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <BarChart3 className="h-4 w-4 text-brand-600" /> DSO Rankings
                  </h3>
                </div>
                <div className="space-y-3 p-4">
                  {dsoPerformers.slice(0, 5).map((d, i) => (
                    <div key={d.id} className={`flex items-center gap-3 rounded-xl p-3 transition-all ${i === 0 ? "border border-amber-200 bg-amber-50" : "hover:bg-slate-50"}`}>
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-muted-foreground"}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{d.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${d.progress >= 80 ? "bg-gradient-to-r from-green-400 to-green-600" : d.progress >= 50 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : "bg-gradient-to-r from-red-400 to-red-600"}`} style={{ width: `${Math.min(100, d.progress)}%` }} />
                          </div>
                          <span className="w-12 text-right text-xs font-bold text-slate-600">{d.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{d.activations}/{d.target}</p>
                        <p className="text-[10px] text-muted-foreground">SIMs</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Bell className="h-4 w-4 text-brand-600" /> Notifications
                  </h3>
                </div>
                <div className="space-y-3 p-4">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 rounded-xl p-3 ${n.read ? "bg-slate-50" : "bg-blue-50/50"}`}>
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${n.type === "warning" ? "bg-amber-100 text-amber-600" : n.type === "success" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                        {n.type === "warning" ? <AlertTriangle className="h-3.5 w-3.5" /> : n.type === "success" ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground">{n.title}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{n.message}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No notifications</p>}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Package className="h-4 w-4 text-brand-600" /> My SIM Stock
                  </h3>
                  <Link href="/dsm/sim-stock" className="text-[10px] font-bold text-brand-600 hover:underline">View All</Link>
                </div>
                <div className="p-4">
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-blue-50 p-3 text-center">
                      <p className="text-lg font-black text-blue-600">{simStock.total}</p>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3 text-center">
                      <p className="text-lg font-black text-emerald-600">{simStock.new}</p>
                      <p className="text-[10px] text-muted-foreground">New</p>
                    </div>
                    <div className="rounded-xl bg-purple-50 p-3 text-center">
                      <p className="text-lg font-black text-purple-600">{simStock.hlr}</p>
                      <p className="text-[10px] text-muted-foreground">HLR</p>
                    </div>
                  </div>
                  {sims.length > 0 ? (
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {sims.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <Smartphone className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-foreground">{s.id}</p>
                              <p className="text-[10px] text-muted-foreground">{s.network} · {s.simNumber}</p>
                            </div>
                          </div>
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{s.type === "new" ? "New" : "HLR"}</span>
                        </div>
                      ))}
                      {simStock.networkCounts && Object.keys(simStock.networkCounts).length > 0 && (
                        <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2">
                          {Object.entries(simStock.networkCounts).map(([net, cnt]) => (
                            <span key={net} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{net}: {cnt}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-xs text-muted-foreground">No SIMs issued yet</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {activeTab === "performance" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Overall Progress" value={`${targetProgress}%`} icon={Target} iconClass="bg-brand-50 text-brand-600" />
            <StatCard label="Total Activations" value={activations.length} icon={Activity} iconClass="bg-blue-50 text-blue-600" />
            <StatCard label="Completed" value={metrics.totalCompleted} icon={CheckCircle2} iconClass="bg-green-50 text-green-600" />
            <StatCard label="Pending" value={metrics.pendingTotal} icon={Clock} iconClass="bg-amber-50 text-amber-600" />
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <BarChart3 className="h-4 w-4 text-brand-600" /> All Activations
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{filteredActivations.length} records</span>
                <SearchInput placeholder="Search..." value={searchQuery} onSearch={setSearchQuery} className="max-w-[220px]" />
              </div>
            </div>
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredActivations.map((a) => (
                <div key={a.id} className="px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{a.id}</span>
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${getTypeBadge(a.type)}`}>{a.type}</span>
                    </div>
                    <StatusPill label={a.status} tone={toneForStatus(a.status)} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{a.customerName}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{a.network} | {a.simNumber}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-blue-500" : a.progress >= 33 ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${a.progress}%` }} />
                      </div>
                      <span className="w-7 text-right text-[10px] font-bold text-slate-600">{a.progress}%</span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">{formatDateDDMMYYYY(a.createdAt)}</p>
                </div>
              ))}
              {filteredActivations.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No activations found</p>}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">Network</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivations.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                      <td className="px-4 py-3"><span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${getTypeBadge(a.type)}`}>{a.type}</span></td>
                      <td className="px-4 py-3 font-medium text-foreground">{a.customerName}</td>
                      <td className="px-4 py-3 hidden text-sm text-muted-foreground md:table-cell">{a.network}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-blue-500" : a.progress >= 33 ? "bg-amber-500" : "bg-slate-300"}`} style={{ width: `${a.progress}%` }} />
                          </div>
                          <span className="w-8 text-right text-xs font-bold text-slate-600">{a.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusPill label={a.status} tone={toneForStatus(a.status)} /></td>
                      <td className="px-4 py-3 hidden text-xs text-muted-foreground lg:table-cell">{formatDateDDMMYYYY(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === "finance" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Wallet Balance" value={`PKR ${walletInfo.balance.toLocaleString()}`} icon={Wallet} iconClass="bg-green-50 text-green-600" />
            <StatCard label="Total Credits" value={`PKR ${walletInfo.totalCredits.toLocaleString()}`} icon={TrendingUp} iconClass="bg-green-50 text-green-600" />
            <StatCard label="Total Debits" value={`PKR ${walletInfo.totalDebits.toLocaleString()}`} icon={TrendingDown} iconClass="bg-red-50 text-red-600" />
            <StatCard label="Transactions" value={walletInfo.count} icon={CreditCard} iconClass="bg-blue-50 text-blue-600" />
          </div>

          <Link href="/dsm/salary-detail"
            className="group block rounded-xl bg-gradient-to-r from-brand-600 to-[#003DA5] p-5 text-white transition-all hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition-transform group-hover:scale-110">
                  <DollarSign className="h-6 w-6 text-[#C8A951]" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Salary Detail</h3>
                  <p className="mt-0.5 text-xs text-white/60">View month-wise salary breakdown &amp; download payslips</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {salarySummary && (
            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <DollarSign className="h-4 w-4 text-brand-600" /> My Salary Summary
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Earnings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Basic Salary</span><span className="font-bold text-foreground">PKR {mySalary.salary.toLocaleString()}</span></div>
                      {mySalary.fuelAllowance > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Fuel Allowance</span><span>PKR {mySalary.fuelAllowance.toLocaleString()}</span></div>}
                      {mySalary.mobileAllowance > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Mobile Allowance</span><span>PKR {mySalary.mobileAllowance.toLocaleString()}</span></div>}
                      {mySalary.dailyAllowance > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Daily Allowance</span><span>PKR {mySalary.dailyAllowance.toLocaleString()}</span></div>}
                      {mySalary.residenceAllowance > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Residence Allowance</span><span>PKR {mySalary.residenceAllowance.toLocaleString()}</span></div>}
                      <div className="mt-2 border-t border-slate-100 pt-2">
                        <div className="flex justify-between font-bold text-foreground"><span>Total Allowances</span><span>PKR {salarySummary.totalAllow.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Commission Rates</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">New SIM</span><span className="font-medium text-green-600">Rs.{mySalary.newSimCommission}/activation</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">MNP</span><span className="font-medium text-green-600">Rs.{mySalary.mnpCommission}/transfer</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Replacement</span><span className="font-medium text-green-600">Rs.{mySalary.replacementCommission}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">BYN</span><span className="font-medium text-green-600">Rs.{mySalary.bynCommission}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Hike Commission</span><span className="font-medium text-green-600">Rs.{mySalary.hikeCommission}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Other Commission</span><span className="font-medium text-green-600">Rs.{mySalary.otherCommission}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Bonuses & Deductions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Target Bonus</span><span className="font-medium text-blue-600">PKR {mySalary.targetBonus.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Performance Bonus</span><span className="font-medium text-blue-600">PKR {mySalary.bonus.toLocaleString()}</span></div>
                      <div className="mt-2 border-t border-slate-100 pt-2">
                        <div className="flex justify-between text-red-500"><span>Advance Salary</span><span>-PKR {mySalary.advanceSalary.toLocaleString()}</span></div>
                        <div className="flex justify-between text-red-500"><span>Loan Deduction</span><span>-PKR {mySalary.loanDeduction.toLocaleString()}</span></div>
                        <div className="flex justify-between text-red-500"><span>Other Deduction</span><span>-PKR {mySalary.otherDeduction.toLocaleString()}</span></div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-[#003DA5] p-3 text-white">
                      <span className="text-sm font-semibold">Net Payable</span>
                      <span className="whitespace-nowrap text-lg font-black">PKR {salarySummary.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Wallet className="h-4 w-4 text-brand-600" /> Wallet Transactions
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {wallet.slice(0, 10).map((w) => (
                <div key={w.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.note || w.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDateDDMMYYYY(w.date)}</p>
                  </div>
                  <span className={`text-sm font-bold ${w.type === "Credit" ? "text-green-600" : "text-red-600"}`}>
                    {w.type === "Credit" ? "+" : "-"}PKR {w.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {wallet.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No transactions recorded</p>}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}