"use client";

import { useState } from "react";
import { Building2, Check, AlertCircle } from "lucide-react";
import { apiLoad } from "@/lib/api";

interface FranchiseSelectorProps {
  onVerified: (franchiseId: string) => void;
}

export default function FranchiseSelector({ onVerified }: FranchiseSelectorProps) {
  const [step, setStep] = useState<"select" | "verify">("select");
  const [franchiseId, setFranchiseId] = useState("");
  const [verifiedId, setVerifiedId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!franchiseId.trim()) return;

    const id = franchiseId.trim().toUpperCase();
    setLoading(true);
    try {
      const franchises = await apiLoad("franchise") as { id: string; name: string; status: string }[];
      const franchise = franchises.find((f) => f.id === id);
      if (!franchise) {
        setError("Franchise not found. Please check the ID.");
        return;
      }
      if (franchise.status !== "Active") {
        setError("This franchise is inactive. Contact Super Admin.");
        return;
      }
      setVerifiedId(id);
      setStep("verify");
    } catch {
      setError("Failed to verify franchise. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-login-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#00C2FF]/5 rounded-full blur-2xl" />

      <div className="relative">
        {step === "select" ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#00C2FF]/10 flex items-center justify-center text-[#00C2FF]">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Enter Franchise ID</h3>
                <p className="text-white/40 text-xs">Your assigned franchise code</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <input
              type="text"
              value={franchiseId}
              onChange={(e) => { setFranchiseId(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. NRWP-1217"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg font-mono tracking-widest placeholder:text-white/25 placeholder:tracking-normal focus:outline-none focus:border-[#00C2FF]/50 focus:ring-2 focus:ring-[#00C2FF]/10 transition-all mb-4"
            />

            <button
              onClick={handleSubmit}
              disabled={!franchiseId.trim() || loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#0057FF] to-[#0EA5E9] text-white font-bold rounded-xl hover:shadow-[0_0_25px_rgba(0,87,255,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Franchise"}
            </button>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-white/20 text-xs">Examples:</span>
              {["NRWP-1217", "LHR-1005", "KHI-2201"].map((id) => (
                <button
                  key={id}
                  onClick={() => { setFranchiseId(id); setError(""); }}
                  className="text-[#00C2FF]/50 text-xs font-mono hover:text-[#00C2FF] transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <Check size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Franchise Verified</h3>
                <p className="text-white/40 text-xs">Confirm to proceed</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-5">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0057FF] to-[#0EA5E9] flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-black text-lg">
                    {verifiedId.split("-")[0]}
                  </span>
                </div>
                <h4 className="text-white font-bold text-base">{verifiedId}</h4>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <span className="text-white/40 text-xs">Franchise ID</span>
                  <span className="text-white font-mono text-sm font-medium">{verifiedId}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <span className="text-white/40 text-xs">Status</span>
                  <span className="text-green-400 text-sm font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("select")}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white/60 text-sm font-medium rounded-xl hover:bg-white/10 transition-all"
              >
                Change
              </button>
              <button
                onClick={() => onVerified(verifiedId)}
                className="flex-1 py-3 bg-gradient-to-r from-[#0057FF] to-[#0EA5E9] text-white text-sm font-bold rounded-xl hover:shadow-[0_0_25px_rgba(0,87,255,0.3)] transition-all hover:scale-[1.02]"
              >
                Continue to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
