"use client";

import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FranchiseAuthGuard({ children }: { children: React.ReactNode }) {
  const { auth, hydrated } = useFranchiseData();
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("auth-token="));
    if (!hasCookie) {
      router.replace("/franchise-admin");
      return;
    }
    if (hydrated && !auth.loggedIn) {
      router.replace("/franchise-admin");
    }
  }, [hydrated, auth.loggedIn, router]);

  if (!hydrated) return (
    <div className="min-h-screen bg-[#061B30] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#FFFB63]/20 border-t-[#FFFB63] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!auth.loggedIn) return null;
  return <>{children}</>;
}
