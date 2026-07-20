"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { Target, Calendar, TrendingUp, TrendingDown, Award, BarChart3 } from "lucide-react";

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

  const stats = [
    { label: "Total Target", value: totalTarget, icon: Target, color: "bg-[#0057FF]" },
    { label: "Total Actual", value: totalActual, icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Completion %", value: `${completionPct}%`, icon: Award, color: completionPct >= 100 ? "bg-emerald-500" : "bg-amber-500" },
    { label: "Remaining", value: remaining, icon: BarChart3, color: remaining === 0 ? "bg-emerald-500" : "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        {!hasTargets ? (
          <div className="text-center py-16">
            <Target size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No targets set for this month</h3>
            <p className="text-sm text-gray-400">Targets for {months[selectedMonth - 1]} {selectedYear} have not been configured yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {types.map((type) => {
              const data = getTargetsByType(type.key);
              const pct = data.target > 0 ? Math.round((data.actual / data.target) * 100) : 0;
              return (
                <div key={type.key} className="p-5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">{type.label}</h4>
                    <div className="flex items-center gap-2">
                      {pct >= 100 ? (
                        <TrendingUp size={16} className="text-emerald-500" />
                      ) : (
                        <TrendingDown size={16} className="text-red-500" />
                      )}
                      <span className={`text-sm font-bold ${pct >= 100 ? "text-emerald-600" : "text-red-600"}`}>{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full mb-3">
                    <div
                      className={`${type.color} h-full rounded-full transition-all`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Actual: <span className="font-semibold text-gray-900">{data.actual}</span>
                    </span>
                    <span className="text-gray-500">
                      Target: <span className="font-semibold text-gray-900">{data.target}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
