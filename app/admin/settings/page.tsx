"use client";

import { useState, useRef } from "react";
import { Save, Upload, CheckCircle, Trash2, Plus, Eye, EyeOff, X } from "lucide-react";
import { useData, Settings, HeaderNavLink, FooterLinkColumn, FooterBottomLink, HeroSlide, HomepageStat, HomepageService, HomepageFeature, HomepageSection, HomepageContent } from "@/lib/DataContext";
import { uploadFile, deleteRemoteFile } from "@/lib/r2Client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const tabs = ["General", "Logo", "Header", "Footer", "Homepage"];

function LogoUploader({ label, sublabel, preview, onChange, onRemove }: { label: string; sublabel: string; preview: string; onChange: (base64: string) => void; onRemove: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState(preview);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
    const url = await uploadFile(file, "logos");
    if (!url) return;
    setLocalPreview(url);
    onChange(url);
  };

  const remove = async () => {
    await deleteRemoteFile(preview);
    setLocalPreview("");
    onRemove();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </CardHeader>
      <CardContent>
        <input ref={fileInputRef} type="file" accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg" onChange={handleUpload} className="hidden" />
        <div className="mb-4 flex items-center gap-4">
          {localPreview ? (
            <img src={localPreview} alt={label} className="h-20 w-20 rounded-lg border border-slate-200 bg-slate-50 object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
              <Upload size={24} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{localPreview ? "Uploaded" : "No image"}</p>
            <p className="text-xs text-muted-foreground">512x512px recommended, Max 5MB</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> {localPreview ? "Change" : "Upload"}
          </Button>
          {localPreview && (
            <Button variant="outline" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-700" onClick={remove}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}

function GeneralTab({ form, setField }: { form: Settings; setField: (field: string, value: string) => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Company Name", field: "companyName" },
            { label: "Email", field: "email" },
            { label: "Phone", field: "phone" },
            { label: "Address", field: "address" },
          ].map((f) => (
            <Field key={f.field} label={f.label}>
              <Input type="text" value={form[f.field as keyof Settings] as string} onChange={(e) => setField(f.field, e.target.value)} />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "SMS API Key", field: "smsApiKey" },
            { label: "WhatsApp API Key", field: "whatsappApiKey" },
            { label: "Payment Gateway Key", field: "paymentGatewayKey" },
          ].map((f) => (
            <Field key={f.field} label={f.label}>
              <Input type="password" value={form[f.field as keyof Settings] as string} onChange={(e) => setField(f.field, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}`} className="font-mono" />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Name", field: "adminName" },
            { label: "Email", field: "adminEmail" },
            { label: "Mobile", field: "adminMobile" },
          ].map((f) => (
            <Field key={f.field} label={f.label}>
              <Input type="text" value={form[f.field as keyof Settings] as string} onChange={(e) => setField(f.field, e.target.value)} />
            </Field>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LogoTab({ form, setLogoField }: { form: Settings; setLogoField: (field: "logo" | "headerLogo" | "footerLogo" | "favicon", value: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <LogoUploader label="Main Logo" sublabel="Used in admin dashboard sidebar & login pages" preview={form.logo} onChange={(v) => setLogoField("logo", v)} onRemove={() => setLogoField("logo", "")} />
        <LogoUploader label="Header Logo" sublabel="Used in website header navigation bar" preview={form.headerLogo} onChange={(v) => setLogoField("headerLogo", v)} onRemove={() => setLogoField("headerLogo", "")} />
        <LogoUploader label="Footer Logo" sublabel="Used in website footer before copyright" preview={form.footerLogo} onChange={(v) => setLogoField("footerLogo", v)} onRemove={() => setLogoField("footerLogo", "")} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <LogoUploader label="Favicon" sublabel="Browser tab icon, 32x32px recommended. SVG, PNG, JPG supported." preview={form.favicon} onChange={(v) => setLogoField("favicon", v)} onRemove={() => setLogoField("favicon", "")} />
      </div>
    </div>
  );
}

function HeaderTab({ header, onChange }: { header: Settings["header"]; onChange: (h: Settings["header"]) => void }) {
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");

  const updateLink = (index: number, field: keyof HeaderNavLink, value: string | boolean) => {
    const links = [...header.navLinks];
    links[index] = { ...links[index], [field]: value };
    onChange({ ...header, navLinks: links });
  };

  const addLink = () => {
    if (!newLinkName.trim()) return;
    onChange({ ...header, navLinks: [...header.navLinks, { name: newLinkName.trim(), href: newLinkHref.trim() || "#", visible: true }] });
    setNewLinkName("");
    setNewLinkHref("");
  };

  const removeLink = (index: number) => {
    onChange({ ...header, navLinks: header.navLinks.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {header.navLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Input type="text" value={link.name} onChange={(e) => updateLink(i, "name", e.target.value)} className="min-w-0 flex-1" placeholder="Name" />
                <Input type="text" value={link.href} onChange={(e) => updateLink(i, "href", e.target.value)} className="min-w-0 flex-1" placeholder="Link" />
                <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${link.visible ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-slate-200"}`} onClick={() => updateLink(i, "visible", !link.visible)} title={link.visible ? "Visible" : "Hidden"}>
                  {link.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => removeLink(i)} title="Remove link">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Input type="text" value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)} placeholder="Link name" className="min-w-0 flex-1" />
            <Input type="text" value={newLinkHref} onChange={(e) => setNewLinkHref(e.target.value)} placeholder="#section" className="min-w-0 flex-1" />
            <Button onClick={addLink}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tagline</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="text" value={header.tagline} onChange={(e) => onChange({ ...header, tagline: e.target.value })} />
            <p className="mt-2 text-xs text-muted-foreground">Displayed below the company name in header</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CTA Button</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Button Text">
              <Input type="text" value={header.ctaText} onChange={(e) => onChange({ ...header, ctaText: e.target.value })} />
            </Field>
            <Field label="Button Link">
              <Input type="text" value={header.ctaLink} onChange={(e) => onChange({ ...header, ctaLink: e.target.value })} />
            </Field>
            <Button variant={header.ctaVisible ? "secondary" : "outline"} onClick={() => onChange({ ...header, ctaVisible: !header.ctaVisible })}>
              {header.ctaVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {header.ctaVisible ? "Visible" : "Hidden"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FooterTab({ footer, onChange }: { footer: Settings["footer"]; onChange: (f: Settings["footer"]) => void }) {
  const [newFeature, setNewFeature] = useState("");
  const [newColTitle, setNewColTitle] = useState("");
  const [newColLinks, setNewColLinks] = useState("");
  const [newBottomText, setNewBottomText] = useState("");
  const [newBottomHref, setNewBottomHref] = useState("");
  const centerLogoRef = useRef<HTMLInputElement>(null);
  const [centerLogoPreview, setCenterLogoPreview] = useState(footer.centerLogo || "");

  const handleCenterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
    const url = await uploadFile(file, "logos");
    if (!url) return;
    setCenterLogoPreview(url);
    onChange({ ...footer, centerLogo: url });
  };

  const removeCenterLogo = async () => {
    await deleteRemoteFile(footer.centerLogo);
    setCenterLogoPreview("");
    onChange({ ...footer, centerLogo: "" });
    if (centerLogoRef.current) centerLogoRef.current.value = "";
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    onChange({ ...footer, features: [...footer.features, newFeature.trim()] });
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    onChange({ ...footer, features: footer.features.filter((_, i) => i !== index) });
  };

  const addColumn = () => {
    if (!newColTitle.trim()) return;
    const links = newColLinks.split(",").map((l) => l.trim()).filter(Boolean);
    onChange({ ...footer, linkColumns: [...footer.linkColumns, { title: newColTitle.trim(), links }] });
    setNewColTitle("");
    setNewColLinks("");
  };

  const removeColumn = (index: number) => {
    onChange({ ...footer, linkColumns: footer.linkColumns.filter((_, i) => i !== index) });
  };

  const updateColumn = (index: number, field: keyof FooterLinkColumn, value: string | string[]) => {
    const cols = [...footer.linkColumns];
    cols[index] = { ...cols[index], [field]: value };
    onChange({ ...footer, linkColumns: cols });
  };

  const addBottomLink = () => {
    if (!newBottomText.trim()) return;
    onChange({ ...footer, bottomLinks: [...footer.bottomLinks, { text: newBottomText.trim(), href: newBottomHref.trim() || "#" }] });
    setNewBottomText("");
    setNewBottomHref("");
  };

  const removeBottomLink = (index: number) => {
    onChange({ ...footer, bottomLinks: footer.bottomLinks.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Footer Description</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea value={footer.description} onChange={(e) => onChange({ ...footer, description: e.target.value })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {footer.features.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-sm text-brand-700">
                {f}
                <button onClick={() => removeFeature(i)} className="text-brand-400 hover:text-red-500"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFeature()} placeholder="New feature..." className="min-w-0 flex-1" />
            <Button onClick={addFeature}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Columns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {footer.linkColumns.map((col, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Input type="text" value={col.title} onChange={(e) => updateColumn(i, "title", e.target.value)} className="min-w-0 flex-1 font-medium" placeholder="Column title" />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => removeColumn(i)} title="Remove column"><Trash2 size={14} /></Button>
                </div>
                <textarea value={col.links.join(", ")} onChange={(e) => updateColumn(i, "links", e.target.value.split(",").map((l) => l.trim()).filter(Boolean))} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" placeholder="Links (comma separated)" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Input type="text" value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} placeholder="Column title" className="min-w-0 flex-1" />
            <Input type="text" value={newColLinks} onChange={(e) => setNewColLinks(e.target.value)} placeholder="Links (comma separated)" className="min-w-0 flex-1" />
            <Button onClick={addColumn}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Center Logo Box</CardTitle>
          <p className="text-xs text-muted-foreground">Upload a custom image for the footer center logo box. Supports JPG, PNG, SVG formats. Max 5MB.</p>
        </CardHeader>
        <CardContent>
          <input ref={centerLogoRef} type="file" accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg" className="hidden" onChange={handleCenterLogoUpload} />

          <div className="mb-4 flex items-center gap-4">
            {centerLogoPreview ? (
              <img src={centerLogoPreview} alt="Center Logo" className="h-24 w-24 rounded-lg border border-slate-200 bg-slate-50 object-contain" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                <Upload size={28} className="text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{centerLogoPreview ? "Custom image uploaded" : "Using default logo"}</p>
              <p className="text-xs text-muted-foreground">Recommended: 200x200px or larger, transparent PNG/SVG works best</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => centerLogoRef.current?.click()}>
              <Upload className="h-4 w-4" /> {centerLogoPreview ? "Change Image" : "Upload Image"}
            </Button>
            {centerLogoPreview && (
              <Button variant="outline" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-700" onClick={removeCenterLogo}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
            <Button variant={footer.showCenterLogo ? "secondary" : "outline"} onClick={() => onChange({ ...footer, showCenterLogo: !footer.showCenterLogo })}>
              {footer.showCenterLogo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {footer.showCenterLogo ? "Visible" : "Hidden"}
            </Button>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Logo Size</label>
            <div className="flex items-center gap-4">
              <input type="range" min="24" max="200" value={footer.centerLogoSize || "48"} onChange={(e) => onChange({ ...footer, centerLogoSize: e.target.value })} className="h-2 flex-1 cursor-pointer appearance-none rounded-lg accent-brand-600" />
              <span className="w-16 text-right text-sm font-medium text-foreground">{footer.centerLogoSize || "48"}px</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Adjust the height of the center logo image</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Copyright Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="text" value={footer.copyrightText} onChange={(e) => onChange({ ...footer, copyrightText: e.target.value })} />
          <p className="mt-2 text-xs text-muted-foreground">Company name is shown automatically before this text</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bottom Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-3">
            {footer.bottomLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Input type="text" value={link.text} onChange={(e) => {
                  const links = [...footer.bottomLinks];
                  links[i] = { ...links[i], text: e.target.value };
                  onChange({ ...footer, bottomLinks: links });
                }} className="min-w-0 flex-1" placeholder="Text" />
                <Input type="text" value={link.href} onChange={(e) => {
                  const links = [...footer.bottomLinks];
                  links[i] = { ...links[i], href: e.target.value };
                  onChange({ ...footer, bottomLinks: links });
                }} className="min-w-0 flex-1" placeholder="Link" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => removeBottomLink(i)} title="Remove link"><X className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input type="text" value={newBottomText} onChange={(e) => setNewBottomText(e.target.value)} placeholder="Link text" className="min-w-0 flex-1" />
            <Input type="text" value={newBottomHref} onChange={(e) => setNewBottomHref(e.target.value)} placeholder="#" className="min-w-0 flex-1" />
            <Button onClick={addBottomLink}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionFields({ section, onChange }: { section: HomepageSection; onChange: (s: HomepageSection) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Badge">
        <Input type="text" value={section.badge} onChange={(e) => onChange({ ...section, badge: e.target.value })} />
      </Field>
      <Field label="Title">
        <Input type="text" value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })} />
      </Field>
      <Field label="Title Highlight">
        <Input type="text" value={section.titleHighlight} onChange={(e) => onChange({ ...section, titleHighlight: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description">
          <textarea value={section.description} onChange={(e) => onChange({ ...section, description: e.target.value })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
        </Field>
      </div>
    </div>
  );
}

const gradientOptions = [
  { value: "from-[#0A2647] via-[#1E3A8A] to-[#2563EB]", label: "Deep Navy Blue" },
  { value: "from-[#4F46E5] via-[#7C3AED] to-[#EC4899]", label: "Purple Violet" },
  { value: "from-[#00C8FF] via-[#2563EB] to-[#6366F1]", label: "Sky Blue" },
  { value: "from-[#059669] via-[#10B981] to-[#84CC16]", label: "Emerald Green" },
  { value: "from-[#F59E0B] via-[#F97316] to-[#EF4444]", label: "Sunset Orange" },
  { value: "from-[#0F172A] via-[#334155] to-[#475569]", label: "Slate Dark" },
];

function HomepageTab({ homepage, onChange }: { homepage: HomepageContent; onChange: (h: HomepageContent) => void }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [newStat, setNewStat] = useState({ value: 0, suffix: "", label: "", icon: "Briefcase" });
  const [newService, setNewService] = useState({ title: "", description: "", features: "", icon: "Briefcase" });
  const [newFeature, setNewFeature] = useState({ title: "", description: "", icon: "Briefcase" });
  const [newAboutItem, setNewAboutItem] = useState({ title: "", description: "" });

  const sectionTabs = [
    { id: "hero", label: "Hero" },
    { id: "stats", label: "Stats" },
    { id: "solutions", label: "Solutions" },
    { id: "features", label: "Features" },
    { id: "franchises", label: "Franchises" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
    { id: "cta", label: "CTA" },
  ];

  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: string) => {
    const slides = homepage.hero.slides.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange({ ...homepage, hero: { ...homepage.hero, slides } });
  };

  const addHeroSlide = () => {
    onChange({ ...homepage, hero: { ...homepage.hero, slides: [...homepage.hero.slides, {
      id: `slide-${Date.now()}`,
      badge: "NEW",
      title: "New Slide Title",
      titleHighlight: "Highlight",
      subtitle: "Subtitle",
      description: "",
      features: [],
      ctaText: "Get Started",
      ctaLink: "#contact",
      ctaSecondaryText: "Learn More",
      ctaSecondaryLink: "#about",
      gradient: "from-[#0A2647] via-[#1E3A8A] to-[#2563EB]",
    }] } });
  };

  const removeHeroSlide = (index: number) => {
    onChange({ ...homepage, hero: { ...homepage.hero, slides: homepage.hero.slides.filter((_, i) => i !== index) } });
  };

  const addStat = () => {
    if (!newStat.label.trim()) return;
    onChange({ ...homepage, stats: { ...homepage.stats, items: [...homepage.stats.items, { ...newStat, value: Number(newStat.value) || 0 }] } });
    setNewStat({ value: 0, suffix: "", label: "", icon: "Briefcase" });
  };

  const updateStat = (index: number, field: keyof HomepageStat, value: string) => {
    const items = homepage.stats.items.map((s, i) => (i === index ? { ...s, [field]: field === "value" ? Number(value) || 0 : value } : s));
    onChange({ ...homepage, stats: { ...homepage.stats, items } });
  };

  const removeStat = (index: number) => {
    onChange({ ...homepage, stats: { ...homepage.stats, items: homepage.stats.items.filter((_, i) => i !== index) } });
  };

  const addService = () => {
    if (!newService.title.trim()) return;
    onChange({ ...homepage, solutions: { ...homepage.solutions, items: [...homepage.solutions.items, {
      title: newService.title.trim(),
      description: newService.description.trim(),
      features: newService.features.split(",").map((l) => l.trim()).filter(Boolean),
      icon: newService.icon || "Briefcase",
    }] } });
    setNewService({ title: "", description: "", features: "", icon: "Briefcase" });
  };

  const updateService = (index: number, field: keyof HomepageService, value: string) => {
    const items = homepage.solutions.items.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange({ ...homepage, solutions: { ...homepage.solutions, items } });
  };

  const removeService = (index: number) => {
    onChange({ ...homepage, solutions: { ...homepage.solutions, items: homepage.solutions.items.filter((_, i) => i !== index) } });
  };

  const addFeature = () => {
    if (!newFeature.title.trim()) return;
    onChange({ ...homepage, features: { ...homepage.features, items: [...homepage.features.items, {
      title: newFeature.title.trim(),
      description: newFeature.description.trim(),
      icon: newFeature.icon || "ShieldCheck",
    }] } });
    setNewFeature({ title: "", description: "", icon: "ShieldCheck" });
  };

  const updateFeature = (index: number, field: keyof HomepageFeature, value: string) => {
    const items = homepage.features.items.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    onChange({ ...homepage, features: { ...homepage.features, items } });
  };

  const removeFeature = (index: number) => {
    onChange({ ...homepage, features: { ...homepage.features, items: homepage.features.items.filter((_, i) => i !== index) } });
  };

  const addAboutItem = () => {
    if (!newAboutItem.title.trim()) return;
    onChange({ ...homepage, about: { ...homepage.about, items: [...homepage.about.items, newAboutItem] } });
    setNewAboutItem({ title: "", description: "" });
  };

  const updateAboutItem = (index: number, field: string, value: string) => {
    const items = homepage.about.items.map((a, i) => (i === index ? { ...a, [field]: value } : a));
    onChange({ ...homepage, about: { ...homepage.about, items } });
  };

  const removeAboutItem = (index: number) => {
    onChange({ ...homepage, about: { ...homepage.about, items: homepage.about.items.filter((_, i) => i !== index) } });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {sectionTabs.map((t) => (
          <Button key={t.id} variant={activeSection === t.id ? "primary" : "outline"} size="sm" onClick={() => setActiveSection(t.id)}>{t.label}</Button>
        ))}
      </div>

      {activeSection === "hero" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Slider Configuration</CardTitle>
              <p className="text-xs text-muted-foreground">Configure the hero section slides displayed on the homepage</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <Field label="Auto Play">
                  <select value={String(homepage.hero.autoPlay)} onChange={(e) => onChange({ ...homepage, hero: { ...homepage.hero, autoPlay: e.target.value === "true" } })} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </Field>
                <Field label="Slide Interval (seconds)">
                  <Input type="number" value={homepage.hero.interval} onChange={(e) => onChange({ ...homepage, hero: { ...homepage.hero, interval: Number(e.target.value) || 0 } })} />
                </Field>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Slides ({homepage.hero.slides.length})</h4>
                <Button size="sm" onClick={addHeroSlide}><Plus className="h-4 w-4" /> Add Slide</Button>
              </div>
              <div className="space-y-4">
                {homepage.hero.slides.map((slide, i) => (
                  <div key={slide.id} className="rounded-lg border border-slate-200 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{i + 1}. {slide.title || "Untitled Slide"}</p>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => removeHeroSlide(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Badge"><Input type="text" value={slide.badge} onChange={(e) => updateHeroSlide(i, "badge", e.target.value)} /></Field>
                      <Field label="Title"><Input type="text" value={slide.title} onChange={(e) => updateHeroSlide(i, "title", e.target.value)} /></Field>
                      <Field label="Title Highlight"><Input type="text" value={slide.titleHighlight} onChange={(e) => updateHeroSlide(i, "titleHighlight", e.target.value)} /></Field>
                      <Field label="Subtitle"><Input type="text" value={slide.subtitle} onChange={(e) => updateHeroSlide(i, "subtitle", e.target.value)} /></Field>
                      <div className="sm:col-span-2">
                        <Field label="Description">
                          <textarea value={slide.description} onChange={(e) => updateHeroSlide(i, "description", e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Features (comma separated)">
                          <Input type="text" value={slide.features.join(", ")} onChange={(e) => updateHeroSlide(i, "features", e.target.value)} />
                        </Field>
                      </div>
                      <Field label="CTA Text"><Input type="text" value={slide.ctaText} onChange={(e) => updateHeroSlide(i, "ctaText", e.target.value)} /></Field>
                      <Field label="CTA Link"><Input type="text" value={slide.ctaLink} onChange={(e) => updateHeroSlide(i, "ctaLink", e.target.value)} /></Field>
                      <Field label="Secondary CTA Text"><Input type="text" value={slide.ctaSecondaryText} onChange={(e) => updateHeroSlide(i, "ctaSecondaryText", e.target.value)} /></Field>
                      <Field label="Secondary CTA Link"><Input type="text" value={slide.ctaSecondaryLink} onChange={(e) => updateHeroSlide(i, "ctaSecondaryLink", e.target.value)} /></Field>
                      <div className="sm:col-span-2">
                        <Field label="Gradient">
                          <select value={slide.gradient} onChange={(e) => updateHeroSlide(i, "gradient", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                            {gradientOptions.map((g) => (
                              <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "stats" && (
        <Card>
          <CardHeader>
            <CardTitle>Stats Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SectionFields section={homepage.stats.section} onChange={(s) => onChange({ ...homepage, stats: { ...homepage.stats, section: s } })} />
            <div className="border-t border-slate-100 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Statistics ({homepage.stats.items.length})</h4>
              </div>
              <div className="space-y-3">
                {homepage.stats.items.map((stat, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <Input type="number" value={Number(stat.value) || 0} onChange={(e) => updateStat(i, "value", e.target.value)} className="w-24" placeholder="Value" />
                    <Input type="text" value={stat.suffix} onChange={(e) => updateStat(i, "suffix", e.target.value)} className="w-16" placeholder="Suffix" />
                    <Input type="text" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} className="min-w-0 flex-1" placeholder="Label" />
                    <Input type="text" value={stat.icon} onChange={(e) => updateStat(i, "icon", e.target.value)} className="w-36" placeholder="Icon" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => removeStat(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Input type="number" value={newStat.value || ""} onChange={(e) => setNewStat({ ...newStat, value: Number(e.target.value) || 0 })} className="w-24" placeholder="Value" />
                <Input type="text" value={newStat.suffix} onChange={(e) => setNewStat({ ...newStat, suffix: e.target.value })} className="w-16" placeholder="Suffix" />
                <Input type="text" value={newStat.label} onChange={(e) => setNewStat({ ...newStat, label: e.target.value })} className="min-w-0 flex-1" placeholder="Label" />
                <Input type="text" value={newStat.icon} onChange={(e) => setNewStat({ ...newStat, icon: e.target.value })} className="w-36" placeholder="Icon" />
                <Button onClick={addStat}><Plus className="h-4 w-4" /> Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "solutions" && (
        <Card>
          <CardHeader>
            <CardTitle>Solutions Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SectionFields section={homepage.solutions.section} onChange={(s) => onChange({ ...homepage, solutions: { ...homepage.solutions, section: s } })} />
            <div className="border-t border-slate-100 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Solutions ({homepage.solutions.items.length})</h4>
              </div>
              <div className="space-y-4">
                {homepage.solutions.items.map((service, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{i + 1}. {service.title || "Untitled"}</p>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => removeService(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Title"><Input type="text" value={service.title} onChange={(e) => updateService(i, "title", e.target.value)} /></Field>
                      <Field label="Icon"><Input type="text" value={service.icon} onChange={(e) => updateService(i, "icon", e.target.value)} /></Field>
                      <div className="sm:col-span-2">
                        <Field label="Description">
                          <textarea value={service.description} onChange={(e) => updateService(i, "description", e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Features (comma separated)">
                          <Input type="text" value={service.features.join(", ")} onChange={(e) => updateService(i, "features", e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Title"><Input type="text" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} /></Field>
                  <Field label="Icon"><Input type="text" value={newService.icon} onChange={(e) => setNewService({ ...newService, icon: e.target.value })} /></Field>
                  <div className="sm:col-span-2">
                    <Field label="Description">
                      <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Features (comma separated)"><Input type="text" value={newService.features} onChange={(e) => setNewService({ ...newService, features: e.target.value })} /></Field>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={addService}><Plus className="h-4 w-4" /> Add Solution</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "features" && (
        <Card>
          <CardHeader>
            <CardTitle>Features Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SectionFields section={homepage.features.section} onChange={(s) => onChange({ ...homepage, features: { ...homepage.features, section: s } })} />
            <div className="border-t border-slate-100 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Features ({homepage.features.items.length})</h4>
              </div>
              <div className="space-y-3">
                {homepage.features.items.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <Input type="text" value={feature.title} onChange={(e) => updateFeature(i, "title", e.target.value)} className="min-w-0 flex-1" placeholder="Title" />
                    <Input type="text" value={feature.description} onChange={(e) => updateFeature(i, "description", e.target.value)} className="min-w-0 flex-1" placeholder="Description" />
                    <Input type="text" value={feature.icon} onChange={(e) => updateFeature(i, "icon", e.target.value)} className="w-32" placeholder="Icon" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => removeFeature(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Input type="text" value={newFeature.title} onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })} className="min-w-0 flex-1" placeholder="Title" />
                <Input type="text" value={newFeature.description} onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })} className="min-w-0 flex-1" placeholder="Description" />
                <Input type="text" value={newFeature.icon} onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })} className="w-32" placeholder="Icon" />
                <Button onClick={addFeature}><Plus className="h-4 w-4" /> Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "franchises" && (
        <Card>
          <CardHeader>
            <CardTitle>Franchises Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SectionFields section={homepage.franchises.section} onChange={(s) => onChange({ ...homepage, franchises: { ...homepage.franchises, section: s } })} />
            <div className="border-t border-slate-100 pt-4">
              <Field label="Description">
                <textarea value={homepage.franchises.description} onChange={(e) => onChange({ ...homepage, franchises: { ...homepage.franchises, description: e.target.value } })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "about" && (
        <Card>
          <CardHeader>
            <CardTitle>About Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SectionFields section={homepage.about.section} onChange={(s) => onChange({ ...homepage, about: { ...homepage.about, section: s } })} />
            <div className="border-t border-slate-100 pt-4">
              <Field label="Description">
                <textarea value={homepage.about.description} onChange={(e) => onChange({ ...homepage, about: { ...homepage.about, description: e.target.value } })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              </Field>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Features ({homepage.about.items.length})</h4>
              </div>
              <div className="space-y-3">
                {homepage.about.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <Input type="text" value={item.title} onChange={(e) => updateAboutItem(i, "title", e.target.value)} className="min-w-0 flex-1" placeholder="Title" />
                    <Input type="text" value={item.description} onChange={(e) => updateAboutItem(i, "description", e.target.value)} className="min-w-0 flex-1" placeholder="Description" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => removeAboutItem(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Input type="text" value={newAboutItem.title} onChange={(e) => setNewAboutItem({ ...newAboutItem, title: e.target.value })} className="min-w-0 flex-1" placeholder="Title" />
                <Input type="text" value={newAboutItem.description} onChange={(e) => setNewAboutItem({ ...newAboutItem, description: e.target.value })} className="min-w-0 flex-1" placeholder="Description" />
                <Button onClick={addAboutItem}><Plus className="h-4 w-4" /> Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "contact" && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SectionFields section={homepage.contact.section} onChange={(s) => onChange({ ...homepage, contact: { ...homepage.contact, section: s } })} />
            <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <Field label="Email"><Input type="text" value={homepage.contact.email} onChange={(e) => onChange({ ...homepage, contact: { ...homepage.contact, email: e.target.value } })} /></Field>
              <Field label="Phone"><Input type="text" value={homepage.contact.phone} onChange={(e) => onChange({ ...homepage, contact: { ...homepage.contact, phone: e.target.value } })} /></Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <textarea value={homepage.contact.address} onChange={(e) => onChange({ ...homepage, contact: { ...homepage.contact, address: e.target.value } })} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "cta" && (
        <Card>
          <CardHeader>
            <CardTitle>CTA Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Title"><Input type="text" value={homepage.cta.title} onChange={(e) => onChange({ ...homepage, cta: { ...homepage.cta, title: e.target.value } })} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea value={homepage.cta.description} onChange={(e) => onChange({ ...homepage, cta: { ...homepage.cta, description: e.target.value } })} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                </Field>
              </div>
              <Field label="Primary Button Text"><Input type="text" value={homepage.cta.primaryText} onChange={(e) => onChange({ ...homepage, cta: { ...homepage.cta, primaryText: e.target.value } })} /></Field>
              <Field label="Primary Button Link"><Input type="text" value={homepage.cta.primaryLink} onChange={(e) => onChange({ ...homepage, cta: { ...homepage.cta, primaryLink: e.target.value } })} /></Field>
              <Field label="Secondary Button Text"><Input type="text" value={homepage.cta.secondaryText} onChange={(e) => onChange({ ...homepage, cta: { ...homepage.cta, secondaryText: e.target.value } })} /></Field>
              <Field label="Secondary Button Link"><Input type="text" value={homepage.cta.secondaryLink} onChange={(e) => onChange({ ...homepage, cta: { ...homepage.cta, secondaryLink: e.target.value } })} /></Field>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useData();
  const [form, setForm] = useState<Settings>(settings);
  const [activeTab, setActiveTab] = useState("General");
  const [saved, setSaved] = useState(false);

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const setLogoField = (field: "logo" | "headerLogo" | "footerLogo" | "favicon", value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your portfolio company information"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]}
        actions={
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" /> {saved ? "Saving..." : "Save Settings"}
          </Button>
        }
      />

      {saved && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" /> Settings saved successfully
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button key={t} variant={activeTab === t ? "primary" : "outline"} onClick={() => setActiveTab(t)}>
            {t}
          </Button>
        ))}
      </div>

      {activeTab === "General" && <GeneralTab form={form} setField={setField} />}
      {activeTab === "Logo" && <LogoTab form={form} setLogoField={setLogoField} />}
      {activeTab === "Header" && <HeaderTab header={form.header} onChange={(h) => setForm((f) => ({ ...f, header: h }))} />}
      {activeTab === "Footer" && <FooterTab footer={form.footer} onChange={(f) => setForm((prev) => ({ ...prev, footer: f }))} />}
      {activeTab === "Homepage" && <HomepageTab homepage={form.homepage} onChange={(h) => setForm((f) => ({ ...f, homepage: h }))} />}
    </>
  );
}