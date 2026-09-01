"use client";

import { useState } from "react";
import DSMSidebar from "@/components/dsm/dashboard/DSMSidebar";
import DSMHeader from "@/components/dsm/dashboard/DSMHeader";
import DSMAuthGuard from "@/components/dsm/dashboard/DSMAuthGuard";
import BottomNav from "@/components/BottomNav";
import { LayoutDashboard, Plus, ClipboardCheck, Users, User } from "lucide-react";

const bottomNavItems = [
  { label: "Home", href: "/dsm/dashboard", icon: LayoutDashboard },
  { label: "Activate", href: "/dsm/activation", icon: Plus },
  { label: "Verify", href: "/dsm/pending-bvs", icon: ClipboardCheck },
  { label: "Team", href: "/dsm/dso-management", icon: Users },
  { label: "Profile", href: "/dsm/profile", icon: User },
];

export default function DSMLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <DSMAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <DSMSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-[240px]">
          <DSMHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">{children}</main>
        </div>
        <BottomNav items={bottomNavItems} color="#0A2647" />
      </div>
    </DSMAuthGuard>
  );
}
