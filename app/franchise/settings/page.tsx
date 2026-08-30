"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Building2, Upload, Timer, AlertTriangle, Landmark, Wallet, Smartphone, Plus, Trash2, Check } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { apiLoadById, apiSave } from "@/lib/api";
import { uploadFile, deleteRemoteFile } from "@/lib/r2Client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const PAKISTAN_BANKS = [
  "Abhi Microfinance Bank", "Al Baraka Bank Pakistan", "Allied Bank Limited (ABL)", "APNA Microfinance Bank",
  "ASA Microfinance Bank", "Askari Bank", "Bank Al Habib", "Bank Alfalah", "BankIslami Pakistan",
  "Bank Makramah Limited", "Bank of China Pakistan", "Bank of Khyber", "Citi Bank Pakistan",
  "Dubai Islamic Bank Pakistan", "Easypaisa", "Easypaisa Digital Bank", "Faysal Bank", "FINCA Microfinance Bank",
  "Finja", "First Women Bank", "Habib Bank Limited (HBL)", "Habib Metropolitan Bank",
  "Industrial and Commercial Bank of China (ICBC) Pakistan", "JS Bank", "JazzCash", "Khushhali Microfinance Bank",
  "MCB Bank", "MCB Islamic Bank", "Meezan Bank", "Mobilink Bank", "National Bank of Pakistan (NBP)",
  "NayaPay", "NRSP Microfinance Bank", "OPay", "Raqami Islamic Digital Bank", "SadaPay", "Sindh Bank",
  "Soneri Bank", "Standard Chartered Bank Pakistan", "The Bank of Punjab (BOP)", "United Bank Limited (UBL)",
  "U Microfinance Bank", "Zarai Taraqiati Bank Limited (ZTBL)", "Zindigi",
];

const defaultAttendanceSettings = {
  workStart: "09:00", workEnd: "18:00", lateAfter: "10:00",
  requiredHours: 8, finePerDay: 1000, bonusPerSale: 500,
};

