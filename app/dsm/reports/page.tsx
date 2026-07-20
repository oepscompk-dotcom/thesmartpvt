"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { BarChart3, Calendar, Download, TrendingUp, Smartphone, CheckCircle, Clock, XCircle } from "lucide-react";

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

  const StatCard = ({ icon: Icon, label, value, color = "#0057FF" }: { icon: React.ElementType; label: string; value: string | number; color?: string }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 text-sm mt-1">View and export activation reports</p>
          </div>
          <button onClick={exportCSV} className="bg-[#0057FF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0047CC] flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit">
          {(["daily", "monthly", "yearly"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-[#0057FF] text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "daily" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Smartphone} label="Today's Activations" value={dailyActivations.length} />
              <StatCard icon={CheckCircle} label="Completion Rate" value={`${completionRate(dailyActivations)}%`} color="#16A34A" />
              <StatCard icon={Clock} label="Pending" value={dailyActivations.filter((a) => a.status === "pending").length} color="#F59E0B" />
              <StatCard icon={XCircle} label="Failed" value={dailyActivations.filter((a) => a.status === "failed").length} color="#EF4444" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Type Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(typeBreakdown(dailyActivations)).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                    <span className="text-sm font-bold text-[#0057FF]">{count}</span>
                  </div>
                ))}
                {Object.keys(typeBreakdown(dailyActivations)).length === 0 && <p className="text-sm text-gray-400">No activations today</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard icon={BarChart3} label="This Month" value={monthlyActivations.length} />
              <StatCard icon={CheckCircle} label="Completion Rate" value={`${completionRate(monthlyActivations)}%`} color="#16A34A" />
              <StatCard icon={TrendingUp} label="Top DSO" value={topDSO(monthlyActivations)?.name || "N/A"} />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Monthly Type Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(typeBreakdown(monthlyActivations)).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                    <span className="text-sm font-bold text-[#0057FF]">{count}</span>
                  </div>
                ))}
                {Object.keys(typeBreakdown(monthlyActivations)).length === 0 && <p className="text-sm text-gray-400">No activations this month</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "yearly" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard icon={Calendar} label="This Year" value={yearlyActivations.length} />
              <StatCard icon={CheckCircle} label="Completion Rate" value={`${completionRate(yearlyActivations)}%`} color="#16A34A" />
              <StatCard icon={TrendingUp} label="Months Active" value={monthlyTrend(yearlyActivations).length} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
                <div className="space-y-3">
                  {monthlyTrend(yearlyActivations).map(({ month, count }) => (
                    <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-700">{month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0057FF] rounded-full"
                            style={{ width: `${Math.min((count / Math.max(...monthlyTrend(yearlyActivations).map((t) => t.count), 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[#0057FF]">{count}</span>
                      </div>
                    </div>
                  ))}
                  {monthlyTrend(yearlyActivations).length === 0 && <p className="text-sm text-gray-400">No data for this year</p>}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {topPerformers(yearlyActivations).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#0057FF]">#{i + 1}</span>
                        <span className="text-sm font-medium text-gray-700">{p.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{p.completed}/{p.total}</span>
                    </div>
                  ))}
                  {topPerformers(yearlyActivations).length === 0 && <p className="text-sm text-gray-400">No performers yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
