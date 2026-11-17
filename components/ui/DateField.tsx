"use client";

import { Calendar } from "lucide-react";
import { Input } from "./Input";
import { todayLocalDate } from "@/lib/dateUtils";

interface DateFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  min?: string;
  max?: string;
  className?: string;
}

export function DateField({
  label = "Activation Date",
  value,
  onChange,
  hint = "Defaults to today. Pick any custom date to record the activation on that day.",
  min,
  max,
  className = "",
}: DateFieldProps) {
  const isToday = !value || value === todayLocalDate();

  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            max={max}
            className="h-11 pl-9"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange(todayLocalDate())}
          disabled={isToday}
          className={`h-11 shrink-0 rounded-lg border px-3 text-xs font-semibold transition-colors ${
            isToday
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
          }`}
        >
          Today
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
