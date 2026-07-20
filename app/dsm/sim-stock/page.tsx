"use client";

export const dynamic = "force-dynamic";

import { useDSMData } from "@/lib/DSMDataContext";
import { useState, useEffect } from "react";
import { Smartphone, Search, Filter, Package, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Sim {
  id: string;
  network: string;
  simNumber: string;
  iccid: string;
  deviceId: string;
  status: string;
  receiveDate: string;
  franchiseId: string;
  type: string;
  issuedToId?: string;
}

export default function DSMSimStockPage() {
  const { auth } = useDSMData();
  const [sims, setSims] = useState<Sim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "new" | "hlr">("all");
  const [networkFilter, setNetworkFilter] = useState("All");

  useEffect(() => {
    const mounted = setTimeout(() => {
      try {
        const allSims: Sim[] = JSON.parse(localStorage.getItem(`franchise-${auth.franchiseId}-sims`) || "[]");
        const mySims = allSims.filter((s) => s.issuedToId === auth.dsmId && s.status === "Issued");
        setSims(mySims);
      } catch {
        setSims([]);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(mounted);
  }, [auth.dsmId, auth.franchiseId]);

  const filteredSims = sims.filter((sim) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "new" && sim.type === "new") ||
      (activeTab === "hlr" && sim.type === "hlr");

    const matchesNetwork = networkFilter === "All" || sim.network === networkFilter;

    const matchesSearch =
      searchQuery === "" ||
      sim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.simNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesNetwork && matchesSearch;
  });

  const totalCount = sims.length;
  const newCount = sims.filter((s) => s.type === "new").length;
  const hlrCount = sims.filter((s) => s.type === "hlr").length;

  const tabs = [
    { key: "all" as const, label: "All", count: totalCount },
    { key: "new" as const, label: "New SIMs", count: newCount },
    { key: "hlr" as const, label: "HLR SIMs", count: hlrCount },
  ];

  const networks = ["All", "Telenor", "Jazz", "Ufone", "Zong"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0057FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading SIM stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dsm/dashboard"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <Smartphone className="inline-block mr-2 h-6 w-6 text-[#0057FF]" />
            SIM Stock
          </h1>
          <p className="text-sm text-gray-500 mt-1">SIMs issued to you by Franchise Admin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0057FF] rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Issued</p>
              <p className="text-gray-900 font-black text-2xl">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">New SIMs</p>
              <p className="text-gray-900 font-black text-2xl">{newCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">HLR SIMs</p>
              <p className="text-gray-900 font-black text-2xl">{hlrCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`min-h-[48px] px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-[#0057FF] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {networks.map((net) => (
              <button
                key={net}
                onClick={() => setNetworkFilter(net)}
                className={`min-h-[48px] px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  networkFilter === net
                    ? "bg-[#0057FF] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {net}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search SIM ID, Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[48px] w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filteredSims.length === 0 ? (
          <div className="text-center py-16">
            <Smartphone size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No SIMs found</p>
            <p className="text-gray-400 text-sm mt-1">No SIMs issued to you match the current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">SIM ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Network</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">SIM Number</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">ICCID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Device ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSims.map((sim) => (
                  <tr key={sim.id} className="hover:bg-gray-50 transition-colors min-h-[80px]">
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">{sim.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        sim.network === "Telenor"
                          ? "bg-teal-100 text-teal-700"
                          : sim.network === "Jazz"
                          ? "bg-blue-100 text-blue-700"
                          : sim.network === "Ufone"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {sim.network}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{sim.simNumber}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600 font-mono">{sim.iccid}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{sim.deviceId}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                        sim.status === "Issued"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {sim.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{sim.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
