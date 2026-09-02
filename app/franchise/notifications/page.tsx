"use client";

import { useState } from "react";
import { Bell, Send, Trash2, MessageSquare, Mail, Smartphone, X } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotificationsPage() {
  const { auth, notifications, addNotification, deleteNotification } = useFranchiseData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ message: "", type: "WhatsApp" as "WhatsApp" | "Email" | "SMS", recipient: "" });

  const handleSend = () => {
    if (!form.message) return;
    addNotification({ id: `NTF-${String(notifications.length + 1).padStart(3, "0")}`, franchiseId: auth.franchiseId, date: new Date().toISOString().split("T")[0], time: new Date().toLocaleTimeString(), read: false, ...form });
    setShowForm(false);
    setForm({ message: "", type: "WhatsApp", recipient: "" });
  };

  const types = [
    { key: "WhatsApp" as const, icon: MessageSquare, color: "green" },
    { key: "Email" as const, icon: Mail, color: "blue" },
    { key: "SMS" as const, icon: Smartphone, color: "purple" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Notifications" }]}
        title="Notifications"
        description="Send notifications via WhatsApp, Email, or SMS"
        actions={<Button onClick={() => setShowForm(true)}><Send size={16} /> Send Notification</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {types.map(({ key, icon: Icon, color }) => (
          <StatCard key={key} label={key} value={notifications.filter((n) => n.type === key).length} icon={Icon} iconClass={`text-${color}-600 bg-${color}-50`} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-5">
          <CardTitle className="flex items-center gap-2 text-sm font-bold"><Bell size={16} className="text-brand-600" /> All Notifications</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
               <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-medium uppercase">Type</th>
                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-medium uppercase">Message</th>
                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-medium uppercase hidden md:table-cell">Recipient</th>
                <th className="px-6 py-4 text-left text-muted-foreground text-xs font-medium uppercase">Date</th>
                <th className="px-6 py-4 text-right text-muted-foreground text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...notifications].reverse().map((n) => (
                <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${n.type === "WhatsApp" ? "bg-green-100 text-green-700" : n.type === "Email" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{n.type}</span>
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-slate-900 text-sm">{n.message}</td>
                  <td className="hidden px-6 py-4 text-slate-600 text-sm md:table-cell">{n.recipient || "All"}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{formatDateDDMMYYYY(n.date || "")} {n.time}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => deleteNotification(n.id)} className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {notifications.length === 0 && (
            <EmptyState icon={Bell} title="No notifications sent yet" description="Send your first notification to get started." actions={<Button variant="outline" size="sm" onClick={() => setShowForm(true)}><Send size={14} /> Send Notification</Button>} />
          )}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
              <CardTitle>Send Notification</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 text-muted-foreground hover:text-slate-900"><X size={18} /></button>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
                <div className="flex gap-3">
                  {types.map(({ key, icon: Icon, color }) => (
                    <button key={key} onClick={() => setForm((p) => ({ ...p, type: key }))} className={`flex-1 flex flex-col items-center gap-1 rounded-xl border-2 py-3 transition-all ${form.type === key ? `bg-${color}-50 border-${color}-500` : "border-slate-200 hover:border-slate-300"}`}>
                      <Icon size={18} className={form.type === key ? `text-${color}-600` : "text-slate-400"} />
                      <span className={`text-xs font-medium ${form.type === key ? `text-${color}-700` : "text-slate-500"}`}>{key}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Recipient (optional)</label>
                <Input value={form.recipient} onChange={(e) => setForm((p) => ({ ...p, recipient: e.target.value }))} placeholder="Phone number or email" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
                <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={4} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500" />
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSend}><Send size={14} /> Send</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
