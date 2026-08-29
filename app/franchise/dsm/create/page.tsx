"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Save, User, Phone, Briefcase, Key, Smartphone, Target, DollarSign, Building2, FileText, Shield, CheckCircle, Camera, AlertTriangle, Search, X as XIcon } from "lucide-react";
import { useFranchiseData, DSM, genId, genUsername, genPassword } from "@/lib/FranchiseDataContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { uploadFile } from "@/lib/r2Client";

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

const REQUIRED_FIELDS: { field: string; label: string; step: number }[] = [
  { field: "name", label: "Full Name", step: 0 },
  { field: "fatherName", label: "Father Name", step: 0 },
  { field: "cnic", label: "CNIC Number", step: 0 },
  { field: "mobile", label: "Mobile Number", step: 1 },
  { field: "joiningDate", label: "Joining Date", step: 2 },
  { field: "salary", label: "Basic Salary", step: 7 },
];

const PROVINCES = ["Punjab", "Sindh", "KPK", "Balochistan", "Islamabad", "GB", "AJK"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];
const MARITAL = ["Single", "Married", "Divorced", "Widowed"];
const EMP_TYPES = ["Full Time", "Part Time", "Contract", "Intern"];
const DEPARTMENTS = ["Sales", "Marketing", "Operations", "Finance", "HR"];
const DESIG_DSM = ["Area Sales Manager", "Senior DSM", "Junior DSM", "Trainee DSM"];
const BANKS = ["HBL", "UBL", "MCB", "NBP", "Allied Bank", "Meezan Bank", "Faysal Bank", "JS Bank", "Askari Bank", "Other"];
const RELATIONSHIPS = ["Father", "Mother", "Brother", "Sister", "Wife", "Husband", "Uncle", "Friend", "Other"];

