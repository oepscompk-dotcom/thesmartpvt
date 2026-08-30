import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass = "text-brand-600 bg-brand-50",
  trend,
  trendUp = true,
  progress,
  progressClass = "bg-brand-500",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: LucideIcon;
  iconClass?: string;
  trend?: React.ReactNode;
  trendUp?: boolean;
  progress?: number;
  progressClass?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/80">{sub}</p>}
      {progress !== undefined && (
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${progressClass}`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}