import { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 ${className}`}
      {...props}
    />
  );
}