"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Eye, RotateCcw, X, Package, ArrowRight, Check, Filter, CheckSquare, Square, User, Smartphone, Trash2 } from "lucide-react";
import { useFranchiseData, SIMIssueRecord } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

export default function IssuedReturnsPage() {
  const { sims, dso, dsms, issueRecords, issueSIMs, returnSIMs, deleteIssueRecords, devices } = useFranchiseData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<SIMIssueRecord | null>(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Issue modal states
  const [step, setStep] = useState(1);
  const [issueType, setIssueType] = useState<"DSO" | "DSM">("DSO");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [selectedSimIds, setSelectedSimIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [retailerId, setRetailerId] = useState("");
  const [simTab, setSimTab] = useState<"new" | "hlr">("new");
  const [bulkCount, setBulkCount] = useState(10);
  const [simSearch, setSimSearch] = useState("");

  const people = issueType === "DSO" ? dso : dsms;
  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  const availableSIMs = useMemo(() => sims.filter((s) => s.status === "In Stock"), [sims]);
  const filteredByTab = useMemo(() => availableSIMs.filter((s) => s.type === simTab), [availableSIMs, simTab]);
  const simSearchResults = useMemo(() => {
    if (!simSearch.trim()) return filteredByTab;
    const q = simSearch.toLowerCase();
    return filteredByTab.filter((s) =>
      (s.iccid || "").toLowerCase().includes(q) ||
      (s.simNumber || "").toLowerCase().includes(q) ||
      (s.id || "").toLowerCase().includes(q) ||
      (s.network || "").toLowerCase().includes(q)
    );
  }, [filteredByTab, simSearch]);
  const visibleSIMs = useMemo(() => simSearchResults.slice(0, bulkCount), [simSearchResults, bulkCount]);

  const toggleSim = (id: string) => {
    setSelectedSimIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAllVisible = () => {
    const ids = visibleSIMs.map((s) => s.id);
    setSelectedSimIds((prev) => {
      const allSelected = ids.every((id) => prev.includes(id));
      if (allSelected) return prev.filter((id) => !ids.includes(id));
      const combined = prev.concat(ids.filter((id) => !prev.includes(id)));
      return combined;
    });
  };

  const toggleRecordSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAllRecords = () => {
    setSelectedIds((prev) => {
      const allSelected = filteredRecords.every((r) => prev.includes(r.id));
      if (allSelected) return [];
      return filteredRecords.map((r) => r.id);
    });
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteIssueRecords(selectedIds);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
    } catch (e) {
      console.error("Failed to delete issue records:", e);
      alert("Failed to delete records. Please try again.");
    }
  };

  const getMobileDigits = (mobile: string) => mobile.replace(/[^0-9]/g, "").slice(-10);

  const computeRetailerId = () => {
    if (!selectedPerson) return "";
    const base = getMobileDigits(selectedPerson.mobile);
    const existingRecords = issueRecords.filter(
      (r) => r.issuedById === selectedPersonId && r.status === "Issued"
    );
    if (existingRecords.length === 0) return base;
    const maxSuffix = existingRecords.reduce((max, r) => {
      const parts = r.retailerId.split("-");
      if (parts.length > 1) {
        const num = parseInt(parts[parts.length - 1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `${base}-${maxSuffix + 1}`;
  };

  const openIssueModal = () => {
    setStep(1);
    setIssueType("DSO");
    setSelectedPersonId("");
    setSelectedSimIds([]);
    setNotes("");
    setRetailerId("");
    setSimTab("new");
    setBulkCount(10);
    setSimSearch("");
    setShowIssueModal(true);
  };

  const handlePersonSelect = (id: string) => {
    setSelectedPersonId(id);
    if (step === 1) {
      setStep(2);
    }
  };

  const handleProceedToRetailer = () => {
    setRetailerId(computeRetailerId());
    setStep(3);
  };

  const handleProceedToNotes = () => {
    setStep(4);
  };

  const handleIssueSubmit = async () => {
    if (selectedSimIds.length === 0 || !selectedPerson) return;
    const now = new Date().toISOString().split("T")[0];
    try {
      await issueSIMs({
        simIds: selectedSimIds,
        issuedTo: selectedPerson.name,
        issuedToRole: issueType,
        issuedById: selectedPerson.id,
        retailerId,
        franchiseId: selectedPerson.franchiseId,
        issueDate: now,
        returnDate: "",
        status: "Issued",
        notes,
      });
      setShowIssueModal(false);
      setStep(1);
      setSelectedSimIds([]);
      setSelectedPersonId("");
      setNotes("");
    } catch (e) {
      console.error("Failed to issue SIMs:", e);
      alert("Failed to issue SIMs. Please try again.");
    }
  };

  const filteredRecords = useMemo(() => {
    return issueRecords.filter((r) => {
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchSearch =
        search === "" ||
        r.issuedTo.toLowerCase().includes(search.toLowerCase()) ||
        r.retailerId.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [issueRecords, statusFilter, search]);

  const stats = useMemo(() => {
    const issued = issueRecords.filter((r) => r.status === "Issued").length;
    const returned = issueRecords.filter((r) => r.status === "Returned").length;
    return { total: issueRecords.length, issued, returned };
  }, [issueRecords]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Issued & Return Stocks</h1>
          <p className="text-gray-500 text-sm mt-1">Manage SIM issues and returns for DSOs and DSMs</p>
        </div>
        <button onClick={openIssueModal} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Issue SIMs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0A2647]/10 flex items-center justify-center"><Package size={20} className="text-[#0A2647]" /></div>
          <div>
            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            <p className="text-gray-500 text-xs">Total Records</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><ArrowRight size={20} className="text-blue-600" /></div>
          <div>
            <p className="text-2xl font-black text-blue-600">{stats.issued}</p>
            <p className="text-gray-500 text-xs">Currently Issued</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><Check size={20} className="text-green-600" /></div>
          <div>
            <p className="text-2xl font-black text-green-600">{stats.returned}</p>
            <p className="text-gray-500 text-xs">Returned</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-200 flex-1 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, retailer ID, or issue ID..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {["All", "Issued", "Returned"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              <span className="flex items-center gap-1.5"><Filter size={12} /> {s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <CheckSquare size={16} className="text-red-600" />
          <span className="text-red-700 text-sm font-medium">{selectedIds.length} record(s) selected</span>
          <div className="flex-1" />
          <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50">Clear</button>
          <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 inline-flex items-center gap-1.5"><Trash2 size={12} /> Delete Selected</button>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-10 px-4 py-4">
                  <button onClick={toggleAllRecords} className="flex items-center justify-center">
                    {filteredRecords.length > 0 && filteredRecords.every((r) => selectedIds.includes(r.id))
                      ? <CheckSquare size={16} className="text-[#0A2647]" />
                      : <Square size={16} className="text-gray-300" />
                    }
                  </button>
                </th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Issue ID</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Issued To</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Role</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Retailer ID</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">SIMs</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Issue Date</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Return Date</th>
                <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="w-10 px-4 py-4">
                    <button onClick={() => toggleRecordSelect(r.id)} className="flex items-center justify-center">
                      {selectedIds.includes(r.id)
                        ? <CheckSquare size={16} className="text-[#0A2647]" />
                        : <Square size={16} className="text-gray-300" />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 text-sm font-mono font-medium">{r.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0A2647]/10 flex items-center justify-center">
                        <User size={14} className="text-[#0A2647]" />
                      </div>
                      <p className="text-gray-900 text-sm font-medium">{r.issuedTo}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.issuedToRole === "DSO" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{r.issuedToRole}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-gray-600 text-sm font-mono">{r.retailerId}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                      <Package size={12} /> {r.simIds.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(r.issueDate)}</td>
                  <td className="px-6 py-4 hidden xl:table-cell text-gray-500 text-xs">{formatDateDDMMYYYY(r.returnDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.status === "Issued" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setShowViewModal(r)} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-[#0A2647]/5 rounded-lg transition-all" title="View Details"><Eye size={14} /></button>
                      {r.status === "Issued" && (
                        <button onClick={() => setShowReturnConfirm(r.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Return SIMs"><RotateCcw size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRecords.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Package size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No records found</p>
          </div>
        )}
      </div>

      {/* Issue SIMs Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowIssueModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-bold">Issue SIMs</h3>
                <p className="text-gray-400 text-xs mt-0.5">Step {step} of 4</p>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>

            {/* Step Progress */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s ? "bg-[#0A2647] text-white" : "bg-gray-100 text-gray-400"}`}>
                      {step > s ? <Check size={12} /> : s}
                    </div>
                    {s < 4 && <div className={`flex-1 h-0.5 mx-1 ${step > s ? "bg-[#0A2647]" : "bg-gray-100"}`} />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                <span>Select Person</span>
                <span>Select SIMs</span>
                <span>Retailer ID</span>
                <span>Notes</span>
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: Select Type & Person */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-2">Select Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["DSO", "DSM"] as const).map((t) => (
                        <button key={t} onClick={() => { setIssueType(t); setSelectedPersonId(""); }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${issueType === t ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${issueType === t ? "bg-[#0A2647] text-white" : "bg-gray-100 text-gray-500"}`}>
                              {t === "DSO" ? <Smartphone size={16} /> : <User size={16} />}
                            </div>
                            <div>
                              <p className="text-gray-900 text-sm font-bold">{t}</p>
                              <p className="text-gray-400 text-xs">{t === "DSO" ? "Direct Sales Officer" : "Direct Sales Manager"}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-2">Select Person</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {people.filter((p) => p.status === "Active").map((p) => (
                        <button key={p.id} onClick={() => handlePersonSelect(p.id)}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedPersonId === p.id ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-medium truncate">{p.name}</p>
                            <p className="text-gray-400 text-xs font-mono">{p.id}</p>
                          </div>
                          {selectedPersonId === p.id && <Check size={16} className="text-[#0A2647] flex-shrink-0" />}
                        </button>
                      ))}
                      {people.filter((p) => p.status === "Active").length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-4">No active {issueType} found</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select SIMs */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* SIM Type Tabs */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    {(["new", "hlr"] as const).map((t) => {
                      const count = availableSIMs.filter((s) => s.type === t).length;
                      return (
                        <button key={t} onClick={() => { setSimTab(t); setSelectedSimIds([]); }}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${simTab === t ? "bg-white text-[#0A2647] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                          {t === "new" ? "New SIMs" : "HLR SIMs"} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Bulk Count Selector + Select All */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-xs">Show:</span>
                      {[10, 25, 50, 100].map((n) => (
                        <button key={n} onClick={() => { setBulkCount(n); setSelectedSimIds([]); }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${bulkCount === n ? "bg-[#0A2647] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <button onClick={selectAllVisible}
                      className="text-xs font-medium text-[#0A2647] hover:underline">
                      {visibleSIMs.every((s) => selectedSimIds.includes(s.id)) ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {/* SIM Search */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
                    <Search size={16} className="text-gray-400" />
                    <input type="text" value={simSearch} onChange={(e) => setSimSearch(e.target.value)}
                      placeholder="Search by ICCID, SIM number, network or ID..."
                      className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
                    {simSearch && <button onClick={() => setSimSearch("")} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>}
                  </div>

                  {/* SIM List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {visibleSIMs.map((s) => (
                      <button key={s.id} onClick={() => toggleSim(s.id)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedSimIds.includes(s.id) ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                        <div className="flex-shrink-0">
                          {selectedSimIds.includes(s.id) ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} className="text-gray-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 text-sm font-mono font-medium truncate">{s.iccid || "\u2014"}</p>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${s.network === "Jazz" ? "bg-red-50 text-red-600" : s.network === "Telenor" ? "bg-blue-50 text-blue-600" : s.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{s.network}</span>
                          </div>
                          <p className="text-gray-400 text-xs font-mono mt-0.5 truncate">{s.simNumber} <span className="text-gray-300">|</span> {s.id}</p>
                        </div>
                      </button>
                    ))}
                    {visibleSIMs.length === 0 && (
                      <div className="text-center py-8">
                        <Package size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">{simSearch ? "No SIMs match your search" : `No ${simTab === "new" ? "New" : "HLR"} SIMs in stock`}</p>
                      </div>
                    )}
                  </div>
                  {simSearch && (
                    <p className="text-gray-400 text-xs">{simSearchResults.length} SIM(s) match &quot;{simSearch}&quot;</p>
                  )}
                  {selectedSimIds.length > 0 && (
                    <p className="text-[#0A2647] text-xs font-medium">{selectedSimIds.length} SIM(s) selected</p>
                  )}
                </div>
              )}

              {/* Step 3: Auto-generated Retailer ID */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-2">Retailer ID (Auto-generated)</label>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-gray-900 text-lg font-mono font-bold">{retailerId}</p>
                      <p className="text-gray-400 text-xs mt-1">Based on {selectedPerson?.name}&apos;s mobile number</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Smartphone size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-800 text-sm font-medium">Issue Summary</p>
                        <p className="text-blue-600 text-xs mt-1">
                          {selectedSimIds.length} SIM(s) will be issued to <strong>{selectedPerson?.name}</strong> ({issueType})
                          {issueRecords.filter((r) => r.issuedById === selectedPersonId && r.status === "Issued").length > 0 && (
                            <span> — This is issue #{issueRecords.filter((r) => r.issuedById === selectedPersonId && r.status === "Issued").length + 1} for this person</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Notes */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-2">Notes (Optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Add any notes about this issue..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 resize-none" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                    <p className="text-gray-900 text-sm font-bold">Confirmation</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-gray-400">Issued To:</span> <span className="text-gray-700 font-medium ml-1">{selectedPerson?.name}</span></div>
                      <div><span className="text-gray-400">Role:</span> <span className="text-gray-700 font-medium ml-1">{issueType}</span></div>
                      <div><span className="text-gray-400">Retailer ID:</span> <span className="text-gray-700 font-mono font-medium ml-1">{retailerId}</span></div>
                      <div><span className="text-gray-400">SIMs:</span> <span className="text-gray-700 font-medium ml-1">{selectedSimIds.length}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              {step > 1 && (
                <button onClick={() => setStep((s) => s - 1)} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Back</button>
              )}
              <div className="flex-1" />
              {step === 1 && (
                <button onClick={() => selectedPersonId && setStep(2)} disabled={!selectedPersonId}
                  className="px-6 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  Next <ArrowRight size={14} />
                </button>
              )}
              {step === 2 && (
                <button onClick={handleProceedToRetailer} disabled={selectedSimIds.length === 0}
                  className="px-6 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  Next <ArrowRight size={14} />
                </button>
              )}
              {step === 3 && (
                <button onClick={handleProceedToNotes}
                  className="px-6 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center gap-2">
                  Next <ArrowRight size={14} />
                </button>
              )}
              {step === 4 && (
                <button onClick={handleIssueSubmit}
                  className="px-6 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] inline-flex items-center gap-2">
                  <Check size={14} /> Confirm Issue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowViewModal(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">Issue Details</h3>
              <button onClick={() => setShowViewModal(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Issue ID</p>
                  <p className="text-gray-900 text-sm font-mono font-medium">{showViewModal.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Status</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${showViewModal.status === "Issued" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{showViewModal.status}</span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Issued To</p>
                  <p className="text-gray-900 text-sm font-medium">{showViewModal.issuedTo}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Role</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${showViewModal.issuedToRole === "DSO" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{showViewModal.issuedToRole}</span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Retailer ID</p>
                  <p className="text-gray-900 text-sm font-mono font-medium">{showViewModal.retailerId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Issue Date</p>
                  <p className="text-gray-900 text-sm">{formatDateDDMMYYYY(showViewModal.issueDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Return Date</p>
                  <p className="text-gray-900 text-sm">{formatDateDDMMYYYY(showViewModal.returnDate)}</p>
                </div>
              </div>
              {showViewModal.notes && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Notes</p>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-xl">{showViewModal.notes}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-xs mb-2">Issued SIMs ({showViewModal.simIds.length})</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {showViewModal.simIds.map((simId) => {
                    const sim = sims.find((s) => s.id === simId);
                    return (
                      <div key={simId} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                        <Package size={14} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-xs font-mono font-medium truncate">{sim?.iccid || simId}</p>
                          <p className="text-gray-400 text-[10px] font-mono truncate">{sim?.simNumber || ""} <span className="text-gray-300">|</span> {simId}</p>
                        </div>
                        {sim && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${sim.network === "Jazz" ? "bg-red-50 text-red-600" : sim.network === "Telenor" ? "bg-blue-50 text-blue-600" : sim.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{sim.network}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {showReturnConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReturnConfirm(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4"><RotateCcw size={20} className="text-green-600" /></div>
            <h3 className="text-gray-900 font-bold mb-2">Return SIMs?</h3>
            <p className="text-gray-500 text-sm mb-6">All SIMs in this issue will be marked as returned and set back to stock.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReturnConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={() => { returnSIMs(showReturnConfirm); setShowReturnConfirm(null); }} className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 inline-flex items-center justify-center gap-2"><RotateCcw size={14} /> Return</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-gray-900 font-bold mb-2">Delete {selectedIds.length} Record(s)?</h3>
            <p className="text-gray-500 text-sm mb-6">This will permanently delete these issue records. SIMs will be set back to stock.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={handleDeleteSelected} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 inline-flex items-center justify-center gap-2"><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
