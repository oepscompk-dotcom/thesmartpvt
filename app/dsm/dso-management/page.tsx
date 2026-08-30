"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { Users, UserCheck, UserX, MapPin, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

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

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "DSO Management" }]}
        title="DSO Management"
        description="Manage your direct sales officers and their performance"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total DSOs" value={totalDsos} icon={Users} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Active DSOs" value={activeDsos} icon={UserCheck} iconClass="text-emerald-600 bg-emerald-50" />
        <StatCard label="Inactive DSOs" value={inactiveDsos} icon={UserX} iconClass="text-red-600 bg-red-50" />
        <StatCard label="Total Areas" value={totalAreas} icon={MapPin} iconClass="text-amber-600 bg-amber-50" />
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <SearchInput
              placeholder="Search by name or ID..."
              value={search}
              onSearch={setSearch}
              className="max-w-sm"
            />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Area</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Activations</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDsos.map((dso) => {
                  const activationCount = activations.filter((a) => a.dsoId === dso.id).length;
                  return (
                    <tr key={dso.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-mono text-muted-foreground">{dso.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                            {dso.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-foreground">{dso.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{dso.mobile}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{dso.id.split("-")[1]}</td>
                      <td className="py-4 px-4">
                        <StatusPill label={dso.status} tone={dso.status === "Active" || dso.status === "Excellent" || dso.status === "Good" ? "positive" : "negative"} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Smartphone size={14} className="text-brand-600" />
                          <span className="text-sm font-semibold text-foreground">{activationCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button size="sm">View</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDsos.length === 0 && (
            <EmptyState icon={Users} title="No DSOs found" description="Try adjusting your search or status filter." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}