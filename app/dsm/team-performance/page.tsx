"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { Smartphone, Search, Filter, Trophy, BarChart3, Users, ArrowRightLeft, Repeat, Hash } from "lucide-react";

export default function TeamPerformancePage() {
  const { dsos, activations } = useDSMData();
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("All");

  const completedActivations = activations.filter((a) => a.status === "Completed");

  const dsoPerformance = dsos.map((dso) => {
    const dsoActivations = completedActivations.filter((a) => a.dsoId === dso.id);
    return {
      ...dso,
      totalActivations: dsoActivations.length,
      newSim: dsoActivations.filter((a) => a.type === "New SIM").length,
      mnp: dsoActivations.filter((a) => a.type === "MNP").length,
      replacement: dsoActivations.filter((a) => a.type === "Replacement").length,
      byn: dsoActivations.filter((a) => a.type === "BYN").length,
    };
  }).sort((a, b) => b.totalActivations - a.totalActivations);

  const bestPerformer = dsoPerformance[0];
  const totalActivations = dsoPerformance.reduce((s, d) => s + d.totalActivations, 0);
  const avgActivations = dsoPerformance.length > 0 ? (totalActivations / dsoPerformance.length).toFixed(1) : "0";

  const areas = Array.from(new Set(dsos.map((d) => d.id.split("-")[1])));

  const filteredPerformance = dsoPerformance.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchArea = areaFilter === "All" || d.id.split("-")[1] === areaFilter;
    return matchSearch && matchArea;
  });

  const stats = [
    {
      label: "Best Performer",
      value: bestPerformer?.name || "N/A",
      sub: bestPerformer ? `${bestPerformer.totalActivations} activations` : "",
      icon: Trophy,
      color: "bg-amber-500",
    },
    {
      label: "Average Activations",
      value: avgActivations,
      sub: `Across ${dsos.length} DSOs`,
      icon: BarChart3,
      color: "bg-[#0057FF]",
    },
    {
      label: "Total Team Activations",
      value: totalActivations,
      sub: `${completedActivations.length} completed`,
      icon: Users,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by DSO name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
            >
              <option value="All">All Areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">DSO</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Area</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Total</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">New SIM</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">MNP</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Replacement</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">BYN</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPerformance.map((dso, idx) => (
                <tr key={dso.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? "bg-amber-100 text-amber-700" :
                      idx === 1 ? "bg-gray-100 text-gray-600" :
                      idx === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0057FF] flex items-center justify-center text-white text-sm font-bold">
                        {dso.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{dso.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{dso.id.split("-")[1]}</td>
                  <td className="py-4 px-4">
                    <span className="text-lg font-bold text-[#0057FF]">{dso.totalActivations}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Smartphone size={12} className="text-emerald-500" />
                      <span className="text-sm font-medium text-gray-700">{dso.newSim}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <ArrowRightLeft size={12} className="text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">{dso.mnp}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Repeat size={12} className="text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">{dso.replacement}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Hash size={12} className="text-cyan-500" />
                      <span className="text-sm font-medium text-gray-700">{dso.byn}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        dso.status === "Active" || dso.status === "Excellent" || dso.status === "Good"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {dso.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPerformance.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3" />
            <p className="font-medium">No DSOs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
