"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiLoad, apiLoadById, apiSave, apiSaveMany, apiUpdate, apiUpdateMany, apiDelete, apiDeleteMany } from "@/lib/api";

export interface DSM {
  id: string; name: string; fatherName: string; cnic: string; mobile: string; email: string;
  address: string; joiningDate: string; salary: number; commission: number; username: string;
  password: string; status: string; photo: string; franchiseId: string; retailerId: string;
  employeeCode?: string; dob?: string; gender?: string; maritalStatus?: string; bloodGroup?: string; nationality?: string;
  whatsapp?: string; emergencyContact?: string; emergencyContactPerson?: string; emergencyRelationship?: string;
  province?: string; city?: string; area?: string; postalCode?: string;
  employmentType?: string; department?: string; designation?: string; reportingManager?: string;
  deviceBrand?: string; deviceModel?: string; registeredMobile?: string; otpNumber?: string; deviceStatus?: string;
  newSimLimits?: { jazz?: number; zong?: number; ufone?: number; telenor?: number };
  hlrSimLimits?: { jazz?: number; zong?: number; ufone?: number; telenor?: number };
  dailyTargets?: { newSIM?: number; mnp?: number; replacement?: number; byn?: number };
  monthlyTargets?: { activations?: number; revenue?: number; sales?: number };
  fuelAllowance?: number; mobileAllowance?: number; dailyAllowance?: number; residenceAllowance?: number;
  commissionType?: "fixed" | "percentage";
  newSimCommission?: number; mnpCommission?: number; replacementCommission?: number;
  bynCommission?: number; hikeCommission?: number; otherCommission?: number;
  newSimBvs?: number; newSimFca?: number; newSimIfca?: number;
  mnpBvs?: number; mnpFca?: number; mnpIfca?: number;
  replacementBvs?: number; replacementFca?: number; replacementIfca?: number;
  bynBvs?: number; bynFca?: number; bynIfca?: number;
  targetBonus?: number; advanceSalary?: number; loanDeduction?: number; otherDeduction?: number;
  bonus?: number;
  bankName?: string; accountTitle?: string; accountNumber?: string; iban?: string;
  easypaisaNumber?: string; jazzcashNumber?: string;
  documents?: { cnicFront?: string; cnicBack?: string; educationalCert?: string; experienceCert?: string; photo?: string };
  agreements?: { agreementNumber?: string; agreementDate?: string; agreementExpiry?: string; agreementPdf?: string; stampNumber?: string; stampAmount?: number; stampDate?: string; stampPaperCopy?: string };
  guarantor?: { name?: string; fatherName?: string; cnic?: string; mobile?: string; address?: string; relationship?: string; guaranteeLetter?: string; cnicFront?: string; cnicBack?: string };
  attendanceSettings?: { enableGPS?: boolean; selfieVerification?: boolean; locationTracking?: boolean; officeRadius?: number; checkInTime?: string; checkOutTime?: string };
  permissions?: { newSIM?: boolean; mnp?: boolean; replacement?: boolean; byn?: boolean; wallet?: boolean; attendance?: boolean; reports?: boolean; notifications?: boolean };
}

