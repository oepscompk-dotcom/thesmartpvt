"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiLoad, apiLoadById, apiSave, apiUpdate, apiDelete } from "@/lib/api";

export interface CompanyAuth {
  companyId: string;
  companyName: string;
  loggedIn: boolean;
}

export interface StaffBrief {
  id: string; name: string; mobile: string; status: string;
  salary: number; commission: number; joiningDate: string;
  retailerId: string;
}

export interface CompanyFranchiseSummary {
  id: string; name: string; owner: string; city: string; province: string;
  package: string; status: string;
  dsm: number; dso: number; sims: number; devices: number;
  staff: number; revenue: number; todayActivations: number; attendanceRate: number;
}

export interface CompanyFranchiseDetail extends CompanyFranchiseSummary {
  dsms: StaffBrief[];
  dsos: StaffBrief[];
  newSims: number;
  hlrSims: number;
  simsByNetwork: Record<string, number>;
  simsByStatus: Record<string, number>;
  devicesByBrand: Record<string, number>;
  devicesByStatus: Record<string, number>;
  totalActivations: number;
  pendingActivations: number;
  activationsByType: Record<string, number>;
  totalPayroll: number;
  totalExpenses: number;
  totalIncome: number;
  walletBalance: number;
  equipmentCount: number;
}

interface CompanyDataContextType {
  auth: CompanyAuth;
  hydrated: boolean;
  loading: boolean;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  franchises: CompanyFranchiseSummary[];
  detailMap: Record<string, CompanyFranchiseDetail>;
  totalSIMs: number; totalDevices: number; totalStaff: number;
  totalRevenue: number; todayActivations: number; attendanceRate: number;
  totalPayroll: number; totalExpenses: number; totalIncome: number;
  refreshData: () => void;
}

const CompanyDataContext = createContext<CompanyDataContextType | undefined>(undefined);

