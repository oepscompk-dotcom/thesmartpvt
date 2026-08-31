"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useData } from "@/lib/DataContext";
import SecurityBadges from "./SecurityBadges";

export default function AdminLoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { settings } = useData();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(async () => {
      const success = await login(email, password);
      setIsLoading(false);

      if (success) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid email or password");
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="glass-login-card rounded-xl p-8 sm:p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00C8FF]/5 rounded-full blur-3xl" />

        {/* Header */}
        <div className="relative mb-8">
          <div className="flex items-center gap-3 mb-4">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-brand-gold to-brand-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-brand-navy font-black text-xl">S</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className="px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-brand-gold text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck size={12} />
              SUPER ADMIN
            </span>
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Secure Connection
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative space-y-5">
          {/* Email */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Email / Username
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thesmart.com.pk"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <KeyRound
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/10 transition-all text-sm"
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

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border border-white/20 rounded bg-white/5 peer-checked:bg-brand-gold peer-checked:border-brand-gold transition-all flex items-center justify-center">
                  {rememberMe && (
                    <svg
                      className="w-2.5 h-2.5 text-brand-navy"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-white/50 text-sm group-hover:text-white/70 transition-colors">
                Remember Me
              </span>
            </label>
            <button
              type="button"
              className="text-brand-gold/70 text-sm hover:text-brand-gold transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-navy font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,251,99,0.35)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security */}
        <SecurityBadges />

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-white/30 text-xs">
            Version 1.0 ERP &bull; Head Office Administration Portal
          </p>
        </div>
      </div>
    </div>
  );
}
