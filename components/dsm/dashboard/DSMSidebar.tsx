"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDSMData } from "@/lib/DSMDataContext";
import { useCompanyLogo } from "@/lib/useCompanyLogo";
import {
  LayoutDashboard, Users, Plus, ArrowRightLeft, Repeat, Hash,
  Fingerprint, PhoneCall, Wifi, Wallet, Target, BarChart3, Bell, User,
  LogOut, X, Smartphone, ClipboardCheck, Award, FileText, Wrench
} from "lucide-react";

type DSMNavItem = { label: string; href: string; icon: any; badge?: "bvs" | "fca" | "ifca" };

const navSections: { title: string; items: DSMNavItem[] }[] = [
  { title: "Main", items: [
    { label: "Dashboard", href: "/dsm/dashboard", icon: LayoutDashboard },
  ]},
  { title: "Activation", items: [
    { label: "SIM Stock", href: "/dsm/sim-stock", icon: Smartphone },
    { label: "New SIM Activation", href: "/dsm/activation", icon: Plus },
    { label: "MNP Process", href: "/dsm/mnp", icon: ArrowRightLeft },
    { label: "SIM Replacement", href: "/dsm/replacement", icon: Repeat },
    { label: "BYN Registration", href: "/dsm/byn", icon: Hash },
  ]},
  { title: "Verification", items: [
    { label: "Pending BVS", href: "/dsm/pending-bvs", icon: Fingerprint, badge: "bvs" },
    { label: "Pending FCA", href: "/dsm/pending-fca", icon: PhoneCall, badge: "fca" },
    { label: "Pending IFCA", href: "/dsm/pending-ifca", icon: Wifi, badge: "ifca" },
  ]},
  { title: "Team Management", items: [
    { label: "DSO Management", href: "/dsm/dso-management", icon: Users },
    { label: "Field Equipment", href: "/dsm/field-equipment", icon: Wrench },
    { label: "Attendance", href: "/dsm/attendance", icon: ClipboardCheck },
    { label: "Targets", href: "/dsm/targets", icon: Target },
    { label: "Team Performance", href: "/dsm/team-performance", icon: Award },
  ]},
  { title: "System", items: [
    { label: "Wallet", href: "/dsm/wallet", icon: Wallet },
    { label: "Reports", href: "/dsm/reports", icon: FileText },
    { label: "Notifications", href: "/dsm/notifications", icon: Bell },
    { label: "Profile", href: "/dsm/profile", icon: User },
  ]},
];

interface Props { open: boolean; onClose: () => void; }

export default function DSMSidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { dsmLogout, auth, activations } = useDSMData();
  const { logo } = useCompanyLogo();

  const badges = useMemo(() => ({
    bvs: activations.filter((a) => a.bvsStatus === "Pending").length,
    fca: activations.filter((a) => a.fcaStatus === "Pending" && a.bvsStatus === "Completed").length,
    ifca: activations.filter((a) => a.ifcaStatus === "Pending" && a.fcaStatus === "Completed").length,
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
        className={`fixed top-0 left-0 h-full w-[280px] z-50 flex flex-col
          bg-gradient-to-b from-[#0A2647] via-[#0D2F56] to-[#0A2647]
          shadow-2xl transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] pointer-events-none" />
        <div className="relative px-5 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
<Link href="/dsm/dashboard" className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="w-11 h-11 rounded-xl object-cover shadow-lg ring-2 ring-[#FFFB63]/20" />
            ) : (
              <div className="w-11 h-11 bg-gradient-to-br from-[#FFFB63] to-[#F1B308] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[#0A2647] font-black text-lg">S</span>
              </div>
            )}
          </Link>
            <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const badgeCount = item.badge ? badges[item.badge] : 0;
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
                        className={`flex-shrink-0 transition-colors duration-200 ${
                          isActive ? "text-[#FFFB63]" : "text-white/40 group-hover:text-white/70"
                        }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFFB63] to-[#F1B308] flex items-center justify-center text-[#0A2647] font-bold text-sm shadow-lg ring-2 ring-white/10">
              {auth.dsmName?.charAt(0)?.toUpperCase() || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{auth.dsmName}</p>
              <p className="text-white/40 text-xs truncate">{auth.dsmId}</p>
            </div>
          </div>
          <button
            onClick={dsmLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all duration-200 w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
