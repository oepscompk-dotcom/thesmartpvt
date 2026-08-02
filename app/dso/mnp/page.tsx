"use client";

import React, { useState, useEffect } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import { VerifyConfirmPopup, VerifySuccessPopup } from "@/lib/VerifyPopup";
import { apiLoad, apiSave, apiUpdate } from "@/lib/api";
import {
  ArrowLeftRight, X, Filter, CheckCircle, Clock, AlertCircle, ArrowRight, ArrowLeft, Trash2,
} from "lucide-react";

interface MNPForm {
  customerName: string;
  customerCNIC: string;
  customerMobile: string;
  currentNetwork: string;
  newNetwork: string;
  simNumber: string;
  iccid: string;
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

const initialForm: MNPForm = {
  customerName: "",
  customerCNIC: "",
  customerMobile: "",
  currentNetwork: "",
  newNetwork: "",
  simNumber: "",
  iccid: "",
};

export default function MNPPage() {
  const { activations, addActivation, updateActivation, deleteActivation, device, auth } = useDSOData();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<MNPForm>(initialForm);
  const [filter, setFilter] = useState("All");
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

  const handleSimSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const simId = e.target.value;
    setSelectedSimId(simId);
    if (!simId) {
      setSelectedFranchiseSimId("");
      setForm((p) => ({
        ...p,
        simNumber: "",
        iccid: "",
        newNetwork: "",
      }));
      return;
    }
    const sim = simStockList.find((s) => s.id === simId);
    if (sim) {
      setSelectedFranchiseSimId(simId);
      setForm((p) => ({
        ...p,
        simNumber: sim.simNumber,
        iccid: sim.iccid,
        newNetwork: sim.network,
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

  const mnpActivations = activations.filter((a) => a.type === "MNP");

  const filtered =
    filter === "All"
      ? mnpActivations
      : mnpActivations.filter((a) => a.status === filter);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!selectedSimId || !form.currentNetwork) return;
    if (form.currentNetwork === form.newNetwork) return;
    const simNum = form.simNumber;
    if (await isSIMInPipeline(simNum || "")) {
      alert("This SIM is already in a verification pipeline (BVS/FCA/IFCA). Cannot submit until the current process is completed.");
      return;
    }
    const customerName = form.customerName.trim() || "XXXXX";
    const customerCNIC = form.customerCNIC.trim() || "XXXXX-YYYYYYY-X";
    const customerMobile = form.customerMobile.trim() || "03XX-XXXXXXX";

    await addActivation({
      id: `MNP-${Date.now()}`,
      type: "MNP",
      simId: `SIM-${Date.now()}`,
      simNumber: simNum,
      network: form.newNetwork,
      iccid: form.iccid,
      deviceId: device?.id ?? "",
      customerName,
      customerCNIC,
      customerMobile,
      retailerId: "",
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

  const statusColor = (s: string) => {
    if (s === "Completed") return "bg-emerald-100 text-emerald-700";
    if (s.includes("BVS")) return "bg-amber-100 text-amber-700";
    if (s.includes("FCA")) return "bg-blue-100 text-blue-700";
    if (s.includes("IFCA")) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-600";
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 rounded-lg hover:bg-gray-100 transition min-h-[48px] min-w-[48px] flex items-center justify-center shrink-0">
            <ArrowLeft className="h-5 w-5" style={{ color: "#0A2647" }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#0A2647" }}>
              <ArrowLeftRight className="inline-block mr-2 h-5 w-5 sm:h-6 sm:w-6" style={{ color: "#C8A951" }} />
              MNP (Mobile Number Portability)
            </h1>
            <p className="text-sm text-gray-500 mt-1">Port numbers across networks</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm min-h-[48px]"
            style={{ backgroundColor: "#0A2647" }}
          >
            <ArrowLeftRight className="h-4 w-4" /> <span className="hidden sm:inline">New MNP</span>
          </button>
        </div>

        {/* Workflow */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#0A2647" }}>MNP Workflow</h2>
          <div className="flex items-center justify-between">
            {["BVS", "FCA", "IFCA", "Complete"].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold"
                    style={{ borderColor: "#C8A951", color: "#0A2647" }}>
                    {i + 1}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{step}</span>
                </div>
                {i < 3 && <ArrowRight className="h-5 w-5 text-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          {["All", "Pending BVS", "Pending FCA", "Pending IFCA", "Completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                filter === f
                  ? "text-white border-transparent"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
              style={filter === f ? { backgroundColor: "#0A2647" } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase w-14">#</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">CNIC</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">SIM Number</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Network</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">BVS</th>
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">FCA</th>
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">IFCA</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Progress</th>
                  <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No MNP activations found</td>
                  </tr>
                ) : (
                  filtered.map((a, idx) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm text-gray-900">{a.customerName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{a.customerCNIC}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-900 text-sm font-mono font-medium">{a.simNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.network === "Jazz" ? "bg-red-50 text-red-600" : a.network === "Telenor" ? "bg-blue-50 text-blue-600" : a.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{a.network}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${derivedStatus(a) === "Completed" || derivedStatus(a) === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{derivedStatus(a)}</span>
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
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${a.progress}%`, backgroundColor: a.progress === 100 ? "#10b981" : "#C8A951" }} />
                          </div>
                          <span className="text-xs text-gray-400">{a.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {verifyLabel(a) && (
                            <button onClick={() => handleVerifyStep(a)} className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white transition-all ${verifyLabel(a)!.color}`}>{verifyLabel(a)!.label}</button>
                          )}
                          <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0A2647] text-white hover:bg-[#144272] transition-all">View</button>
                          <button onClick={() => { if (confirm("Delete this MNP activation?")) deleteActivation(a.id); }} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg mx-4 shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold" style={{ color: "#0A2647" }}>New MNP Activation</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
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
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          s.current ? 'bg-[#0A2647] text-white' : selectedSimId ? 'bg-[#C8A951] text-[#0A2647]' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {selectedSimId && !s.current ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          ) : s.step}
                        </div>
                        <span className={`text-xs font-medium hidden sm:inline ${s.current ? 'text-[#0A2647]' : 'text-gray-400'}`}>{s.label}</span>
                      </div>
                      {i < 2 && <ArrowRight className="h-3 w-3 text-gray-300" />}
                    </React.Fragment>
                  ))}
                </div>

                {/* Group 1: SIM Stock Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Select SIM from Stock *</label>
                  <select
                    value={selectedSimId}
                    onChange={handleSimSelect}
                    className="w-full min-h-[56px] px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-[#C8A951] bg-white md:min-h-[40px] md:px-3 md:py-2 md:rounded-lg md:border"
                  >
                    <option value="">-- Choose a SIM --</option>
                    {filteredSims.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.simNumber} | {s.network} | {s.iccid}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected SIM Info Card */}
                {selectedSimId && form.simNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Selected SIM</p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">SIM Number</span>
                        <p className="font-medium text-[#0A2647]">{form.simNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Network</span>
                        <p className="font-medium text-[#0A2647]">{form.newNetwork}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">ICCID</span>
                        <p className="font-medium text-[#0A2647] text-xs break-all">{form.iccid}</p>
                      </div>
                    </div>
                  </div>
                )}

                <hr className="border-gray-200" />

                {/* Group 2: SIM Details (auto-filled, editable) */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SIM Details</p>
                {[
                  { name: "simNumber", label: "SIM Number" },
                  { name: "iccid", label: "ICCID" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    <input
                      name={f.name}
                      value={(form as unknown as Record<string, string>)[f.name] || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm focus:outline-none bg-gray-50"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Current Network</label>
                  <select name="currentNetwork" value={form.currentNetwork} onChange={handleChange}
                    className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm focus:outline-none">
                    <option value="">Select Current Network</option>
                    {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">New Network (must differ)</label>
                  <select name="newNetwork" value={form.newNetwork} disabled
                    className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm bg-gray-100 text-gray-600 cursor-not-allowed">
                    <option value="">Select New Network</option>
                    {NETWORKS.filter((n) => n !== form.currentNetwork).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <hr className="border-gray-200" />

                {/* Group 3: Customer Info (optional) */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer Info (Optional)</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="XXXXX"
                    className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CNIC</label>
                  <input
                    name="customerCNIC"
                    value={form.customerCNIC}
                    onChange={handleChange}
                    placeholder="XXXXX-YYYYYYY-X"
                    className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contact Number</label>
                  <input
                    name="customerMobile"
                    value={form.customerMobile}
                    onChange={handleChange}
                    placeholder="03XX-XXXXXXX"
                    className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-3 min-h-[48px] rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  className="w-full sm:w-auto min-h-[56px] px-6 py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#C8A951", color: "#0A2647" }}>
                  <CheckCircle className="h-4 w-4" /> Save MNP
                </button>
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
    </div>
  );
}
