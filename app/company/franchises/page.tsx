"use client";

import { useState } from "react";
import { useCompanyData } from "@/lib/CompanyDataContext";
import { Search, Building2, Eye, MapPin, Package, Users, Smartphone, Cpu, DollarSign, TrendingUp, Filter, MoreVertical } from "lucide-react";

interface FranchiseSummary {
  id: string;
  name: string;
  owner: string;
  city: string;
  province: string;
  package: string;
  status: string;
  dsm: number;
  dso: number;
  sims: number;
  devices: number;
  staff: number;
  revenue: number;
  todayActivations: number;
  attendanceRate: number;
}

function formatCurrency(amount: number) {
  if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `PKR ${(amount / 1000).toFixed(1)}K`;
  return `PKR ${amount.toLocaleString()}`;
}

export default function CompanyFranchisesPage() {
  const { franchises, refreshData } = useCompanyData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [packageFilter, setPackageFilter] = useState("All");
  const [sortBy, setSortBy] = useState<keyof FranchiseSummary | "name">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const statuses = ["All", "Active", "Pending", "Suspended"];
  const packages = ["All", "Monthly", "Six Month", "Annual"];

  const filtered = franchises
    .filter((f) => {
      const matchSearch = f.id.toLowerCase().includes(search.toLowerCase()) ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.owner.toLowerCase().includes(search.toLowerCase()) ||
        f.city.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || f.status === statusFilter;
      const matchPackage = packageFilter === "All" || f.package === packageFilter;
      return matchSearch && matchStatus && matchPackage;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Franchises</h1>
          <p className="text-gray-500 text-sm mt-1">{franchises.length} franchises under your company</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshData} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all" title="Refresh Data">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
          </button>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
            <Filter size={16} className="text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm text-gray-900 focus:outline-none">
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={packageFilter} onChange={(e) => setPackageFilter(e.target.value)} className="bg-transparent text-sm text-gray-900 focus:outline-none ml-2">
              {packages.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200">
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`} title="Table View"><Building2 size={16} /></button>
            <button onClick={() => setViewMode("cards")} className={`p-2 rounded-lg transition-colors ${viewMode === "cards" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`} title="Card View"><MapPin size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name, owner, city..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase cursor-pointer hover:text-gray-700" onClick={() => { setSortBy("id"); setSortDir(sortBy === "id" && sortDir === "asc" ? "desc" : "asc"); }}>
                    Franchise <TrendingUp size={12} className={`inline ml-1 ${sortBy === "id" ? (sortDir === "asc" ? "text-blue-600" : "text-blue-600 rotate-180") : "text-gray-300"}`} />
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell cursor-pointer hover:text-gray-700" onClick={() => { setSortBy("owner"); setSortDir(sortBy === "owner" && sortDir === "asc" ? "desc" : "asc"); }}>
                    Owner <TrendingUp size={12} className={`inline ml-1 ${sortBy === "owner" ? (sortDir === "asc" ? "text-blue-600" : "text-blue-600 rotate-180") : "text-gray-300"}`} />
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell cursor-pointer hover:text-gray-700" onClick={() => { setSortBy("city"); setSortDir(sortBy === "city" && sortDir === "asc" ? "desc" : "asc"); }}>
                    Location <TrendingUp size={12} className={`inline ml-1 ${sortBy === "city" ? (sortDir === "asc" ? "text-blue-600" : "text-blue-600 rotate-180") : "text-gray-300"}`} />
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell cursor-pointer hover:text-gray-700" onClick={() => { setSortBy("package"); setSortDir(sortBy === "package" && sortDir === "asc" ? "desc" : "asc"); }}>
                    Package <TrendingUp size={12} className={`inline ml-1 ${sortBy === "package" ? (sortDir === "asc" ? "text-blue-600" : "text-blue-600 rotate-180") : "text-gray-300"}`} />
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase cursor-pointer hover:text-gray-700" onClick={() => { setSortBy("status"); setSortDir(sortBy === "status" && sortDir === "asc" ? "desc" : "asc"); }}>
                    Status <TrendingUp size={12} className={`inline ml-1 ${sortBy === "status" ? (sortDir === "asc" ? "text-blue-600" : "text-blue-600 rotate-180") : "text-gray-300"}`} />
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell cursor-pointer hover:text-gray-700" onClick={() => { setSortBy("staff"); setSortDir(sortBy === "staff" && sortDir === "asc" ? "desc" : "asc"); }}>
                    Staff <TrendingUp size={12} className={`inline ml-1 ${sortBy === "staff" ? (sortDir === "asc" ? "text-blue-600" : "text-blue-600 rotate-180") : "text-gray-300"}`} />
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell cursor-pointer hover:text-gray-700" onClick={() => { setSortBy("sims"); setSortDir(sortBy === "sims" && sortDir === "asc" ? "desc" : "asc"); }}>
                    Inventory <TrendingUp size={12} className={`inline ml-1 ${sortBy === "sims" ? (sortDir === "asc" ? "text-blue-600" : "text-blue-600 rotate-180") : "text-gray-300"}`} />
                  </th>
                  <th className="text-right px-6 py-3 text-gray-500 text-xs font-medium uppercase cursor-pointer hover:text-gray-700" onClick={() => { setSortBy("revenue"); setSortDir(sortBy === "revenue" && sortDir === "asc" ? "desc" : "asc"); }}>
                    Revenue <TrendingUp size={12} className={`inline ml-1 ${sortBy === "revenue" ? (sortDir === "asc" ? "text-blue-600" : "text-blue-600 rotate-180") : "text-gray-300"}`} />
                  </th>
                  <th className="text-right px-6 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 text-xs font-bold">{f.id.split("-")[0]}</div>
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{f.id}</p>
                          <p className="text-gray-500 text-xs">{f.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-gray-700 text-sm">{f.owner}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-gray-700 text-sm">{f.city}</p>
                      <p className="text-gray-400 text-xs">{f.province}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">{f.package}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${f.status === "Active" ? "bg-green-50 text-green-700" : f.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{f.status}</span>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell text-gray-600 text-sm">DSM: {f.dsm} | DSO: {f.dso} | Total: {f.staff}</td>
                    <td className="px-6 py-4 hidden xl:table-cell text-gray-600 text-sm">{f.sims} SIMs / {f.devices} Devices</td>
                    <td className="px-6 py-4 text-right text-gray-900 font-bold text-sm">{formatCurrency(f.revenue)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No franchises found matching your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((f) => (
                <div key={f.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 text-sm font-bold">{f.id.split("-")[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-bold truncate">{f.id}</p>
                      <p className="text-gray-500 text-xs truncate">{f.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600"><MapPin size={12} /> {f.city}, {f.province}</div>
                    <div className="flex items-center gap-1.5 text-gray-600"><Package size={12} /> {f.package}</div>
                    <div className="flex items-center gap-1.5 text-gray-600"><Users size={12} /> DSM: {f.dsm} DSO: {f.dso}</div>
                    <div className="flex items-center gap-1.5 text-gray-600"><Smartphone size={12} /> {f.sims} SIMs / <Cpu size={12} /> {f.devices} Devices</div>
                    <div className="flex items-center gap-1.5 text-gray-600"><DollarSign size={12} /> {formatCurrency(f.revenue)}</div>
                    <div className="flex items-center gap-1.5 text-gray-600"><TrendingUp size={12} /> {f.todayActivations} today / {f.attendanceRate}% att.</div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${f.status === "Active" ? "bg-green-50 text-green-700" : f.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{f.status}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No franchises found matching your filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 px-4 py-3 border-t border-gray-100">
        <span>Showing {filtered.length} of {franchises.length} franchises</span>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as keyof FranchiseSummary)} className="px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500">
            <option value="id">Sort by ID</option>
            <option value="name">Sort by Name</option>
            <option value="owner">Sort by Owner</option>
            <option value="city">Sort by City</option>
            <option value="package">Sort by Package</option>
            <option value="status">Sort by Status</option>
            <option value="staff">Sort by Staff</option>
            <option value="sims">Sort by SIMs</option>
            <option value="revenue">Sort by Revenue</option>
          </select>
          <button onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title={sortDir === "asc" ? "Descending" : "Ascending"}>
            <TrendingUp size={14} className={sortDir === "desc" ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}