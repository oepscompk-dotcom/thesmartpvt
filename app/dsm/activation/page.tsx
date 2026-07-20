"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDSMData } from "@/lib/DSMDataContext";
import { apiLoad, apiUpdate } from "@/lib/api";
import { Smartphone, User, CreditCard, Phone, Wifi, Tag, MessageSquare, CheckCircle2, ArrowRight, ArrowLeft, ChevronRight, Signal, Trash2 } from "lucide-react";

interface SIMStock {
  id: string;
  simNumber: string;
  iccid: string;
  network: string;
  status: string;
  deviceId?: string;
  retailerId?: string;
  type?: "new" | "hlr";
  issuedToId?: string;
}

export default function NewSIMActivation() {
  const { addActivation, deleteActivation, auth, activations } = useDSMData();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [activatingId, setActivatingId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [simStockList, setSimStockList] = useState<SIMStock[]>([]);
  const [selectedSimId, setSelectedSimId] = useState("");
  const [selectedFranchiseSimId, setSelectedFranchiseSimId] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    customerCNIC: "",
    contactNumber: "",
    simNumber: "",
    iccid: "",
    deviceId: "",
    retailerId: "",
    network: "Telenor",
    deviceBrand: "",
    deviceModel: "",
    devicePrice: "",
    notes: "",
  });

  const networks = ["Telenor", "Ufone", "Zong", "Jazz"];

  useEffect(() => {
    const load = async () => {
      setMounted(true);
      if (!auth.franchiseId) return;
      const allSims = await apiLoad("sim", auth.franchiseId);
      const mySims = (allSims || []).filter((s: SIMStock) => s.issuedToId === auth.dsmId && s.status === "Issued" && s.type === "new");
      setSimStockList(mySims);
    };
    load();
  }, [auth.dsmId, auth.franchiseId]);

  const generateId = () => {
    const num = Math.floor(10000 + Math.random() * 90000);
    return `ACT-2026-${num}`;
  };

  const handleSimSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const simId = e.target.value;
    setSelectedSimId(simId);
    if (!simId) {
      setSelectedFranchiseSimId("");
      setForm((prev) => ({ ...prev, simNumber: "", iccid: "", deviceId: "", retailerId: "", network: "Telenor" }));
      return;
    }
    const sim = simStockList.find((s) => s.id === simId);
    if (sim) {
      setSelectedFranchiseSimId(simId);
      setForm((prev) => ({
        ...prev,
        simNumber: sim.simNumber,
        iccid: sim.iccid,
        deviceId: sim.deviceId || "",
        retailerId: sim.retailerId || "",
        network: sim.network || prev.network,
      }));
    }
  };

  const updateFranchiseSIMStatus = async (simNumber: string, newStatus: string) => {
    try {
      if (!auth.franchiseId) return;
      const allSims = await apiLoad("sim", auth.franchiseId);
      const sim = (allSims || []).find((s: any) => s.simNumber === simNumber);
      if (sim) {
        await apiUpdate("sim", sim.id, { ...sim, status: newStatus });
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
      for (const acts of [dsoActs || [], dsmActs || []]) {
        if (Array.isArray(acts)) {
          const found = acts.find((a: any) => a.simNumber === simNumber && a.status !== "Completed" && a.status !== "Rejected");
          if (found) return true;
        }
      }
    } catch {}
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = generateId();
    const today = new Date().toISOString().split("T")[0];
    const customerName = form.customerName.trim() || "XXXXX";
    const customerCNIC = form.customerCNIC.trim() || "XXXXX-YYYYYYY-X";
    const contactNumber = form.contactNumber.trim() || "03XX-XXXXXXX";
    if (await isSIMInPipeline(form.simNumber || "")) {
      alert("This SIM is already in a verification pipeline (BVS/FCA/IFCA). Cannot submit until the current process is completed.");
      return;
    }
    addActivation({
      id,
      type: "New SIM",
      simNumber: form.simNumber,
      iccid: form.iccid,
      network: form.network,
      customerName,
      customerCNIC,
      contactNumber,
      status: "Pending BVS",
      bvsStatus: "Pending",
      fcaStatus: "Pending",
      ifcaStatus: "Pending",
      progress: 0,
      createdAt: today,
      dsmId: auth.dsmId,
      dsoId: "",
      franchiseId: auth.franchiseId,
    } as any);
    await updateFranchiseSIMStatus(form.simNumber || "", "Activated");
    setActivatingId(id);
    setSelectedSimId("");
    try {
      if (auth.franchiseId) {
        const allSims = await apiLoad("sim", auth.franchiseId);
        setSimStockList((allSims || []).filter((s: any) => s.issuedToId === auth.dsmId && s.status === "Issued" && s.type === "new"));
      }
    } catch {}
    setShowSuccess(true);
    alert("Activation submitted! Pending verification (BVS → FCA → IFCA)");
    setTimeout(() => router.push("/dsm/dashboard"), 2000);
  };

  const newSIMActivations = activations.filter((a) => a.type === "New SIM");

  const simTypeLabel = (type: string) => {
    if (type === "New SIM") return "New";
    if (type === "MNP") return "MNP";
    if (type === "BYN") return "BYN";
    if (type === "Replacement") return "REPL";
    return type;
  };

  const statusColor = (s: string) => {
    if (s === "Completed") return "bg-emerald-100 text-emerald-700";
    if (s.includes("BVS")) return "bg-amber-100 text-amber-700";
    if (s.includes("FCA")) return "bg-blue-100 text-blue-700";
    if (s.includes("IFCA")) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-600";
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
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4 animate-bounce">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">Activation Submitted!</h3>
            <p className="text-gray-500 text-sm mb-2">ID: {activatingId}</p>
            <p className="text-gray-400 text-xs">Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => router.push("/dsm/dashboard")}
          className="w-10 h-10 min-h-[40px] flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New SIM Activation</h1>
          <p className="text-gray-500 text-sm">Register a new SIM card for a customer</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
        {["Select SIM", "Fill Details", "Submit"].map((step, i) => {
          const stepNum = i + 1;
          const isActive = selectedSimId ? stepNum <= 2 : stepNum === 1;
          const isComplete = selectedSimId ? stepNum === 1 : false;
          return (
            <div key={step} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive ? "bg-[#0057FF] text-white" : "bg-gray-100 text-gray-400"}`}>
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${isComplete ? "bg-green-500 text-white" : isActive ? "bg-white/20" : "bg-gray-200 text-gray-400"}`}>
                  {isComplete ? "✓" : stepNum}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
              {i < 2 && <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <Tag size={18} className="text-[#0057FF]" />
            SIM Stock Selection
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select SIM from Stock</label>
            <select
              value={selectedSimId}
              onChange={handleSimSelect}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 min-h-[56px] sm:min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF] active:border-[#0057FF]"
            >
              <option value="">{mounted && simStockList.length === 0 ? "No issued SIMs available" : "-- Select a SIM --"}</option>
              {simStockList.map((sim) => (
                <option key={sim.id} value={sim.id}>
                  {sim.simNumber} | {sim.network} | {sim.iccid}
                </option>
              ))}
            </select>
            {selectedSimId && (() => {
              const sim = simStockList.find((s) => s.id === selectedSimId);
              if (!sim) return null;
              return (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Signal size={16} className="text-[#0057FF]" />
                    <span className="text-xs font-semibold text-[#0057FF] uppercase tracking-wide">Selected SIM</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">SIM Number</p>
                      <p className="text-gray-900 font-semibold">{sim.simNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Network</p>
                      <p className="text-gray-900 font-semibold">{sim.network}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">ICCID</p>
                      <p className="text-gray-900 font-semibold text-xs break-all">{sim.iccid}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
            {mounted && simStockList.length === 0 && (
              <p className="text-amber-600 text-xs mt-1.5">No issued SIMs found in franchise stock. Please request SIMs from DSO first.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <Phone size={18} className="text-[#0057FF]" />
            SIM Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SIM Number</label>
              <input
                type="text"
                value={form.simNumber}
                onChange={(e) => setForm({ ...form, simNumber: e.target.value })}
                placeholder="Auto-filled from stock"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ICCID</label>
              <input
                type="text"
                value={form.iccid}
                onChange={(e) => setForm({ ...form, iccid: e.target.value })}
                placeholder="Auto-filled from stock"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Device ID</label>
              <input
                type="text"
                value={form.deviceId}
                onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
                placeholder="Auto-filled from stock"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Retailer ID</label>
              <input
                type="text"
                value={form.retailerId}
                readOnly
                placeholder="Auto-filled from stock"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Network</label>
              <select
                value={form.network}
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm cursor-not-allowed"
              >
                {networks.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <User size={18} className="text-[#0057FF]" />
            Customer Information
            <span className="text-gray-400 text-sm font-normal">(Optional)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="XXXXX"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CNIC</label>
              <input
                type="text"
                value={form.customerCNIC}
                onChange={(e) => setForm({ ...form, customerCNIC: e.target.value })}
                placeholder="XXXXX-YYYYYYY-X"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
              <input
                type="text"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="03XX-XXXXXXX"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-[#0057FF]" />
            Device Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Device Brand</label>
              <input
                type="text"
                value={form.deviceBrand}
                onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })}
                placeholder="e.g. Samsung"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Device Model</label>
              <input
                type="text"
                value={form.deviceModel}
                onChange={(e) => setForm({ ...form, deviceModel: e.target.value })}
                placeholder="e.g. Galaxy A54"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Device Price (PKR)</label>
              <input
                type="number"
                value={form.devicePrice}
                onChange={(e) => setForm({ ...form, devicePrice: e.target.value })}
                placeholder="0"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#0057FF]" />
            Additional Notes
          </h2>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional notes about this activation..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF] resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#0057FF] text-white px-6 py-3 min-h-[56px] rounded-xl font-semibold hover:bg-[#0047CC] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            Submit Activation
          </button>
          <button
            type="button"
            onClick={() => router.push("/dsm/dashboard")}
            className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 py-2 min-h-[48px] rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Activation History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-bold text-lg">Recent New SIM Activations ({newSIMActivations.length})</h3>
        </div>
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
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Date</th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {newSIMActivations.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-gray-400">No activations yet</td>
                </tr>
              ) : newSIMActivations.slice(0, 20).map((a, idx) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0057FF]/10 text-[#0057FF] text-xs font-black">{idx + 1}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-sm text-gray-900">{a.customerName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.customerCNIC}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.network === "Jazz" ? "bg-red-50 text-red-600" : a.network === "Telenor" ? "bg-blue-50 text-blue-600" : a.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{a.network}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 text-sm font-mono font-medium">{a.simNumber}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs font-mono">{(a as any).iccid || "—"}</td>
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
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { if (confirm("Delete this activation?")) deleteActivation(a.id); }} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
