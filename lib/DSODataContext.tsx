"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { apiLoad, apiLoadById, apiSave, apiUpdate, apiDelete } from "@/lib/api";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie";
import type { StaffWalletPayment, StaffPaymentRequest, FranchiseBankAccount } from "@/lib/FranchiseDataContext";

export interface DSOAuth {
  dsoId: string; dsoName: string; franchiseId: string; loggedIn: boolean;
}

export interface Activation {
  id: string; type: "New SIM" | "MNP" | "Replacement" | "BYN"; simId: string; simNumber: string;
  network: string; iccid: string; deviceId: string; customerName: string; customerCNIC: string;
  customerMobile: string; retailerId: string; status: "Pending BVS" | "Pending FCA" | "Pending IFCA" | "Completed" | "Rejected";
  bvsStatus: "Pending" | "Completed" | "Failed"; bvsDate: string; bvsNotes: string;
  fcaStatus: "Pending" | "Completed"; fcaDate: string; fcaNotes: string;
  ifcaStatus: "Pending" | "Completed"; ifcaDate: string; ifcaNotes: string;
  progress: number; createdAt: string; dsoId: string; franchiseId: string;
}

export interface DSOAttendance {
  id: string; dsoId: string; date: string; checkIn: string; checkOut: string;
  gps: string; selfie: string; status: "Present" | "Absent" | "Late" | "Half Day" | "Leave"; franchiseId: string;
  workingHours?: number; bonus?: number; fine?: number;
}

export interface LeaveRequest {
  id: string; dsoId: string; dsoName: string; date: string; reason: string;
  status: "Pending" | "Approved" | "Rejected"; reviewedBy: string; reviewedAt: string;
  franchiseId: string;
}

export interface AttendanceWarning {
  id: string; dsoId: string; date: string; type: "consecutive_absent" | "late" | "fine";
  message: string; fineAmount: number; franchiseId: string;
}

export interface DSOWallet {
  id: string; type: "Credit" | "Debit"; amount: number; balance: number;
  note: string; date: string; franchiseId: string;
}

export interface DSOTarget {
  id: string; month: string; newSIM: number; newSIMAchieved: number;
  mnp: number; mnpAchieved: number; replacement: number; replacementAchieved: number;
  byn: number; bynAchieved: number; franchiseId: string;
}

export interface DSODevice {
  id: string; bvsNumber: string; imei: string; brand: string; model: string;
  retailerId: string; status: string;
}

export interface DSONotification {
  id: string; title: string; message: string; type: string; time: string; read: boolean;
}

export interface DSOSim {
  id: string; network: string; simNumber: string; iccid: string;
  deviceId: string; status: string; receiveDate: string;
  franchiseId: string; type: "new" | "hlr";
  issuedToId?: string; issuedToName?: string; issuedToRole?: string;
}

interface DSODataContextType {
  auth: DSOAuth; hydrated: boolean; dsoLogin: (id: string, password: string) => Promise<boolean>; dsoLogout: () => void;
  activations: Activation[]; addActivation: (a: Activation) => void; updateActivation: (id: string, a: Partial<Activation>) => void; deleteActivation: (id: string) => void;
  attendance: DSOAttendance[]; addAttendance: (a: DSOAttendance) => void; updateAttendance: (id: string, a: Partial<DSOAttendance>) => void;
  leaveRequests: LeaveRequest[]; addLeaveRequest: (r: LeaveRequest) => void;
  warnings: AttendanceWarning[];
  wallet: DSOWallet[]; addWalletEntry: (w: DSOWallet) => void;
  staffWalletPayments: StaffWalletPayment[];
  paymentRequests: StaffPaymentRequest[];
  submitPaymentRequest: (r: Omit<StaffPaymentRequest, "id" | "status" | "receivedAt" | "createdAt" | "franchiseId">) => Promise<void>;
  bankAccounts: FranchiseBankAccount[];
  targets: DSOTarget; updateTargets: (t: Partial<DSOTarget>) => void;
  device: DSODevice | null;
  sims: DSOSim[];
  importVerifications: Record<string, { bvs: string; fca: string; ifca: string }>;
  notifications: DSONotification[]; markNotificationRead: (id: string) => void;
  settings: { franchiseName: string; logo: string; companyName: string; dsoName: string };
}

const DSODataContext = createContext<DSODataContextType | undefined>(undefined);

const defaultTargets: DSOTarget = {
  id: "", month: "", newSIM: 0, newSIMAchieved: 0, mnp: 0, mnpAchieved: 0, replacement: 0, replacementAchieved: 0, byn: 0, bynAchieved: 0, franchiseId: "",
};

