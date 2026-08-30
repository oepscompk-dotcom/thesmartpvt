"use client";

import React, { useState, useEffect } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import { VerifyConfirmPopup, VerifySuccessPopup } from "@/lib/VerifyPopup";
import { apiLoad, apiSave, apiUpdate } from "@/lib/api";
import {
  RefreshCw, X, CheckCircle, Clock, ArrowRight, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill, QuickChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

interface ReplacementForm {
  customerName: string;
  customerCNIC: string;
  customerMobile: string;
  lostSimNumber: string;
  newSimNumber: string;
  network: string;
  iccid: string;
  reason: string;
}

interface SIMStock {
  id: string;
  iccid: string;
  simNumber: string;
  network: string;
  status: string;
  deviceId: string;
  retailerId?: string;
  type?: "new" | "hlr";
  issuedToId?: string;
}

const NETWORKS = ["Telenor", "Jazz", "Ufone", "Zong"];
const REASONS = ["Lost", "Damaged", "Stolen"];
const PAGE_SIZE = 10;

const initialForm: ReplacementForm = {
  customerName: "",
  customerCNIC: "",
  customerMobile: "",
  lostSimNumber: "",
  newSimNumber: "",
  network: "",
  iccid: "",
  reason: "",
};

export default function ReplacementPage() {
  const { activations, addActivation, updateActivation, deleteActivation, device, auth } = useDSOData();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ReplacementForm>(initialForm);
  const [filter, setFilter] = useState("All");
  const [simSearch, setSimSearch] = useState("");
  const [simStockList, setSimStockList] = useState<SIMStock[]>([]);
  const [selectedSimId, setSelectedSimId] = useState("");
  const [selectedFranchiseSimId, setSelectedFranchiseSimId] = useState("");

  useEffect(() => {
    if (!auth.franchiseId) return;
    (async () => {
      const allSims = await apiLoad("sim", auth.franchiseId);
      const sims = Array.isArray(allSims) ? allSims : [];
      const mySims = sims.filter((s: SIMStock) => s.issuedToId === auth.dsoId && s.status === "Issued" && s.type === "hlr");
      setSimStockList(mySims);
    })();
  }, [auth.dsoId, auth.franchiseId]);

  const filteredSims = simStockList.filter(
    (s) => filter === "All" || s.network === filter
  );

  const searchFilteredSims = filteredSims.filter((s) => {
    if (!simSearch) return true;
    const q = simSearch.toLowerCase();
    return (s.iccid || "").toLowerCase().includes(q) ||
      (s.simNumber || "").toLowerCase().includes(q) ||
      (s.network || "").toLowerCase().includes(q);
  });

  const handleSimSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const simId = e.target.value;
    setSelectedSimId(simId);
    if (!simId) {
      setSelectedFranchiseSimId("");
      setForm((p) => ({
        ...p,
        newSimNumber: "",
        iccid: "",
        network: "",
      }));
      return;
    }
    const sim = simStockList.find((s) => s.id === simId);
    if (sim) {
      setSelectedFranchiseSimId(simId);
      setForm((p) => ({
        ...p,
        newSimNumber: sim.simNumber,
        iccid: sim.iccid,
        network: sim.network,
      }));
    }
  };

  const updateFranchiseSIMStatus = async (simNumber: string, newStatus: string) => {
    try {
      const sims = await apiLoad("sim", auth.franchiseId);
      if (Array.isArray(sims)) {
        const sim = sims.find((s: any) => s.simNumber === simNumber);
        if (sim) {
          await apiUpdate("sim", sim.id, { ...sim, status: newStatus });
        }
      }
    } catch {}
  };

  const isSIMInPipeline = async (simNumber: string): Promise<boolean> => {
    try {
      const [dsoActs, dsmActs] = await Promise.all([
        apiLoad("dsoActivation", auth.franchiseId),
        apiLoad("dsmActivation", auth.franchiseId),
      ]);
      for (const acts of [dsoActs, dsmActs]) {
        if (Array.isArray(acts)) {
          const found = acts.find((a: any) => a.simNumber === simNumber && a.status !== "Completed" && a.status !== "Rejected");
          if (found) return true;
        }
      }
    } catch {}
    return false;
  };

  const replacements = activations.filter((a) => a.type === "Replacement");

  const filtered =
    filter === "All"
      ? replacements
      : replacements.filter((a) => a.status === filter);

  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const pagedFiltered = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!selectedSimId || !form.reason) return;
    const simNum = form.newSimNumber;
    if (await isSIMInPipeline(simNum || "")) {
      alert("This SIM is already in a verification pipeline (BVS/FCA/IFCA). Cannot submit until the current process is completed.");
      return;
    }
    const customerName = form.customerName.trim() || "XXXXX";
    const customerCNIC = form.customerCNIC.trim() || "XXXXX-YYYYYYY-X";
    const customerMobile = form.customerMobile.trim() || "03XX-XXXXXXX";

    const sim = simStockList.find((s) => s.id === selectedSimId);
    await addActivation({
      id: `REPL-${Date.now()}`,
      type: "Replacement",
      simId: `SIM-${Date.now()}`,
      simNumber: simNum,
      network: form.network,
      iccid: form.iccid,
      deviceId: device?.id ?? "",
      customerName,
      customerCNIC,
      customerMobile,
      retailerId: sim?.retailerId || "",
      status: "Pending BVS",
      bvsStatus: "Pending",
      bvsDate: "",
      bvsNotes: "",
      fcaStatus: "Pending",
      fcaDate: "",
      fcaNotes: "",
      ifcaStatus: "Pending",
      ifcaDate: "",
      ifcaNotes: "",
      progress: 0,
      createdAt: new Date().toISOString(),
      dsoId: auth.dsoId || "",
      franchiseId: auth.franchiseId || "",
    });
    await updateFranchiseSIMStatus(simNum || "", "Activated");
    setSimStockList((prev) => prev.filter((s) => s.simNumber !== simNum));
    setForm(initialForm);
    setSelectedSimId("");
    setShowModal(false);
    alert("Activation submitted successfully! SIM is now pending verification (BVS â†’ FCA â†’ IFCA)");
  };

  const [verifyConfirm, setVerifyConfirm] = useState<{ step: string; simNumber: string; activation: any } | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const handleVerifyStep = (a: any) => {
    let step = "";
    if (a.bvsStatus !== "Completed") step = "BVS";
    else if (a.fcaStatus !== "Completed") step = "FCA";
    else if (a.ifcaStatus !== "Completed") step = "IFCA";
    if (!step) return;
    setVerifyConfirm({ step, simNumber: a.simNumber, activation: a });
  };

  const doVerifyConfirm = async () => {
    if (!verifyConfirm) return;
    const { step, activation } = verifyConfirm;
    const now = new Date().toISOString();
    let updates: any = {};
    if (step === "BVS") updates = { bvsStatus: "Completed", bvsDate: now };
    else if (step === "FCA") updates = { fcaStatus: "Completed", fcaDate: now };
    else if (step === "IFCA") updates = { ifcaStatus: "Completed", ifcaDate: now };
    setVerifyConfirm(null);
    await updateActivation(activation.id, updates);
    const nextStep = step === "BVS" ? "FCA" : step === "FCA" ? "IFCA" : null;
    setVerifySuccess(nextStep ? `${step} Verified! Status updated to Pending ${nextStep}.` : `${step} Verified! All verification completed.`);
  };

  const verifyLabel = (a: any) => {
    if (a.bvsStatus !== "Completed") return { label: "Verify BVS", color: "bg-amber-500 hover:bg-amber-600" };
    if (a.fcaStatus !== "Completed") return { label: "Verify FCA", color: "bg-blue-500 hover:bg-blue-600" };
    if (a.ifcaStatus !== "Completed") return { label: "Verify IFCA", color: "bg-purple-500 hover:bg-purple-600" };
    return null;
  };

  const vcVal = (simNumber: string, field: "bvs" | "fca" | "ifca", fallback: string) => {
    return fallback === "Completed" ? "0" : "X";
  };
  const vcBg = (v: string) => v === "0" || v === "1" ? "bg-green-100 text-green-700" : v === "X" ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-400";
  const derivedStatus = (a: any) => {
    const bvs = a.bvsStatus === "Completed" ? "0" : "X";
    const fca = a.fcaStatus === "Completed" ? "0" : "X";
    const ifcaV = a.ifcaStatus === "Completed" ? "0" : "X";
    const vals = { BVS: bvs, FCA: fca, IFCA: ifcaV };
    const xItems = Object.entries(vals).filter(([, v]) => v === "X").map(([k]) => k);
    if (bvs === "X" && fca === "X" && ifcaV === "X") return "Issued";
    if (xItems.length > 0) return `Pending ${xItems.join(", ")} (${xItems.length})`;
    if (bvs === "0" && fca === "0" && ifcaV === "0") return "Completed";
    return "Pending-V";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "SIM Replacement" }]}
          title="SIM Replacement"
          description="Replace lost, damaged or stolen SIMs"
          actions={
            <Button onClick={() => setShowModal(true)}>
              <RefreshCw size={16} /> <span className="hidden sm:inline">New Replacement</span>
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Replacements" value={replacements.length} icon={RefreshCw} />
          <StatCard label="Pending Verification" value={replacements.filter((a) => a.status !== "Completed").length} icon={Clock} iconClass="text-amber-600 bg-amber-50" />
          <StatCard label="Completed" value={replacements.filter((a) => a.status === "Completed").length} icon={CheckCircle} iconClass="text-green-600 bg-green-50" />
        </div>

        <Card>
          <div className="px-4 py-4 sm:px-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Replacement Workflow</h2>
            <div className="flex items-center justify-between">
              {["BVS", "FCA", "IFCA", "Complete"].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-300 text-sm font-bold text-brand-700">
                      {i + 1}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{step}</span>
                  </div>
                  {i < 3 && <ArrowRight className="h-5 w-5 text-slate-300" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          {["All", "Pending BVS", "Pending FCA", "Pending IFCA", "Completed"].map((f) => (
            <QuickChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground w-14">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">CNIC</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden lg:table-cell">SIM Number</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Network</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">BVS</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">FCA</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">IFCA</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground hidden md:table-cell">Progress</th>
                  <th className="text-center px-3 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedFiltered.map((a, idx) => (
                  <tr key={a.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">{(page - 1) * PAGE_SIZE + idx + 1}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{a.customerName}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.customerCNIC}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">{(a as any).reason || "Lost"}</span>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-sm font-medium text-foreground lg:table-cell">{a.simNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${a.network === "Jazz" ? "bg-red-50 text-red-600" : a.network === "Telenor" ? "bg-blue-50 text-blue-600" : a.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{a.network}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill label={derivedStatus(a)} tone={derivedStatus(a) === "Completed" || derivedStatus(a) === "Verified" ? "positive" : "warning"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${vcBg(vcVal(a.simNumber, "bvs", a.bvsStatus))}`}>{vcVal(a.simNumber, "bvs", a.bvsStatus)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${vcBg(vcVal(a.simNumber, "fca", a.fcaStatus))}`}>{vcVal(a.simNumber, "fca", a.fcaStatus)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${vcBg(vcVal(a.simNumber, "ifca", a.ifcaStatus))}`}>{vcVal(a.simNumber, "ifca", a.ifcaStatus)}</span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 flex-1 rounded-full bg-slate-200">
                          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${a.progress}%`, backgroundColor: a.progress === 100 ? "#10b981" : "#2563eb" }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{a.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {verifyLabel(a) && (
                          <button onClick={() => handleVerifyStep(a)} className={`rounded-lg px-2 py-1 text-[10px] font-bold text-white transition-all ${verifyLabel(a)!.color}`}>{verifyLabel(a)!.label}</button>
                        )}
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this replacement?")) deleteActivation(a.id); }} className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagedFiltered.length === 0 && (
            <EmptyState icon={RefreshCw} title="No replacement activations found" description="Create a new replacement or adjust your filters." />
          )}
          {filtered.length > 0 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </Card>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="bg-white mx-4 w-full max-w-lg rounded-lg border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-semibold text-foreground">SIM Replacement</h3>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto space-y-4 px-6 py-4">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 py-2">
                  {[
                    { step: 1, label: "Select SIM", current: !selectedSimId },
                    { step: 2, label: "Fill Details", current: !!selectedSimId },
                    { step: 3, label: "Submit", current: false },
                  ].map((s, i) => (
                    <React.Fragment key={s.step}>
                      <div className="flex items-center gap-1.5">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          s.current ? "bg-brand-600 text-white" : selectedSimId ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-500"
                        }`}>
                          {selectedSimId && !s.current ? (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          ) : s.step}
                        </div>
                        <span className={`hidden text-xs font-medium sm:inline ${s.current ? "text-brand-700" : "text-slate-400"}`}>{s.label}</span>
                      </div>
                      {i < 2 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                    </React.Fragment>
                  ))}
                </div>

                {/* Group 1: SIM Stock Selection */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Select SIM from Stock *</label>
                  <SearchInput placeholder="Search by ICCID, SIM number or network..." value={simSearch} onSearch={setSimSearch} className="mb-2" />
                  <Select
                    value={selectedSimId}
                    onChange={handleSimSelect}
                    className="h-11 border-2"
                  >
                    <option value="">-- {searchFilteredSims.length > 0 ? "Choose a SIM" : "No SIM matches search"} --</option>
                    {searchFilteredSims.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.simNumber} | {s.network} | {s.iccid}
                      </option>
                    ))}
                  </Select>
                  {simSearch && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{searchFilteredSims.length} SIM(s) found</p>
                  )}
                </div>

                {/* Selected SIM Info Card */}
                {selectedSimId && form.newSimNumber && (
                  <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">Selected SIM</p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">SIM Number</span>
                        <p className="font-medium text-brand-700">{form.newSimNumber}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Network</span>
                        <p className="font-medium text-brand-700">{form.network}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">ICCID</span>
                        <p className="break-all text-xs font-medium text-brand-700">{form.iccid}</p>
                      </div>
                    </div>
                  </div>
                )}

                <hr className="border-slate-200" />

                {/* Group 2: SIM Details (auto-filled, editable) */}
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SIM Details</p>
                {[
                  { name: "lostSimNumber", label: "Lost SIM Number" },
                  { name: "newSimNumber", label: "New SIM Number" },
                  { name: "iccid", label: "ICCID" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                    <Input
                      name={f.name}
                      value={(form as unknown as Record<string, string>)[f.name] || ""}
                      onChange={handleChange}
                      className="bg-white"
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Network</label>
                  <Select name="network" value={form.network} disabled className="cursor-not-allowed bg-slate-100 text-muted-foreground">
                    <option value="">Select Network</option>
                    {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Reason *</label>
                  <Select name="reason" value={form.reason} onChange={handleChange}>
                    <option value="">Select Reason</option>
                    {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </div>

                <hr className="border-slate-200" />

                {/* Group 3: Customer Info (optional) */}
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer Info (Optional)</p>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Customer Name</label>
                  <Input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="XXXXX"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">CNIC</label>
                  <Input
                    name="customerCNIC"
                    value={form.customerCNIC}
                    onChange={handleChange}
                    placeholder="XXXXX-YYYYYYY-X"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Contact Number</label>
                  <Input
                    name="customerMobile"
                    value={form.customerMobile}
                    onChange={handleChange}
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="w-full sm:w-auto" onClick={handleSubmit}>
                  <CheckCircle className="h-4 w-4" /> Save Replacement
                </Button>
              </div>
            </div>
          </div>
        )}
        {verifyConfirm && (
          <VerifyConfirmPopup step={verifyConfirm.step} simNumber={verifyConfirm.simNumber} onConfirm={doVerifyConfirm} onCancel={() => setVerifyConfirm(null)} />
        )}
        {verifySuccess && (
          <VerifySuccessPopup message={verifySuccess} onClose={() => setVerifySuccess(null)} />
        )}
    </div>
  );
}
