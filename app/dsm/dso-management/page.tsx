"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { Smartphone, Search, Filter, Users, UserCheck, UserX, MapPin } from "lucide-react";

export default function DSOManagementPage() {
  const { dsos, activations } = useDSMData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const totalDsos = dsos.length;
  const activeDsos = dsos.filter((d) => d.status === "Active" || d.status === "Excellent" || d.status === "Good").length;
  const inactiveDsos = totalDsos - activeDsos;
  const totalAreas = new Set(dsos.map((d) => d.id.split("-")[1])).size;

  const filteredDsos = dsos.filter((dso) => {
    const matchSearch =
      dso.name.toLowerCase().includes(search.toLowerCase()) ||
      dso.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && (dso.status === "Active" || dso.status === "Excellent" || dso.status === "Good")) ||
      (statusFilter === "Inactive" && (dso.status === "Inactive" || dso.status === "Absent"));
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: "Total DSOs", value: totalDsos, icon: Users, color: "bg-[#0057FF]" },
    { label: "Active DSOs", value: activeDsos, icon: UserCheck, color: "bg-emerald-500" },
    { label: "Inactive DSOs", value: inactiveDsos, icon: UserX, color: "bg-red-500" },
    { label: "Total Areas", value: totalAreas, icon: MapPin, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
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
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Area</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Activations</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDsos.map((dso) => {
                const activationCount = activations.filter((a) => a.dsoId === dso.id).length;
                return (
                  <tr key={dso.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-mono text-gray-600">{dso.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0057FF] flex items-center justify-center text-white text-sm font-bold">
                          {dso.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{dso.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{dso.mobile}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{dso.id.split("-")[1]}</td>
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
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-[#0057FF]" />
                        <span className="text-sm font-semibold text-gray-900">{activationCount}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="bg-[#0057FF] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0047CC] transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDsos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3" />
            <p className="font-medium">No DSOs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
