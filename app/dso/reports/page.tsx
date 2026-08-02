"use client";

import { useState } from "react";
import { FileText, Download, BarChart3, CheckCircle2, Clock, Calendar } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

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
      <div>
        <h1 className="text-2xl font-black text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">View performance reports and export data</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-2"><CheckCircle2 size={18} /></div>
          <p className="text-2xl font-black text-gray-900">{completedActivations.length}</p>
          <p className="text-gray-500 text-xs mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 mx-auto mb-2"><Clock size={18} /></div>
          <p className="text-2xl font-black text-gray-900">{pendingBVS + pendingFCA + pendingIFCA}</p>
          <p className="text-gray-500 text-xs mt-1">Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><BarChart3 size={18} /></div>
          <p className="text-2xl font-black text-gray-900">{successRate}%</p>
          <p className="text-gray-500 text-xs mt-1">Success Rate</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#C8A951]/20 flex items-center justify-center text-[#C8A951] mx-auto mb-2"><FileText size={18} /></div>
          <p className="text-2xl font-black text-gray-900">{totalAchieved}/{totalTarget}</p>
          <p className="text-gray-500 text-xs mt-1">Target Progress</p>
        </div>
      </div>

      <div className="flex gap-3">
        {reportTypes.map((r) => (
          <button key={r.key} onClick={() => setActiveReport(r.key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeReport === r.key ? "bg-[#0A2647] text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-gray-900 font-bold">{reportTypes.find((r) => r.key === activeReport)?.label}</h3>
          <button onClick={() => handleExportCSV(currentData, activeReport)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Metric</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Value</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((d, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 text-sm font-medium">{d.label}</td>
                  <td className="px-6 py-4 text-right font-bold text-sm text-gray-900">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900 font-bold">All Activations</h3>
            <button onClick={exportActivationsCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272]">
              <Download size={14} /> Export All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">ID</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Type</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Customer</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {activations.slice(0, 10).map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900 text-sm font-medium">{a.id}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">{a.type}</span></td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{a.customerName}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${a.status === "Completed" ? "bg-green-50 text-green-700" : a.status.includes("BVS") ? "bg-yellow-50 text-yellow-700" : "bg-orange-50 text-orange-700"}`}>{a.status}</span></td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-400 text-xs">{formatDateDDMMYYYY(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
