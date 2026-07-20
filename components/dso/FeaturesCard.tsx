"use client";

import { Smartphone, ArrowRightLeft, MapPin, Wallet, Target, Bell } from "lucide-react";

const features = [
  { icon: Smartphone, label: "SIM Activations" },
  { icon: ArrowRightLeft, label: "MNP Services" },
  { icon: MapPin, label: "GPS Attendance" },
  { icon: Wallet, label: "Wallet System" },
  { icon: Target, label: "Daily Targets" },
  { icon: Bell, label: "Notifications" },
];

export default function FeaturesCard() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5">
      <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Features</h4>
      <div className="grid grid-cols-2 gap-2">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-white/60 text-xs py-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#0057FF]/10 flex items-center justify-center text-[#00C2FF] flex-shrink-0">
              <f.icon size={12} />
            </div>
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
