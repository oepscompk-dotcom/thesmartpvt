"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { Smartphone, Trophy, BarChart3, Users, ArrowRightLeft, Repeat, Hash } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

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

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Team Performance" }]}
        title="Team Performance"
        description="Ranked performance of your DSO team"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Best Performer"
          value={bestPerformer?.name || "N/A"}
          sub={bestPerformer ? `${bestPerformer.totalActivations} activations` : ""}
          icon={Trophy}
          iconClass="text-amber-600 bg-amber-50"
        />
        <StatCard
          label="Average Activations"
          value={avgActivations}
          sub={`Across ${dsos.length} DSOs`}
          icon={BarChart3}
          iconClass="text-brand-600 bg-brand-50"
        />
        <StatCard
          label="Total Team Activations"
          value={totalActivations}
          sub={`${completedActivations.length} completed`}
          icon={Users}
          iconClass="text-emerald-600 bg-emerald-50"
        />
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <SearchInput
              placeholder="Search by DSO name..."
              value={search}
              onSearch={setSearch}
              className="max-w-sm"
            />
            <Select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="w-40">
              <option value="All">All Areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Rank</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">DSO</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Area</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">New SIM</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">MNP</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Replacement</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">BYN</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformance.map((dso, idx) => (
                  <tr key={dso.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? "bg-amber-100 text-amber-700" :
                        idx === 1 ? "bg-slate-200 text-muted-foreground" :
                        idx === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-slate-100 text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                          {dso.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{dso.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{dso.id.split("-")[1]}</td>
                    <td className="py-4 px-4">
                      <span className="text-lg font-bold text-brand-600">{dso.totalActivations}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Smartphone size={12} className="text-emerald-500" />
                        <span className="text-sm font-medium text-foreground">{dso.newSim}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <ArrowRightLeft size={12} className="text-purple-500" />
                        <span className="text-sm font-medium text-foreground">{dso.mnp}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Repeat size={12} className="text-amber-500" />
                        <span className="text-sm font-medium text-foreground">{dso.replacement}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Hash size={12} className="text-cyan-500" />
                        <span className="text-sm font-medium text-foreground">{dso.byn}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusPill label={dso.status} tone={dso.status === "Active" || dso.status === "Excellent" || dso.status === "Good" ? "positive" : "negative"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPerformance.length === 0 && (
            <EmptyState icon={Users} title="No DSOs found" description="Try adjusting your search or area filter." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}