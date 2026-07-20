"use client";
export const dynamic = "force-dynamic";

import React, { useState, useMemo } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import {
  ArrowLeft,
  PhoneCall,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Square,
  CheckSquare,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Verification Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-500 text-white">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-600">BVS</p>
                <p className="text-[10px] text-gray-400">Done</p>
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-emerald-300 rounded" />
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#C8A951" }}>2</div>
              <div>
                <p className="text-xs font-bold" style={{ color: "#0A2647" }}>FCA</p>
                <p className="text-[10px] text-gray-400">Current</p>
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-400">3</div>
              <div>
                <p className="text-xs font-medium text-gray-400">IFCA</p>
                <p className="text-[10px] text-gray-400">Next</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div
          className="rounded-2xl px-6 py-5 text-white"
          style={{ backgroundColor: "#0A2647" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <a
              href="/dso/dashboard"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <PhoneCall className="h-6 w-6" style={{ color: "#C8A951" }} />
                FCA Verification
              </h1>
              <p className="text-sm text-gray-300 mt-0.5">
                Voice &amp; call verification for activated SIMs
              </p>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkComplete}
                className="flex items-center gap-2 px-5 py-2.5 min-h-[48px] rounded-xl font-semibold text-sm transition hover:opacity-90"
                style={{ backgroundColor: "#C8A951", color: "#0A2647" }}
              >
                <CheckCircle className="h-4 w-4" />
                Complete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Pending",
              value: pending.length,
              icon: Clock,
              bg: "bg-amber-50",
              color: "#C8A951",
            },
            {
              label: "Completed Today",
              value: completedAll.length,
              icon: CheckCircle,
              bg: "bg-emerald-50",
              color: "#059669",
            },
            {
              label: "Total Completed",
              value: totalCompleted.length,
              icon: PhoneCall,
              bg: "bg-blue-50",
              color: "#0A2647",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl p-5 flex items-center gap-4 min-h-[80px]`}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${s.color}20` }}
              >
                <s.icon className="h-7 w-7" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: "#0A2647" }}>
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, CNIC, SIM number, or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
            />
          </div>
        </div>

        {/* Pending Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-400" />
            <p className="text-gray-500 font-medium">
              {pending.length === 0
                ? "All FCA verifications completed"
                : "No results match your search"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Select All Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
              <button onClick={toggleSelectAll} className="flex items-center gap-2 min-h-[48px]">
                {allSelected ? (
                  <CheckSquare className="h-5 w-5" style={{ color: "#C8A951" }} />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-600">
                  Select All ({filtered.length})
                </span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className={`px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition ${
                    selectedIds.includes(a.id) ? "bg-blue-50/50" : ""
                  }`}
                >
                  <button onClick={() => toggleSelect(a.id)}>
                    {selectedIds.includes(a.id) ? (
                      <CheckSquare className="h-5 w-5" style={{ color: "#C8A951" }} />
                    ) : (
                      <Square className="h-5 w-5 text-gray-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{ color: "#0A2647" }}
                      >
                        {a.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(
                          a.type
                        )}`}
                      >
                        {a.type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                        <Phone className="h-2.5 w-2.5" />
                        {a.network}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-600">
                      <span>{a.customerName}</span>
                      <span className="text-gray-300">|</span>
                      <span>{a.customerCNIC}</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-medium">{a.simNumber}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openModal(a.id)}
                    className="px-4 py-2 min-h-[48px] rounded-xl text-xs font-semibold text-white shrink-0 transition hover:opacity-90"
                    style={{ backgroundColor: "#0A2647" }}
                  >
                    Complete FCA
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date-wise Completed Records */}
        {completedByDate.length > 0 && (
          <div className="space-y-4">
            <h2
              className="text-lg font-bold"
              style={{ color: "#0A2647" }}
            >
              Completed Records
            </h2>
            {completedByDate.map(([date, records]) => (
              <div
                key={date}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                  style={{ backgroundColor: "#0A264708" }}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: "#C8A951" }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#0A2647" }}
                    >
                      {formatDateDDMMYYYY(date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: "#C8A95120",
                        color: "#0A2647",
                      }}
                    >
                      {records.length} record{records.length !== 1 && "s"}
                    </span>
                    {expandedDates.has(date) ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedDates.has(date) && (
                  <div className="divide-y divide-gray-100">
                    {records.map((a) => (
                      <div
                        key={a.id}
                        className="px-5 py-3 flex items-center gap-4 min-h-[72px]"
                      >
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-xs font-semibold"
                              style={{ color: "#0A2647" }}
                            >
                              {a.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(
                                a.type
                              )}`}
                            >
                              {a.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {a.customerName} &middot; {a.simNumber}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl">
              <div
                className="flex items-center justify-between px-6 py-4 rounded-t-2xl text-white"
                style={{ backgroundColor: "#0A2647" }}
              >
                <div>
                  <h3 className="text-lg font-bold">FCA Verification</h3>
                  <p className="text-xs text-gray-300">
                    {selected.id} &middot; {selected.customerName}
                  </p>
                </div>
                <button
                  onClick={() => setModalId(null)}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Verification Checklist
                </p>
                {[
                  {
                    key: "incomingCall" as const,
                    label: "Incoming Call Test Passed",
                  },
                  {
                    key: "outgoingCall" as const,
                    label: "Outgoing Call Test Passed",
                  },
                  {
                    key: "voiceActive" as const,
                    label: "Voice Service Active",
                  },
                  {
                    key: "networkRegistered" as const,
                    label: "Network Registered Successfully",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-4 min-h-[56px] rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.key]}
                      onChange={() => toggleCheck(item.key)}
                      className="w-5 h-5 rounded border-gray-300"
                      style={{ accentColor: "#C8A951" }}
                    />
                    <span className="text-sm font-semibold text-gray-700 flex-1">
                      {item.label}
                    </span>
                    {checklist[item.key] && (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    )}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setModalId(null)}
                  className="px-4 py-2 min-h-[48px] rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleIndividualComplete(selected.id)}
                  disabled={!allChecked}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 min-h-[56px] rounded-xl text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: allChecked ? "#C8A951" : "#9CA3AF",
                    color: allChecked ? "#0A2647" : "#fff",
                  }}
                >
                  <CheckCircle className="h-5 w-5" />
                  Complete FCA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
