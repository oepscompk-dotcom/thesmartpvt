"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User, Save, Lock, Mail, Phone, Building2, MapPin, CheckCircle2, CreditCard,
  Calendar, Package, MapPinned, Hash, Users, Smartphone, Wallet, Network,
  CalendarClock, Banknote, Bell, ChevronRight, ShieldCheck,
} from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { useData } from "@/lib/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";
import { ProfileCover, StatTile, InfoTile, SectionCard } from "@/components/profile/ProfileBits";

const PAKISTAN_CITIES: Record<string, string[]> = {
  "Punjab": ["Attock", "Bahawalnagar", "Bahawalpur", "Chakwal", "Dera Ghazi Khan", "Faisalabad", "Gujranwala", "Gujrat", "Hafizabad", "Jhang", "Jhelum", "Kasur", "Khanewal", "Khushab", "Lahore", "Layyah", "Lodhran", "Mandi Bahauddin", "Mianwali", "Multan", "Muzaffargarh", "Narowal", "Nankana Sahib", "Okara", "Pakpattan", "Rahim Yar Khan", "Rajanpur", "Rawalpindi", "Sahiwal", "Sargodha", "Sheikhupura", "Sialkot", "Toba Tek Singh", "Vehari"],
  "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Mirpur Khas", "Nawabshah", "Jacobabad", "Khairpur", "Dadu", "Thatta", "Badin", "Sanghar", "Umerkot", "Shikarpur", "Ghotki"],
  "Khyber Pakhtunkhwa": ["Peshawar", "Abbottabad", "Mardan", "Swat (Mingora)", "Kohat", "Bannu", "Dera Ismail Khan", "Haripur", "Mansehra", "Nowshera", "Charsadda", "Swabi"],
  "Balochistan": ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Chaman", "Sibi", "Zhob", "Hub", "Loralai"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu", "Hunza", "Chilas", "Ghanche"],
  "Azad Jammu & Kashmir": ["Muzaffarabad", "Mirpur", "Kotli", "Rawalakot", "Bagh"],
};

