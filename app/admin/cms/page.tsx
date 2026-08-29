"use client";

import { useState, useRef } from "react";
import { Globe, FileText, ImageIcon, Edit, Plus, Trash2, X, Save, Link2, ExternalLink, Loader2 } from "lucide-react";
import { uploadFile, deleteRemoteFile } from "@/lib/r2Client";
import { useData } from "@/lib/DataContext";
import type { CMSPage } from "@/lib/DataContext";

export default function CMSManager() {
  const { cmsPages, addCMSPage, updateCMSPage, deleteCMSPage } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CMSPage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewPage, setViewPage] = useState<CMSPage | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Website CMS</h1>
          <p className="text-gray-500 text-sm mt-1">Manage website content and pages</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> Add Page
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cmsPages.map((p) => (
          <div key={p.title} className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText size={18} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setViewPage(p)} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-gray-100 rounded-lg transition-all"><Globe size={14} /></button>
                <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-[#C8A951] hover:bg-[#C8A951]/10 rounded-lg transition-all"><Edit size={14} /></button>
                <button onClick={() => setShowDeleteConfirm(p.title)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="text-gray-900 font-bold mb-1">{p.title}</h3>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === "Published" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{p.status}</span>
              <span className="text-gray-400 text-xs">{p.updated}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-4">Media Library</h3>
        <p className="text-gray-500 text-sm mb-4">Upload and manage images, videos, PDFs, and brochures</p>
        <input ref={mediaInputRef} type="file" accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleMediaUpload} className="hidden" />
        <div onClick={() => mediaInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#C8A951]/30 transition-colors cursor-pointer">
          <ImageIcon size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{uploading ? "Uploading..." : "Drag & drop files or click to upload"}</p>
          <p className="text-gray-300 text-xs mt-1">Supports: JPG, PNG, GIF, MP4, PDF, DOCX (max 100MB)</p>
        </div>
        {media.length > 0 && (
          <div className="mt-4 space-y-2">
            {media.map((url) => (
              <div key={url} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-500 truncate flex-1 text-sm">{url.split("/").pop()}</span>
                <button onClick={() => copyMediaUrl(url)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-all">
                  <Link2 size={12} /> {copied === url ? "Copied!" : "Copy URL"}
                </button>
                <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-all">
                  <ExternalLink size={12} /> Open
                </a>
                <button onClick={() => removeMedia(url)} className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Page Modal */}
      {viewPage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewPage(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">{viewPage.title}</h3>
              <button onClick={() => setViewPage(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-2">Status: <span className={`font-medium ${viewPage.status === "Published" ? "text-green-700" : "text-yellow-700"}`}>{viewPage.status}</span> | Last updated: {viewPage.updated}</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-gray-700 text-sm leading-relaxed">{viewPage.content}</div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-900 font-bold">{editing ? "Edit Page" : "Add Page"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Page Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50">
                  <option>Published</option><option>Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Content</label>
                <textarea rows={6} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0A2647] text-white text-sm font-medium rounded-xl hover:bg-[#144272] transition-all inline-flex items-center justify-center gap-2"><Save size={14} /> {editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-gray-900 font-bold mb-2">Delete Page?</h3>
            <p className="text-gray-500 text-sm mb-6">Page <span className="font-medium">{showDeleteConfirm}</span> will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
