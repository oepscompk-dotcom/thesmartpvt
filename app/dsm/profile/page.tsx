"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDSMData } from "@/lib/DSMDataContext";
import {
  User, Mail, Phone, Lock, Save, Smartphone, Building, Shield, ArrowLeft,
  LogOut, Wallet, Users, TrendingUp, CheckCircle2, Bell, Target, ChevronRight,
  Hash, FileText, CalendarCheck, Zap, Award,
} from "lucide-react";
import { apiLoadById, apiSave } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProfileCover, StatTile, InfoTile, SectionCard } from "@/components/profile/ProfileBits";

async function loadProfileApi<T>(model: string, id: string, defaultVal: T): Promise<T> {
  try {
    const result = await apiLoadById(model, id);
    if (result) return result as T;
  } catch {}
  return defaultVal;
}

export default function ProfilePage() {
  const { auth, updateProfile, dsmLogout, dsos, wallet, notifications, attendance, teamSize, totalSales, totalRevenue, settings } = useDSMData();
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

  const walletBalance = wallet.length ? wallet[wallet.length - 1].balance : 0;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotes = notifications.slice(0, 3);
  const attendancePresent = attendance.filter((a) => a.status === "Present").length;

  const quickLinks = [
    { label: "Attendance", href: "/dsm/attendance", icon: CalendarCheck },
    { label: "Team Performance", href: "/dsm/team-performance", icon: Award },
    { label: "Reports", href: "/dsm/reports", icon: FileText },
    { label: "Notifications", href: "/dsm/notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/dsm/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-slate-200 transition-colors">
          <ArrowLeft size={22} className="text-foreground" />
        </a>
        <PageHeader
          title="My Profile"
          description="Manage your account and team profile"
        />
      </div>

      <ProfileCover
        logo={settings.logo}
        fallbackInitial={(settings.dsmName || auth.dsmName || "D").charAt(0).toUpperCase()}
        name={(settings.dsmName || auth.dsmName || "DSM").charAt(0).toUpperCase() + (settings.dsmName || auth.dsmName || "DSM").slice(1)}
        roleLabel="DSM Portal"
        roleIcon={Zap}
        idLine={`${auth.dsmId} · ${settings.franchiseName || "THE SMART ERP"}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Users} iconClass="bg-[#FFFB63] text-[#0A2647]" label="Team Size" value={teamSize || dsos.length} sub={`${dsos.length} DSOs on record`} />
        <StatTile icon={TrendingUp} iconClass="bg-brand-50 text-brand-700" label="Total Sales" value={totalSales?.toLocaleString?.() ?? totalSales} />
        <StatTile icon={CheckCircle2} iconClass="bg-green-50 text-green-600" label="Revenue" value={`PKR ${(totalRevenue || 0).toLocaleString()}`} />
        <StatTile icon={Wallet} iconClass="bg-[#00C8FF]/10 text-[#0E91B4]" label="Wallet Balance" value={`PKR ${walletBalance.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard icon={Hash} title="Profile Information">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoTile icon={Hash} label="DSM ID" value={auth.dsmId} mono />
              <InfoTile icon={Building} label="Franchise" value={auth.franchiseId} mono />
              <InfoTile icon={Shield} label="Role" value="DSM" />
              <InfoTile icon={CheckCircle2} label="Platform" value="The Smart ERP" />
              <InfoTile icon={Mail} label="Email" value={email || "\u2014"} />
              <InfoTile icon={Phone} label="Phone" value={phone || "\u2014"} />
            </div>
          </SectionCard>

          <SectionCard icon={Save} title="Personal Information">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 py-2.5" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className="pl-10 py-2.5" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone" className="pl-10 py-2.5" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} size="lg" className="bg-[#FFFB63] text-[#0A2647] hover:bg-[#F1B308] hover:text-[#0A2647] border-0 shadow-sm">
                  <Save size={16} />
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </div>
          </SectionCard>

          {recentNotes.length > 0 && (
            <SectionCard
              icon={Bell}
              title="Recent Notifications"
              action={
                <Link href="/dsm/notifications" className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#2D28CD] hover:text-[#1C16C5]">
                  View all <ChevronRight size={12} />
                </Link>
              }
            >
              <div className="space-y-2">
                {recentNotes.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-[#FFFB63] ring-2 ring-[#FFFB63]/30"}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{n.title || n.message}</p>
                      <p className="text-[11px] text-slate-400">{n.time}</p>
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
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="pl-10" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="pl-10" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="pl-10" />
                </div>
              </div>
              <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
                <Shield size={16} />
                {passwordSaved ? "Password Updated!" : "Update Password"}
              </Button>
            </div>
          </SectionCard>

          <SectionCard icon={Smartphone} title="Device Information">
            <div className="grid grid-cols-1 gap-3">
              <InfoTile icon={Shield} label="Platform" value="The Smart ERP" />
              <InfoTile icon={Zap} label="Role" value="DSM" />
              <InfoTile icon={Building} label="Franchise ID" value={auth.franchiseId} mono />
              <InfoTile icon={Hash} label="DSM ID" value={auth.dsmId} mono />
            </div>
          </SectionCard>

          <SectionCard icon={Target} title="Quick Links">
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
            <div className="mt-3 space-y-1.5">
              {attendance.length > 0 && (
                <p className="text-xs font-semibold text-slate-500">
                  {attendancePresent} of {attendance.length} attendance days marked present
                </p>
              )}
              {unreadCount > 0 && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#F1B308]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFFB63] ring-2 ring-[#FFFB63]/30" />
                  {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </SectionCard>

          <Button variant="destructive" className="w-full" onClick={dsmLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}