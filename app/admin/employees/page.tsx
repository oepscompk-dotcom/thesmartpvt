"use client";

import { useState } from "react";
import { Search, Eye, Users, UserCheck, Smartphone, X } from "lucide-react";
import { useData, Employee } from "@/lib/DataContext";

export default function EmployeesPage() {
  const { employees } = useData();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  const filtered = employees.filter((e) => {
    const matchSearch = e.id.toLowerCase().includes(search.toLowerCase()) || e.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = { total: employees.length, dsm: employees.filter((e) => e.role === "DSM").length, dso: employees.filter((e) => e.role === "DSO").length, active: employees.filter((e) => e.status === "Active").length };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Employee Monitoring</h1>
        <p className="text-gray-500 text-sm mt-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg mr-2">View Only</span>
          Super Admin can view but not edit employee data
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: stats.total, icon: <Users size={18} className="text-[#C8A951]" />, color: "bg-amber-50" },
          { label: "DSM Count", value: stats.dsm, icon: <UserCheck size={18} className="text-blue-600" />, color: "bg-blue-50" },
          { label: "DSO Count", value: stats.dso, icon: <Smartphone size={18} className="text-green-600" />, color: "bg-green-50" },
          { label: "Active", value: stats.active, icon: <Users size={18} className="text-green-600" />, color: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or name..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {["All", "DSM", "DSO"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${roleFilter === r ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Employee</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Role</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Franchise</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Joining</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Attendance</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Performance</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">{e.name.split(" ").map((n) => n[0]).join("")}</div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{e.name}</p>
                        <p className="text-gray-400 text-xs font-mono">{e.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${e.role === "DSM" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{e.role}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-gray-600 text-sm font-mono">{e.franchise}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-gray-600 text-sm">{e.joining}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${e.attendance >= 90 ? "bg-green-500" : e.attendance >= 70 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${e.attendance}%` }} />
                      </div>
                      <span className="text-gray-600 text-xs">{e.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${e.performance >= 80 ? "bg-green-500" : e.performance >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${e.performance}%` }} />
                      </div>
                      <span className="text-gray-600 text-xs">{e.performance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${e.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{e.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setViewEmployee(e)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Profile"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No employees found</p>
          </div>
        )}
      </div>

      {/* View Employee Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewEmployee(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Employee Profile</h3>
              <button onClick={() => setViewEmployee(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-gray-500 font-bold text-xl">{viewEmployee.name.split(" ").map((n) => n[0]).join("")}</span>
                </div>
                <h4 className="text-gray-900 font-bold text-lg">{viewEmployee.name}</h4>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${viewEmployee.role === "DSM" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{viewEmployee.role}</span>
              </div>
              {[["Employee ID", viewEmployee.id], ["Franchise", viewEmployee.franchise], ["Mobile", viewEmployee.mobile], ["Email", viewEmployee.email], ["Joining Date", viewEmployee.joining], ["Attendance", `${viewEmployee.attendance}%`], ["Performance", `${viewEmployee.performance}%`], ["Status", viewEmployee.status]].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="text-gray-900 text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-yellow-600 text-center">View Only — Only Franchise Admin can edit employee data</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
