"use client";

import { Users, UserCheck, Smartphone, Activity, CheckCircle, Package } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";

export default function DashboardPreview() {
  const { dsms, dso, sims, devices, attendance, payroll } = useFranchiseData();

  const totalStaff = dsms.length + dso.length;
  const dsmCount = dsms.length;
  const dsoCount = dso.length;

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance.filter((a) => a.date === today);
  const attendancePct = totalStaff > 0 ? Math.round((todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length / totalStaff) * 100) : 0;

  const totalInventory = sims.length + devices.length;

  const data = [
    { icon: Users, label: "Staff", value: String(totalStaff), color: "text-brand-gold" },
    { icon: UserCheck, label: "DSM", value: String(dsmCount), color: "text-[#00C8FF]" },
    { icon: Smartphone, label: "DSO", value: String(dsoCount), color: "text-green-400" },
  ];

  const metrics = [
    { icon: Activity, label: "Payroll Records", value: String(payroll.length), color: "text-green-400" },
    { icon: CheckCircle, label: "Attendance", value: `${attendancePct}%`, color: "text-brand-gold" },
    { icon: Package, label: "Inventory", value: totalInventory.toLocaleString(), color: "text-[#00C8FF]" },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 mt-4">
      <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
        Dashboard Preview
      </h4>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {data.map((item) => (
          <div key={item.label} className="text-center">
            <item.icon size={16} className={`${item.color} mx-auto mb-1`} />
            <p className="text-white font-bold text-sm">{item.value}</p>
            <p className="text-white/30 text-[10px]">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 pt-3 space-y-2">
        {metrics.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <item.icon size={12} className="text-white/30" />
              <span className="text-white/50 text-xs">{item.label}</span>
            </div>
            <span className={`${item.color} text-xs font-bold`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
