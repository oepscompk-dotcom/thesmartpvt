"use client";

import { useState } from "react";
import { Building2, Check, AlertCircle } from "lucide-react";

interface CompanyCardProps {
  onVerified: (companyId: string) => void;
}

export default function CompanyCard({ onVerified }: CompanyCardProps) {
  const [step, setStep] = useState<"select" | "verify">("select");
  const [companyId, setCompanyId] = useState("");
  const [verifiedId, setVerifiedId] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const id = companyId.trim().toUpperCase();
    if (!id) return;

    let companies: { id: string; name: string; status: string }[] = [];
    try {
      const stored = localStorage.getItem("smart-erp-companies");
      if (stored) companies = JSON.parse(stored);
    } catch {}

    const found = companies.find((c) => c.id.toUpperCase() === id.toUpperCase());
    if (!found) {
      setError("Company not found. Please check the ID.");
      return;
    }
    if (found.status !== "Active") {
      setError(`Company is ${found.status}. Contact Super Admin.`);
      return;
    }

    setError("");
    setVerifiedId(id);
    setVerifiedName(found.name);
    setStep("verify");
  };

  const handleContinue = () => {
    onVerified(verifiedId);
  };

  return (
    <div className="glass-login-card rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
      <div className="relative">
        {step === "select" ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Enter Company ID</h3>
                <p className="text-white/40 text-xs">Enter your company code to continue</p>
              </div>
            </div>

            <input
              type="text"
              value={companyId}
              onChange={(e) => { setCompanyId(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. COMP-001"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg font-mono tracking-widest placeholder:text-white/25 placeholder:tracking-normal focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all mb-4"
            />

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!companyId.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-[0_0_25px_rgba(14,165,233,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Company
            </button>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-white/20 text-xs">Examples:</span>
              {["COMP-001", "COMP-002", "COMP-003"].map((id) => (
                <button
                  key={id}
                  onClick={() => { setCompanyId(id); setError(""); }}
                  className="text-blue-400/50 text-xs font-mono hover:text-blue-400 transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <Check size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Company Verified</h3>
                <p className="text-white/40 text-xs">Confirm to proceed to login</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-black text-lg">{verifiedId.split("-")[0]}</span>
                </div>
                <h4 className="text-white font-bold text-base">{verifiedName}</h4>
                <p className="text-white/40 text-xs font-mono mt-1">{verifiedId}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <span className="text-white/40 text-xs">Company ID</span>
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
                onClick={handleContinue}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-xl hover:shadow-[0_0_25px_rgba(14,165,233,0.3)] transition-all hover:scale-[1.02]"
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