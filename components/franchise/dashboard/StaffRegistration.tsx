"use client";

import { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";
import {
  ArrowLeft, ArrowRight, Save, User, Phone, Briefcase, Key, Smartphone, Target, DollarSign,
  Building2, FileText, Shield, CheckCircle, Camera, AlertTriangle, Search, X as XIcon,
  PencilLine, ChevronRight, ClipboardList, RotateCcw, History, UploadCloud,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { uploadFile } from "@/lib/r2Client";
import FileUploadCard from "@/components/franchise/dashboard/FileUploadCard";

const PROVINCES = ["Punjab", "Sindh", "KPK", "Balochistan", "Islamabad", "GB", "AJK"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];
const MARITAL = ["Single", "Married", "Divorced", "Widowed"];
const EMP_TYPES = ["Full Time", "Part Time", "Contract", "Intern"];
const DEPARTMENTS = ["Sales", "Marketing", "Operations", "Finance", "HR"];
const DESIG_DSM = ["Area Sales Manager", "Senior DSM", "Junior DSM", "Trainee DSM"];
const DESIG_DSO = ["Direct Sales Officer", "Senior DSO", "Junior DSO", "Trainee DSO"];
const BANKS = ["HBL", "UBL", "MCB", "NBP", "Allied Bank", "Meezan Bank", "Faysal Bank", "JS Bank", "Askari Bank", "Other"];
const RELATIONSHIPS = ["Father", "Mother", "Brother", "Sister", "Wife", "Husband", "Uncle", "Friend", "Other"];

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Contact", icon: Phone },
  { label: "Employment", icon: Briefcase },
  { label: "Login", icon: Key },
  { label: "Device", icon: Smartphone },
  { label: "SIM Limits", icon: Smartphone },
  { label: "Targets", icon: Target },
  { label: "Salary", icon: DollarSign },
  { label: "Bank", icon: Building2 },
  { label: "Documents", icon: FileText },
  { label: "Attendance", icon: Shield },
  { label: "Permissions", icon: Shield },
  { label: "Review", icon: CheckCircle },
];

const REQUIRED_FIELDS = [
  { field: "name", label: "Full Name", step: 0 },
  { field: "fatherName", label: "Father Name", step: 0 },
  { field: "cnic", label: "CNIC Number", step: 0 },
  { field: "mobile", label: "Mobile Number", step: 1 },
  { field: "joiningDate", label: "Joining Date", step: 2 },
  { field: "salary", label: "Basic Salary", step: 7 },
];

const DOC_FIELDS = [
  { key: "cnicFront", label: "CNIC Front", required: true },
  { key: "cnicBack", label: "CNIC Back", required: true },
  { key: "educationalCert", label: "Educational Certificate", required: false },
  { key: "experienceCert", label: "Experience Certificate", required: false },
];

interface StaffRegistrationProps {
  kind: "DSM" | "DSO";
  auth: { franchiseId: string };
  staffList: any[];        // DSM/DSO list (for IDs + reporting manager / assigned DSM search)
  existing: any | null;    // record being edited, or null
  idPrefix: string;        // "DSM-" or "DSO-"
  usernameBase: string;    // "dsm" or "dso"
  listHref: string;        // "/franchise/dsm" or "/franchise/dso"
  designationOptions: string[];
  onSubmit: (form: any, isEdit: boolean, editId: string | null, listHref: string) => void;
}

function formatCNIC(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  let formatted = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 5 || i === 12) formatted += "-";
    formatted += digits[i];
  }
  return formatted;
}

function genPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@";
  let p = "TS@";
  for (let i = 0; i < 4; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

export default function StaffRegistration(props: StaffRegistrationProps) {
  const { kind, auth, staffList, existing, idPrefix, usernameBase, listHref, designationOptions, onSubmit } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;
  const uid = useId();

  const count = staffList.length + 1;

  const getFreshDefaults = useCallback((): any => ({
    id: `${idPrefix}${auth.franchiseId.split("-")[0]}-${String(count).padStart(3, "0")}`,
    name: "", fatherName: "", cnic: "", mobile: "", address: "",
    assignedDSM: "", joiningDate: new Date().toISOString().split("T")[0], salary: 0, commission: 0,
    username: `${usernameBase}${String(count).padStart(3, "0")}`, password: genPassword(), status: "Active", photo: "",
    franchiseId: auth.franchiseId, retailerId: "", employeeCode: "", dob: "", gender: "Male", maritalStatus: "Single",
    bloodGroup: "", nationality: "Pakistani", whatsapp: "", email: "", emergencyContact: "",
    emergencyContactPerson: "", emergencyRelationship: "Father", province: "Punjab", city: "", area: "",
    postalCode: "", employmentType: "Full Time", department: "Sales", designation: designationOptions[0] || "",
    assignedFranchise: auth.franchiseId, reportingManager: "", registeredMobile: "", otpNumber: "", deviceStatus: "Available",
    newSimLimits: { jazz: 0, zong: 0, ufone: 0, telenor: 0 },
    hlrSimLimits: { jazz: 0, zong: 0, ufone: 0, telenor: 0 },
    dailyTargets: { newSIM: 5, mnp: 3, replacement: 2, byn: 1 },
    monthlyTargets: { activations: 150, revenue: 300000, sales: 50 },
    fuelAllowance: 0, mobileAllowance: 0, dailyAllowance: 0, residenceAllowance: 0,
    newSimCommission: 0, mnpCommission: 0, replacementCommission: 0, bynCommission: 0,
    newSimBvs: 0, newSimFca: 0, newSimIfca: 0,
    mnpBvs: 0, mnpFca: 0, mnpIfca: 0,
    replacementBvs: 0, replacementFca: 0, replacementIfca: 0,
    bynBvs: 0, bynFca: 0, bynIfca: 0,
    hikeCommission: 0, otherCommission: 0, targetBonus: 0, bonus: 0,
    advanceSalary: 0, loanDeduction: 0, otherDeduction: 0,
    bankName: "", accountTitle: "", accountNumber: "", iban: "", easypaisaNumber: "", jazzcashNumber: "",
    documents: {}, agreements: {}, guarantor: {},
    attendanceSettings: { enableGPS: true, selfieVerification: true, locationTracking: true, officeRadius: 500, checkInTime: "09:00", checkOutTime: "18:00" },
    permissions: { newSIM: true, mnp: true, replacement: true, byn: true, wallet: true, attendance: true, reports: true, notifications: true },
  }), [auth.franchiseId, idPrefix, usernameBase, count, designationOptions]);

  const [form, setForm] = useState<any>(() => {
    const defaults = getFreshDefaults();
    if (existing) {
      return {
        ...defaults, ...existing,
        newSimLimits: { ...defaults.newSimLimits, ...existing.newSimLimits },
        hlrSimLimits: { ...defaults.hlrSimLimits, ...existing.hlrSimLimits },
        dailyTargets: { ...defaults.dailyTargets, ...existing.dailyTargets },
        monthlyTargets: { ...defaults.monthlyTargets, ...existing.monthlyTargets },
        attendanceSettings: { ...defaults.attendanceSettings, ...existing.attendanceSettings },
        permissions: { ...defaults.permissions, ...existing.permissions },
        documents: { ...defaults.documents, ...existing.documents },
        agreements: { ...defaults.agreements, ...existing.agreements },
        guarantor: { ...defaults.guarantor, ...existing.guarantor },
      };
    }
    return defaults;
  });

  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ field: string; label: string; step: number }[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const draftKey = `staff-reg-${kind}-${editId || "new"}`;

  // Restore draft
  useEffect(() => {
    if (!isEditMode) {
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.form) {
            setForm((prev: any) => ({ ...prev, ...parsed.form }));
            if (parsed.step != null) setStep(Math.min(STEPS.length - 1, parsed.step));
            if (parsed.savedAt) setDraftSavedAt(parsed.savedAt);
          }
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ form, step, savedAt: new Date().toISOString() }));
      setDraftSavedAt(new Date().toLocaleTimeString());
    } catch {}
  }, [draftKey, form, step]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(draftKey); } catch {}
    setDraftSavedAt(null);
  }, [draftKey]);

  const set = (field: string, value: any) => {
    if (field === "cnic" && typeof value === "string") value = formatCNIC(value);
    setForm((p: any) => {
      const keys = field.split(".");
      const updated = { ...p };
      let obj: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      if (field === "mobile" && typeof value === "string" && value.length >= 10) {
        updated.retailerId = value.replace(/[\s+\-()]/g, "").slice(-11);
      }
      return updated;
    });
  };

  const getVal = (field: string) => {
    const keys = field.split(".");
    let val: any = form;
    for (const k of keys) val = val?.[k];
    return val;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }
    const url = await uploadFile(file, "photos");
    if (!url) return;
    set("photo", url);
  };

  const validate = () => {
    const missing = REQUIRED_FIELDS.filter((rf) => {
      const val = getVal(rf.field);
      return !val || val === 0 || val === "";
    });
    setErrors(missing);
    setShowErrors(missing.length > 0);
    return missing;
  };

  const goNext = () => {
    const missing = validate();
    if (missing.length > 0) { setStep(missing[0].step); setSidebarOpen(false); return; }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    setShowErrors(false);
    setSidebarOpen(false);
    saveDraft();
  };

  const goPrev = () => {
    setStep((s) => Math.max(0, s - 1));
    setShowErrors(false);
    setSidebarOpen(false);
  };

  const handleSave = async () => {
    const missing = validate();
    if (missing.length > 0) { setStep(missing[0].step); setSidebarOpen(false); return; }
    setSaving(true);
    try {
      await onSubmit(form, isEditMode, editId, listHref);
      setSaving(false);
      setSaved(true);
      clearDraft();
      setTimeout(() => router.push(listHref), 1200);
    } catch (err: any) {
      setSaving(false);
      alert("Failed to save: " + (err?.message || "Unknown error"));
    }
  };

  const errorFields = new Set(errors.map((e) => e.field));
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const completedSteps = new Set(STEPS.map((_, i) => i).filter((i) => i < step));

  const renderField = (label: string, field: string, type: string = "text", opts?: any) => {
    const val = getVal(field);
    const isRequired = REQUIRED_FIELDS.some((rf) => rf.field === field);
    const hasError = errorFields.has(field);
    const borderClass = hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/10";
    const baseInput = `w-full px-4 py-2.5 ${borderClass} border rounded-xl text-slate-900 text-sm focus:outline-none transition-all`;
    const staticClass = hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10";

    if (type === "select") {
      return (
        <div>
          <label className="block text-slate-500 text-xs font-medium mb-1.5">{label}{(opts?.required || isRequired) && <span className="text-red-500"> *</span>}</label>
          <select value={val || ""} onChange={(e) => set(field, e.target.value)} className={`${staticClass} w-full px-4 py-2.5 border rounded-xl text-slate-900 text-sm focus:outline-none transition-all`}>
            <option value="">Select...</option>
            {opts?.options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
          </select>
          {hasError && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Required</p>}
        </div>
      );
    }
    if (type === "toggle") {
      return (
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-700 text-sm">{label}</span>
          <button type="button" onClick={() => set(field, !val)} className={`w-11 h-6 rounded-full relative transition-colors ${val ? "bg-brand-600" : "bg-slate-300"}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? "left-6" : "left-1"}`} />
          </button>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-slate-500 text-xs font-medium mb-1.5">{label}{(opts?.required || isRequired) && <span className="text-red-500"> *</span>}</label>
        <input type={type} value={val || ""} onChange={(e) => set(field, type === "number" ? Number(e.target.value) : e.target.value)} disabled={opts?.disabled} placeholder={opts?.placeholder || ""} className={`${baseInput} disabled:opacity-60`} />
        {hasError && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Required</p>}
        {opts?.hint && <p className="text-slate-400 text-xs mt-1">{opts?.hint}</p>}
      </div>
    );
  };

  const SectionTitle = ({ icon: Icon, title, desc }: { icon: any; title: string; desc?: string }) => (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
      <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center"><Icon size={17} className="text-brand-600" /></div>
      <div>
        <h3 className="text-slate-900 font-bold text-sm">{title}</h3>
        {desc && <p className="text-slate-400 text-xs mt-0.5">{desc}</p>}
      </div>
    </div>
  );

  const Panel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm p-4 ${className}`}>{children}</div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={listHref} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"><ArrowLeft size={20} /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900">{isEditMode ? `Edit ${kind}` : `${kind} Registration`}</h1>
          <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 text-brand-700 px-2 py-0.5 text-[11px] font-bold"><ClipboardList size={11} /> Step {step + 1} of {STEPS.length}</span>
            <span className="text-slate-400">— {STEPS[step].label}</span>
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {draftSavedAt && <span className="text-[11px] text-slate-400 flex items-center gap-1"><History size={11} /> Draft saved {draftSavedAt}</span>}
            <span className="text-brand-600 text-sm font-bold">{progress}%</span>
          </div>
          <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      {showErrors && errors.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="text-red-800 font-bold text-sm">{errors.length} Required Field{errors.length > 1 ? "s" : ""} Missing</h3>
            <button onClick={() => setShowErrors(false)} className="ml-auto text-red-400 hover:text-red-600 text-xs">Dismiss</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {errors.map((e) => (
              <button key={e.field} onClick={() => { setStep(e.step); setShowErrors(false); setSidebarOpen(false); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 transition-all">
                <span className="w-4 h-4 rounded bg-red-200 flex items-center justify-center text-[8px] font-black text-red-700">{e.step + 1}</span>
                {e.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Stepper sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white shadow-sm p-3">
            <div className="flex items-center justify-between px-2 py-1.5 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Registration Steps</span>
            </div>
            <ol className="space-y-1">
              {STEPS.map((s, i) => {
                const hasErr = errors.some((e) => e.step === i);
                const isDone = completedSteps.has(i) && !hasErr;
                const isActive = i === step;
                const isLastDone = isDone && !isActive;
                return (
                  <li key={s.label}>
                    <button
                      onClick={() => { setStep(i); setShowErrors(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                        isActive ? "bg-brand-600 text-white shadow-md" : hasErr ? "bg-red-50 text-red-700 hover:bg-red-100" : isLastDone ? "text-slate-700 hover:bg-slate-50" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                        isActive ? "bg-white/20 text-white" : hasErr ? "bg-red-100 text-red-600" : isLastDone ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}>
                        {isLastDone ? <CheckCircle size={14} /> : hasErr ? <AlertTriangle size={13} /> : <s.icon size={14} />}
                      </span>
                      <span className="flex-1 text-sm font-medium">{i + 1}. {s.label}</span>
                      {isActive && <ChevronRight size={15} className="text-white/70" />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          {/* Mobile step tabs */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">Step {step + 1} of {STEPS.length}</span>
              <span className="text-brand-600 text-xs font-bold">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3"><div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {STEPS.map((s, i) => {
                const hasErr = errors.some((e) => e.step === i);
                const isDone = completedSteps.has(i) && !hasErr;
                return (
                  <button key={s.label} onClick={() => { setStep(i); setShowErrors(false); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all ${i === step ? "bg-brand-600 text-white shadow-md" : hasErr ? "bg-red-50 text-red-600 border border-red-200" : isDone ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-transparent"}`}>
                    {isDone ? <CheckCircle size={11} /> : hasErr ? <AlertTriangle size={11} /> : <s.icon size={11} />}
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            {step === 0 && (
              <div className="space-y-6">
                <SectionTitle icon={User} title="Personal Information" desc="Basic identity details of the employee" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderField(`${kind} ID`, "id", "text", { disabled: true })}
                  {renderField("Employee Code", "employeeCode", "text")}
                  {renderField("Full Name", "name", "text", { required: true })}
                  {renderField("Father Name", "fatherName", "text", { required: true })}
                  {renderField("CNIC Number", "cnic", "text", { placeholder: "35202-1234567-1", required: true })}
                  {renderField("Date of Birth", "dob", "date")}
                  {renderField("Gender", "gender", "select", { options: GENDERS })}
                  {renderField("Marital Status", "maritalStatus", "select", { options: MARITAL })}
                  {renderField("Blood Group", "bloodGroup", "select", { options: BLOOD_GROUPS })}
                  {renderField("Nationality", "nationality", "text")}
                </div>
                <SectionTitle icon={Camera} title="Profile Photo" desc="Upload a passport-size photograph" />
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {form.photo ? <img src={form.photo} alt="Photo" className="w-full h-full object-cover" /> : <Camera size={24} className="text-slate-400" />}
                  </div>
                  <div>
                    <label className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 cursor-pointer inline-block mb-1">Upload Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <p className="text-slate-400 text-xs">Passport size photo (max 5MB)</p>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <SectionTitle icon={Phone} title="Contact Information" desc="How to reach the employee" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderField("Mobile Number", "mobile", "text", { placeholder: "+92 3XX XXXXXXX", required: true })}
                  {renderField("WhatsApp Number", "whatsapp", "text")}
                  {renderField("Email Address", "email", "email")}
                  {renderField("Emergency Contact", "emergencyContact", "text")}
                  {renderField("Emergency Contact Person", "emergencyContactPerson", "text")}
                  {renderField("Relationship", "emergencyRelationship", "select", { options: RELATIONSHIPS })}
                </div>
                <SectionTitle icon={Building2} title="Address" desc="Residential address details" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderField("Province", "province", "select", { options: PROVINCES })}
                  {renderField("City", "city", "text")}
                  {renderField("Area", "area", "text")}
                  {renderField("Complete Address", "address", "text")}
                  {renderField("Postal Code", "postalCode", "text")}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <SectionTitle icon={Briefcase} title="Employment Information" desc="Role, team and employment status" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderField("Joining Date", "joiningDate", "date", { required: true })}
                  {renderField("Employment Type", "employmentType", "select", { options: EMP_TYPES })}
                  {renderField("Department", "department", "select", { options: DEPARTMENTS })}
                  {renderField("Designation", "designation", "select", { options: designationOptions })}
                  {kind === "DSM" ? (
                    <SearchSelect
                      label="Reporting Manager"
                      items={staffList}
                      value={getVal("reportingManager")}
                      onChange={(v) => set("reportingManager", v)}
                      placeholder="Select reporting manager..."
                    />
                  ) : (
                    <>
                      <SearchSelect
                        label="Assigned DSM"
                        items={staffList}
                        value={getVal("assignedDSM")}
                        onChange={(v) => set("assignedDSM", v)}
                        placeholder="Select DSM..."
                      />
                      {renderField("Assigned Franchise", "assignedFranchise", "text", { disabled: true })}
                      {renderField("Reporting Manager", "reportingManager", "text")}
                    </>
                  )}
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {renderField("Status", "status", "select", { options: ["Active", "Inactive", "Suspended", "Resigned"] })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <SectionTitle icon={Key} title="Login Information" desc="System credentials for the employee account" />
                <div className="bg-brand-50 rounded-xl p-4 border border-brand-200 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center"><Key size={15} /></div>
                  <div>
                    <p className="text-brand-700 text-xs font-bold">Credentials auto-generated</p>
                    <p className="text-brand-600/80 text-xs">You can customize them below. Share them securely with the employee.</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {renderField("Username", "username", "text", { hint: "Auto-generated" })}
                  {renderField("Password", "password", "text", { hint: "Auto-generated" })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <SectionTitle icon={Smartphone} title="Device Assignment" desc="Field device details (optional)" />
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center"><Smartphone size={15} /></div>
                  <p className="text-amber-700 text-xs font-medium">Device can be assigned later from Device Management.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderField("Device Brand", "deviceBrand", "text")}
                  {renderField("Device Model", "deviceModel", "text")}
                  {renderField("Registered Mobile", "registeredMobile", "text")}
                  {renderField("OTP Number", "otpNumber", "text")}
                  {renderField("Device Status", "deviceStatus", "select", { options: ["Available", "Assigned", "Returned", "Damaged"] })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <SectionTitle icon={Smartphone} title="SIM Allocation Limits" desc="Per-network monthly SIM quota" />
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><Smartphone size={15} className="text-brand-600" /> New SIM Limits</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {renderField("Jazz", "newSimLimits.jazz", "number")}
                    {renderField("Zong", "newSimLimits.zong", "number")}
                    {renderField("Ufone", "newSimLimits.ufone", "number")}
                    {renderField("Telenor", "newSimLimits.telenor", "number")}
                  </div>
                </Panel>
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><Smartphone size={15} className="text-brand-600" /> HLR SIM Limits</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {renderField("Jazz HLR", "hlrSimLimits.jazz", "number")}
                    {renderField("Zong HLR", "hlrSimLimits.zong", "number")}
                    {renderField("Ufone HLR", "hlrSimLimits.ufone", "number")}
                    {renderField("Telenor HLR", "hlrSimLimits.telenor", "number")}
                  </div>
                </Panel>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <SectionTitle icon={Target} title="Targets" desc="Performance targets for the employee" />
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><Target size={15} className="text-brand-600" /> Daily Target</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {renderField("New SIM", "dailyTargets.newSIM", "number")}
                    {renderField("MNP", "dailyTargets.mnp", "number")}
                    {renderField("Replacement", "dailyTargets.replacement", "number")}
                    {renderField("BYN", "dailyTargets.byn", "number")}
                  </div>
                </Panel>
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><Target size={15} className="text-brand-600" /> Monthly Target</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {renderField("Activations", "monthlyTargets.activations", "number")}
                    {renderField("Revenue (PKR)", "monthlyTargets.revenue", "number")}
                    {renderField("Sales", "monthlyTargets.sales", "number")}
                  </div>
                </Panel>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-6">
                <SectionTitle icon={DollarSign} title="Salary & Commission" desc="Compensation package and commission rates" />
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><DollarSign size={15} className="text-brand-600" /> Salary Information</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {renderField("Basic Salary (PKR)", "salary", "number", { required: true })}
                    {renderField("Fuel Allowance (PKR)", "fuelAllowance", "number")}
                    {renderField("Mobile Allowance (PKR)", "mobileAllowance", "number")}
                    {renderField("Daily Allowance (PKR)", "dailyAllowance", "number")}
                    {renderField("Residence Allowance (PKR)", "residenceAllowance", "number")}
                  </div>
                </Panel>
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><DollarSign size={15} className="text-brand-600" /> Commission Rates (Rs. per activation)</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderField("New SIM BVS (Rs.)", "newSimBvs", "number")}
                    {renderField("New SIM FCA (Rs.)", "newSimFca", "number")}
                    {renderField("New SIM IFCA (Rs.)", "newSimIfca", "number")}
                    {renderField("MNP BVS (Rs.)", "mnpBvs", "number")}
                    {renderField("MNP FCA (Rs.)", "mnpFca", "number")}
                    {renderField("MNP IFCA (Rs.)", "mnpIfca", "number")}
                    {renderField("Repl BVS (Rs.)", "replacementBvs", "number")}
                    {renderField("Repl FCA (Rs.)", "replacementFca", "number")}
                    {renderField("Repl IFCA (Rs.)", "replacementIfca", "number")}
                    {renderField("BYN BVS (Rs.)", "bynBvs", "number")}
                    {renderField("BYN FCA (Rs.)", "bynFca", "number")}
                    {renderField("BYN IFCA (Rs.)", "bynIfca", "number")}
                    {renderField("Hike Commission (Rs.)", "hikeCommission", "number")}
                    {renderField("Other Commission (Rs.)", "otherCommission", "number")}
                  </div>
                </Panel>
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><DollarSign size={15} className="text-brand-600" /> Bonuses & Deductions</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderField("Target Bonus (PKR)", "targetBonus", "number")}
                    {renderField("Performance Bonus (PKR)", "bonus", "number")}
                    {renderField("Advance Salary (PKR)", "advanceSalary", "number")}
                    {renderField("Loan Deduction (PKR/month)", "loanDeduction", "number")}
                    {renderField("Other Deduction (PKR)", "otherDeduction", "number")}
                  </div>
                </Panel>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-6">
                <SectionTitle icon={Building2} title="Bank Information" desc="Salary account and digital wallet details" />
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><Building2 size={15} className="text-brand-600" /> Bank Account</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderField("Bank Name", "bankName", "select", { options: BANKS })}
                    {renderField("Account Title", "accountTitle", "text")}
                    {renderField("Account Number", "accountNumber", "text")}
                    {renderField("IBAN", "iban", "text", { placeholder: "PK## XXXX XXXX XXXX XXXX" })}
                  </div>
                </Panel>
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><Smartphone size={15} className="text-brand-600" /> Digital Wallet</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {renderField("Easypaisa Number", "easypaisaNumber", "text")}
                    {renderField("JazzCash Number", "jazzcashNumber", "text")}
                  </div>
                </Panel>
              </div>
            )}

            {step === 9 && (
              <div className="space-y-8">
                <SectionTitle icon={FileText} title="Employee Documents" desc="Upload required identity and qualification documents" />
                <div className="grid sm:grid-cols-2 gap-4">
                  {DOC_FIELDS.map((doc) => (
                    <FileUploadCard
                      key={doc.key}
                      label={doc.label + (doc.required ? " *" : "")}
                      hint={doc.required ? "Required document" : "Optional document"}
                      value={getVal(`documents.${doc.key}`) || ""}
                      folder="documents"
                      onChange={(url) => set(`documents.${doc.key}`, url)}
                    />
                  ))}
                </div>

                <div>
                  <SectionTitle icon={FileText} title="Employment Agreement" desc="Signed agreement details" />
                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    {renderField("Agreement Number", "agreements.agreementNumber", "text")}
                    {renderField("Agreement Date", "agreements.agreementDate", "date")}
                    {renderField("Expiry Date", "agreements.agreementExpiry", "date")}
                  </div>
                  <FileUploadCard
                    label="Agreement PDF"
                    hint="Upload the signed employment agreement"
                    value={getVal("agreements.agreementPdf") || ""}
                    folder="documents"
                    onChange={(url) => set("agreements.agreementPdf", url)}
                  />
                </div>

                <div>
                  <SectionTitle icon={FileText} title="Stamp Paper" desc="Stamp paper details" />
                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    {renderField("Stamp Number", "agreements.stampNumber", "text")}
                    {renderField("Amount (PKR)", "agreements.stampAmount", "number")}
                    {renderField("Issue Date", "agreements.stampDate", "date")}
                  </div>
                  <FileUploadCard
                    label="Stamp Paper Copy"
                    hint="Upload a copy of the stamp paper"
                    value={getVal("agreements.stampPaperCopy") || ""}
                    folder="documents"
                    onChange={(url) => set("agreements.stampPaperCopy", url)}
                  />
                </div>

                <div>
                  <SectionTitle icon={Shield} title="Guarantor Information" desc="Guarantor and guarantee documents" />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {renderField("Guarantor Name", "guarantor.name", "text")}
                    {renderField("Father Name", "guarantor.fatherName", "text")}
                    {renderField("CNIC", "guarantor.cnic", "text")}
                    {renderField("Mobile", "guarantor.mobile", "text")}
                    {renderField("Address", "guarantor.address", "text")}
                    {renderField("Relationship", "guarantor.relationship", "select", { options: RELATIONSHIPS })}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FileUploadCard label="Guarantee Letter" value={getVal("guarantor.guaranteeLetter") || ""} folder="documents" onChange={(url) => set("guarantor.guaranteeLetter", url)} />
                    <FileUploadCard label="Guarantor CNIC Front" value={getVal("guarantor.cnicFront") || ""} folder="documents" onChange={(url) => set("guarantor.cnicFront", url)} />
                    <FileUploadCard label="Guarantor CNIC Back" value={getVal("guarantor.cnicBack") || ""} folder="documents" onChange={(url) => set("guarantor.cnicBack", url)} />
                  </div>
                </div>
              </div>
            )}

            {step === 10 && (
              <div className="space-y-6">
                <SectionTitle icon={Shield} title="Attendance Settings" desc="Configure the attendance & location policies" />
                <Panel>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {renderField("Enable GPS", "attendanceSettings.enableGPS", "toggle")}
                    {renderField("Selfie Verification", "attendanceSettings.selfieVerification", "toggle")}
                    {renderField("Location Tracking", "attendanceSettings.locationTracking", "toggle")}
                  </div>
                </Panel>
                <Panel>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {renderField("Office Radius (meters)", "attendanceSettings.officeRadius", "number")}
                    {renderField("Check-in Time", "attendanceSettings.checkInTime", "time")}
                    {renderField("Check-out Time", "attendanceSettings.checkOutTime", "time")}
                  </div>
                </Panel>
              </div>
            )}

            {step === 11 && (
              <div className="space-y-6">
                <SectionTitle icon={Shield} title="System Permissions" desc="Control what the employee can access" />
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><Shield size={15} className="text-brand-600" /> Sales Module</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {renderField("New SIM", "permissions.newSIM", "toggle")}
                    {renderField("MNP", "permissions.mnp", "toggle")}
                    {renderField("Replacement", "permissions.replacement", "toggle")}
                    {renderField("BYN", "permissions.byn", "toggle")}
                  </div>
                </Panel>
                <Panel>
                  <h4 className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2"><Shield size={15} className="text-brand-600" /> Other Modules</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {renderField("Wallet", "permissions.wallet", "toggle")}
                    {renderField("Attendance", "permissions.attendance", "toggle")}
                    {renderField("Reports", "permissions.reports", "toggle")}
                    {renderField("Notifications", "permissions.notifications", "toggle")}
                  </div>
                </Panel>
              </div>
            )}

            {step === 12 && <ReviewStep form={form} kind={kind} onEdit={setStep} />}
          </div>

          {/* Action bar */}
          <div className="sticky bottom-4 z-20 mt-6">
            <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-3 flex items-center justify-between gap-3">
              <button onClick={goPrev} disabled={step === 0} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ArrowLeft size={16} /> Previous
              </button>
              <div className="flex gap-2">
                {!isEditMode && (
                  <button onClick={() => { saveDraft(); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 font-medium text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                    <Save size={15} /> Save Draft
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button onClick={goNext} className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 shadow-md transition-all hover:scale-105">
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saved || saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-md transition-all hover:scale-105 disabled:opacity-60">
                    {saved ? <><CheckCircle size={16} /> {isEditMode ? "Updated!" : "Created!"}</> : saving ? <><RotateCcw size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {isEditMode ? `Update ${kind} Account` : `Create ${kind} Account`}</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Review step ---------------- */

function ReviewStep({ form, kind, onEdit }: { form: any; kind: string; onEdit: (i: number) => void }) {
  const docs = [
    { name: "CNIC Front", ok: !!form.documents?.cnicFront, step: 9 },
    { name: "CNIC Back", ok: !!form.documents?.cnicBack, step: 9 },
    { name: "Photo", ok: !!form.photo, step: 0 },
    { name: "Edu Cert", ok: !!form.documents?.educationalCert, step: 9 },
    { name: "Exp Cert", ok: !!form.documents?.experienceCert, step: 9 },
    { name: "Agreement", ok: !!(form.agreements as any)?.agreementPdf, step: 9 },
    { name: "Stamp Paper", ok: !!(form.agreements as any)?.stampPaperCopy, step: 9 },
    { name: "Guarantee Letter", ok: !!(form.guarantor as any)?.guaranteeLetter, step: 9 },
    { name: "Guarantor CNIC Front", ok: !!(form.guarantor as any)?.cnicFront, step: 9 },
    { name: "Guarantor CNIC Back", ok: !!(form.guarantor as any)?.cnicBack, step: 9 },
  ];
  const docsUploaded = docs.filter((d) => d.ok).length;

  const sections = [
    {
      title: "Personal", step: 0,
      rows: [
        { label: `${kind} ID`, value: form.id },
        { label: "Name", value: form.name || "—", err: !form.name },
        { label: "Father Name", value: form.fatherName || "—", err: !form.fatherName },
        { label: "CNIC", value: form.cnic || "—", err: !form.cnic },
        { label: "Mobile", value: form.mobile || "—", err: !form.mobile },
        { label: "Gender", value: form.gender || "—" },
        { label: "DOB", value: form.dob || "—" },
      ],
    },
    {
      title: "Employment", step: 2,
      rows: [
        { label: "Franchise", value: form.franchiseId },
        { label: kind === "DSO" ? "Assigned DSM" : "Reporting Manager", value: (kind === "DSO" ? form.assignedDSM : form.reportingManager) || "—" },
        { label: "Designation", value: form.designation || "—" },
        { label: "Status", value: form.status },
        { label: "Joining Date", value: form.joiningDate || "—" },
        { label: "Salary", value: `PKR ${form.salary.toLocaleString()}` },
      ],
    },
    {
      title: "Contact & Address", step: 1,
      rows: [
        { label: "Email", value: form.email || "—" },
        { label: "WhatsApp", value: form.whatsapp || "—" },
        { label: "Province", value: form.province || "—" },
        { label: "City", value: form.city || "—" },
        { label: "Address", value: form.address || "—" },
      ],
    },
    {
      title: "Targets", step: 6,
      rows: [
        { label: "Daily New SIM", value: String(form.dailyTargets?.newSIM || 0) },
        { label: "Daily MNP", value: String(form.dailyTargets?.mnp || 0) },
        { label: "Monthly Activations", value: String(form.monthlyTargets?.activations || 0) },
        { label: "Monthly Revenue", value: `PKR ${(form.monthlyTargets?.revenue || 0).toLocaleString()}` },
      ],
    },
    {
      title: "Salary Breakdown", step: 7,
      rows: [
        { label: "Basic", value: `PKR ${form.salary.toLocaleString()}` },
        { label: "Fuel Allow.", value: `PKR ${(form.fuelAllowance || 0).toLocaleString()}` },
        { label: "Mobile Allow.", value: `PKR ${(form.mobileAllowance || 0).toLocaleString()}` },
        { label: "New SIM BVS", value: `PKR ${(form.newSimBvs || 0).toLocaleString()}` },
        { label: "New SIM FCA", value: `PKR ${(form.newSimFca || 0).toLocaleString()}` },
        { label: "MNP BVS", value: `PKR ${(form.mnpBvs || 0).toLocaleString()}` },
        { label: "MNP FCA", value: `PKR ${(form.mnpFca || 0).toLocaleString()}` },
        { label: "Target Bonus", value: `PKR ${(form.targetBonus || 0).toLocaleString()}` },
      ],
    },
    {
      title: "Credentials", step: 3,
      rows: [
        { label: "Username", value: form.username },
        { label: "Password", value: form.password },
        { label: "Retailer ID", value: form.retailerId || "Auto from mobile" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <SectionTitlePure icon={CheckCircle} title="Review Information" desc="Confirm all details before creating the account" />

      <div className="rounded-xl bg-brand-50 border border-brand-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-brand-900 font-bold text-sm flex items-center gap-2"><UploadCloud size={15} className="text-brand-600" /> Documents Uploaded</h4>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${docsUploaded === docs.length ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{docsUploaded}/{docs.length}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {docs.map((d) => (
            <button key={d.name} onClick={() => onEdit(d.step)} className={`text-[10px] font-medium px-2 py-1 rounded-lg transition-colors ${d.ok ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`} title="Go to documents">
              {d.ok ? "✓" : "✗"} {d.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wide">{sec.title}</h4>
              <button onClick={() => onEdit(sec.step)} className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 transition-colors"><PencilLine size={11} /> Edit</button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
              {sec.rows.map((r) => (
                <InfoRow key={r.label} label={r.label} value={r.value} err={(r as any).err} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center">
        <p className="text-sm text-brand-800 font-semibold">Ready to create the {kind} account?</p>
        <p className="text-xs text-brand-600 mt-0.5">Click the green button below to save. You can always edit the profile later.</p>
      </div>
    </div>
  );
}

function SectionTitlePure({ icon: Icon, title, desc }: { icon: any; title: string; desc?: string }) {
  return (
    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
      <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center"><Icon size={17} className="text-brand-600" /></div>
      <div>
        <h3 className="text-slate-900 font-bold text-sm">{title}</h3>
        {desc && <p className="text-slate-400 text-xs mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function InfoRow({ label, value, err }: { label: string; value: string; err?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium text-right ${err ? "text-red-600" : "text-slate-900"}`}>{value}{err ? " ⚠" : ""}</span>
    </div>
  );
}

/* ---------------- Search select (reporting manager / assigned DSM) ---------------- */

function SearchSelect({ label, items, value, onChange, placeholder }: { label: string; items: any[]; value: string | undefined; onChange: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => items.filter((d) => (d.name || "").toLowerCase().includes(search.toLowerCase()) || (d.id || "").toLowerCase().includes(search.toLowerCase())), [items, search]);
  const selected = items.find((d) => d.id === value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-slate-500 text-xs font-medium mb-1.5">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl text-sm transition-all border-slate-200 bg-slate-50 hover:border-brand-300 ${open ? "border-brand-500/50 ring-2 ring-brand-500/10" : ""}`}>
        <span className={selected ? "text-slate-900" : "text-slate-400"}>{selected ? `${selected.name} (${selected.id})` : placeholder}</span>
        <Search size={14} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
            <Search size={14} className="text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              autoFocus />
            {search && <button onClick={() => setSearch("")}><XIcon size={14} className="text-slate-400 hover:text-slate-600" /></button>}
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-slate-400 text-sm">{items.length === 0 ? "No records available" : "No records match your search"}</div>
            ) : (
              filtered.map((d) => (
                <button key={d.id} type="button" onClick={() => { onChange(d.id); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-brand-50 transition-colors flex items-center justify-between ${d.id === value ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-700"}`}>
                  <span>{d.name} <span className="text-slate-400 font-mono text-xs">({d.id})</span></span>
                  {d.id === value && <CheckCircle size={14} className="text-brand-600" />}
                </button>
              ))
            )}
          </div>
          {value && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-red-500 border-t border-slate-100 transition-colors">
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
