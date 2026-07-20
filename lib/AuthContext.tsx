"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiLoad, apiLoadById, apiSave, apiDelete } from "@/lib/api";

interface User {
  email: string;
  name: string;
  role: "super-admin" | "company" | "franchise-admin" | "dsm" | "dso";
  companyId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: "admin@thesmart.com.pk",
  password: "Pakistan@2020",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = await apiLoadById("franchiseData", "authUser");
        if (stored && stored.data) {
          const parsed = JSON.parse(stored.data);
          if (parsed && parsed.email) {
            setUser(parsed);
          }
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const userData: User = {
        email: ADMIN_CREDENTIALS.email,
        name: "Super Admin",
        role: "super-admin",
      };
      setUser(userData);
      await apiSave("franchiseData", { id: "authUser", data: JSON.stringify(userData) });
      return true;
    }

    if (email.toUpperCase().startsWith("COMP-")) {
      try {
        const companies = await apiLoad("company");
        const company = companies.find(
          (c: any) =>
            c.id.toUpperCase() === email.toUpperCase() &&
            c.password === password &&
            c.status === "Active"
        );
        if (company) {
          const userData: User = {
            email: company.id,
            name: company.name,
            role: "company",
            companyId: company.id,
          };
          setUser(userData);
          await apiSave("franchiseData", { id: "authUser", data: JSON.stringify(userData) });
          return true;
        }
      } catch {
        // silently fail
      }
    }

    return false;
  };

  const logout = async () => {
    setUser(null);
    try {
      await apiDelete("franchiseData", "auth");
    } catch {
      // silently fail
    }
    router.push("/super-admin");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
