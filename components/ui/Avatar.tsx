export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 ${className}`}
    >
      {initials || "?"}
    </div>
  );
}