export function CompanyDataProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<CompanyAuth>({ companyId: "", companyName: "", loggedIn: false });
  const [franchises, setFranchises] = useState<CompanyFranchiseSummary[]>([]);
  const [detailMap, setDetailMap] = useState<Record<string, CompanyFranchiseDetail>>({});
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = await apiLoadById("franchiseData", "company-auth");
        if (stored && stored.data) {
          const parsed = JSON.parse(stored.data);
          if (parsed.companyId) {
            setAuth({ companyId: parsed.companyId, companyName: parsed.companyName || "", loggedIn: true });
          }
        }
      } catch {}
      setMounted(true);
      setLoading(false);
    };
    initAuth();
  }, []);

  const loadCompanyData = async () => {
    if (!auth.companyId || !mounted) return;
    setLoading(true);

    try {
      const allFranchises = await apiLoad("franchise");
      const companyFranchises = allFranchises.filter((f: any) => f.companyId === auth.companyId);

      const summaries: CompanyFranchiseSummary[] = [];
      const details: Record<string, CompanyFranchiseDetail> = {};

      for (const f of companyFranchises) {
        const fid = f.id;
        const today = new Date().toISOString().split("T")[0];

        const [dsmsRes, dsosRes, simsRes, devicesRes, equipmentRes, payrollRes, expensesRes, accountsRes, walletRes, issueRes, attendanceRes] = await Promise.all([
          apiLoad("dsm", fid),
          apiLoad("dso", fid),
          apiLoad("sim", fid),
          apiLoad("device", fid),
          apiLoad("equipment", fid),
          apiLoad("payrollRecord", fid),
          apiLoad("expense", fid),
          apiLoad("accountEntry", fid),
          apiLoad("walletTransaction", fid),
          apiLoad("simIssueRecord", fid),
          apiLoad("attendanceRecord", fid),
        ]);

        const dsms: any[] = Array.isArray(dsmsRes) ? dsmsRes : [];
        const dsos: any[] = Array.isArray(dsosRes) ? dsosRes : [];
        const simsList: any[] = Array.isArray(simsRes) ? simsRes : [];
        const devicesList: any[] = Array.isArray(devicesRes) ? devicesRes : [];
        const equipmentList: any[] = Array.isArray(equipmentRes) ? equipmentRes : [];
        const payrollList: any[] = Array.isArray(payrollRes) ? payrollRes : [];
        const expensesList: any[] = Array.isArray(expensesRes) ? expensesRes : [];
        const accountsList: any[] = Array.isArray(accountsRes) ? accountsRes : [];
        const walletList: any[] = Array.isArray(walletRes) ? walletRes : [];
        const issueRecords: any[] = Array.isArray(issueRes) ? issueRes : [];
        const attendanceList: any[] = Array.isArray(attendanceRes) ? attendanceRes : [];

        const newSims = simsList.filter((s: any) => s.type === "new" || !s.type).length;
        const hlrSims = simsList.filter((s: any) => s.type === "hlr").length;
        const simsByNetwork: Record<string, number> = {};
        const simsByStatus: Record<string, number> = {};
        simsList.forEach((s: any) => {
          simsByNetwork[s.network] = (simsByNetwork[s.network] || 0) + 1;
          simsByStatus[s.status] = (simsByStatus[s.status] || 0) + 1;
        });

        const devicesByBrand: Record<string, number> = {};
        const devicesByStatus: Record<string, number> = {};
        devicesList.forEach((d: any) => {
          devicesByBrand[d.brand] = (devicesByBrand[d.brand] || 0) + 1;
          devicesByStatus[d.status] = (devicesByStatus[d.status] || 0) + 1;
        });

        const totalPayroll = payrollList.reduce((s: number, p: any) => s + (p.netPay || p.net || p.salary || 0), 0);
        const totalExpenses = expensesList.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
        const totalIncome = accountsList.filter((a: any) => a.type === "income").reduce((s: number, a: any) => s + Number(a.amount || 0), 0);

        const lastWallet = walletList[walletList.length - 1];
        const walletBalance = lastWallet?.balance || 0;

        const totalActivations = issueRecords.reduce((s: number, r: any) => s + (r.simIds?.length || 0), 0);
        const pendingActivations = issueRecords.filter((r: any) => r.status !== "Returned" && r.status !== "Completed").reduce((s: number, r: any) => s + (r.simIds?.length || 0), 0);
        const todayActivations = issueRecords.filter((r: any) => r.issueDate?.startsWith(today)).reduce((sum: number, r: any) => sum + (r.simIds?.length || 0), 0);
        const activationsByType: Record<string, number> = {};
        issueRecords.forEach((r: any) => {
          const t = r.issueType || "activation";
          activationsByType[t] = (activationsByType[t] || 0) + (r.simIds?.length || 0);
        });

        const actualDSMCount = dsms.length;
        const actualDSOCount = dsos.length;
        const actualTotalStaff = actualDSMCount + actualDSOCount || f.dsm + f.dso;

        const todayAtt = attendanceList.filter((a: any) => a.date === today);
        const presentToday = todayAtt.filter((a: any) => a.status === "Present" || a.status === "Late").length;
        const attendanceRate = actualTotalStaff > 0 ? Math.round((presentToday / actualTotalStaff) * 100) : 0;

        const staffBrief = (list: any[]): StaffBrief[] =>
          list.map((s: any) => ({
            id: s.id, name: s.name, mobile: s.mobile || "", status: s.status || "Active",
            salary: Number(s.salary || 0), commission: Number(s.commission || 0),
            joiningDate: s.joiningDate || "", retailerId: s.retailerId || "",
          }));

        const summary: CompanyFranchiseSummary = {
          id: f.id, name: f.name, owner: f.owner, city: f.city, province: f.province,
          package: f.package, status: f.status,
          dsm: actualDSMCount, dso: actualDSOCount, sims: simsList.length, devices: devicesList.length,
          staff: actualTotalStaff, revenue: walletBalance, todayActivations, attendanceRate,
        };

        const detail: CompanyFranchiseDetail = {
          ...summary,
          dsms: staffBrief(dsms),
          dsos: staffBrief(dsos),
          newSims, hlrSims, simsByNetwork, simsByStatus,
          devicesByBrand, devicesByStatus,
          totalActivations, pendingActivations, activationsByType,
          totalPayroll, totalExpenses, totalIncome,
          walletBalance, equipmentCount: equipmentList.length,
        };

        summaries.push(summary);
        details[fid] = detail;
      }

      setFranchises(summaries);
      setDetailMap(details);
    } catch {
      // silently fail
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCompanyData();
  }, [auth.companyId, mounted]);

  const login = async (id: string, password: string): Promise<boolean> => {
    try {
      const companies = await apiLoad("company");
      const company = companies.find(
        (c: any) =>
          c.id.toUpperCase() === id.toUpperCase() &&
          c.password === password &&
          c.status === "Active"
      );
      if (company) {
        setAuth({ companyId: company.id, companyName: company.name, loggedIn: true });
        await apiSave("franchiseData", { id: "company-auth", data: JSON.stringify({ companyId: company.id, companyName: company.name }) });
        return true;
      }
    } catch (e) { console.error("Company login error:", e); }
    return false;
  };

  const logout = async () => {
    setAuth({ companyId: "", companyName: "", loggedIn: false });
    try {
      await apiUpdate("franchiseData", "company-auth", { data: "" });
    } catch {}
  };

  const totalSIMs = franchises.reduce((s, f) => s + f.sims, 0);
  const totalDevices = franchises.reduce((s, f) => s + f.devices, 0);
  const totalStaff = franchises.reduce((s, f) => s + f.staff, 0);
  const totalRevenue = franchises.reduce((s, f) => s + f.revenue, 0);
  const todayActivations = franchises.reduce((s, f) => s + f.todayActivations, 0);
  const attendanceRate = franchises.length > 0 ? Math.round(franchises.reduce((s, f) => s + f.attendanceRate, 0) / franchises.length) : 0;
  const totalPayroll = Object.values(detailMap).reduce((s, d) => s + d.totalPayroll, 0);
  const totalExpenses = Object.values(detailMap).reduce((s, d) => s + d.totalExpenses, 0);
  const totalIncome = Object.values(detailMap).reduce((s, d) => s + d.totalIncome, 0);

  return (
    <CompanyDataContext.Provider value={{
      auth, hydrated: mounted, loading, login, logout,
      franchises, detailMap,
      totalSIMs, totalDevices, totalStaff, totalRevenue, todayActivations, attendanceRate,
      totalPayroll, totalExpenses, totalIncome,
      refreshData: loadCompanyData,
    }}>
      {children}
    </CompanyDataContext.Provider>
  );
}

export function useCompanyData() {
  const ctx = useContext(CompanyDataContext);
  if (!ctx) throw new Error("useCompanyData must be used within CompanyDataProvider");
  return ctx;
}
