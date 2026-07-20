"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/company/Sidebar";
import CompanyHeader from "@/components/company/CompanyHeader";
import CompanyAuthGuard from "@/components/company/CompanyAuthGuard";
import { LayoutDashboard, Building2, Users, FileText, Settings, BarChart3 } from "lucide-react";

const bottomNavItems = [
  { label: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  { label: "Franchises", href: "/company/franchises", icon: Building2 },
  { label: "Reports", href: "/company/reports", icon: FileText },
  { label: "Settings", href: "/company/settings", icon: Settings },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("company-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((p) => {
      const next = !p;
      localStorage.setItem("company-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <CompanyAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} onToggleCollapse={toggleCollapse} />
        <div className={`transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[280px]"}`}>
          <CompanyHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    </CompanyAuthGuard>
  );
}