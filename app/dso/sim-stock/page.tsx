"use client";

import { useState, useEffect } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import { Smartphone, Package, CheckCircle } from "lucide-react";
import { apiLoad } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

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

export default function DSOSimStockPage() {
  const { auth } = useDSOData();
  const [sims, setSims] = useState<SIM[]>([]);
  const [issuedSims, setIssuedSims] = useState<SIM[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [networkFilter, setNetworkFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const result = await apiLoad("sim", auth.franchiseId);
        const allSims: SIM[] = Array.isArray(result) ? result : [];
        const mySims = allSims.filter((s) => s.issuedToId === auth.dsoId && s.status === "Issued");
        setSims(allSims);
        setIssuedSims(mySims);
      } catch {
        setSims([]);
        setIssuedSims([]);
      }
      setLoading(false);
    })();
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

  const statusTone = (status: string): "positive" | "neutral" | "accent" | "brand" => {
    if (status === "In Stock") return "positive";
    if (status === "Issued") return "neutral";
    if (status === "Activated") return "accent";
    return "brand";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading SIM stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "SIM Stock" }]}
        title="SIM Stock"
        description="SIMs issued to you by Franchise Admin"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Issued" value={totalIssued} icon={Package} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="New SIMs" value={newCount} icon={Smartphone} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="HLR SIMs" value={hlrCount} icon={Smartphone} iconClass="text-purple-600 bg-purple-50" />
        <Card className="p-4">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(networkCounts).map(([net, count]) => (
              <span key={net} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {net}: {count}
              </span>
            ))}
            {Object.keys(networkCounts).length === 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle size={14} /> No SIMs</span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">By Network</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <QuickChip label="All" count={totalIssued} active={activeTab === "All"} onClick={() => setActiveTab("All")} />
          <QuickChip label="New SIMs" count={newCount} active={activeTab === "New SIMs"} onClick={() => setActiveTab("New SIMs")} />
          <QuickChip label="HLR SIMs" count={hlrCount} active={activeTab === "HLR SIMs"} onClick={() => setActiveTab("HLR SIMs")} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Network:</span>
          {NETWORKS.map((n) => (
            <QuickChip key={n} label={n} active={networkFilter === n} onClick={() => setNetworkFilter(n)} />
          ))}
        </div>

        <SearchInput placeholder="Search SIM ID, Number..." value={searchQuery} onSearch={setSearchQuery} className="sm:ml-auto sm:max-w-xs" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">SIM ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Network</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">SIM Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">ICCID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Device ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12">
                    <EmptyState icon={Smartphone} title="No issued SIMs found" description="Try a different filter or search term." />
                  </td>
                </tr>
              ) : (
                filtered.map((sim) => (
                  <tr key={sim.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-4 font-mono text-xs font-medium text-brand-700">{sim.id}</td>
                    <td className="px-4 py-4">
                      <StatusPill label={sim.network} tone="neutral" />
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground hidden md:table-cell">{sim.simNumber}</td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground hidden lg:table-cell">{sim.iccid}</td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{sim.deviceId || "-"}</td>
                    <td className="px-4 py-4">
                      <StatusPill label={sim.status} tone={statusTone(sim.status)} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill label={sim.type === "new" ? "New" : "HLR"} tone={sim.type === "new" ? "brand" : "accent"} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
