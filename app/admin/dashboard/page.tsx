"use client";

import Link from "next/link";
import { Building2, Users, CreditCard, TrendingUp, AlertTriangle, DollarSign, Activity, Bell, Clock, Server, ShieldCheck, MapPin, Package, Calendar } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

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
    { label: "Total Franchises", value: String(franchises.length), sub: `${active} active`, icon: Building2, iconClass: "text-blue-600 bg-blue-50" },
    { label: "Active Franchises", value: String(active), sub: `${franchises.length > 0 ? Math.round((active / franchises.length) * 100) : 0}% of all`, icon: TrendingUp, iconClass: "text-green-600 bg-green-50" },
    { label: "Total Staff", value: String(totalStaff), sub: `${totalDSM} DSM · ${totalDSO} DSO`, icon: Users, iconClass: "text-blue-600 bg-blue-50" },
    { label: "Total Revenue", value: `PKR ${(totalPaid / 1000).toFixed(0)}K`, sub: `${payments.filter((p) => p.status === "Paid").length} invoices`, icon: DollarSign, iconClass: "text-amber-600 bg-amber-50" },
    { label: "Pending", value: String(pending), sub: "Awaiting approval", icon: AlertTriangle, iconClass: "text-orange-600 bg-orange-50" },
    { label: "Suspended", value: String(suspended), sub: "Needs attention", icon: Building2, iconClass: "text-red-600 bg-red-50" },
    { label: "Expiring Soon", value: String(expiring.length), sub: "Within 30 days", icon: CreditCard, iconClass: "text-orange-600 bg-orange-50" },
    { label: "Notifications", value: String(unreadNotifs), sub: `${todayActivityCount} events today`, icon: Bell, iconClass: "text-blue-600 bg-blue-50" },
  ];

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
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Dashboard" }]}
        title="Dashboard Overview"
        description={`Welcome back. ${franchises.length} franchises · ${totalStaff} staff · ${todayActivityCount} events today.`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4" /> Last 12 Months
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" /> Notifications
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} icon={s.icon} iconClass={s.iconClass} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Revenue Overview</CardTitle>
            <span className="text-xs text-muted-foreground">Last 12 months</span>
          </CardHeader>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex h-48 items-end gap-2">
              {[35, 55, 40, 70, 45, 85, 60, 75, 50, 90, 65, 80].map((h, i) => (
                <div
                  key={i}
                  className="w-full flex-1 rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{ height: `${h}%`, background: i === 11 ? "linear-gradient(to top, #FFFB63, #FDE408)" : "#2563eb" }}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                <span key={m} className="text-[10px] text-muted-foreground">{m}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Franchise Status</CardTitle>
          </CardHeader>
          <div className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
            {[
              { label: "Active", count: active, color: "bg-green-500", pct: franchises.length > 0 ? Math.round((active / franchises.length) * 100) : 0 },
              { label: "Pending", count: pending, color: "bg-amber-500", pct: franchises.length > 0 ? Math.round((pending / franchises.length) * 100) : 0 },
              { label: "Suspended", count: suspended, color: "bg-red-500", pct: franchises.length > 0 ? Math.round((suspended / franchises.length) * 100) : 0 },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="text-sm font-bold text-foreground">{s.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 px-4 pb-4 pt-4 sm:px-6 sm:pb-6">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><MapPin className="h-3 w-3 text-brand-600" /> By Province</h4>
            <div className="space-y-2">
              {Object.entries(byProvince).map(([prov, count]) => {
                const pct = Math.round((count / franchises.length) * 100);
                return (
                  <div key={prov} className="flex items-center gap-2">
                    <span className="w-16 truncate text-xs text-muted-foreground">{prov}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 pb-4 pt-4 sm:px-6 sm:pb-6">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Package className="h-3 w-3 text-brand-600" /> By Package</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(byPackage).map(([pkg, count]) => (
                <div key={pkg} className="rounded-lg bg-slate-50 p-2 text-center">
                  <p className="text-sm font-bold text-foreground">{count}</p>
                  <p className="text-[10px] text-muted-foreground">{pkg}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Franchises</CardTitle>
            <Link href="/admin/franchises" className="text-xs font-medium text-brand-700 hover:underline">View All</Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Franchise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Team</th>
                </tr>
              </thead>
              <tbody>
                {franchises.slice(0, 5).map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{f.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{f.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{f.owner}</td>
                    <td className="px-6 py-3">
                      <StatusPill label={f.status} tone={toneForStatus(f.status)} />
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-muted-foreground">DSM:{f.dsm} DSO:{f.dso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Expiring Packages</CardTitle>
              <StatusPill label={`${expiring.length} pending`} tone="warning" />
            </CardHeader>
            <div className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
              {expiring.length === 0 && (
                <EmptyState icon={CreditCard} title="No packages expiring soon" description="All franchise agreements are more than 30 days out." />
              )}
              {expiring.map((f) => {
                const days = Math.ceil((new Date(f.agreementEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={f.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{f.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{f.agreementEnd}</p>
                      <p className={`text-xs font-medium ${days <= 7 ? "text-red-600" : "text-amber-600"}`}>{days} days left</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-600"><Server className="h-3.5 w-3.5" /></span>
                System Health
              </CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <Server size={16} className="mx-auto mb-1 text-green-600" />
                  <p className="text-lg font-bold text-green-600">99.9%</p>
                  <p className="text-[10px] text-muted-foreground">Uptime</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <Activity size={16} className="mx-auto mb-1 text-blue-600" />
                  <p className="text-lg font-bold text-blue-600">{totalStaff}</p>
                  <p className="text-[10px] text-muted-foreground">Active Users</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <Clock size={16} className="mx-auto mb-1 text-amber-600" />
                  <p className="text-lg font-bold text-amber-600">{recentSystemEvents}</p>
                  <p className="text-[10px] text-muted-foreground">System Events</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-medium text-green-600"><ShieldCheck size={12} /> All systems operational</span>
                <span className="text-muted-foreground">{recentLogins} logins recorded</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Total Revenue Collected</span>
                  <span className="text-sm font-bold text-foreground">PKR {totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 py-2">
                  <span className="text-sm text-muted-foreground">Pending Payments</span>
                  <span className="text-sm font-bold text-amber-600">PKR {payments.filter((p) => p.status === "Pending").reduce((s, p) => s + Number(p.amount), 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 py-2">
                  <span className="text-sm text-muted-foreground">Total DSMs</span>
                  <span className="text-sm font-bold text-foreground">{totalDSM}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 py-2">
                  <span className="text-sm text-muted-foreground">Total DSOs</span>
                  <span className="text-sm font-bold text-foreground">{totalDSO}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 py-2">
                  <span className="text-sm text-muted-foreground">Package Types</span>
                  <span className="text-sm font-bold text-foreground">{Object.keys(byPackage).length}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-600"><Activity className="h-3.5 w-3.5" /></span>
            Recent Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{auditLogs.length} events</span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 8).map((log, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-slate-50">
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[log.type] || "bg-slate-50"}`}>
                {iconMap[log.type] || <Clock size={14} className="text-slate-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{log.action}</span>
                  <span className="text-xs text-muted-foreground">by {log.user}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{log.detail}</p>
              </div>
              <span className="flex-shrink-0 whitespace-nowrap font-mono text-xs text-muted-foreground">{log.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {notifications.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-600"><Bell className="h-3.5 w-3.5" /></span>
              Notifications
            </CardTitle>
            <StatusPill label={`${unreadNotifs} unread`} tone="brand" />
          </CardHeader>
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            {notifications.slice(0, 4).map((n, i) => (
              <div key={i} className={`rounded-lg border p-3 ${!n.read ? "border-brand-100 bg-brand-50/50" : "border-slate-100 bg-slate-50"}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-green-500" : n.type === "error" ? "bg-red-500" : "bg-brand-500"}`} />
                  <span className="truncate text-xs font-bold text-foreground">{n.title}</span>
                </div>
                <p className="truncate text-[10px] text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/80">{n.time}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}