"use client";

import { useData } from "@/lib/DataContext";

export default function FooterRightLogo() {
  const { settings } = useData();
  const logo = settings.footer?.footerRightLogo;

  if (!logo) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-0 hidden sm:block lg:bottom-5 lg:right-6">
      <img src={logo} alt="Footer Right Logo" className="w-[180px] h-auto max-h-[31px] object-contain opacity-80" />
    </div>
  );
}
