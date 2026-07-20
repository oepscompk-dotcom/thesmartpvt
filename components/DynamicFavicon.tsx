"use client";

import { useEffect } from "react";

export default function DynamicFavicon() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("smart-erp-settings");
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = settings.favicon;
        }
      }
    } catch {}
  }, []);

  return null;
}
