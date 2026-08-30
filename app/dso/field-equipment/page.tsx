"use client";

import { useState, useMemo, useEffect } from "react";
import { Wrench, Clock, CheckCircle } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoad } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

async function loadEquipmentIssueRecords(franchiseId?: string) {
  if (typeof window === "undefined") return [];
  try {
    const result = await apiLoad("equipmentIssueRecord", franchiseId);
    return Array.isArray(result) ? result : [];
  } catch {}
  return [];
}

export default function DSOFieldEquipmentPage() {
  const { auth } = useDSOData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [allRecords, setAllRecords] = useState<any[]>([]);
  useEffect(() => {
    loadEquipmentIssueRecords(auth.franchiseId).then(setAllRecords);
  }, [auth.franchiseId]);
  const myRecords = useMemo(() => {
    return allRecords.filter((r: any) => r.personId === auth.dsoId);
  }, [allRecords, auth.dsoId]);

  const filtered = useMemo(() => {
    return myRecords.filter((r: any) => {
      const matchSearch = !search ||
        r.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
        r.equipmentId?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [myRecords, search, statusFilter]);

  const stats = useMemo(() => {
    let active = 0, returned = 0;
    myRecords.forEach((r: any) => { if (r.status === "Issued") active++; else if (r.status === "Returned") returned++; });
    return { total: myRecords.length, active, returned };
  }, [myRecords]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "Field Equipment" }]}
        title="Field Equipment"
        description="Equipment issued to you"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Equipment" value={stats.total} icon={Wrench} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Active" value={stats.active} icon={Clock} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="Returned" value={stats.returned} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput placeholder="Search equipment..." value={search} onSearch={setSearch} />
        <div className="flex gap-2 flex-wrap">
          <QuickChip label="All" count={stats.total} active={statusFilter === "All"} onClick={() => setStatusFilter("All")} />
          <QuickChip label="Issued" count={stats.active} active={statusFilter === "Issued"} onClick={() => setStatusFilter("Issued")} />
          <QuickChip label="Returned" count={stats.returned} active={statusFilter === "Returned"} onClick={() => setStatusFilter("Returned")} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground w-14">Sr.No</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Equipment</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Equipment ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Issue Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Return Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r: any, idx: number) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">{idx + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{r.equipmentName}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs font-mono text-muted-foreground">{r.equipmentId}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateDDMMYYYY(r.issueDate)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{r.returnDate ? formatDateDDMMYYYY(r.returnDate) : "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPill label={r.status} tone={r.status === "Returned" ? "positive" : "brand"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState icon={Wrench} title="No equipment issued" description="Equipment assigned to you will appear here." />
        )}
      </Card>
    </div>
  );
}
