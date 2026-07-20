"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Signal } from "lucide-react";

export default function RealTimeClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="glass-card rounded-xl p-3 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-20" />
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayName = days[time.getDay()];
  const monthName = months[time.getMonth()];
  const date = time.getDate();
  const year = time.getFullYear();

  return (
    <div className="glass-card rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-brand-gold" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A1628] animate-pulse" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white font-mono">
              {h12}:{minutes}
            </span>
            <span className="text-xs font-mono text-white/40">:{seconds}</span>
            <span className="text-[10px] font-bold text-brand-gold ml-1">{ampm}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Calendar className="w-3 h-3" />
            <span>{dayName}, {monthName} {date}, {year}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
