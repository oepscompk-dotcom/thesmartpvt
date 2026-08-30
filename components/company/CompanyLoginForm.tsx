"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, KeyRound, User, Building2 } from "lucide-react";
import { useCompanyData } from "@/lib/CompanyDataContext";
import { useAuth } from "@/lib/AuthContext";

interface CompanyLoginFormProps {
  companyId: string;
}

export default function CompanyLoginForm({ companyId }: CompanyLoginFormProps) {
  const router = useRouter();
  const { login: companyLogin } = useCompanyData();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await companyLogin(companyId, password);
    if (success) {
      await authLogin(companyId, password);
      router.push("/company/dashboard");
    } else {
      setError("Invalid password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-login-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#00C8FF]/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#2D28CD]/5 rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#2D28CD] to-[#00C8FF] rounded-xl flex items-center justify-center shadow-lg">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Company Login</h2>
              <span className="text-[#00C8FF] text-xs font-medium tracking-wider">HEAD OFFICE PORTAL</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#2D28CD]/10 border border-[#2D28CD]/20 rounded-full text-[#00C8FF] text-xs font-semibold flex items-center gap-1.5">
              <Building2 size={12} />
              {companyId}
            </span>
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Company ID</p>
              <p className="text-white text-sm font-mono font-medium">{companyId}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Role</p>
              <p className="text-white text-sm font-medium">Company Admin</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>
          )}

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-[#00C8FF]/50 focus:ring-2 focus:ring-[#00C8FF]/10 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full py-3.5 bg-gradient-to-r from-[#2D28CD] to-[#00C8FF] text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(45,40,205,0.3)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Login
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}