export function DSODataProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<DSOAuth>({ dsoId: "", dsoName: "", franchiseId: "", loggedIn: false });
  const [activations, setActivations] = useState<Activation[]>([]);
  const [attendance, setAttendance] = useState<DSOAttendance[]>([]);
  const [wallet, setWallet] = useState<DSOWallet[]>([]);
  const [staffWalletPayments, setStaffWalletPayments] = useState<StaffWalletPayment[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<StaffPaymentRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [warnings, setWarnings] = useState<AttendanceWarning[]>([]);
  const [targets, setTargets] = useState<DSOTarget>(defaultTargets);
  const [device] = useState<DSODevice | null>(null);
  const [notifications, setNotifications] = useState<DSONotification[]>([]);
  const [allFranchiseSims, setAllFranchiseSims] = useState<DSOSim[]>([]);
  const [importVerifications, setImportVerifications] = useState<Record<string, { bvs: string; fca: string; ifca: string }>>({});
  const [mounted, setMounted] = useState(false);
  const [settingsData, setSettingsData] = useState({ companyName: "THE SMART ERP", logo: "", franchiseName: "" });
  const [bankAccounts, setBankAccounts] = useState<FranchiseBankAccount[]>([]);


  const fid = auth.franchiseId || "";

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const stored = await apiLoadById("franchiseData", "dso-auth");
        if (stored?.data) {
          setAuth(JSON.parse(stored.data));
        }
      } catch {}
      setMounted(true);
    };
    loadAuth();
  }, []);

  useEffect(() => {
    if (!fid || !mounted) return;
    const loadAll = async () => {
      const [loadedActivations, loadedAttendance, loadedLeaves, loadedWarnings, loadedWallet, loadedTargets, loadedNotifications, loadedSims, adminSettings, franchiseRecord, loadedVerifications, loadedStaffWallet, loadedPaymentRequests, loadedSettings] = await Promise.all([
        apiLoad("dsoActivation", fid),
        apiLoad("dsoAttendance", fid),
        apiLoad("leaveRequest", fid),
        apiLoad("attendanceWarning", fid),
        apiLoad("dsoWalletEntry", fid),
        apiLoad("dsoTargetEntry", fid),
        apiLoad("dsoNotification"),
        apiLoad("sim", fid),
        apiLoadById("adminSettings", "admin").catch(() => null),
        apiLoadById("franchise", fid).catch(() => null),
        apiLoad("franchiseSimVerification").catch(() => []),
        apiLoadById("franchiseData", "staffWallet-" + fid).catch(() => null),
        apiLoadById("franchiseData", "paymentRequests-" + fid).catch(() => null),
        apiLoadById("franchiseData", "settings-" + fid).catch(() => null),
      ]);
      setActivations(loadedActivations || []);
      setAttendance(loadedAttendance || []);
      setLeaveRequests(loadedLeaves || []);
      setWarnings(loadedWarnings || []);
      setWallet(loadedWallet || []);
      if (loadedStaffWallet?.data) {
        try {
          const parsed = JSON.parse(loadedStaffWallet.data);
          setStaffWalletPayments(Array.isArray(parsed) ? parsed : []);
        } catch {}
      }
      if (loadedPaymentRequests?.data) {
        try {
          const parsed = JSON.parse(loadedPaymentRequests.data);
          setPaymentRequests(Array.isArray(parsed) ? parsed : []);
        } catch {}
      }
      if (loadedSettings?.data) {
        try {
          const parsed = JSON.parse(loadedSettings.data);
          const list = Array.isArray(parsed?.bankAccounts) ? parsed.bankAccounts : [];
          const fallback = [];
          if (parsed?.bankName || parsed?.bankAccountTitle || parsed?.bankAccountNumber) {
            fallback.push({
              id: "ACC-1", name: parsed.bankName || "", accountTitle: parsed.bankAccountTitle || "", accountNumber: parsed.bankAccountNumber || "",
            });
          }
          setBankAccounts(list.length > 0 ? list : fallback);
        } catch {}
      }
      setTargets((loadedTargets.length > 0 ? loadedTargets[0] : defaultTargets) as DSOTarget);
      setNotifications(loadedNotifications || []);
      setAllFranchiseSims(loadedSims || []);
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
    };
    loadAll();
  }, [fid, mounted]);

  const dsoLogin = async (id: string, password: string): Promise<boolean> => {
    try {
      const dsoRecord = await apiLoadById("dso", id);
      if (dsoRecord && dsoRecord.password === password && dsoRecord.status === "Active") {
        const newAuth = { dsoId: dsoRecord.id, dsoName: dsoRecord.name, franchiseId: dsoRecord.franchiseId, loggedIn: true };
        setAuth(newAuth);
        await apiSave("franchiseData", { id: "dso-auth", data: JSON.stringify(newAuth) });
        setAuthCookie();
        return true;
      }
    } catch (e) { console.error("DSO login error:", e); }
    return false;
  };

  const dsoLogout = async () => {
    const empty = { dsoId: "", dsoName: "", franchiseId: "", loggedIn: false };
    setAuth(empty);
    clearAuthCookie();
    try { await apiUpdate("franchiseData", "dso-auth", { data: "" }); } catch {}
  };

  const addActivation = async (a: Activation) => {
    await apiSave("dsoActivation", a);
    setActivations((p) => [a, ...p]);
  };

  const updateActivation = async (id: string, updates: Partial<Activation>) => {
    let fullUpdate: Activation | null = null;
    setActivations((prev) => {
      const existing = prev.find((a) => a.id === id);
      if (!existing) return prev;
      const merged = { ...existing, ...updates };
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
      return prev.map((a) => (a.id === id ? merged : a));
    });
    if (fullUpdate) {
      try { await apiSave("dsoActivation", fullUpdate); } catch (e) { console.error("updateActivation save failed:", e); }
    }
  };

  const deleteActivation = async (id: string) => {
    await apiDelete("dsoActivation", id);
    setActivations((prev) => prev.filter((a) => a.id !== id));
  };

  const addAttendance = async (a: DSOAttendance) => {
    await apiSave("dsoAttendance", a);
    setAttendance((p) => [a, ...p]);
  };

  const updateAttendance = async (id: string, updates: Partial<DSOAttendance>) => {
    await apiUpdate("dsoAttendance", id, updates);
    setAttendance((p) => p.map((a) => a.id === id ? { ...a, ...updates } : a));
  };

  const addLeaveRequest = async (r: LeaveRequest) => {
    await apiSave("leaveRequest", r);
    setLeaveRequests((p) => [r, ...p]);
  };

  const addWalletEntry = async (w: DSOWallet) => {
    await apiSave("dsoWalletEntry", w);
    setWallet((p) => [w, ...p]);
  };

  const submitPaymentRequest = async (r: Omit<StaffPaymentRequest, "id" | "status" | "receivedAt" | "createdAt" | "franchiseId">) => {
    const nowStr = new Date().toISOString().split("T")[0];
    const req: StaffPaymentRequest = {
      ...r,
      id: `LPR-${Date.now()}`,
      status: "Pending",
      createdAt: nowStr,
      franchiseId: fid,
    };
    const updated = [req, ...paymentRequests];
    setPaymentRequests(updated);
    await apiSave("franchiseData", { id: `paymentRequests-${fid}`, data: JSON.stringify(updated) });
  };

  const updateTargets = async (t: Partial<DSOTarget>) => {
    setTargets((prev) => {
      const updated = { ...prev, ...t };
      apiUpdate("dsoTargetEntry", updated.id, updated);
      return updated;
    });
  };

  const markNotificationRead = async (id: string) => {
    await apiUpdate("dsoNotification", id, { read: true });
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const sims = useMemo(() => allFranchiseSims.filter((s) => s.issuedToId === auth.dsoId && s.status === "Issued"), [allFranchiseSims, auth.dsoId]);

  const settings = {
    franchiseName: settingsData.franchiseName || "Northern Region Rawalpindi",
    logo: settingsData.logo,
    companyName: settingsData.companyName || "THE SMART ERP",
    dsoName: auth.dsoName,
  };

  return (
    <DSODataContext.Provider value={{
      auth, hydrated: mounted, dsoLogin, dsoLogout, activations, addActivation, updateActivation, deleteActivation,
      attendance, addAttendance, updateAttendance, leaveRequests, addLeaveRequest, warnings,
      wallet, addWalletEntry, targets, updateTargets,
      staffWalletPayments,
      paymentRequests, submitPaymentRequest,
      bankAccounts,
      device, sims, importVerifications, notifications, markNotificationRead, settings,
    }}>
      {children}
    </DSODataContext.Provider>
  );
}

export function useDSOData() {
  const ctx = useContext(DSODataContext);
  if (!ctx) throw new Error("useDSOData must be used within DSODataProvider");
  return ctx;
}


