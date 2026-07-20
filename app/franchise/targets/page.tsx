"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";

export default function TargetsPage() {
  const { dso, getTarget, updateTarget } = useFranchiseData();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const dsoWithTargets = dso.map((d) => {
    const t = getTarget(d.id, month);
    return { ...d, target: t };
  });

  const handleTargetUpdate = (dsoId: string, field: string, value: number) => {
    const existing = getTarget(dsoId, month);
    const updated = { ...existing, dsoId, month, [field]: value };
    updateTarget(existing.id, updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Target & Achievement</h1>
          <p className="text-gray-500 text-sm mt-1">Monthly targets for all DSOs</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-gray-500 text-sm">Month:</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dsoWithTargets.map((d) => {
          const t = d.target;
          const devicePct = (t.deviceTarget ?? 0) > 0 ? Math.round(((t.deviceAchieved ?? 0) / (t.deviceTarget ?? 1)) * 100) : 0;
          const simPct = (t.simTarget ?? 0) > 0 ? Math.round(((t.simAchieved ?? 0) / (t.simTarget ?? 1)) * 100) : 0;

          return (
            <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Target size={18} /></div>
                <div>
                  <p className="text-gray-900 font-bold text-sm">{d.name}</p>
                  <p className="text-gray-400 text-xs font-mono">{d.id}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Devices</span><span className={`font-medium ${devicePct >= 80 ? "text-green-600" : devicePct >= 50 ? "text-yellow-600" : "text-red-600"}`}>{t.deviceAchieved ?? 0}/{t.deviceTarget ?? 0} ({devicePct}%)</span></div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${devicePct >= 80 ? "bg-green-500" : devicePct >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(devicePct, 100)}%` }} /></div>
                  <div className="flex gap-2 mt-1.5">
                    <input type="number" value={t.deviceTarget ?? 0} onChange={(e) => handleTargetUpdate(d.id, "deviceTarget", Number(e.target.value))} placeholder="Target" className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
                    <input type="number" value={t.deviceAchieved ?? 0} onChange={(e) => handleTargetUpdate(d.id, "deviceAchieved", Number(e.target.value))} placeholder="Done" className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">SIMs</span><span className={`font-medium ${simPct >= 80 ? "text-green-600" : simPct >= 50 ? "text-yellow-600" : "text-red-600"}`}>{t.simAchieved ?? 0}/{t.simTarget ?? 0} ({simPct}%)</span></div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${simPct >= 80 ? "bg-green-500" : simPct >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(simPct, 100)}%` }} /></div>
                  <div className="flex gap-2 mt-1.5">
                    <input type="number" value={t.simTarget ?? 0} onChange={(e) => handleTargetUpdate(d.id, "simTarget", Number(e.target.value))} placeholder="Target" className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
                    <input type="number" value={t.simAchieved ?? 0} onChange={(e) => handleTargetUpdate(d.id, "simAchieved", Number(e.target.value))} placeholder="Done" className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
                  <span className="text-gray-500">Total Points</span>
                  <span className="font-bold text-gray-900">{(t.deviceAchieved ?? 0) * 2 + (t.simAchieved ?? 0) * 1}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
