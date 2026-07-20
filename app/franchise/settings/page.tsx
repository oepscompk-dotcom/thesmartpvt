"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Building2, Upload, Clock, Timer, AlertTriangle, Award } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { apiLoadById, apiSave } from "@/lib/api";

const defaultAttendanceSettings = {
  workStart: "09:00", workEnd: "18:00", lateAfter: "10:00",
  requiredHours: 8, finePerDay: 1000, bonusPerSale: 500,
};

export default function FranchiseSettingsPage() {
  const { settings, updateSettings, auth } = useFranchiseData();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [attSettings, setAttSettings] = useState(defaultAttendanceSettings);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setForm((p) => ({ ...p, logo: ev.target?.result as string })); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Franchise settings and preferences</p>
      </div>

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
