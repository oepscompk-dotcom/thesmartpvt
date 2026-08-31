"use client";

import { useEffect, useState } from "react";
import BackgroundAnimation from "@/components/super-admin/BackgroundAnimation";
import AdminLoginCard from "@/components/super-admin/AdminLoginCard";
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
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFFB63] to-[#F1B308] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[#0C1026] font-black text-lg">S</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Layout */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div
            className={`flex justify-center w-full transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <AdminLoginCard />
          </div>
        </main>
      </div>
    </div>
  );
}