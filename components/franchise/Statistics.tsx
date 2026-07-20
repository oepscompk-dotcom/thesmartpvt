"use client";

import { useEffect, useRef, useState } from "react";
import { useData } from "@/lib/DataContext";

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
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
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

interface StatCardProps {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
}

function StatCard({ value, suffix, label, icon }: StatCardProps) {
  const { count, ref } = useCountUp(value, 2500);
  return (
    <div ref={ref} className="glass-stat rounded-xl p-4 group hover:scale-105 transition-transform duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold/20 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-black text-white">
            {count.toLocaleString()}
            <span className="text-brand-gold text-lg">{suffix}</span>
          </p>
          <p className="text-white/50 text-xs font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

function countAll(prefix: string, suffix: string): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix) && key.endsWith(suffix)) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(data)) total += data.length;
      } catch {}
    }
  }
  return total;
}

export default function Statistics() {
  const { franchises } = useData();
  const [counts, setCounts] = useState({ devices: 0, sims: 0 });

  useEffect(() => {
    setCounts({
      devices: countAll("franchise-", "-devices"),
      sims: countAll("franchise-", "-sims"),
    });
  }, []);

  const franchiseCount = franchises.length;
  const totalStaff = franchises.reduce((sum, f) => sum + (f.dsm || 0) + (f.dso || 0), 0);

  const stats = [
    {
      value: franchiseCount,
      suffix: "+",
      label: "Franchises",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      value: counts.sims,
      suffix: "+",
      label: "SIMs",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      value: totalStaff,
      suffix: "+",
      label: "Staff",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      value: counts.devices,
      suffix: "+",
      label: "Devices",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          value={stat.value}
          suffix={stat.suffix}
          label={stat.label}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
