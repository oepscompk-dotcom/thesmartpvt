"use client";

import { Menu, Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCompanyData } from "@/lib/CompanyDataContext";

interface CompanyHeaderProps {
  onMenuClick: () => void;
}

export default function CompanyHeader({ onMenuClick }: CompanyHeaderProps) {
  const { logout } = useAuth();
  const { auth } = useCompanyData();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          <div className="hidden sm:block text-left">
            <h1 className="text-lg font-bold text-gray-900">Company Dashboard</h1>
            <p className="text-gray-500 text-xs">{auth.companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search franchises, reports..."
              className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 w-48"
            />
          </div>

          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">3</span>
          </button>

          <div className="relative">
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}