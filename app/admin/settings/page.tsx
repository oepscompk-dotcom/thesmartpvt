"use client";

import { useState, useRef } from "react";
import { Save, Upload, CheckCircle, Trash2, Plus, Eye, EyeOff, X } from "lucide-react";
import { useData, Settings, HeaderNavLink, FooterLinkColumn, FooterBottomLink } from "@/lib/DataContext";
import { uploadFile, deleteRemoteFile } from "@/lib/r2Client";

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
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-gray-900 font-bold mb-1">{label}</h3>
      <p className="text-gray-400 text-xs mb-4">{sublabel}</p>
      <input ref={fileInputRef} type="file" accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg" onChange={handleUpload} className="hidden" />
      <div className="flex items-center gap-4 mb-4">
        {localPreview ? (
          <img src={localPreview} alt={label} className="w-20 h-20 rounded-2xl object-cover border border-gray-200 bg-gray-50" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Upload size={24} className="text-gray-400" />
          </div>
        )}
        <div>
          <p className="text-gray-900 text-sm font-medium">{localPreview ? "Uploaded" : "No image"}</p>
          <p className="text-gray-400 text-xs">512x512px recommended, Max 5MB</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all">
          <Upload size={14} /> {localPreview ? "Change" : "Upload"}
        </button>
        {localPreview && (
          <button onClick={remove} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl hover:bg-red-100 transition-all">
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

function GeneralTab({ form, setField }: { form: Settings; setField: (field: string, value: string) => void }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Company Information</h3>
        <div className="space-y-4">
          {[
            { label: "Company Name", field: "companyName" },
            { label: "Email", field: "email" },
            { label: "Phone", field: "phone" },
            { label: "Address", field: "address" },
          ].map((f) => (
            <div key={f.field}>
              <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input type="text" value={form[f.field as keyof Settings] as string} onChange={(e) => setField(f.field, e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">API Configuration</h3>
        <div className="space-y-4">
          {[
            { label: "SMS API Key", field: "smsApiKey" },
            { label: "WhatsApp API Key", field: "whatsappApiKey" },
            { label: "Payment Gateway Key", field: "paymentGatewayKey" },
          ].map((f) => (
            <div key={f.field}>
              <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input type="password" value={form[f.field as keyof Settings] as string} onChange={(e) => setField(f.field, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}`} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Admin Profile</h3>
        <div className="space-y-4">
          {[
            { label: "Name", field: "adminName" },
            { label: "Email", field: "adminEmail" },
            { label: "Mobile", field: "adminMobile" },
          ].map((f) => (
            <div key={f.field}>
              <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input type="text" value={form[f.field as keyof Settings] as string} onChange={(e) => setField(f.field, e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogoTab({ form, setLogoField }: { form: Settings; setLogoField: (field: "logo" | "headerLogo" | "footerLogo" | "favicon", value: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <LogoUploader label="Main Logo" sublabel="Used in admin dashboard sidebar & login pages" preview={form.logo} onChange={(v) => setLogoField("logo", v)} onRemove={() => setLogoField("logo", "")} />
        <LogoUploader label="Header Logo" sublabel="Used in website header navigation bar" preview={form.headerLogo} onChange={(v) => setLogoField("headerLogo", v)} onRemove={() => setLogoField("headerLogo", "")} />
        <LogoUploader label="Footer Logo" sublabel="Used in website footer before copyright" preview={form.footerLogo} onChange={(v) => setLogoField("footerLogo", v)} onRemove={() => setLogoField("footerLogo", "")} />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
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
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Navigation Links</h3>
        <div className="space-y-3">
          {header.navLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <input type="text" value={link.name} onChange={(e) => updateLink(i, "name", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" placeholder="Name" />
              <input type="text" value={link.href} onChange={(e) => updateLink(i, "href", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" placeholder="Link" />
              <button onClick={() => updateLink(i, "visible", !link.visible)} className={`p-2 rounded-lg transition-all ${link.visible ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"}`}>
                {link.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => removeLink(i)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <input type="text" value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)} placeholder="Link name" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          <input type="text" value={newLinkHref} onChange={(e) => setNewLinkHref(e.target.value)} placeholder="#section" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          <button onClick={addLink} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-bold mb-4">Tagline</h3>
          <input type="text" value={header.tagline} onChange={(e) => onChange({ ...header, tagline: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
          <p className="text-gray-400 text-xs mt-2">Displayed below the company name in header</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 font-bold mb-4">CTA Button</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Button Text</label>
              <input type="text" value={header.ctaText} onChange={(e) => onChange({ ...header, ctaText: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
            </div>
            <div>
              <label className="block text-gray-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Button Link</label>
              <input type="text" value={header.ctaLink} onChange={(e) => onChange({ ...header, ctaLink: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
            </div>
            <button onClick={() => onChange({ ...header, ctaVisible: !header.ctaVisible })} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${header.ctaVisible ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
              {header.ctaVisible ? <Eye size={14} /> : <EyeOff size={14} />} {header.ctaVisible ? "Visible" : "Hidden"}
            </button>
          </div>
        </div>
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
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Footer Description</h3>
        <textarea value={footer.description} onChange={(e) => onChange({ ...footer, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all resize-none" />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Features List</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {footer.features.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200">
              {f}
              <button onClick={() => removeFeature(i)} className="text-blue-400 hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFeature()} placeholder="New feature..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          <button onClick={addFeature} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Link Columns</h3>
        <div className="space-y-4">
          {footer.linkColumns.map((col, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <input type="text" value={col.title} onChange={(e) => updateColumn(i, "title", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-medium focus:outline-none focus:border-[#0A2647]/50" placeholder="Column title" />
                <button onClick={() => removeColumn(i)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"><Trash2 size={14} /></button>
              </div>
              <textarea value={col.links.join(", ")} onChange={(e) => updateColumn(i, "links", e.target.value.split(",").map((l) => l.trim()).filter(Boolean))} rows={2} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50 resize-none" placeholder="Links (comma separated)" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <input type="text" value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} placeholder="Column title" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          <input type="text" value={newColLinks} onChange={(e) => setNewColLinks(e.target.value)} placeholder="Links (comma separated)" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          <button onClick={addColumn} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Center Logo Box</h3>
        <p className="text-gray-400 text-xs mb-4">Upload a custom image for the footer center logo box. Supports JPG, PNG, SVG formats. Max 5MB.</p>
        <input ref={centerLogoRef} type="file" accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg" className="hidden" onChange={handleCenterLogoUpload} />

        <div className="flex items-center gap-4 mb-4">
          {centerLogoPreview ? (
            <img src={centerLogoPreview} alt="Center Logo" className="w-24 h-24 rounded-2xl object-contain border border-gray-200 bg-gray-50" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Upload size={28} className="text-gray-400" />
            </div>
          )}
          <div>
            <p className="text-gray-900 text-sm font-medium">{centerLogoPreview ? "Custom image uploaded" : "Using default logo"}</p>
            <p className="text-gray-400 text-xs">Recommended: 200x200px or larger, transparent PNG/SVG works best</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => centerLogoRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all">
            <Upload size={14} /> {centerLogoPreview ? "Change Image" : "Upload Image"}
          </button>
          {centerLogoPreview && (
            <button onClick={removeCenterLogo} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl hover:bg-red-100 transition-all">
              <Trash2 size={14} /> Remove
            </button>
          )}
          <button onClick={() => onChange({ ...footer, showCenterLogo: !footer.showCenterLogo })} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${footer.showCenterLogo ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
            {footer.showCenterLogo ? <Eye size={14} /> : <EyeOff size={14} />} {footer.showCenterLogo ? "Visible" : "Hidden"}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Logo Size</label>
          <div className="flex items-center gap-4">
            <input type="range" min="24" max="200" value={footer.centerLogoSize || "48"} onChange={(e) => onChange({ ...footer, centerLogoSize: e.target.value })} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0A2647]" />
            <span className="text-gray-900 text-sm font-medium w-16 text-right">{footer.centerLogoSize || "48"}px</span>
          </div>
          <p className="text-gray-400 text-xs mt-2">Adjust the height of the center logo image</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Copyright Text</h3>
        <input type="text" value={footer.copyrightText} onChange={(e) => onChange({ ...footer, copyrightText: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 focus:ring-2 focus:ring-[#0A2647]/10 transition-all" />
        <p className="text-gray-400 text-xs mt-2">Company name is shown automatically before this text</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Bottom Links</h3>
        <div className="space-y-3 mb-4">
          {footer.bottomLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <input type="text" value={link.text} onChange={(e) => {
                const links = [...footer.bottomLinks];
                links[i] = { ...links[i], text: e.target.value };
                onChange({ ...footer, bottomLinks: links });
              }} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" placeholder="Text" />
              <input type="text" value={link.href} onChange={(e) => {
                const links = [...footer.bottomLinks];
                links[i] = { ...links[i], href: e.target.value };
                onChange({ ...footer, bottomLinks: links });
              }} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" placeholder="Link" />
              <button onClick={() => removeBottomLink(i)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"><X size={16} /></button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="text" value={newBottomText} onChange={(e) => setNewBottomText(e.target.value)} placeholder="Link text" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          <input type="text" value={newBottomHref} onChange={(e) => setNewBottomHref(e.target.value)} placeholder="#" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          <button onClick={addBottomLink} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function HomepageTab({ homepage, onChange }: { homepage: Settings["homepage"]; onChange: (h: Settings["homepage"]) => void }) {
  const [activeSection, setActiveSection] = useState("hero");
  const sectionTabs = ["hero", "stats", "solutions", "features", "franchises", "about", "contact", "cta"];

  const updateHeroSlide = (index: number, field: string, value: any) => {
    const slides = [...homepage.hero.slides];
    slides[index] = { ...slides[index], [field]: value };
    onChange({ ...homepage, hero: { ...homepage.hero, slides } });
  };

  const addHeroSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      badge: "New Slide",
      title: "NEW",
      titleHighlight: "SLIDE",
      subtitle: "Subtitle here",
      description: "Description here",
      features: ["Feature 1", "Feature 2"],
      ctaText: "Get Started",
      ctaLink: "#",
      ctaSecondaryText: "Learn More",
      ctaSecondaryLink: "#",
      gradient: "from-[#0A2647] via-[#144272] to-[#0A2647]",
    };
    onChange({ ...homepage, hero: { ...homepage.hero, slides: [...homepage.hero.slides, newSlide] } });
  };

  const removeHeroSlide = (index: number) => {
    onChange({ ...homepage, hero: { ...homepage.hero, slides: homepage.hero.slides.filter((_, i) => i !== index) } });
  };

  const updateStat = (index: number, field: string, value: any) => {
    const items = [...homepage.stats.items];
    items[index] = { ...items[index], [field]: value };
    onChange({ ...homepage, stats: { ...homepage.stats, items } });
  };

  const addStat = () => {
    onChange({ ...homepage, stats: { ...homepage.stats, items: [...homepage.stats.items, { value: 0, suffix: "+", label: "New Stat", icon: "star" }] } });
  };

  const removeStat = (index: number) => {
    onChange({ ...homepage, stats: { ...homepage.stats, items: homepage.stats.items.filter((_, i) => i !== index) } });
  };

  const updateService = (index: number, field: string, value: any) => {
    const items = [...homepage.solutions.items];
    items[index] = { ...items[index], [field]: value };
    onChange({ ...homepage, solutions: { ...homepage.solutions, items } });
  };

  const addService = () => {
    onChange({ ...homepage, solutions: { ...homepage.solutions, items: [...homepage.solutions.items, { title: "New Service", description: "Description", features: ["Feature 1"], icon: "star" }] } });
  };

  const removeService = (index: number) => {
    onChange({ ...homepage, solutions: { ...homepage.solutions, items: homepage.solutions.items.filter((_, i) => i !== index) } });
  };

  const updateFeature = (index: number, field: string, value: any) => {
    const items = [...homepage.features.items];
    items[index] = { ...items[index], [field]: value };
    onChange({ ...homepage, features: { ...homepage.features, items } });
  };

  const addFeature = () => {
    onChange({ ...homepage, features: { ...homepage.features, items: [...homepage.features.items, { title: "New Feature", description: "Description", icon: "star" }] } });
  };

  const removeFeature = (index: number) => {
    onChange({ ...homepage, features: { ...homepage.features, items: homepage.features.items.filter((_, i) => i !== index) } });
  };

  const iconOptions = ["smartphone", "arrow-left-right", "cpu", "users", "package", "calculator", "building", "map-pin", "credit-card", "wallet", "bar-chart", "monitor"];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-1.5">
        <div className="flex gap-1 flex-wrap">
          {sectionTabs.map((s) => (
            <button key={s} onClick={() => setActiveSection(s)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all capitalize ${activeSection === s ? "bg-[#0A2647] text-white shadow-md" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "hero" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Hero Slides ({homepage.hero.slides.length})</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={homepage.hero.autoPlay} onChange={(e) => onChange({ ...homepage, hero: { ...homepage.hero, autoPlay: e.target.checked } })} className="rounded border-gray-300" />
                Auto Play
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Interval:</label>
                <input type="number" value={homepage.hero.interval} onChange={(e) => onChange({ ...homepage, hero: { ...homepage.hero, interval: Number(e.target.value) } })} className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" min={2000} step={1000} />
                <span className="text-gray-400 text-xs">ms</span>
              </div>
            </div>
          </div>

          {homepage.hero.slides.map((slide, i) => (
            <div key={slide.id} className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">Slide {i + 1}</h4>
                <button onClick={() => removeHeroSlide(i)} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100">Remove</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Badge", field: "badge" },
                  { label: "Title", field: "title" },
                  { label: "Title Highlight", field: "titleHighlight" },
                  { label: "Subtitle", field: "subtitle" },
                ].map((f) => (
                  <div key={f.field}>
                    <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f.label}</label>
                    <input type="text" value={(slide as any)[f.field]} onChange={(e) => updateHeroSlide(i, f.field, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">Description</label>
                  <textarea value={slide.description} onChange={(e) => updateHeroSlide(i, "description", e.target.value)} rows={2} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">Features (comma separated)</label>
                  <input type="text" value={slide.features.join(", ")} onChange={(e) => updateHeroSlide(i, "features", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                </div>
                {[
                  { label: "CTA Text", field: "ctaText" },
                  { label: "CTA Link", field: "ctaLink" },
                  { label: "Secondary Text", field: "ctaSecondaryText" },
                  { label: "Secondary Link", field: "ctaSecondaryLink" },
                ].map((f) => (
                  <div key={f.field}>
                    <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f.label}</label>
                    <input type="text" value={(slide as any)[f.field]} onChange={(e) => updateHeroSlide(i, f.field, e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">Gradient</label>
                  <select value={slide.gradient} onChange={(e) => updateHeroSlide(i, "gradient", e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <option value="from-[#0A2647] via-[#144272] to-[#0A2647]">Navy Blue</option>
                    <option value="from-[#0F172A] via-[#1E3A5F] to-[#0F172A]">Dark Blue</option>
                    <option value="from-[#0A1628] via-[#1A365D] to-[#0A1628]">Deep Navy</option>
                    <option value="from-[#0D1B2A] via-[#1B2838] to-[#0D1B2A]">Midnight</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addHeroSlide} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-brand-navy hover:text-brand-navy transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Add Hero Slide
          </button>
        </div>
      )}

      {activeSection === "stats" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Stats Section Header</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {["badge", "title", "titleHighlight", "description"].map((f) => (
                <div key={f} className={f === "description" ? "md:col-span-3" : ""}>
                  <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f}</label>
                  <input type="text" value={(homepage.stats.section as any)[f]} onChange={(e) => onChange({ ...homepage, stats: { ...homepage.stats, section: { ...homepage.stats.section, [f]: e.target.value } } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Stats Items</h3>
              <button onClick={addStat} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272]"><Plus size={14} /> Add</button>
            </div>
            <div className="space-y-3">
              {homepage.stats.items.map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input type="number" value={stat.value} onChange={(e) => updateStat(i, "value", Number(e.target.value))} className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Value" />
                  <input type="text" value={stat.suffix} onChange={(e) => updateStat(i, "suffix", e.target.value)} className="w-16 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Suffix" />
                  <input type="text" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Label" />
                  <select value={stat.icon} onChange={(e) => updateStat(i, "icon", e.target.value)} className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                    {iconOptions.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <button onClick={() => removeStat(i)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "solutions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Solutions Section Header</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {["badge", "title", "titleHighlight", "description"].map((f) => (
                <div key={f} className={f === "description" ? "md:col-span-3" : ""}>
                  <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f}</label>
                  <input type="text" value={(homepage.solutions.section as any)[f]} onChange={(e) => onChange({ ...homepage, solutions: { ...homepage.solutions, section: { ...homepage.solutions.section, [f]: e.target.value } } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Services</h3>
              <button onClick={addService} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272]"><Plus size={14} /> Add</button>
            </div>
            <div className="space-y-4">
              {homepage.solutions.items.map((svc, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <input type="text" value={svc.title} onChange={(e) => updateService(i, "title", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium" placeholder="Title" />
                    <div className="flex items-center gap-2 ml-3">
                      <select value={svc.icon} onChange={(e) => updateService(i, "icon", e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                        {iconOptions.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                      <button onClick={() => removeService(i)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <textarea value={svc.description} onChange={(e) => updateService(i, "description", e.target.value)} rows={2} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none mb-3" placeholder="Description" />
                  <input type="text" value={svc.features.join(", ")} onChange={(e) => updateService(i, "features", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Features (comma separated)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "features" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Features Section Header</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {["badge", "title", "titleHighlight", "description"].map((f) => (
                <div key={f} className={f === "description" ? "md:col-span-3" : ""}>
                  <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f}</label>
                  <input type="text" value={(homepage.features.section as any)[f]} onChange={(e) => onChange({ ...homepage, features: { ...homepage.features, section: { ...homepage.features.section, [f]: e.target.value } } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Features</h3>
              <button onClick={addFeature} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272]"><Plus size={14} /> Add</button>
            </div>
            <div className="space-y-3">
              {homepage.features.items.map((feat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input type="text" value={feat.title} onChange={(e) => updateFeature(i, "title", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium" placeholder="Title" />
                  <input type="text" value={feat.description} onChange={(e) => updateFeature(i, "description", e.target.value)} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" placeholder="Description" />
                  <select value={feat.icon} onChange={(e) => updateFeature(i, "icon", e.target.value)} className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                    {iconOptions.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <button onClick={() => removeFeature(i)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "franchises" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Franchises Section</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {["badge", "title", "titleHighlight", "description"].map((f) => (
              <div key={f} className={f === "description" ? "md:col-span-3" : ""}>
                <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f}</label>
                <input type="text" value={(homepage.franchises.section as any)[f]} onChange={(e) => onChange({ ...homepage, franchises: { ...homepage.franchises, section: { ...homepage.franchises.section, [f]: e.target.value } } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "about" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">About Section</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {["badge", "title", "titleHighlight", "description"].map((f) => (
                <div key={f} className={f === "description" ? "md:col-span-3" : ""}>
                  <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f}</label>
                  <input type="text" value={(homepage.about.section as any)[f]} onChange={(e) => onChange({ ...homepage, about: { ...homepage.about, section: { ...homepage.about.section, [f]: e.target.value } } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">About Description</label>
              <textarea value={homepage.about.description} onChange={(e) => onChange({ ...homepage, about: { ...homepage.about, description: e.target.value } })} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">About Items</h3>
            <div className="space-y-3">
              {homepage.about.items.map((item, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input type="text" value={item.title} onChange={(e) => {
                    const items = [...homepage.about.items]; items[i] = { ...items[i], title: e.target.value };
                    onChange({ ...homepage, about: { ...homepage.about, items } });
                  }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium mb-2" placeholder="Title" />
                  <textarea value={item.description} onChange={(e) => {
                    const items = [...homepage.about.items]; items[i] = { ...items[i], description: e.target.value };
                    onChange({ ...homepage, about: { ...homepage.about, items } });
                  }} rows={2} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none" placeholder="Description" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "contact" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Contact Section</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {["badge", "title", "titleHighlight", "description"].map((f) => (
              <div key={f} className={f === "description" ? "md:col-span-3" : ""}>
                <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f}</label>
                <input type="text" value={(homepage.contact.section as any)[f]} onChange={(e) => onChange({ ...homepage, contact: { ...homepage.contact, section: { ...homepage.contact.section, [f]: e.target.value } } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Email", field: "email" },
              { label: "Phone", field: "phone" },
              { label: "Address", field: "address" },
            ].map((f) => (
              <div key={f.field}>
                <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f.label}</label>
                <input type="text" value={(homepage.contact as any)[f.field]} onChange={(e) => onChange({ ...homepage, contact: { ...homepage.contact, [f.field]: e.target.value } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "cta" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Call to Action</h3>
          <div className="space-y-4">
            {[
              { label: "Title", field: "title" },
              { label: "Description", field: "description" },
              { label: "Primary Button Text", field: "primaryText" },
              { label: "Primary Button Link", field: "primaryLink" },
              { label: "Secondary Button Text", field: "secondaryText" },
              { label: "Secondary Button Link", field: "secondaryLink" },
            ].map((f) => (
              <div key={f.field}>
                <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">{f.label}</label>
                <input type="text" value={(homepage.cta as any)[f.field]} onChange={(e) => onChange({ ...homepage, cta: { ...homepage.cta, [f.field]: e.target.value } })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useData();
  const [form, setForm] = useState<Settings>({ ...settings });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("General");

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const setLogoField = (field: "logo" | "headerLogo" | "footerLogo" | "favicon", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleHeaderChange = (header: Settings["header"]) => {
    setForm((prev) => ({ ...prev, header }));
    setSaved(false);
  };

  const handleFooterChange = (footer: Settings["footer"]) => {
    setForm((prev) => ({ ...prev, footer }));
    setSaved(false);
  };

  const handleHomepageChange = (homepage: Settings["homepage"]) => {
    setForm((prev) => ({ ...prev, homepage }));
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">System Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure system-wide settings</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-xl border border-green-200">
              <CheckCircle size={14} /> Settings saved successfully!
            </div>
          )}
          <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-1.5">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === tab ? "bg-[#0A2647] text-white shadow-md" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "General" && <GeneralTab form={form} setField={setField} />}
      {activeTab === "Logo" && <LogoTab form={form} setLogoField={setLogoField} />}
      {activeTab === "Header" && <HeaderTab header={form.header} onChange={handleHeaderChange} />}
      {activeTab === "Footer" && <FooterTab footer={form.footer} onChange={handleFooterChange} />}
      {activeTab === "Homepage" && <HomepageTab homepage={form.homepage} onChange={handleHomepageChange} />}
    </div>
  );
}
