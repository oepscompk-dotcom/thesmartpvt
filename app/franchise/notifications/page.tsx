"use client";

import { useState } from "react";
import { Bell, Send, Trash2, MessageSquare, Mail, Smartphone, CheckCircle } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Send notifications via WhatsApp, Email, or SMS</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Send size={16} /> Send Notification
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {types.map(({ key, icon: Icon, color }) => (
          <div key={key} className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 mx-auto mb-2`}><Icon size={18} /></div>
            <p className="text-3xl font-black text-gray-900">{notifications.filter((n) => n.type === key).length}</p>
            <p className="text-gray-500 text-xs mt-1">{key}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Type</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Message</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Recipient</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...notifications].reverse().map((n) => (
                <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${n.type === "WhatsApp" ? "bg-green-50 text-green-700" : n.type === "Email" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{n.type}</span></td>
                  <td className="px-6 py-4 text-gray-900 text-sm max-w-xs truncate">{n.message}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-gray-600 text-sm">{n.recipient || "All"}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{formatDateDDMMYYYY(n.date || "")} {n.time}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => deleteNotification(n.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {notifications.length === 0 && <div className="px-6 py-12 text-center"><Bell size={32} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">No notifications sent yet</p></div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Send Notification</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Type</label><div className="flex gap-3">{types.map(({ key, icon: Icon, color }) => <button key={key} onClick={() => setForm((p) => ({ ...p, type: key }))} className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${form.type === key ? `border-${color}-500 bg-${color}-50` : "border-gray-200 hover:border-gray-300"}`}><Icon size={18} className={form.type === key ? `text-${color}-600` : "text-gray-400"} /><span className={`text-xs font-medium ${form.type === key ? `text-${color}-700` : "text-gray-500"}`}>{key}</span></button>)}</div></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Recipient (optional)</label><input type="text" value={form.recipient} onChange={(e) => setForm((p) => ({ ...p, recipient: e.target.value }))} placeholder="Phone number or email" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
              <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Message</label><textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 resize-none" /></div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleSend} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center justify-center gap-2"><Send size={14} /> Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
