"use client";

import { useCompanyData, CompanyFranchiseDetail } from "@/lib/CompanyDataContext";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Users, Smartphone, DollarSign, TrendingUp, TrendingDown,
  Activity, MapPin, Package, Target, Wallet, CreditCard, BarChart3,
  Home, Bell, Shield, Zap, ChevronRight, Award, Star, PieChart,
  Wifi, Layers, Clock, UserCheck, Banknote, RefreshCw, Cpu, Filter,
  FileText, Settings, AlertTriangle, CheckCircle, XCircle, Printer, Download
} from "lucide-react";

export default function CompanyDashboardPage() {
  const { franchises, detailMap, totalSIMs, totalDevices, totalStaff, totalRevenue, todayActivations, attendanceRate, totalPayroll, totalExpenses, totalIncome, loading, refreshData, auth } = useCompanyData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "finance">("overview");

  const active = franchises.filter((f) => f.status === "Active").length;
  const pending = franchises.filter((f) => f.status === "Pending").length;
  const suspended = franchises.filter((f) => f.status === "Suspended").length;
  const totalFranchises = franchises.length;
  const profit = totalIncome - totalExpenses - totalPayroll;
  const profitMargin = totalIncome > 0 ? Math.round((profit / totalIncome) * 100) : 0;
  const totalEquipment = Object.values(detailMap).reduce((s, d) => s + d.equipmentCount, 0);
  const totalWallet = Object.values(detailMap).reduce((s, d) => s + d.walletBalance, 0);
  const totalActivationsAll = Object.values(detailMap).reduce((s, d) => s + d.totalActivations, 0);
  const totalPendingActivations = Object.values(detailMap).reduce((s, d) => s + d.pendingActivations, 0);

  const today = new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });

  const topFranchises = useMemo(() => [...franchises].sort((a, b) => b.revenue - a.revenue).slice(0, 5), [franchises]);

  const networkDist = useMemo(() => {
    const dist: Record<string, number> = {};
    Object.values(detailMap).forEach((d) => Object.entries(d.simsByNetwork).forEach(([net, c]) => { dist[net] = (dist[net] || 0) + c; }));
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  }, [detailMap]);

  const revenuePerFranchise = totalFranchises > 0 ? totalRevenue / totalFranchises : 0;
  const staffPerFranchise = totalFranchises > 0 ? totalStaff / totalFranchises : 0;
  const simsPerFranchise = totalFranchises > 0 ? totalSIMs / totalFranchises : 0;

  const totalNewSims = Object.values(detailMap).reduce((s, d) => s + d.newSims, 0);
  const totalHlrSims = Object.values(detailMap).reduce((s, d) => s + d.hlrSims, 0);

  const [companyProfile, setCompanyProfile] = useState({ companyName: "", ownerName: "", email: "", phone: "", address: "", city: "", province: "" });
  useEffect(() => {
    if (!auth.companyId) return;
    try {
      const stored = localStorage.getItem("smart-erp-companies");
      if (stored) {
        const companies = JSON.parse(stored);
        const c = companies.find((x: any) => x.id === auth.companyId);
        if (c) setCompanyProfile({ companyName: c.name || "", ownerName: c.owner || "", email: c.email || "", phone: c.mobile || "", address: c.address || "", city: c.city || "", province: c.province || "" });
      }
    } catch {}
  }, [auth.companyId]);

  useEffect(() => {
    refreshData();
    const onFocus = () => refreshData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [auth.companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Franchises", value: totalFranchises, sub: `${active} active · ${pending} pending`, icon: Building2, light: "bg-blue-50", color: "from-blue-500 to-blue-600", trend: `+${active}`, up: true },
    { label: "Total Staff", value: totalStaff, sub: `${staffPerFranchise.toFixed(1)} avg per franchise`, icon: Users, light: "bg-purple-50", color: "from-purple-500 to-purple-600", trend: `${attendanceRate}%`, up: attendanceRate >= 70 },
    { label: "SIM Inventory", value: totalSIMs, sub: `${totalNewSims} New · ${totalHlrSims} HLR`, icon: Smartphone, light: "bg-cyan-50", color: "from-cyan-500 to-cyan-600", trend: `${totalDevices} devices`, up: true },
    { label: "Total Revenue", value: `PKR ${(totalRevenue / 100000).toFixed(1)}L`, sub: `${todayActivations} activations today`, icon: DollarSign, light: "bg-amber-50", color: "from-amber-500 to-amber-600", trend: `${totalFranchises} franchises`, up: true },
  ];

  const secondaryStats = [
    { label: "Wallet Balance", value: `PKR ${(totalWallet / 1000).toFixed(1)}K`, icon: Wallet, color: "text-blue-600", light: "bg-blue-50", pct: totalIncome > 0 ? Math.round((totalWallet / totalIncome) * 100) : 0 },
    { label: "Equipment", value: totalEquipment, icon: Cpu, color: "text-indigo-600", light: "bg-indigo-50", pct: totalFranchises > 0 ? Math.round((totalEquipment / totalFranchises) * 10) : 0 },
    { label: "Total Activations", value: totalActivationsAll, sub: `${totalPendingActivations} pending`, icon: Activity, color: "text-green-600", light: "bg-green-50", pct: totalActivationsAll > 0 ? Math.round(((totalActivationsAll - totalPendingActivations) / totalActivationsAll) * 100) : 0 },
    { label: "Avg Revenue/F", value: `PKR ${(revenuePerFranchise / 1000).toFixed(1)}K`, icon: Banknote, color: "text-emerald-600", light: "bg-emerald-50", pct: 0 },
  ];

  const quickActions = [
    { label: "Franchises", href: "/company/franchises", icon: Building2, color: "bg-blue-50 text-blue-600" },
    { label: "Reports", href: "/company/reports", icon: BarChart3, color: "bg-purple-50 text-purple-600" },
    { label: "SIM Reports", href: "/company/reports", icon: Package, color: "bg-cyan-50 text-cyan-600" },
    { label: "Staff", href: "/company/reports", icon: Users, color: "bg-green-50 text-green-600" },
    { label: "Financials", href: "/company/reports", icon: Wallet, color: "bg-amber-50 text-amber-600" },
    { label: "Activations", href: "/company/reports", icon: Activity, color: "bg-rose-50 text-rose-600" },
    { label: "Settings", href: "/company/settings", icon: Settings, color: "bg-gray-50 text-gray-600" },
    { label: "Refresh", onClick: refreshData, icon: RefreshCw, color: "bg-indigo-50 text-indigo-600" },
  ];

  const handleExport = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const date = new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const { companyName, ownerName, email, phone, address, city, province } = companyProfile;
    const fullAddress = [address, city, province].filter(Boolean).join(", ");
    w.document.write(`<!DOCTYPE html><html><head><title>${companyName || "Company"} Dashboard</title>
      <style>
        @page { margin: 18mm 15mm; }
        body { font-family:Arial,sans-serif; margin:0; padding:24px; color:#333; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .header { text-align:center; margin-bottom:20px; border-bottom:2px solid #222; padding-bottom:14px; }
        .header h1 { font-size:22px; font-weight:700; color:#000; margin:0 0 4px; }
        .header .owner { font-size:13px; color:#555; margin:0 0 2px; }
        .header .date { font-size:11px; color:#999; margin:0; }
        table { border-collapse:collapse; width:100%; margin:16px 0; }
        th { background:#333; color:#fff; font-weight:700; padding:8px 10px; font-size:11px; text-align:left; border:1px solid #999; }
        td { border:1px solid #ddd; padding:7px 10px; font-size:11px; color:#333; }
        tr:nth-child(even) td { background:#f5f5f5; }
        .section-title { font-size:14px; font-weight:700; color:#000; margin:20px 0 10px; padding-bottom:6px; border-bottom:1px solid #ddd; }
        .kpi-grid { display:flex; gap:12px; margin:12px 0; flex-wrap:wrap; }
        .kpi-card { flex:1; min-width:140px; background:#f9f9f9; border:1px solid #ddd; border-radius:6px; padding:12px; text-align:center; }
        .kpi-card .val { font-size:20px; font-weight:700; color:#000; }
        .kpi-card .lbl { font-size:10px; color:#666; margin-top:2px; }
        .footer { text-align:center; margin-top:24px; font-size:10px; color:#888; border-top:1px solid #ddd; padding-top:10px; }
        .footer .company { font-weight:700; color:#333; font-size:11px; }
        .footer .contact { margin-top:4px; }
        .no-print { display:none; }
      </style></head><body>
      <div class="header">
        <h1>${companyName || "THE SMART ERP"}</h1>
        <div class="owner">${ownerName ? `Owner: ${ownerName}` : ""}</div>
        <div class="date">Dashboard Report &bull; ${date}</div>
      </div>

      <div class="section-title">Key Performance Indicators</div>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="val">${totalFranchises}</div><div class="lbl">Franchises (${active} active)</div></div>
        <div class="kpi-card"><div class="val">${totalStaff}</div><div class="lbl">Total Staff</div></div>
        <div class="kpi-card"><div class="val">${totalSIMs}</div><div class="lbl">SIM Inventory</div></div>
        <div class="kpi-card"><div class="val">PKR ${(totalRevenue / 100000).toFixed(1)}L</div><div class="lbl">Total Revenue</div></div>
        <div class="kpi-card"><div class="val">${todayActivations}</div><div class="lbl">Today's Activations</div></div>
        <div class="kpi-card"><div class="val">${attendanceRate}%</div><div class="lbl">Attendance Rate</div></div>
      </div>

      <div class="section-title">Top Franchises by Revenue</div>
      <table><thead><tr><th>#</th><th>Franchise</th><th>City</th><th>Status</th><th>Staff</th><th>SIMs</th><th>Revenue</th><th>Attendance</th></tr></thead><tbody>
        ${topFranchises.map((f, i) => `<tr><td>${i + 1}</td><td>${f.name}</td><td>${f.city}</td><td>${f.status}</td><td>${f.staff}</td><td>${f.sims}</td><td>PKR ${(f.revenue / 1000).toFixed(1)}K</td><td>${f.attendanceRate}%</td></tr>`).join("")}
      </tbody></table>

      <div class="section-title">Financial Summary</div>
      <table><thead><tr><th>Metric</th><th>Amount</th></tr></thead><tbody>
        <tr><td>Total Income</td><td>PKR ${totalIncome.toLocaleString()}</td></tr>
        <tr><td>Total Expenses</td><td>PKR ${totalExpenses.toLocaleString()}</td></tr>
        <tr><td>Total Payroll</td><td>PKR ${totalPayroll.toLocaleString()}</td></tr>
        <tr><td>Net Profit</td><td>PKR ${profit.toLocaleString()} (${profitMargin}% margin)</td></tr>
        <tr><td>Wallet Balance</td><td>PKR ${totalWallet.toLocaleString()}</td></tr>
      </tbody></table>

      <div class="footer">
        <div class="company">${companyName || "THE SMART ERP"}</div>
        <div class="contact">${[phone, email].filter(Boolean).join(" &bull; ")}</div>
        <div class="contact">${fullAddress}</div>
        <div style="margin-top:4px;color:#aaa;">Generated: ${date}</div>
      </div>
      <script>window.onload=function(){window.print();window.close();}<\/script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-[#0A2647] via-[#144272] to-[#205295] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Home size={16} className="text-white/60" />
                <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Company Dashboard</span>
              </div>
              <h1 className="text-2xl font-black">Company Overview</h1>
              <p className="text-white/70 text-sm mt-1">{today} &middot; {active} active franchises &middot; {totalStaff} staff</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all" title="Export / Print"><Download size={18} /></button>
              <button onClick={refreshData} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><RefreshCw size={18} /></button>
              <button onClick={() => router.push("/company/settings")} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Shield size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
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

      {/* ═══════ OVERVIEW TAB ═══════ */}
      {activeTab === "overview" && (
        <>
          {/* Primary Stats */}
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

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryStats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                  <div>
                    <p className="text-xl font-black text-gray-900">{s.value}</p>
                    <p className="text-gray-500 text-[11px]">{s.label} {s.sub && `· ${s.sub}`}</p>
                    {s.pct > 0 && (
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, s.pct)}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><Zap size={16} className="text-[#C8A951]" /> Quick Actions</h3>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
              {quickActions.map((a) => (
                <button key={a.label} onClick={() => a.onClick ? a.onClick() : router.push(a.href || "#")}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${a.color} hover:scale-105 transition-all`}>
                  <a.icon size={20} />
                  <span className="text-[11px] font-bold whitespace-nowrap">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top Franchises */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Award size={16} className="text-[#0A2647]" /> Top Franchises <span className="text-gray-400 font-normal text-xs">({totalFranchises} total)</span></h3>
                  <button onClick={() => router.push("/company/franchises")} className="text-[#0A2647] text-xs font-medium hover:underline flex items-center gap-1">View All <ChevronRight size={12} /></button>
                </div>
                <div className="p-4">
                  {topFranchises.length > 0 ? (
                    <div className="space-y-3">
                      {topFranchises.map((f, i) => (
                        <div key={f.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${i === 0 ? "bg-amber-50 border border-amber-200" : "hover:bg-gray-50"}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-gray-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-500"}`}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900 text-sm font-bold truncate">{f.name}</p>
                              {i === 0 && <Star size={12} className="text-amber-400 fill-amber-400" />}
                            </div>
                            <p className="text-gray-400 text-xs">{f.id} &middot; {f.city} &middot; {f.staff} staff</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900 text-sm font-bold">PKR {(f.revenue / 1000).toFixed(1)}K</p>
                            <p className="text-gray-400 text-[10px]">{f.todayActivations} today</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No franchises found</p>
                  )}
                </div>
              </div>

              {/* Status Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><PieChart size={16} className="text-[#0A2647]" /> Franchise Status Distribution</h3>
                <div className="space-y-4">
                  {[
                    { label: "Active", count: active, color: "bg-green-500", pct: totalFranchises > 0 ? Math.round((active / totalFranchises) * 100) : 0, icon: <CheckCircle size={14} className="text-green-600" /> },
                    { label: "Pending", count: pending, color: "bg-yellow-500", pct: totalFranchises > 0 ? Math.round((pending / totalFranchises) * 100) : 0, icon: <Clock size={14} className="text-yellow-600" /> },
                    { label: "Suspended", count: suspended, color: "bg-red-500", pct: totalFranchises > 0 ? Math.round((suspended / totalFranchises) * 100) : 0, icon: <XCircle size={14} className="text-red-600" /> },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-gray-700 text-sm flex items-center gap-1.5">{s.icon} {s.label}</span>
                        <div className="flex items-center gap-2"><span className={`text-sm font-bold ${s.label === "Active" ? "text-green-600" : s.label === "Pending" ? "text-yellow-600" : "text-red-600"}`}>{s.count}</span><span className="text-gray-400 text-xs">({s.pct}%)</span></div>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: `${s.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Province Distribution */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><MapPin size={16} className="text-[#0A2647]" /> By Province</h3>
                <div className="space-y-3">
                  {Object.entries(franchises.reduce<Record<string, number>>((acc, f) => { acc[f.province] = (acc[f.province] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).map(([prov, count]) => {
                    const pct = totalFranchises > 0 ? Math.round((count / totalFranchises) * 100) : 0;
                    return (
                      <div key={prov} className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20 truncate">{prov}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                        <span className="text-gray-900 text-sm font-bold w-8 text-right">{count}</span>
                        <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Financial Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><DollarSign size={16} className="text-[#0A2647]" /> Financial Summary</h3>
                  <button onClick={() => router.push("/company/reports")} className="text-[#0A2647] text-xs font-medium hover:underline flex items-center gap-1">Details <ChevronRight size={12} /></button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2"><TrendingUp size={16} className="text-green-600" /><span className="text-green-700 text-sm font-medium">Total Income</span></div>
                    <span className="text-green-800 text-sm font-bold">PKR {totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2"><TrendingDown size={16} className="text-red-600" /><span className="text-red-700 text-sm font-medium">Total Expenses</span></div>
                    <span className="text-red-800 text-sm font-bold">PKR {totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2"><Users size={16} className="text-purple-600" /><span className="text-purple-700 text-sm font-medium">Total Payroll</span></div>
                    <span className="text-purple-800 text-sm font-bold">PKR {totalPayroll.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-2"><Wallet size={16} className="text-amber-600" /><span className="text-amber-700 text-sm font-medium">Wallet Balance</span></div>
                    <span className="text-amber-800 text-sm font-bold">PKR {totalWallet.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 text-sm font-bold">Net Profit</span>
                      <span className={`font-black text-lg ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>{profit >= 0 ? "+" : ""}PKR {profit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-400 text-xs">Profit Margin</span>
                      <span className={`text-xs font-bold ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>{profitMargin >= 0 ? "+" : ""}{profitMargin}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SIM Network Distribution */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Wifi size={16} className="text-[#0A2647]" /> SIM Network Distribution</h3></div>
                <div className="p-6">
                  {networkDist.length > 0 ? (
                    <div className="space-y-4">
                      {networkDist.map(([network, count]) => {
                        const pct = totalSIMs > 0 ? Math.round((count / totalSIMs) * 100) : 0;
                        const netColors: Record<string, string> = { Jazz: "bg-red-500", Telenor: "bg-blue-500", Ufone: "bg-green-500", Zong: "bg-purple-500" };
                        return (
                          <div key={network}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2"><Wifi size={14} className={network === "Jazz" ? "text-red-500" : network === "Telenor" ? "text-blue-500" : network === "Ufone" ? "text-green-500" : "text-purple-500"} /><span className="text-gray-700 text-sm font-medium">{network}</span></div>
                              <span className="text-gray-500 text-xs">{count} SIMs ({pct}%)</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${netColors[network] || "bg-gray-400"}`} style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-4">No SIM data</p>
                  )}
                </div>
              </div>

              {/* Stats Overview */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><BarChart3 size={16} className="text-[#0A2647]" /> Quick Facts</h3></div>
                <div className="p-4 space-y-3">
                  {[
                    { label: "Avg Staff/Franchise", value: staffPerFranchise.toFixed(1), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Avg SIMs/Franchise", value: simsPerFranchise.toFixed(1), icon: Smartphone, color: "text-cyan-600", bg: "bg-cyan-50" },
                    { label: "Avg Revenue/Franchise", value: `PKR ${(revenuePerFranchise / 1000).toFixed(1)}K`, icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Activation Completion", value: `${totalActivationsAll > 0 ? Math.round(((totalActivationsAll - totalPendingActivations) / totalActivationsAll) * 100) : 0}%`, icon: Activity, color: "text-green-600", bg: "bg-green-50" },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
                      <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center"><s.icon size={16} className={s.color} /></div>
                      <div className="flex-1"><p className="text-gray-500 text-[10px]">{s.label}</p><p className="text-gray-900 text-sm font-bold">{s.value}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════ PERFORMANCE TAB ═══════ */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Franchises", value: active, sub: `${totalFranchises > 0 ? Math.round((active / totalFranchises) * 100) : 0}% of total`, icon: CheckCircle, color: "text-green-600", light: "bg-green-50" },
              { label: "Today Activations", value: todayActivations, sub: `out of ${totalActivationsAll} total`, icon: TrendingUp, color: "text-blue-600", light: "bg-blue-50" },
              { label: "Pending Activations", value: totalPendingActivations, sub: `${totalActivationsAll > 0 ? Math.round((totalPendingActivations / totalActivationsAll) * 100) : 0}% pending`, icon: Clock, color: "text-amber-600", light: "bg-amber-50" },
              { label: "Attendance Rate", value: `${attendanceRate}%`, sub: "Company-wide average", icon: UserCheck, color: "text-emerald-600", light: "bg-emerald-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${s.light} flex items-center justify-center`}><s.icon size={20} className={s.color} /></div>
                </div>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs font-medium mt-0.5">{s.label}</p>
                <p className="text-gray-400 text-[10px] mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Activity size={16} className="text-[#0A2647]" /> Activations by Franchise</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-gray-500 text-[10px] font-medium uppercase">Franchise</th>
                    <th className="text-center px-4 py-3 text-gray-500 text-[10px] font-medium uppercase">Total</th>
                    <th className="text-center px-4 py-3 text-gray-500 text-[10px] font-medium uppercase">Today</th>
                    <th className="text-center px-4 py-3 text-gray-500 text-[10px] font-medium uppercase">Pending</th>
                    <th className="text-center px-4 py-3 text-gray-500 text-[10px] font-medium uppercase">Rate</th>
                  </tr></thead>
                  <tbody>
                    {franchises.map((f) => {
                      const d = detailMap[f.id];
                      const rate = d ? (d.totalActivations > 0 ? Math.round(((d.totalActivations - d.pendingActivations) / d.totalActivations) * 100) : 0) : 0;
                      return (
                        <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3"><p className="text-gray-900 text-sm font-medium">{f.name}</p><p className="text-gray-400 text-[10px]">{f.id}</p></td>
                          <td className="px-4 py-3 text-center text-gray-700 font-medium">{d?.totalActivations || 0}</td>
                          <td className="px-4 py-3 text-center text-gray-700 font-medium">{f.todayActivations}</td>
                          <td className="px-4 py-3 text-center text-gray-700 font-medium">{d?.pendingActivations || 0}</td>
                          <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rate >= 80 ? "bg-green-50 text-green-700" : rate >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{rate}%</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><Layers size={16} className="text-[#0A2647]" /> SIM Inventory by Status</h3>
              {(() => {
                const byStatus: Record<string, number> = {};
                Object.values(detailMap).forEach((d) => Object.entries(d.simsByStatus).forEach(([st, c]) => { byStatus[st] = (byStatus[st] || 0) + c; }));
                const cmap: Record<string, string> = { Issued: "bg-amber-500", Active: "bg-green-500", Verified: "bg-blue-500", Returned: "bg-red-500", "In Stock": "bg-gray-400" };
                return Object.entries(byStatus).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([st, count]) => {
                      const pct = totalSIMs > 0 ? Math.round((count / totalSIMs) * 100) : 0;
                      return (
                        <div key={st}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-gray-700 text-sm font-medium">{st}</span>
                            <span className="text-gray-500 text-xs">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${cmap[st] || "bg-gray-400"}`} style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-gray-400 text-sm text-center py-4">No SIM data</p>;
              })()}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><MapPin size={16} className="text-[#0A2647]" /> Franchise Performance by Province</h3></div>
            <div className="p-6">
              {(() => {
                const byProv = franchises.reduce<Record<string, { count: number; revenue: number; staff: number }>>((acc, f) => {
                  if (!acc[f.province]) acc[f.province] = { count: 0, revenue: 0, staff: 0 };
                  acc[f.province].count++;
                  acc[f.province].revenue += f.revenue;
                  acc[f.province].staff += f.staff;
                  return acc;
                }, {});
                return Object.entries(byProv).sort((a, b) => b[1].revenue - a[1].revenue).map(([prov, data]) => {
                  const revPct = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0;
                  return (
                    <div key={prov} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">{prov.slice(0, 2).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium">{prov}</p>
                        <p className="text-gray-400 text-xs">{data.count} franchises &middot; {data.staff} staff</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 text-sm font-bold">PKR {(data.revenue / 1000).toFixed(1)}K</p>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 ml-auto overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${revPct}%` }} /></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ FINANCE TAB ═══════ */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Income", value: `PKR ${totalIncome.toLocaleString()}`, sub: "Across all franchises", icon: TrendingUp, color: "text-green-600", light: "bg-green-50" },
              { label: "Total Expenses", value: `PKR ${totalExpenses.toLocaleString()}`, sub: `${totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}% of income`, icon: TrendingDown, color: "text-red-600", light: "bg-red-50" },
              { label: "Total Payroll", value: `PKR ${totalPayroll.toLocaleString()}`, sub: `${totalStaff} staff`, icon: Users, color: "text-purple-600", light: "bg-purple-50" },
              { label: "Net Profit", value: `PKR ${profit.toLocaleString()}`, sub: `${profitMargin}% margin`, icon: DollarSign, color: profit >= 0 ? "text-emerald-600" : "text-red-600", light: profit >= 0 ? "bg-emerald-50" : "bg-red-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${s.light} flex items-center justify-center`}><s.icon size={20} className={s.color} /></div>
                </div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs font-medium mt-0.5">{s.label}</p>
                <p className="text-gray-400 text-[10px] mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><Wallet size={16} className="text-[#0A2647]" /> Wallet by Franchise</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {[...franchises].sort((a, b) => (detailMap[b.id]?.walletBalance || 0) - (detailMap[a.id]?.walletBalance || 0)).map((f) => {
                  const bal = detailMap[f.id]?.walletBalance || 0;
                  const pct = totalWallet > 0 ? Math.round((bal / totalWallet) * 100) : 0;
                  return (
                    <div key={f.id} className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs w-16 truncate">{f.name}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="text-gray-900 text-xs font-bold w-20 text-right">PKR {bal.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><Banknote size={16} className="text-[#0A2647]" /> Revenue by Franchise</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {[...franchises].sort((a, b) => b.revenue - a.revenue).map((f) => {
                  const pct = totalRevenue > 0 ? Math.round((f.revenue / totalRevenue) * 100) : 0;
                  return (
                    <div key={f.id} className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs w-16 truncate">{f.name}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="text-gray-900 text-xs font-bold w-20 text-right">PKR {(f.revenue / 1000).toFixed(1)}K</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><CreditCard size={16} className="text-[#0A2647]" /> Payroll by Franchise</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {[...franchises].sort((a, b) => (detailMap[b.id]?.totalPayroll || 0) - (detailMap[a.id]?.totalPayroll || 0)).map((f) => {
                  const payroll = detailMap[f.id]?.totalPayroll || 0;
                  const pct = totalPayroll > 0 ? Math.round((payroll / totalPayroll) * 100) : 0;
                  return (
                    <div key={f.id} className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs w-16 truncate">{f.name}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="text-gray-900 text-xs font-bold w-20 text-right">PKR {payroll.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><Award size={16} className="text-emerald-500" /> Most Profitable Franchises</h3>
              <div className="space-y-3">
                {[...franchises].map((f) => {
                  const d = detailMap[f.id];
                  if (!d) return null;
                  const net = d.totalIncome - d.totalExpenses;
                  return (
                    <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all">
                      <div className="flex-1 min-w-0"><p className="text-gray-900 text-sm font-medium truncate">{f.name}</p></div>
                      <div className="text-right"><p className={`text-sm font-bold ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>{net >= 0 ? "+" : ""}PKR {net.toLocaleString()}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2"><Activity size={16} className="text-[#0A2647]" /> Financial Breakdown by Franchise</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100">
                    <th className="text-left px-2 py-2 text-gray-500 text-[10px] font-medium uppercase">Franchise</th>
                    <th className="text-right px-2 py-2 text-gray-500 text-[10px] font-medium uppercase">Income</th>
                    <th className="text-right px-2 py-2 text-gray-500 text-[10px] font-medium uppercase">Expenses</th>
                    <th className="text-right px-2 py-2 text-gray-500 text-[10px] font-medium uppercase">Net</th>
                  </tr></thead>
                  <tbody>
                    {franchises.map((f) => {
                      const d = detailMap[f.id];
                      if (!d) return null;
                      const net = d.totalIncome - d.totalExpenses;
                      return (
                        <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-2 py-2 text-gray-700 text-xs font-medium">{f.name}</td>
                          <td className="px-2 py-2 text-right text-gray-700 text-xs">PKR {d.totalIncome.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right text-gray-700 text-xs">PKR {d.totalExpenses.toLocaleString()}</td>
                          <td className={`px-2 py-2 text-right text-xs font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>{net >= 0 ? "+" : ""}PKR {net.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}