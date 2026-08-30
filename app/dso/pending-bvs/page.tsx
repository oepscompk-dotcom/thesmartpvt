"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import {
  Fingerprint, CheckCircle, Clock, Filter, Square, CheckSquare, X, AlertCircle, ChevronDown, ChevronUp, Phone,
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

const CHECKLIST_ITEMS = [
  { key: "cnic", label: "CNIC Verified" },
  { key: "thumb", label: "Thumb Verification" },
  { key: "nadra", label: "NADRA Check" },
  { key: "simRegistered", label: "SIM Registered" },
  { key: "bvsCompleted", label: "BVS Completed" },
] as const;

type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]["key"];
type ChecklistState = Record<ChecklistKey, boolean>;

const emptyChecklist: ChecklistState = {
  cnic: false,
  thumb: false,
  nadra: false,
  simRegistered: false,
  bvsCompleted: false,
};

export default function PendingBVSPage() {
  const { activations, updateActivation } = useDSOData();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [checklist, setChecklist] = useState<ChecklistState>(emptyChecklist);
  const [search, setSearch] = useState("");
  const [filterNetwork, setFilterNetwork] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const pending = useMemo(
    () =>
      activations.filter(
        (a) =>
          a.bvsStatus === "Pending" &&
          (a.status === "Pending BVS" || a.bvsStatus === "Pending")
      ),
    [activations]
  );

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return activations.filter(
      (a) =>
        a.bvsStatus === "Completed" &&
        a.bvsDate &&
        a.bvsDate.startsWith(today)
    );
  }, [activations]);

  const totalCompleted = useMemo(
    () => activations.filter((a) => a.bvsStatus === "Completed"),
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
          a.simNumber.includes(q) ||
          a.customerCNIC.includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pending, filterNetwork, search]);

  const pagedPending = filteredPending.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredPending.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, filterNetwork]);

  const selectedModal = activations.find((a) => a.id === selectedId);
  const allChecked = Object.values(checklist).every(Boolean);
  const allFilteredSelected =
    filteredPending.length > 0 &&
    filteredPending.every((a) => selectedIds.has(a.id));

  const toggleCheck = (key: ChecklistKey) => {
    setChecklist((p) => ({ ...p, [key]: !p[key] }));
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPending.map((a) => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completeBVS = (id: string) => {
    const activation = activations.find((a) => a.id === id);
    if (!activation) return;

    const updates: Partial<typeof activation> = {
      bvsStatus: "Completed",
      bvsDate: new Date().toISOString().split("T")[0],
      bvsNotes: "BVS verification completed",
    };

    if (activation.fcaStatus === "Pending") {
      updates.status = "Pending FCA";
      updates.progress = 33;
    }

    updateActivation(id, updates);
  };

  const handleCompleteSingle = () => {
    if (!selectedId || !allChecked) return;
    completeBVS(selectedId);
    setSelectedId(null);
    setChecklist(emptyChecklist);
  };

  const handleBulkComplete = () => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach((id) => completeBVS(id));
    setSelectedIds(new Set());
  };

  const openModal = (id: string) => {
    setSelectedId(id);
    setChecklist(emptyChecklist);
  };

  const completedByDate = useMemo(() => {
    const groups: Record<string, typeof totalCompleted> = {};
    totalCompleted.forEach((a) => {
      const date = a.bvsDate || "Unknown Date";
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [totalCompleted]);

  const typeColor = (t: string) => {
    if (t === "New SIM") return "bg-blue-100 text-blue-700";
    if (t === "MNP") return "bg-purple-100 text-purple-700";
    if (t === "Replacement") return "bg-red-100 text-red-600";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Progress Indicator */}
      <Card>
        <div className="px-4 py-4 sm:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">1</div>
              <div>
                <p className="text-xs font-bold text-brand-700">BVS</p>
                <p className="text-[10px] text-muted-foreground">Current</p>
              </div>
            </div>
            <div className="h-0.5 flex-1 rounded bg-slate-200" />
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-400">2</div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">FCA</p>
                <p className="text-[10px] text-muted-foreground">Next</p>
              </div>
            </div>
            <div className="h-0.5 flex-1 rounded bg-slate-200" />
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-400">3</div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">IFCA</p>
                <p className="text-[10px] text-muted-foreground">Final</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Header */}
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso/dashboard" }, { label: "BVS Verification" }]}
        title="BVS Verification"
        description="Biometric Verification System — Pending SIMs"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={pending.length} icon={Clock} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="Completed Today" value={completedToday.length} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Total Completed" value={totalCompleted.length} icon={Fingerprint} />
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-900">
          After all verifications (BVS → FCA → IFCA), SIM status will change
          to <span className="font-semibold text-green-600">Active</span>.
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput
            placeholder="Search by name, CNIC, SIM number..."
            value={search}
            onSearch={setSearch}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilter(!showFilter)}>
              <Filter size={14} /> Filter
            </Button>
            {selectedIds.size > 0 && (
              <Button onClick={handleBulkComplete}>
                <CheckCircle size={16} /> Complete Selected ({selectedIds.size})
              </Button>
            )}
          </div>
        </div>

        {showFilter && (
          <div className="mt-3 border-t border-slate-100 pt-3">
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

        {/* Pending List */}
        {filteredPending.length === 0 ? (
          <Card>
            <EmptyState
              icon={CheckCircle}
              title={pending.length === 0 ? "All BVS verifications completed" : "No results found"}
              description={pending.length === 0 ? "Great work! All SIMs have been verified." : "Try adjusting your search or filter."}
            />
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-10 px-4 py-3 text-left">
                      <button onClick={toggleSelectAll} className="flex items-center justify-center">
                        {allFilteredSelected ? (
                          <CheckSquare className="h-5 w-5 text-brand-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-300" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">SIM Details</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">CNIC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedPending.map((a) => (
                    <tr
                      key={a.id}
                      className={`transition-colors ${selectedIds.has(a.id) ? "bg-brand-50/60" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelect(a.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.has(a.id) ? (
                            <CheckSquare className="h-5 w-5 text-brand-600" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{a.customerName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{a.id}</p>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="flex min-h-[60px] flex-col justify-center">
                          <p className="text-sm font-medium text-foreground">{a.simNumber}</p>
                          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            <Phone className="h-2.5 w-2.5" />
                            {a.network}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <p className="font-mono text-xs text-muted-foreground">{a.customerCNIC}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${typeColor(a.type)}`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" onClick={() => openModal(a.id)}>
                          <Fingerprint size={14} /> Complete BVS
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </Card>
        )}

        {/* Completed Records — Date-wise */}
        {completedByDate.length > 0 && (
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Clock className="h-5 w-5 text-brand-600" />
              Completed Records
            </h2>
            {completedByDate.map(([date, records]) => (
              <div key={date} className="space-y-2">
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                      {formatDateDDMMYYYY(date)}
                    </p>
                    <StatusPill label={`${records.length}`} tone="positive" />
                  </div>
                  {expandedDates.has(date) ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {expandedDates.has(date) && (
                  <Card>
                    <div className="divide-y divide-slate-100">
                      {records.map((a) => (
                        <div
                          key={a.id}
                          className="flex min-h-[72px] items-center justify-between px-5 py-3"
                        >
                          <div className="flex items-center gap-4">
                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                            <div>
                              <p className="font-medium text-foreground">{a.customerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {a.simNumber} · {a.network} · {a.id}
                              </p>
                            </div>
                          </div>
                          <StatusPill label="Completed" tone="positive" />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}

      {/* BVS Verification Modal */}
      {selectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Fingerprint className="h-5 w-5 text-brand-600" />
                  BVS Verification
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedModal.id} · {selectedModal.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 px-6 py-5">
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">SIM:</span>{" "}
                    <span className="font-medium text-foreground">{selectedModal.simNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Network:</span>{" "}
                    <span className="font-medium text-foreground">{selectedModal.network}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CNIC:</span>{" "}
                    <span className="font-medium text-foreground">{selectedModal.customerCNIC}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium text-foreground">{selectedModal.type}</span>
                  </div>
                </div>
              </div>

              {CHECKLIST_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => toggleCheck(item.key)}
                    className="h-5 w-5 rounded accent-brand-600"
                  />
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  {checklist[item.key] && (
                    <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                  )}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="secondary" onClick={() => setSelectedId(null)}>Cancel</Button>
              <Button onClick={handleCompleteSingle} disabled={!allChecked}>
                <CheckCircle size={16} /> Complete BVS
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