export interface DSO {
  id: string; name: string; fatherName: string; cnic: string; mobile: string; address: string;
  assignedDSM: string; joiningDate: string; salary: number; commission: number; username: string;
  password: string; status: string; photo: string; franchiseId: string; retailerId: string;
  employeeCode?: string; dob?: string; gender?: string; maritalStatus?: string; bloodGroup?: string; nationality?: string;
  whatsapp?: string; email?: string; emergencyContact?: string; emergencyContactPerson?: string; emergencyRelationship?: string;
  province?: string; city?: string; area?: string; postalCode?: string;
  employmentType?: string; department?: string; designation?: string; assignedFranchise?: string; reportingManager?: string;
  deviceBrand?: string; deviceModel?: string; registeredMobile?: string; otpNumber?: string; deviceStatus?: string;
  newSimLimits?: { jazz?: number; zong?: number; ufone?: number; telenor?: number };
  hlrSimLimits?: { jazz?: number; zong?: number; ufone?: number; telenor?: number };
  dailyTargets?: { newSIM?: number; mnp?: number; replacement?: number; byn?: number };
  monthlyTargets?: { activations?: number; revenue?: number; sales?: number };
  fuelAllowance?: number; mobileAllowance?: number; dailyAllowance?: number; residenceAllowance?: number;
  commissionType?: "fixed" | "percentage";
  newSimCommission?: number; mnpCommission?: number; replacementCommission?: number;
  bynCommission?: number; hikeCommission?: number; otherCommission?: number;
  newSimBvs?: number; newSimFca?: number; newSimIfca?: number;
  mnpBvs?: number; mnpFca?: number; mnpIfca?: number;
  replacementBvs?: number; replacementFca?: number; replacementIfca?: number;
  bynBvs?: number; bynFca?: number; bynIfca?: number;
  targetBonus?: number; advanceSalary?: number; loanDeduction?: number; otherDeduction?: number;
  bonus?: number;
  bankName?: string; accountTitle?: string; accountNumber?: string; iban?: string;
  easypaisaNumber?: string; jazzcashNumber?: string;
  documents?: { cnicFront?: string; cnicBack?: string; educationalCert?: string; experienceCert?: string; photo?: string };
  agreements?: { agreementNumber?: string; agreementDate?: string; agreementExpiry?: string; agreementPdf?: string; stampNumber?: string; stampAmount?: number; stampDate?: string; stampPaperCopy?: string };
  guarantor?: { name?: string; fatherName?: string; cnic?: string; mobile?: string; address?: string; relationship?: string; guaranteeLetter?: string; cnicFront?: string; cnicBack?: string };
  attendanceSettings?: { enableGPS?: boolean; selfieVerification?: boolean; locationTracking?: boolean; officeRadius?: number; checkInTime?: string; checkOutTime?: string };
  permissions?: { newSIM?: boolean; mnp?: boolean; replacement?: boolean; byn?: boolean; wallet?: boolean; attendance?: boolean; reports?: boolean; notifications?: boolean };
}

export interface Device {
  id: string; bvsNumber: string; imei: string; brand: string; model: string;
  purchaseDate: string; status: string; assignedDSO: string; retailerId: string;
  franchiseId: string; issueDate: string; returnDate: string; originalRetailerId: string;
}

export interface SIM {
  id: string; network: string; simNumber: string; iccid: string; deviceId: string;
  status: string; receiveDate: string; franchiseId: string; type: "new" | "hlr";
  issuedToId?: string; issuedToName?: string; issuedToRole?: string;
  statusDate?: string; statusChangedFrom?: string;
}

export interface SIMIssueRecord {
  id: string;
  simIds: string[];
  issuedTo: string;
  issuedToRole: string;
  issuedById: string;
  retailerId: string;
  franchiseId: string;
  issueDate: string;
  returnDate: string;
  status: string;
  notes: string;
}

export interface Equipment {
  id: string; name: string; price: number; condition: string; assignedTo: string;
  issueDate: string; returnDate: string; status: string; franchiseId: string;
  category?: string; quantity?: number;
}

export interface EquipmentItemName {
  id: string; name: string; category: string; franchiseId: string;
}

export interface EquipmentIssueRecord {
  id: string; equipmentId: string; equipmentName: string; personId: string;
  personName: string; personRole: string; issueDate: string; returnDate: string;
  status: string; notes: string; franchiseId: string;
}

export interface DeviceIssueRecord {
  id: string; deviceId: string;
  assignedToId: string; assignedToName: string; assignedToRole: string;
  retailerId: string; baseRetailerId: string;
  issueDate: string; returnDate: string;
  status: "Issued" | "Returned";
  notes: string; franchiseId: string;
}

