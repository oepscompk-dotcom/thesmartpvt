"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { User, Save, Lock, Mail, Phone, Building2, MapPin, CheckCircle2, CreditCard, Calendar, Package, MapPinned, Hash } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { useData } from "@/lib/DataContext";

export default function ProfilePage() {
  const { settings, auth, updateSettings } = useFranchiseData();
  const { franchises } = useData();
  const [form, setForm] = useState({
    franchiseName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  const franchise = franchises.find((f) => f.id === auth.franchiseId);

  useEffect(() => {
    setForm({
      franchiseName: franchise?.name || settings.franchiseName || "",
      ownerName: franchise?.owner || settings.ownerName || "",
      email: franchise?.email || settings.email || "",
      phone: franchise?.mobile || settings.phone || "",
      address: `${franchise?.city || ""}${franchise?.city && franchise?.province ? ", " : ""}${franchise?.province || ""}` || settings.address || "",
    });
    setMounted(true);
  }, [franchise, settings]);

  const handleSave = () => {
    updateSettings({
      ...settings,
      franchiseName: form.franchiseName,
      ownerName: form.ownerName,
      email: form.email,
      phone: form.phone,
      address: form.address,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = () => {
    if (passwords.newPass !== passwords.confirm) return;
    setPwSaved(true);
    setPasswords({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2000);
  };

  if (!mounted) return null;

  const fmtDate = (d: string) => {
    if (!d) return "\u2014";
    const [y, m, day] = d.split("-");
    return `${day}-${m}-${y}`;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your franchise profile and account settings</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0A2647] to-[#144272] flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {(form.ownerName || form.franchiseName || "F").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-lg">{form.ownerName || "Franchise Owner"}</h3>
            <p className="text-gray-500 text-sm">{form.franchiseName || "Franchise Name"}</p>
            <p className="text-[#C8A951] text-xs font-semibold">{auth.franchiseId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><Hash size={14} /><span className="text-xs font-medium uppercase">Franchise ID</span></div>
            <p className="text-gray-900 font-mono font-bold">{franchise?.id || auth.franchiseId}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><Building2 size={14} /><span className="text-xs font-medium uppercase">Franchise Name</span></div>
            <p className="text-gray-900 font-medium">{franchise?.name || "\u2014"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><User size={14} /><span className="text-xs font-medium uppercase">Owner Name</span></div>
            <p className="text-gray-900 font-medium">{franchise?.owner || "\u2014"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><CreditCard size={14} /><span className="text-xs font-medium uppercase">CNIC</span></div>
            <p className="text-gray-900 font-mono">{franchise?.cnic || "\u2014"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><Phone size={14} /><span className="text-xs font-medium uppercase">Mobile</span></div>
            <p className="text-gray-900">{franchise?.mobile || "\u2014"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><Mail size={14} /><span className="text-xs font-medium uppercase">Email</span></div>
            <p className="text-gray-900">{franchise?.email || "\u2014"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><MapPinned size={14} /><span className="text-xs font-medium uppercase">Province</span></div>
            <p className="text-gray-900">{franchise?.province || "\u2014"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><MapPin size={14} /><span className="text-xs font-medium uppercase">City</span></div>
            <p className="text-gray-900">{franchise?.city || "\u2014"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><Package size={14} /><span className="text-xs font-medium uppercase">Package</span></div>
            <p className="text-gray-900 font-medium">{franchise?.package || "\u2014"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><CheckCircle2 size={14} /><span className="text-xs font-medium uppercase">Status</span></div>
            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${franchise?.status === "Active" ? "bg-green-100 text-green-700" : franchise?.status === "Suspended" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{franchise?.status || "\u2014"}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><Calendar size={14} /><span className="text-xs font-medium uppercase">Agreement Start</span></div>
            <p className="text-gray-900">{fmtDate(franchise?.agreementStart || "")}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-1"><Calendar size={14} /><span className="text-xs font-medium uppercase">Agreement End</span></div>
            <p className="text-gray-900">{fmtDate(franchise?.agreementEnd || "")}</p>
          </div>
        </div>

        <h4 className="text-gray-900 font-bold text-sm mb-3 uppercase tracking-wide">Edit Profile</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Franchise Name</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#0A2647]/50 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
              <Building2 size={16} className="text-gray-400" />
              <input type="text" value={form.franchiseName} onChange={(e) => setForm((p) => ({ ...p, franchiseName: e.target.value }))}
                placeholder="Enter franchise name"
                className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Full Name (Owner)</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#0A2647]/50 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
              <User size={16} className="text-gray-400" />
              <input type="text" value={form.ownerName} onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
                placeholder="Enter your full name"
                className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Email</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#0A2647]/50 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
              <Mail size={16} className="text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Enter email address"
                className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Phone</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#0A2647]/50 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
              <Phone size={16} className="text-gray-400" />
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Enter phone number"
                className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Address</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#0A2647]/50 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
              <MapPin size={16} className="text-gray-400" />
              <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Enter address"
                className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Franchise ID</label>
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5">
              <Building2 size={16} className="text-gray-400" />
              <span className="text-gray-500 text-sm font-mono">{auth.franchiseId}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSave}
            className="px-6 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105 inline-flex items-center gap-2">
            {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Lock size={18} /> Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Current Password</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">New Password</label>
            <input type="password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Confirm Password</label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
            <p className="text-red-500 text-xs">Passwords do not match</p>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={handlePasswordChange}
            disabled={!passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm}
            className="px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105 inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {pwSaved ? <><CheckCircle2 size={14} /> Updated!</> : <><Lock size={14} /> Update Password</>}
          </button>
        </div>
      </div>
    </div>
  );
}
