"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { apiLoad, apiLoadById, apiSave, apiUpdate, apiDelete } from "@/lib/api";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie";

export interface DSMAuth {
  dsmId: string; dsmName: string; franchiseId: string; loggedIn: boolean;
}

export interface DSMActivation {
  id: string; type: "New SIM" | "MNP" | "Replacement" | "BYN"; simNumber: string;
  network: string; customerName: string; customerCNIC: string; contactNumber: string; status: string;
  bvsStatus: string; fcaStatus: string; ifcaStatus: string; progress: number;
  createdAt: string; dsmId: string; dsoId: string; franchiseId: string;
  bvsDate?: string; bvsNotes?: string;
  fcaDate?: string; fcaNotes?: string;
  ifcaDate?: string; ifcaNotes?: string;
}

export interface DSORecord {
  id: string; name: string; attendance: string; sales: number; target: number;
  status: "Active" | "Excellent" | "Good" | "Absent" | "Inactive";
  mobile: string; monthlySales: number; bvsDone: number; fcaDone: number; ifcaDone: number;
  commission: number; joinDate: string;
}

export interface DSMDailyReport {
  date: string; activations: number; mnp: number; bvs: number; fca: number; ifca: number;
  present: number; absent: number; pendingCases: number;
}

export interface DSMWeeklyReport {
  week: string; activations: number; mnp: number; targetAchieved: number; attendance: number;
}

export interface DSMTarget {
  id: string; dsoId: string; dsoName: string; type: string; daily: number;
  monthly: number; dailyAchieved: number; monthlyAchieved: number; month: string;
}

export interface DSMWallet {
  id: string; type: "Credit" | "Debit"; amount: number; balance: number;
  note: string; date: string;
}

export interface DSMNotification {
  id: string; title: string; message: string; type: string; time: string; read: boolean;
}

export interface DSMReportSubmission {
  id: string; type: "Daily" | "Weekly" | "Monthly"; date: string;
  content: string; status: "Submitted" | "Pending" | "Approved";
}

export interface DSODAttendance {
  id: string; dsoId: string; dsoName: string; date: string;
  checkIn: string; checkOut: string; hoursWorked: number;
  status: "Present" | "Absent" | "Late";
}

export interface DSOLeaveRequest {
  id: string; dsoId: string; dsoName: string; date: string; reason: string;
  status: "Pending" | "Approved" | "Rejected"; reviewedBy: string; reviewedAt: string;
  franchiseId: string;
}

export interface DSOAttendanceWarning {
  id: string; dsoId: string; date: string; type: "consecutive_absent" | "late" | "fine";
  message: string; fineAmount: number; franchiseId: string;
}

export interface DSMSim {
  id: string; network: string; simNumber: string; iccid: string;
  deviceId: string; status: string; receiveDate: string;
  franchiseId: string; type: string;
  issuedToId?: string; issuedToName?: string; issuedToRole?: string;
}

interface DSMDataContextType {
  auth: DSMAuth; hydrated: boolean; dsmLogin: (id: string, password: string) => Promise<boolean>; dsmLogout: () => Promise<void>;
  updateProfile: (updates: { dsmName?: string; email?: string; phone?: string }) => Promise<void>;
  activations: DSMActivation[]; addActivation: (a: DSMActivation) => Promise<void>;
  updateActivation: (id: string, updates: Partial<DSMActivation>) => Promise<void>;
  deleteActivation: (id: string) => Promise<void>;
  dsos: DSORecord[];
  sims: DSMSim[];
  importVerifications: Record<string, { bvs: string; fca: string; ifca: string }>;
  attendance: DSODAttendance[];
  leaveRequests: DSOLeaveRequest[]; reviewLeaveRequest: (id: string, status: "Approved" | "Rejected") => Promise<void>;
  warnings: DSOAttendanceWarning[];
  dailyReports: DSMDailyReport[];
  weeklyReports: DSMWeeklyReport[];
  targets: DSMTarget[]; updateTarget: (id: string, t: Partial<DSMTarget>) => Promise<void>; addTarget: (t: DSMTarget) => Promise<void>;
  wallet: DSMWallet[]; addWalletEntry: (w: DSMWallet) => Promise<void>;
  notifications: DSMNotification[]; markNotificationRead: (id: string) => Promise<void>;
  reportSubmissions: DSMReportSubmission[]; submitReport: (r: DSMReportSubmission) => Promise<void>;
  teamSize: number; totalSales: number; totalRevenue: number;
  settings: { franchiseName: string; logo: string; companyName: string; dsmName: string };
}

const DSMDataContext = createContext<DSMDataContextType | undefined>(undefined);

