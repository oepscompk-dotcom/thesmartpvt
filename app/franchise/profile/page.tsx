"use client";

import { useState, useEffect, useRef } from "react";
import { User, Save, Lock, Mail, Phone, Building2, MapPin, CheckCircle2, CreditCard, Calendar, Package, MapPinned, Hash } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { useData } from "@/lib/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";

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
  const { settings, auth, updateSettings } = useFranchiseData();
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

  const infoItems = [
    { icon: Hash, label: "Franchise ID", value: franchise?.id || auth.franchiseId, monospace: true },
    { icon: Building2, label: "Franchise Name", value: franchise?.name || "\u2014" },
    { icon: User, label: "Owner Name", value: franchise?.owner || "\u2014" },
    { icon: CreditCard, label: "CNIC", value: franchise?.cnic || "\u2014", monospace: true },
    { icon: Phone, label: "Mobile", value: franchise?.mobile || "\u2014" },
    { icon: Mail, label: "Email", value: franchise?.email || "\u2014" },
    { icon: MapPinned, label: "Province", value: franchise?.province || "\u2014" },
    { icon: MapPin, label: "City", value: franchise?.city || "\u2014" },
    { icon: Package, label: "Package", value: franchise?.package || "\u2014" },
    { icon: CheckCircle2, label: "Status", value: franchise?.status || "\u2014", status: true },
    { icon: Calendar, label: "Agreement Start", value: fmtDate(franchise?.agreementStart || "") },
    { icon: Calendar, label: "Agreement End", value: fmtDate(franchise?.agreementEnd || "") },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Profile" }]}
        title="My Profile"
        description="Manage your franchise profile and account settings"
      />

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-2xl font-black text-white shadow-lg">
              {(form.ownerName || form.franchiseName || "F").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{form.ownerName || "Franchise Owner"}</h3>
              <p className="text-sm text-muted-foreground">{form.franchiseName || "Franchise Name"}</p>
              <p className="text-xs font-semibold text-amber-500">{auth.franchiseId}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoItems.map(({ icon: Icon, label, value, monospace, status }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-muted-foreground"><Icon size={14} /><span className="text-xs font-medium uppercase">{label}</span></div>
                {status ? (
                  <StatusPill label={value} tone={toneForStatus(value)} />
                ) : (
                  <p className={`font-medium text-slate-900 ${monospace ? "font-mono" : ""}`}>{value}</p>
                )}
              </div>
            ))}
          </div>

          <CardTitle className="mb-3 text-sm uppercase tracking-wide">Edit Profile</CardTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Franchise Name</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Building2 size={16} className="text-muted-foreground" />
                <Input value={form.franchiseName} onChange={(e) => setForm((p) => ({ ...p, franchiseName: e.target.value }))} placeholder="Enter franchise name" className="border-0 bg-transparent focus:ring-0" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Full Name (Owner)</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                <User size={16} className="text-muted-foreground" />
                <Input value={form.ownerName} onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Enter your full name" className="border-0 bg-transparent focus:ring-0" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Mail size={16} className="text-muted-foreground" />
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Enter email address" className="border-0 bg-transparent focus:ring-0" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phone</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Phone size={16} className="text-muted-foreground" />
                <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Enter phone number" className="border-0 bg-transparent focus:ring-0" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Province</label>
              <Select value={form.province} onChange={(e) => setForm((p) => ({ ...p, province: e.target.value, city: "" }))}>
                <option value="">Select Province</option>
                {Object.keys(PAKISTAN_CITIES).map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">City</label>
              <Select value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} disabled={!form.province}>
                <option value="">{form.province ? "Select City" : "Select Province first"}</option>
                {(PAKISTAN_CITIES[form.province] || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Address (Optional)</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                <MapPin size={16} className="text-muted-foreground" />
                <Input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Enter street address" className="border-0 bg-transparent focus:ring-0" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Franchise ID</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3">
                <Building2 size={16} className="text-muted-foreground" />
                <span className="py-2 text-sm font-mono text-slate-500">{auth.franchiseId}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} size="lg">
              {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-6 pb-4">
          <CardTitle className="flex items-center gap-2"><Lock size={18} /> Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
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
          {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handlePasswordChange}
            disabled={!passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm}>
            {pwSaved ? <><CheckCircle2 size={14} /> Updated!</> : <><Lock size={14} /> Update Password</>}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
