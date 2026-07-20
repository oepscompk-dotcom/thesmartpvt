"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useCompanyData } from "@/lib/CompanyDataContext";
import {
  LayoutDashboard, Building2, Smartphone, Cpu, Users, DollarSign,
  TrendingUp, Activity, Search, X, Download,
  MapPin, Package, Clock, CreditCard, Wallet, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Filter, TrendingDown, Award, AlertTriangle,
  CheckCircle, UserCheck, Percent, Banknote, Target, ShieldCheck,
  ChevronDown, ChevronUp, RefreshCw, FileDown, Printer, Eye, Layers,
  FileSpreadsheet, FileText
} from "lucide-react";

type Tab = "overview" | "sims" | "devices" | "staff" | "financial" | "activations";
type ViewMode = "table" | "grid";
type SortKey = "sims" | "devices" | "staff" | "revenue";
type SortDir = "asc" | "desc";

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "sims", label: "SIM Inventory", icon: Smartphone },
  { key: "devices", label: "Devices", icon: Cpu },
  { key: "staff", label: "Staff", icon: Users },
  { key: "financial", label: "Financial", icon: DollarSign },
  { key: "activations", label: "Activations", icon: TrendingUp },
];

const NETWORK_BG: Record<string, string> = { Telenor: "bg-red-500", Jazz: "bg-red-500", Ufone: "bg-green-500", Zong: "bg-cyan-500", SCO: "bg-purple-500", Warid: "bg-orange-500" };

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} /></div>;
}

function MiniBar({ pct, color = "bg-blue-500" }: { pct: number; color?: string }) {
  return <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>;
}

function StatCard({ title, value, subtitle, icon, color, trend }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs font-medium truncate">{title}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
          {trend && <span className={`inline-flex items-center gap-1 mt-2 text-xs font-bold ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>{trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(trend)}%</span>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

function MiniTable({ headers, rows, onExport }: { headers: string[]; rows: (string | number)[][]; onExport?: () => void }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">{headers.map((h, i) => (<th key={i} className={`text-left px-3 py-2.5 text-gray-500 text-xs font-medium uppercase ${i === headers.length - 1 ? "text-right" : ""}`}>{h}</th>))}</tr></thead>
          <tbody>{rows.map((row, ri) => (<tr key={ri} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">{row.map((cell, ci) => (<td key={ci} className={`px-3 py-2.5 text-gray-700 text-xs ${ci === row.length - 1 ? "text-right font-medium" : ""}`}>{cell}</td>))}</tr>))}{rows.length === 0 && (<tr><td colSpan={headers.length} className="px-3 py-8 text-center text-gray-400 text-sm">No data</td></tr>)}</tbody>
        </table>
      </div>
      {onExport && <div className="px-3 py-2 border-t border-gray-100 flex justify-end"><button onClick={onExport} className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1"><Download size={12} /> Export CSV</button></div>}
    </div>
  );
}

function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
}

function exportXLS(headers: string[], rows: (string | number)[][], title: string, filename: string, profile?: { companyName?: string; ownerName?: string; email?: string; phone?: string; address?: string; city?: string; province?: string }) {
  const date = new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
  const companyName = profile?.companyName || "THE SMART ERP";
  const ownerLine = profile?.ownerName ? `Owner: ${profile.ownerName}` : "";
  const contactParts = [profile?.phone, profile?.email].filter(Boolean).join(" &bull; ");
  const addressParts = [profile?.address, profile?.city, profile?.province].filter(Boolean).join(", ");
  const tableRows = rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #ccc;padding:6px 10px;color:#333;font-size:11px;font-family:Arial,sans-serif">${String(c)}</td>`).join("")}</tr>`).join("");
  const headerRow = headers.map((h) => `<th style="border:1px solid #999;padding:8px 10px;background:#333;color:#fff;font-size:11px;font-weight:700;font-family:Arial,sans-serif;text-align:left">${h}</th>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title></head><body>
    <div style="text-align:center;margin-bottom:16px;font-family:Arial,sans-serif">
      <h1 style="font-size:18px;font-weight:700;color:#222;margin:0 0 4px">${companyName}</h1>
      ${ownerLine ? `<p style="font-size:12px;color:#555;margin:0 0 2px">${ownerLine}</p>` : ""}
      <h2 style="font-size:14px;font-weight:600;color:#555;margin:4px 0 2px">${title}</h2>
      <p style="font-size:11px;color:#888;margin:0">Generated: ${date}</p>
    </div>
    <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif">${headerRow ? `<thead>${headerRow}</thead>` : ""}<tbody>${tableRows}</tbody></table>
    <div style="text-align:center;margin-top:16px;font-size:10px;color:#999;font-family:Arial,sans-serif;border-top:1px solid #ddd;padding-top:8px">
      ${companyName}${contactParts ? ` &bull; ${contactParts}` : ""}${addressParts ? ` &bull; ${addressParts}` : ""} &bull; ${date}
    </div>
  </body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename.replace(/\.csv$/, ".xls"); link.click(); URL.revokeObjectURL(link.href);
}

