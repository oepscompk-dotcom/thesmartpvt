"use client";

import { useCompanyLogo } from "@/lib/useCompanyLogo";
import { useData } from "@/lib/DataContext";

export default function Footer() {
  const { footerLogo, companyName } = useCompanyLogo();
  const { settings } = useData();
  const { footer } = settings;

  return (
    <footer className="relative bg-tele-ink pt-16 pb-8">
      <div className="absolute top-0 left-0 w-full h-px bg-tele-yellow/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-5">
              {footerLogo ? (
                <img src={footerLogo} alt="Logo" className="w-16 h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-[4px] bg-tele-blue flex items-center justify-center shadow-sm">
                  <span className="text-white font-black text-2xl">S</span>
                </div>
              )}
            </div>
            <p className="text-tele-gray-light text-sm leading-relaxed mb-6 max-w-sm">
              {footer?.description || "A Step Towards a New Horizon. Enterprise SaaS platform for multi-franchise telecom distribution management."}
            </p>
            <div className="space-y-2">
              {(footer?.features || ["Smart Distribution", "Smart Inventory", "Smart Finance", "Smart Growth"]).map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-6 h-2 rounded-full bg-tele-yellow" />
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {(footer?.linkColumns || []).map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-tele-gray-light hover:text-tele-azure text-sm transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {footer?.showCenterLogo !== false && (
          <div className="flex items-center justify-center bg-white/5 rounded-md px-6 py-4 border border-white/10 mb-8 mt-2">
            {footer?.centerLogo ? (
              <img src={footer.centerLogo} alt="Center Logo" style={{ maxHeight: `${footer?.centerLogoSize || 48}px` }} className="max-w-full object-contain" />
            ) : footerLogo ? (
              <img src={footerLogo} alt="Logo" style={{ maxHeight: `${footer?.centerLogoSize || 48}px` }} className="max-w-full object-contain" />
            ) : (
              <div className="w-24 h-24 rounded-md bg-tele-blue flex items-center justify-center">
                <span className="text-white font-black text-3xl">S</span>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-white/10 pt-7">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
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
                  <a key={link.text} href={finalHref} className="text-white/40 hover:text-tele-yellow text-sm transition-colors duration-300">
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