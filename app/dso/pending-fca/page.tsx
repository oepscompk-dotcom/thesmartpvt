"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import {
  PhoneCall, CheckCircle, Clock, Square, CheckSquare, X, ChevronDown, ChevronUp, Phone,
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default function PendingFCAPage() {
  const { activations, updateActivation } = useDSOData();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalId, setModalId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [checklist, setChecklist] = useState({
    incomingCall: false,
    outgoingCall: false,
    voiceActive: false,
    networkRegistered: false,
  });
  const [page, setPage] = useState(1);

  const pending = useMemo(
    () =>
      activations.filter(
        (a) => a.fcaStatus === "Pending" && a.bvsStatus === "Completed"
      ),
    [activations]
  );

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return pending;
    const q = search.toLowerCase();
    return pending.filter(
      (a) =>
        a.customerName.toLowerCase().includes(q) ||
        a.customerCNIC.includes(q) ||
        a.simNumber.includes(q) ||
        a.id.toLowerCase().includes(q)
    );
  }, [pending, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search]);

  const today = new Date().toISOString().split("T")[0];

  const completedAll = useMemo(
    () =>
      activations.filter(
        (a) => a.fcaStatus === "Completed" && a.fcaDate.startsWith(today)
      ),
    [activations, today]
  );

  const totalCompleted = useMemo(
    () => activations.filter((a) => a.fcaStatus === "Completed"),
    [activations]
  );

  const completedByDate = useMemo(() => {
    const map: Record<string, typeof totalCompleted> = {};
    totalCompleted.forEach((a) => {
      const d = a.fcaDate.split(" ")[0] || a.fcaDate;
      if (!map[d]) map[d] = [];
      map[d].push(a);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [totalCompleted]);

  const selected = activations.find((a) => a.id === modalId);

  const allChecked = Object.values(checklist).every(Boolean);
  const allSelected =
    filtered.length > 0 && filtered.every((a) => selectedIds.includes(a.id));

  const toggleCheck = (key: keyof typeof checklist) =>
    setChecklist((p) => ({ ...p, [key]: !p[key] }));

  const toggleSelect = (id: string) =>
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(filtered.map((a) => a.id));
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
    setChecklist({
      incomingCall: false,
      outgoingCall: false,
      voiceActive: false,
      networkRegistered: false,
    });
  };

  const handleBulkComplete = () => {
    selectedIds.forEach((id) => completeActivation(id));
    setSelectedIds([]);
  };

  const openModal = (id: string) => {
    setModalId(id);
    setChecklist({
      incomingCall: false,
      outgoingCall: false,
      voiceActive: false,
      networkRegistered: false,
    });
  };

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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">2</div>
              <div>
                <p className="text-xs font-bold text-brand-700">FCA</p>
                <p className="text-[10px] text-muted-foreground">Current</p>
              </div>
            </div>
            <div className="h-0.5 flex-1 rounded bg-slate-200" />
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-400">3</div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">IFCA</p>
                <p className="text-[10px] text-muted-foreground">Next</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Header */}
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso/dashboard" }, { label: "FCA Verification" }]}
        title="FCA Verification"
        description="Voice & call verification for activated SIMs"
        actions={
          selectedIds.length > 0 ? (
            <Button onClick={handleBulkComplete}>
              <CheckCircle size={16} /> Complete Selected ({selectedIds.length})
            </Button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Pending" value={pending.length} icon={Clock} iconClass="text-amber-600 bg-amber-50" />
        <StatCard label="Completed Today" value={completedAll.length} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Total Completed" value={totalCompleted.length} icon={PhoneCall} />
      </div>

      {/* Search */}
      <Card className="p-4">
        <SearchInput
          placeholder="Search by name, CNIC, SIM number, or ID..."
          value={search}
          onSearch={setSearch}
        />
      </Card>

      {/* Pending Table */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle}
            title={pending.length === 0 ? "All FCA verifications completed" : "No results match your search"}
            description={pending.length === 0 ? "Great work! All SIMs have been voice verified." : "Try a different search term."}
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
                      {allSelected ? (
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
                {paged.map((a) => (
                  <tr
                    key={a.id}
                    className={`transition-colors ${selectedIds.includes(a.id) ? "bg-brand-50/60" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(a.id)} className="flex items-center justify-center">
                        {selectedIds.includes(a.id) ? (
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
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${typeColor(a.type)}`}>{a.type}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" onClick={() => openModal(a.id)}>
                        <PhoneCall size={14} /> Complete FCA
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

      {/* Date-wise Completed Records */}
        {completedByDate.length > 0 && (
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Clock className="h-5 w-5 text-brand-600" />
              Completed Records
            </h2>
            {completedByDate.map(([date, records]) => (
              <div key={date} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <button
                  onClick={() => toggleDate(date)}
                  className="flex w-full items-center justify-between px-5 py-3 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-600" />
                    <span className="text-sm font-bold text-foreground">{formatDateDDMMYYYY(date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill label={`${records.length} record${records.length !== 1 ? "s" : ""}`} tone="positive" />
                    {expandedDates.has(date) ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>
                {expandedDates.has(date) && (
                  <div className="divide-y divide-slate-100">
                    {records.map((a) => (
                      <div key={a.id} className="flex min-h-[72px] items-center gap-4 px-5 py-3">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-foreground">{a.id}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColor(a.type)}`}>{a.type}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {a.customerName} · {a.simNumber}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-xs text-muted-foreground">
                          {formatDateDDMMYYYY(a.fcaDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <PhoneCall className="h-5 w-5 text-brand-600" />
                  FCA Verification
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selected.id} · {selected.customerName}
                </p>
              </div>
              <button
                onClick={() => setModalId(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Verification Checklist
              </p>
              <div className="space-y-3">
                {[
                  { key: "incomingCall" as const, label: "Incoming Call Test Passed" },
                  { key: "outgoingCall" as const, label: "Outgoing Call Test Passed" },
                  { key: "voiceActive" as const, label: "Voice Service Active" },
                  { key: "networkRegistered" as const, label: "Network Registered Successfully" },
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
                    <span className="flex-1 text-sm font-semibold text-foreground">{item.label}</span>
                    {checklist[item.key] && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="secondary" onClick={() => setModalId(null)}>Cancel</Button>
              <Button onClick={() => handleIndividualComplete(selected.id)} disabled={!allChecked}>
                <CheckCircle size={16} /> Complete FCA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
