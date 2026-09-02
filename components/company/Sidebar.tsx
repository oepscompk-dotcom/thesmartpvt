"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCompanyLogo } from "@/lib/useCompanyLogo";
import {
  LayoutDashboard, Building2, Users, FileText, Settings, BarChart3,
  Shield, Bell, CreditCard, Receipt, Globe, Image, PanelLeftClose, PanelLeftOpen,
  Menu, X, LogOut
} from "lucide-react";
import { SidebarScroll } from "@/components/ui/SidebarScroll";

const navSections = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Franchises", href: "/company/franchises", icon: Building2 },
      { label: "Reports", href: "/company/reports", icon: FileText },
      { label: "Analytics", href: "/company/reports", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/company/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { headerLogo } = useCompanyLogo();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-all duration-300 lg:translate-x-0 flex flex-col ${
          collapsed ? "w-[72px]" : "w-[240px]"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo Header */}
        <div className={`border-b border-gray-100 h-16 flex items-center ${collapsed ? "px-2 justify-center" : "px-4 justify-between"}`}>
          {!collapsed && (
            <Link href="/company/dashboard">
              {headerLogo ? (
                <img src={headerLogo} alt="Logo" className="w-32 h-[36px] sm:w-40 sm:h-[44px] object-contain" />
              ) : (
                <div className="w-32 h-[36px] sm:w-40 sm:h-[44px] bg-gradient-to-br from-[#FFFB63] to-[#F1B308] rounded-[4px] flex items-center justify-center shadow-lg">
                  <span className="text-[#0A2647] font-black text-xl">S</span>
                </div>
              )}
            </Link>
          )}
          {collapsed && (
            <Link href="/company/dashboard">
              <div className="w-7 h-7 bg-gradient-to-br from-[#FFFB63] to-[#F1B308] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[#0A2647] font-black text-xs">S</span>
              </div>
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button onClick={onToggleCollapse}
              className="hidden lg:flex text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <SidebarScroll className="flex-1 overflow-y-auto py-2 px-2">
          {navSections.map((section) => (
            <div key={section.title} className="mb-3">
              {!collapsed && (
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>
              )}
              {collapsed && <div className="mx-auto w-5 h-px bg-gray-200 mb-1.5" />}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                        collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-2"
                      } ${
                        isActive
                          ? "bg-[#0A2647] text-white shadow-md"
                          : "text-gray-600 hover:text-gray-900 hover:bg-[#FFFB63]/10"
                      }`}
                    >
                      <item.icon size={16} className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"} />
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {collapsed && isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#FFFB63] rounded-r-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </SidebarScroll>

        {/* Footer */}
        <div className={`border-t border-gray-100 ${collapsed ? "p-1" : "px-1 py-1.5"}`}>
          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={`flex items-center justify-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-all ${
              collapsed ? "w-full px-2 py-1.5" : "gap-2 mx-auto py-1.5"
            }`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
