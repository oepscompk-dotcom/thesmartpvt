"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const typeTone: Record<string, "positive" | "warning" | "negative" | "neutral" | "brand" | "accent"> = {
  info: "brand",
  warning: "warning",
  success: "positive",
  error: "negative",
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useDSMData();
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");

  const sorted = [...notifications].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const filtered = sorted.filter((n) => filter === "all" || (filter === "read" ? n.read : !n.read));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    notifications.filter((n) => !n.read).forEach((n) => markNotificationRead(n.id));
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle size={14} />;
      case "success": return <CheckCircle size={14} />;
      case "error": return <AlertTriangle size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Notifications" }]}
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        actions={
          unreadCount > 0 && (
            <Button onClick={markAllRead}>
              <CheckCheck size={18} />
              Mark All Read
            </Button>
          )
        }
      />

      <div className="flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <QuickChip
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            count={f === "unread" ? unreadCount : undefined}
            active={filter === f}
            onClick={() => setFilter(f)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={filter === "read" ? "No read notifications" : filter === "unread" ? "All caught up!" : "You have no notifications yet"}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`w-full text-left p-4 transition-colors hover:bg-slate-50 ${
                  !n.read ? "bg-brand-50/50 border-l-4 border-brand-600" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg mt-0.5 ${
                    typeTone[n.type] === "positive" ? "bg-green-100 text-green-700"
                    : typeTone[n.type] === "warning" ? "bg-orange-100 text-orange-700"
                    : typeTone[n.type] === "negative" ? "bg-red-100 text-red-700"
                    : "bg-brand-100 text-brand-700"
                  }`}>
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!n.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>{n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusPill label={n.type} tone={typeTone[n.type]} />
                      <span className="text-xs text-muted-foreground">{formatDateDDMMYYYY(n.time)}</span>
                      {!n.read && <span className="w-2 h-2 bg-brand-600 rounded-full" />}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}