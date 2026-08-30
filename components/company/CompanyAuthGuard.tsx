"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CompanyAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("auth-token="));
    if (!hasCookie) {
      router.replace("/company-login");
      return;
    }
    if (!loading && (!isAuthenticated || user?.role !== "company")) {
      router.replace("/company-login");
    }
  }, [isAuthenticated, loading, router, user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061B30] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2D28CD]/20 border-t-[#00C8FF] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "company") return null;

  return <>{children}</>;
}