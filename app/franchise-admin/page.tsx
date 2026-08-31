"use client";

import { useState, useEffect } from "react";
import BackgroundAnimation from "@/components/franchise/BackgroundAnimation";
import FranchiseCard from "@/components/franchise/FranchiseCard";
import LoginForm from "@/components/franchise/LoginForm";
import DashboardPreview from "@/components/franchise/DashboardPreview";
import { useCompanyLogo } from "@/lib/useCompanyLogo";

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
          <div
            className={`flex justify-center w-full transition-all duration-1000 ${
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
        </main>
      </div>
    </div>
  );
}