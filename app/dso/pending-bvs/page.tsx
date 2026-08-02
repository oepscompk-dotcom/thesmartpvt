"use client";

import React, { useState, useMemo } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import {
  ArrowLeft,
  Fingerprint,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Square,
  CheckSquare,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  ShieldCheck,
  Wifi,
  Layers,
} from "lucide-react";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Verification Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#C8A951" }}>1</div>
              <div>
                <p className="text-xs font-bold" style={{ color: "#0A2647" }}>BVS</p>
                <p className="text-[10px] text-gray-400">Current</p>
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-400">2</div>
              <div>
                <p className="text-xs font-medium text-gray-400">FCA</p>
                <p className="text-[10px] text-gray-400">Next</p>
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-400">3</div>
              <div>
                <p className="text-xs font-medium text-gray-400">IFCA</p>
                <p className="text-[10px] text-gray-400">Final</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ backgroundColor: "#0A2647" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <a
              href="/dso/dashboard"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Fingerprint className="h-7 w-7" style={{ color: "#C8A951" }} />
                BVS Verification
              </h1>
              <p className="text-sm text-gray-300 mt-0.5">
                Biometric Verification System â€” Pending SIMs
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div
              className="px-4 py-3 rounded-xl text-center"
              style={{ backgroundColor: "rgba(200,169,81,0.15)" }}
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold" style={{ color: "#C8A951" }}>
                {pending.length}
              </p>
            </div>
            <div
              className="px-4 py-3 rounded-xl text-center"
              style={{ backgroundColor: "rgba(200,169,81,0.15)" }}
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Today</p>
              <p className="text-2xl font-bold" style={{ color: "#C8A951" }}>
                {completedToday.length}
              </p>
            </div>
            <div
              className="px-4 py-3 rounded-xl text-center"
              style={{ backgroundColor: "rgba(200,169,81,0.15)" }}
            >
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Done</p>
              <p className="text-2xl font-bold" style={{ color: "#C8A951" }}>
                {totalCompleted.length}
              </p>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div
          className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{
            backgroundColor: "#FFF8E1",
            borderColor: "#C8A951",
          }}
        >
          <AlertCircle
            className="h-5 w-5 mt-0.5 flex-shrink-0"
            style={{ color: "#C8A951" }}
          />
          <p className="text-sm text-gray-700">
            After all verifications (BVS â†’ FCA â†’ IFCA), SIM status will change
            to <span className="font-semibold text-emerald-600">Active</span>.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, CNIC, SIM number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A951]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkComplete}
                  className="flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-xl text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#16a34a" }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Selected ({selectedIds.size})
                </button>
              )}
            </div>
          </div>

          {showFilter && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Network
              </p>
              <div className="flex flex-wrap gap-2">
                {networks.map((net) => (
                  <button
                    key={net}
                    onClick={() => setFilterNetwork(net)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition"
                    style={{
                      backgroundColor:
                        filterNetwork === net ? "#0A2647" : "white",
                      color: filterNetwork === net ? "white" : "#6B7280",
                      borderColor:
                        filterNetwork === net ? "#0A2647" : "#E5E7EB",
                    }}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending List */}
        {filteredPending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <CheckCircle className="h-14 w-14 mx-auto mb-3 text-emerald-400" />
            <p className="text-gray-500 font-medium text-lg">
              {pending.length === 0
                ? "All BVS verifications completed"
                : "No results found"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {pending.length === 0
                ? "Great work! All SIMs have been verified."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <th className="px-4 py-3 text-left w-10">
                      <button onClick={toggleSelectAll} className="flex items-center justify-center">
                        {allFilteredSelected ? (
                          <CheckSquare
                            className="h-5 w-5"
                            style={{ color: "#C8A951" }}
                          />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th
                      className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider"
                      style={{ color: "#0A2647" }}
                    >
                      Customer
                    </th>
                    <th
                      className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider hidden md:table-cell"
                      style={{ color: "#0A2647" }}
                    >
                      SIM Details
                    </th>
                    <th
                      className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider hidden lg:table-cell"
                      style={{ color: "#0A2647" }}
                    >
                      CNIC
                    </th>
                    <th
                      className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider"
                      style={{ color: "#0A2647" }}
                    >
                      Type
                    </th>
                    <th
                      className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider"
                      style={{ color: "#0A2647" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPending.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 transition min-h-[80px]"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelect(a.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.has(a.id) ? (
                            <CheckSquare
                              className="h-5 w-5"
                              style={{ color: "#C8A951" }}
                            />
                          ) : (
                            <Square className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="font-medium text-sm"
                          style={{ color: "#0A2647" }}
                        >
                          {a.customerName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {a.id}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="min-h-[60px] flex flex-col justify-center">
                          <p className="text-sm text-gray-700 font-medium">{a.simNumber}</p>
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 w-fit">
                            <Phone className="h-2.5 w-2.5" />
                            {a.network}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-xs text-gray-600 font-mono">
                          {a.customerCNIC}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor(a.type)}`}
                        >
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openModal(a.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[48px] rounded-lg text-xs font-medium text-white transition hover:opacity-90"
                          style={{ backgroundColor: "#0A2647" }}
                        >
                          <Fingerprint className="h-3.5 w-3.5" />
                          Complete BVS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Completed Records â€” Date-wise */}
        {completedByDate.length > 0 && (
          <div className="space-y-4">
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ color: "#0A2647" }}
            >
              <Clock className="h-5 w-5" style={{ color: "#C8A951" }} />
              Completed Records
            </h2>
            {completedByDate.map(([date, records]) => (
              <div key={date} className="space-y-2">
                <button
                  onClick={() => toggleDate(date)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#C8A951" }}
                    >
                      {formatDateDDMMYYYY(date)}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {records.length}
                    </span>
                  </div>
                  {expandedDates.has(date) ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {expandedDates.has(date) && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {records.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between px-5 py-3 min-h-[72px]"
                      >
                        <div className="flex items-center gap-4">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          <div>
                            <p
                              className="font-medium text-sm"
                              style={{ color: "#0A2647" }}
                            >
                              {a.customerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {a.simNumber} &middot; {a.network} &middot;{" "}
                              {a.id}
                            </p>
                          </div>
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"
                        >
                          Completed
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BVS Verification Modal */}
      {selectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl">
            <div
              className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
              style={{ backgroundColor: "#0A2647" }}
            >
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Fingerprint
                    className="h-5 w-5"
                    style={{ color: "#C8A951" }}
                  />
                  BVS Verification
                </h3>
                <p className="text-xs text-gray-300">
                  {selectedModal.id} &middot; {selectedModal.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              <div
                className="p-3 rounded-xl border mb-4"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderColor: "#E5E7EB",
                }}
              >
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">SIM:</span>{" "}
                    <span className="font-medium" style={{ color: "#0A2647" }}>
                      {selectedModal.simNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Network:</span>{" "}
                    <span className="font-medium" style={{ color: "#0A2647" }}>
                      {selectedModal.network}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">CNIC:</span>{" "}
                    <span className="font-medium" style={{ color: "#0A2647" }}>
                      {selectedModal.customerCNIC}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="font-medium" style={{ color: "#0A2647" }}>
                      {selectedModal.type}
                    </span>
                  </div>
                </div>
              </div>

              {CHECKLIST_ITEMS.map((item) => (
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
                  <span className="text-sm font-semibold text-gray-700">
                    {item.label}
                  </span>
                  {checklist[item.key] && (
                    <CheckCircle className="h-5 w-5 text-emerald-500 ml-auto" />
                  )}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 min-h-[48px] rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSingle}
                disabled={!allChecked}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 min-h-[56px] rounded-lg text-sm font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: allChecked ? "#C8A951" : "#9CA3AF",
                  color: allChecked ? "#0A2647" : "#fff",
                }}
              >
                <CheckCircle className="h-5 w-5" />
                Complete BVS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
