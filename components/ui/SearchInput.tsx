import { useState } from "react";
import { Search } from "lucide-react";

export function SearchInput({
  placeholder,
  value,
  onSearch,
  onChange,
  className = "",
}: {
  placeholder: string;
  value?: string;
  onSearch?: (v: string) => void;
  onChange?: (v: string) => void;
  className?: string;
}) {
  const [local, setLocal] = useState(value ?? "");
  return (
    <div className={`relative min-w-[220px] flex-1 ${className}`}>
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange?.(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch?.(local);
        }}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-slate-200 bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
      />
    </div>
  );
}