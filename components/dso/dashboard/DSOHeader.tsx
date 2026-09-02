"use client";

import Link from "next/link";
import { Bell, Search, Menu, Calendar, Wifi, Settings, User, LogOut } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { useState, useEffect } from "react";
import UserMenu from "@/components/ui/UserMenu";

interface Props { onMenuClick: () => void; }

export default function DSOHeader({ onMenuClick }: Props) {
  const { settings, auth, notifications, dsoLogout } = useDSOData();
  const unread = notifications.filter((n) => !n.read).length;
  const [currentTime, setCurrentTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const userName = settings.dsoName || auth.dsoName || "DSO";
  const userId = auth.franchiseId;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <Menu size={20} />
        </button>
        {/* Search Bar */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 w-80 border border-slate-200 focus-within:border-brand-500/30 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
          <Search size={16} className="text-slate-400" />
          <input type="text" placeholder="Search activations, SIMs..." className="bg-transparent text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none w-full" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Clock */}
        {mounted && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <Calendar size={12} className="text-slate-400" />
            <span className="text-slate-600 text-xs font-medium">{currentTime}</span>
          </div>
        )}

        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 rounded-lg">
          <Wifi size={12} className="text-green-500" />
          <span className="text-green-600 text-[10px] font-bold">Online</span>
        </div>

        {/* Notifications */}
        <Link href="/dso/notifications"
          className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unread}
            </span>
          )}
        </Link>

        {/* User Menu */}
        <UserMenu
          name={userName}
          id={userId}
          links={[
            { label: "Settings", href: "/dso/profile", icon: Settings },
            { label: "Profile", href: "/dso/profile", icon: User },
            { label: "Notifications", href: "/dso/notifications", icon: Bell, unread },
            { label: "Sign out", icon: LogOut, danger: true, onClick: () => dsoLogout() },
          ]}
        />
      </div>
    </header>
  );
}
