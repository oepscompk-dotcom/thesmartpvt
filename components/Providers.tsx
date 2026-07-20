"use client";

import { AuthProvider } from "@/lib/AuthContext";
import { DataProvider } from "@/lib/DataContext";
import { FranchiseDataProvider } from "@/lib/FranchiseDataContext";
import { DSODataProvider } from "@/lib/DSODataContext";
import { DSMDataProvider } from "@/lib/DSMDataContext";
import { CompanyDataProvider } from "@/lib/CompanyDataContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <CompanyDataProvider>
          <FranchiseDataProvider>
            <DSODataProvider>
              <DSMDataProvider>{children}</DSMDataProvider>
            </DSODataProvider>
          </FranchiseDataProvider>
        </CompanyDataProvider>
      </DataProvider>
    </AuthProvider>
  );
}
