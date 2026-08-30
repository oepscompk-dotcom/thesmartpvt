"use client";

import { Bell, Search, Menu, ChevronDown } from "lucide-react";
import { useData } from "@/lib/DataContext";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { settings } = useData();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 w-80 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search franchises, employees..."
            className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFFB63] to-[#F1B308] flex items-center justify-center text-[#0A2647] font-bold text-sm">
              SA
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-gray-900 text-sm font-medium leading-tight">{settings.adminName || "Super Admin"}</p>
            <p className="text-gray-400 text-[10px]">{settings.companyName || "Head Office"}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
