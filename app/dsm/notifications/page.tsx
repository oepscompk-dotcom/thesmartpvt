"use client";

import { useState } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { Bell, CheckCheck, Filter, Info, AlertTriangle, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useDSMData();
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");

  const sorted = [...notifications].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const filtered = sorted.filter((n) => filter === "all" || (filter === "read" ? n.read : !n.read));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    notifications.filter((n) => !n.read).forEach((n) => markNotificationRead(n.id));
  };

  const typeBadge = (type: string) => {
    const styles: Record<string, string> = {
      info: "bg-blue-100 text-blue-700",
      warning: "bg-yellow-100 text-yellow-700",
      success: "bg-green-100 text-green-700",
      error: "bg-red-100 text-red-700",
    };
    return styles[type] || "bg-gray-100 text-gray-600";
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="bg-[#0057FF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0047CC] flex items-center gap-2">
              <CheckCheck size={18} />
              Mark All Read
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? "bg-[#0057FF] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === "read" ? "No read notifications" : filter === "unread" ? "All caught up!" : "You have no notifications yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`w-full text-left p-4 transition-colors hover:bg-gray-50 ${
                    !n.read ? "bg-blue-50/50 border-l-4 border-[#0057FF]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${typeBadge(n.type)}`}>
                      {typeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${!n.read ? "font-medium text-gray-900" : "text-gray-600"}`}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge(n.type)}`}>{n.type}</span>
                         <span className="text-xs text-gray-400">{formatDateDDMMYYYY(n.time)}</span>
                        {!n.read && <span className="w-2 h-2 bg-[#0057FF] rounded-full" />}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
