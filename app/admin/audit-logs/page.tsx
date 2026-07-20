"use client";

import { Download } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

export default function AuditLogsPage() {
  const { auditLogs } = useData();

  const exportLogs = () => {
    const headers = ["Timestamp", "User", "Action", "Details", "Type"];
    const rows = auditLogs.map((l) => [l.time, l.user, l.action, l.detail, l.type]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Track all system activities. Logs cannot be deleted.</p>
        </div>
        <button onClick={exportLogs} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all">
          <Download size={14} /> Export Logs
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Timestamp</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">User</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Action</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Details</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Type</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((l, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-400 text-sm font-mono">{formatDateDDMMYYYY(l.time)}</td>
                  <td className="px-6 py-3 text-gray-600 text-sm">{l.user}</td>
                  <td className="px-6 py-3 text-gray-900 text-sm font-medium">{l.action}</td>
                  <td className="px-6 py-3 hidden md:table-cell text-gray-400 text-sm">{l.detail}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${l.type === "auth" ? "bg-blue-50 text-blue-700" : l.type === "update" ? "bg-[#C8A951]/10 text-amber-700" : l.type === "payment" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>{l.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {auditLogs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">No audit logs yet</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        <span>Audit logs are immutable and cannot be deleted or modified.</span>
      </div>
    </div>
  );
}
