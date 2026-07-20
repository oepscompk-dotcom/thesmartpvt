"use client";

import { useEffect, useState } from "react";
import BackgroundAnimation from "@/components/super-admin/BackgroundAnimation";
import AdminLoginCard from "@/components/super-admin/AdminLoginCard";
import StatisticsCards from "@/components/super-admin/StatisticsCards";
import { useData } from "@/lib/DataContext";

export default function SuperAdminPage() {
  const [mounted, setMounted] = useState(false);
  const { settings } = useData();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundAnimation />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-brand-gold to-brand-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-brand-navy font-black text-lg">S</span>
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm block leading-tight">
                {settings.companyName || "THE SMART ERP"}
              </span>
              <span className="text-brand-gold/60 text-[10px] font-medium">
                Enterprise Platform
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

        {/* Main Layout */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-7xl grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">
            {/* Left Section */}
            <div
              className={`transition-all duration-1000 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6">
                  <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
                  <span className="text-white/80 text-sm font-medium">
                    Super Admin Control Center
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                  THE SMART
                  <span className="text-gradient block">ERP</span>
                </h1>

                <h2 className="text-xl sm:text-2xl text-white/80 font-semibold mb-4">
                  Super Admin Control Center
                </h2>

                <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-lg">
                  Manage franchises, users, inventory, payroll, finance, and
                  nationwide telecom operations from one secure dashboard.
                </p>
              </div>

              {/* Login Flow */}
              <div className="mb-10">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
                  Login Process
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    "Super Admin Login",
                    "OTP Verification",
                    "Permission Validation",
                    "Admin Dashboard",
                  ].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="glass-card rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-white/80 text-xs font-medium whitespace-nowrap">
                          {step}
                        </span>
                      </div>
                      {i < 3 && (
                        <svg
                          className="w-4 h-4 text-white/20 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
                  Platform Overview
                </p>
                <StatisticsCards />
              </div>
            </div>

            {/* Right Section - Login Card */}
            <div
              className={`flex justify-center transition-all duration-1000 delay-300 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <AdminLoginCard />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center">
          <p className="text-white/20 text-xs">
            &copy; 2026 {settings.companyName || "THE SMART Pvt. Ltd."} Head Office Administration Portal.
          </p>
        </footer>
      </div>
    </div>
  );
}
