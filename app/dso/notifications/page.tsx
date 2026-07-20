"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, Check } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

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

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "warning": return "bg-yellow-50 border-yellow-200";
      case "success": return "bg-green-50 border-green-200";
      default: return "bg-blue-50 border-blue-200";
    }
  };

  const handleClick = (id: string, read: boolean) => {
    if (!read) markNotificationRead(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Stay updated on your activities</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-2"><Bell size={18} /></div>
          <p className="text-3xl font-black text-gray-900">{notifications.length}</p>
          <p className="text-gray-500 text-xs mt-1">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 mx-auto mb-2"><AlertTriangle size={18} /></div>
          <p className="text-3xl font-black text-gray-900">{unreadCount}</p>
          <p className="text-gray-500 text-xs mt-1">Unread</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "all" ? "bg-[#0A2647] text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          All ({notifications.length})
        </button>
        <button onClick={() => setFilter("unread")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "unread" ? "bg-[#0A2647] text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          Unread ({unreadCount})
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.id} onClick={() => handleClick(n.id, n.read)} className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md ${n.read ? "border-gray-200" : getTypeStyle(n.type)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                {getTypeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-gray-900 font-bold text-sm">{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#C8A951] flex-shrink-0" />}
                </div>
                <p className="text-gray-600 text-sm">{n.message}</p>
                <p className="text-gray-400 text-xs mt-2">{formatDateDDMMYYYY(n.time)}</p>
              </div>
              {!n.read && (
                <button onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }} className="flex-shrink-0 p-2 text-gray-400 hover:text-[#0A2647] hover:bg-gray-100 rounded-lg transition-all" title="Mark as read">
                  <Check size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <Bell size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{filter === "unread" ? "All caught up! No unread notifications." : "No notifications yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
