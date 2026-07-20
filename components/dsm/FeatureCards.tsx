"use client";

import { Users, MapPin, Target, Package, BarChart3, FileText } from "lucide-react";

const features = [
  { icon: Users, label: "Team Management", desc: "Manage DSO teams" },
  { icon: MapPin, label: "Attendance", desc: "Track field attendance" },
  { icon: Target, label: "Target Management", desc: "Set and monitor targets" },
  { icon: Package, label: "Inventory", desc: "View assigned inventory" },
  { icon: BarChart3, label: "Sales Analytics", desc: "Analyze performance" },
  { icon: FileText, label: "Reports", desc: "Generate team reports" },
];

export default function FeatureCards() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5">
      <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">DSM Features</h4>
      <div className="space-y-2">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-3 text-white/60 text-xs py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9] flex-shrink-0 group-hover:bg-[#0EA5E9]/20 transition-colors">
              <f.icon size={14} />
            </div>
            <div>
              <p className="text-white/80 font-medium">{f.label}</p>
              <p className="text-white/30 text-[10px]">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