export default function DSMCreatePage() {
  const { auth, dsms, addDSM, updateDSM } = useFranchiseData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;
  const existingDSM = isEditMode ? dsms.find((d) => d.id === editId) : null;
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ field: string; label: string; step: number }[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const getFreshDefaults = (): DSM => ({
    id: genId("DSM-" + auth.franchiseId.split("-")[0], dsms.length + 1), name: "", fatherName: "", cnic: "", mobile: "", address: "",
    joiningDate: new Date().toISOString().split("T")[0], salary: 0, commission: 0,
    username: genUsername("dsm", dsms.length + 1), password: genPassword(), status: "Active", photo: "",
    franchiseId: auth.franchiseId, retailerId: "", employeeCode: "", dob: "", gender: "Male", maritalStatus: "Single",
    bloodGroup: "", nationality: "Pakistani", whatsapp: "", email: "", emergencyContact: "",
    emergencyContactPerson: "", emergencyRelationship: "Father", province: "Punjab", city: "", area: "",
    postalCode: "", employmentType: "Full Time", department: "Sales", designation: "Area Sales Manager",
    reportingManager: "", registeredMobile: "", otpNumber: "", deviceStatus: "Available",
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
  });

  const [form, setForm] = useState<DSM>(() => {
    const defaults = getFreshDefaults();
    if (existingDSM) {
      return {
        ...defaults,
        ...existingDSM,
        newSimLimits: { ...defaults.newSimLimits, ...existingDSM.newSimLimits },
        hlrSimLimits: { ...defaults.hlrSimLimits, ...existingDSM.hlrSimLimits },
        dailyTargets: { ...defaults.dailyTargets, ...existingDSM.dailyTargets },
        monthlyTargets: { ...defaults.monthlyTargets, ...existingDSM.monthlyTargets },
        attendanceSettings: { ...defaults.attendanceSettings, ...existingDSM.attendanceSettings },
        permissions: { ...defaults.permissions, ...existingDSM.permissions },
        documents: { ...defaults.documents, ...existingDSM.documents },
        agreements: { ...defaults.agreements, ...existingDSM.agreements },
        guarantor: { ...defaults.guarantor, ...existingDSM.guarantor },
      };
    }
    return defaults;
  });

  const formatCNIC = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 13);
    let formatted = "";
    for (let i = 0; i < digits.length; i++) {
      if (i === 5 || i === 12) formatted += "-";
      formatted += digits[i];
    }
    return formatted;
  };

  const set = (field: string, value: any) => {
    if (field === "cnic" && typeof value === "string") {
      value = formatCNIC(value);
    }
    setForm((p) => {
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

  const handleSave = async () => {
    const missing = validate();
    if (missing.length > 0) {
      setStep(missing[0].step);
      return;
    }
    try {
      if (isEditMode && editId) {
        await updateDSM(editId, form);
      } else {
        await addDSM(form);
      }
      setSaved(true);
      setForm(getFreshDefaults());
      setStep(0);
      setTimeout(() => router.push("/franchise/dsm"), 1200);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
  };

  const errorFields = new Set(errors.map((e) => e.field));
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const renderField = (label: string, field: string, type: string = "text", opts?: any) => {
    const val = getVal(field);
    const isRequired = REQUIRED_FIELDS.some((rf) => rf.field === field);
    const hasError = errorFields.has(field);
    const borderClass = hasError ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50";

    if (type === "select") {
      return (
        <div>
          <label className="block text-gray-500 text-xs font-medium mb-1.5">{label}{(opts?.required || isRequired) && " *"}</label>
          <select value={val || ""} onChange={(e) => set(field, e.target.value)} className={`w-full px-4 py-2.5 ${borderClass} border rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50`}>
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
          <span className="text-gray-700 text-sm">{label}</span>
          <button type="button" onClick={() => set(field, !val)} className={`w-11 h-6 rounded-full relative transition-colors ${val ? "bg-[#0A2647]" : "bg-gray-300"}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${val ? "left-6" : "left-1"}`} />
          </button>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-gray-500 text-xs font-medium mb-1.5">{label}{(opts?.required || isRequired) && " *"}</label>
        <input type={type} value={val || ""} onChange={(e) => set(field, type === "number" ? Number(e.target.value) : e.target.value)} disabled={opts?.disabled} placeholder={opts?.placeholder || ""} className={`w-full px-4 py-2.5 ${borderClass} border rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 disabled:opacity-60`} />
        {hasError && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Required</p>}
        {opts?.hint && <p className="text-gray-400 text-xs mt-1">{opts?.hint}</p>}
      </div>
    );
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-[#0A2647]/10 flex items-center justify-center"><Icon size={16} className="text-[#0A2647]" /></div>
      <h3 className="text-gray-900 font-bold text-sm">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/franchise/dsm" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{isEditMode ? "Edit DSM" : "DSM Registration"}</h1>
          <p className="text-gray-500 text-sm mt-1">Step {step + 1} of {STEPS.length} â€” {STEPS[step].label}</p>
        </div>
      </div>

      {showErrors && errors.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="text-red-800 font-bold text-sm">{errors.length} Required Field{errors.length > 1 ? "s" : ""} Missing</h3>
            <button onClick={() => setShowErrors(false)} className="ml-auto text-red-400 hover:text-red-600 text-xs">Dismiss</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {errors.map((e) => (
              <button key={e.field} onClick={() => { setStep(e.step); setShowErrors(false); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 transition-all">
                <span className="w-4 h-4 rounded bg-red-200 flex items-center justify-center text-[8px] font-black text-red-700">{e.step + 1}</span>
                {e.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 text-xs font-medium">Progress</span>
          <span className="text-[#0A2647] text-xs font-bold">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#0A2647] rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const hasErr = errors.some((e) => e.step === i);
            return (
              <button key={i} onClick={() => setStep(i)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${i === step ? "bg-[#0A2647] text-white" : hasErr ? "bg-red-50 text-red-600 border border-red-200" : i < step ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {i < step ? <CheckCircle size={10} /> : hasErr ? <AlertTriangle size={10} /> : <s.icon size={10} />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {step === 0 && (
          <div className="space-y-6">
            <SectionTitle icon={User} title="Personal Information" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField("DSM ID", "id", "text", { disabled: true })}
              {renderField("Employee Code", "employeeCode", "text")}
              {renderField("Full Name *", "name", "text")}
              {renderField("Father Name *", "fatherName", "text")}
              {renderField("CNIC Number *", "cnic", "text", { placeholder: "35202-1234567-1" })}
              {renderField("Date of Birth", "dob", "date")}
              {renderField("Gender", "gender", "select", { options: GENDERS })}
              {renderField("Marital Status", "maritalStatus", "select", { options: MARITAL })}
              {renderField("Blood Group", "bloodGroup", "select", { options: BLOOD_GROUPS })}
              {renderField("Nationality", "nationality", "text")}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {form.photo ? <img src={form.photo} alt="Photo" className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-400" />}
              </div>
              <div>
                <label className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 cursor-pointer inline-block mb-1">Upload Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <p className="text-gray-400 text-xs">Passport size photo (max 5MB)</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <SectionTitle icon={Phone} title="Contact Information" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField("Mobile Number *", "mobile", "text", { placeholder: "+92 3XX XXXXXXX" })}
              {renderField("WhatsApp Number", "whatsapp", "text")}
              {renderField("Email Address", "email", "email")}
              {renderField("Emergency Contact", "emergencyContact", "text")}
              {renderField("Emergency Contact Person", "emergencyContactPerson", "text")}
              {renderField("Relationship", "emergencyRelationship", "select", { options: RELATIONSHIPS })}
            </div>
            <SectionTitle icon={Building2} title="Address" />
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
            <SectionTitle icon={Briefcase} title="Employment Information" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField("Joining Date *", "joiningDate", "date")}
              {renderField("Employment Type", "employmentType", "select", { options: EMP_TYPES })}
              {renderField("Department", "department", "select", { options: DEPARTMENTS })}
              {renderField("Designation", "designation", "select", { options: DESIG_DSM })}
              <ReportingManagerSelect
                dsms={dsms}
                value={form.reportingManager}
                onChange={(v) => set("reportingManager", v)}
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {renderField("Status", "status", "select", { options: ["Active", "Inactive", "Suspended", "Resigned"] })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <SectionTitle icon={Key} title="Login Information" />
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
              <p className="text-blue-700 text-xs font-medium">Credentials auto-generated. Customize below.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {renderField("Username", "username", "text", { hint: "Auto-generated" })}
              {renderField("Password", "password", "text", { hint: "Auto-generated" })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <SectionTitle icon={Smartphone} title="Device Assignment" />
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
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
            <SectionTitle icon={Smartphone} title="SIM Allocation Limits" />
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">New SIM Limits</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {renderField("Jazz", "newSimLimits.jazz", "number")}
                {renderField("Zong", "newSimLimits.zong", "number")}
                {renderField("Ufone", "newSimLimits.ufone", "number")}
                {renderField("Telenor", "newSimLimits.telenor", "number")}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">HLR SIM Limits</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {renderField("Jazz HLR", "hlrSimLimits.jazz", "number")}
                {renderField("Zong HLR", "hlrSimLimits.zong", "number")}
                {renderField("Ufone HLR", "hlrSimLimits.ufone", "number")}
                {renderField("Telenor HLR", "hlrSimLimits.telenor", "number")}
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <SectionTitle icon={Target} title="Targets" />
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">Daily Target</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {renderField("New SIM", "dailyTargets.newSIM", "number")}
                {renderField("MNP", "dailyTargets.mnp", "number")}
                {renderField("Replacement", "dailyTargets.replacement", "number")}
                {renderField("BYN", "dailyTargets.byn", "number")}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">Monthly Target</h4>
              <div className="grid grid-cols-3 gap-4">
                {renderField("Activations", "monthlyTargets.activations", "number")}
                {renderField("Revenue (PKR)", "monthlyTargets.revenue", "number")}
                {renderField("Sales", "monthlyTargets.sales", "number")}
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <SectionTitle icon={DollarSign} title="Salary & Commission" />
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">Salary Information</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderField("Basic Salary (PKR) *", "salary", "number")}
                {renderField("Fuel Allowance (PKR)", "fuelAllowance", "number")}
                {renderField("Mobile Allowance (PKR)", "mobileAllowance", "number")}
                {renderField("Daily Allowance (PKR)", "dailyAllowance", "number")}
                {renderField("Residence Allowance (PKR)", "residenceAllowance", "number")}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">Commission Rates (Rs. per activation)</h4>
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
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">Bonuses & Deductions</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderField("Target Bonus (PKR)", "targetBonus", "number")}
                {renderField("Performance Bonus (PKR)", "bonus", "number")}
                {renderField("Advance Salary (PKR)", "advanceSalary", "number")}
                {renderField("Loan Deduction (PKR/month)", "loanDeduction", "number")}
                {renderField("Other Deduction (PKR)", "otherDeduction", "number")}
              </div>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6">
            <SectionTitle icon={Building2} title="Bank Information" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField("Bank Name", "bankName", "select", { options: BANKS })}
              {renderField("Account Title", "accountTitle", "text")}
              {renderField("Account Number", "accountNumber", "text")}
              {renderField("IBAN", "iban", "text", { placeholder: "PK## XXXX XXXX XXXX XXXX" })}
            </div>
            <SectionTitle icon={Smartphone} title="Digital Wallet" />
            <div className="grid sm:grid-cols-2 gap-4">
              {renderField("Easypaisa Number", "easypaisaNumber", "text")}
              {renderField("JazzCash Number", "jazzcashNumber", "text")}
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-6">
            <SectionTitle icon={FileText} title="Employee Documents" />
            <div className="grid sm:grid-cols-2 gap-4">
              {["cnicFront", "cnicBack", "educationalCert", "experienceCert"].map((doc) => (
                <div key={doc} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 text-sm font-medium mb-2">{doc.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</p>
                  <label className="px-3 py-2 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer inline-block">Upload</label>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadFile(file, "documents");
                    if (!url) return;
                    set(`documents.${doc}`, url);
                  }} />
                  {(form.documents as any)?.[doc] && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} /> Uploaded</p>}
                </div>
              ))}
            </div>
            <SectionTitle icon={FileText} title="Employment Agreement" />
            <div className="grid sm:grid-cols-3 gap-4">
              {renderField("Agreement Number", "agreements.agreementNumber", "text")}
              {renderField("Agreement Date", "agreements.agreementDate", "date")}
              {renderField("Expiry Date", "agreements.agreementExpiry", "date")}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 text-sm font-medium mb-2">Agreement PDF</p>
              <label className="px-3 py-2 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer inline-block">Upload Agreement</label>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadFile(file, "documents");
                if (!url) return;
                set("agreements.agreementPdf", url);
              }} />
              {(form.agreements as any)?.agreementPdf && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} /> Uploaded</p>}
            </div>
            <SectionTitle icon={FileText} title="Stamp Paper" />
            <div className="grid sm:grid-cols-3 gap-4">
              {renderField("Stamp Number", "agreements.stampNumber", "text")}
              {renderField("Amount (PKR)", "agreements.stampAmount", "number")}
              {renderField("Issue Date", "agreements.stampDate", "date")}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 text-sm font-medium mb-2">Stamp Paper Copy</p>
              <label className="px-3 py-2 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer inline-block">Upload Stamp Paper</label>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadFile(file, "documents");
                if (!url) return;
                set("agreements.stampPaperCopy", url);
              }} />
              {(form.agreements as any)?.stampPaperCopy && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} /> Uploaded</p>}
            </div>
            <SectionTitle icon={FileText} title="Guarantor Information" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderField("Guarantor Name", "guarantor.name", "text")}
              {renderField("Father Name", "guarantor.fatherName", "text")}
              {renderField("CNIC", "guarantor.cnic", "text")}
              {renderField("Mobile", "guarantor.mobile", "text")}
              {renderField("Address", "guarantor.address", "text")}
              {renderField("Relationship", "guarantor.relationship", "select", { options: RELATIONSHIPS })}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700 text-sm font-medium mb-2">Guarantee Letter</p>
                <label className="px-3 py-2 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer inline-block">Upload</label>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadFile(file, "documents");
                  if (!url) return;
                  set("guarantor.guaranteeLetter", url);
                }} />
                {(form.guarantor as any)?.guaranteeLetter && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} /> Uploaded</p>}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700 text-sm font-medium mb-2">Guarantor CNIC Front</p>
                <label className="px-3 py-2 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer inline-block">Upload</label>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadFile(file, "documents");
                  if (!url) return;
                  set("guarantor.cnicFront", url);
                }} />
                {(form.guarantor as any)?.cnicFront && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} /> Uploaded</p>}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700 text-sm font-medium mb-2">Guarantor CNIC Back</p>
                <label className="px-3 py-2 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer inline-block">Upload</label>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadFile(file, "documents");
                  if (!url) return;
                  set("guarantor.cnicBack", url);
                }} />
                {(form.guarantor as any)?.cnicBack && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} /> Uploaded</p>}
              </div>
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="space-y-6">
            <SectionTitle icon={Shield} title="Attendance Settings" />
            <div className="grid sm:grid-cols-2 gap-4">
              {renderField("Enable GPS", "attendanceSettings.enableGPS", "toggle")}
              {renderField("Selfie Verification", "attendanceSettings.selfieVerification", "toggle")}
              {renderField("Location Tracking", "attendanceSettings.locationTracking", "toggle")}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {renderField("Office Radius (meters)", "attendanceSettings.officeRadius", "number")}
              {renderField("Check-in Time", "attendanceSettings.checkInTime", "time")}
              {renderField("Check-out Time", "attendanceSettings.checkOutTime", "time")}
            </div>
          </div>
        )}

        {step === 11 && (
          <div className="space-y-6">
            <SectionTitle icon={Shield} title="System Permissions" />
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">Sales Module</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {renderField("New SIM", "permissions.newSIM", "toggle")}
                {renderField("MNP", "permissions.mnp", "toggle")}
                {renderField("Replacement", "permissions.replacement", "toggle")}
                {renderField("BYN", "permissions.byn", "toggle")}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-gray-900 font-bold text-sm mb-3">Other Modules</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {renderField("Wallet", "permissions.wallet", "toggle")}
                {renderField("Attendance", "permissions.attendance", "toggle")}
                {renderField("Reports", "permissions.reports", "toggle")}
                {renderField("Notifications", "permissions.notifications", "toggle")}
              </div>
            </div>
          </div>
        )}

        {step === 12 && (
          <div className="space-y-6">
            <SectionTitle icon={CheckCircle} title="Review Information" />
            {(() => {
              const docs = [
                { name: "CNIC Front", ok: !!form.documents?.cnicFront },
                { name: "CNIC Back", ok: !!form.documents?.cnicBack },
                { name: "Photo", ok: !!form.photo },
                { name: "Edu Cert", ok: !!form.documents?.educationalCert },
                { name: "Exp Cert", ok: !!form.documents?.experienceCert },
                { name: "Agreement", ok: !!(form.agreements as any)?.agreementPdf },
                { name: "Stamp Paper", ok: !!(form.agreements as any)?.stampPaperCopy },
                { name: "Guarantee Letter", ok: !!(form.guarantor as any)?.guaranteeLetter },
                { name: "Guarantor CNIC Front", ok: !!(form.guarantor as any)?.cnicFront },
                { name: "Guarantor CNIC Back", ok: !!(form.guarantor as any)?.cnicBack },
              ];
              const docsUploaded = docs.filter((d) => d.ok).length;
              return (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-blue-900 font-bold text-sm">Documents Uploaded</h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${docsUploaded === docs.length ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{docsUploaded}/{docs.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {docs.map((d) => (
                      <span key={d.name} className={`text-[10px] font-medium px-2 py-1 rounded-lg ${d.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {d.ok ? "âœ“" : "âœ—"} {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-gray-900 font-bold text-xs uppercase">Personal</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <InfoRow label="DSM ID" value={form.id} />
                  <InfoRow label="Name" value={form.name || "â€”"} err={!form.name} />
                  <InfoRow label="Father Name" value={form.fatherName || "â€”"} err={!form.fatherName} />
                  <InfoRow label="CNIC" value={form.cnic || "â€”"} err={!form.cnic} />
                  <InfoRow label="Mobile" value={form.mobile || "â€”"} err={!form.mobile} />
                  <InfoRow label="Gender" value={form.gender || "â€”"} />
                  <InfoRow label="DOB" value={form.dob || "â€”"} />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-gray-900 font-bold text-xs uppercase">Employment</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <InfoRow label="Franchise" value={form.franchiseId} />
                  <InfoRow label="Designation" value={form.designation || "â€”"} />
                  <InfoRow label="Status" value={form.status} />
                  <InfoRow label="Joining Date" value={form.joiningDate || "â€”"} />
                  <InfoRow label="Salary" value={`PKR ${form.salary.toLocaleString()}`} err={form.salary === 0} />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-gray-900 font-bold text-xs uppercase">Contact & Address</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <InfoRow label="Email" value={form.email || "â€”"} />
                  <InfoRow label="WhatsApp" value={form.whatsapp || "â€”"} />
                  <InfoRow label="Province" value={form.province || "â€”"} />
                  <InfoRow label="City" value={form.city || "â€”"} />
                  <InfoRow label="Area" value={form.area || "â€”"} />
                  <InfoRow label="Address" value={form.address || "â€”"} />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-gray-900 font-bold text-xs uppercase">Targets</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <InfoRow label="Daily New SIM" value={String(form.dailyTargets?.newSIM || 0)} />
                  <InfoRow label="Daily MNP" value={String(form.dailyTargets?.mnp || 0)} />
                  <InfoRow label="Daily Replacement" value={String(form.dailyTargets?.replacement || 0)} />
                  <InfoRow label="Monthly Activations" value={String(form.monthlyTargets?.activations || 0)} />
                  <InfoRow label="Monthly Revenue" value={`PKR ${(form.monthlyTargets?.revenue || 0).toLocaleString()}`} />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-gray-900 font-bold text-xs uppercase">Salary Breakdown</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <InfoRow label="Basic" value={`PKR ${form.salary.toLocaleString()}`} />
                  <InfoRow label="Fuel Allow." value={`PKR ${(form.fuelAllowance || 0).toLocaleString()}`} />
                  <InfoRow label="Mobile Allow." value={`PKR ${(form.mobileAllowance || 0).toLocaleString()}`} />
                  <InfoRow label="Daily Allow." value={`PKR ${(form.dailyAllowance || 0).toLocaleString()}`} />
                  <InfoRow label="Residence Allow." value={`PKR ${(form.residenceAllowance || 0).toLocaleString()}`} />
                  <div className="border-t border-gray-200 pt-2">
                    <InfoRow label="New SIM BVS" value={`PKR ${(form.newSimBvs || 0).toLocaleString()}`} />
                    <InfoRow label="New SIM FCA" value={`PKR ${(form.newSimFca || 0).toLocaleString()}`} />
                    <InfoRow label="New SIM IFCA" value={`PKR ${(form.newSimIfca || 0).toLocaleString()}`} />
                    <InfoRow label="MNP BVS" value={`PKR ${(form.mnpBvs || 0).toLocaleString()}`} />
                    <InfoRow label="MNP FCA" value={`PKR ${(form.mnpFca || 0).toLocaleString()}`} />
                    <InfoRow label="MNP IFCA" value={`PKR ${(form.mnpIfca || 0).toLocaleString()}`} />
                    <InfoRow label="Repl BVS" value={`PKR ${(form.replacementBvs || 0).toLocaleString()}`} />
                    <InfoRow label="Repl FCA" value={`PKR ${(form.replacementFca || 0).toLocaleString()}`} />
                    <InfoRow label="Repl IFCA" value={`PKR ${(form.replacementIfca || 0).toLocaleString()}`} />
                    <InfoRow label="BYN BVS" value={`PKR ${(form.bynBvs || 0).toLocaleString()}`} />
                    <InfoRow label="BYN FCA" value={`PKR ${(form.bynFca || 0).toLocaleString()}`} />
                    <InfoRow label="BYN IFCA" value={`PKR ${(form.bynIfca || 0).toLocaleString()}`} />
                    <InfoRow label="Hike Comm." value={`PKR ${(form.hikeCommission || 0).toLocaleString()}`} />
                    <InfoRow label="Other Comm." value={`PKR ${(form.otherCommission || 0).toLocaleString()}`} />
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <InfoRow label="Target Bonus" value={`PKR ${(form.targetBonus || 0).toLocaleString()}`} />
                    <InfoRow label="Bonus" value={`PKR ${(form.bonus || 0).toLocaleString()}`} />
                  </div>
                  <div className="border-t border-gray-200 pt-2 text-red-600">
                    <InfoRow label="Advance" value={`-PKR ${(form.advanceSalary || 0).toLocaleString()}`} />
                    <InfoRow label="Loan" value={`-PKR ${(form.loanDeduction || 0).toLocaleString()}`} />
                    <InfoRow label="Other Ded." value={`-PKR ${(form.otherDeduction || 0).toLocaleString()}`} />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-gray-900 font-bold text-xs uppercase">Credentials</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <InfoRow label="Username" value={form.username} />
                  <InfoRow label="Password" value={form.password} />
                  <InfoRow label="Retailer ID" value={form.retailerId || "Auto from mobile"} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => { setStep((s) => Math.max(0, s - 1)); setShowErrors(false); }} disabled={step === 0} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <ArrowLeft size={16} /> Previous
        </button>
        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <button onClick={() => { setStep((s) => Math.min(STEPS.length - 1, s + 1)); setShowErrors(false); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saved} className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-md transition-all hover:scale-105 disabled:opacity-60">
              {saved ? <><CheckCircle size={16} /> {isEditMode ? "Updated!" : "Created!"}</> : <><Save size={16} /> {isEditMode ? "Update DSM Account" : "Create DSM Account"}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportingManagerSelect({ dsms, value, onChange }: { dsms: any[]; value: string | undefined; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = dsms.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.id?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = dsms.find((d) => d.id === value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-gray-500 text-xs font-medium mb-1.5">Reporting Manager</label>
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl text-sm transition-all border-gray-200 bg-gray-50 ${open ? "border-[#0A2647]/50 ring-2 ring-[#0A2647]/10" : ""}`}>
        <span className={selected ? "text-gray-900" : "text-gray-400"}>{selected ? `${selected.name} (${selected.id})` : "Select reporting manager..."}</span>
        <Search size={14} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search size={14} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              autoFocus />
            {search && <button onClick={() => setSearch("")}><XIcon size={14} className="text-gray-400 hover:text-gray-600" /></button>}
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-gray-400 text-sm">{dsms.length === 0 ? "No DSMs available" : "No DSMs match your search"}</div>
            ) : (
              filtered.map((d) => (
                <button key={d.id} type="button" onClick={() => { onChange(d.id); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${d.id === value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}>
                  <span>{d.name} <span className="text-gray-400 font-mono text-xs">({d.id})</span></span>
                  {d.id === value && <CheckCircle size={14} className="text-blue-600" />}
                </button>
              ))
            )}
          </div>
          {value && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-red-500 border-t border-gray-100 transition-colors">
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, err }: { label: string; value: string; err?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${err ? "text-red-600" : "text-gray-900"}`}>{value}{err ? " âš " : ""}</span>
    </div>
  );
}