export interface AttendanceRecord {
  id: string; employeeId: string; employeeName: string; role: string; date: string;
  checkIn: string; checkOut: string; gps: string; selfie: string; status: string;
  franchiseId: string;
}

export interface Target {
  id: string; employeeId: string; employeeName: string; role: string; period: string;
  dailyTarget: number; monthlyTarget: number; achieved: number; franchiseId: string;
  dsoId?: string; month?: string; deviceTarget?: number; deviceAchieved?: number; simTarget?: number; simAchieved?: number;
}

export interface WalletTransaction {
  id: string; type: string; amount: number; balance?: number; remarks?: string; note?: string;
  date: string; franchiseId: string;
}

export interface PayrollRecord {
  id: string; employeeId: string; employeeName: string; role: string; month: string;
  salary?: number; bonus?: number; commission?: number; deduction?: number; net?: number;
  basicSalary?: number; allowances?: number; deductions?: number; netPay?: number;
  fuelAllowance?: number; mobileAllowance?: number; dailyAllowance?: number; residenceAllowance?: number;
  newSimCount?: number; newSimRate?: number; newSimCommission?: number;
  newSimBvsRate?: number; newSimBvsCommission?: number;
  newSimFcaRate?: number; newSimFcaCommission?: number;
  newSimIfcaRate?: number; newSimIfcaCommission?: number;
  mnpCount?: number; mnpRate?: number; mnpCommission?: number;
  mnpBvsRate?: number; mnpBvsCommission?: number;
  mnpFcaRate?: number; mnpFcaCommission?: number;
  mnpIfcaRate?: number; mnpIfcaCommission?: number;
  replacementCount?: number; replacementRate?: number; replacementCommission?: number;
  replacementBvsRate?: number; replacementBvsCommission?: number;
  replacementFcaRate?: number; replacementFcaCommission?: number;
  replacementIfcaRate?: number; replacementIfcaCommission?: number;
  bynCount?: number; bynRate?: number; bynCommission?: number;
  bynBvsRate?: number; bynBvsCommission?: number;
  bynFcaRate?: number; bynFcaCommission?: number;
  bynIfcaRate?: number; bynIfcaCommission?: number;
  hikeCommission?: number; otherCommission?: number;
  targetBonus?: number; performanceBonus?: number;
  advanceSalary?: number; loanDeduction?: number; otherDeduction?: number;
  totalAllowances?: number; totalCommission?: number; totalDeductions?: number;
  status?: string; paid?: boolean; paidDate?: string; franchiseId: string;
}

export interface Expense {
  id: string; type?: string; category?: string; amount: number; date: string; description?: string;
  note?: string; approvedBy?: string; franchiseId: string;
}

export interface AccountEntry {
  id: string; type: "income" | "expense"; category: string; amount: number;
  date: string; description: string; franchiseId: string;
}

export interface FranchiseNotification {
  id: string; title?: string; message: string; type: string; time: string; read: boolean;
  franchiseId: string; date?: string; recipient?: string;
}

export interface FranchiseSettings {
  franchiseName: string; ownerName: string; email: string; phone: string;
  address: string; logo: string;
}

export interface FranchiseAuth {
  franchiseId: string; franchiseName: string; loggedIn: boolean;
}

export type Payroll = PayrollRecord;

export interface Account {
  id: string; name: string; type: string; accountNumber: string;
  balance: number; status: string;
}

interface FranchiseDataContextType {
  auth: FranchiseAuth;
  hydrated: boolean;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  dsms: DSM[]; dso: DSO[]; devices: Device[]; sims: SIM[]; equipment: Equipment[];
  equipmentItemNames: EquipmentItemName[]; equipmentIssueRecords: EquipmentIssueRecord[];
  attendance: AttendanceRecord[]; targets: Target[]; wallet: WalletTransaction[];
  payroll: PayrollRecord[]; expenses: Expense[]; accounts: AccountEntry[]; bankAccounts: Account[];
  notifications: FranchiseNotification[]; settings: FranchiseSettings;

