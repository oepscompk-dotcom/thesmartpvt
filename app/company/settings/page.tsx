"use client";

import { useState, useEffect } from "react";
import { useCompanyData } from "@/lib/CompanyDataContext";
import { Building2, User, Mail, Phone, MapPin, Lock, Save, RefreshCw, Image, Camera } from "lucide-react";
import { apiLoad, apiSave } from "@/lib/api";
import { uploadFile, deleteRemoteFile } from "@/lib/r2Client";

export default function CompanySettingsPage() {
  const { auth } = useCompanyData();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const emptyProfile = {
    companyName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    logo: "",
  };

  const [profile, setProfile] = useState(emptyProfile);

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (auth.companyId) {
      (async () => {
        try {
          const companies = await apiLoad("company");
          const company = (companies || []).find((c: any) => c.id === auth.companyId);
          if (company) {
            setProfile({
              companyName: company.name,
              ownerName: company.owner,
              email: company.email,
              phone: company.mobile,
              address: company.address,
              city: company.city,
              province: company.province,
              logo: company.logo || "",
            });
          }
        } catch {}
      })();
    }
  }, [auth.companyId]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await apiSave("company", {
        id: auth.companyId,
        name: profile.companyName,
        owner: profile.ownerName,
        email: profile.email,
        mobile: profile.phone,
        address: profile.address,
        city: profile.city,
        province: profile.province,
        logo: profile.logo,
      });
    } catch {}
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSecuritySave = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (security.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    alert("Password updated successfully (demo)");
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let p = "COMP@";
    for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setSecurity((prev) => ({ ...prev, newPassword: p, confirmPassword: p }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }
    const url = await uploadFile(file, "logos");
    if (!url) return;
    await deleteRemoteFile(profile.logo);
    setProfile((prev) => ({ ...prev, logo: url }));
    e.target.value = "";
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <Building2 size={16} /> },
    { id: "security", label: "Security", icon: <Lock size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Mail size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Company Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your company profile, security, and preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex gap-1 px-2" aria-label="Settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900 font-bold text-lg">Company Profile</h2>
                {saved && <span className="text-green-600 text-sm font-medium flex items-center gap-1">✓ Changes saved</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Owner Name *</label>
                  <input
                    type="text"
                    value={profile.ownerName}
                    onChange={(e) => setProfile((prev) => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Phone *</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">City *</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Province *</label>
                  <input
                    type="text"
                    value={profile.province}
                    onChange={(e) => setProfile((prev) => ({ ...prev, province: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profile.logo ? (
                      <img src={profile.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover shadow-lg" />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xl">{profile.companyName?.charAt(0) || "C"}</span>
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                      <button type="button" className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors">
                        <Camera size={16} />
                      </button>
                    </label>
                  </div>
                  <div className="text-sm text-gray-500">Click to upload a new logo (PNG, JPG, max 5MB)</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={generatePassword} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all inline-flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> Generate Password
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900 font-bold text-lg">Security Settings</h2>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-600 text-sm">Your company ID: <span className="font-mono font-bold text-gray-900 ml-2">{auth.companyId}</span></p>
                <p className="text-gray-500 text-xs mt-1">Keep this secure. Use Company ID + Password to login.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={handleSecuritySave} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">
                  Update Password
                </button>
                <button onClick={generatePassword} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all inline-flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> Generate
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900 font-bold text-lg">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Franchise Status Changes", desc: "Get notified when franchise status changes", enabled: true },
                  { label: "Low Inventory Alerts", desc: "Alert when SIM/device inventory is low", enabled: true },
                  { label: "Payment Due Reminders", desc: "Reminders for upcoming payment deadlines", enabled: false },
                  { label: "Monthly Reports", desc: "Receive monthly performance reports", enabled: true },
                  { label: "System Maintenance", desc: "Notifications about scheduled maintenance", enabled: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{item.label}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}