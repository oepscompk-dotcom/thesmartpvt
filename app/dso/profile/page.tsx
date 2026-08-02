"use client";

import { useState } from "react";
import { User, Save, Lock, Mail, Phone, Building2, Smartphone, Hash, ArrowLeft, LogOut } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";

export default function DSOProfilePage() {
  const { settings, auth, device } = useDSOData();
  const [form, setForm] = useState({
    name: settings.dsoName || auth.dsoName,
    email: "usman.ali@thesmart.com",
    phone: "0321-1234567",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = () => {
    if (passwords.newPass !== passwords.confirm) return;
    setPwSaved(true);
    setPasswords({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <a href="/dso/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={22} className="text-gray-700" />
        </a>
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account and device</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0A2647] to-[#144272] flex items-center justify-center text-white text-3xl font-black shadow-lg">
            <User size={48} />
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-lg">{form.name}</h3>
            <p className="text-gray-500 text-sm">{form.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 mb-6">
          <div className="text-center flex-1">
            <p className="text-[#0A2647] font-bold text-lg">42</p>
            <p className="text-gray-400 text-xs">Activations</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[#0A2647] font-bold text-lg">95%</p>
            <p className="text-gray-400 text-xs">Attendance</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[#0A2647] font-bold text-lg">125K</p>
            <p className="text-gray-400 text-xs">Wallet</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Full Name</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] focus-within:border-[#0A2647]/50 focus-within:ring-2 focus-within:ring-[#0A2647]/10">
              <User size={16} className="text-gray-400" />
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Email</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] focus-within:border-[#0A2647]/50 focus-within:ring-2 focus-within:ring-[#0A2647]/10">
              <Mail size={16} className="text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Phone</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] focus-within:border-[#0A2647]/50 focus-within:ring-2 focus-within:ring-[#0A2647]/10">
              <Phone size={16} className="text-gray-400" />
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="bg-transparent text-gray-900 text-sm focus:outline-none w-full" />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Franchise</label>
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px]">
              <Building2 size={16} className="text-gray-400" />
              <span className="text-gray-500 text-sm">{settings.franchiseName} ({auth.franchiseId})</span>
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">DSO ID</label>
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px]">
              <Hash size={16} className="text-gray-400" />
              <span className="text-gray-500 text-sm font-mono">{auth.dsoId}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleSave} className="w-full sm:w-auto min-h-[56px] px-5 py-3 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105 inline-flex items-center justify-center gap-2">
            <Save size={14} /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Lock size={18} /> Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Current Password</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} className="w-full px-4 py-3 min-h-[48px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">New Password</label>
            <input type="password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))} className="w-full px-4 py-3 min-h-[48px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium mb-1.5">Confirm Password</label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} className="w-full px-4 py-3 min-h-[48px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && <p className="text-red-500 text-xs">Passwords do not match</p>}
        </div>
        <div className="mt-4">
          <button onClick={handlePasswordChange} disabled={!passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm} className="w-full sm:w-auto min-h-[56px] px-5 py-3 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <Lock size={14} /> {pwSaved ? "Updated!" : "Update Password"}
          </button>
        </div>
      </div>

      {device && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Smartphone size={18} /> Assigned Device</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Brand / Model</p>
              <p className="text-gray-900 font-bold text-sm">{device.brand} {device.model}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">IMEI</p>
              <p className="text-gray-900 font-bold text-sm font-mono">{device.imei}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">BVS Number</p>
              <p className="text-gray-900 font-bold text-sm font-mono">{device.bvsNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Device ID</p>
              <p className="text-gray-900 font-bold text-sm font-mono">{device.id}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Retailer ID</p>
              <p className="text-gray-900 font-bold text-sm font-mono">{device.retailerId}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${device.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                <span className={`w-2 h-2 rounded-full ${device.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                {device.status}
              </span>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => {}} className="w-full min-h-[56px] px-5 py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 shadow-md transition-all inline-flex items-center justify-center gap-2">
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
