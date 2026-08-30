"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { Target, TrendingUp, TrendingDown, Award, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TargetsPage() {
  const { targets } = useDSMData();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const monthTargets = targets.filter((t) => t.month === monthStr);

  const getTargetsByType = (type: string) => {
    const typeTargets = monthTargets.filter((t) => t.type === type);
    const totalTarget = typeTargets.reduce((s, t) => s + t.monthly, 0);
    const totalActual = typeTargets.reduce((s, t) => s + t.monthlyAchieved, 0);
    return { target: totalTarget, actual: totalActual };
  };

  const types = [
    { key: "New SIM", label: "New SIM", color: "bg-emerald-500" },
    { key: "MNP", label: "MNP", color: "bg-purple-500" },
    { key: "Replacement", label: "Replacement", color: "bg-amber-500" },
    { key: "BYN", label: "BYN", color: "bg-cyan-500" },
  ];

  const totalTarget = types.reduce((s, t) => s + getTargetsByType(t.key).target, 0);
  const totalActual = types.reduce((s, t) => s + getTargetsByType(t.key).actual, 0);
  const completionPct = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
  const remaining = Math.max(0, totalTarget - totalActual);

  const hasTargets = monthTargets.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Targets" }]}
        title="Targets"
        description="Monthly targets versus actual performance"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Target" value={totalTarget} icon={Target} iconClass="text-emerald-600 bg-emerald-50" />
        <StatCard label="Total Actual" value={totalActual} icon={TrendingUp} iconClass="text-emerald-600 bg-emerald-50" />
        <StatCard
          label="Completion %"
          value={`${completionPct}%`}
          icon={Award}
          iconClass={completionPct >= 100 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"}
          progress={completionPct}
          progressClass={completionPct >= 100 ? "bg-emerald-500" : "bg-amber-500"}
        />
        <StatCard
          label="Remaining"
          value={remaining}
          icon={BarChart3}
          iconClass={remaining === 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Monthly Performance</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-32">
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </Select>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-24">
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasTargets ? (
            <EmptyState
              icon={Target}
              title="No targets set for this month"
              description={`Targets for ${months[selectedMonth - 1]} ${selectedYear} have not been configured yet.`}
            />
          ) : (
            <div className="space-y-4">
              {types.map((type) => {
                const data = getTargetsByType(type.key);
                const pct = data.target > 0 ? Math.round((data.actual / data.target) * 100) : 0;
                return (
                  <div key={type.key} className="rounded-lg bg-slate-50 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-foreground">{type.label}</h4>
                      <div className="flex items-center gap-2">
                        {pct >= 100 ? (
                          <TrendingUp size={16} className="text-emerald-500" />
                        ) : (
                          <TrendingDown size={16} className="text-red-500" />
                        )}
                        <span className={`text-sm font-bold ${pct >= 100 ? "text-emerald-600" : "text-red-600"}`}>{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full mb-3">
                      <div
                        className={`${type.color} h-full rounded-full transition-all`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Actual: <span className="font-semibold text-foreground">{data.actual}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Target: <span className="font-semibold text-foreground">{data.target}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
