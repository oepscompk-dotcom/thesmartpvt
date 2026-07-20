"use client";

import { useState, useEffect } from "react";
import BackgroundAnimation from "@/components/franchise/BackgroundAnimation";
import FranchiseCard from "@/components/franchise/FranchiseCard";
import LoginForm from "@/components/franchise/LoginForm";
import Statistics from "@/components/franchise/Statistics";
import DashboardPreview from "@/components/franchise/DashboardPreview";
import { useCompanyLogo } from "@/lib/useCompanyLogo";

export default function FranchiseAdminPage() {
  const [mounted, setMounted] = useState(false);
  const [franchiseId, setFranchiseId] = useState<string | null>(null);
  const { logo, companyName } = useCompanyLogo();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loginFlow = [
    "Select Franchise",
    "Enter Credentials",
    "Permission Validation",
    "Franchise Dashboard",
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundAnimation />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-brand-gold to-brand-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-brand-navy font-black text-lg">S</span>
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm block leading-tight">
                {companyName || "THE SMART ERP"}
              </span>
              <span className="text-brand-gold/60 text-[10px] font-medium">
                A Step Towards a New Horizon
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Secure Connection
            </span>
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-xs font-medium">
              v1.0
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-7xl grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">
            {/* Left Section */}
            <div
              className={`transition-all duration-1000 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                  {companyName || "THE SMART"}
                  <span className="text-gradient block">ERP</span>
                </h1>
                <h2 className="text-xl sm:text-2xl text-white/80 font-semibold mb-4">
                  Franchise Management Portal
                </h2>
                <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-lg">
                  Manage your franchise operations, employees, inventory, payroll,
                  attendance, activations, and reports through a secure cloud platform.
                </p>
              </div>

              {/* Login Flow */}
              <div className="mb-10 hidden sm:block">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
                  Login Process
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {loginFlow.map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="glass-card rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-white/80 text-xs font-medium whitespace-nowrap">
                          {step}
                        </span>
                      </div>
                      {i < loginFlow.length - 1 && (
                        <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="hidden lg:block">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
                  Platform Overview
                </p>
                <Statistics />
              </div>
            </div>

            {/* Right Section */}
            <div
              className={`flex justify-center transition-all duration-1000 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="w-full max-w-[420px] space-y-4">
                {!franchiseId ? (
                  <FranchiseCard onVerified={setFranchiseId} />
                ) : (
                  <>
                    <LoginForm franchiseId={franchiseId} />
                    <DashboardPreview />
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center">
          <p className="text-white/20 text-xs">
            &copy; 2026 {companyName || "THE SMART Pvt. Ltd."} Franchise Management Portal. A Step Towards a New Horizon.
          </p>
        </footer>
      </div>
    </div>
  );
}
