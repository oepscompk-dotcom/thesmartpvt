"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import { Smartphone, Search, Filter, Package, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SIM {
  id: string;
  network: string;
  simNumber: string;
  iccid: string;
  deviceId: string;
  status: string;
  receiveDate: string;
  franchiseId: string;
  type: "new" | "hlr";
  issuedToId?: string;
}

const NETWORKS = ["All", "Telenor", "Jazz", "Ufone", "Zong"];

function loadFromStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : defaultVal;
  } catch {
    return defaultVal;
  }
}

export default function DSOSimStockPage() {
  const { auth } = useDSOData();
  const [sims, setSims] = useState<SIM[]>([]);
  const [issuedSims, setIssuedSims] = useState<SIM[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [networkFilter, setNetworkFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const allSims = loadFromStorage<SIM[]>(`franchise-${auth.franchiseId}-sims`, []);
    const mySims = allSims.filter((s) => s.issuedToId === auth.dsoId && s.status === "Issued");
    setSims(allSims);
    setIssuedSims(mySims);
    setLoading(false);
  }, [auth.dsoId, auth.franchiseId]);

  const totalIssued = issuedSims.length;
  const newCount = issuedSims.filter((s) => s.type === "new").length;
  const hlrCount = issuedSims.filter((s) => s.type === "hlr").length;
  const networkCounts = issuedSims.reduce(
    (acc, s) => {
      acc[s.network] = (acc[s.network] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const filtered = issuedSims.filter((sim) => {
    if (activeTab === "New SIMs" && sim.type !== "new") return false;
    if (activeTab === "HLR SIMs" && sim.type !== "hlr") return false;
    if (networkFilter !== "All" && sim.network !== networkFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sim.id.toLowerCase().includes(q) ||
        sim.simNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusBadge = (status: string) => {
    if (status === "In Stock") return "bg-emerald-100 text-emerald-700";
    if (status === "Issued") return "bg-blue-100 text-blue-700";
    if (status === "Activated") return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#C8A951", borderTopColor: "transparent" }} />
          <p className="text-sm text-gray-500">Loading SIM stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dso/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0A2647" }}>
              <Smartphone className="inline-block mr-2 h-6 w-6" style={{ color: "#C8A951" }} />
              SIM Stock
            </h1>
            <p className="text-sm text-gray-500 mt-1">SIMs issued to you by Franchise Admin</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: "#0A2647" }}>
              <Package size={20} className="text-white" />
            </div>
            <p className="text-gray-900 font-black text-2xl">{totalIssued}</p>
            <p className="text-gray-500 text-sm font-medium">Total Issued</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
              <Smartphone size={20} className="text-blue-600" />
            </div>
            <p className="text-gray-900 font-black text-2xl">{newCount}</p>
            <p className="text-gray-500 text-sm font-medium">New SIMs</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
              <Smartphone size={20} className="text-purple-600" />
            </div>
            <p className="text-gray-900 font-black text-2xl">{hlrCount}</p>
            <p className="text-gray-500 text-sm font-medium">HLR SIMs</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: "#C8A951" }}>
              <CheckCircle size={20} className="text-white" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(networkCounts).map(([net, count]) => (
                <span key={net} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {net}: {count}
                </span>
              ))}
              {Object.keys(networkCounts).length === 0 && (
                <span className="text-xs text-gray-400">No SIMs</span>
              )}
            </div>
            <p className="text-gray-500 text-xs font-medium mt-1">By Network</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            {["All", "New SIMs", "HLR SIMs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`min-h-[48px] px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  activeTab === tab
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
                style={activeTab === tab ? { backgroundColor: "#0A2647" } : {}}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Network Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs font-medium">Network:</span>
            {NETWORKS.map((n) => (
              <button
                key={n}
                onClick={() => setNetworkFilter(n)}
                className={`min-h-[48px] px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  networkFilter === n
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
                style={networkFilter === n ? { backgroundColor: "#C8A951", color: "#0A2647" } : {}}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search SIM ID, Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[48px] pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 w-full sm:w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200" style={{ backgroundColor: "#0A2647" }}>
                  <th className="px-4 py-3 text-left text-white font-medium text-xs">SIM ID</th>
                  <th className="px-4 py-3 text-left text-white font-medium text-xs">Network</th>
                  <th className="px-4 py-3 text-left text-white font-medium text-xs hidden md:table-cell">SIM Number</th>
                  <th className="px-4 py-3 text-left text-white font-medium text-xs hidden lg:table-cell">ICCID</th>
                  <th className="px-4 py-3 text-left text-white font-medium text-xs">Device ID</th>
                  <th className="px-4 py-3 text-left text-white font-medium text-xs">Status</th>
                  <th className="px-4 py-3 text-left text-white font-medium text-xs">Type</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Smartphone className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-gray-400 text-sm">No issued SIMs found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((sim) => (
                    <tr key={sim.id} className="border-b border-gray-100 hover:bg-gray-50 transition min-h-[80px]">
                      <td className="px-4 py-4 font-mono text-xs font-medium" style={{ color: "#0A2647" }}>
                        {sim.id}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {sim.network}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs hidden md:table-cell" style={{ color: "#C8A951" }}>
                        {sim.simNumber}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-gray-500 hidden lg:table-cell">
                        {sim.iccid}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-gray-600">
                        {sim.deviceId || "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${statusBadge(sim.status)}`}>
                          {sim.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${
                          sim.type === "new" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {sim.type === "new" ? "New" : "HLR"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
