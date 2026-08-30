import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export function ProfileCover({
  logo,
  fallbackInitial,
  name,
  roleLabel,
  roleIcon: RoleIcon,
  idLine,
  status,
}: {
  logo?: string;
  fallbackInitial: string;
  name: string;
  roleLabel: string;
  roleIcon?: LucideIcon;
  idLine?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#2D28CD] shadow-lg shadow-[#0A2647]/20">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FFFB63] via-[#F1B308] to-[#FFFB63]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#00C8FF]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#FFFB63]/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-xl ring-4 ring-[#FFFB63]/30">
          {logo ? (
            <img src={logo} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFFB63] to-[#F1B308]">
              <span className="text-3xl font-black text-[#0A2647]">{fallbackInitial}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="truncate text-2xl font-bold tracking-tight text-white">{name}</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFB63] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0A2647]">
              {RoleIcon && <RoleIcon size={12} strokeWidth={2.5} />}
              {roleLabel}
            </span>
          </div>
          {idLine && <p className="mt-1 text-sm font-mono text-[#B4FFFF]">{idLine}</p>}
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>
    </div>
  );
}

export function StatTile({
  icon: Icon,
  iconClass,
  label,
  value,
  sub,
  progress,
  progressClass = "bg-[#FFFB63]",
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  progress?: number;
  progressClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      {progress !== undefined && (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${progressClass}`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function InfoTile({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-slate-400">
        <Icon size={13} />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`truncate text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

export function SectionCard({
  icon: Icon,
  title,
  action,
  children,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFFB63]/30 text-[#F1B308]">
            <Icon size={15} strokeWidth={2.2} />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}