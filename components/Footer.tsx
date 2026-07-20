"use client";

import { useCompanyLogo } from "@/lib/useCompanyLogo";
import { useData } from "@/lib/DataContext";

export default function Footer() {
  const { footerLogo, companyName } = useCompanyLogo();
  const { settings } = useData();
  const { footer } = settings;

  return (
    <footer className="relative bg-brand-navy-dark pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              {footerLogo ? (
                <img src={footerLogo} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
              ) : (
                <div className="w-12 h-12 bg-gold-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-brand-navy font-black text-xl">S</span>
                </div>
              )}
              <div>
                <span className="text-white font-bold text-lg block leading-tight">
                  {companyName || "THE SMART"}
                </span>
                <span className="text-brand-gold text-xs font-medium">
                  Pvt. Ltd.
                </span>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-sm">
              {footer?.description || "A Step Towards a New Horizon. Enterprise SaaS platform for multi-franchise telecom distribution management."}
            </p>
            <div className="space-y-2">
              {(footer?.features || ["Smart Distribution", "Smart Inventory", "Smart Finance", "Smart Growth"]).map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/60" />
                  <span className="text-white/60 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {(footer?.linkColumns || []).map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/40 hover:text-brand-gold text-sm transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {footer?.showCenterLogo !== false && (
          <div className="flex items-center justify-center bg-white/5 rounded-2xl px-6 py-4 border border-white/10 mb-8 mt-4">
            {footer?.centerLogo ? (
              <img src={footer.centerLogo} alt="Center Logo" style={{ maxHeight: `${footer?.centerLogoSize || 48}px` }} className="max-w-full object-contain" />
            ) : footerLogo ? (
              <img src={footerLogo} alt="Logo" style={{ maxHeight: `${footer?.centerLogoSize || 48}px` }} className="max-w-full object-contain" />
            ) : (
              <div className="w-24 h-24 bg-gold-gradient rounded-2xl flex items-center justify-center">
                <span className="text-brand-navy font-black text-3xl">S</span>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              &copy; 2026 {companyName || "THE SMART Pvt. Ltd."} {footer?.copyrightText || "All Rights Reserved."}
            </p>
            <div className="flex items-center gap-6">
              {(footer?.bottomLinks || []).map((link) => {
                const hrefMap: Record<string, string> = {
                  "Privacy Policy": "/privacy-policy",
                  "Terms of Service": "/terms-of-service",
                  "Cookie Policy": "/cookie-policy",
                };
                const finalHref = hrefMap[link.text] || link.href;
                return (
                  <a key={link.text} href={finalHref} className="text-white/30 hover:text-brand-gold text-sm transition-colors duration-300">
                    {link.text}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
