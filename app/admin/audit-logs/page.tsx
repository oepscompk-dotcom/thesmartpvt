"use client";

import { useState } from "react";
import { Download, ShieldCheck, Search } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

const PAGE_SIZE = 10;

const typeTone: Record<string, "neutral" | "warning" | "positive" | "brand"> = {
  auth: "neutral",
  update: "warning",
  payment: "positive",
  system: "brand",
};

export default function AuditLogsPage() {
  const { auditLogs } = useData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = auditLogs.filter((l) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q) || l.type.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportLogs = () => {
    const headers = ["Timestamp", "User", "Action", "Details", "Type"];
    const rows = auditLogs.map((l) => [l.time, l.user, l.action, l.detail, l.type]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Audit Logs" }]}
        title="Audit Logs"
        description="Track all system activities. Logs cannot be deleted."
        actions={
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4" /> Export Logs
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>All Events ({auditLogs.length})</CardTitle>
          <SearchInput placeholder="Search by user, action, or detail..." value={search} onSearch={submitSearch} className="min-w-[200px] flex-1" />
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Action</th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((l, i) => (
                <tr key={i} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-sm text-muted-foreground">{formatDateDDMMYYYY(l.time)}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{l.user}</td>
                  <td className="px-6 py-3 text-sm font-medium text-foreground">{l.action}</td>
                  <td className="hidden px-6 py-3 text-sm text-muted-foreground md:table-cell">{l.detail}</td>
                  <td className="px-6 py-3">
                    <StatusPill label={l.type} tone={typeTone[l.type] || "neutral"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 ? (
          <EmptyState icon={Search} title="No audit logs yet" description={search ? "No logs match your search." : "System events will be recorded here."} />
        ) : (
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        )}
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
        <span>Audit logs are immutable and cannot be deleted or modified.</span>
      </div>
    </div>
  );
}