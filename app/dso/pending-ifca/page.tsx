"use client";
export const dynamic = "force-dynamic";

import React, { useState, useMemo } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import {
  ArrowLeft, Wifi, CheckCircle, Clock, Filter, Search, Square, CheckSquare, X, AlertCircle, ChevronDown, ChevronUp, Phone, ShieldCheck,
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            {successMsg}
          </div>
        )}

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
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-500 text-white">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-600">FCA</p>
                <p className="text-[10px] text-gray-400">Done</p>
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-emerald-300 rounded" />
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#C8A951" }}>3</div>
              <div>
                <p className="text-xs font-bold" style={{ color: "#0A2647" }}>IFCA</p>
                <p className="text-[10px] text-gray-400">Current</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: "#0A2647" }}>
          <div className="flex items-center gap-3 mb-4">
            <a
              href="/dso/dashboard"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Wifi className="h-7 w-7" style={{ color: "#C8A951" }} />
                IFCA Verification
              </h1>
              <p className="text-sm text-gray-300 mt-0.5">
                Final data &amp; connectivity check — {pending.length} pending
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedCount > 0 && (
                <button
                  onClick={handleBulkComplete}
                  className="flex items-center gap-2 px-4 py-2 min-h-[48px] rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#22C55E" }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete ({selectedCount})
                </button>
              )}
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 px-4 py-2 min-h-[48px] rounded-xl text-sm font-medium transition border"
                style={{ borderColor: "#C8A951", color: "#C8A951" }}
              >
                <Clock className="h-4 w-4" />
                {showCompleted ? "Hide" : "Show"} Done ({completed.length})
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm min-h-[80px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Pending</p>
                <p className="text-3xl font-bold mt-1" style={{ color: "#0A2647" }}>{pending.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF7E0" }}>
                <Clock className="h-7 w-7" style={{ color: "#C8A951" }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm min-h-[80px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Completed Today</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{completedToday.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm min-h-[80px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Completed</p>
                <p className="text-3xl font-bold mt-1" style={{ color: "#0A2647" }}>{completed.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EBF5FF" }}>
                <Wifi className="h-7 w-7 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, name, CNIC, SIM number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={networkFilter}
                onChange={(e) => setNetworkFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="All">All Networks</option>
                <option value="Telenor">Telenor</option>
                <option value="Jazz">Jazz</option>
                <option value="Ufone">Ufone</option>
                <option value="Zong">Zong</option>
              </select>
            </div>
          </div>
        </div>

        {filteredPending.length === 0 && !showCompleted ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <CheckCircle className="h-14 w-14 mx-auto mb-4 text-emerald-400" />
            <p className="text-lg font-semibold text-gray-700">All IFCA verifications completed</p>
            <p className="text-sm text-gray-400 mt-1">No pending activations for IFCA verification</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="w-12 px-4 py-3">
                      <button onClick={toggleSelectAll} className="flex items-center justify-center min-h-[48px]">
                        {allChecked ? (
                          <CheckSquare className="h-5 w-5" style={{ color: "#C8A951" }} />
                        ) : (
                          <Square className="h-5 w-5 text-gray-300" />
                        )}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activation</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SIM Details</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPending.map((a: Activation) => (
                    <tr
                      key={a.id}
                      className={`hover:bg-gray-50 transition ${selectedIds.has(a.id) ? "bg-amber-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(a.id)} className="flex items-center justify-center">
                          {selectedIds.has(a.id) ? (
                            <CheckSquare className="h-5 w-5" style={{ color: "#C8A951" }} />
                          ) : (
                            <Square className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono text-sm font-semibold" style={{ color: "#0A2647" }}>{a.id}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDateDDMMYYYY(a.createdAt)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{a.customerName}</p>
                          <p className="text-xs text-gray-400">{a.customerCNIC}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-700 font-medium">{a.simNumber}</p>
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                            <Phone className="h-2.5 w-2.5" />
                            {a.network}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge(a.type)}`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCompleteSingle(a.id)}
                            className="px-3 py-2 min-h-[48px] rounded-lg text-xs font-medium text-white transition hover:opacity-90"
                            style={{ backgroundColor: "#22C55E" }}
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => openModal(a.id)}
                            className="px-3 py-2 min-h-[48px] rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCompleted && groupedCompleted.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "#0A2647" }}>
                <CheckCircle className="h-5 w-5" style={{ color: "#C8A951" }} />
                Completed IFCA Records
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {groupedCompleted.map(([date, records]) => (
                <div key={date} className="p-4">
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full flex items-center justify-between mb-3 hover:bg-gray-100 rounded-lg p-2 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-600">{formatDateDDMMYYYY(date)}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                        {records.length} completed
                      </span>
                    </div>
                    {expandedDates.has(date) ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {expandedDates.has(date) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {records.map((a: Activation) => (
                        <div key={a.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 min-h-[80px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs font-semibold" style={{ color: "#0A2647" }}>{a.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(a.type)}`}>
                              {a.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{a.customerName}</p>
                          <p className="text-xs text-gray-400">{a.simNumber} &middot; {a.network}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#0A2647" }}>IFCA Verification</h3>
                  <p className="text-xs text-gray-500">{selected.id} &middot; {selected.customerName}</p>
                </div>
                <button onClick={() => setModalId(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">SIM Number</p>
                    <p className="font-medium text-gray-700">{selected.simNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Network</p>
                    <p className="font-medium text-gray-700">{selected.network}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">ICCID</p>
                    <p className="font-medium text-gray-700 font-mono text-xs">{selected.iccid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Device ID</p>
                    <p className="font-medium text-gray-700">{selected.deviceId}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">IFCA Checklist</p>
                {[
                  { key: "dataPackageActive" as ChecklistKey, label: "Data Package Active" },
                  { key: "networkConnected" as ChecklistKey, label: "Network Connected" },
                  { key: "appDownloaded" as ChecklistKey, label: "App Downloaded" },
                  { key: "dataUsage300mb" as ChecklistKey, label: "Data Usage > 300MB" },
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
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    {checklist[item.key] && <CheckCircle className="h-5 w-5 text-emerald-500 ml-auto" />}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setModalId(null)}
                  className="px-4 py-2 min-h-[48px] rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteFromModal}
                  disabled={!allChecklistChecked}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 min-h-[56px] rounded-xl text-sm font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: allChecklistChecked ? "#C8A951" : "#9CA3AF",
                    color: allChecklistChecked ? "#0A2647" : "#fff",
                  }}
                >
                  <CheckCircle className="h-5 w-5" />
                  Complete IFCA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
