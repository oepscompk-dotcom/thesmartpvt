"use client";

import { useEffect, useRef, useState } from "react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
}

function Stat({ value, suffix, label, icon }: StatProps) {
  const { count, ref } = useCountUp(value, 2500);
  return (
    <div ref={ref} className="glass-stat rounded-xl p-3 group hover:scale-105 transition-transform duration-300">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9] group-hover:bg-[#0EA5E9]/20 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-xl font-black text-white">
            {count.toLocaleString()}
            <span className="text-[#0EA5E9] text-sm">{suffix}</span>
          </p>
          <p className="text-white/50 text-[10px] font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function TeamStatistics() {
  const { dsms, dso, attendance, payroll } = useFranchiseData();

  const totalDSOs = dso.length;
  const totalStaff = dsms.length + dso.length;
  const today = new Date().toISOString().split("T")[0];
  const todayAtt = attendance.filter((a) => a.date === today);
  const attendancePct = totalStaff > 0 ? Math.round((todayAtt.filter((a) => a.status === "Present" || a.status === "Late").length / totalStaff) * 100) : 0;

  const stats = [
    { value: totalDSOs, suffix: "", label: "Total DSOs", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { value: attendancePct, suffix: "%", label: "Attendance", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { value: payroll.length, suffix: "", label: "Payroll Records", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { value: attendance.length, suffix: "", label: "Total Attendance", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} icon={s.icon} />
      ))}
    </div>
  );
}
