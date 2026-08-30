"use client";

import { useState, useEffect } from "react";
import BackgroundAnimation from "@/components/franchise/BackgroundAnimation";
import CompanyCard from "@/components/company/CompanyCard";
import CompanyLoginForm from "@/components/company/CompanyLoginForm";
import { useCompanyLogo } from "@/lib/useCompanyLogo";
import { Building2, ChevronRight } from "lucide-react";

export default function CompanyLoginPage() {
  const [mounted, setMounted] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const { logo, companyName } = useCompanyLogo();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loginFlow = ["Company ID", "Password", "Validation", "Company Dashboard"];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundAnimation />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-[#2D28CD] to-[#00C8FF] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black font-black text-lg">S</span>
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm block leading-tight">
                {companyName || "THE SMART ERP"}
              </span>
              <span className="text-[#00C8FF]/60 text-[10px] font-medium">
                A Step Towards a New Horizon
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Secure
            </span>
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-xs font-medium">COMPANY</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-7xl grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">
            {/* Left Section */}
            <div className={`hidden lg:block transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="mb-8">
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
                  {companyName || "THE SMART"} <span className="text-gradient block">ERP</span>
                </h1>
                <h2 className="text-xl text-white/80 font-semibold mb-3">Company Dashboard</h2>
                <p className="text-white/50 text-sm leading-relaxed max-w-md">
                  Manage and monitor all your franchises from one centralized dashboard. View real-time analytics, franchise performance, and operational metrics.
                </p>
              </div>

              {/* Login Flow */}
              <div className="mb-8">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Login Process</p>
                <div className="flex flex-wrap items-center gap-2">
                  {loginFlow.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="glass-card rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00C8FF]/20 text-[#00C8FF] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="text-white/80 text-xs font-medium whitespace-nowrap">{step}</span>
                      </div>
                      {i < loginFlow.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#00C8FF]/10 flex items-center justify-center text-[#00C8FF] mb-3">
                    <Building2 size={20} />
                  </div>
                  <p className="text-white/80 text-sm font-medium">Multi-Franchise View</p>
                  <p className="text-white/40 text-xs mt-1">Monitor all franchises</p>
                </div>
                <div className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-3">
                    <span className="text-lg">📊</span>
                  </div>
                  <p className="text-white/80 text-sm font-medium">Real-time Analytics</p>
                  <p className="text-white/40 text-xs mt-1">Live performance metrics</p>
                </div>
                <div className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#FFFB63]/10 flex items-center justify-center text-[#FFFB63] mb-3">
                    <span className="text-lg">💰</span>
                  </div>
                  <p className="text-white/80 text-sm font-medium">Financial Overview</p>
                  <p className="text-white/40 text-xs mt-1">Revenue & expenses</p>
                </div>
                <div className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#2D28CD]/10 flex items-center justify-center text-[#00C8FF] mb-3">
                    <span className="text-lg">👥</span>
                  </div>
                  <p className="text-white/80 text-sm font-medium">Staff Management</p>
                  <p className="text-white/40 text-xs mt-1">DSM/DSO tracking</p>
                </div>
              </div>
            </div>

            {/* Right Section - Login */}
            <div className={`flex justify-center transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="w-full max-w-[420px] space-y-4">
                {/* Mobile Header */}
                <div className="lg:hidden text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00C8FF]/10 flex items-center justify-center">
                      <Building2 size={18} className="text-[#00C8FF]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#00C8FF]/70 uppercase tracking-widest">Company Portal</span>
                  </div>
                  <h1 className="text-2xl font-black text-white">
                    {companyName || "THE SMART"} <span className="text-gradient">ERP</span>
                  </h1>
                </div>

                {!companyId ? (
                  <CompanyCard onVerified={setCompanyId} />
                ) : (
                  <CompanyLoginForm companyId={companyId} />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center">
          <p className="text-white/20 text-xs">
            &copy; 2026 {companyName || "THE SMART Pvt. Ltd."} Company Administration Portal.
          </p>
        </footer>
      </div>
    </div>
  );
}