"use client";

import { useDSOData } from "@/lib/DSODataContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DSOAuthGuard({ children }: { children: React.ReactNode }) {
  const { auth, hydrated } = useDSOData();
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("auth-token="));
    if (!hasCookie) {
      router.replace("/dso-login");
      return;
    }
    if (hydrated && !auth.loggedIn) router.replace("/dso-login");
  }, [hydrated, auth.loggedIn, router]);

  if (!hydrated) return (
    <div className="min-h-screen bg-[#061B30] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#4DA8DA]/20 border-t-[#4DA8DA] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!auth.loggedIn) return null;
  return <>{children}</>;
}
