"use client";

import Link from "next/link";
import { Bell, Search, Menu, Calendar, Wifi } from "lucide-react";
import { useDSMData } from "@/lib/DSMDataContext";
import { useCompanyLogo } from "@/lib/useCompanyLogo";
import { useState, useEffect } from "react";

interface Props { onMenuClick: () => void; }

export default function DSMHeader({ onMenuClick }: Props) {
  const { settings, auth, notifications } = useDSMData();
  const { logo } = useCompanyLogo();
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

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Menu size={20} />
        </button>
        {/* Search Bar */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 w-80 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search DSOs, activations..." className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Clock */}
        {mounted && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-gray-600 text-xs font-medium">{currentTime}</span>
          </div>
        )}

        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 rounded-lg">
          <Wifi size={12} className="text-green-500" />
          <span className="text-green-600 text-[10px] font-bold">Online</span>
        </div>

        {/* Notifications */}
        <Link href="/dsm/notifications"
          className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unread}
            </span>
          )}
        </Link>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-gray-900 text-sm font-bold leading-tight">{settings.dsmName || auth.dsmName || "DSM"}</p>
            <p className="text-[#F1B308] text-[10px] font-semibold">{auth.dsmId}</p>
          </div>
          {logo ? (
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#FFFB63]/20 shadow-sm">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A2647] to-[#144272] flex items-center justify-center text-white font-bold text-xs shadow-md">
              {(settings.dsmName || auth.dsmName || "D").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
