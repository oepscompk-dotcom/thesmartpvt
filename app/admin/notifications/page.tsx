"use client";

import { useState } from "react";
import { Send, MessageSquare, Mail, Smartphone, Trash2 } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

export default function NotificationsPage() {
  const { notifications, sendNotification, markNotificationRead, deleteNotification, clearAllNotifications } = useData();
  const [recipient, setRecipient] = useState("All Franchises");
  const [channel, setChannel] = useState("WhatsApp");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!title || !message) return;
    sendNotification({ title, message, type: "info", time: "Just now", read: false });
    setTitle("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notification Center</h1>
          <p className="text-gray-500 text-sm mt-1">Send notifications and view activity alerts</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={clearAllNotifications} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl hover:bg-red-100 transition-all">
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {sent && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-medium">Notification sent successfully!</div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Send Notification</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Recipients</label>
            <div className="flex flex-wrap gap-2">
              {["All Franchises", "Selected Franchise", "All DSM", "All DSO"].map((r) => (
                <button key={r} onClick={() => setRecipient(r)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${recipient === r ? "bg-[#0A2647] text-white shadow-md" : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>{r}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Channel</label>
            <div className="flex gap-3">
              {[
                { icon: MessageSquare, label: "WhatsApp" },
                { icon: Mail, label: "Email" },
                { icon: Smartphone, label: "SMS" },
              ].map((c) => (
                <button key={c.label} onClick={() => setChannel(c.label)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${channel === c.label ? "bg-[#0A2647] text-white shadow-md" : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                  <c.icon size={14} /> {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Message</label>
            <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your notification message..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all resize-none" />
          </div>
          <button onClick={handleSend} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
            <Send size={16} /> Send to {recipient} via {channel}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-bold">Recent Notifications ({notifications.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {notifications.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm">No notifications</p>
            </div>
          )}
          {notifications.map((n, i) => (
            <div key={i} className={`px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.type === "success" ? "bg-green-500" : n.type === "warning" ? "bg-yellow-500" : n.type === "error" ? "bg-red-500" : "bg-blue-500"}`} />
              <div className="flex-1" onClick={() => markNotificationRead(i)}>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="w-1.5 h-1.5 bg-[#C8A951] rounded-full" />}
                </div>
                <p className="text-gray-500 text-sm">{n.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs whitespace-nowrap">{formatDateDDMMYYYY(n.time)}</span>
                <button onClick={() => deleteNotification(i)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
