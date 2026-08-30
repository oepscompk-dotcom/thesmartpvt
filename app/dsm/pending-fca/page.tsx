"use client";

import React, { useState, useMemo } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import {
  PhoneCall,
  CheckCircle,
  Clock,
  Square,
  CheckSquare,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const CHECKLIST = [
  { key: "incomingCall" as const, label: "Incoming Call Test Passed" },
  { key: "outgoingCall" as const, label: "Outgoing Call Test Passed" },
  { key: "voiceActive" as const, label: "Voice Service Active" },
  { key: "networkRegistered" as const, label: "Network Registered Successfully" },
];

type ChecklistKey = (typeof CHECKLIST)[number]["key"];
type ChecklistState = Record<ChecklistKey, boolean>;

const emptyChecklist: ChecklistState = {
  incomingCall: false,
  outgoingCall: false,
  voiceActive: false,
  networkRegistered: false,
};

const typeTone: Record<string, "positive" | "warning" | "negative" | "neutral" | "brand" | "accent"> = {
  "New SIM": "brand",
  "MNP": "accent",
  "Replacement": "negative",
  "BYN": "warning",
};

export default function DSMPendingFCAPage() {
  const { activations, updateActivation } = useDSMData();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalId, setModalId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterNetwork, setFilterNetwork] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistState>(emptyChecklist);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const pending = useMemo(
    () =>
      activations.filter(
        (a) => a.fcaStatus === "Pending" && a.bvsStatus === "Completed"
      ),
    [activations]
  );

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return activations.filter(
      (a) => a.fcaStatus === "Completed" && a.fcaDate && a.fcaDate.startsWith(today)
    );
  }, [activations]);

  const totalCompleted = useMemo(
    () => activations.filter((a) => a.fcaStatus === "Completed"),
    [activations]
  );

  const networks = useMemo(() => {
    const nets = new Set(pending.map((a) => a.network));
    return ["All", ...Array.from(nets)];
  }, [pending]);

  const filteredPending = useMemo(() => {
    let list = pending;
    if (filterNetwork !== "All") {
      list = list.filter((a) => a.network === filterNetwork);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.customerName.toLowerCase().includes(q) ||
          a.customerCNIC.includes(q) ||
          a.simNumber.includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pending, filterNetwork, search]);

  const selected = modalId ? activations.find((a) => a.id === modalId) : null;
  const allChecked = Object.values(checklist).every(Boolean);
  const allFilteredSelected =
    filteredPending.length > 0 &&
    filteredPending.every((a) => selectedIds.has(a.id));

  const toggleCheck = (key: ChecklistKey) =>
    setChecklist((p) => ({ ...p, [key]: !p[key] }));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPending.map((a) => a.id)));
    }
  };

  const completeActivation = (id: string) => {
    const activation = activations.find((a) => a.id === id);
    if (!activation) return;

    updateActivation(id, {
      fcaStatus: "Completed",
      fcaDate: new Date().toISOString().split("T")[0],
      fcaNotes: "FCA checklist verified",
      status: "Pending IFCA",
      progress: 66,
    });
  };

  const handleIndividualComplete = (id: string) => {
    if (!allChecked) return;
    completeActivation(id);
    setModalId(null);
    setChecklist(emptyChecklist);
  };

  const handleBulkComplete = () => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach((id) => completeActivation(id));
    setSelectedIds(new Set());
  };

  const openModal = (id: string) => {
    setModalId(id);
    setChecklist(emptyChecklist);
  };

  const completedByDate = useMemo(() => {
    const groups: Record<string, typeof totalCompleted> = {};
    totalCompleted.forEach((a) => {
      const date = a.fcaDate || "Unknown Date";
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [totalCompleted]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Verify" }, { label: "FCA" }]}
        title="FCA Verification"
        description="Voice &amp; call verification for activated SIMs"
        actions={
          selectedIds.size > 0 ? (
            <Button onClick={handleBulkComplete}>
              <CheckCircle className="h-4 w-4" />
              Complete Selected ({selectedIds.size})
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="flex items-center justify-between p-6">
          {["BVS", "FCA", "IFCA"].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  i === 1 ? "bg-brand-600 text-white" : "bg-slate-100 text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium ${i === 1 ? "text-brand-700" : "text-muted-foreground"}`}>{step}</span>
              </div>
              {i < 2 && <ArrowRight className="h-5 w-5 text-slate-300" />}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending" value={pending.length} icon={Clock} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Verified Today" value={completedToday.length} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Total Completed" value={totalCompleted.length} icon={PhoneCall} iconClass="text-blue-600 bg-blue-50" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          <SearchInput
            placeholder="Search by name, CNIC, SIM number..."
            value={search}
            onSearch={setSearch}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilter(!showFilter)}>
              Filter
            </Button>
          </div>
        </div>
        {showFilter && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Network</p>
            <div className="flex flex-wrap gap-2">
              {networks.map((net) => (
                <QuickChip
                  key={net}
                  label={net}
                  active={filterNetwork === net}
                  onClick={() => setFilterNetwork(net)}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {filteredPending.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle}
            title={pending.length === 0 ? "All FCA verifications completed" : "No results found"}
            description={pending.length === 0 ? "Great work! All SIMs have been verified." : "Try adjusting your search or filter."}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left w-10">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center">
                      {allFilteredSelected ? (
                        <CheckSquare className="h-5 w-5 text-brand-600" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    SIM Details
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                    CNIC
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPending.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(a.id)} className="flex items-center justify-center">
                        {selectedIds.has(a.id) ? (
                          <CheckSquare className="h-5 w-5 text-brand-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-sm text-foreground">{a.customerName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.id}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm text-foreground font-mono">{a.simNumber}</p>
                      <p className="text-xs text-muted-foreground">{a.network}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-xs text-muted-foreground font-mono">{a.customerCNIC}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill label={a.type} tone={typeTone[a.type] || "neutral"} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button size="sm" onClick={() => openModal(a.id)}>
                        <PhoneCall className="h-3.5 w-3.5" />
                        Complete FCA
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {completedByDate.length > 0 && (
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Clock className="h-5 w-5 text-brand-600" />
            Completed Records
          </h2>
          {completedByDate.map(([date, records]) => {
            const isCollapsed = collapsedDates.has(date);
            return (
              <div key={date} className="space-y-2">
                <button
                  onClick={() => {
                    setCollapsedDates((prev) => {
                      const next = new Set(prev);
                      if (next.has(date)) next.delete(date);
                      else next.add(date);
                      return next;
                    });
                  }}
                  className="flex items-center gap-2 px-1 py-1 w-full text-left group"
                >
                  <p className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
                    {formatDateDDMMYYYY(date)}
                  </p>
                  <span className="text-xs text-muted-foreground font-medium md:hidden">
                    {isCollapsed ? "Expand" : "Collapse"}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground md:hidden" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground md:hidden" />
                  )}
                </button>
                {!isCollapsed && (
                  <Card className="divide-y divide-slate-100">
                    {records.map((a) => (
                      <div key={a.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-4">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-foreground">{a.customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {a.simNumber} &middot; {a.network} &middot; {a.id}
                            </p>
                          </div>
                        </div>
                        <StatusPill label="Completed" tone="positive" />
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 mx-4 shadow-2xl">
            <div className="flex items-center justify-between rounded-t-2xl bg-brand-600 px-6 py-4 text-white">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <PhoneCall className="h-5 w-5" />
                  FCA Verification
                </h3>
                <p className="text-xs text-brand-100">
                  {selected.id} &middot; {selected.customerName}
                </p>
              </div>
              <button
                onClick={() => setModalId(null)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">SIM:</span>{" "}
                    <span className="font-medium text-foreground">{selected.simNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Network:</span>{" "}
                    <span className="font-medium text-foreground">{selected.network}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CNIC:</span>{" "}
                    <span className="font-medium text-foreground">{selected.customerCNIC}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium text-foreground">{selected.type}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Verification Checklist
              </p>
              {CHECKLIST.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => toggleCheck(item.key)}
                    className="h-5 w-5 rounded border-slate-300"
                    style={{ accentColor: "#0057FF" }}
                  />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  {checklist[item.key] && (
                    <CheckCircle className="h-5 w-5 text-emerald-500 ml-auto" />
                  )}
                </label>
              ))}
            </div>

            <div className="px-6 pb-6">
              <Button
                className="w-full"
                onClick={() => handleIndividualComplete(selected.id)}
                disabled={!allChecked}
              >
                <Play className="h-4 w-4" />
                Complete FCA Verification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}