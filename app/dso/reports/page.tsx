"use client";

import { useState } from "react";
import { FileText, Download, BarChart3, CheckCircle2, Clock, Calendar } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";

export default function DSOReportsPage() {
  const { activations, attendance, wallet, targets } = useDSOData();
  const [activeReport, setActiveReport] = useState<"daily" | "monthly" | "yearly">("daily");

  const completedActivations = activations.filter((a) => a.status === "Completed");
  const pendingBVS = activations.filter((a) => a.status === "Pending BVS").length;
  const pendingFCA = activations.filter((a) => a.status === "Pending FCA").length;
  const pendingIFCA = activations.filter((a) => a.status === "Pending IFCA").length;

  const totalTarget = targets.newSIM + targets.mnp + targets.replacement + targets.byn;
  const totalAchieved = targets.newSIMAchieved + targets.mnpAchieved + targets.replacementAchieved + targets.bynAchieved;
  const successRate = activations.length > 0 ? Math.round((completedActivations.length / activations.length) * 100) : 0;

  const reportTypes = [
    { key: "daily" as const, label: "Daily Report", icon: Calendar, color: "blue" },
    { key: "monthly" as const, label: "Monthly Report", icon: BarChart3, color: "green" },
    { key: "yearly" as const, label: "Yearly Report", icon: FileText, color: "orange" },
  ];

  const dailyData = [
    { label: "Total Activations", value: activations.length },
    { label: "Completed", value: completedActivations.length },
    { label: "Pending BVS", value: pendingBVS },
    { label: "Pending FCA", value: pendingFCA },
    { label: "Pending IFCA", value: pendingIFCA },
  ];

  const monthlyData = [
    { label: "Total Activations", value: activations.length },
    { label: "Success Rate", value: `${successRate}%` },
    { label: "Attendance Days", value: attendance.length },
    { label: "Wallet Credits", value: `PKR ${wallet.filter((w) => w.type === "Credit").reduce((s, w) => s + w.amount, 0).toLocaleString()}` },
  ];

  const yearlyData = [
    { label: "Target", value: `${totalTarget} total` },
    { label: "Achieved", value: `${totalAchieved} total` },
    { label: "Progress", value: `${totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0}%` },
    { label: "Present Count", value: attendance.filter((a) => a.status === "Present").length },
  ];

  const handleExportCSV = (data: { label: string; value: string | number }[], filename: string) => {
    const csv = "Metric,Value\n" + data.map((d) => `${d.label},${d.value}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dso-${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportActivationsCSV = () => {
    const csv = "ID,Type,Status,Customer,BVS,FCA,IFCA,Created\n" + activations.map((a) => `${a.id},${a.type},${a.status},${a.customerName},${a.bvsStatus},${a.fcaStatus},${a.ifcaStatus},${a.createdAt}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dso-activations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentData = activeReport === "daily" ? dailyData : activeReport === "monthly" ? monthlyData : yearlyData;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "Reports" }]}
        title="Reports"
        description="View performance reports and export data"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Completed" value={completedActivations.length} icon={CheckCircle2} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Pending" value={pendingBVS + pendingFCA + pendingIFCA} icon={Clock} iconClass="text-yellow-600 bg-yellow-50" />
        <StatCard label="Success Rate" value={`${successRate}%`} icon={BarChart3} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Target Progress" value={`${totalAchieved}/${totalTarget}`} icon={FileText} iconClass="text-amber-600 bg-amber-50" />
      </div>

      <div className="flex gap-1 w-fit p-1 bg-slate-100 rounded-lg">
        {reportTypes.map((r) => (
          <button key={r.key} onClick={() => setActiveReport(r.key)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeReport === r.key ? "bg-white text-brand-700 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <r.icon size={14} /> {r.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between sm:items-center">
          <h3 className="text-base font-semibold text-foreground">{reportTypes.find((r) => r.key === activeReport)?.label}</h3>
          <Button variant="secondary" size="sm" onClick={() => handleExportCSV(currentData, activeReport)}>
            <Download size={14} /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Metric</th>
                  <th className="text-right px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{d.label}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-foreground">{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {activations.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between sm:items-center">
            <h3 className="text-base font-semibold text-foreground">All Activations</h3>
            <Button size="sm" onClick={exportActivationsCSV}>
              <Download size={14} /> Export All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">ID</th>
                    <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</th>
                    <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activations.slice(0, 10).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-medium text-foreground">{a.id}</td>
                      <td className="px-6 py-4"><StatusPill label={a.type} tone="brand" /></td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{a.customerName}</td>
                      <td className="px-6 py-4"><StatusPill label={a.status} tone={toneForStatus(a.status)} /></td>
                      <td className="px-6 py-4 hidden md:table-cell text-xs text-muted-foreground font-mono">{formatDateDDMMYYYY(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
