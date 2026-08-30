"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Eye, RotateCcw, X, Package, ArrowRight, Check, CheckCircle2, CheckSquare, Square, User, Smartphone, Trash2, Clock, Inbox } from "lucide-react";
import { useFranchiseData, SIMIssueRecord } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill, toneForStatus, QuickChip } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default function IssuedReturnsPage() {
  const { sims, dso, dsms, issueRecords, issueSIMs, returnSelectedSIMs, forwardSIMs, deleteIssueRecords, devices } = useFranchiseData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<SIMIssueRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [page, setPage] = useState(1);

  // Return / Forward action modal states
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionRecord, setActionRecord] = useState<SIMIssueRecord | null>(null);
  const [actionMode, setActionMode] = useState<"return" | "forward">("return");
  const [actionSimIds, setActionSimIds] = useState<string[]>([]);
  const [forwardType, setForwardType] = useState<"DSO" | "DSM">("DSO");
  const [forwardPersonId, setForwardPersonId] = useState("");

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

  const computeForwardRetailerId = (person: { id: string; name: string; mobile: string }) => {
    const base = getMobileDigits(person.mobile);
    const existing = issueRecords.filter((r) => r.issuedById === person.id && r.status === "Issued");
    if (existing.length === 0) return base;
    const maxSuffix = existing.reduce((max, r) => {
      const parts = r.retailerId.split("-");
      if (parts.length > 1) {
        const num = parseInt(parts[parts.length - 1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `${base}-${maxSuffix + 1}`;
  };

  const isSIMActivated = (id: string) => {
    const s = sims.find((x) => x.id === id);
    return !!s && (s.status === "Activated" || s.status === "Active");
  };

  const actionBalanceIds = actionRecord ? actionRecord.simIds.filter((id) => !isSIMActivated(id)) : [];

  const openActionModal = (r: SIMIssueRecord, mode: "return" | "forward") => {
    setActionRecord(r);
    setActionMode(mode);
    setActionSimIds(mode === "return" ? r.simIds.filter((id) => !isSIMActivated(id)) : [...r.simIds]);
    setForwardType("DSO");
    setForwardPersonId("");
    setShowActionModal(true);
  };

  const toggleActionSim = (id: string) => {
    setActionSimIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAllActionSims = () => {
    const ref = actionMode === "return" ? actionBalanceIds : (actionRecord ? actionRecord.simIds : []);
    setActionSimIds((prev) => prev.length === ref.length && ref.length > 0 ? [] : [...ref]);
  };

  const handleReturnConfirm = async () => {
    if (!actionRecord || actionSimIds.length === 0) return;
    try {
      await returnSelectedSIMs(actionRecord.id, actionSimIds);
      setShowActionModal(false);
      setActionRecord(null);
      setActionSimIds([]);
      setForwardPersonId("");
    } catch (e) {
      console.error("Failed to return SIMs:", e);
      alert("Failed to return SIMs. Please try again.");
    }
  };

  const handleForwardConfirm = async () => {
    if (!actionRecord || actionSimIds.length === 0 || !forwardPersonId) return;
    const person = (forwardType === "DSO" ? dso : dsms).find((p) => p.id === forwardPersonId);
    if (!person) return;
    try {
      await forwardSIMs(actionRecord.id, actionSimIds, { id: person.id, name: person.name, role: forwardType }, computeForwardRetailerId(person));
      setShowActionModal(false);
      setActionRecord(null);
      setActionSimIds([]);
      setForwardPersonId("");
    } catch (e) {
      console.error("Failed to forward SIMs:", e);
      alert("Failed to forward SIMs. Please try again.");
    }
  };

  const getSIMBreakdown = (record: SIMIssueRecord) => {
    const activated = record.simIds.filter((id) => {
      const s = sims.find((x) => x.id === id);
      return s && (s.status === "Activated" || s.status === "Active");
    }).length;
    return { total: record.simIds.length, activated, balance: record.simIds.length - activated };
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

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pagedRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const issued = issueRecords.filter((r) => r.status === "Issued").length;
    const returned = issueRecords.filter((r) => r.status === "Returned").length;
    return { total: issueRecords.length, issued, returned };
  }, [issueRecords]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Issued & Returns" }]}
        title="Issued & Return Stocks"
        description="Manage SIM issues and returns for DSOs and DSMs"
        actions={
          <Button onClick={openIssueModal}>
            <Plus size={16} /> Issue SIMs
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Records" value={stats.total} icon={Package} />
        <StatCard label="Currently Issued" value={stats.issued} icon={ArrowRight} iconClass="text-blue-600 bg-blue-50" />
        <StatCard label="Returned" value={stats.returned} icon={Check} iconClass="text-green-600 bg-green-50" />
      </div>

      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SearchInput
              placeholder="Search by name, retailer ID, or issue ID..."
              value={search}
              onChange={(v) => setSearch(v)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Issued", "Returned"].map((s) => (
                <QuickChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <CheckSquare className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-700">{selectedIds.length} record{selectedIds.length > 1 ? "s" : ""} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
              <X className="h-4 w-4" /> Clear
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle>Issue Records</CardTitle>
          <span className="text-sm text-muted-foreground">{filteredRecords.length} records</span>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="w-10 px-4 py-3 text-center">
                    <button onClick={toggleAllRecords} className="flex items-center justify-center">
                      {filteredRecords.length > 0 && filteredRecords.every((r) => selectedIds.includes(r.id))
                        ? <CheckSquare size={16} className="text-brand-600" />
                        : <Square size={16} className="text-slate-300" />
                      }
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Issue ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Issued To</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Role</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">Retailer ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">SIMs | Activated | Balance</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground xl:table-cell">Issue Date</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground xl:table-cell">Return Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedRecords.map((r) => {
                  const b = getSIMBreakdown(r);
                  return (
                    <tr key={r.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                      <td className="w-10 px-4 py-4 text-center">
                        <button onClick={() => toggleRecordSelect(r.id)} className="flex items-center justify-center">
                          {selectedIds.includes(r.id)
                            ? <CheckSquare size={16} className="text-brand-600" />
                            : <Square size={16} className="text-slate-300" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-mono text-sm font-medium text-foreground">{r.id}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                            <User size={14} className="text-brand-600" />
                          </div>
                          <p className="text-sm font-medium text-foreground">{r.issuedTo}</p>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 md:table-cell">
                        <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${r.issuedToRole === "DSO" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{r.issuedToRole}</span>
                      </td>
                      <td className="hidden px-4 py-4 font-mono text-sm text-muted-foreground lg:table-cell">{r.retailerId}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"><Package size={11} /> {b.total}</span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"><Check size={11} /> {b.activated}</span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"><Clock size={11} /> {b.balance}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-xs text-muted-foreground xl:table-cell">{formatDateDDMMYYYY(r.issueDate)}</td>
                      <td className="hidden px-4 py-4 text-xs text-muted-foreground xl:table-cell">{formatDateDDMMYYYY(r.returnDate)}</td>
                      <td className="px-4 py-4">
                        <StatusPill label={r.status} tone={toneForStatus(r.status)} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setShowViewModal(r)} className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50" title="View Details"><Eye size={14} /></button>
                          {r.status === "Issued" && (
                            <button onClick={() => openActionModal(r, "return")} className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-50" title="Return / Forward SIMs"><RotateCcw size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={pageCount} onChange={setPage} />
          {filteredRecords.length === 0 && (
            <EmptyState icon={Inbox} title="No records found" description="No issue records match your filters." />
          )}
        </CardContent>
      </Card>

      {/* Issue SIMs Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowIssueModal(false)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Issue SIMs</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Step {step} of 4</p>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X size={18} /></button>
            </div>

            {/* Step Progress */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= s ? "bg-brand-600 text-white" : "bg-slate-100 text-muted-foreground"}`}>
                      {step > s ? <Check size={12} /> : s}
                    </div>
                    {s < 4 && <div className={`mx-1 h-0.5 flex-1 ${step > s ? "bg-brand-600" : "bg-slate-100"}`} />}
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
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
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Select Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["DSO", "DSM"] as const).map((t) => (
                        <button key={t} onClick={() => { setIssueType(t); setSelectedPersonId(""); }}
                          className={`rounded-xl border-2 p-4 text-left transition-all ${issueType === t ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${issueType === t ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                              {t === "DSO" ? <Smartphone size={16} /> : <User size={16} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{t}</p>
                              <p className="text-xs text-muted-foreground">{t === "DSO" ? "Direct Sales Officer" : "Direct Sales Manager"}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Select Person</label>
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {people.filter((p) => p.status === "Active").map((p) => (
                        <button key={p.id} onClick={() => handlePersonSelect(p.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${selectedPersonId === p.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">{p.id}</p>
                          </div>
                          {selectedPersonId === p.id && <Check size={16} className="flex-shrink-0 text-brand-600" />}
                        </button>
                      ))}
                      {people.filter((p) => p.status === "Active").length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">No active {issueType} found</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select SIMs */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* SIM Type Tabs */}
                  <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
                    {(["new", "hlr"] as const).map((t) => {
                      const count = availableSIMs.filter((s) => s.type === t).length;
                      return (
                        <button key={t} onClick={() => { setSimTab(t); setSelectedSimIds([]); }}
                          className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${simTab === t ? "bg-white text-brand-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                          {t === "new" ? "New SIMs" : "HLR SIMs"} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Bulk Count Selector + Select All */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Show:</span>
                      {[10, 25, 50, 100].map((n) => (
                        <button key={n} onClick={() => { setBulkCount(n); setSelectedSimIds([]); }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${bulkCount === n ? "bg-brand-600 text-white" : "bg-slate-100 text-muted-foreground hover:bg-slate-200"}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <button onClick={selectAllVisible}
                      className="text-xs font-medium text-brand-600 hover:underline">
                      {visibleSIMs.every((s) => selectedSimIds.includes(s.id)) ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {/* SIM Search */}
                  <SearchInput
                    placeholder="Search by ICCID, SIM number, network or ID..."
                    value={simSearch}
                    onChange={(v) => setSimSearch(v)}
                  />

                  {/* SIM List */}
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {visibleSIMs.map((s) => (
                      <button key={s.id} onClick={() => toggleSim(s.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${selectedSimIds.includes(s.id) ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="flex-shrink-0">
                          {selectedSimIds.includes(s.id) ? <CheckSquare size={18} className="text-brand-600" /> : <Square size={18} className="text-slate-300" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-mono text-sm font-medium text-foreground">{s.iccid || "\u2014"}</p>
                            <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${s.network === "Jazz" ? "bg-red-50 text-red-600" : s.network === "Telenor" ? "bg-blue-50 text-blue-600" : s.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{s.network}</span>
                          </div>
                          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{s.simNumber} <span className="text-slate-300">|</span> {s.id}</p>
                        </div>
                      </button>
                    ))}
                    {visibleSIMs.length === 0 && (
                      <div className="py-8 text-center">
                        <Package size={24} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-sm text-muted-foreground">{simSearch ? "No SIMs match your search" : `No ${simTab === "new" ? "New" : "HLR"} SIMs in stock`}</p>
                      </div>
                    )}
                  </div>
                  {simSearch && (
                    <p className="text-xs text-muted-foreground">{simSearchResults.length} SIM(s) match &quot;{simSearch}&quot;</p>
                  )}
                  {selectedSimIds.length > 0 && (
                    <p className="text-xs font-medium text-brand-600">{selectedSimIds.length} SIM(s) selected</p>
                  )}
                </div>
              )}

              {/* Step 3: Auto-generated Retailer ID */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Retailer ID (Auto-generated)</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-mono text-lg font-bold text-foreground">{retailerId}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Based on {selectedPerson?.name}&apos;s mobile number</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-2">
                      <Smartphone size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Issue Summary</p>
                        <p className="mt-1 text-xs text-blue-600">
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
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Notes (Optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Add any notes about this issue..." className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-foreground focus:border-brand-600 focus:outline-none" />
                  </div>
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-foreground">Confirmation</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-muted-foreground">Issued To:</span> <span className="ml-1 font-medium text-foreground">{selectedPerson?.name}</span></div>
                      <div><span className="text-muted-foreground">Role:</span> <span className="ml-1 font-medium text-foreground">{issueType}</span></div>
                      <div><span className="text-muted-foreground">Retailer ID:</span> <span className="ml-1 font-mono font-medium text-foreground">{retailerId}</span></div>
                      <div><span className="text-muted-foreground">SIMs:</span> <span className="ml-1 font-medium text-foreground">{selectedSimIds.length}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              {step > 1 && (
                <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>
              )}
              <div className="flex-1" />
              {step === 1 && (
                <Button onClick={() => selectedPersonId && setStep(2)} disabled={!selectedPersonId}>
                  Next <ArrowRight size={14} />
                </Button>
              )}
              {step === 2 && (
                <Button onClick={handleProceedToRetailer} disabled={selectedSimIds.length === 0}>
                  Next <ArrowRight size={14} />
                </Button>
              )}
              {step === 3 && (
                <Button onClick={handleProceedToNotes}>
                  Next <ArrowRight size={14} />
                </Button>
              )}
              {step === 4 && (
                <Button onClick={handleIssueSubmit}>
                  <Check size={14} /> Confirm Issue
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowViewModal(null)}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">Issue Details</h3>
              <button onClick={() => setShowViewModal(null)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Issue ID</p><p className="font-mono text-sm font-medium text-foreground">{showViewModal.id}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Status</p><StatusPill label={showViewModal.status} tone={toneForStatus(showViewModal.status)} /></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Issued To</p><p className="text-sm font-medium text-foreground">{showViewModal.issuedTo}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Role</p><span className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${showViewModal.issuedToRole === "DSO" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{showViewModal.issuedToRole}</span></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Retailer ID</p><p className="font-mono text-sm font-medium text-foreground">{showViewModal.retailerId}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Issue Date</p><p className="text-sm text-foreground">{formatDateDDMMYYYY(showViewModal.issueDate)}</p></div>
                <div className="rounded-lg bg-slate-50 p-3"><p className="mb-1 text-xs text-muted-foreground">Return Date</p><p className="text-sm text-foreground">{formatDateDDMMYYYY(showViewModal.returnDate)}</p></div>
              </div>
              {showViewModal.notes && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Notes</p>
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-foreground">{showViewModal.notes}</p>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Issued SIMs ({showViewModal.simIds.length})</p>
                <div className="max-h-40 space-y-1.5 overflow-y-auto">
                  {showViewModal.simIds.map((simId) => {
                    const sim = sims.find((s) => s.id === simId);
                    return (
                      <div key={simId} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
                        <Package size={14} className="flex-shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs font-medium text-foreground">{sim?.iccid || simId}</p>
                          <p className="truncate font-mono text-[10px] text-muted-foreground">{sim?.simNumber || ""} <span className="text-slate-300">|</span> {simId}</p>
                        </div>
                        {sim && (
                          <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${sim.network === "Jazz" ? "bg-red-50 text-red-600" : sim.network === "Telenor" ? "bg-blue-50 text-blue-600" : sim.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{sim.network}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Return / Forward Action Modal */}
      {showActionModal && actionRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowActionModal(false)}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${actionMode === "forward" ? "bg-blue-50" : "bg-green-50"}`}>
                  {actionMode === "forward" ? <ArrowRight size={18} className="text-blue-600" /> : <RotateCcw size={18} className="text-green-600" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{actionMode === "forward" ? "Forward SIMs" : "Return SIMs"}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Issued to {actionRecord.issuedTo} ({actionRecord.issuedToRole}) &middot; {actionRecord.id}</p>
                </div>
              </div>
              <button onClick={() => setShowActionModal(false)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="space-y-4 p-6">
              {actionMode === "forward" ? (
                <>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Forward To</label>
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      {(["DSO", "DSM"] as const).map((t) => (
                        <button key={t} onClick={() => { setForwardType(t); setForwardPersonId(""); }}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${forwardType === t ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${forwardType === t ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                              {t === "DSO" ? <Smartphone size={14} /> : <User size={14} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">{t}</p>
                              <p className="text-[10px] text-muted-foreground">{t === "DSO" ? "Sales Officer" : "Sales Manager"}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {(forwardType === "DSO" ? dso : dsms).filter((p) => p.status === "Active").map((p) => (
                        <button key={p.id} onClick={() => setForwardPersonId(p.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${forwardPersonId === p.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">{p.id}</p>
                          </div>
                          {forwardPersonId === p.id && <Check size={16} className="flex-shrink-0 text-brand-600" />}
                        </button>
                      ))}
                      {(forwardType === "DSO" ? dso : dsms).filter((p) => p.status === "Active").length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">No active {forwardType} found</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-2">
                      <Smartphone size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Forwarding {actionSimIds.length} SIM(s)</p>
                        <p className="mt-1 text-xs text-blue-600">The selected SIMs will be transferred to the person above with a new retailer ID. A new issue record will be created.</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Select SIMs to return</p>
                    <button onClick={toggleAllActionSims} className="text-xs font-medium text-brand-600 hover:underline">
                      {actionSimIds.length === actionBalanceIds.length && actionBalanceIds.length > 0 ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  {actionBalanceIds.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 py-8 text-center">
                      <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium text-foreground">All SIMs in this issue are already activated</p>
                      <p className="mt-1 text-xs text-muted-foreground">Activated SIMs are delivered to clients and cannot be returned.</p>
                    </div>
                  ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {actionBalanceIds.map((simId) => {
                      const sim = sims.find((s) => s.id === simId);
                      return (
                        <button key={simId} onClick={() => toggleActionSim(simId)}
                          className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${actionSimIds.includes(simId) ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex-shrink-0">
                            {actionSimIds.includes(simId) ? <CheckSquare size={18} className="text-brand-600" /> : <Square size={18} className="text-slate-300" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-mono text-sm font-medium text-foreground">{sim?.iccid || simId}</p>
                              {sim?.network && (
                                <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${sim.network === "Jazz" ? "bg-red-50 text-red-600" : sim.network === "Telenor" ? "bg-blue-50 text-blue-600" : sim.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{sim.network}</span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{sim?.simNumber || ""}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  )}
                  {actionBalanceIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">{actionSimIds.length} of {actionBalanceIds.length} SIM(s) selected</p>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              {actionMode === "return" ? (
                <>
                  <Button variant="secondary" onClick={() => setShowActionModal(false)}>Cancel</Button>
                  <div className="flex-1" />
                  <Button variant="secondary" onClick={() => { setActionMode("forward"); setForwardPersonId(""); }} disabled={actionSimIds.length === 0}>
                    <ArrowRight size={14} /> Forward Selected ({actionSimIds.length})
                  </Button>
                  <Button variant="destructive" onClick={handleReturnConfirm} disabled={actionSimIds.length === 0}>
                    <RotateCcw size={14} /> {actionSimIds.length === actionBalanceIds.length && actionBalanceIds.length > 0 ? "Return All" : "Return Selected"} ({actionSimIds.length})
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setActionMode("return")}>Back</Button>
                  <div className="flex-1" />
                  <Button onClick={handleForwardConfirm} disabled={!forwardPersonId || actionSimIds.length === 0}>
                    <Check size={14} /> Confirm Forward ({actionSimIds.length})
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <Card className="w-full max-w-sm p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="mb-2 text-base font-semibold text-foreground">Delete {selectedIds.length} Record(s)?</h3>
            <p className="mb-6 text-sm text-muted-foreground">This will permanently delete these issue records. SIMs will be set back to stock.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDeleteSelected}><Trash2 size={14} /> Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
