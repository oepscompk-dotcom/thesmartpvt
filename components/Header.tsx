"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useCompanyLogo } from "@/lib/useCompanyLogo";
import { useData } from "@/lib/DataContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { headerLogo, companyName } = useCompanyLogo();
  const { settings } = useData();
  const { header } = settings;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visibleLinks = header?.navLinks?.filter((l) => l.visible) ?? [];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-brand-navy/95 backdrop-blur-xl shadow-lg shadow-black/20 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3 group">
            {headerLogo ? (
              <img src={headerLogo} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-lg group-hover:shadow-glow transition-shadow duration-300" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-shadow duration-300">
                <span className="text-brand-navy font-black text-lg sm:text-xl">S</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm sm:text-lg leading-tight tracking-wide">
                {companyName || "THE SMART"}
              </span>
              <span className="text-brand-gold text-[10px] sm:text-xs font-medium tracking-wider">
                {header?.tagline || "A Step Towards a New Horizon"}
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-brand-gold rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {header?.ctaVisible !== false && (
              <a
                href={header?.ctaLink || "#login"}
                className="px-6 py-2.5 bg-gold-gradient text-brand-navy font-semibold text-sm rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                {header?.ctaText || "Franchise Login"}
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 animate-slide-down">
            <nav className="flex flex-col gap-1 pt-4">
              {visibleLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-white/80 hover:text-brand-gold hover:bg-white/5 rounded-lg transition-all text-sm font-medium"
                >
                  {link.name}
                </a>
              ))}
              {header?.ctaVisible !== false && (
                <a
                  href={header?.ctaLink || "#login"}
                  className="mt-3 mx-4 px-6 py-3 bg-gold-gradient text-brand-navy font-semibold text-sm rounded-xl text-center hover:shadow-glow transition-all"
                >
                  {header?.ctaText || "Franchise Login"}
                </a>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
