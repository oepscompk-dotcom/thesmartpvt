"use client";

import { FileText, Download, BarChart3, PieChart, TrendingUp, FileDown } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  const { franchises, payments, employees, subscriptions } = useData();

  const generateReport = (type: string) => {
    let data: string[][] = [];
    let filename = "";

    switch (type) {
      case "franchise":
        data = [["ID", "Name", "Owner", "City", "Package", "Status", "DSM", "DSO"], ...franchises.map((f) => [f.id, f.name, f.owner, f.city, f.package, f.status, String(f.dsm), String(f.dso)])];
        filename = "franchise-performance-report.csv";
        break;
      case "revenue":
        data = [["Invoice", "Franchise", "Amount", "Method", "Date", "Status"], ...payments.map((p) => [p.id, p.franchise, p.amount, p.method, p.date, p.status])];
        filename = "revenue-report.csv";
        break;
      case "subscription":
        data = [["Package", "Price", "Period", "Franchises"], ...subscriptions.map((s) => [s.name, s.price, s.period, String(s.franchises)])];
        filename = "subscription-report.csv";
        break;
      case "employee":
        data = [["ID", "Name", "Role", "Franchise", "Attendance", "Performance", "Status"], ...employees.map((e) => [e.id, e.name, e.role, e.franchise, `${e.attendance}%`, `${e.performance}%`, e.status])];
        filename = "employee-summary-report.csv";
        break;
      default:
        return;
    }

    const csv = data.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = (format: string) => {
    const headers = ["Franchise", "Package", "Amount", "Status", "DSM Count", "DSO Count"];
    const rows = franchises.map((f) => [f.id, f.package, "", f.status, String(f.dsm), String(f.dso)]);
    const content = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smart-erp-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    { title: "Franchise Performance Report", desc: "Detailed performance metrics for all franchises", icon: BarChart3, iconClass: "text-brand-600 bg-brand-50", type: "franchise", count: `${franchises.length} franchises` },
    { title: "Revenue Report", desc: "Monthly and annual revenue breakdown", icon: TrendingUp, iconClass: "text-green-600 bg-green-50", type: "revenue", count: `PKR ${payments.filter((p) => p.status === "Paid").reduce((s, p) => s + Number(p.amount), 0).toLocaleString()} total` },
    { title: "Subscription Report", desc: "Package distribution and renewal status", icon: PieChart, iconClass: "text-purple-600 bg-purple-50", type: "subscription", count: `${subscriptions.length} packages` },
    { title: "Employee Summary", desc: "DSM and DSO overview across all franchises", icon: FileText, iconClass: "text-blue-600 bg-blue-50", type: "employee", count: `${employees.length} employees` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Reports" }]}
        title="Reports Center"
        description="Generate and export business reports"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.title} className="transition-all group hover:border-slate-300">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${r.iconClass} transition-transform group-hover:scale-110`}>
                <r.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-base font-semibold text-foreground">{r.title}</h3>
                <p className="mb-1 text-sm text-muted-foreground">{r.desc}</p>
                <p className="mb-3 text-xs text-muted-foreground">{r.count}</p>
                <Button variant="outline" size="sm" onClick={() => generateReport(r.type)}>
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
          <CardDescription>Download a combined snapshot of all franchise data</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {["csv", "txt"].map((fmt) => (
            <Button key={fmt} variant="outline" onClick={() => exportAll(fmt)}>
              <FileDown className="h-4 w-4" /> Download as {fmt.toUpperCase()}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}