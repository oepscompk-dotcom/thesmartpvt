"use client";

import { useEffect, useRef, useState } from "react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { useData } from "@/lib/DataContext";

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

function StatItem({ value, suffix, label, color }: { value: number; suffix: string; label: string; color: string }) {
  const { count, ref } = useCountUp(value, 2500);
  return (
    <div ref={ref} className="text-center">
      <p className="text-lg font-black" style={{ color }}>
        {count.toLocaleString()}
        <span className="text-xs ml-0.5 opacity-70">{suffix}</span>
      </p>
      <p className="text-[9px] text-white/40 font-medium">{label}</p>
    </div>
  );
}

export default function LiveMetrics({ color = "#FFFB63" }: { color?: string }) {
  const { dsms, dso, attendance, sims, devices } = useFranchiseData();

  const today = new Date().toISOString().split("T")[0];
  const todayAtt = attendance.filter((a) => a.date === today);
  const presentCount = todayAtt.filter((a) => a.status === "Present" || a.status === "Late").length;
  const totalStaff = dsms.length + dso.length;
  const attPct = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0;

  return (
    <div ref={undefined} className="glass-card rounded-xl p-3 border border-white/5">
      <div className="grid grid-cols-4 gap-2">
        <StatItem value={dso.length} suffix="" label="DSOs" color={color} />
        <StatItem value={dsms.length} suffix="" label="DSMs" color={color} />
        <StatItem value={sims.length} suffix="" label="SIMs" color={color} />
        <StatItem value={attPct} suffix="%" label="Attendance" color={color} />
      </div>
    </div>
  );
}
