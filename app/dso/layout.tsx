"use client";

import { useState } from "react";
import DSOSidebar from "@/components/dso/dashboard/DSOSidebar";
import DSOHeader from "@/components/dso/dashboard/DSOHeader";
import DSOAuthGuard from "@/components/dso/dashboard/DSOAuthGuard";
import BottomNav from "@/components/BottomNav";
import { LayoutDashboard, Plus, ClipboardCheck, Wallet, User } from "lucide-react";

const bottomNavItems = [
  { label: "Home", href: "/dso/dashboard", icon: LayoutDashboard },
  { label: "Activate", href: "/dso/activation", icon: Plus },
  { label: "Verify", href: "/dso/pending-bvs", icon: ClipboardCheck },
  { label: "Wallet", href: "/dso/wallet", icon: Wallet },
  { label: "Profile", href: "/dso/profile", icon: User },
];

export default function DSOLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <DSOAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <DSOSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-[280px]">
          <DSOHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">{children}</main>
        </div>
        <BottomNav items={bottomNavItems} color="#0A2647" />
      </div>
    </DSOAuthGuard>
  );
}
