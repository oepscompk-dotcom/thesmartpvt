"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Wrench, Clock, CheckCircle, Filter } from "lucide-react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { apiLoad } from "@/lib/api";

async function loadEquipmentIssueRecords(franchiseId?: string) {
  if (typeof window === "undefined") return [];
  try {
    const result = await apiLoad("equipmentIssueRecord", franchiseId);
    return Array.isArray(result) ? result : [];
  } catch {}
  return [];
}

export default function DSMFieldEquipmentPage() {
  const { auth } = useDSMData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [allRecords, setAllRecords] = useState<any[]>([]);
  useEffect(() => {
    loadEquipmentIssueRecords(auth.franchiseId).then(setAllRecords);
  }, [auth.franchiseId]);
  const myRecords = useMemo(() => {
    return allRecords.filter((r: any) => r.personId === auth.dsmId);
  }, [allRecords, auth.dsmId]);

  const filtered = useMemo(() => {
    return myRecords.filter((r: any) => {
      const matchSearch = !search ||
        r.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
        r.equipmentId?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [myRecords, search, statusFilter]);

  const stats = useMemo(() => {
    let active = 0, returned = 0;
    myRecords.forEach((r: any) => { if (r.status === "Issued") active++; else if (r.status === "Returned") returned++; });
    return { total: myRecords.length, active, returned };
  }, [myRecords]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Field Equipment</h1>
        <p className="text-gray-500 text-sm mt-1">Equipment issued to you</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0057FF]/10 flex items-center justify-center"><Wrench size={14} className="text-[#0057FF]" /></div>
          <div><p className="text-lg font-black text-gray-900">{stats.total}</p><p className="text-gray-500 text-[10px]">Total</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Clock size={14} className="text-blue-600" /></div>
          <div><p className="text-lg font-black text-blue-600">{stats.active}</p><p className="text-gray-500 text-[10px]">Active</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle size={14} className="text-green-600" /></div>
          <div><p className="text-lg font-black text-green-600">{stats.returned}</p><p className="text-gray-500 text-[10px]">Returned</p></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0057FF]/30 focus-within:ring-2 focus-within:ring-[#0057FF]/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Issued", "Returned"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-[#0057FF] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              <span className="flex items-center gap-1.5"><Filter size={12} /> {s}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">Sr.No</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Equipment</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Equipment ID</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Issue Date</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Return Date</th>
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, idx: number) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0057FF]/10 text-[#0057FF] text-xs font-black">{idx + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 text-sm font-medium">{r.equipmentName}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs font-mono">{r.equipmentId}</td>
                   <td className="px-4 py-3 text-gray-500 text-xs">{formatDateDDMMYYYY(r.issueDate)}</td>
                   <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(r.returnDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${r.status === "Issued" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Wrench size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No equipment issued to you</p>
          </div>
        )}
      </div>
    </div>
  );
}
