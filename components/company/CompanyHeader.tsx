"use client";

import { Menu, Bell, Search, LogOut, Settings, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import UserMenu from "@/components/ui/UserMenu";

interface CompanyHeaderProps {
  onMenuClick: () => void;
}

export default function CompanyHeader({ onMenuClick }: CompanyHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu
              name={user.name || "User"}
              id={user.companyId || ""}
              links={[
                { label: "Settings", href: "/company/settings", icon: Settings },
                { label: "Profile", href: "/company/settings", icon: User },
                { label: "Notifications", icon: Bell },
                { label: "Sign out", icon: LogOut, danger: true, onClick: () => logout() },
              ]}
            />
          ) : (
            <button
              className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">0</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}