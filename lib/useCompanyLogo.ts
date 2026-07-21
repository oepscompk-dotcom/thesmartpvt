"use client";

import { useState, useEffect } from "react";
import { apiLoadById } from "@/lib/api";

export function useCompanyLogo() {
  const [logo, setLogo] = useState("");
  const [headerLogo, setHeaderLogo] = useState("");
  const [footerLogo, setFooterLogo] = useState("");
  const [companyName, setCompanyName] = useState("THE SMART ERP");

  useEffect(() => {
    (async () => {
      try {
        const s = await apiLoadById("adminSettings", "admin");
        if (s) {
          if (s.logo) setLogo(s.logo);
          if (s.headerLogo) setHeaderLogo(s.headerLogo);
          if (s.footerLogo) setFooterLogo(s.footerLogo);
          if (s.companyName) setCompanyName(s.companyName);
        }
      } catch {}
    })();
  }, []);

  return { logo, headerLogo: headerLogo || logo, footerLogo: footerLogo || logo, companyName };
}
