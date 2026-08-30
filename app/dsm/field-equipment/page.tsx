"use client";

import { useState, useMemo, useEffect } from "react";
import { Wrench, Clock, CheckCircle } from "lucide-react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoad } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";

async function loadEquipmentIssueRecords(franchiseId?: string) {
  if (typeof window === "undefined") return [];
  try {
    const result = await apiLoad("equipmentIssueRecord", franchiseId);
    return Array.isArray(result) ? result : [];
  } catch {}
  return [];
}

export default function DSMFieldEquipmentPage() {
  const { auth } = useDSMData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [allRecords, setAllRecords] = useState<any[]>([]);
  useEffect(() => {
    loadEquipmentIssueRecords(auth.franchiseId).then(setAllRecords);
  }, [auth.franchiseId]);
  const myRecords = useMemo(() => {
    return allRecords.filter((r: any) => r.personId === auth.dsmId);
  }, [allRecords, auth.dsmId]);

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
        breadcrumb={[{ label: "DSM" }, { label: "Field Equipment" }]}
        title="Field Equipment"
        description="Equipment issued to you"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total" value={stats.total} icon={Wrench} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Active" value={stats.active} icon={Clock} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="Returned" value={stats.returned} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput placeholder="Search equipment..." value={search} onSearch={setSearch} className="max-w-sm" />
        <div className="flex gap-2 flex-wrap">
          {["All", "Issued", "Returned"].map((s) => (
            <QuickChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-center px-3 py-3 text-muted-foreground text-xs font-medium uppercase w-14">Sr.No</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase">Equipment</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase hidden md:table-cell">Equipment ID</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase">Issue Date</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase hidden md:table-cell">Return Date</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, idx: number) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-600 text-xs font-black">{idx + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{r.equipmentName}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs font-mono">{r.equipmentId}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDateDDMMYYYY(r.issueDate)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{formatDateDDMMYYYY(r.returnDate)}</td>
                  <td className="px-4 py-3">
                    <StatusPill label={r.status} tone={r.status === "Issued" ? "neutral" : "positive"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState icon={Wrench} title="No equipment issued to you" />
        )}
      </Card>
    </div>
  );
}