  addDSM: (d: DSM) => Promise<void>; updateDSM: (id: string, d: DSM) => Promise<void>; deleteDSM: (id: string) => Promise<void>;
  addDSO: (d: DSO) => Promise<void>; updateDSO: (id: string, d: DSO) => Promise<void>; deleteDSO: (id: string) => Promise<void>;
  addDevice: (d: Device) => Promise<void>; updateDevice: (id: string, d: Device) => Promise<void>; deleteDevice: (id: string) => Promise<void>;
  addSIM: (s: SIM) => Promise<void>; addSIMs: (sims: SIM[]) => Promise<void>; updateSIM: (id: string, s: SIM) => Promise<void>; deleteSIM: (id: string) => Promise<void>; deleteSIMs: (ids: string[]) => Promise<void>;
  addEquipment: (e: Equipment) => Promise<void>; updateEquipment: (id: string, e: Equipment) => Promise<void>; deleteEquipment: (id: string) => Promise<void>;
  addEquipmentItemName: (n: EquipmentItemName) => Promise<void>; deleteEquipmentItemName: (id: string) => Promise<void>;
  addEquipmentIssueRecord: (r: EquipmentIssueRecord) => Promise<void>; updateEquipmentIssueRecord: (id: string, r: EquipmentIssueRecord) => Promise<void>;
  returnEquipment: (id: string) => Promise<void>;
  deviceIssueRecords: DeviceIssueRecord[];
  addDeviceIssueRecord: (r: DeviceIssueRecord) => Promise<void>;
  returnDeviceIssueRecord: (id: string) => Promise<void>;
  addAttendance: (a: AttendanceRecord) => Promise<void>;
  addTarget: (t: Target) => Promise<void>; updateTarget: (id: string, t: Target) => Promise<void>;
  getTarget: (dsoId: string, month: string) => Target;
  addWalletTransaction: (w: WalletTransaction) => Promise<void>;
  addPayroll: (p: PayrollRecord) => Promise<void>; updatePayroll: (id: string, p: PayrollRecord) => Promise<void>; deletePayroll: (id: string) => Promise<void>;
  addExpense: (e: Expense) => Promise<void>; deleteExpense: (id: string) => Promise<void>; updateExpense: (id: string, e: Expense) => Promise<void>;
  addAccountEntry: (a: AccountEntry) => Promise<void>;   addAccount: (a: Account) => Promise<void>; updateAccount: (id: string, a: Account) => Promise<void>; deleteAccount: (id: string) => Promise<void>;
  addNotification: (n: FranchiseNotification) => Promise<void>; markNotificationRead: (id: string) => Promise<void>; deleteNotification: (id: string) => Promise<void>;
  updateSettings: (s: FranchiseSettings) => Promise<void>;
  issueRecords: SIMIssueRecord[];
  issueSIMs: (record: Omit<SIMIssueRecord, "id">) => Promise<void>;
  returnSIMs: (issueId: string) => Promise<void>;
}

const FranchiseDataContext = createContext<FranchiseDataContextType | undefined>(undefined);

