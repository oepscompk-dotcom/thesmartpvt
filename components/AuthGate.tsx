"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_PATHS = [
  "/super-admin",
  "/company-login",
  "/franchise-admin",
  "/dsm-login",
  "/dso-login",
];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
    if (isPublic) {
      setChecked(true);
      return;
    }
    const hasCookie = document.cookie.split(";").some((c) => c.trim().startsWith("auth-token=true"));
    if (!hasCookie) {
      router.replace("/super-admin");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (!checked) return null;

  return <>{children}</>;
}
