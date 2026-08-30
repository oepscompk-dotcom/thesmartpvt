"use client";

import { useState, useEffect } from "react";
import BackgroundAnimation from "@/components/franchise/BackgroundAnimation";
import CompanyCard from "@/components/company/CompanyCard";
import CompanyLoginForm from "@/components/company/CompanyLoginForm";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useCompanyLogo } from "@/lib/useCompanyLogo";

const FEATURES = ["Multi-Franchise View", "Real-time Analytics", "Financial Overview", "Staff Management"];

export default function CompanyLoginPage() {
  const [mounted, setMounted] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const { logo, companyName } = useCompanyLogo();

  useEffect(() => {
    setMounted(true);
  }, []);

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
                <span className="text-white font-black text-lg">S</span>
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm block leading-tight">
                {companyName || "THE SMART ERP"}
              </span>
              <span className="text-[#00C8FF]/70 text-[10px] font-medium">
                A Step Towards a New Horizon
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/15 rounded-[3px] text-white/80 text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-[#00C8FF] rounded-full animate-pulse" />
              Secure
            </span>
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-[3px] text-white/60 text-xs font-medium">COMPANY</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-7xl grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">
            {/* Left Section — copy of homepage hero */}
            <div className={`hidden lg:block transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/15 rounded-[3px] mb-6">
                <div className="w-2 h-2 bg-[#00C8FF] rounded-full animate-pulse" />
                <span className="text-white/85 text-sm font-medium">Head Office Administration</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                THE SMART
                <span className="text-highlight block mt-2 w-fit">ERP</span>
              </h1>

              <h2 className="text-xl sm:text-2xl text-white/90 font-semibold mb-4">Company Dashboard</h2>

              <p className="text-white/70 text-base mb-8 max-w-lg">
                Manage and monitor all your franchises from one centralized dashboard. View real-time
                analytics, franchise performance, and operational metrics.
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
                <a href="/franchise-admin" className="telenor-btn-outline text-center">
                  Franchise Portal <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Right Section - Login */}
            <div className={`flex justify-center transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="w-full max-w-[420px] space-y-4">
                {/* Mobile Header */}
                <div className="lg:hidden text-center mb-4">
                  <h1 className="text-3xl font-black text-white">
                    THE SMART <span className="text-highlight">ERP</span>
                  </h1>
                  <p className="text-[#00C8FF] text-xs font-medium mt-2">COMPANY PORTAL</p>
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
          <p className="text-white/30 text-xs">
            &copy; 2026 {companyName || "THE SMART Pvt. Ltd."} Company Administration Portal.
          </p>
        </footer>
      </div>
    </div>
  );
}