"use client";

import StatsCard from "@/components/admin/StatsCard";
import { Building2, Users, CreditCard, TrendingUp, Wifi, AlertTriangle, DollarSign, Activity, Bell, Clock, Server, ShieldCheck, MapPin, Package } from "lucide-react";
import { useData } from "@/lib/DataContext";

export default function DashboardPage() {
  const { franchises, employees, payments, subscriptions, notifications, auditLogs } = useData();

  const active = franchises.filter((f) => f.status === "Active").length;
  const pending = franchises.filter((f) => f.status === "Pending").length;
  const suspended = franchises.filter((f) => f.status === "Suspended").length;
  const totalPaid = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + Number(p.amount), 0);
  const expiring = franchises.filter((f) => {
    const end = new Date(f.agreementEnd);
    const now = new Date();
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  });

  const byPackage = franchises.reduce<Record<string, number>>((acc, f) => {
    acc[f.package] = (acc[f.package] || 0) + 1;
    return acc;
  }, {});
  const byProvince = franchises.reduce<Record<string, number>>((acc, f) => {
    acc[f.province] = (acc[f.province] || 0) + 1;
    return acc;
  }, {});

  const totalDSM = employees.filter((e) => e.role === "DSM").length;
  const totalDSO = employees.filter((e) => e.role === "DSO").length;
  const totalStaff = totalDSM + totalDSO;

  const today = new Date().toISOString().split("T")[0];
  const todayActivityCount = auditLogs.filter((l) => l.time.startsWith(today)).length;
  const recentLogins = auditLogs.filter((l) => l.action === "Login").length;
  const recentSystemEvents = auditLogs.filter((l) => l.type === "system").length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const stats = [
    { title: "Total Franchises", value: String(franchises.length), change: `${active} active`, changeType: "up" as const, icon: <Building2 size={20} className="text-[#C8A951]" />, color: "bg-amber-50" },
    { title: "Active Franchises", value: String(active), change: `${franchises.length > 0 ? Math.round((active / franchises.length) * 100) : 0}%`, changeType: "up" as const, icon: <TrendingUp size={20} className="text-green-600" />, color: "bg-green-50" },
    { title: "Total Staff", value: String(totalStaff), change: `${totalDSM} DSM · ${totalDSO} DSO`, changeType: "neutral" as const, icon: <Users size={20} className="text-blue-600" />, color: "bg-blue-50" },
    { title: "Total Revenue", value: `PKR ${(totalPaid / 1000).toFixed(0)}K`, change: `${payments.filter((p) => p.status === "Paid").length} invoices`, changeType: "up" as const, icon: <DollarSign size={20} className="text-[#C8A951]" />, color: "bg-amber-50" },
    { title: "Pending", value: String(pending), change: "Awaiting approval", changeType: "neutral" as const, icon: <AlertTriangle size={20} className="text-yellow-600" />, color: "bg-yellow-50" },
    { title: "Suspended", value: String(suspended), change: "Needs attention", changeType: "down" as const, icon: <Building2 size={20} className="text-red-600" />, color: "bg-red-50" },
    { title: "Expiring Soon", value: String(expiring.length), change: "Within 30 days", changeType: "neutral" as const, icon: <CreditCard size={20} className="text-yellow-600" />, color: "bg-yellow-50" },
    { title: "Notifications", value: String(unreadNotifs), change: `${todayActivityCount} events today`, changeType: unreadNotifs > 0 ? "up" as const : "neutral" as const, icon: <Bell size={20} className="text-[#C8A951]" />, color: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. {franchises.length} franchises · {totalStaff} staff · {todayActivityCount} events today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 font-bold">Revenue Overview</h3>
            <span className="text-gray-400 text-sm">Last 12 months</span>
          </div>
          <div className="flex items-end gap-2 h-48">
            {[35, 55, 40, 70, 45, 85, 60, 75, 50, 90, 65, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80" style={{ height: `${h}%`, background: i === 11 ? "linear-gradient(to top, #C8A951, #D4BC6A)" : "linear-gradient(to top, #0A2647, #205295)" }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
              <span key={m} className="text-gray-400 text-[10px]">{m}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-bold mb-6">Franchise Status</h3>
          <div className="space-y-4">
            {[
              { label: "Active", count: active, color: "bg-green-500", pct: franchises.length > 0 ? Math.round((active / franchises.length) * 100) : 0 },
              { label: "Pending", count: pending, color: "bg-yellow-500", pct: franchises.length > 0 ? Math.round((pending / franchises.length) * 100) : 0 },
              { label: "Suspended", count: suspended, color: "bg-red-500", pct: franchises.length > 0 ? Math.round((suspended / franchises.length) * 100) : 0 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-600 text-sm">{s.label}</span>
                  <span className="text-gray-900 font-bold text-sm">{s.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-gray-500 text-xs font-bold uppercase mb-3 flex items-center gap-2"><MapPin size={12} /> By Province</h4>
            <div className="space-y-2">
              {Object.entries(byProvince).map(([prov, count]) => {
                const pct = Math.round((count / franchises.length) * 100);
                return (
                  <div key={prov} className="flex items-center gap-2">
                    <span className="text-gray-600 text-xs w-16 truncate">{prov}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0A2647] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-900 text-xs font-bold w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-gray-500 text-xs font-bold uppercase mb-3 flex items-center gap-2"><Package size={12} /> By Package</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(byPackage).map(([pkg, count]) => (
                <div key={pkg} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-gray-900 text-sm font-bold">{count}</p>
                  <p className="text-gray-400 text-[10px]">{pkg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Franchises Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold">Franchises</h3>
            <a href="/admin/franchises" className="text-[#0A2647] text-xs font-medium hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Franchise</th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Owner</th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-gray-500 text-xs font-medium uppercase">Team</th>
                </tr>
              </thead>
              <tbody>
                {franchises.slice(0, 5).map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{f.id}</p>
                        <p className="text-gray-500 text-xs">{f.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm">{f.owner}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${f.status === "Active" ? "bg-green-50 text-green-700" : f.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{f.status}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm text-right">DSM:{f.dsm} DSO:{f.dso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Expiring Packages */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-bold">Expiring Packages</h3>
              <span className="text-yellow-700 text-xs font-medium bg-yellow-50 px-2 py-1 rounded-lg">{expiring.length} pending</span>
            </div>
            <div className="space-y-3">
              {expiring.length === 0 && <p className="text-gray-400 text-sm">No packages expiring soon</p>}
              {expiring.map((f) => {
                const days = Math.ceil((new Date(f.agreementEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={f.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{f.id}</p>
                      <p className="text-gray-500 text-xs">{f.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">{f.agreementEnd}</p>
                      <p className={`text-xs font-medium ${days <= 7 ? "text-red-600" : "text-yellow-600"}`}>{days} days left</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Server size={16} className="text-[#0A2647]" /> System Health</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <Server size={16} className="mx-auto mb-1 text-green-600" />
                <p className="text-lg font-black text-green-600">99.9%</p>
                <p className="text-gray-500 text-[10px]">Uptime</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <Activity size={16} className="mx-auto mb-1 text-blue-600" />
                <p className="text-lg font-black text-blue-600">{totalStaff}</p>
                <p className="text-gray-500 text-[10px]">Active Users</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <Clock size={16} className="mx-auto mb-1 text-amber-600" />
                <p className="text-lg font-black text-amber-600">{recentSystemEvents}</p>
                <p className="text-gray-500 text-[10px]">System Events</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-green-600"><ShieldCheck size={12} /> All systems operational</span>
              <span className="text-gray-400">{recentLogins} logins recorded</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-gray-900 font-bold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Total Revenue Collected</span>
                <span className="text-gray-900 font-bold text-sm">PKR {totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Pending Payments</span>
                <span className="text-yellow-600 font-bold text-sm">PKR {payments.filter((p) => p.status === "Pending").reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Total DSMs</span>
                <span className="text-gray-900 font-bold text-sm">{totalDSM}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Total DSOs</span>
                <span className="text-gray-900 font-bold text-sm">{totalDSO}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500 text-sm">Package Types</span>
                <span className="text-gray-900 font-bold text-sm">{Object.keys(byPackage).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-gray-900 font-bold flex items-center gap-2"><Activity size={16} className="text-[#0A2647]" /> Recent Activity</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">{auditLogs.length} events</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {auditLogs.slice(0, 8).map((log, i) => {
            const iconMap: Record<string, React.ReactNode> = {
              auth: <Users size={14} className="text-blue-600" />,
              update: <Building2 size={14} className="text-amber-600" />,
              payment: <DollarSign size={14} className="text-green-600" />,
              system: <Server size={14} className="text-purple-600" />,
            };
            const colorMap: Record<string, string> = {
              auth: "bg-blue-50",
              update: "bg-amber-50",
              payment: "bg-green-50",
              system: "bg-purple-50",
            };
            return (
              <div key={i} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${colorMap[log.type] || "bg-gray-50"} flex items-center justify-center flex-shrink-0`}>
                  {iconMap[log.type] || <Clock size={14} className="text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 text-sm font-medium">{log.action}</span>
                    <span className="text-gray-400 text-xs">by {log.user}</span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">{log.detail}</p>
                </div>
                <span className="text-gray-400 text-[10px] whitespace-nowrap flex-shrink-0">{log.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold flex items-center gap-2"><Bell size={16} className="text-[#0A2647]" /> Notifications</h3>
            <span className="text-[#0A2647] text-xs font-medium bg-gray-50 px-2 py-1 rounded-lg">{unreadNotifs} unread</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
            {notifications.slice(0, 4).map((n, i) => (
              <div key={i} className={`p-3 rounded-xl ${!n.read ? "bg-blue-50/50 border border-blue-100" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-green-500" : n.type === "error" ? "bg-red-500" : "bg-blue-500"}`} />
                  <span className="text-gray-900 text-xs font-bold truncate">{n.title}</span>
                </div>
                <p className="text-gray-500 text-[10px] truncate">{n.message}</p>
                <p className="text-gray-400 text-[10px] mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
