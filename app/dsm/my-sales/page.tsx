"use client";

import { useState, useMemo } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { BarChart3, ArrowUpDown, Smartphone, ArrowRightLeft, Repeat, Hash, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type FilterTab = "all" | "New SIM" | "MNP" | "Replacement" | "BYN" | "Completed" | "Pending";

const typeTone: Record<string, "positive" | "warning" | "negative" | "neutral" | "brand" | "accent"> = {
  "New SIM": "positive",
  "MNP": "accent",
  "Replacement": "warning",
  "BYN": "brand",
};

const statusTone: Record<string, "positive" | "warning" | "negative" | "neutral" | "brand" | "accent"> = {
  "Completed": "positive",
  "Pending BVS": "warning",
  "Pending FCA": "warning",
  "Pending IFCA": "negative",
};

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

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "My Sales" }]}
        title="My Sales"
        description="Overview of all your activations"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={total} icon={BarChart3} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="New SIM" value={newSimCount} icon={Smartphone} iconClass="text-emerald-600 bg-emerald-50" />
        <StatCard label="MNP" value={mnpCount} icon={ArrowRightLeft} iconClass="text-purple-600 bg-purple-50" />
        <StatCard label="Replacement" value={replacementCount} icon={Repeat} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="BYN" value={bynCount} icon={Hash} iconClass="text-cyan-600 bg-cyan-50" />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle2} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Pending" value={pendingCount} icon={Clock} iconClass="text-red-600 bg-red-50" />
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
            <SearchInput
              placeholder="Search by customer name or CNIC..."
              value={searchQuery}
              onSearch={setSearchQuery}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={() => setSortDesc(!sortDesc)}>
              <ArrowUpDown size={14} />
              {sortDesc ? "Newest" : "Oldest"}
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <QuickChip
                key={tab.key}
                label={tab.label}
                count={tab.count}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No activations found"
              description="Try adjusting your filters or search"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">ID</th>
                    <th className="pb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">Customer</th>
                    <th className="pb-3 px-2 text-xs font-semibold uppercase text-muted-foreground hidden md:table-cell">MSISDN</th>
                    <th className="pb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">Type</th>
                    <th className="pb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    <th className="pb-3 px-2 text-xs font-semibold uppercase text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="pb-3 px-2 text-xs font-semibold uppercase text-muted-foreground">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-2 text-sm font-mono text-muted-foreground">{a.id}</td>
                      <td className="py-3.5 px-2">
                        <p className="text-sm font-semibold text-foreground">{a.customerName}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{a.simNumber}</p>
                      </td>
                      <td className="py-3.5 px-2 text-sm text-muted-foreground hidden md:table-cell">{a.simNumber}</td>
                      <td className="py-3.5 px-2">
                        <span className="inline-flex items-center gap-1">
                          <StatusPill label={a.type} tone={typeTone[a.type] || "neutral"} />
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <StatusPill label={a.status} tone={statusTone[a.status] || "neutral"} />
                      </td>
                      <td className="py-3.5 px-2 text-sm text-muted-foreground hidden sm:table-cell">{formatDateDDMMYYYY(a.createdAt)}</td>
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                a.progress === 100 ? "bg-green-500" : a.progress >= 66 ? "bg-brand-600" : a.progress >= 33 ? "bg-amber-500" : "bg-red-400"
                              }`}
                              style={{ width: `${a.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{a.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}