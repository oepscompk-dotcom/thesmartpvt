import { SelectHTMLAttributes } from "react";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 ${className}`}
      {...props}
    />
  );
}