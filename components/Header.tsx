"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useCompanyLogo } from "@/lib/useCompanyLogo";
import { useData } from "@/lib/DataContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { headerLogo } = useCompanyLogo();
  const { settings } = useData();
  const { header } = settings;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleLinks = header?.navLinks?.filter((l) => l.visible) ?? [];

  const portals = [
    { label: "Franchise Admin", href: "/franchise-admin" },
    { label: "DSO Portal", href: "/dso-login" },
    { label: "DSM Portal", href: "/dsm-login" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-md shadow-black/5" : ""}`}>
      <div className="bg-tele-ink text-white/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-end gap-4">
          <div className="flex items-center gap-4">
            {portals.map((p) => (
              <a
                key={p.label}
                href={p.href}
                className="text-[11px] sm:text-xs font-medium hover:text-tele-azure transition-colors"
              >
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-tele-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <a href="#home" className="flex items-center gap-3 group">
              {headerLogo ? (
                <img src={headerLogo} alt="Logo" className="w-40 h-[44px] sm:w-52 sm:h-[57px] object-contain" />
              ) : (
                <div className="w-40 h-[44px] sm:w-52 sm:h-[57px] rounded-[4px] bg-tele-blue flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-white font-black text-2xl sm:text-3xl">S</span>
                </div>
              )}
            </a>

            <nav className="hidden lg:flex items-center gap-1">
              {visibleLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-tele-ink/80 hover:text-tele-blue rounded transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {header?.ctaVisible !== false && (
                <a href={header?.ctaLink || "#login"} className="telenor-btn">
                  {header?.ctaText || "Franchise Login"}
                </a>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-tele-ink p-2 rounded hover:bg-tele-smoke transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileOpen && (
            <div className="lg:hidden mt-3 pb-4 border-t border-tele-line animate-slide-down">
              <nav className="flex flex-col gap-1 pt-3">
                {visibleLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-tele-ink/80 hover:text-tele-blue hover:bg-tele-smoke rounded text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                {header?.ctaVisible !== false && (
                  <a href={header?.ctaLink || "#login"} className="telenor-btn mt-3 self-start">
                    {header?.ctaText || "Franchise Login"}
                  </a>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}