import { memo } from "react";

type Tone = "positive" | "warning" | "negative" | "neutral" | "brand" | "accent";

const tones: Record<Tone, string> = {
  positive: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  negative: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-600",
  brand: "bg-brand-100 text-brand-700",
  accent: "bg-purple-100 text-purple-700",
};

export type ToneValue = Tone | "muted";

const toneClass = (t: ToneValue): string => (t === "muted" ? tones.neutral : tones[t]);

export const StatusPill = memo(function StatusPill({ label, tone = "neutral" }: { label: string; tone?: ToneValue }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClass(tone)}`}>
      {label}
    </span>
  );
});

export const toneForStatus = (status: string): Tone => {
  const s = (status || "").toLowerCase();
  if (["active", "approved", "paid", "in stock", "available", "present", "success", "on track", "delivered", "verified"].some((k) => s.includes(k))) return "positive";
  if (["pending", "late", "partial", "warning", "warn", "low", "flagged", "in progress"].some((k) => s.includes(k))) return "warning";
  if (["inactive", "absent", "blocked", "failed", "rejected", "denied", "overdue", "returned", "unassigned", "expired"].some((k) => s.includes(k))) return "negative";
  if (["draft", "issued", "return", "on leave", "inactive"].some((k) => s.includes(k))) return "neutral";
  return "brand";
};

export function QuickChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
          {count}
        </span>
      )}
    </button>
  );
}