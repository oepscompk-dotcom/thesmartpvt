import { ReactNode } from "react";
import { Inbox, LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actions,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actions && <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}