export default function ProfilePage() {
  const { settings, auth, updateSettings, dsms, dso, devices, sims, wallet, notifications } = useFranchiseData();
  const { franchises, updateFranchise } = useData();
  const [form, setForm] = useState({
    franchiseName: "",
    ownerName: "",
    email: "",
    phone: "",
    province: "",
    city: "",
    address: "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const initialized = useRef(false);

  const franchise = franchises.find((f) => f.id === auth.franchiseId);

  useEffect(() => {
    if (initialized.current) return;
    if (!franchise && !settings.franchiseName) return;
    initialized.current = true;
    setForm({
      franchiseName: franchise?.name || settings.franchiseName || "",
      ownerName: franchise?.owner || settings.ownerName || "",
      email: franchise?.email || settings.email || "",
      phone: franchise?.mobile || settings.phone || "",
      province: franchise?.province || "",
      city: franchise?.city || "",
      address: settings.address || "",
    });
    setMounted(true);
  }, [franchise, settings]);

  const handleSave = async () => {
    try {
      if (franchise) {
        await updateFranchise(franchise.id, {
          ...franchise,
          name: form.franchiseName,
          owner: form.ownerName,
          email: form.email,
          mobile: form.phone,
          province: form.province,
          city: form.city,
        });
      }
      await updateSettings({
        ...settings,
        franchiseName: form.franchiseName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        address: form.address || (form.city && form.province ? `${form.city}, ${form.province}` : form.city || form.province || ""),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save profile:", e);
      alert("Failed to save profile. Please try again.");
    }
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

  const staffCount = dsms.length + dso.length;
  const walletBalance = wallet.length ? wallet[wallet.length - 1].balance ?? 0 : 0;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const daysRemaining = franchise?.agreementEnd
    ? Math.max(0, Math.ceil((new Date(franchise.agreementEnd).getTime() - Date.now()) / 86400000))
    : null;
  const rangeTotal = franchise?.agreementStart && franchise?.agreementEnd
    ? Math.max(1, (new Date(franchise.agreementEnd).getTime() - new Date(franchise.agreementStart).getTime()) / 86400000)
    : null;
  const elapsed = franchise?.agreementStart
    ? Math.max(0, (Date.now() - new Date(franchise.agreementStart).getTime()) / 86400000)
    : 0;
  const agreementPct = rangeTotal ? Math.min(100, Math.round((elapsed / rangeTotal) * 100)) : 0;

  const fieldCls = (withIcon: boolean) =>
    `flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-[#2D28CD]/40 focus-within:ring-2 focus-within:ring-[#2D28CD]/10 transition-all`;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Profile" }]}
        title="My Profile"
        description="Manage your franchise profile, agreement and account"
      />

      <ProfileCover
        logo={settings.logo}
        fallbackInitial={(form.ownerName || form.franchiseName || "F").charAt(0).toUpperCase()}
        name={form.ownerName || "Franchise Owner"}
        roleLabel="Franchise Portal"
        roleIcon={Building2}
        idLine={`${auth.franchiseId} · ${form.franchiseName || "THE SMART ERP"}`}
        status={franchise?.status ? <StatusPill label={franchise.status} tone={toneForStatus(franchise.status)} /> : undefined}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Users} iconClass="bg-brand-50 text-brand-600" label="Team Members" value={staffCount} sub={`${dsms.length} DSM · ${dso.length} DSO`} />
        <StatTile icon={Smartphone} iconClass="bg-[#00C8FF]/10 text-[#0E91B4]" label="Field Devices" value={devices.length} />
        <StatTile icon={Wallet} iconClass="bg-green-50 text-green-600" label="Wallet Balance" value={`PKR ${walletBalance.toLocaleString()}`} />
        <StatTile icon={Package} iconClass="bg-brand-50 text-brand-700" label="SIM Stock" value={sims.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard icon={Hash} title="Profile Information">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoTile icon={Hash} label="Franchise ID" value={franchise?.id || auth.franchiseId} mono />
              <InfoTile icon={Building2} label="Franchise Name" value={franchise?.name} />
              <InfoTile icon={User} label="Owner Name" value={franchise?.owner} />
              <InfoTile icon={CreditCard} label="CNIC" value={franchise?.cnic} mono />
              <InfoTile icon={Phone} label="Mobile" value={franchise?.mobile} />
              <InfoTile icon={Mail} label="Email" value={franchise?.email} />
              <InfoTile icon={MapPinned} label="Province" value={franchise?.province} />
              <InfoTile icon={MapPin} label="City" value={franchise?.city} />
              <InfoTile icon={CheckCircle2} label="Status" value={franchise?.status} />
              <InfoTile icon={Calendar} label="Agreement Start" value={fmtDate(franchise?.agreementStart || "")} />
              <InfoTile icon={Calendar} label="Agreement End" value={fmtDate(franchise?.agreementEnd || "")} />
              <InfoTile icon={ShieldCheck} label="Network" value={franchise?.network} />
            </div>
          </SectionCard>

          <SectionCard icon={Save} title="Edit Profile">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Franchise Name</label>
                <div className={fieldCls(true)}>
                  <Building2 size={16} className="shrink-0 text-slate-400" />
                  <Input value={form.franchiseName} onChange={(e) => setForm((p) => ({ ...p, franchiseName: e.target.value }))} placeholder="Enter franchise name" className="border-0 bg-transparent py-2.5 focus:ring-0" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Full Name (Owner)</label>
                  <div className={fieldCls(true)}>
                    <User size={16} className="shrink-0 text-slate-400" />
                    <Input value={form.ownerName} onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Enter your full name" className="border-0 bg-transparent py-2.5 focus:ring-0" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Phone</label>
                  <div className={fieldCls(true)}>
                    <Phone size={16} className="shrink-0 text-slate-400" />
                    <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Enter phone number" className="border-0 bg-transparent py-2.5 focus:ring-0" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Email</label>
                  <div className={fieldCls(true)}>
                    <Mail size={16} className="shrink-0 text-slate-400" />
                    <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Enter email address" className="border-0 bg-transparent py-2.5 focus:ring-0" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Province</label>
                  <Select value={form.province} onChange={(e) => setForm((p) => ({ ...p, province: e.target.value, city: "" }))}>
                    <option value="">Select Province</option>
                    {Object.keys(PAKISTAN_CITIES).map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">City</label>
                  <Select value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} disabled={!form.province}>
                    <option value="">{form.province ? "Select City" : "Select Province first"}</option>
                    {(PAKISTAN_CITIES[form.province] || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Address (Optional)</label>
                <div className={fieldCls(true)}>
                  <MapPin size={16} className="shrink-0 text-slate-400" />
                  <Input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Enter street address" className="border-0 bg-transparent py-2.5 focus:ring-0" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Franchise ID (read-only)</label>
                <div className={`${fieldCls(true)} bg-slate-100`}>
                  <Building2 size={16} className="shrink-0 text-slate-400" />
                  <span className="py-2.5 text-sm font-mono text-slate-600">{auth.franchiseId}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} size="lg" className="bg-brand-600 text-white hover:bg-brand-700 border-0 shadow-sm">
                  {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
                </Button>
              </div>
            </div>
          </SectionCard>
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
              {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
                <p className="text-xs font-medium text-red-500">Passwords do not match</p>
              )}
              <Button
                onClick={handlePasswordChange}
                disabled={!passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm}
              >
                {pwSaved ? <><CheckCircle2 size={14} /> Updated!</> : <><Lock size={14} /> Update Password</>}
              </Button>
            </div>
          </SectionCard>

          <SectionCard icon={CalendarClock} title="Agreement & Package">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoTile icon={Package} label="Package" value={franchise?.package || "\u2014"} />
                <InfoTile icon={Network} label="Network" value={franchise?.network || "\u2014"} mono />
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Agreement Progress</span>
                  <span className="text-xs font-bold text-brand-600">{agreementPct}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${agreementPct}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  {daysRemaining !== null ? `${daysRemaining} days remaining` : "—"}
                </p>
              </div>
            </div>
          </SectionCard>

          {settings.bankName && (
            <SectionCard icon={Banknote} title="Bank Details">
              <div className="grid grid-cols-1 gap-3">
                <InfoTile icon={Building2} label="Bank" value={settings.bankName} />
                <InfoTile icon={User} label="Account Title" value={settings.bankAccountTitle} />
                <InfoTile icon={CreditCard} label="Account Number" value={settings.bankAccountNumber} mono />
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={Bell}
            title="Notifications"
            action={
              <Link href="/franchise/notifications" className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
                View all <ChevronRight size={12} />
              </Link>
            }
          >
            <div className="space-y-2.5">
              {notifications.length === 0 && (
                <p className="text-sm text-slate-400">No notifications yet.</p>
              )}
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-brand-600 ring-2 ring-brand-600/30"}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{n.message || n.title}</p>
                    <p className="text-[11px] text-slate-400">{n.time}</p>
                  </div>
                </div>
              ))}
              {notifications.length > 0 && unreadCount > 0 && (
                <p className="text-right text-[11px] font-semibold text-brand-600">{unreadCount} unread</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}