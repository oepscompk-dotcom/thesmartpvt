"use client";

import { useState } from "react";
import { Building2, Check, AlertCircle } from "lucide-react";

interface FranchiseCardProps {
  onVerified: (franchiseId: string) => void;
}

interface Franchise {
  id: string;
  name: string;
  status: string;
  companyId?: string;
}

interface Company {
  id: string;
  name: string;
}

export default function FranchiseCard({ onVerified }: FranchiseCardProps) {
  const [step, setStep] = useState<"select" | "verify">("select");
  const [franchiseId, setFranchiseId] = useState("");
  const [verifiedId, setVerifiedId] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [verifiedCompany, setVerifiedCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const id = franchiseId.trim().toUpperCase();
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/data?model=franchise");
      if (!res.ok) throw new Error("Failed to load franchises");

      const franchises: { id: string; name: string; status: string; companyId?: string }[] = await res.json();

      const companiesRes = await fetch("/api/data?model=company");
      const companies: { id: string; name: string }[] = companiesRes.ok ? await companiesRes.json() : [];

      const found = franchises.find((f) => f.id.toUpperCase() === id.toUpperCase());
      if (!found) {
        setError("Franchise not found. Please check the ID.");
        return;
      }
      if (found.status !== "Active") {
        setError(`Franchise is ${found.status}. Contact admin.`);
        return;
      }

      const company = found.companyId ? companies.find((c) => c.id === found.companyId) : null;
      setVerifiedId(id);
      setVerifiedName(found.name);
      setVerifiedCompany(company ? company.name : "");
      setStep("verify");
    } catch (err) {
      setError("Failed to verify franchise. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onVerified(verifiedId);
  };

  return (
    <div className="glass-login-card rounded-xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl" />

      <div className="relative">
        {step === "select" ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Enter Franchise ID</h3>
                <p className="text-white/40 text-xs">Enter your franchise code to continue</p>
              </div>
            </div>

            <input
              type="text"
              value={franchiseId}
              onChange={(e) => { setFranchiseId(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. NRWP-1217"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg font-mono tracking-widest placeholder:text-white/25 placeholder:tracking-normal focus:outline-none focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 transition-all mb-4"
              disabled={loading}
            />

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!franchiseId.trim() || loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold rounded-xl hover:shadow-[0_0_25px_rgba(255,251,99,0.35)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-white/20 text-xs">Examples:</span>
              {["FRN-001", "NRWP-1217", "LHR-1005", "KHI-2201"].map((id) => (
                <button
                  key={id}
                  onClick={() => { setFranchiseId(id); }}
                  className="text-brand-gold/50 text-xs font-mono hover:text-brand-gold transition-colors"
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
                <h3 className="text-white font-bold text-sm">Franchise Verified</h3>
                <p className="text-white/40 text-xs">Confirm to proceed to login</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-dark flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-brand-navy font-black text-lg">
                    {verifiedId.split("-")[0]}
                  </span>
                </div>
                <h4 className="text-white font-bold text-base">{verifiedName}</h4>
                <p className="text-white/40 text-xs font-mono mt-1">{verifiedId}</p>
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
                {verifiedCompany && (
                  <div className="flex items-center justify-between py-2 border-t border-white/5">
                    <span className="text-white/40 text-xs">Under Company</span>
                    <span className="text-[#00C8FF] text-sm font-medium">{verifiedCompany}</span>
                  </div>
                )}
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
                className="flex-1 py-3 bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy text-sm font-bold rounded-xl hover:shadow-[0_0_25px_rgba(255,251,99,0.35)] transition-all hover:scale-[1.02]"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}