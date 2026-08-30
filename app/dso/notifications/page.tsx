"use client";

import { useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, Check, Inbox } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DSONotificationsPage() {
  const { notifications, markNotificationRead } = useDSOData();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle size={16} className="text-yellow-500" />;
      case "success": return <CheckCircle2 size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const handleClick = (id: string, read: boolean) => {
    if (!read) markNotificationRead(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "Notifications" }]}
        title="Notifications"
        description="Stay updated on your activities"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Notifications" value={notifications.length} icon={Bell} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Unread" value={unreadCount} icon={AlertTriangle} iconClass="text-yellow-600 bg-yellow-50" />
      </div>

      <div className="flex flex-wrap gap-2">
        <QuickChip label="All" count={notifications.length} active={filter === "all"} onClick={() => setFilter("all")} />
        <QuickChip label="Unread" count={unreadCount} active={filter === "unread"} onClick={() => setFilter("unread")} />
      </div>

      <div className="space-y-3">
        {filtered.map((n) => (
          <Card
            key={n.id}
            onClick={() => handleClick(n.id, n.read)}
            className={`group cursor-pointer p-4 sm:p-5 transition-shadow hover:shadow-md ${n.read ? "" : "border-yellow-200 bg-yellow-50/40"}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                {getTypeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-foreground font-semibold text-sm">{n.title}</h4>
                  {!n.read && <StatusPill label="New" tone="warning" />}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-2 font-mono">{formatDateDDMMYYYY(n.time)}</p>
              </div>
              {!n.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}
                  className="flex-shrink-0"
                  title="Mark as read"
                >
                  <Check size={14} />
                </Button>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <EmptyState
              icon={Inbox}
              title={filter === "unread" ? "All caught up!" : "No notifications yet"}
              description={filter === "unread" ? "You have no unread notifications." : "Notifications will appear here when they arrive."}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
