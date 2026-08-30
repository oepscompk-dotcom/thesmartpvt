"use client";

import { useState } from "react";
import { Send, MessageSquare, Mail, Smartphone, Trash2, Bell } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const { notifications, sendNotification, markNotificationRead, deleteNotification, clearAllNotifications } = useData();
  const [recipient, setRecipient] = useState("All Franchises");
  const [channel, setChannel] = useState("WhatsApp");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const handleSend = () => {
    if (!title || !message) return;
    sendNotification({ title, message, type: "info", time: "Just now", read: false });
    setTitle("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const filtered = notifications
    .map((n, i) => ({ n, i }))
    .filter(({ n }) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const submitSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Notifications" }]}
        title="Notification Center"
        description="Send notifications and view activity alerts"
        actions={
          notifications.length > 0 ? (
            <Button variant="destructive" onClick={clearAllNotifications}>
              <Trash2 className="h-4 w-4" /> Clear All
            </Button>
          ) : undefined
        }
      />

      {sent && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">Notification sent successfully!</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <div className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</label>
            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title..." />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Recipients</label>
            <div className="flex flex-wrap gap-2">
              {["All Franchises", "Selected Franchise", "All DSM", "All DSO"].map((r) => (
                <Button
                  key={r}
                  size="md"
                  variant={recipient === r ? "primary" : "outline"}
                  onClick={() => setRecipient(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Channel</label>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: MessageSquare, label: "WhatsApp" },
                { icon: Mail, label: "Email" },
                { icon: Smartphone, label: "SMS" },
              ].map((c) => (
                <Button
                  key={c.label}
                  size="md"
                  variant={channel === c.label ? "primary" : "outline"}
                  onClick={() => setChannel(c.label)}
                >
                  <c.icon className="h-4 w-4" /> {c.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
            <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your notification message..." className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" /> Send to {recipient} via {channel}
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Recent Notifications ({notifications.length})</CardTitle>
          <SearchInput placeholder="Search notifications..." value={search} onSearch={submitSearch} className="min-w-[200px] flex-1" />
        </CardHeader>
        <div className="divide-y divide-slate-100">
          {paginated.length === 0 && (
            <EmptyState icon={Bell} title="No notifications" description={search ? "No notifications match your search." : "Sent notifications will appear here."} />
          )}
          {paginated.map(({ n, i }) => (
            <div key={`${i}-${n.title}`} className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${!n.read ? "bg-brand-50/30" : ""}`}>
              <span className={`mt-2 flex-shrink-0 rounded-full ${n.type === "success" ? "bg-green-500" : n.type === "warning" ? "bg-amber-500" : n.type === "error" ? "bg-red-500" : "bg-brand-500"}`}>
                <span className="block h-2 w-2 rounded-full" />
              </span>
              <div className="flex-1" onClick={() => markNotificationRead(i)}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground/80">{formatDateDDMMYYYY(n.time)}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:bg-red-50 hover:text-red-600" onClick={() => deleteNotification(i)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
        {paginated.length > 0 && <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />}
      </Card>
    </div>
  );
}