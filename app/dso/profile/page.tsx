"use client";

import Link from "next/link";
import {
  User, Save, Lock, Mail, Phone, Building2, Smartphone, Hash, LogOut,
  CheckCircle2, Wallet, Activity, Target, CalendarCheck, Bell, BarChart3,
  ChevronRight, Zap, ShieldCheck,
} from "lucide-react";
import { useDSOData } from "@/lib/DSODataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";
import { ProfileCover, StatTile, InfoTile, SectionCard } from "@/components/profile/ProfileBits";

export default function DSOProfilePage() {
  const { settings, auth, device, activations, attendance, wallet, targets, notifications, dsoLogout } = useDSOData();
  const [form, setForm] = useState({
    name: settings.dsoName || auth.dsoName || "",
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

  const totalActivations = activations.length;
  const completed = activations.filter((a) => a.status === "Completed").length;
  const presentDays = attendance.filter((a) => a.status !== "Absent").length;
  const attendancePct = attendance.length
    ? Math.round((presentDays / attendance.length) * 100)
    : 0;
  const walletBalance = wallet.length ? wallet[wallet.length - 1].balance : 0;

  const t = targets;
  const targetTotal = t.newSIM + t.mnp + t.replacement + t.byn;
  const targetDone = t.newSIMAchieved + t.mnpAchieved + t.replacementAchieved + t.bynAchieved;
  const targetPct = targetTotal ? Math.min(100, Math.round((targetDone / targetTotal) * 100)) : 0;

  const recentWallet = wallet.slice(-4).reverse();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const quickLinks = [
    { label: "Attendance", href: "/dso/attendance", icon: CalendarCheck },
    { label: "Targets", href: "/dso/targets", icon: Target },
    { label: "Wallet", href: "/dso/wallet", icon: Wallet },
    { label: "Notifications", href: "/dso/notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSO Dashboard", href: "/dso" }, { label: "My Profile" }]}
        title="My Profile"
        description="Manage your profile, device and account"
      />

      <ProfileCover
        logo={settings.logo}
        fallbackInitial={(settings.dsoName || auth.dsoName || "D").charAt(0).toUpperCase()}
        name={settings.dsoName || auth.dsoName || "DSO"}
        roleLabel="DSO Portal"
        roleIcon={Zap}
        idLine={`${auth.dsoId} · ${settings.franchiseName || "THE SMART ERP"}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Activity} iconClass="bg-[#FFFB63] text-[#0A2647]" label="Activations" value={totalActivations} sub={`${completed} completed`} />
        <StatTile icon={CalendarCheck} iconClass="bg-green-50 text-green-600" label="Attendance" value={`${attendancePct}%`} sub={`${presentDays}/${attendance.length || 0} days present`} />
        <StatTile icon={Wallet} iconClass="bg-[#00C8FF]/10 text-[#0E91B4]" label="Wallet Balance" value={`PKR ${walletBalance.toLocaleString()}`} />
        <StatTile icon={Target} iconClass="bg-brand-50 text-brand-700" label="Target Progress" value={`${targetPct}%`} sub={`${targetDone}/${targetTotal}`} progress={targetPct} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard icon={Hash} title="Profile Information">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoTile icon={Hash} label="DSO ID" value={auth.dsoId} mono />
              <InfoTile icon={Building2} label="Franchise" value={`${settings.franchiseName} (${auth.franchiseId})`} />
              <InfoTile icon={User} label="Role" value="DSO" />
              <InfoTile icon={ShieldCheck} label="Company" value={settings.companyName} />
              <InfoTile icon={Mail} label="Email" value={form.email} />
              <InfoTile icon={Phone} label="Phone" value={form.phone} />
            </div>
          </SectionCard>

          <SectionCard icon={Save} title="Edit Profile">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="pl-9 py-2.5" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="pl-9 py-2.5" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="pl-9 py-2.5" />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">DSO ID (read-only)</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input readOnly value={auth.dsoId} className="pl-9 py-2.5 bg-slate-50 font-mono" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} size="lg" className="bg-[#FFFB63] text-[#0A2647] hover:bg-[#F1B308] hover:text-[#0A2647] border-0 shadow-sm">
                  <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </div>
          </SectionCard>

          {wallet.length > 0 && (
            <SectionCard
              icon={Wallet}
              title="Recent Wallet Activity"
              action={
                <Link href="/dso/wallet" className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#2D28CD] hover:text-[#1C16C5]">
                  View all <ChevronRight size={12} />
                </Link>
              }
            >
              <div className="space-y-2">
                {recentWallet.map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{w.note || w.type}</p>
                      <p className="text-[11px] text-slate-400">{w.date}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-bold ${w.type === "Credit" ? "text-green-600" : "text-red-500"}`}>
                        {w.type === "Credit" ? "+" : "−"}PKR {w.amount.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-400">Bal: PKR {w.balance.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-6">
          <SectionCard icon={Lock} title="Change Password">
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Current Password</label>
                <Input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">New Password</label>
                <Input type="password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Confirm Password</label>
                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
              </div>
              {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && <p className="text-xs font-medium text-red-500">Passwords do not match</p>}
              <Button onClick={handlePasswordChange} disabled={!passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm}>
                <Lock size={14} /> {pwSaved ? "Updated!" : "Update Password"}
              </Button>
            </div>
          </SectionCard>

          {device && (
            <SectionCard icon={Smartphone} title="Assigned Device">
              <div className="grid grid-cols-2 gap-3">
                <InfoTile icon={Smartphone} label="Brand / Model" value={`${device.brand} ${device.model}`} />
                <InfoTile icon={Hash} label="IMEI" value={device.imei} mono />
                <InfoTile icon={Hash} label="BVS Number" value={device.bvsNumber} mono />
                <InfoTile icon={Hash} label="Device ID" value={device.id} mono />
                <InfoTile icon={Hash} label="Retailer ID" value={device.retailerId} mono />
                <InfoTile icon={ShieldCheck} label="Status" value={<StatusPill label={device.status} tone={toneForStatus(device.status)} />} />
              </div>
            </SectionCard>
          )}

          <SectionCard icon={BarChart3} title="Quick Links">
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-[#FFFB63]/60 hover:bg-[#FFFB63]/20 hover:text-[#0A2647]"
                >
                  <Icon size={16} className="text-[#F1B308]" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-3">
              {unreadCount > 0 && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#F1B308]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFFB63] ring-2 ring-[#FFFB63]/30" />
                  {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </SectionCard>

          <Button variant="destructive" className="w-full" onClick={dsoLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}