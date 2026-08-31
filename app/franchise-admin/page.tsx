"use client";

import { useState, useEffect } from "react";
import BackgroundAnimation from "@/components/franchise/BackgroundAnimation";
import FranchiseCard from "@/components/franchise/FranchiseCard";
import LoginForm from "@/components/franchise/LoginForm";
import Statistics from "@/components/franchise/Statistics";
import DashboardPreview from "@/components/franchise/DashboardPreview";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useCompanyLogo } from "@/lib/useCompanyLogo";

const FEATURES = ["Employees", "Inventory", "Payroll", "Attendance", "Activations", "Reports"];

export default function FranchiseAdminPage() {
  const [mounted, setMounted] = useState(false);
  const [franchiseId, setFranchiseId] = useState<string | null>(null);
  const { headerLogo } = useCompanyLogo();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundAnimation />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {headerLogo ? (
              <img src={headerLogo} alt="Logo" className="w-32 h-[36px] sm:w-40 sm:h-[44px] object-contain" />
            ) : (
              <div className="w-32 h-[36px] sm:w-40 sm:h-[44px] bg-gradient-to-br from-[#FFFB63] to-[#F1B308] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[#0C1026] font-black text-xl">S</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-7xl grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">
            {/* Left Section — hero copy */}
            <div
              className={`hidden lg:block transition-all duration-1000 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 rounded-[3px] mb-6">
                <div className="w-2 h-2 bg-[#00C8FF] rounded-full animate-pulse" />
                <span className="text-white/85 text-sm font-medium">Franchise Operations Control</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                THE SMART
                <span className="text-highlight block mt-2 w-fit">ERP</span>
              </h1>

              <h2 className="text-xl sm:text-2xl text-white/90 font-semibold mb-4">
                Franchise Management Portal
              </h2>

              <p className="text-white/70 text-base mb-8 max-w-lg">
                Manage your franchise operations, employees, inventory, payroll, attendance,
                activations, and reports through a secure cloud platform.
              </p>

              <div className="mb-8">
                <p className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">Manage:</p>
                <div className="flex flex-wrap gap-2">
                  {FEATURES.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/15 rounded-[3px] text-white/85 text-sm">
                      <CheckCircle size={14} className="text-[#00C8FF] flex-shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/" className="telenor-btn text-center">Back to Homepage</a>
                <a href="/company-login" className="telenor-btn-outline text-center">
                  Company Portal <ArrowRight size={16} />
                </a>
              </div>

              {/* Platform Overview */}
              <div className="mt-10 hidden lg:block">
                <p className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">
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
      </div>
    </div>
  );
}