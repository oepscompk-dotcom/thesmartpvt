"use client";

import { useDSMData } from "@/lib/DSMDataContext";
import { useState, useEffect } from "react";
import { Smartphone, Package, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiLoad } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";

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

const networkTone: Record<string, string> = {
  Telenor: "bg-teal-100 text-teal-700",
  Jazz: "bg-blue-100 text-blue-700",
  Ufone: "bg-green-100 text-green-700",
  Zong: "bg-red-100 text-red-700",
};

export default function DSMSimStockPage() {
  const { auth } = useDSMData();
  const [sims, setSims] = useState<Sim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "new" | "hlr">("all");
  const [networkFilter, setNetworkFilter] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const result = await apiLoad("sim", auth.franchiseId);
        const allSims: Sim[] = Array.isArray(result) ? result : [];
        const mySims = allSims.filter((s) => s.issuedToId === auth.dsmId && s.status === "Issued");
        setSims(mySims);
      } catch {
        setSims([]);
      }
      setLoading(false);
    })();
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
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading SIM stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dsm/dashboard"
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition"
        >
          <ArrowLeft size={20} className="text-muted-foreground" />
        </Link>
        <PageHeader
          title="SIM Stock"
          description="SIMs issued to you by Franchise Admin"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Issued" value={totalCount} icon={Package} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="New SIMs" value={newCount} icon={CheckCircle} iconClass="text-emerald-600 bg-emerald-50" />
        <StatCard label="HLR SIMs" value={hlrCount} icon={Clock} iconClass="text-purple-600 bg-purple-50" />
      </div>

      <Card>
        <CardContent className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto flex-wrap">
            {tabs.map((tab) => (
              <QuickChip
                key={tab.key}
                label={tab.label}
                count={tab.count}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto flex-wrap">
            {networks.map((net) => (
              <QuickChip
                key={net}
                label={net}
                active={networkFilter === net}
                onClick={() => setNetworkFilter(net)}
              />
            ))}
          </div>
          <SearchInput placeholder="Search SIM ID, Number..." value={searchQuery} onSearch={setSearchQuery} className="md:max-w-xs" />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        {filteredSims.length === 0 ? (
          <EmptyState
            icon={Smartphone}
            title="No SIMs found"
            description="No SIMs issued to you match the current filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">SIM ID</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">Network</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground hidden md:table-cell">SIM Number</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground hidden lg:table-cell">ICCID</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">Device ID</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSims.map((sim) => (
                  <tr key={sim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-foreground">{sim.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${networkTone[sim.network] || "bg-slate-100 text-slate-600"}`}>
                        {sim.network}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{sim.simNumber}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground font-mono">{sim.iccid}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">{sim.deviceId}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill label={sim.status} tone={sim.status === "Issued" ? "brand" : "accent"} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">{sim.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}