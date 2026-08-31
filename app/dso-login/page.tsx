"use client";

import { useState, useEffect } from "react";
import BackgroundAnimation from "@/components/dso/BackgroundAnimation";
import FranchiseSelector from "@/components/dso/FranchiseSelector";
import DSOLoginForm from "@/components/dso/DSOLoginForm";
import FeaturesCard from "@/components/dso/FeaturesCard";
import { useCompanyLogo } from "@/lib/useCompanyLogo";

export default function DSOLoginPage() {
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
        <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {headerLogo ? (
              <img src={headerLogo} alt="Logo" className="w-32 h-[36px] sm:w-40 sm:h-[44px] object-contain" />
            ) : (
              <div className="w-32 h-[36px] sm:w-40 sm:h-[44px] bg-gradient-to-br from-[#2D28CD] to-[#00C8FF] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">S</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
          <div className={`w-full max-w-[420px] space-y-4 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {!franchiseId ? (
              <FranchiseSelector onVerified={setFranchiseId} />
            ) : (
              <>
                <DSOLoginForm franchiseId={franchiseId} />
                <div className="lg:hidden">
                  <FeaturesCard />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}