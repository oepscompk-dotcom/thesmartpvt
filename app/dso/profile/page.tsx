"use client";

import { useState } from "react";
import { User, Save, Lock, Mail, Phone, Building2, Smartphone, Hash, LogOut, TrendingUp, CheckCircle2, Wallet } from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";

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
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "My Profile" }]}
        title="My Profile"
        description="Manage your account and device"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Activations" value="42" icon={TrendingUp} iconClass="text-brand-600 bg-brand-50" />
        <StatCard label="Attendance" value="95%" icon={CheckCircle2} iconClass="text-green-600 bg-green-50" />
        <StatCard label="Wallet" value="PKR 125K" icon={Wallet} iconClass="text-amber-600 bg-amber-50" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-lg">
              <User size={48} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{form.name}</h3>
              <p className="text-sm text-muted-foreground">{form.email}</p>
            </div>
          </div>
        </CardContent>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="pl-9" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="pl-9" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="pl-9" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Franchise</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input readOnly value={`${settings.franchiseName} (${auth.franchiseId})`} className="pl-9 bg-slate-50" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">DSO ID</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input readOnly value={auth.dsoId} className="pl-9 bg-slate-50 font-mono" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSave}>
              <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2"><Lock size={18} /> Change Password</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Current Password</label>
            <Input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">New Password</label>
            <Input type="password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Confirm Password</label>
            <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
          </div>
          {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && <p className="text-xs text-red-600">Passwords do not match</p>}
          <div>
            <Button onClick={handlePasswordChange} disabled={!passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm}>
              <Lock size={14} /> {pwSaved ? "Updated!" : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {device && (
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2"><Smartphone size={18} /> Assigned Device</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Brand / Model</p>
                <p className="text-sm font-bold text-foreground">{device.brand} {device.model}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">IMEI</p>
                <p className="text-sm font-bold text-foreground font-mono">{device.imei}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">BVS Number</p>
                <p className="text-sm font-bold text-foreground font-mono">{device.bvsNumber}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Device ID</p>
                <p className="text-sm font-bold text-foreground font-mono">{device.id}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Retailer ID</p>
                <p className="text-sm font-bold text-foreground font-mono">{device.retailerId}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Status</p>
                <StatusPill label={device.status} tone={toneForStatus(device.status)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="destructive" className="w-full" onClick={() => {}}>
        <LogOut size={16} /> Logout
      </Button>
    </div>
  );
}
