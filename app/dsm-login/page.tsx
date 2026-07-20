"use client";

import { useState, useEffect } from "react";
import BackgroundAnimation from "@/components/dsm/BackgroundAnimation";
import FranchiseSelector from "@/components/dsm/FranchiseSelector";
import DSMLoginForm from "@/components/dsm/DSMLoginForm";
import TeamStatistics from "@/components/dsm/TeamStatistics";
import FeatureCards from "@/components/dsm/FeatureCards";
import SecurityBadges from "@/components/dsm/SecurityBadges";
import { useCompanyLogo } from "@/lib/useCompanyLogo";

export default function DSMLoginPage() {
  const [mounted, setMounted] = useState(false);
  const [franchiseId, setFranchiseId] = useState<string | null>(null);
  const { logo, companyName } = useCompanyLogo();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loginFlow = ["Franchise ID", "DSM Credentials", "Permission Validation", "DSM Dashboard"];

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
              <div className="w-10 h-10 bg-gradient-to-br from-[#0057FF] to-[#0EA5E9] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">S</span>
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm block leading-tight">{companyName || "THE SMART ERP"}</span>
              <span className="text-[#0EA5E9]/60 text-[10px] font-medium">Direct Sales Management System</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Secure
            </span>
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-xs font-medium">DSM</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-7xl grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">
            {/* Left Section */}
            <div className={`hidden lg:block transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-5">
                  <div className="w-2 h-2 bg-[#0EA5E9] rounded-full animate-pulse" />
                  <span className="text-white/80 text-sm font-medium">Team Management Portal</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
                  {companyName || "THE SMART"} <span className="text-gradient block">ERP</span>
                </h1>
                <h2 className="text-xl text-white/80 font-semibold mb-3">DSM Portal</h2>
                <p className="text-white/50 text-sm leading-relaxed max-w-md">
                  Lead Teams &bull; Achieve Targets &bull; Drive Growth. Supervise DSO teams, monitor sales performance, manage targets, and track franchise operations.
                </p>
              </div>

              {/* Login Flow */}
              <div className="mb-8">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Login Process</p>
                <div className="flex flex-wrap items-center gap-2">
                  {loginFlow.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="glass-card rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0EA5E9]/20 text-[#0EA5E9] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="text-white/80 text-xs font-medium whitespace-nowrap">{step}</span>
                      </div>
                      {i < loginFlow.length - 1 && (
                        <svg className="w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="mb-6">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Team Overview</p>
                <TeamStatistics />
              </div>

              {/* Features & Security */}
              <div className="grid grid-cols-2 gap-4">
                <FeatureCards />
                <SecurityBadges />
              </div>
            </div>

            {/* Right Section - Login */}
            <div className={`w-full max-w-[420px] mx-auto space-y-4 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-4">
                <h1 className="text-2xl font-black text-white">THE SMART ERP</h1>
                <p className="text-[#0EA5E9] text-xs font-medium">DSM PORTAL</p>
                <p className="text-white/30 text-[10px] mt-1">Lead Teams &bull; Achieve Targets &bull; Drive Growth</p>
              </div>

              {!franchiseId ? (
                <FranchiseSelector onVerified={setFranchiseId} />
              ) : (
                <>
                  <DSMLoginForm franchiseId={franchiseId} />
                  <div className="lg:hidden space-y-4">
                    <TeamStatistics />
                    <FeatureCards />
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center">
          <p className="text-white/20 text-xs">{companyName || "THE SMART ERP"} &bull; Direct Sales Manager Portal</p>
          <p className="text-white/15 text-[10px] mt-1">&copy; 2026 {companyName || "THE SMART Pvt. Ltd."} &bull; A Step Towards a New Horizon</p>
        </footer>
      </div>
    </div>
  );
}
