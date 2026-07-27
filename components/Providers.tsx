"use client";

import { AuthProvider } from "@/lib/AuthContext";
import { DataProvider } from "@/lib/DataContext";
import { FranchiseDataProvider } from "@/lib/FranchiseDataContext";
import { DSODataProvider } from "@/lib/DSODataContext";
import { DSMDataProvider } from "@/lib/DSMDataContext";
import { CompanyDataProvider } from "@/lib/CompanyDataContext";
import AuthGate from "@/components/AuthGate";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <CompanyDataProvider>
          <FranchiseDataProvider>
            <DSODataProvider>
              <DSMDataProvider>
                <AuthGate>{children}</AuthGate>
              </DSMDataProvider>
            </DSODataProvider>
          </FranchiseDataProvider>
        </CompanyDataProvider>
      </DataProvider>
    </AuthProvider>
  );
}
