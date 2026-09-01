"use client";

import { useState, useEffect } from "react";
import FranchiseSidebar from "@/components/franchise/dashboard/FranchiseSidebar";
import FranchiseHeader from "@/components/franchise/dashboard/FranchiseHeader";
import FranchiseAuthGuard from "@/components/franchise/dashboard/FranchiseAuthGuard";
import BottomNav from "@/components/BottomNav";
import { LayoutDashboard, UserCheck, Users, ClipboardCheck, Settings } from "lucide-react";

const bottomNavItems = [
  { label: "Dashboard", href: "/franchise/dashboard", icon: LayoutDashboard },
  { label: "DSM", href: "/franchise/dsm", icon: UserCheck },
  { label: "DSO", href: "/franchise/dso", icon: Users },
  { label: "Attendance", href: "/franchise/attendance", icon: ClipboardCheck },
  { label: "Settings", href: "/franchise/settings", icon: Settings },
];

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("franchise-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((p) => {
      const next = !p;
      localStorage.setItem("franchise-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <FranchiseAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <FranchiseSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} onToggleCollapse={toggleCollapse} />
        <div className={`transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"}`}>
          <FranchiseHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">{children}</main>
        </div>
        <BottomNav items={bottomNavItems} />
      </div>
    </FranchiseAuthGuard>
  );
}
