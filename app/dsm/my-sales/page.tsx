"use client";

import { useState, useMemo } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { BarChart3, Search, ArrowUpDown, Smartphone, ArrowRightLeft, Repeat, Hash, CheckCircle2, Clock, Filter } from "lucide-react";

type FilterTab = "all" | "New SIM" | "MNP" | "Replacement" | "BYN" | "Completed" | "Pending";

export default function MySales() {
  const { activations } = useDSMData();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: activations.length },
    { key: "New SIM", label: "New SIM", count: activations.filter((a) => a.type === "New SIM").length },
    { key: "MNP", label: "MNP", count: activations.filter((a) => a.type === "MNP").length },
    { key: "Replacement", label: "Replacement", count: activations.filter((a) => a.type === "Replacement").length },
    { key: "BYN", label: "BYN", count: activations.filter((a) => a.type === "BYN").length },
    { key: "Completed", label: "Completed", count: activations.filter((a) => a.status === "Completed").length },
    { key: "Pending", label: "Pending", count: activations.filter((a) => a.status !== "Completed").length },
  ];

  const filtered = useMemo(() => {
    let list = [...activations];
    if (activeTab === "Completed") {
      list = list.filter((a) => a.status === "Completed");
    } else if (activeTab === "Pending") {
      list = list.filter((a) => a.status !== "Completed");
    } else if (activeTab !== "all") {
      list = list.filter((a) => a.type === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.customerName.toLowerCase().includes(q) || a.customerCNIC.includes(q));
    }
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortDesc ? db - da : da - db;
    });
    return list;
  }, [activations, activeTab, searchQuery, sortDesc]);

  const total = activations.length;
  const completedCount = activations.filter((a) => a.status === "Completed").length;
  const pendingCount = activations.filter((a) => a.status !== "Completed").length;
  const newSimCount = activations.filter((a) => a.type === "New SIM").length;
  const mnpCount = activations.filter((a) => a.type === "MNP").length;
  const replacementCount = activations.filter((a) => a.type === "Replacement").length;
  const bynCount = activations.filter((a) => a.type === "BYN").length;

  const stats = [
    { label: "Total", value: total, color: "bg-[#0057FF]" },
    { label: "New SIM", value: newSimCount, color: "bg-emerald-500" },
    { label: "MNP", value: mnpCount, color: "bg-purple-500" },
    { label: "Replacement", value: replacementCount, color: "bg-amber-500" },
    { label: "BYN", value: bynCount, color: "bg-cyan-500" },
    { label: "Completed", value: completedCount, color: "bg-green-500" },
    { label: "Pending", value: pendingCount, color: "bg-red-500" },
  ];

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      "New SIM": "bg-emerald-100 text-emerald-700",
      "MNP": "bg-purple-100 text-purple-700",
      "Replacement": "bg-amber-100 text-amber-700",
      "BYN": "bg-cyan-100 text-cyan-700",
    };
    return styles[type] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Completed": "bg-green-100 text-green-700",
      "Pending BVS": "bg-yellow-100 text-yellow-700",
      "Pending FCA": "bg-orange-100 text-orange-700",
      "Pending IFCA": "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "New SIM": return <Smartphone size={14} />;
      case "MNP": return <ArrowRightLeft size={14} />;
      case "Replacement": return <Repeat size={14} />;
      case "BYN": return <Hash size={14} />;
      default: return <Smartphone size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-[#0057FF] rounded-2xl flex items-center justify-center">
          <BarChart3 size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sales</h1>
          <p className="text-gray-500 text-sm">Overview of all your activations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <span className="text-white font-bold text-sm">{s.value}</span>
            </div>
            <p className="text-xs font-medium text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or CNIC..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortDesc(!sortDesc)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center gap-2 text-sm"
            >
              <ArrowUpDown size={14} />
              {sortDesc ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          <Filter size={14} className="text-gray-400 shrink-0" />
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-[#0057FF] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BarChart3 size={48} className="mx-auto mb-3" />
            <p className="font-medium">No activations found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">MSISDN</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Date</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 text-sm font-mono text-gray-600">{a.id}</td>
                    <td className="py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{a.customerName}</p>
                      <p className="text-xs text-gray-400 md:hidden">{a.simNumber}</p>
                    </td>
                    <td className="py-3.5 text-sm text-gray-600 hidden md:table-cell">{a.simNumber}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getTypeBadge(a.type)}`}>
                        {getTypeIcon(a.type)}
                        {a.type}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-sm text-gray-500 hidden sm:table-cell">{formatDateDDMMYYYY(a.createdAt)}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-[#0057FF]" : a.progress >= 33 ? "bg-amber-500" : "bg-red-400"
                            }`}
                            style={{ width: `${a.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{a.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