export function DSMDataProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<DSMAuth>({ dsmId: "", dsmName: "", franchiseId: "", loggedIn: false });
  const [activations, setActivations] = useState<DSMActivation[]>([]);
  const [dsos, setDSOs] = useState<DSORecord[]>([]);
  const [dailyReports, setDailyReports] = useState<DSMDailyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<DSMWeeklyReport[]>([]);
  const [targets, setTargets] = useState<DSMTarget[]>([]);
  const [wallet, setWallet] = useState<DSMWallet[]>([]);
  const [notifications, setNotifications] = useState<DSMNotification[]>([]);
  const [reportSubmissions, setReportSubmissions] = useState<DSMReportSubmission[]>([]);
  const [attendance, setAttendance] = useState<DSODAttendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<DSOLeaveRequest[]>([]);
  const [warnings, setWarnings] = useState<DSOAttendanceWarning[]>([]);
  const [allFranchiseSims, setAllFranchiseSims] = useState<DSMSim[]>([]);
  const [importVerifications, setImportVerifications] = useState<Record<string, { bvs: string; fca: string; ifca: string }>>({});
  const [mounted, setMounted] = useState(false);
  const [settingsData, setSettingsData] = useState({ companyName: "THE SMART ERP", logo: "", franchiseName: "" });

  const fId = auth.franchiseId || "";

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const stored = await apiLoadById("franchiseData", "dsm-auth");
        if (stored?.data) setAuth(JSON.parse(stored.data));
      } catch {}
      setMounted(true);
    };
    loadAuth();
  }, []);

  useEffect(() => {
    if (!fId || !mounted) return;
    const loadAll = async () => {
      try {
        const [actRes, tgtRes, wltRes, notifRes, reportRes, simRes, dsoRes, attRes, adminSettings, franchiseRecord, loadedVerifications] = await Promise.all([
          apiLoad("dsmActivation", fId),
          apiLoad("dsmTargetEntry", fId),
          apiLoad("dsmWalletEntry", fId),
          apiLoad("dsmNotification"),
          apiLoad("dsmReportSubmission", fId),
          apiLoad("sim", fId),
          apiLoad("dso", fId),
          apiLoad("dsoAttendance", fId),
          apiLoadById("adminSettings", "admin").catch(() => null),
          apiLoadById("franchise", fId).catch(() => null),
          apiLoad("franchiseSimVerification").catch(() => []),
        ]);
        setActivations(actRes);
        setTargets(tgtRes);
        setWallet(wltRes);
        setNotifications(notifRes);
        setReportSubmissions(reportRes);
        setAllFranchiseSims(simRes);
        setDSOs(dsoRes);
        setAttendance(attRes);
        const vMap: Record<string, { bvs: string; fca: string; ifca: string }> = {};
        (Array.isArray(loadedVerifications) ? loadedVerifications : []).forEach((v: any) => {
          if (v.simNumber) vMap[v.simNumber] = { bvs: v.bvs || "X", fca: v.fca || "X", ifca: v.ifca || "X" };
        });
        setImportVerifications(vMap);
        setSettingsData({
          companyName: adminSettings?.companyName || "THE SMART ERP",
          logo: adminSettings?.logo || "",
          franchiseName: franchiseRecord?.name || "Northern Region Rawalpindi",
        });
      } catch {}
    };
    loadAll();
  }, [fId, mounted]);

  const dsmLogin = async (id: string, password: string): Promise<boolean> => {
    try {
      const user = await apiLoadById("dsm", id);
      if (user && (user.id === id || user.username === id) && user.password === password && user.status === "Active") {
        const newAuth = { dsmId: user.id, dsmName: user.name, franchiseId: user.franchiseId, loggedIn: true };
        setAuth(newAuth);
        await apiSave("franchiseData", { id: "dsm-auth", data: JSON.stringify(newAuth) });
        setAuthCookie();
        return true;
      }
    } catch (e) { console.error("DSM login error:", e); }
    return false;
  };

  const dsmLogout = async () => {
    const empty = { dsmId: "", dsmName: "", franchiseId: "", loggedIn: false };
    setAuth(empty);
    clearAuthCookie();
    try { await apiUpdate("franchiseData", "dsm-auth", { data: JSON.stringify(empty) }); } catch {}
  };

  const updateProfile = async (updates: { dsmName?: string; email?: string; phone?: string }) => {
    if (updates.dsmName !== undefined) {
      setAuth((prev) => {
        const updated = { ...prev, dsmName: updates.dsmName! };
        apiUpdate("franchiseData", "dsm-auth", { data: JSON.stringify(updated) }).catch(() => {});
        return updated;
      });
    }
    if (updates.email !== undefined || updates.phone !== undefined) {
      try {
        const existing = await apiLoadById("franchiseData", "dsm-profile");
        const current = existing?.data ? JSON.parse(existing.data) : {};
        await apiUpdate("franchiseData", "dsm-profile", { data: JSON.stringify({ ...current, ...updates }) });
      } catch {}
    }
  };

  const addActivation = async (a: DSMActivation) => {
    setActivations((p) => [a, ...p]);
    try { await apiSave("dsmActivation", a); } catch {}
  };

  const updateActivation = async (id: string, updates: Partial<DSMActivation>) => {
    let fullUpdate: DSMActivation | null = null;
    setActivations((prev) => {
      return prev.map((a) => {
        if (a.id !== id) return a;
        const merged = { ...a, ...updates };
        let progress = 0;
        if (merged.bvsStatus === "Completed") progress += 33;
        if (merged.fcaStatus === "Completed") progress += 33;
        if (merged.ifcaStatus === "Completed") progress += 34;
        merged.progress = progress;
        if (progress === 100) merged.status = "Completed";
        else if (merged.bvsStatus === "Completed" && merged.fcaStatus !== "Completed") merged.status = "Pending FCA";
        else if (merged.fcaStatus === "Completed" && merged.ifcaStatus !== "Completed") merged.status = "Pending IFCA";
        else if (merged.bvsStatus !== "Completed") merged.status = "Pending BVS";
        fullUpdate = merged;
        return merged;
      });
    });
    if (fullUpdate) {
      try { await apiSave("dsmActivation", fullUpdate); } catch (e) { console.error("updateActivation save failed:", e); }
    }
  };

  const deleteActivation = async (id: string) => {
    setActivations((prev) => prev.filter((a) => a.id !== id));
    try { await apiDelete("dsmActivation", id); } catch {}
  };

  const updateTarget = async (id: string, t: Partial<DSMTarget>) => {
    setTargets((prev) => prev.map((tg) => (tg.id === id ? { ...tg, ...t } : tg)));
    try { await apiUpdate("dsmTargetEntry", id, t); } catch {}
  };

  const addTarget = async (t: DSMTarget) => {
    setTargets((p) => [t, ...p]);
    try { await apiSave("dsmTargetEntry", t); } catch {}
  };

  const addWalletEntry = async (w: DSMWallet) => {
    setWallet((p) => [w, ...p]);
    try { await apiSave("dsmWalletEntry", w); } catch {}
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await apiUpdate("dsmNotification", id, { read: true }); } catch {}
  };

  const submitReport = async (r: DSMReportSubmission) => {
    setReportSubmissions((p) => [r, ...p]);
    try { await apiSave("dsmReportSubmission", r); } catch {}
  };

  const reviewLeaveRequest = async (id: string, status: "Approved" | "Rejected") => {
    const updated = leaveRequests.map((r) =>
      r.id === id ? { ...r, status, reviewedBy: auth.dsmName, reviewedAt: new Date().toISOString() } : r
    );
    setLeaveRequests(updated);
    try { await apiUpdate("dsoLeaveRequest", id, { status, reviewedBy: auth.dsmName, reviewedAt: new Date().toISOString() }); } catch {}
  };

  const dsmId = auth.dsmId || "";
  const sims = useMemo(() => allFranchiseSims.filter((s) => s.issuedToId === dsmId && s.status === "Issued"), [allFranchiseSims, dsmId]);

  const teamSize = dsos.length;
  const totalSales = dsos.reduce((s, d) => s + d.sales, 0);
  const totalRevenue = wallet.filter((w) => w.type === "Credit").reduce((s, w) => s + w.amount, 0);

  const settings = {
    franchiseName: settingsData.franchiseName || "Northern Region Rawalpindi",
    logo: settingsData.logo,
    companyName: settingsData.companyName || "THE SMART ERP",
    dsmName: auth.dsmName,
  };

  return (
    <DSMDataContext.Provider value={{
      auth, hydrated: mounted, dsmLogin, dsmLogout, updateProfile, activations, addActivation, updateActivation, deleteActivation, dsos, sims, importVerifications, attendance,
      leaveRequests, reviewLeaveRequest, warnings,
      dailyReports, weeklyReports, targets, updateTarget, addTarget,
      wallet, addWalletEntry, notifications, markNotificationRead,
      reportSubmissions, submitReport, teamSize, totalSales, totalRevenue, settings,
    }}>
      {children}
    </DSMDataContext.Provider>
  );
}

export function useDSMData() {
  const ctx = useContext(DSMDataContext);
  if (!ctx) throw new Error("useDSMData must be used within DSMDataProvider");
  return ctx;
}
