"use client";

import { FileText, Download, BarChart3, PieChart, TrendingUp, FileDown } from "lucide-react";
import { useData } from "@/lib/DataContext";

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
    { title: "Franchise Performance Report", desc: "Detailed performance metrics for all franchises", icon: BarChart3, type: "franchise", count: `${franchises.length} franchises` },
    { title: "Revenue Report", desc: "Monthly and annual revenue breakdown", icon: TrendingUp, type: "revenue", count: `PKR ${payments.filter((p) => p.status === "Paid").reduce((s, p) => s + Number(p.amount), 0).toLocaleString()} total` },
    { title: "Subscription Report", desc: "Package distribution and renewal status", icon: PieChart, type: "subscription", count: `${subscriptions.length} packages` },
    { title: "Employee Summary", desc: "DSM and DSO overview across all franchises", icon: FileText, type: "employee", count: `${employees.length} employees` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Reports Center</h1>
        <p className="text-gray-500 text-sm mt-1">Generate and export business reports</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r.title} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C8A951]/10 flex items-center justify-center text-[#C8A951] group-hover:scale-110 transition-transform">
                <r.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 font-bold mb-1">{r.title}</h3>
                <p className="text-gray-500 text-sm mb-1">{r.desc}</p>
                <p className="text-gray-400 text-xs mb-3">{r.count}</p>
                <button onClick={() => generateReport(r.type)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-[#0A2647] hover:text-white hover:border-[#0A2647] transition-all">
                  <Download size={12} /> Export CSV
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Quick Export</h3>
        <div className="flex flex-wrap gap-3">
          {["csv", "txt"].map((fmt) => (
            <button key={fmt} onClick={() => exportAll(fmt)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all">
              <FileDown size={14} /> Download as {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
