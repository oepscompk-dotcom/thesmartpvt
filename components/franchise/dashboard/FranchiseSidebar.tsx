"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { useCompanyLogo } from "@/lib/useCompanyLogo";
import {
  LayoutDashboard, Users, Smartphone, Wrench, ClipboardCheck,
  Target, Wallet, Receipt, BarChart3, Bell, Settings,
  User, LogOut, X, UserCheck, CreditCard, Package, ArrowRightLeft,
  ChevronLeft, Layers, PanelLeftClose, PanelLeftOpen, DollarSign
} from "lucide-react";
import { SidebarScroll } from "@/components/ui/SidebarScroll";

const navSections = [
  { title: "Main", items: [
    { label: "Dashboard", href: "/franchise/dashboard", icon: LayoutDashboard },
  ]},
  { title: "Employee Management", items: [
    { label: "DSM Management", href: "/franchise/dsm", icon: UserCheck },
    { label: "DSO Management", href: "/franchise/dso", icon: Users },
  ]},
  { title: "Inventory", items: [
    { label: "Device Management", href: "/franchise/devices", icon: Smartphone },
    { label: "New SIM Stock", href: "/franchise/new-sims", icon: Package },
    { label: "HLR SIM Stock", href: "/franchise/hlr-sims", icon: Layers },
    { label: "Active SIMs", href: "/franchise/active-sims", icon: CreditCard },
    { label: "Issued & Returns", href: "/franchise/issued-returns", icon: ArrowRightLeft },
    { label: "Field Equipment", href: "/franchise/equipment", icon: Wrench },
  ]},
  { title: "Operations", items: [
    { label: "Attendance", href: "/franchise/attendance", icon: ClipboardCheck },
    { label: "Targets", href: "/franchise/targets", icon: Target },
    { label: "Wallet System", href: "/franchise/wallet", icon: Wallet },
  ]},
  { title: "Finance", items: [
    { label: "Payroll", href: "/franchise/payroll", icon: CreditCard },
    { label: "Salary Detail", href: "/franchise/salary-detail", icon: DollarSign },
    { label: "Accounts", href: "/franchise/accounts", icon: BarChart3 },
    { label: "Accounting", href: "/franchise/accounting", icon: Receipt },
    { label: "Expenses", href: "/franchise/expenses", icon: Receipt },
  ]},
  { title: "System", items: [
    { label: "Reports", href: "/franchise/reports", icon: Package },
    { label: "Notifications", href: "/franchise/notifications", icon: Bell },
    { label: "Settings", href: "/franchise/settings", icon: Settings },
    { label: "Profile", href: "/franchise/profile", icon: User },
  ]},
];

interface Props {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function FranchiseSidebar({ open, onClose, collapsed, onToggleCollapse }: Props) {
  const pathname = usePathname();
  const { logout, notifications } = useFranchiseData();
  const { logo, headerLogo } = useCompanyLogo();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-all duration-300 lg:translate-x-0 flex flex-col ${
        collapsed ? "w-[72px]" : "w-[240px]"
      } ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        {/* Logo Header */}
        <div className={`border-b border-gray-100 bg-gradient-to-r from-[#0A2647]/5 to-transparent h-16 flex items-center ${
          collapsed ? "px-2 justify-center" : "px-4 justify-between"
        }`}>
          {!collapsed && (
            <Link href="/franchise/dashboard" onClick={onClose}>
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
            <Link href="/franchise/dashboard" onClick={onClose}>
              {logo ? (
                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg ring-2 ring-[#FFFB63]/20">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFFB63] to-[#F1B308] rounded-xl flex items-center justify-center shadow-lg ring-2 ring-[#FFFB63]/20">
                  <span className="text-[#0A2647] font-black text-xs">S</span>
                </div>
              )}
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button onClick={onToggleCollapse}
              className="hidden lg:flex text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <SidebarScroll className="flex-1 overflow-y-auto py-2 px-2">
          {navSections.map((section) => (
            <div key={section.title} className="mb-2.5">
              {!collapsed && (
                <p className="px-3 mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">{section.title}</p>
              )}
              {collapsed && <div className="mx-auto w-5 h-px bg-gray-200 mb-1.5" />}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const isNotif = item.label === "Notifications" && unreadCount > 0;
                  return (
                    <Link key={item.label} href={item.href} onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                        collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-2"
                      } ${
                        isActive
                          ? "bg-[#0A2647] text-white shadow-md shadow-[#0A2647]/20"
                          : "text-gray-600 hover:text-gray-900 hover:bg-[#FFFB63]/10"
                      }`}>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#FFFB63] rounded-r-full" />
                      )}
                      <item.icon size={16} className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"} />
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {!collapsed && isNotif && (
                        <span className="w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">{unreadCount}</span>
                      )}
                      {collapsed && isNotif && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </SidebarScroll>

        {/* User Footer */}
        <div className={`border-t border-gray-100 ${collapsed ? "p-1.5" : "p-2.5"}`}>
          <button onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={`flex items-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-all w-full ${
              collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-2"
            }`}>
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
