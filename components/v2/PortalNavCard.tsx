"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  route: string;
  color: string;
  delay?: number;
}

export default function PortalNavCard({ icon: Icon, title, subtitle, route, color, delay = 0 }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="glass-card rounded-xl p-3 text-left group hover:scale-[1.02] transition-all duration-300 border border-white/5 hover:border-white/15 w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{title}</p>
          <p className="text-[10px] text-white/40 truncate">{subtitle}</p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}
