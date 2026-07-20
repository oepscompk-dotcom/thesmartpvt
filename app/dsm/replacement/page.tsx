"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDSMData } from "@/lib/DSMDataContext";
import { apiLoad, apiUpdate } from "@/lib/api";
import { Repeat, User, Phone, MessageSquare, CheckCircle2, Tag, ArrowLeft, ChevronRight, Signal } from "lucide-react";

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

export default function SIMReplacement() {
  const { addActivation, auth } = useDSMData();
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
    oldMsisdn: "",
    newMsisdn: "",
    simNumber: "",
    iccid: "",
    deviceId: "",
    retailerId: "",
    network: "Telenor",
    reason: "Lost",
    notes: "",
  });

  const networks = ["Telenor", "Ufone", "Zong", "Jazz"];
  const reasons = ["Lost", "Damaged", "Stolen"];

  useEffect(() => {
    const load = async () => {
      setMounted(true);
      if (!auth.franchiseId) return;
      const allSims = await apiLoad("sim", auth.franchiseId);
      const mySims = (allSims || []).filter((s: SIMStock) => s.issuedToId === auth.dsmId && s.status === "Issued" && s.type === "hlr");
      setSimStockList(mySims);
    };
    load();
  }, [auth.dsmId, auth.franchiseId]);

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
    const num = Math.floor(10000 + Math.random() * 90000);
    const id = `ACT-2026-${num}`;
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
      type: "Replacement",
      simNumber: form.newMsisdn || form.simNumber,
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
    });
    await updateFranchiseSIMStatus(form.simNumber || "", "Activated");
    setActivatingId(id);
    setSelectedSimId("");
    try {
      if (auth.franchiseId) {
        const allSims = await apiLoad("sim", auth.franchiseId);
        setSimStockList((allSims || []).filter((s: any) => s.issuedToId === auth.dsmId && s.status === "Issued" && s.type === "hlr"));
      }
    } catch {}
    setShowSuccess(true);
    alert("Activation submitted! Pending verification (BVS → FCA → IFCA)");
    setTimeout(() => router.push("/dsm/dashboard"), 2000);
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4 animate-bounce">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">Replacement Submitted!</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">SIM Replacement</h1>
          <p className="text-gray-500 text-sm">Replace an existing SIM card</p>
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
            <Repeat size={18} className="text-[#0057FF]" />
            Replacement Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Old MSISDN</label>
              <input
                type="text"
                required
                value={form.oldMsisdn}
                onChange={(e) => setForm({ ...form, oldMsisdn: e.target.value })}
                placeholder="Current number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New MSISDN</label>
              <input
                type="text"
                required
                value={form.newMsisdn}
                onChange={(e) => setForm({ ...form, newMsisdn: e.target.value })}
                placeholder="New number"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                onChange={(e) => setForm({ ...form, retailerId: e.target.value })}
                placeholder="Auto-filled from stock"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Network</label>
              <select
                value={form.network}
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm text-gray-500 cursor-not-allowed"
              >
                {networks.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
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
            <MessageSquare size={18} className="text-[#0057FF]" />
            Additional Notes
          </h2>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes about this replacement..."
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
            Submit Replacement
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
    </div>
  );
}
