"use client";

import { Bell, Search, Menu, Settings, User, LogOut } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { useAuth } from "@/lib/AuthContext";
import UserMenu from "@/components/ui/UserMenu";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { settings } = useData();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 w-80 border border-slate-200 focus-within:border-brand-500/30 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search franchises, employees..."
            className="bg-transparent text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <UserMenu
          name={user?.name || settings.companyName || "Super Admin"}
          id={settings.companyName || "Administrator"}
          links={[
            { label: "Settings", href: "/admin/settings", icon: Settings },
            { label: "Profile", href: "/admin/settings", icon: User },
            { label: "Notifications", href: "/admin/notifications", icon: Bell },
            { label: "Sign out", icon: LogOut, danger: true, onClick: () => logout() },
          ]}
        />
      </div>
    </header>
  );
}
