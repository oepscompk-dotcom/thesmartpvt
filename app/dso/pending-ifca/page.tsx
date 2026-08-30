"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import {
  Wifi, CheckCircle, Clock, Square, CheckSquare, X, ChevronDown, ChevronUp, Phone,
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

interface Activation {
  id: string;
  type: string;
  simNumber: string;
  network: string;
  iccid: string;
  deviceId: string;
  customerName: string;
  customerCNIC: string;
  customerMobile: string;
  retailerId: string;
  status: string;
  bvsStatus: string;
  bvsDate: string;
  bvsNotes: string;
  fcaStatus: string;
  fcaDate: string;
  fcaNotes: string;
  ifcaStatus: string;
  ifcaDate: string;
  ifcaNotes: string;
  progress: number;
  createdAt: string;
  dsoId: string;
  franchiseId: string;
}

const DEFAULT_CHECKLIST = {
  dataPackageActive: false,
  networkConnected: false,
  appDownloaded: false,
  dataUsage300mb: false,
};

type ChecklistKey = keyof typeof DEFAULT_CHECKLIST;

export default function PendingIFCAPage() {
  const { activations, updateActivation } = useDSOData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalId, setModalId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [networkFilter, setNetworkFilter] = useState("All");
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const pending = useMemo(() => {
    return activations.filter(
      (a: Activation) => a.ifcaStatus === "Pending" && a.fcaStatus === "Completed"
    );
  }, [activations]);

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const completed = useMemo(() => {
    return activations.filter(
      (a: Activation) => a.ifcaStatus === "Completed"
    );
  }, [activations]);

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return completed.filter((a: Activation) => a.ifcaDate === today);
  }, [completed]);

  const filteredPending = useMemo(() => {
    let list = pending;
    if (networkFilter !== "All") {
      list = list.filter((a: Activation) => a.network === networkFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a: Activation) =>
          a.id.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.customerCNIC.toLowerCase().includes(q) ||
          a.simNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pending, networkFilter, searchQuery]);

  const pagedPending = filteredPending.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredPending.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [searchQuery, networkFilter]);

  const groupedCompleted = useMemo(() => {
    const groups: Record<string, Activation[]> = {};
    completed.forEach((a: Activation) => {
      const date = a.ifcaDate || "Unknown Date";
      if (!groups[date]) groups[date] = [];
      groups[date].push(a);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [completed]);

  const allChecked = filteredPending.length > 0 && filteredPending.every((a: Activation) => selectedIds.has(a.id));
  const selectedCount = selectedIds.size;
  const selected = modalId ? activations.find((a: Activation) => a.id === modalId) : null;

  const toggleCheck = (key: ChecklistKey) => {
    setChecklist((p) => ({ ...p, [key]: !p[key] }));
  };

  const allChecklistChecked = Object.values(checklist).every(Boolean);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPending.map((a: Activation) => a.id)));
    }
  };

  const handleCompleteSingle = (id: string) => {
    const activation = activations.find((a: Activation) => a.id === id);
    if (!activation) return;

    updateActivation(id, {
      ifcaStatus: "Completed",
      ifcaDate: new Date().toISOString().split("T")[0],
      ifcaNotes: "IFCA verification completed",
      status: "Completed",
      progress: 100,
    });
    setSuccessMsg(`${activation.simNumber} verification completed!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCompleteFromModal = () => {
    if (!modalId || !allChecklistChecked) return;
    handleCompleteSingle(modalId);
    setModalId(null);
    setChecklist(DEFAULT_CHECKLIST);
  };

  const handleBulkComplete = () => {
    if (selectedCount === 0) return;
    selectedIds.forEach((id) => {
      const activation = activations.find((a: Activation) => a.id === id);
      if (!activation) return;
      updateActivation(id, {
        ifcaStatus: "Completed",
        ifcaDate: new Date().toISOString().split("T")[0],
        ifcaNotes: "IFCA verification completed (bulk)",
        status: "Completed",
        progress: 100,
      });
    });
    setSuccessMsg(`${selectedCount} SIM(s) verification completed!`);
    setSelectedIds(new Set());
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openModal = (id: string) => {
    setModalId(id);
    setChecklist(DEFAULT_CHECKLIST);
  };

  const typeBadge = (t: string) => {
    if (t === "New SIM") return "bg-blue-100 text-blue-700";
    if (t === "MNP") return "bg-purple-100 text-purple-700";
    if (t === "Replacement") return "bg-red-100 text-red-600";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Progress Indicator */}
      <Card>
        <div className="px-4 py-4 sm:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-600">BVS</p>
                <p className="text-[10px] text-muted-foreground">Done</p>
              </div>
            </div>
            <div className="h-0.5 flex-1 rounded bg-green-300" />
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-600">FCA</p>
                <p className="text-[10px] text-muted-foreground">Done</p>
              </div>
            </div>
            <div className="h-0.5 flex-1 rounded bg-green-300" />
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">3</div>
              <div>
                <p className="text-xs font-bold text-brand-700">IFCA</p>
                <p className="text-[10px] text-muted-foreground">Current</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Header */}
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso/dashboard" }, { label: "IFCA Verification" }]}
        title="IFCA Verification"
        description={`Final data & connectivity check — ${pending.length} pending`}
        actions={
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <Button onClick={handleBulkComplete}>
                <CheckCircle size={16} /> Complete ({selectedCount})
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowCompleted(!showCompleted)}>
              <Clock size={16} />
              {showCompleted ? "Hide" : "Show"} Done ({completed.length})
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Pending" value={pending.length} icon={Clock} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="Completed Today" value={completedToday.length} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Total Completed" value={completed.length} icon={Wifi} />
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search by ID, name, CNIC, SIM number..."
            value={searchQuery}
            onSearch={setSearchQuery}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="w-full sm:w-auto"
            >
              <option value="All">All Networks</option>
              <option value="Telenor">Telenor</option>
              <option value="Jazz">Jazz</option>
              <option value="Ufone">Ufone</option>
              <option value="Zong">Zong</option>
            </Select>
          </div>
        </div>
      </Card>

        {filteredPending.length === 0 && !showCompleted ? (
          <Card>
            <EmptyState
              icon={CheckCircle}
              title="All IFCA verifications completed"
              description="No pending activations for IFCA verification"
            />
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-12 px-4 py-3">
                      <button onClick={toggleSelectAll} className="flex min-h-[48px] items-center justify-center">
                        {allChecked ? (
                          <CheckSquare className="h-5 w-5 text-brand-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-300" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Activation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">SIM Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedPending.map((a: Activation) => (
                    <tr
                      key={a.id}
                      className={`transition-colors ${selectedIds.has(a.id) ? "bg-brand-50/60" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(a.id)} className="flex items-center justify-center">
                          {selectedIds.has(a.id) ? (
                            <CheckSquare className="h-5 w-5 text-brand-600" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-semibold text-foreground">{a.id}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatDateDDMMYYYY(a.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{a.customerName}</p>
                        <p className="text-xs text-muted-foreground">{a.customerCNIC}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{a.simNumber}</p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          <Phone className="h-2.5 w-2.5" />
                          {a.network}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${typeBadge(a.type)}`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCompleteSingle(a.id)}
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700"
                          >
                            <CheckCircle size={14} />
                            Complete
                          </button>
                          <Button variant="outline" size="sm" onClick={() => openModal(a.id)}>
                            Verify
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </Card>
        )}

        {showCompleted && groupedCompleted.length > 0 && (
          <Card>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <CheckCircle className="h-5 w-5 text-brand-600" />
                Completed IFCA Records
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {groupedCompleted.map(([date, records]) => (
                <div key={date} className="p-4">
                  <button
                    onClick={() => toggleDate(date)}
                    className="mb-3 flex w-full items-center justify-between rounded-lg p-2 transition hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-brand-600" />
                      <h3 className="text-sm font-semibold text-foreground">{formatDateDDMMYYYY(date)}</h3>
                      <StatusPill label={`${records.length} completed`} tone="positive" />
                    </div>
                    {expandedDates.has(date) ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  {expandedDates.has(date) && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {records.map((a: Activation) => (
                        <div key={a.id} className="min-h-[80px] rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-foreground">{a.id}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge(a.type)}`}>
                              {a.type}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{a.customerName}</p>
                          <p className="text-xs text-muted-foreground">{a.simNumber} · {a.network}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Wifi className="h-5 w-5 text-brand-600" />
                    IFCA Verification
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{selected.id} · {selected.customerName}</p>
                </div>
                <button onClick={() => setModalId(null)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">SIM Number</p>
                    <p className="font-medium text-foreground">{selected.simNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Network</p>
                    <p className="font-medium text-foreground">{selected.network}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ICCID</p>
                    <p className="font-mono text-xs font-medium text-foreground">{selected.iccid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Device ID</p>
                    <p className="font-medium text-foreground">{selected.deviceId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-6 py-5">
                <p className="mb-2 text-sm font-semibold text-foreground">IFCA Checklist</p>
                {[
                  { key: "dataPackageActive" as ChecklistKey, label: "Data Package Active" },
                  { key: "networkConnected" as ChecklistKey, label: "Network Connected" },
                  { key: "appDownloaded" as ChecklistKey, label: "App Downloaded" },
                  { key: "dataUsage300mb" as ChecklistKey, label: "Data Usage > 300MB" },
                ].map((item) => (
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
                    {checklist[item.key] && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                <Button variant="secondary" onClick={() => setModalId(null)}>Cancel</Button>
                <Button onClick={handleCompleteFromModal} disabled={!allChecklistChecked}>
                  <CheckCircle size={16} /> Complete IFCA
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
