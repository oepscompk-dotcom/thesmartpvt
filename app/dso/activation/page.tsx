"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useDSOData } from "@/lib/DSODataContext";
import {
  Plus, X, Smartphone, Filter, CheckCircle, Clock, AlertCircle, ArrowRight, ArrowLeft, Trash2,
} from "lucide-react";

interface ActivationForm {
  customerName: string;
  customerCNIC: string;
  customerMobile: string;
  network: string;
  simNumber: string;
  iccid: string;
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

function loadFromStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : defaultVal; } catch { return defaultVal; }
}

const initialForm: ActivationForm = {
  customerName: "",
  customerCNIC: "",
  customerMobile: "",
  network: "",
  simNumber: "",
  iccid: "",
  deviceId: "",
  retailerId: "",
};

export default function NewSIMActivationPage() {
  const { activations, addActivation, deleteActivation, device, auth } = useDSOData();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ActivationForm>({
    ...initialForm,
    deviceId: device?.id ?? "",
  });
  const [filter, setFilter] = useState<string>("All");
  const [simStockList, setSimStockList] = useState<SIMStock[]>([]);
  const [selectedSimId, setSelectedSimId] = useState("");
  const [selectedFranchiseSimId, setSelectedFranchiseSimId] = useState("");

  useEffect(() => {
    if (!auth.franchiseId) return;
    const allSims = loadFromStorage<SIMStock[]>(`franchise-${auth.franchiseId}-sims`, []);
    const mySims = allSims.filter((s) => s.issuedToId === auth.dsoId && s.status === "Issued" && s.type === "new");
    setSimStockList(mySims);
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
        network: "",
        retailerId: "",
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
        network: sim.network,
        deviceId: sim.deviceId,
        retailerId: sim.retailerId || "",
      }));
    }
  };

  const updateFranchiseSIMStatus = (simNumber: string, newStatus: string) => {
    try {
      if (!auth.franchiseId) return;
      const stored = localStorage.getItem(`franchise-${auth.franchiseId}-sims`);
      if (stored) {
        const sims = JSON.parse(stored);
        const updated = sims.map((s: any) => s.simNumber === simNumber ? { ...s, status: newStatus } : s);
        localStorage.setItem(`franchise-${auth.franchiseId}-sims`, JSON.stringify(updated));
      }
    } catch {}
  };

  const isSIMInPipeline = (simNumber: string): boolean => {
    try {
      if (!auth.franchiseId) return false;
      const dsoKey = `franchise-${auth.franchiseId}-dso-activations`;
      const dsmKey = `franchise-${auth.franchiseId}-dsm-activations`;
      for (const key of [dsoKey, dsmKey]) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const acts = JSON.parse(stored);
          if (Array.isArray(acts)) {
            const found = acts.find((a: any) => a.simNumber === simNumber && a.status !== "Completed" && a.status !== "Rejected");
            if (found) return true;
          }
        }
      }
    } catch {}
    return false;
  };

  const newSIMActivations = activations.filter((a) => a.type === "New SIM");

  const filtered =
    filter === "All"
      ? newSIMActivations
      : newSIMActivations.filter((a) => a.status === filter);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!selectedSimId) return;
    if (isSIMInPipeline(form.simNumber || "")) {
      alert("This SIM is already in a verification pipeline (BVS/FCA/IFCA). Cannot submit until the current process is completed.");
      return;
    }
    const customerName = form.customerName.trim() || "XXXXX";
    const customerCNIC = form.customerCNIC.trim() || "XXXXX-YYYYYYY-X";
    const customerMobile = form.customerMobile.trim() || "03XX-XXXXXXX";
    const id = `ACT-${Date.now()}`;
    addActivation({
      id,
      type: "New SIM",
      simId: `SIM-${Date.now()}`,
      simNumber: form.simNumber,
      network: form.network,
      iccid: form.iccid,
      deviceId: form.deviceId,
      customerName,
      customerCNIC,
      customerMobile,
      retailerId: form.retailerId,
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
      dsoId: auth.dsoId,
      franchiseId: auth.franchiseId,
    });
    setForm({ ...initialForm, deviceId: device?.id ?? "" });
    setSelectedSimId("");
    try {
      if (auth.franchiseId) {
        const stored = localStorage.getItem(`franchise-${auth.franchiseId}-sims`);
        if (stored) {
          const sims = JSON.parse(stored);
          setSimStockList(sims.filter((s: any) => s.issuedToId === auth.dsoId && s.status === "Issued" && s.type === "new"));
        }
      }
    } catch {}
    updateFranchiseSIMStatus(form.simNumber || "", "Activated");
    setShowModal(false);
    alert("Activation submitted successfully! SIM is now pending verification (BVS → FCA → IFCA)");
  };

  const statusColor = (s: string) => {
    if (s === "Completed") return "bg-emerald-100 text-emerald-700";
    if (s.includes("BVS")) return "bg-amber-100 text-amber-700";
    if (s.includes("FCA")) return "bg-blue-100 text-blue-700";
    if (s.includes("IFCA")) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-600";
  };

  const simTypeLabel = (type: string) => {
    if (type === "New SIM") return "New";
    if (type === "MNP") return "MNP";
    if (type === "BYN") return "BYN";
    if (type === "Replacement") return "REPL";
    return type;
  };

  const vcVal = (v: string) => v === "Completed" ? "0" : "X";
  const typeColor = (t: string) => {
    if (t === "New SIM") return "bg-cyan-50 text-cyan-600";
    if (t === "MNP") return "bg-purple-50 text-purple-600";
    if (t === "BYN") return "bg-amber-50 text-amber-600";
    if (t === "Replacement") return "bg-rose-50 text-rose-600";
    return "bg-gray-100 text-gray-600";
  };
  const vcBg = (v: string) => v === "Completed" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-400";
  const derivedStatus = (a: any) => {
    const pending: string[] = [];
    if (a.bvsStatus !== "Completed") pending.push("BVS");
    if (a.fcaStatus !== "Completed") pending.push("FCA");
    if (a.ifcaStatus !== "Completed") pending.push("IFCA");
    if (pending.length === 0) return "Completed";
    return `Pending ${pending.join(", ")} (${pending.length})`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with back arrow */}
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 rounded-lg hover:bg-gray-100 transition min-h-[48px] min-w-[48px] flex items-center justify-center shrink-0">
            <ArrowLeft className="h-5 w-5" style={{ color: "#0A2647" }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "#0A2647" }}>
              <Smartphone className="inline-block mr-2 h-5 w-5 sm:h-6 sm:w-6" style={{ color: "#C8A951" }} />
              New SIM Activation
            </h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage new SIM activations</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition hover:opacity-90 min-h-[48px]"
            style={{ backgroundColor: "#0A2647" }}
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Activation</span>
          </button>
        </div>

        {/* Workflow */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#0A2647" }}>Activation Workflow</h2>
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
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Network</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">SIM Number</th>
                  <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">ICCID</th>
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
                    <td colSpan={13} className="px-6 py-12 text-center text-gray-400">
                      No activations found
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, idx) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-xs font-black">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm text-gray-900">{a.customerName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{a.customerCNIC}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.network === "Jazz" ? "bg-red-50 text-red-600" : a.network === "Telenor" ? "bg-blue-50 text-blue-600" : a.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{a.network}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 text-sm font-mono font-medium">{a.simNumber}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs font-mono">{a.iccid}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${derivedStatus(a) === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{derivedStatus(a)}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeColor(a.type)}`}>{simTypeLabel(a.type)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${vcBg(a.bvsStatus)}`}>{vcVal(a.bvsStatus)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${vcBg(a.fcaStatus)}`}>{vcVal(a.fcaStatus)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${vcBg(a.ifcaStatus)}`}>{vcVal(a.ifcaStatus)}</span>
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
                          <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0A2647] text-white hover:bg-[#144272] transition-all">View</button>
                          <button onClick={() => { if (confirm("Delete this activation?")) deleteActivation(a.id); }} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
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
                <h3 className="text-lg font-bold" style={{ color: "#0A2647" }}>New SIM Activation</h3>
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
                        <p className="font-medium text-[#0A2647]">{form.network}</p>
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
                  { name: "deviceId", label: "Device ID" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    <input
                      name={f.name}
                      value={(form as unknown as Record<string, string>)[f.name] || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-gray-50"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Retailer ID</label>
                  <input
                    name="retailerId"
                    value={form.retailerId}
                    readOnly
                    className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Network</label>
                  <select
                    name="network"
                    value={form.network}
                    disabled
                    className="w-full px-3 py-3 min-h-[48px] rounded-lg border border-gray-200 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                  >
                    <option value="">Select Network</option>
                    {NETWORKS.map((n) => (
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
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-3 min-h-[48px] rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto min-h-[56px] px-6 py-3 rounded-lg text-sm font-medium text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#C8A951", color: "#0A2647" }}
                >
                  <CheckCircle className="h-4 w-4" /> Save Activation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
