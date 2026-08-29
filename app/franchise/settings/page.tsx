"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Building2, Upload, Clock, Timer, AlertTriangle, Award, Landmark, Wallet, Smartphone, Plus, Trash2 } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { apiLoadById, apiSave } from "@/lib/api";
import { uploadFile, deleteRemoteFile } from "@/lib/r2Client";

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
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Franchise settings and preferences</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("general")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "general" ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          <SettingsIcon size={14} /> General
        </button>
        <button onClick={() => setTab("bank")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "bank" ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          <Landmark size={14} /> Company Bank / Digital
        </button>
      </div>

      {tab === "general" && (
      <>
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Franchise Logo</h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {form.logo ? <img src={form.logo} alt="Logo" className="w-full h-full object-contain" /> : <Upload size={24} className="text-gray-400" />}
          </div>
          <div>
            <label className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 cursor-pointer inline-block mb-1">Change Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <p className="text-gray-400 text-xs">SVG, PNG, JPG (max 5MB)</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Building2 size={18} /></div><h3 className="text-gray-900 font-bold">Franchise Information</h3></div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: "franchiseName", label: "Franchise Name" },
            { key: "address", label: "Address" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
          ].map(({ key, label }) => (
            <div key={key}><label className="block text-gray-500 text-xs font-medium mb-1.5">{label}</label><input type="text" value={(form as any)[key] || ""} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600"><Timer size={18} /></div><h3 className="text-gray-900 font-bold">Attendance Settings</h3></div>
        <p className="text-gray-500 text-xs mb-4">Configure work hours, late timing, fine and bonus amounts for DSO/DSM</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Work Start Time</label><input type="time" value={attSettings.workStart} onChange={(e) => setAttSettings((p) => ({ ...p, workStart: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Work End Time</label><input type="time" value={attSettings.workEnd} onChange={(e) => setAttSettings((p) => ({ ...p, workEnd: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Late After (time)</label><input type="time" value={attSettings.lateAfter} onChange={(e) => setAttSettings((p) => ({ ...p, lateAfter: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Required Hours/Day</label><input type="number" value={attSettings.requiredHours} onChange={(e) => setAttSettings((p) => ({ ...p, requiredHours: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Fine Per Day (PKR)</label><input type="number" value={attSettings.finePerDay} onChange={(e) => setAttSettings((p) => ({ ...p, finePerDay: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
          <div><label className="block text-gray-500 text-xs font-medium mb-1.5">Bonus Per Sale (PKR)</label><input type="number" value={attSettings.bonusPerSale} onChange={(e) => setAttSettings((p) => ({ ...p, bonusPerSale: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" /></div>
        </div>
        <div className="mt-4 bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-amber-700 text-xs font-medium flex items-center gap-2"><AlertTriangle size={14} /> Rules: After 10 AM = Late | Below {attSettings.requiredHours}h = Fine PKR {attSettings.finePerDay.toLocaleString()}/day | {attSettings.requiredHours}h+ with sales = Bonus PKR {attSettings.bonusPerSale.toLocaleString()} | 3 consecutive absents = Warning + fine</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {["Email Notifications", "SMS Notifications", "WhatsApp Notifications"].map((pref) => (
            <div key={pref} className="flex items-center justify-between py-2">
              <span className="text-gray-700 text-sm">{pref}</span>
              <div className="w-10 h-6 bg-[#0A2647] rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" /></div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {tab === "bank" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Landmark size={18} /></div><div><h3 className="text-gray-900 font-bold">Company Bank / Digital Account</h3><p className="text-gray-400 text-xs mt-0.5">{bankAccounts.length} account(s) configured</p></div></div>
            <button onClick={addBankAccount} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all"><Plus size={14} /> Add Account</button>
          </div>
          <p className="text-gray-500 text-xs mb-4">Company payment account details shared with DSO/DSM for loan/advance repayments and settlements.</p>
          <div className="space-y-4">
            {bankAccounts.map((acc, idx) => (
              <div key={acc.id} className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-900 text-sm font-bold flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">{idx + 1}</span> Account {idx + 1}</span>
                  {bankAccounts.length > 1 && (
                    <button onClick={() => removeBankAccount(acc.id)} className="text-red-400 hover:text-red-600 p-1" title="Remove account"><Trash2 size={16} /></button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Bank / Digital Name</label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                      <Wallet size={16} className="text-gray-400" />
                      <select value={acc.name} onChange={(e) => updateBankAccount(acc.id, "name", e.target.value)}
                        className="bg-transparent text-gray-900 text-sm focus:outline-none w-full appearance-none cursor-pointer pl-1">
                        <option value="">Select Bank / Digital</option>
                        {PAKISTAN_BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Account Title</label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                      <Building2 size={16} className="text-gray-400" />
                      <input type="text" value={acc.accountTitle} onChange={(e) => updateBankAccount(acc.id, "accountTitle", e.target.value)} placeholder="e.g. THE SMART PVT LTD"
                        className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Account Number / IBAN</label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                      <Smartphone size={16} className="text-gray-400" />
                      <input type="text" value={acc.accountNumber} onChange={(e) => updateBankAccount(acc.id, "accountNumber", e.target.value)} placeholder="e.g. 1234-5678900-01 or 0300-1234567"
                        className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {bankAccounts.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <Landmark size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No accounts yet. Click <b>Add Account</b> to configure company bank/digital payment accounts.</p>
              </div>
            )}
          </div>
          <div className="mt-4 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
            <p className="text-emerald-700 text-xs font-medium flex items-center gap-2"><AlertTriangle size={14} /> These account details will be shown to DSO/DSM staff for loan/advance repayment submissions.</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} className="px-6 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105 inline-flex items-center gap-2">
          {saved ? <><CheckSvg size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}

function CheckSvg({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>;
}
