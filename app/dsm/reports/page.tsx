"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { BarChart3, Calendar, Download, TrendingUp, Smartphone, CheckCircle, Clock, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReportsPage() {
  const { activations, dsos } = useDSMData();
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "yearly">("daily");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const dailyActivations = activations.filter((a) => a.createdAt.startsWith(todayStr));
  const monthlyActivations = activations.filter((a) => {
    const d = new Date(a.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const yearlyActivations = activations.filter((a) => new Date(a.createdAt).getFullYear() === currentYear);

  const completionRate = (list: typeof activations) => {
    if (list.length === 0) return 0;
    return Math.round((list.filter((a) => a.status === "completed").length / list.length) * 100);
  };

  const typeBreakdown = (list: typeof activations) => {
    const breakdown: Record<string, number> = {};
    list.forEach((a) => {
      breakdown[a.type] = (breakdown[a.type] || 0) + 1;
    });
    return breakdown;
  };

  const topDSO = (list: typeof activations) => {
    const counts: Record<string, { name: string; count: number }> = {};
    list.forEach((a) => {
      if (!counts[a.dsoId]) {
        const dso = dsos.find((d) => d.id === a.dsoId);
        counts[a.dsoId] = { name: dso?.name ?? a.dsoId, count: 0 };
      }
      counts[a.dsoId].count++;
    });
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    return sorted.length > 0 ? sorted[0] : null;
  };

  const monthlyTrend = (list: typeof activations) => {
    const months: Record<string, number> = {};
    list.forEach((a) => {
      const d = new Date(a.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));
  };

  const topPerformers = (list: typeof activations) => {
    const counts: Record<string, { name: string; completed: number; total: number }> = {};
    list.forEach((a) => {
      if (!counts[a.dsoId]) {
        const dso = dsos.find((d) => d.id === a.dsoId);
        counts[a.dsoId] = { name: dso?.name ?? a.dsoId, completed: 0, total: 0 };
      }
      counts[a.dsoId].total++;
      if (a.status === "Completed") counts[a.dsoId].completed++;
    });
    return Object.values(counts)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);
  };

  const exportCSV = () => {
    const data = activeTab === "daily" ? dailyActivations : activeTab === "monthly" ? monthlyActivations : yearlyActivations;
    const headers = ["ID", "Type", "Customer", "CNIC", "MSISDN", "SIM", "Network", "DSO", "Status", "Date"];
    const rows = data.map((a) => { const dso = dsos.find((d) => d.id === a.dsoId); return [a.id, a.type, a.customerName, a.customerCNIC, a.simNumber, a.network, dso?.name ?? a.dsoId, a.status, a.createdAt]; });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-report-${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Reports" }]}
        title="Reports"
        description="View and export activation reports"
        actions={
          <Button onClick={exportCSV}>
            <Download size={18} />
            Export CSV
          </Button>
        }
      />

      <div className="flex gap-2">
        {(["daily", "monthly", "yearly"] as const).map((tab) => (
          <QuickChip
            key={tab}
            label={tab.charAt(0).toUpperCase() + tab.slice(1)}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {activeTab === "daily" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Today's Activations" value={dailyActivations.length} icon={Smartphone} iconClass="text-brand-600 bg-brand-50" />
            <StatCard label="Completion Rate" value={`${completionRate(dailyActivations)}%`} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
            <StatCard label="Pending" value={dailyActivations.filter((a) => a.status === "pending").length} icon={Clock} iconClass="text-amber-600 bg-amber-50" />
            <StatCard label="Failed" value={dailyActivations.filter((a) => a.status === "failed").length} icon={XCircle} iconClass="text-red-600 bg-red-50" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(typeBreakdown(dailyActivations)).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-sm font-medium capitalize text-foreground">{type}</span>
                    <span className="text-sm font-bold text-brand-600">{count}</span>
                  </div>
                ))}
                {Object.keys(typeBreakdown(dailyActivations)).length === 0 && (
                  <EmptyState icon={Smartphone} title="No activations today" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "monthly" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="This Month" value={monthlyActivations.length} icon={BarChart3} iconClass="text-brand-600 bg-brand-50" />
            <StatCard label="Completion Rate" value={`${completionRate(monthlyActivations)}%`} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
            <StatCard label="Top DSO" value={topDSO(monthlyActivations)?.name || "N/A"} icon={TrendingUp} iconClass="text-emerald-600 bg-emerald-50" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(typeBreakdown(monthlyActivations)).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-sm font-medium capitalize text-foreground">{type}</span>
                    <span className="text-sm font-bold text-brand-600">{count}</span>
                  </div>
                ))}
                {Object.keys(typeBreakdown(monthlyActivations)).length === 0 && (
                  <EmptyState icon={BarChart3} title="No activations this month" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "yearly" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="This Year" value={yearlyActivations.length} icon={Calendar} iconClass="text-brand-600 bg-brand-50" />
            <StatCard label="Completion Rate" value={`${completionRate(yearlyActivations)}%`} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
            <StatCard label="Months Active" value={monthlyTrend(yearlyActivations).length} icon={TrendingUp} iconClass="text-emerald-600 bg-emerald-50" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthlyTrend(yearlyActivations).map(({ month, count }) => (
                    <div key={month} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <span className="text-sm font-medium text-foreground">{month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full"
                            style={{ width: `${Math.min((count / Math.max(...monthlyTrend(yearlyActivations).map((t) => t.count), 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-brand-600">{count}</span>
                      </div>
                    </div>
                  ))}
                  {monthlyTrend(yearlyActivations).length === 0 && (
                    <EmptyState icon={Calendar} title="No data for this year" />
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers(yearlyActivations).map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-brand-600">#{i + 1}</span>
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{p.completed}/{p.total}</span>
                    </div>
                  ))}
                  {topPerformers(yearlyActivations).length === 0 && (
                    <EmptyState icon={TrendingUp} title="No performers yet" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}