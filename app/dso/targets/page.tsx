"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Target, Save, TrendingUp } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";

export default function DSOTargetsPage() {
  const { targets, updateTargets } = useDSOData();
  const [form, setForm] = useState({
    newSIM: targets.newSIM,
    newSIMAchieved: targets.newSIMAchieved,
    mnp: targets.mnp,
    mnpAchieved: targets.mnpAchieved,
    replacement: targets.replacement,
    replacementAchieved: targets.replacementAchieved,
    byn: targets.byn,
    bynAchieved: targets.bynAchieved,
  });
  const [saved, setSaved] = useState(false);

  const targetItems = [
    { key: "newSIM" as const, label: "New SIM", achieved: form.newSIMAchieved, target: form.newSIM, fieldA: "newSIMAchieved" as const, fieldT: "newSIM" as const, color: "blue" },
    { key: "mnp" as const, label: "MNP", achieved: form.mnpAchieved, target: form.mnp, fieldA: "mnpAchieved" as const, fieldT: "mnp" as const, color: "green" },
    { key: "replacement" as const, label: "Replacement", achieved: form.replacementAchieved, target: form.replacement, fieldA: "replacementAchieved" as const, fieldT: "replacement" as const, color: "orange" },
    { key: "byn" as const, label: "BYN", achieved: form.bynAchieved, target: form.byn, fieldA: "bynAchieved" as const, fieldT: "byn" as const, color: "purple" },
  ];

  const handleSave = () => {
    updateTargets({
      newSIM: form.newSIM,
      newSIMAchieved: form.newSIMAchieved,
      mnp: form.mnp,
      mnpAchieved: form.mnpAchieved,
      replacement: form.replacement,
      replacementAchieved: form.replacementAchieved,
      byn: form.byn,
      bynAchieved: form.bynAchieved,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const overallTarget = form.newSIM + form.mnp + form.replacement + form.byn;
  const overallAchieved = form.newSIMAchieved + form.mnpAchieved + form.replacementAchieved + form.bynAchieved;
  const overallPct = overallTarget > 0 ? Math.round((overallAchieved / overallTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Targets & Achievements</h1>
          <p className="text-gray-500 text-sm mt-1">{targets.month} — Track and update your monthly goals</p>
        </div>
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
        <div className="w-10 h-10 rounded-xl bg-[#C8A951]/20 flex items-center justify-center text-[#C8A951] mx-auto mb-2"><TrendingUp size={18} /></div>
        <p className="text-3xl font-black text-gray-900">{overallPct}%</p>
        <p className="text-gray-500 text-xs mt-1">Overall Progress ({overallAchieved}/{overallTarget})</p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
          <div className={`h-full rounded-full transition-all duration-500 ${overallPct >= 80 ? "bg-green-500" : overallPct >= 50 ? "bg-[#C8A951]" : "bg-red-500"}`} style={{ width: `${Math.min(overallPct, 100)}%` }} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {targetItems.map((item) => {
          const pct = item.target > 0 ? Math.round((item.achieved / item.target) * 100) : 0;
          const borderColor = item.color === "blue" ? "border-blue-200" : item.color === "green" ? "border-green-200" : item.color === "orange" ? "border-orange-200" : "border-purple-200";
          const bgColor = item.color === "blue" ? "bg-blue-50" : item.color === "green" ? "bg-green-50" : item.color === "orange" ? "bg-orange-50" : "bg-purple-50";
          const textColor = item.color === "blue" ? "text-blue-600" : item.color === "green" ? "text-green-600" : item.color === "orange" ? "text-orange-600" : "text-purple-600";

          return (
            <div key={item.key} className={`bg-white rounded-2xl p-5 border ${borderColor}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center ${textColor}`}><Target size={18} /></div>
                <div>
                  <p className="text-gray-900 font-bold text-sm">{item.label}</p>
                  <p className="text-gray-400 text-xs font-mono">{pct}%</p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-[#C8A951]" : "bg-red-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-gray-400 text-xs mb-1">Target</label>
                  <input type="number" value={item.target} onChange={(e) => setForm((p) => ({ ...p, [item.fieldT]: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-400 text-xs mb-1">Achieved</label>
                  <input type="number" value={item.achieved} onChange={(e) => setForm((p) => ({ ...p, [item.fieldA]: Number(e.target.value) }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>
              <div className="flex justify-between text-xs mt-3 pt-3 border-t border-gray-100">
                <span className="text-gray-500">Remaining</span>
                <span className="font-bold text-gray-900">{Math.max(item.target - item.achieved, 0)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
