"use client";

import React, { useState, useEffect } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { VerifyConfirmPopup, VerifySuccessPopup } from "@/lib/VerifyPopup";
import { apiLoad, apiUpdate } from "@/lib/api";
import {
  RefreshCw, X, ArrowRight, ArrowLeft, CheckCircle, Trash2, Search,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusPill, QuickChip } from "@/components/ui/Badge";

interface ReplacementForm {
  customerName: string;
  customerCNIC: string;
  customerMobile: string;
  lostSimNumber: string;
  newSimNumber: string;
  network: string;
  iccid: string;
  reason: string;
  deviceId: string;
  retailerId: string;
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

const initialForm: ReplacementForm = {
  customerName: "",
  customerCNIC: "",
  customerMobile: "",
  lostSimNumber: "",
  newSimNumber: "",
  network: "",
  iccid: "",
  reason: "",
  deviceId: "",
  retailerId: "",
};

export default function ReplacementPage() {
  const { activations, addActivation, updateActivation, deleteActivation, auth } = useDSMData();
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
      const mySims = sims.filter((s: SIMStock) => s.issuedToId === auth.dsmId && s.status === "Issued" && s.type === "hlr");
      setSimStockList(mySims);
    })();
  }, [auth.dsmId, auth.franchiseId]);

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
        deviceId: "",
        retailerId: "",
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
        deviceId: sim.deviceId,
        retailerId: sim.retailerId || "",
      }));
    }
  };

  const updateFranchiseSIMStatus = async (simNumber: string, newStatus: string) => {
    try {
      if (!auth.franchiseId) return;
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
      if (!auth.franchiseId) return false;
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

    await addActivation({
      id: `REPL-${Date.now()}`,
      type: "Replacement",
      simId: `SIM-${Date.now()}`,
      simNumber: simNum,
      network: form.network,
      iccid: form.iccid,
      deviceId: form.deviceId,
      customerName,
      customerCNIC,
      customerMobile,
      contactNumber: customerMobile,
      retailerId: form.retailerId,
      reason: form.reason,
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
      dsmId: auth.dsmId,
      dsoId: auth.dsmId || "",
      franchiseId: auth.franchiseId,
    } as any);
    await updateFranchiseSIMStatus(simNum || "", "Activated");
    setSimStockList((prev) => prev.filter((s) => s.simNumber !== simNum));
    setForm(initialForm);
    setSelectedSimId("");
    setShowModal(false);
    alert("Activation submitted successfully! SIM is now pending verification (BVS → FCA → IFCA)");
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
    if (a.bvsStatus !== "Completed") return { label: "Verify BVS", cls: "bg-amber-500 hover:bg-amber-600" };
    if (a.fcaStatus !== "Completed") return { label: "Verify FCA", cls: "bg-blue-500 hover:bg-blue-600" };
    if (a.ifcaStatus !== "Completed") return { label: "Verify IFCA", cls: "bg-purple-500 hover:bg-purple-600" };
    return null;
  };

  const vcVal = (simNumber: string, field: "bvs" | "fca" | "ifca", fallback: string) => {
    return fallback === "Completed" ? "0" : "X";
  };
  const vcBg = (v: string) => v === "0" || v === "1" ? "bg-green-100 text-green-700" : v === "X" ? "bg-slate-100 text-slate-400" : "bg-red-50 text-red-400";
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
  const networkPill = (network: string) => {
    switch (network) {
      case "Jazz":
        return "bg-red-50 text-red-600";
      case "Telenor":
        return "bg-blue-50 text-blue-600";
      case "Ufone":
        return "bg-green-50 text-green-600";
      default:
        return "bg-cyan-50 text-cyan-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <PageHeader
          breadcrumb={[{ label: "DSM" }, { label: "Activations" }, { label: "Replacement" }]}
          title="SIM Replacement"
          description="Replace lost, damaged or stolen SIMs"
          actions={
            <Button onClick={() => setShowModal(true)}>
              <RefreshCw className="h-4 w-4" /> <span className="hidden sm:inline">New Replacement</span>
            </Button>
          }
        />
      </div>

      <Card>
        <div className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Replacement Workflow</h2>
          <div className="flex items-center justify-between">
            {["BVS", "FCA", "IFCA", "Complete"].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-600 text-sm font-bold text-brand-700">
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

      <div className="flex items-center gap-2 flex-wrap">
        {["All", "Pending BVS", "Pending FCA", "Pending IFCA", "Completed"].map((f) => (
          <QuickChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-center px-3 py-3 text-muted-foreground text-xs font-medium uppercase w-14">#</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase">CNIC</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase">Reason</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase hidden lg:table-cell">SIM Number</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase">Network</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase">Status</th>
                <th className="text-center px-3 py-3 text-muted-foreground text-xs font-medium uppercase">BVS</th>
                <th className="text-center px-3 py-3 text-muted-foreground text-xs font-medium uppercase">FCA</th>
                <th className="text-center px-3 py-3 text-muted-foreground text-xs font-medium uppercase">IFCA</th>
                <th className="text-left px-4 py-3 text-muted-foreground text-xs font-medium uppercase hidden md:table-cell">Progress</th>
                <th className="text-center px-3 py-3 text-muted-foreground text-xs font-medium uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <RefreshCw size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-muted-foreground">No replacement activations found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((a, idx) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-700 text-xs font-black">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-sm text-foreground">{a.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{a.customerCNIC}</td>
                    <td className="px-4 py-3">
                      <StatusPill label={(a as any).reason || "Lost"} tone="negative" />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm font-mono font-medium text-foreground">{a.simNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${networkPill(a.network)}`}>{a.network}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill label={derivedStatus(a)} tone={derivedStatus(a) === "Completed" || derivedStatus(a) === "Verified" ? "positive" : "warning"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${vcBg(vcVal(a.simNumber, "bvs", a.bvsStatus))}`}>{vcVal(a.simNumber, "bvs", a.bvsStatus)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${vcBg(vcVal(a.simNumber, "fca", a.fcaStatus))}`}>{vcVal(a.simNumber, "fca", a.fcaStatus)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${vcBg(vcVal(a.simNumber, "ifca", a.ifcaStatus))}`}>{vcVal(a.simNumber, "ifca", a.ifcaStatus)}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 w-20">
                          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${a.progress}%`, backgroundColor: a.progress === 100 ? "#10b981" : "#2563eb" }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{a.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {verifyLabel(a) && (
                          <button onClick={() => handleVerifyStep(a)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all ${verifyLabel(a)!.cls}`}>{verifyLabel(a)!.label}</button>
                        )}
                        <Button size="sm" variant="outline">View</Button>
                        <button onClick={() => { if (confirm("Delete this replacement?")) deleteActivation(a.id); }} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-foreground">SIM Replacement</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
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
                        s.current ? 'bg-brand-600 text-white' : selectedSimId ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {selectedSimId && !s.current ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : s.step}
                      </div>
                      <span className={`text-xs font-medium hidden sm:inline ${s.current ? 'text-brand-700' : 'text-muted-foreground'}`}>{s.label}</span>
                    </div>
                    {i < 2 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Group 1: SIM Stock Selection */}
              <div>
                <label className="block mb-1 text-xs font-medium text-muted-foreground">Select SIM from Stock *</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={simSearch}
                    onChange={(e) => setSimSearch(e.target.value)}
                    placeholder="Search by ICCID, SIM number or network..."
                    className="pl-9 pr-8"
                  />
                  {simSearch && <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" onClick={() => setSimSearch("")} />}
                </div>
                <Select
                  value={selectedSimId}
                  onChange={handleSimSelect}
                  className="h-11"
                >
                  <option value="">-- {searchFilteredSims.length > 0 ? "Choose a SIM" : "No SIM matches search"} --</option>
                  {searchFilteredSims.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.simNumber} | {s.network} | {s.iccid}
                    </option>
                  ))}
                </Select>
                {simSearch && (
                  <p className="text-xs text-muted-foreground mt-1.5">{searchFilteredSims.length} SIM(s) found</p>
                )}
              </div>

              {/* Selected SIM Info Card */}
              {selectedSimId && form.newSimNumber && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">Selected SIM</p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">SIM Number</span>
                      <p className="font-medium text-foreground">{form.newSimNumber}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Network</span>
                      <p className="font-medium text-foreground">{form.network}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">ICCID</span>
                      <p className="font-medium text-foreground text-xs break-all">{form.iccid}</p>
                    </div>
                  </div>
                </div>
              )}

              <hr className="border-slate-100" />

              {/* Group 2: SIM Details (auto-filled, editable) */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SIM Details</p>
              {[
                { name: "lostSimNumber", label: "Lost SIM Number" },
                { name: "newSimNumber", label: "New SIM Number" },
                { name: "iccid", label: "ICCID" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block mb-1 text-xs font-medium text-muted-foreground">{f.label}</label>
                  <Input
                    name={f.name}
                    value={(form as unknown as Record<string, string>)[f.name] || ""}
                    onChange={handleChange}
                    className="bg-slate-50"
                  />
                </div>
              ))}
              <div>
                <label className="block mb-1 text-xs font-medium text-muted-foreground">Network</label>
                <Select
                  name="network"
                  value={form.network}
                  disabled
                  className="bg-slate-100 text-muted-foreground cursor-not-allowed"
                >
                  <option value="">Select Network</option>
                  {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-muted-foreground">Reason *</label>
                <Select name="reason" value={form.reason} onChange={handleChange}>
                  <option value="">Select Reason</option>
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
              </div>

              <hr className="border-slate-100" />

              {/* Group 3: Customer Info (optional) */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer Info (Optional)</p>
              <div>
                <label className="block mb-1 text-xs font-medium text-muted-foreground">Customer Name</label>
                <Input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="XXXXX"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-muted-foreground">CNIC</label>
                <Input
                  name="customerCNIC"
                  value={form.customerCNIC}
                  onChange={handleChange}
                  placeholder="XXXXX-YYYYYYY-X"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-muted-foreground">Contact Number</label>
                <Input
                  name="customerMobile"
                  value={form.customerMobile}
                  onChange={handleChange}
                  placeholder="03XX-XXXXXXX"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
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