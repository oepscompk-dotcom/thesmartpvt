"use client";

import { useState, useEffect } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { User, Mail, Phone, Lock, Save, Smartphone, Building, Shield, ArrowLeft, LogOut } from "lucide-react";
import { apiLoadById, apiSave } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

async function loadProfileApi<T>(model: string, id: string, defaultVal: T): Promise<T> {
  try {
    const result = await apiLoadById(model, id);
    if (result) return result as T;
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <a href="/dsm/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-slate-200 transition-colors">
          <ArrowLeft size={22} className="text-foreground" />
        </a>
        <PageHeader
          title="My Profile"
          description="Manage your account settings"
        />
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
            <div className="h-24 w-24 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {auth.dsmName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{auth.dsmName}</h2>
              <p className="text-sm text-muted-foreground">DSM ID: {auth.dsmId}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Building size={14} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Franchise: {auth.franchiseId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3">
            <div className="text-center flex-1">
              <p className="text-brand-600 font-bold text-lg">18</p>
              <p className="text-muted-foreground text-xs">Team Size</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center flex-1">
              <p className="text-brand-600 font-bold text-lg">256</p>
              <p className="text-muted-foreground text-xs">Total Sales</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center flex-1">
              <p className="text-brand-600 font-bold text-lg">890K</p>
              <p className="text-muted-foreground text-xs">Revenue</p>
            </div>
          </div>
        </CardContent>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <User size={18} className="text-brand-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className="pl-10" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone" className="pl-10" />
            </div>
          </div>
        </CardContent>
        <CardContent>
          <Button onClick={handleSaveProfile}>
            <Save size={18} />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={18} className="text-brand-600" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="pl-10" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="pl-10" />
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="pl-10" />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
            <Shield size={18} />
            {passwordSaved ? "Password Updated!" : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone size={18} className="text-brand-600" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-1 text-xs text-muted-foreground">Platform</p>
              <p className="text-sm font-medium text-foreground">The Smart ERP</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-1 text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium text-foreground">DSM</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-1 text-xs text-muted-foreground">Franchise ID</p>
              <p className="text-sm font-medium text-foreground">{auth.franchiseId}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-1 text-xs text-muted-foreground">DSM ID</p>
              <p className="text-sm font-medium text-foreground">{auth.dsmId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={dsmLogout}>
        <LogOut size={16} /> Logout
      </Button>
    </div>
  );
}