export default function FranchiseSettingsPage() {
  const { settings, updateSettings, auth } = useFranchiseData();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [attSettings, setAttSettings] = useState(defaultAttendanceSettings);
  const [tab, setTab] = useState<"general" | "bank">("general");

  useEffect(() => {
    (async () => {
      try {
        const s = await apiLoadById("franchiseData", "attendance-settings-" + auth.franchiseId);
        if (s?.data) setAttSettings(JSON.parse(s.data));
      } catch {}
    })();
  }, [auth?.franchiseId]);

  const handleSave = async () => {
    updateSettings(form);
    try {
      await apiSave("franchiseData", { id: "attendance-settings-" + auth.franchiseId, data: JSON.stringify(attSettings) });
    } catch {}
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const bankAccounts = (form.bankAccounts && form.bankAccounts.length > 0)
    ? form.bankAccounts
    : (form.bankName || form.bankAccountTitle || form.bankAccountNumber
        ? [{ id: "ACC-1", name: form.bankName || "", accountTitle: form.bankAccountTitle || "", accountNumber: form.bankAccountNumber || "" }]
        : []);

  const setBankAccounts = (list: { id: string; name: string; accountTitle: string; accountNumber: string }[]) => {
    setForm((p) => ({ ...p, bankAccounts: list }));
  };

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { id: `ACC-${Date.now()}`, name: "", accountTitle: "", accountNumber: "" }]);
  };

  const updateBankAccount = (id: string, field: "name" | "accountTitle" | "accountNumber", value: string) => {
    setBankAccounts(bankAccounts.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter((a) => a.id !== id));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }
    const url = await uploadFile(file, "logos");
    if (!url) return;
    await deleteRemoteFile(form.logo);
    setForm((p) => ({ ...p, logo: url }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Settings" }]}
        title="Settings"
        description="Franchise settings and preferences"
      />

      <div className="flex gap-2">
        <button onClick={() => setTab("general")}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${tab === "general" ? "bg-brand-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
          <SettingsIcon size={14} /> General
        </button>
        <button onClick={() => setTab("bank")}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${tab === "bank" ? "bg-brand-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
          <Landmark size={14} /> Company Bank / Digital
        </button>
      </div>

      {tab === "general" && (
      <>
      <Card>
        <CardHeader className="p-6 pb-4">
          <CardTitle>Franchise Logo</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-100">
              {form.logo ? <img src={form.logo} alt="Logo" className="h-full w-full object-contain" /> : <Upload size={24} className="text-slate-400" />}
            </div>
            <div>
              <label className="mb-1 inline-block cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">Change Logo</label>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG (max 5MB)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Building2 size={18} /></div><CardTitle>Franchise Information</CardTitle></div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "franchiseName", label: "Franchise Name" },
              { key: "address", label: "Address" },
              { key: "phone", label: "Phone" },
              { key: "email", label: "Email" },
            ].map(({ key, label }) => (
              <div key={key}><label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label><Input value={(form as any)[key] || ""} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} /></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600"><Timer size={18} /></div><CardTitle>Attendance Settings</CardTitle></div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <p className="mb-4 text-xs text-muted-foreground">Configure work hours, late timing, fine and bonus amounts for DSO/DSM</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Work Start Time</label><Input type="time" value={attSettings.workStart} onChange={(e) => setAttSettings((p) => ({ ...p, workStart: e.target.value }))} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Work End Time</label><Input type="time" value={attSettings.workEnd} onChange={(e) => setAttSettings((p) => ({ ...p, workEnd: e.target.value }))} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Late After (time)</label><Input type="time" value={attSettings.lateAfter} onChange={(e) => setAttSettings((p) => ({ ...p, lateAfter: e.target.value }))} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Required Hours/Day</label><Input type="number" value={attSettings.requiredHours} onChange={(e) => setAttSettings((p) => ({ ...p, requiredHours: Number(e.target.value) }))} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Fine Per Day (PKR)</label><Input type="number" value={attSettings.finePerDay} onChange={(e) => setAttSettings((p) => ({ ...p, finePerDay: Number(e.target.value) }))} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bonus Per Sale (PKR)</label><Input type="number" value={attSettings.bonusPerSale} onChange={(e) => setAttSettings((p) => ({ ...p, bonusPerSale: Number(e.target.value) }))} /></div>
          </div>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-amber-700"><AlertTriangle size={14} /> Rules: After 10 AM = Late | Below {attSettings.requiredHours}h = Fine PKR {attSettings.finePerDay.toLocaleString()}/day | {attSettings.requiredHours}h+ with sales = Bonus PKR {attSettings.bonusPerSale.toLocaleString()} | 3 consecutive absents = Warning + fine</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-6 pb-4">
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-2">
          <div className="space-y-3">
            {["Email Notifications", "SMS Notifications", "WhatsApp Notifications"].map((pref) => (
              <div key={pref} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{pref}</span>
                <div className="relative h-6 w-10 cursor-pointer rounded-full bg-brand-600"><div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-all" /></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </>
      )}

      {tab === "bank" && (
        <Card>
          <CardHeader className="p-6 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Landmark size={18} /></div><div><CardTitle>Company Bank / Digital Account</CardTitle><p className="mt-0.5 text-xs text-muted-foreground">{bankAccounts.length} account(s) configured</p></div></div>
              <Button variant="primary" size="sm" onClick={addBankAccount}><Plus size={14} /> Add Account</Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="mb-4 text-xs text-muted-foreground">Company payment account details shared with DSO/DSM for loan/advance repayments and settlements.</p>
            <div className="space-y-4">
              {bankAccounts.map((acc, idx) => (
                <div key={acc.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-xs font-black text-emerald-600">{idx + 1}</span> Account {idx + 1}</span>
                    {bankAccounts.length > 1 && (
                      <button onClick={() => removeBankAccount(acc.id)} className="p-1 text-red-400 hover:text-red-600" title="Remove account"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bank / Digital Name</label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5">
                        <Wallet size={16} className="text-muted-foreground" />
                        <select value={acc.name} onChange={(e) => updateBankAccount(acc.id, "name", e.target.value)}
                          className="w-full cursor-pointer appearance-none bg-transparent pl-1 text-sm text-slate-900 outline-none">
                          <option value="">Select Bank / Digital</option>
                          {PAKISTAN_BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Account Title</label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5">
                        <Building2 size={16} className="text-muted-foreground" />
                        <input type="text" value={acc.accountTitle} onChange={(e) => updateBankAccount(acc.id, "accountTitle", e.target.value)} placeholder="e.g. THE SMART PVT LTD"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Account Number / IBAN</label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5">
                        <Smartphone size={16} className="text-muted-foreground" />
                        <input type="text" value={acc.accountNumber} onChange={(e) => updateBankAccount(acc.id, "accountNumber", e.target.value)} placeholder="e.g. 1234-5678900-01 or 0300-1234567"
                          className="w-full bg-transparent text-sm text-slate-900 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {bankAccounts.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                  <Landmark size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-muted-foreground">No accounts yet. Click <b>Add Account</b> to configure company bank/digital payment accounts.</p>
                </div>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="flex items-center gap-2 text-xs font-medium text-emerald-700"><AlertTriangle size={14} /> These account details will be shown to DSO/DSM staff for loan/advance repayment submissions.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </Button>
      </div>
    </div>
  );
}

