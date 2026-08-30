"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, FileText, ImageIcon, Edit, Plus, Trash2, X, Save, Link2, ExternalLink, Loader2 } from "lucide-react";
import { uploadFile, deleteRemoteFile } from "@/lib/r2Client";
import { useData } from "@/lib/DataContext";
import type { CMSPage, HeroSlide } from "@/lib/DataContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusPill, toneForStatus } from "@/components/ui/Badge";

export default function CMSManager() {
  const { cmsPages, addCMSPage, updateCMSPage, deleteCMSPage, settings, updateSettings } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CMSPage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewPage, setViewPage] = useState<CMSPage | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(settings.homepage.hero.slides);
  const [heroAutoPlay, setHeroAutoPlay] = useState(settings.homepage.hero.autoPlay);
  const [heroInterval, setHeroInterval] = useState(settings.homepage.hero.interval);
  const [savingHero, setSavingHero] = useState(false);
  const [bannerUploading, setBannerUploading] = useState<number | null>(null);
  const slideInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setHeroSlides(settings.homepage.hero.slides);
    setHeroAutoPlay(settings.homepage.hero.autoPlay);
    setHeroInterval(settings.homepage.hero.interval);
  }, [settings.homepage.hero]);

  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: string | string[]) => {
    setHeroSlides((prev) => prev.map((s, i) => (i === index ? ({ ...s, [field]: value } as HeroSlide) : s)));
  };

  const handleHeroImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(index);
    try {
      const url = await uploadFile(file, "photos");
      if (url) {
        const next = heroSlides.map((s, i) => (i === index ? { ...s, image: url } : s));
        setHeroSlides(next);
        await persistHero(next);
      }
    } finally {
      setBannerUploading(null);
      if (slideInputRefs.current[index]) slideInputRefs.current[index].value = "";
    }
  };

  const removeHeroImage = async (index: number) => {
    const slide = heroSlides[index];
    if (slide?.image) await deleteRemoteFile(slide.image);
    const next = heroSlides.map((s, i) => (i === index ? { ...s, image: "" } : s));
    setHeroSlides(next);
    await persistHero(next);
  };

  const persistHero = async (slides: HeroSlide[]) => {
    if (!slides.length) return;
    setSavingHero(true);
    try {
      await updateSettings({
        ...settings,
        homepage: {
          ...settings.homepage,
          hero: { slides, autoPlay: heroAutoPlay, interval: heroInterval },
        },
      });
    } catch (err: any) {
      alert("Failed to save hero banners: " + (err?.message || "Unknown error"));
    } finally {
      setSavingHero(false);
    }
  };

  const saveHero = async () => {
    await persistHero(heroSlides);
  };

  const emptyForm: CMSPage = { title: "", status: "Draft", updated: new Date().toISOString().split("T")[0], content: "" };
  const [form, setForm] = useState<CMSPage>(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: CMSPage) => { setEditing(p); setForm({ ...p }); setShowForm(true); };

  const handleSave = () => {
    if (!form.title) return;
    if (editing) {
      updateCMSPage(editing.title, form);
    } else {
      addCMSPage(form);
    }
    setShowForm(false);
  };

  const handleDelete = (title: string) => {
    deleteCMSPage(title);
    setShowDeleteConfirm(null);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "media");
      if (url) setMedia((m) => [url, ...m]);
    } finally {
      setUploading(false);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
    }
  };

  const copyMediaUrl = async (url: string) => {
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  const removeMedia = async (url: string) => {
    await deleteRemoteFile(url);
    setMedia((m) => m.filter((u) => u !== url));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "CMS" }]}
        title="Website CMS"
        description="Manage website content and pages"
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Page
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cmsPages.map((p) => (
          <Card key={p.title} className="group transition-all hover:border-slate-300">
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText size={18} />
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewPage(p)} title="Preview"><Globe className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(p)} title="Edit"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setShowDeleteConfirm(p.title)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <h3 className="mb-1 text-base font-semibold text-foreground">{p.title}</h3>
              <div className="flex items-center justify-between">
                <StatusPill label={p.status} tone={toneForStatus(p.status)} />
                <span className="font-mono text-xs text-muted-foreground">{p.updated}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Homepage Hero Banners */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage Hero Banners</CardTitle>
          <CardDescription>Upload transparent images (PNG recommended). They auto-fit into the homepage hero banner with no box or size restriction.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Auto Play</label>
              <Select value={String(heroAutoPlay)} onChange={(e) => setHeroAutoPlay(e.target.value === "true")}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Slide Interval (seconds)</label>
              <Input type="number" value={String(heroInterval)} onChange={(e) => setHeroInterval(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="space-y-4">
            {heroSlides.map((slide, i) => (
              <div key={slide.id} className="rounded-lg border border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">Banner {i + 1} &mdash; {slide.title || "Untitled"}</p>
                  <span className="truncate text-xs text-muted-foreground">{slide.badge}</span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                  {/* Banner preview + transparent PNG upload */}
                  <div>
                    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-lg border border-slate-200" style={{ background: "linear-gradient(118deg, #0C1026 0%, #2D28CD 55%, #00C8FF 135%)" }}>
                      {bannerUploading === i ? (
                        <Loader2 size={24} className="animate-spin text-white/70" />
                      ) : slide.image ? (
                        <img src={slide.image} alt={slide.title} className="h-full w-full object-contain p-2" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon size={24} className="mx-auto mb-1 text-white/50" />
                          <span className="text-[11px] text-white/60">No image yet</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={(el) => { slideInputRefs.current[i] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleHeroImageUpload(i, e)}
                      className="hidden"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => slideInputRefs.current[i]?.click()}>
                        {slide.image ? <ImageIcon className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {slide.image ? "Replace" : "Upload Image"}
                      </Button>
                      {slide.image && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => removeHeroImage(i)}
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Banner fields */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Badge</label>
                      <Input type="text" value={slide.badge} onChange={(e) => updateHeroSlide(i, "badge", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</label>
                      <Input type="text" value={slide.title} onChange={(e) => updateHeroSlide(i, "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title Highlight</label>
                      <Input type="text" value={slide.titleHighlight} onChange={(e) => updateHeroSlide(i, "titleHighlight", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Subtitle</label>
                      <Input type="text" value={slide.subtitle} onChange={(e) => updateHeroSlide(i, "subtitle", e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                      <textarea value={slide.description} onChange={(e) => updateHeroSlide(i, "description", e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Features (comma separated)</label>
                      <Input type="text" value={slide.features.join(", ")} onChange={(e) => updateHeroSlide(i, "features", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">CTA Text</label>
                      <Input type="text" value={slide.ctaText} onChange={(e) => updateHeroSlide(i, "ctaText", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">CTA Link</label>
                      <Input type="text" value={slide.ctaLink} onChange={(e) => updateHeroSlide(i, "ctaLink", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Secondary CTA Text</label>
                      <Input type="text" value={slide.ctaSecondaryText} onChange={(e) => updateHeroSlide(i, "ctaSecondaryText", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Secondary CTA Link</label>
                      <Input type="text" value={slide.ctaSecondaryLink} onChange={(e) => updateHeroSlide(i, "ctaSecondaryLink", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-muted-foreground">Changes apply to the live homepage hero banners.</p>
            <Button onClick={saveHero} disabled={savingHero}>
              {savingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Hero Banners
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>Upload and manage images, videos, PDFs, and brochures</CardDescription>
        </CardHeader>
        <CardContent>
          <input ref={mediaInputRef} type="file" accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleMediaUpload} className="hidden" />
          <div onClick={() => mediaInputRef.current?.click()} className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:border-brand-400">
            {uploading ? (
              <Loader2 size={32} className="mx-auto mb-3 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon size={32} className="mx-auto mb-3 text-slate-300" />
            )}
            <p className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Drag & drop files or click to upload"}</p>
            <p className="mt-1 text-xs text-slate-400">Supports: JPG, PNG, GIF, MP4, PDF, DOCX (max 100MB)</p>
          </div>
          {media.length > 0 && (
            <div className="mt-4 space-y-2">
              {media.map((url) => (
                <div key={url} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="flex-1 truncate text-sm text-muted-foreground">{url.split("/").pop()}</span>
                  <Button variant="outline" size="sm" onClick={() => copyMediaUrl(url)}>
                    <Link2 className="h-3.5 w-3.5" /> {copied === url ? "Copied!" : "Copy URL"}
                  </Button>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </Button>
                  </a>
                  <Button variant="outline" size="sm" className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => removeMedia(url)} title="Delete file"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Page Modal */}
      {viewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setViewPage(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">{viewPage.title}</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewPage(null)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-6">
              <p className="mb-2 text-sm text-muted-foreground">
                Status: <StatusPill label={viewPage.status} tone={toneForStatus(viewPage.status)} /> <span className="ml-2">Last updated: {viewPage.updated}</span>
              </p>
              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{viewPage.content}</div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">{editing ? "Edit Page" : "Add Page"}</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowForm(false)} title="Close"><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Page Title <span className="text-red-500">*</span></label>
                <Input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
                <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  <option>Published</option><option>Draft</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Content</label>
                <textarea rows={6} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} className="w-full resize-none rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30" />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}><Save className="h-4 w-4" /> {editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="mb-2 text-base font-semibold text-foreground">Delete Page?</h3>
            <p className="mb-6 text-sm text-muted-foreground">Page <span className="font-medium text-foreground">{showDeleteConfirm}</span> will be permanently removed.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(showDeleteConfirm)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}