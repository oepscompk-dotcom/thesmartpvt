"use client";

import { useState } from "react";
import { Eye, Users, UserCheck, Smartphone, X } from "lucide-react";
import { useData, Employee } from "@/lib/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";

const PAGE_SIZE = 8;

export default function EmployeesPage() {
  const { employees } = useData();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  const filtered = employees.filter((e) => {
    const matchSearch = e.id.toLowerCase().includes(search.toLowerCase()) || e.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = { total: employees.length, dsm: employees.filter((e) => e.role === "DSM").length, dso: employees.filter((e) => e.role === "DSO").length, active: employees.filter((e) => e.status === "Active").length };

  const submitSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Employees" }]}
        title="Employee Monitoring"
        description="Super Admin can view but not edit employee data"
        actions={<StatusPill tone="warning" label="View Only" />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Employees" value={stats.total} icon={Users} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="DSM Count" value={stats.dsm} icon={UserCheck} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="DSO Count" value={stats.dso} icon={Smartphone} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Active" value={stats.active} icon={Users} iconClass="text-green-600 bg-green-50" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Search by ID or name..." value={search} onSearch={submitSearch} />
        <div className="flex flex-wrap gap-2">
          {["All", "DSM", "DSO"].map((r) => (
            <Button
              key={r}
              size="md"
              variant={roleFilter === r ? "primary" : "outline"}
              onClick={() => { setRoleFilter(r); setPage(1); }}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Role</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Franchise</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground lg:table-cell">Joining</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.name} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{e.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{e.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill label={e.role} tone={e.role === "DSM" ? "brand" : "positive"} />
                  </td>
                  <td className="hidden px-6 py-4 font-mono text-sm text-muted-foreground md:table-cell">{e.franchise}</td>
                  <td className="hidden px-6 py-4 text-sm text-slate-600 lg:table-cell">{e.joining}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${e.attendance >= 90 ? "bg-green-500" : e.attendance >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${e.attendance}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{e.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${e.performance >= 80 ? "bg-green-500" : e.performance >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${e.performance}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{e.performance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill label={e.status} tone={toneForStatus(e.status)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-brand-700 hover:bg-brand-50" onClick={() => setViewEmployee(e)} title="View Profile"><Eye className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" description="Try adjusting your search or role filter." />
        ) : (
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        )}
      </Card>

      {/* View Employee Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setViewEmployee(null)}>
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">Employee Profile</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewEmployee(null)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4 p-6">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
                  {viewEmployee.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h4 className="text-lg font-bold text-foreground">{viewEmployee.name}</h4>
                <div className="mt-2">
                  <StatusPill label={viewEmployee.role} tone={viewEmployee.role === "DSM" ? "brand" : "positive"} />
                </div>
              </div>
              {[["Employee ID", viewEmployee.id], ["Franchise", viewEmployee.franchise], ["Mobile", viewEmployee.mobile], ["Email", viewEmployee.email], ["Joining Date", viewEmployee.joining], ["Attendance", `${viewEmployee.attendance}%`], ["Performance", `${viewEmployee.performance}%`], ["Status", viewEmployee.status]].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <span className={`text-sm font-medium text-foreground ${label === "Employee ID" ? "font-mono text-xs text-muted-foreground" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-center text-xs text-amber-600">View Only — Only Franchise Admin can edit employee data</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}