export default function CompanyReportsPage() {
  const { franchises, detailMap, loading, totalSIMs, totalDevices, totalStaff, totalRevenue, todayActivations, attendanceRate, totalPayroll, totalExpenses, totalIncome, auth } = useCompanyData();
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [franchiseFilter, setFranchiseFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [exportOpen, setExportOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const details = useMemo(() => franchises.map((f) => detailMap[f.id]).filter(Boolean), [franchises, detailMap]);

  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc")); else { setSortKey(key); setSortDir("desc"); } };

  const filtered = useMemo(() => {
    let list = [...details];
    if (franchiseFilter !== "All") list = list.filter((d) => d.status === franchiseFilter);
    if (search) list = list.filter((d) => d.id.toLowerCase().includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      const ak = a[sortKey], bk = b[sortKey];
      return sortDir === "asc" ? (ak as number) - (bk as number) : (bk as number) - (ak as number);
    });
    return list;
  }, [details, franchiseFilter, search, sortKey, sortDir]);

  const topFranchises = useMemo(() => [...details].sort((a, b) => b.revenue - a.revenue), [details]);
  const bottomFranchises = useMemo(() => [...details].sort((a, b) => a.revenue - b.revenue), [details]);

  const simsByNetwork: Record<string, number> = {};
  const simsByStatus: Record<string, number> = {};
  details.forEach((d) => { Object.entries(d.simsByNetwork).forEach(([k, v]) => { simsByNetwork[k] = (simsByNetwork[k] || 0) + v; }); Object.entries(d.simsByStatus).forEach(([k, v]) => { simsByStatus[k] = (simsByStatus[k] || 0) + v; }); });

  const devicesByBrand: Record<string, number> = {};
  const devicesByStatus: Record<string, number> = {};
  details.forEach((d) => { Object.entries(d.devicesByBrand).forEach(([k, v]) => { devicesByBrand[k] = (devicesByBrand[k] || 0) + v; }); Object.entries(d.devicesByStatus).forEach(([k, v]) => { devicesByStatus[k] = (devicesByStatus[k] || 0) + v; }); });

  const allStaff = useMemo(() => details.flatMap((d) => [...d.dsms.map((s) => ({ ...s, franchise: d.id, role: "DSM" })), ...d.dsos.map((s) => ({ ...s, franchise: d.id, role: "DSO" }))]), [details]);

  const totalNewSims = details.reduce((s, d) => s + d.newSims, 0);
  const totalHlrSims = details.reduce((s, d) => s + d.hlrSims, 0);
  const totalActivationsAll = details.reduce((s, d) => s + d.totalActivations, 0);
  const totalPendingActivations = details.reduce((s, d) => s + d.pendingActivations, 0);
  const activeStaff = allStaff.filter((s) => s.status === "Active").length;
  const avgSalary = allStaff.length > 0 ? Math.round(allStaff.reduce((s, st) => s + st.salary, 0) / allStaff.length) : 0;
  const netProfit = totalIncome - totalExpenses - totalPayroll;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
  const totalEquipment = details.reduce((s, d) => s + d.equipmentCount, 0);
  const totalWallet = details.reduce((s, d) => s + d.walletBalance, 0);

  const activationsByTypeAll: Record<string, number> = {};
  details.forEach((d) => { Object.entries(d.activationsByType).forEach(([k, v]) => { activationsByTypeAll[k] = (activationsByTypeAll[k] || 0) + v; }); });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading reports...</p>
        </div>
      </div>
    );
  }

  const baseExport = (headers: string[], rows: (string | number)[][], name: string) => () => exportCSV(headers, rows, `company-${name}-${new Date().toISOString().split("T")[0]}.csv`);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Franchises" value={franchises.length} subtitle={`${franchises.filter((f) => f.status === "Active").length} active · ${franchises.filter((f) => f.status === "Pending").length} pending`} icon={<Building2 size={20} className="text-blue-600" />} color="bg-blue-50" trend={franchises.length > 0 ? 100 : 0} />
        <StatCard title="Total Staff" value={totalStaff} subtitle={`${allStaff.filter((s) => s.role === "DSM").length} DSM / ${allStaff.filter((s) => s.role === "DSO").length} DSO`} icon={<Users size={20} className="text-purple-600" />} color="bg-purple-50" trend={attendanceRate - 70} />
        <StatCard title="SIM Inventory" value={totalSIMs} subtitle={`${totalNewSims} New · ${totalHlrSims} HLR · ${totalDevices} Devices`} icon={<Smartphone size={20} className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Total Revenue" value={`PKR ${(totalRevenue / 100000).toFixed(1)}L`} subtitle={`${todayActivations} activations today`} icon={<TrendingUp size={20} className="text-amber-600" />} color="bg-amber-50" />
      </div>

      {/* Financial Health & Rankings */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold flex items-center gap-2"><Award size={16} className="text-amber-500" /> Franchise Rankings</h3>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {(["table", "grid"] as ViewMode[]).map((v) => (
                <button key={v} onClick={() => setViewMode(v)} className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${viewMode === v ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>{v === "table" ? <List size={12} /> : <Grid3X3 size={12} />}</button>
              ))}
            </div>
          </div>
          {viewMode === "table" ? (
            <MiniTable
              headers={["#", "Franchise", "Status", "SIMs", "Devices", "Staff", "Revenue", "Att."]}
              rows={topFranchises.map((d, i) => [i + 1, `${d.name} (${d.id})`, d.status, d.sims, d.devices, d.staff, `PKR ${d.revenue.toLocaleString()}`, `${d.attendanceRate}%`])}
              onExport={baseExport(["#","Franchise","Status","SIMs","Devices","Staff","Revenue","Attendance"], topFranchises.map((d, i) => [i + 1, `${d.name} (${d.id})`, d.status, d.sims, d.devices, d.staff, d.revenue, `${d.attendanceRate}%`]), "franchise-rankings")}
            />
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topFranchises.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{d.name}</p>
                    <p className="text-gray-400 text-xs">{d.city} · {d.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 text-sm font-bold">PKR {d.revenue.toLocaleString()}</p>
                    <p className="text-gray-400 text-[10px]">{d.staff} staff · {d.sims} SIMs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Financial Health */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Target size={16} className="text-emerald-600" /> Financial Health</h3>
            <div className="space-y-4">
              <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Total Income</span><span className="text-green-700 font-bold">PKR {totalIncome.toLocaleString()}</span></div><Bar value={totalIncome} max={totalIncome || 1} color="bg-green-500" /></div>
              <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Total Payroll</span><span className="text-purple-700 font-bold">PKR {totalPayroll.toLocaleString()}</span></div><Bar value={totalPayroll} max={totalIncome || 1} color="bg-purple-500" /></div>
              <div><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Total Expenses</span><span className="text-red-700 font-bold">PKR {totalExpenses.toLocaleString()}</span></div><Bar value={totalExpenses} max={totalIncome || 1} color="bg-red-500" /></div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center"><span className="text-gray-800 text-sm font-bold">Net Profit</span><span className={`text-lg font-black ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{netProfit >= 0 ? "+" : ""}PKR {netProfit.toLocaleString()}</span></div>
                <div className="flex justify-between mt-1"><span className="text-gray-400 text-xs">Profit Margin</span><span className={`text-xs font-bold ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>{profitMargin >= 0 ? "+" : ""}{profitMargin}%</span></div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Activity size={16} className="text-blue-600" /> Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Wallet", value: `PKR ${totalWallet.toLocaleString()}`, icon: <Wallet size={14} className="text-blue-600" />, bg: "bg-blue-50" },
                { label: "Equipment", value: String(totalEquipment), icon: <Cpu size={14} className="text-indigo-600" />, bg: "bg-indigo-50" },
                { label: "Avg Staff/F", value: (totalStaff / (franchises.length || 1)).toFixed(1), icon: <Users size={14} className="text-purple-600" />, bg: "bg-purple-50" },
                { label: "Avg Revenue/F", value: `PKR ${(totalRevenue / (franchises.length || 1)).toFixed(0)}`, icon: <Banknote size={14} className="text-emerald-600" />, bg: "bg-emerald-50" },
                { label: "Activations/F", value: String(Math.round(totalActivationsAll / (franchises.length || 1))), icon: <Activity size={14} className="text-cyan-600" />, bg: "bg-cyan-50" },
                { label: "Pending %", value: `${totalActivationsAll > 0 ? Math.round((totalPendingActivations / totalActivationsAll) * 100) : 0}%`, icon: <Clock size={14} className="text-amber-600" />, bg: "bg-amber-50" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-2`}>
                  <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center">{s.icon}</div>
                  <div><p className="text-gray-400 text-[10px]">{s.label}</p><p className="text-gray-900 text-sm font-bold">{s.value}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distributions */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><MapPin size={16} className="text-rose-500" /> By Province</h3>
          <div className="space-y-3">
            {Object.entries(franchises.reduce<Record<string, number>>((acc, f) => { acc[f.province] = (acc[f.province] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).map(([prov, count]) => (
              <div key={prov} className="flex items-center gap-2"><span className="text-gray-600 text-xs w-16 truncate">{prov}</span><Bar value={count} max={franchises.length} color="bg-rose-500" /><span className="text-gray-900 text-xs font-bold w-6 text-right">{count}</span></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Package size={16} className="text-amber-500" /> By Package</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(franchises.reduce<Record<string, number>>((acc, f) => { acc[f.package] = (acc[f.package] || 0) + 1; return acc; }, {})).map(([pkg, count]) => (
              <div key={pkg} className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-gray-900 text-lg font-bold">{count}</p><p className="text-gray-400 text-xs">{pkg}</p></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-purple-500" /> By Status</h3>
          <div className="space-y-3">
            {["Active", "Pending", "Suspended"].map((s) => {
              const count = franchises.filter((f) => f.status === s).length;
              const pct = franchises.length > 0 ? Math.round((count / franchises.length) * 100) : 0;
              return (
                <div key={s}><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">{s}</span><span className="text-gray-900 font-bold">{count} ({pct}%)</span></div><Bar value={count} max={franchises.length} color={s === "Active" ? "bg-green-500" : s === "Pending" ? "bg-yellow-500" : "bg-red-500"} /></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSIMs = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total SIMs" value={totalSIMs} subtitle={`${totalSIMs > 0 ? `${Math.round((totalNewSims / totalSIMs) * 100)}% New` : "0%"} / ${totalSIMs > 0 ? `${Math.round((totalHlrSims / totalSIMs) * 100)}% HLR` : "0%"}`} icon={<Smartphone size={20} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="New SIMs" value={totalNewSims} subtitle={`${totalSIMs > 0 ? Math.round((totalNewSims / totalSIMs) * 100) : 0}% of inventory`} icon={<Smartphone size={20} className="text-cyan-600" />} color="bg-cyan-50" />
        <StatCard title="HLR SIMs" value={totalHlrSims} subtitle={`${totalSIMs > 0 ? Math.round((totalHlrSims / totalSIMs) * 100) : 0}% of inventory`} icon={<Smartphone size={20} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard title="Total Activations" value={totalActivationsAll} subtitle={`${totalPendingActivations} pending (${totalActivationsAll > 0 ? Math.round((totalPendingActivations / totalActivationsAll) * 100) : 0}%)`} icon={<TrendingUp size={20} className="text-purple-600" />} color="bg-purple-50" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><PieChart size={16} className="text-blue-600" /> By Network</h3>
          <div className="space-y-3">
            {Object.entries(simsByNetwork).sort((a, b) => b[1] - a[1]).map(([network, count]) => {
              const pct = totalSIMs > 0 ? Math.round((count / totalSIMs) * 100) : 0;
              return (
                <div key={network} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${NETWORK_BG[network] || "bg-gray-400"}`} />
                  <span className="text-gray-700 text-sm w-20">{network}</span>
                  <Bar value={count} max={totalSIMs} color={NETWORK_BG[network] || "bg-gray-400"} />
                  <span className="text-gray-900 text-sm font-bold w-12 text-right">{count}</span>
                  <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
                </div>
              );
            })}
            {Object.keys(simsByNetwork).length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No SIM data</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Layers size={16} className="text-purple-600" /> By Status</h3>
          <div className="space-y-3">
            {Object.entries(simsByStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const pct = totalSIMs > 0 ? Math.round((count / totalSIMs) * 100) : 0;
              const cmap: Record<string, string> = { Issued: "bg-amber-500", Active: "bg-green-500", Verified: "bg-blue-500", Returned: "bg-red-500", "In Stock": "bg-gray-500" };
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${cmap[status] || "bg-gray-400"}`} />
                  <span className="text-gray-700 text-sm w-24">{status}</span>
                  <Bar value={count} max={totalSIMs} color={cmap[status] || "bg-gray-400"} />
                  <span className="text-gray-900 text-sm font-bold w-12 text-right">{count}</span>
                  <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
                </div>
              );
            })}
            {Object.keys(simsByStatus).length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No status data</p>}
          </div>
        </div>
      </div>

      {/* SIM Inventory by Franchise */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-bold">SIM Inventory by Franchise</h3>
        </div>
        <MiniTable
          headers={["Franchise", "Location", "Total", "New", "HLR", "By Network", "By Status"]}
          rows={filtered.map((d) => [`${d.name} (${d.id})`, d.city, d.sims, d.newSims, d.hlrSims, Object.entries(d.simsByNetwork).map(([k, v]) => `${k}: ${v}`).join(", "), Object.entries(d.simsByStatus).map(([k, v]) => `${k}: ${v}`).join(", ")])}
          onExport={baseExport(["Franchise","Location","Total","New","HLR","By Network","By Status"], filtered.map((d) => [`${d.name} (${d.id})`, d.city, d.sims, d.newSims, d.hlrSims, Object.entries(d.simsByNetwork).map(([k, v]) => `${k}: ${v}`).join(", "), Object.entries(d.simsByStatus).map(([k, v]) => `${k}: ${v}`).join(", ")]), "sim-inventory")}
        />
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Devices" value={totalDevices} icon={<Cpu size={20} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Unique Brands" value={Object.keys(devicesByBrand).length} subtitle="Across all franchises" icon={<Cpu size={20} className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Status Types" value={Object.keys(devicesByStatus).length} icon={<Activity size={20} className="text-purple-600" />} color="bg-purple-50" />
        <StatCard title="Avg Per Franchise" value={franchises.length > 0 ? Math.round(totalDevices / franchises.length) : 0} icon={<BarChart3 size={20} className="text-amber-600" />} color="bg-amber-50" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><PieChart size={16} className="text-amber-600" /> By Brand</h3>
          <div className="space-y-3">
            {Object.entries(devicesByBrand).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
              const pct = totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0;
              return (
                <div key={brand} className="flex items-center gap-3">
                  <span className="text-gray-700 text-sm w-24">{brand}</span>
                  <Bar value={count} max={totalDevices} color="bg-amber-500" />
                  <span className="text-gray-900 text-sm font-bold w-12 text-right">{count}</span>
                  <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
                </div>
              );
            })}
            {Object.keys(devicesByBrand).length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No device data</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Layers size={16} className="text-indigo-600" /> By Status</h3>
          <div className="space-y-3">
            {Object.entries(devicesByStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const pct = totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0;
              const cmap: Record<string, string> = { Active: "bg-green-500", Issued: "bg-blue-500", Damaged: "bg-red-500", "In Stock": "bg-gray-500", Returned: "bg-amber-500" };
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-gray-700 text-sm w-24 capitalize">{status}</span>
                  <Bar value={count} max={totalDevices} color={cmap[status] || "bg-gray-400"} />
                  <span className="text-gray-900 text-sm font-bold w-12 text-right">{count}</span>
                  <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
                </div>
              );
            })}
            {Object.keys(devicesByStatus).length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No status data</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-bold">Device Inventory by Franchise</h3>
        </div>
        <MiniTable
          headers={["Franchise", "Location", "Total", "By Brand", "By Status"]}
          rows={filtered.map((d) => [`${d.name} (${d.id})`, d.city, d.devices, Object.entries(d.devicesByBrand).map(([k, v]) => `${k}: ${v}`).join(", "), Object.entries(d.devicesByStatus).map(([k, v]) => `${k}: ${v}`).join(", ")])}
          onExport={baseExport(["Franchise","Location","Total","By Brand","By Status"], filtered.map((d) => [`${d.name} (${d.id})`, d.city, d.devices, Object.entries(d.devicesByBrand).map(([k, v]) => `${k}: ${v}`).join(", "), Object.entries(d.devicesByStatus).map(([k, v]) => `${k}: ${v}`).join(", ")]), "device-inventory")}
        />
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Staff" value={totalStaff} subtitle={`${allStaff.filter((s) => s.role === "DSM").length} DSM / ${allStaff.filter((s) => s.role === "DSO").length} DSO`} icon={<Users size={20} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Active Staff" value={activeStaff} subtitle={`${totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 0}% active`} icon={<UserCheck size={20} className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Avg Salary" value={`PKR ${avgSalary.toLocaleString()}`} icon={<DollarSign size={20} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard title="Total Payroll" value={`PKR ${totalPayroll.toLocaleString()}`} subtitle="All time" icon={<CreditCard size={20} className="text-red-600" />} color="bg-red-50" />
      </div>

      {/* Staff Salary Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Award size={16} className="text-amber-500" /> Top Paid Staff</h3>
          <div className="space-y-3">
            {[...allStaff].sort((a, b) => b.salary - a.salary).slice(0, 10).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${i < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-gray-900 text-sm font-medium truncate">{s.name}</p><p className="text-gray-400 text-xs">{s.role} · {s.franchise}</p></div>
                <div className="text-right"><p className="text-gray-900 text-sm font-bold">PKR {s.salary.toLocaleString()}</p><p className="text-gray-400 text-xs">Commission: {s.commission.toLocaleString()}</p></div>
              </div>
            ))}
            {allStaff.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No staff data</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Percent size={16} className="text-blue-600" /> Role Distribution</h3>
          <div className="space-y-4">
            {["DSM", "DSO"].map((role) => {
              const count = allStaff.filter((s) => s.role === role).length;
              const pct = totalStaff > 0 ? Math.round((count / totalStaff) * 100) : 0;
              return (
                <div key={role}>
                  <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-700 font-medium">{role}s</span><span className="text-gray-900 font-bold">{count} ({pct}%)</span></div>
                  <Bar value={count} max={totalStaff} color={role === "DSM" ? "bg-blue-500" : "bg-purple-500"} />
                </div>
              );
            })}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-gray-400 text-xs mb-2">Attendance Rate</p>
              <div className="flex items-center gap-3"><span className="text-gray-700 text-sm">Company-wide</span><Bar value={attendanceRate} max={100} color="bg-green-500" /><span className="text-gray-900 text-sm font-bold">{attendanceRate}%</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-bold">Staff by Franchise</h3>
        </div>
        <MiniTable
          headers={["Franchise", "DSM", "DSO", "Total", "Att. Rate", "DSM Names", "DSO Names"]}
          rows={filtered.map((d) => [`${d.name} (${d.id})`, d.dsms.length, d.dsos.length, d.staff, `${d.attendanceRate}%`, d.dsms.map((s) => s.name).join(", ") || "—", d.dsos.map((s) => s.name).join(", ") || "—"])}
          onExport={baseExport(["Franchise","DSM","DSO","Total","Att. Rate","DSM Names","DSO Names"], filtered.map((d) => [`${d.name} (${d.id})`, d.dsms.length, d.dsos.length, d.staff, `${d.attendanceRate}%`, d.dsms.map((s) => s.name).join(", "), d.dsos.map((s) => s.name).join(", ")]), "staff-by-franchise")}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-gray-900 font-bold">All Staff Members</h3>
          <span className="text-gray-400 text-xs">{allStaff.length} total</span>
        </div>
        <MiniTable
          headers={["Name", "Role", "Franchise", "Mobile", "Status", "Salary", "Commission"]}
          rows={allStaff.map((s) => [s.name, s.role, s.franchise, s.mobile, s.status, `PKR ${s.salary.toLocaleString()}`, `PKR ${s.commission.toLocaleString()}`])}
          onExport={baseExport(["Name","Role","Franchise","Mobile","Status","Salary","Commission"], allStaff.map((s) => [s.name, s.role, s.franchise, s.mobile, s.status, s.salary, s.commission]), "all-staff")}
        />
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Income" value={`PKR ${totalIncome.toLocaleString()}`} icon={<ArrowUpRight size={20} className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Total Expenses" value={`PKR ${totalExpenses.toLocaleString()}`} icon={<ArrowDownRight size={20} className="text-red-600" />} color="bg-red-50" />
        <StatCard title="Net Profit" value={`PKR ${netProfit.toLocaleString()}`} subtitle={`${profitMargin}% margin`} icon={<TrendingUp size={20} className={netProfit >= 0 ? "text-emerald-600" : "text-red-600"} />} color={netProfit >= 0 ? "bg-emerald-50" : "bg-red-50"} />
        <StatCard title="Total Payroll" value={`PKR ${totalPayroll.toLocaleString()}`} subtitle={`${totalIncome > 0 ? Math.round((totalPayroll / totalIncome) * 100) : 0}% of income`} icon={<CreditCard size={20} className="text-purple-600" />} color="bg-purple-50" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Wallet size={16} className="text-blue-600" /> Wallet by Franchise</h3>
          <MiniTable
            headers={["Franchise", "Balance"]}
            rows={filtered.map((d) => [d.name, `PKR ${d.walletBalance.toLocaleString()}`])}
            onExport={baseExport(["Franchise","Wallet Balance"], filtered.map((d) => [d.name, d.walletBalance]), "wallet-by-franchise")}
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><DollarSign size={16} className="text-amber-600" /> Revenue by Franchise</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {[...filtered].sort((a, b) => b.revenue - a.revenue).map((d) => (
              <div key={d.id} className="flex items-center gap-2"><span className="text-gray-600 text-xs w-16 truncate">{d.name}</span><MiniBar pct={totalRevenue > 0 ? Math.round((d.revenue / totalRevenue) * 100) : 0} color="bg-amber-500" /><span className="text-gray-900 text-xs font-bold w-16 text-right">PKR {d.revenue.toLocaleString()}</span></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><CreditCard size={16} className="text-red-600" /> Payroll by Franchise</h3>
          <MiniTable
            headers={["Franchise", "Payroll"]}
            rows={filtered.map((d) => [d.name, `PKR ${d.totalPayroll.toLocaleString()}`])}
            onExport={baseExport(["Franchise","Payroll"], filtered.map((d) => [d.name, d.totalPayroll]), "payroll-by-franchise")}
          />
        </div>
      </div>

      {/* Profit/Loss per Franchise */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-600" /> Most Profitable</h3>
          <div className="space-y-3">
            {[...filtered].sort((a, b) => (b.totalIncome - b.totalExpenses) - (a.totalIncome - a.totalExpenses)).slice(0, 5).map((d, i) => {
              const profit = d.totalIncome - d.totalExpenses;
              return (<div key={d.id} className="flex items-center gap-3"><div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{i + 1}</div><div className="flex-1 min-w-0"><p className="text-gray-900 text-sm font-medium truncate">{d.name}</p><p className="text-gray-400 text-xs">Income: PKR {d.totalIncome.toLocaleString()}</p></div><div className="text-right"><p className={`text-sm font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>+PKR {profit.toLocaleString()}</p></div></div>);
            })}
            {filtered.length === 0 && <p className="text-gray-400 text-sm">No data</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> Needs Attention</h3>
          <div className="space-y-3">
            {[...filtered].sort((a, b) => (a.totalIncome - a.totalExpenses) - (b.totalIncome - b.totalExpenses)).slice(0, 5).map((d, i) => {
              const profit = d.totalIncome - d.totalExpenses;
              return (<div key={d.id} className="flex items-center gap-3"><div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500 text-xs font-black">{i + 1}</div><div className="flex-1 min-w-0"><p className="text-gray-900 text-sm font-medium truncate">{d.name}</p><p className="text-gray-400 text-xs">Expenses: PKR {d.totalExpenses.toLocaleString()}</p></div><div className="text-right"><p className={`text-sm font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{profit >= 0 ? "+" : ""}PKR {profit.toLocaleString()}</p></div></div>);
            })}
            {filtered.length === 0 && <p className="text-gray-400 text-sm">No data</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-bold">Full Financial Breakdown</h3>
        </div>
        <MiniTable
          headers={["Franchise", "Wallet", "Income", "Expenses", "Payroll", "Net Profit", "Equipment"]}
          rows={filtered.map((d) => [`${d.name} (${d.id})`, `PKR ${d.walletBalance.toLocaleString()}`, `PKR ${d.totalIncome.toLocaleString()}`, `PKR ${d.totalExpenses.toLocaleString()}`, `PKR ${d.totalPayroll.toLocaleString()}`, `PKR ${(d.totalIncome - d.totalExpenses).toLocaleString()}`, d.equipmentCount])}
          onExport={baseExport(["Franchise","Wallet","Income","Expenses","Payroll","Net Profit","Equipment"], filtered.map((d) => [`${d.name} (${d.id})`, d.walletBalance, d.totalIncome, d.totalExpenses, d.totalPayroll, d.totalIncome - d.totalExpenses, d.equipmentCount]), "financial-breakdown")}
        />
      </div>
    </div>
  );

  const renderActivations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Activations" value={totalActivationsAll} subtitle="All time across all franchises" icon={<TrendingUp size={20} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Today's Activations" value={todayActivations} subtitle={`${totalActivationsAll > 0 ? Math.round((todayActivations / totalActivationsAll) * 100) : 0}% of total`} icon={<Activity size={20} className="text-green-600" />} color="bg-green-50" />
        <StatCard title="Pending" value={totalPendingActivations} subtitle={`${totalActivationsAll > 0 ? Math.round((totalPendingActivations / totalActivationsAll) * 100) : 0}% pending rate`} icon={<Clock size={20} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard title="Avg Per Franchise" value={franchises.length > 0 ? Math.round(totalActivationsAll / franchises.length) : 0} subtitle={`${Object.keys(activationsByTypeAll).length} types`} icon={<BarChart3 size={20} className="text-purple-600" />} color="bg-purple-50" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><PieChart size={16} className="text-cyan-600" /> By Type</h3>
          <div className="space-y-3">
            {Object.entries(activationsByTypeAll).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const pct = totalActivationsAll > 0 ? Math.round((count / totalActivationsAll) * 100) : 0;
              const tcmap: Record<string, string> = { activation: "bg-cyan-500", byn: "bg-amber-500", mnp: "bg-purple-500", replacement: "bg-rose-500" };
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${tcmap[type] || "bg-gray-400"}`} />
                  <span className="text-gray-700 text-sm w-24 capitalize">{type}</span>
                  <Bar value={count} max={totalActivationsAll} color={tcmap[type] || "bg-gray-400"} />
                  <span className="text-gray-900 text-sm font-bold w-12 text-right">{count}</span>
                  <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
                </div>
              );
            })}
            {Object.keys(activationsByTypeAll).length === 0 && <p className="text-gray-400 text-sm py-4 text-center">No activation data</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Activity size={16} className="text-emerald-600" /> Performance Summary</h3>
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 text-center">
              <p className="text-blue-600 text-sm font-medium">Total Activations</p>
              <p className="text-blue-700 text-4xl font-black mt-2">{totalActivationsAll}</p>
              <div className="flex justify-center gap-4 mt-3">
                <div><p className="text-blue-500 text-xs">Today</p><p className="text-blue-700 font-bold text-lg">{todayActivations}</p></div>
                <div className="w-px bg-blue-200" />
                <div><p className="text-blue-500 text-xs">Pending</p><p className="text-blue-700 font-bold text-lg">{totalPendingActivations}</p></div>
                <div className="w-px bg-blue-200" />
                <div><p className="text-blue-500 text-xs">Avg/F</p><p className="text-blue-700 font-bold text-lg">{franchises.length > 0 ? Math.round(totalActivationsAll / franchises.length) : 0}</p></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-amber-600 text-xs font-medium">Pending Rate</p>
                <p className="text-amber-700 text-2xl font-black mt-1">{totalActivationsAll > 0 ? Math.round((totalPendingActivations / totalActivationsAll) * 100) : 0}%</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-green-600 text-xs font-medium">Completion Rate</p>
                <p className="text-green-700 text-2xl font-black mt-1">{totalActivationsAll > 0 ? Math.round(((totalActivationsAll - totalPendingActivations) / totalActivationsAll) * 100) : 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-bold">Activations by Franchise</h3>
        </div>
        <MiniTable
          headers={["Franchise", "Total", "Today", "Pending", "Completion %", "By Type"]}
          rows={filtered.map((d) => [`${d.name} (${d.id})`, d.totalActivations, d.todayActivations, d.pendingActivations, `${d.totalActivations > 0 ? Math.round(((d.totalActivations - d.pendingActivations) / d.totalActivations) * 100) : 0}%`, Object.entries(d.activationsByType).map(([k, v]) => `${k}: ${v}`).join(", ") || "—"])}
          onExport={baseExport(["Franchise","Total","Today","Pending","Completion %","By Type"], filtered.map((d) => [`${d.name} (${d.id})`, d.totalActivations, d.todayActivations, d.pendingActivations, `${d.totalActivations > 0 ? Math.round(((d.totalActivations - d.pendingActivations) / d.totalActivations) * 100) : 0}%`, Object.entries(d.activationsByType).map(([k, v]) => `${k}: ${v}`).join(", ")]), "activations-by-franchise")}
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (tab) {
      case "overview": return renderOverview();
      case "sims": return renderSIMs();
      case "devices": return renderDevices();
      case "staff": return renderStaff();
      case "financial": return renderFinancial();
      case "activations": return renderActivations();
    }
  };

  const getExportData = () => {
    const tabLabel = tabs.find((t) => t.key === tab)?.label || "Data";
    const date = new Date().toISOString().split("T")[0];
    switch (tab) {
      case "overview": return { title: `${tabLabel} - ${date}`, headers: ["Franchise","Owner","Status","SIMs","Devices","Staff","Revenue","Attendance"], rows: topFranchises.map((d) => [d.name, d.owner, d.status, d.sims, d.devices, d.staff, d.revenue, `${d.attendanceRate}%`]) };
      case "sims": return { title: `${tabLabel} - ${date}`, headers: ["Franchise","Total","New","HLR"], rows: filtered.map((d) => [d.name, d.sims, d.newSims, d.hlrSims]) };
      case "devices": return { title: `${tabLabel} - ${date}`, headers: ["Franchise","Total Devices"], rows: filtered.map((d) => [d.name, d.devices]) };
      case "staff": return { title: `${tabLabel} - ${date}`, headers: ["Name","Role","Franchise","Salary"], rows: allStaff.map((s) => [s.name, s.role, s.franchise, s.salary]) };
      case "financial": return { title: `${tabLabel} - ${date}`, headers: ["Franchise","Income","Expenses","Payroll","Profit"], rows: filtered.map((d) => [d.name, d.totalIncome, d.totalExpenses, d.totalPayroll, d.totalIncome - d.totalExpenses]) };
      case "activations": return { title: `${tabLabel} - ${date}`, headers: ["Franchise","Total","Today","Pending"], rows: filtered.map((d) => [d.name, d.totalActivations, d.todayActivations, d.pendingActivations]) };
    }
  };

  const handleGlobalExport = (format: "csv" | "xls" | "pdf") => {
    const data = getExportData();
    if (!data) return;
    const filename = `company-${tab}-${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") exportCSV(data.headers, data.rows, `${filename}.csv`);
    else if (format === "xls") exportXLS(data.headers, data.rows, data.title, `${filename}.xls`, companyProfile);
    else handlePrint();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) { window.print(); return; }
    const data = getExportData();
    const date = new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const companyName = companyProfile.companyName || "THE SMART ERP";
    const ownerLine = companyProfile.ownerName ? `<p style="font-size:12px;color:#555;margin:2px 0">Owner: ${companyProfile.ownerName}</p>` : "";
    const contactParts = [companyProfile.phone, companyProfile.email].filter(Boolean).join(" &bull; ");
    const addressParts = [companyProfile.address, companyProfile.city, companyProfile.province].filter(Boolean).join(", ");
    const footerDetails = [contactParts, addressParts].filter(Boolean).join(" &bull; ");
    const tableRows = data ? data.rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #ccc;padding:6px 10px;color:#333;font-size:11px">${String(c)}</td>`).join("")}</tr>`).join("") : "";
    const headerRow = data ? data.headers.map((h) => `<th style="border:1px solid #999;padding:8px 10px;background:#333;color:#fff;font-size:11px;font-weight:700;text-align:left">${h}</th>`).join("") : "";
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Company Report</title>
      <style>
        @page { margin: 20mm 15mm; }
        body { font-family:Arial,sans-serif; margin:0; padding:20px; color:#333; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .print-header { text-align:center; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:12px; }
        .print-header h1 { font-size:20px; font-weight:700; color:#000; margin:0 0 4px; }
        .print-header h2 { font-size:14px; font-weight:600; color:#555; margin:0 0 2px; }
        .print-header p { font-size:11px; color:#888; margin:0; }
        table { border-collapse:collapse; width:100%; margin-top:12px; }
        th, td { border:1px solid #ccc; padding:7px 10px; font-size:11px; text-align:left; }
        th { background:#333; color:#fff; font-weight:700; }
        td { color:#333; }
        tr:nth-child(even) td { background:#f5f5f5; }
        .print-footer { text-align:center; margin-top:20px; font-size:10px; color:#999; border-top:1px solid #ddd; padding-top:8px; }
        .no-print { display:none; }
      </style></head><body>
      <div class="print-header">
        <h1>${companyName}</h1>
        ${ownerLine}
        <h2>${data ? data.title : "Company Report"}</h2>
        <p>Generated: ${date}</p>
      </div>
      ${data ? `<table><thead><tr>${headerRow}</tr></thead><tbody>${tableRows}</tbody></table>` : "<p>No data available</p>"}
      <div class="print-footer">${companyName}${footerDetails ? ` &bull; ${footerDetails}` : ""} &bull; ${date.split(",")[0]}</div>
      <script>window.onload=function(){window.print();window.close();}<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  return (
    <>
      <style>{`
        @media print {
          body { background: #fff !important; color: #333 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .bg-white, .bg-gray-50, .bg-blue-50, .bg-purple-50, .bg-green-50, .bg-amber-50, .bg-red-50, .bg-emerald-50, .bg-cyan-50, .bg-indigo-50, .bg-rose-50 { background: #f9f9f9 !important; }
          .text-blue-600, .text-purple-600, .text-green-600, .text-amber-600, .text-red-600, .text-emerald-600, .text-cyan-600, .text-indigo-600, .text-rose-600 { color: #333 !important; }
          .border-gray-100, .border-gray-200 { border-color: #ddd !important; }
          .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; }
          .rounded-2xl, .rounded-xl, .rounded-lg { border-radius: 4px !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .print-only { display: none; }
      `}</style>
    <div ref={printRef} className="space-y-6">
      {/* Print-only Header */}
      <div className="print-only" style={{ textAlign: "center", marginBottom: 16, borderBottom: "2px solid #333", paddingBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#000", margin: "0 0 4px" }}>{companyProfile.companyName || "THE SMART ERP"}</h1>
        {companyProfile.ownerName ? <p style={{ fontSize: 12, color: "#555", margin: "0 0 2px" }}>Owner: {companyProfile.ownerName}</p> : null}
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "#555", margin: "0 0 2px" }}>Company Reports — {tabs.find((t) => t.key === tab)?.label || ""}</h2>
        <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{franchises.length} franchises · {totalStaff} staff · {totalSIMs} SIMs · {totalDevices} devices · {todayActivations} today</p>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Company Reports</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <BarChart3 size={14} />
            {franchises.length} franchises · {totalStaff} staff · {totalSIMs} SIMs · {totalDevices} devices
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            {todayActivations} today
          </p>
        </div>
          <div className="flex items-center gap-2 no-print">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {["table", "grid"].map((v) => (
                <button key={v} onClick={() => setViewMode(v as ViewMode)} className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${viewMode === v ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>{v === "table" ? <List size={14} /> : <Grid3X3 size={14} />}</button>
              ))}
            </div>
            <div className="relative">
              <button onClick={() => setExportOpen((p) => !p)} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-md">
                <FileDown size={14} /> Export
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-50 w-44 overflow-hidden">
                  <button onClick={() => { handleGlobalExport("csv"); setExportOpen(false); }} className="w-full px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"><FileDown size={14} className="text-green-600" /> CSV</button>
                  <button onClick={() => { handleGlobalExport("xls"); setExportOpen(false); }} className="w-full px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"><FileSpreadsheet size={14} className="text-green-600" /> XLS (Excel)</button>
                  <button onClick={() => { handleGlobalExport("pdf"); setExportOpen(false); }} className="w-full px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"><FileText size={14} className="text-red-600" /> PDF</button>
                </div>
              )}
              {exportOpen && <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />}
            </div>
            <button onClick={handlePrint} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5">
              <Printer size={14} /> Print
            </button>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white rounded-2xl p-1.5 border border-gray-200 no-print">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.key ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
            <t.icon size={15} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search franchise..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
          {search && <button onClick={() => setSearch("")}><X size={14} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Pending", "Suspended"].map((s) => (
            <button key={s} onClick={() => setFranchiseFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${franchiseFilter === s ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{s}</button>
          ))}
        </div>
        {/* Sort Controls */}
        {tab === "overview" && (
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200">
            {(["revenue", "sims", "staff", "devices"] as SortKey[]).map((k) => (
              <button key={k} onClick={() => toggleSort(k)} className={`px-3 py-1.5 rounded-lg text-[10px] font-medium capitalize transition-all ${sortKey === k ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}>
                {k} {sortKey === k ? (sortDir === "asc" ? <ChevronUp size={10} className="inline" /> : <ChevronDown size={10} className="inline" />) : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">{renderTabContent()}</div>

      {franchises.length === 0 && !loading && (
        <div className="text-center py-16 no-print">
          <Building2 size={40} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-500 font-bold text-lg">No Franchises Found</h3>
          <p className="text-gray-400 text-sm mt-1">No franchises are assigned to this company yet.</p>
        </div>
      )}

      {/* Print-only Footer */}
      <div className="print-only" style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: "#999", borderTop: "1px solid #ddd", paddingTop: 8 }}>
        {companyProfile.companyName || "THE SMART ERP"}{companyProfile.phone || companyProfile.email ? ` &bull; ${[companyProfile.phone, companyProfile.email].filter(Boolean).join(" · ")}` : ""}{companyProfile.address || companyProfile.city || companyProfile.province ? ` &bull; ${[companyProfile.address, companyProfile.city, companyProfile.province].filter(Boolean).join(", ")}` : ""} &bull; {new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
      </div>
    </div>
    </>
  );
}

// Helper icons
function List({ size, className }: { size: number; className?: string }) {
  return <BarChart3 size={size} className={className} />;
}
function Grid3X3({ size, className }: { size: number; className?: string }) {
  return <LayoutDashboard size={size} className={className} />;
}