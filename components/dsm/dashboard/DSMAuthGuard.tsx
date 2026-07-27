"use client";

import { useDSMData } from "@/lib/DSMDataContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DSMAuthGuard({ children }: { children: React.ReactNode }) {
  const { auth, hydrated } = useDSMData();
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("auth-token="));
    if (!hasCookie) {
      router.replace("/dsm-login");
      return;
    }
    if (hydrated && !auth.loggedIn) router.replace("/dsm-login");
  }, [hydrated, auth.loggedIn, router]);

  if (!hydrated) return (
    <div className="min-h-screen bg-[#061B30] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#22C55E]/20 border-t-[#22C55E] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!auth.loggedIn) return null;
  return <>{children}</>;
}
