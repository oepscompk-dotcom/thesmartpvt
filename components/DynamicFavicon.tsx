"use client";

import { useEffect } from "react";
import { apiLoadById } from "@/lib/api";

export default function DynamicFavicon() {
  useEffect(() => {
    (async () => {
      try {
        const settings = await apiLoadById("adminSettings", "admin-settings");
        if (settings?.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = settings.favicon;
        }
      } catch {}
    })();
  }, []);

  return null;
}
