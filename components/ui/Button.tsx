import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "destructive" | "secondary";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm gap-2",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}