function genId(prefix: string, num: number) { return `${prefix}-${String(num).padStart(3, "0")}`; }
function genUsername(name: string, num: number) { return name.toLowerCase().replace(/\s+/g, "").slice(0, 5) + String(num).padStart(3, "0"); }
function genPassword() { const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@"; let p = "TS@"; for (let i = 0; i < 4; i++) p += chars[Math.floor(Math.random() * chars.length)]; return p; }
function genRetailerId(mobile: string) { return mobile.replace(/[\s+\-()]/g, "").slice(-11); }
function now() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`; }

const emptySettings: FranchiseSettings = {
  franchiseName: "", ownerName: "", email: "",
  phone: "", address: "", logo: "",
};

export function FranchiseDataProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<FranchiseAuth>({ franchiseId: "", franchiseName: "", loggedIn: false });
  const [dsms, setDSMs] = useState<DSM[]>([]);
  const [dso, setDSO] = useState<DSO[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sims, setSIMs] = useState<SIM[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [wallet, setWallet] = useState<WalletTransaction[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [bankAccounts, setBankAccounts] = useState<Account[]>([]);
  const [notifications, setNotifications] = useState<FranchiseNotification[]>([]);
  const [settings, setSettings] = useState<FranchiseSettings>(emptySettings);
  const [issueRecords, setIssueRecords] = useState<SIMIssueRecord[]>([]);
  const [equipmentItemNames, setEquipmentItemNames] = useState<EquipmentItemName[]>([]);
  const [equipmentIssueRecords, setEquipmentIssueRecords] = useState<EquipmentIssueRecord[]>([]);
  const [deviceIssueRecords, setDeviceIssueRecords] = useState<DeviceIssueRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  const fid = auth.franchiseId || "";

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const stored = await apiLoadById("franchiseData", "auth");
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
      const [loadedDSMs, loadedDSO, loadedDevices, loadedSIMs, loadedEquipment, loadedAttendance, loadedTargets, loadedWallet, loadedPayroll, loadedExpenses, loadedAccounts, loadedBankAccounts, loadedNotifications, loadedSettings, loadedIssueRecords, loadedEquipmentItemNames, loadedEquipmentIssueRecords, loadedDeviceIssueRecords] = await Promise.all([
        apiLoad("dsm", fid),
        apiLoad("dso", fid),
        apiLoad("device", fid),
        apiLoad("sim", fid),
        apiLoad("equipment", fid),
        apiLoad("attendanceRecord", fid),
        apiLoad("target", fid),
        apiLoad("walletTransaction", fid),
        apiLoad("payrollRecord", fid),
        apiLoad("expense", fid),
        apiLoad("accountEntry", fid),
        apiLoad("bankAccount", fid),
        apiLoad("franchiseNotification", fid),
        apiLoadById("franchiseData", "settings-" + fid),
        apiLoad("simIssueRecord", fid),
        apiLoad("equipmentItemName", fid),
        apiLoad("equipmentIssueRecord", fid),
        apiLoad("deviceIssueRecord", fid),
      ]);
      setDSMs(loadedDSMs || []);
      setDSO(loadedDSO || []);
      setDevices(loadedDevices || []);
      setSIMs(loadedSIMs || []);
      setEquipment(loadedEquipment || []);
      setAttendance(loadedAttendance || []);
      setTargets(loadedTargets || []);
      setWallet(loadedWallet || []);
      setPayroll(loadedPayroll || []);
      setExpenses(loadedExpenses || []);
      setAccounts(loadedAccounts || []);
      setBankAccounts(loadedBankAccounts || []);
      setNotifications(loadedNotifications || []);
      if (loadedSettings?.data) {
        try { setSettings(JSON.parse(loadedSettings.data)); } catch {}
      }
      setIssueRecords(loadedIssueRecords || []);
      setEquipmentItemNames(loadedEquipmentItemNames || []);
      setEquipmentIssueRecords(loadedEquipmentIssueRecords || []);
      setDeviceIssueRecords(loadedDeviceIssueRecords || []);
    };
    loadAll();
  }, [fid, mounted]);

  const login = async (id: string, password: string): Promise<boolean> => {
    const franchises = await apiLoad("franchise");
    const franchise = franchises.find((f: any) => f.id.toUpperCase() === id.toUpperCase() && f.password === password && f.status === "Active");
    if (franchise) {
      const newAuth = { franchiseId: franchise.id, franchiseName: franchise.name, loggedIn: true };
      setAuth(newAuth);
      await apiSave("franchiseData", { id: "auth", data: JSON.stringify(newAuth) });
      return true;
    }
    return false;
  };

  const logout = async () => {
    setAuth({ franchiseId: "", franchiseName: "", loggedIn: false });
    await apiDelete("franchiseData", "auth").catch(() => {});
  };

  const addDSM = async (d: DSM) => {
    await apiSave("dsm", d);
    setDSMs((p) => [...p, d]);
  };
  const updateDSM = async (id: string, d: DSM) => {
    await apiUpdate("dsm", id, d);
    setDSMs((p) => p.map((i) => (i.id === id ? d : i)));
  };
  const deleteDSM = async (id: string) => {
    await apiDelete("dsm", id);
    setDSMs((p) => p.filter((i) => i.id !== id));
  };

  const addDSO = async (d: DSO) => {
    await apiSave("dso", d);
    setDSO((p) => [...p, d]);
  };
  const updateDSO = async (id: string, d: DSO) => {
    await apiUpdate("dso", id, d);
    setDSO((p) => p.map((i) => (i.id === id ? d : i)));
  };
  const deleteDSO = async (id: string) => {
    await apiDelete("dso", id);
    setDSO((p) => p.filter((i) => i.id !== id));
  };

  const addDevice = async (d: Device) => {
    await apiSave("device", d);
    setDevices((p) => [...p, d]);
  };
  const updateDevice = async (id: string, d: Device) => {
    await apiUpdate("device", id, d);
    setDevices((p) => p.map((i) => (i.id === id ? d : i)));
  };
  const deleteDevice = async (id: string) => {
    await apiDelete("device", id);
    setDevices((p) => p.filter((i) => i.id !== id));
  };

  const addSIM = async (s: SIM) => {
    await apiSave("sim", s);
    setSIMs((p) => [...p, s]);
  };
  const addSIMs = async (newSims: SIM[]) => {
    await apiSaveMany("sim", newSims);
    setSIMs((p) => [...p, ...newSims]);
  };
  const updateSIM = async (id: string, s: SIM) => {
    await apiUpdate("sim", id, s);
    setSIMs((p) => p.map((i) => {
      if (i.id !== id) return i;
      if (s.status !== i.status) {
        return { ...s, statusDate: new Date().toISOString().split("T")[0], statusChangedFrom: i.status };
      }
      return s;
    }));
  };
  const deleteSIM = async (id: string) => {
    await apiDelete("sim", id);
    setSIMs((p) => p.filter((i) => i.id !== id));
  };
  const deleteSIMs = async (ids: string[]) => {
    await apiDeleteMany("sim", ids);
    setSIMs((p) => p.filter((i) => !ids.includes(i.id)));
  };

  const addEquipment = async (e: Equipment) => {
    await apiSave("equipment", e);
    setEquipment((p) => [...p, e]);
  };
  const updateEquipment = async (id: string, e: Equipment) => {
    await apiUpdate("equipment", id, e);
    setEquipment((p) => p.map((i) => (i.id === id ? e : i)));
  };
  const deleteEquipment = async (id: string) => {
    await apiDelete("equipment", id);
    setEquipment((p) => p.filter((i) => i.id !== id));
  };
  const addEquipmentItemName = async (n: EquipmentItemName) => {
    await apiSave("equipmentItemName", n);
    setEquipmentItemNames((p) => [...p, n]);
  };
  const deleteEquipmentItemName = async (id: string) => {
    await apiDelete("equipmentItemName", id);
    setEquipmentItemNames((p) => p.filter((i) => i.id !== id));
  };
  const addEquipmentIssueRecord = async (r: EquipmentIssueRecord) => {
    await apiSave("equipmentIssueRecord", r);
    setEquipmentIssueRecords((p) => [r, ...p]);
  };
  const updateEquipmentIssueRecord = async (id: string, r: EquipmentIssueRecord) => {
    await apiUpdate("equipmentIssueRecord", id, r);
    setEquipmentIssueRecords((p) => p.map((i) => (i.id === id ? r : i)));
  };
  const returnEquipment = async (id: string) => {
    const updated = { ...equipmentIssueRecords.find((r) => r.id === id), status: "Returned", returnDate: now() } as EquipmentIssueRecord;
    await apiUpdate("equipmentIssueRecord", id, updated);
    setEquipmentIssueRecords((p) => p.map((r) => r.id === id ? { ...r, status: "Returned", returnDate: now() } : r));
  };

  const addAttendance = async (a: AttendanceRecord) => {
    await apiSave("attendanceRecord", a);
    setAttendance((p) => [a, ...p]);
  };
  const addTarget = async (t: Target) => {
    await apiSave("target", t);
    setTargets((p) => [...p, t]);
  };
  const updateTarget = async (id: string, t: Target) => {
    await apiUpdate("target", id, t);
    setTargets((p) => p.map((i) => (i.id === id ? t : i)));
  };
  const addWalletTransaction = async (w: WalletTransaction) => {
    await apiSave("walletTransaction", w);
    setWallet((p) => [w, ...p]);
  };
  const addPayroll = async (p: PayrollRecord) => {
    await apiSave("payrollRecord", p);
    setPayroll((prev) => [...prev, p]);
  };
  const updatePayroll = async (id: string, p: PayrollRecord) => {
    await apiUpdate("payrollRecord", id, p);
    setPayroll((prev) => prev.map((i) => (i.id === id ? p : i)));
  };
  const deletePayroll = async (id: string) => {
    await apiDelete("payrollRecord", id);
    setPayroll((prev) => prev.filter((i) => i.id !== id));
  };
  const addExpense = async (e: Expense) => {
    await apiSave("expense", e);
    setExpenses((p) => [e, ...p]);
  };
  const deleteExpense = async (id: string) => {
    await apiDelete("expense", id);
    setExpenses((p) => p.filter((i) => i.id !== id));
  };
  const updateExpense = async (id: string, e: Expense) => {
    await apiUpdate("expense", id, e);
    setExpenses((p) => p.map((i) => (i.id === id ? e : i)));
  };
  const addAccountEntry = async (a: AccountEntry) => {
    await apiSave("accountEntry", a);
    setAccounts((p) => [a, ...p]);
  };
  const addAccount = async (a: Account) => {
    await apiSave("bankAccount", a);
    setBankAccounts((p) => [...p, a]);
  };
  const updateAccount = async (id: string, a: Account) => {
    await apiUpdate("bankAccount", id, a);
    setBankAccounts((p) => p.map((i) => (i.id === id ? a : i)));
  };
  const deleteAccount = async (id: string) => {
    await apiDelete("bankAccount", id);
    setBankAccounts((p) => p.filter((i) => i.id !== id));
  };

  const getTarget = (dsoId: string, month: string): Target => {
    const existing = targets.find((t) => t.dsoId === dsoId && t.month === month);
    if (existing) return existing;
    const emp = dso.find((d) => d.id === dsoId);
    return {
      id: `TGT-${dsoId}-${month}`, employeeId: dsoId, employeeName: emp?.name || "", role: "DSO", period: month,
      dailyTarget: 10, monthlyTarget: 300, achieved: 0, franchiseId: fid,
      dsoId, month, deviceTarget: 0, deviceAchieved: 0, simTarget: 0, simAchieved: 0,
    };
  };
  const addNotification = async (n: FranchiseNotification) => {
    await apiSave("franchiseNotification", n);
    setNotifications((p) => [n, ...p]);
  };
  const markNotificationRead = async (id: string) => {
    const updated = notifications.find((n) => n.id === id);
    if (updated) {
      await apiUpdate("franchiseNotification", id, { ...updated, read: true });
    }
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const deleteNotification = async (id: string) => {
    await apiDelete("franchiseNotification", id);
    setNotifications((p) => p.filter((n) => n.id !== id));
  };
  const updateSettings = async (s: FranchiseSettings) => {
    setSettings(s);
    await apiSave("franchiseData", { id: `settings-${fid}`, data: JSON.stringify(s) });
  };

  const issueSIMs = async (record: Omit<SIMIssueRecord, "id">) => {
    const today = new Date().toISOString().split("T")[0];
    const newRecord: SIMIssueRecord = { ...record, id: `ISU-${Date.now()}` };
    await apiSave("simIssueRecord", newRecord);
    setIssueRecords((p) => [newRecord, ...p]);
    const updatedSIMs = sims.map((s) => record.simIds.includes(s.id) ? { ...s, status: "Issued", issuedToId: record.issuedById, issuedToName: record.issuedTo, issuedToRole: record.issuedToRole, statusDate: record.issueDate || today, statusChangedFrom: s.status } : s);
    const affected = updatedSIMs.filter((s) => record.simIds.includes(s.id));
    await apiUpdateMany("sim", affected.map((s) => s.id), affected);
    setSIMs(updatedSIMs);
  };

  const addDeviceIssueRecord = async (r: DeviceIssueRecord) => {
    await apiSave("deviceIssueRecord", r);
    setDeviceIssueRecords((p) => [r, ...p]);
  };

  const returnDeviceIssueRecord = async (id: string) => {
    const updated = { status: "Returned" as const, returnDate: new Date().toISOString().split("T")[0] };
    await apiUpdate("deviceIssueRecord", id, updated);
    setDeviceIssueRecords((prev) => prev.map((r) => r.id === id ? { ...r, ...updated } : r));
  };

  const returnSIMs = async (issueId: string) => {
    const record = issueRecords.find((r) => r.id === issueId);
    if (!record) return;
    const today = new Date().toISOString().split("T")[0];
    await apiUpdate("simIssueRecord", issueId, { status: "Returned", returnDate: today });
    setIssueRecords((prev) => prev.map((r) => r.id === issueId ? { ...r, status: "Returned", returnDate: today } : r));
    const returnedSIMs = sims.map((s) => record.simIds.includes(s.id) ? { ...s, status: "In Stock", issuedToId: undefined, issuedToName: undefined, issuedToRole: undefined, statusDate: today, statusChangedFrom: s.status } : s);
    const affected = returnedSIMs.filter((s) => record.simIds.includes(s.id));
    await apiUpdateMany("sim", affected.map((s) => s.id), affected);
    setSIMs(returnedSIMs);
  };

  return (
    <FranchiseDataContext.Provider value={{
      auth, hydrated: mounted, login, logout, dsms, dso, devices, sims, equipment,
      equipmentItemNames, equipmentIssueRecords, attendance, targets,
      wallet, payroll, expenses, accounts, bankAccounts, notifications, settings,
      addDSM, updateDSM, deleteDSM, addDSO, updateDSO, deleteDSO,
      addDevice, updateDevice, deleteDevice, addSIM, addSIMs, updateSIM, deleteSIM, deleteSIMs,
      addEquipment, updateEquipment, deleteEquipment,
      addEquipmentItemName, deleteEquipmentItemName,
      addEquipmentIssueRecord, updateEquipmentIssueRecord, returnEquipment,
      deviceIssueRecords, addDeviceIssueRecord, returnDeviceIssueRecord,
      addAttendance,
      addTarget, updateTarget, getTarget, addWalletTransaction, addPayroll, updatePayroll, deletePayroll,
      addExpense, deleteExpense, updateExpense, addAccountEntry, addAccount, updateAccount, deleteAccount, addNotification,
      markNotificationRead, deleteNotification, updateSettings,
      issueRecords, issueSIMs, returnSIMs,
    }}>
      {children}
    </FranchiseDataContext.Provider>
  );
}

export function useFranchiseData() {
  const ctx = useContext(FranchiseDataContext);
  if (!ctx) throw new Error("useFranchiseData must be used within FranchiseDataProvider");
  return ctx;
}

export { genId, genUsername, genPassword, genRetailerId };
