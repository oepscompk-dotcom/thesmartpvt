"use client";

import { useState, useEffect } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { User, Mail, Phone, Lock, Save, Smartphone, Building, Shield, ArrowLeft, LogOut } from "lucide-react";
import { apiLoadById, apiSave } from "@/lib/api";

async function loadProfileApi<T>(model: string, id: string, defaultVal: T): Promise<T> {
  try {
    const result = await apiLoadById(model, id);
    if (result?.data) return JSON.parse(result.data);
  } catch {}
  return defaultVal;
}

export default function ProfilePage() {
  const { auth, updateProfile, dsmLogout } = useDSMData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    setName(auth.dsmName);
    loadProfileApi<{ email?: string; phone?: string }>("franchiseData", "dsm-profile", {}).then((profile) => {
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    });
  }, [auth.dsmName]);

  const handleSaveProfile = () => {
    updateProfile({ dsmName: name, email, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) return;
    const passwords = await loadProfileApi<{ current?: string }>("franchiseData", "dsm-passwords", {});
    passwords.current = newPassword;
    try { await apiSave("franchiseData", { id: "dsm-passwords", data: JSON.stringify(passwords) }); } catch {}
    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057FF]/20 focus:border-[#0057FF]";
  const labelClass = "text-sm font-medium text-gray-700 mb-2 block";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/dsm/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft size={22} className="text-gray-700" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
            <p className="text-gray-500 text-sm">Manage your account settings</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0057FF] to-[#0047CC] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {auth.dsmName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{auth.dsmName}</h2>
              <p className="text-sm text-gray-500">DSM ID: {auth.dsmId}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Building size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">Franchise: {auth.franchiseId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
            <div className="text-center flex-1">
              <p className="text-[#0057FF] font-bold text-lg">18</p>
              <p className="text-gray-400 text-xs">Team Size</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-[#0057FF] font-bold text-lg">256</p>
              <p className="text-gray-400 text-xs">Total Sales</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center flex-1">
              <p className="text-[#0057FF] font-bold text-lg">890K</p>
              <p className="text-gray-400 text-xs">Revenue</p>
            </div>
          </div>

          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 mt-6">
            <User size={18} className="text-[#0057FF]" />
            Personal Information
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className={labelClass}>Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-11`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className={`${inputClass} pl-11`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone" className={`${inputClass} pl-11`} />
              </div>
            </div>
          </div>

          <button onClick={handleSaveProfile} className="w-full sm:w-auto min-h-[56px] bg-[#0057FF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0047CC] flex items-center justify-center gap-2">
            <Save size={18} />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock size={18} className="text-[#0057FF]" />
            Change Password
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className={`${inputClass} pl-11`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className={`${inputClass} pl-11`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={`${inputClass} pl-11`} />
              </div>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
            className="w-full sm:w-auto min-h-[56px] bg-[#0057FF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0047CC] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield size={18} />
            {passwordSaved ? "Password Updated!" : "Update Password"}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-[#0057FF]" />
            Device Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Platform</p>
              <p className="text-sm font-medium text-gray-700">The Smart ERP</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Role</p>
              <p className="text-sm font-medium text-gray-700">DSM</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Franchise ID</p>
              <p className="text-sm font-medium text-gray-700">{auth.franchiseId}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">DSM ID</p>
              <p className="text-sm font-medium text-gray-700">{auth.dsmId}</p>
            </div>
          </div>
        </div>

        <button onClick={dsmLogout} className="w-full min-h-[56px] px-5 py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 shadow-md transition-all inline-flex items-center justify-center gap-2 mt-6">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
