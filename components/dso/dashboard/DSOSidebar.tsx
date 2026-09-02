"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDSOData } from "@/lib/DSODataContext";
import { useCompanyLogo } from "@/lib/useCompanyLogo";
import {
  LayoutDashboard, ClipboardCheck, Plus, ArrowRightLeft, Repeat, Hash,
  Fingerprint, PhoneCall, Wifi, Wallet, Target, BarChart3, Bell, User,
  LogOut, X, Smartphone, Wrench
} from "lucide-react";
import { SidebarScroll } from "@/components/ui/SidebarScroll";

type NavItem = { label: string; href: string; icon: any; badgeKey?: "bvs" | "fca" | "ifca" };

const navSections: { title: string; items: NavItem[] }[] = [
  { title: "Main", items: [
    { label: "Dashboard", href: "/dso/dashboard", icon: LayoutDashboard },
  ]},
  { title: "Activation", items: [
    { label: "SIM Stock", href: "/dso/sim-stock", icon: Smartphone },
    { label: "New SIM Activation", href: "/dso/activation", icon: Plus },
    { label: "MNP Process", href: "/dso/mnp", icon: ArrowRightLeft },
    { label: "SIM Replacement", href: "/dso/replacement", icon: Repeat },
    { label: "BYN Registration", href: "/dso/byn", icon: Hash },
  ]},
  { title: "Verification", items: [
    { label: "Pending BVS", href: "/dso/pending-bvs", icon: Fingerprint, badgeKey: "bvs" },
    { label: "Pending FCA", href: "/dso/pending-fca", icon: PhoneCall, badgeKey: "fca" },
    { label: "Pending IFCA", href: "/dso/pending-ifca", icon: Wifi, badgeKey: "ifca" },
  ]},
  { title: "Operations", items: [
    { label: "Attendance", href: "/dso/attendance", icon: ClipboardCheck },
    { label: "Field Equipment", href: "/dso/field-equipment", icon: Wrench },
    { label: "Wallet", href: "/dso/wallet", icon: Wallet },
    { label: "Targets", href: "/dso/targets", icon: Target },
  ]},
  { title: "System", items: [
    { label: "Reports", href: "/dso/reports", icon: BarChart3 },
    { label: "Notifications", href: "/dso/notifications", icon: Bell },
    { label: "Profile", href: "/dso/profile", icon: User },
  ]},
];

interface Props { open: boolean; onClose: () => void; }

export default function DSOSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { dsoLogout, auth, activations } = useDSOData();
  const { headerLogo } = useCompanyLogo();

  const badges = useMemo(() => ({
    bvs: activations.filter((a: any) => a.bvsStatus === "Pending").length,
    fca: activations.filter((a: any) => a.fcaStatus === "Pending" && a.bvsStatus === "Completed").length,
    ifca: activations.filter((a: any) => a.ifcaStatus === "Pending" && a.fcaStatus === "Completed").length,
  }), [activations]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[240px] z-50 flex flex-col
          bg-gradient-to-b from-[#0A2647] via-[#0D2F56] to-[#0A2647]
          shadow-2xl transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] pointer-events-none" />

        <div className="relative px-5 h-16 border-b border-white/10">
          <div className="flex h-full items-center justify-between">
            <Link href="/dso/dashboard" className="flex items-center">
              {headerLogo ? (
                <img src={headerLogo} alt="Logo" className="w-32 h-[36px] sm:w-40 sm:h-[44px] object-contain" />
              ) : (
                <div className="w-32 h-[36px] sm:w-40 sm:h-[44px] bg-gradient-to-br from-[#FFFB63] to-[#F1B308] rounded-[4px] flex items-center justify-center shadow-lg">
                  <span className="text-[#0A2647] font-black text-xl">S</span>
                </div>
              )}
            </Link>
            <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        <SidebarScroll className="sidebar-scroll-dark relative flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${isActive
                          ? "bg-[#FFFB63]/15 text-[#FFFB63]"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#FFFB63] rounded-r-full" />
                      )}
                      <item.icon
                        size={18}
                        className={`transition-colors duration-200 ${
                          isActive ? "text-[#FFFB63]" : "text-white/40 group-hover:text-white/70"
                        }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg">
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </SidebarScroll>

        <div className="relative px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFFB63] to-[#F1B308] flex items-center justify-center text-[#0A2647] text-sm font-bold shadow-lg ring-2 ring-white/10">
              {auth.dsoName?.charAt(0)?.toUpperCase() || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{auth.dsoName}</p>
              <p className="text-white/40 text-xs truncate">{auth.dsoId}</p>
            </div>
          </div>
          <button
            onClick={dsoLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-200 w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
