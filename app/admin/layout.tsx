"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import DashboardHeader from "@/components/admin/DashboardHeader";
import AuthGuard from "@/components/admin/AuthGuard";
import BottomNav from "@/components/BottomNav";
import { LayoutDashboard, Building2, Users, FileText, Settings } from "lucide-react";

const bottomNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Franchises", href: "/admin/franchises", icon: Building2 },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((p) => {
      const next = !p;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} onToggleCollapse={toggleCollapse} />
        <div className={`transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[280px]"}`}>
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
            {children}
          </main>
        </div>
        <BottomNav items={bottomNavItems} />
      </div>
    </AuthGuard>
  );
}
