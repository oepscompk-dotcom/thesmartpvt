"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud, FileText, ImageIcon, X, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { uploadFile } from "@/lib/r2Client";
import { isRemoteUrl } from "@/lib/r2Client";

interface FileUploadCardProps {
  label: string;
  hint?: string;
  value: string;
  folder?: string;
  accept?: string;
  onChange: (url: string) => void;
}

export default function FileUploadCard({ label, hint, value, folder = "documents", accept = "image/*,.pdf", onChange }: FileUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const isImage = value && isRemoteUrl(value) && /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i.test(value);

  const runUpload = useCallback(async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Max file size is 10MB"); return; }
    setUploading(true);
    setProgress(25);
    const url = await uploadFile(file, folder);
    if (url) {
      setProgress(100);
      onChange(url);
    }
    setUploading(false);
  }, [folder, onChange]);

  const handleFile = (file: File) => {
    if (inputRef.current) inputRef.current.value = "";
    runUpload(file);
  };

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-all ${
        dragging ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/40"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0] as File); }}
    >
      {value ? (
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white border border-slate-200 flex items-center justify-center">
              {isImage ? (
                <img src={value} alt={label} className="h-full w-full object-cover" />
              ) : (
                <FileText size={22} className="text-brand-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="flex items-center gap-1 text-xs font-medium text-green-600 mt-0.5">
                <CheckCircle size={12} /> File uploaded
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {isRemoteUrl(value) && (
                <a href={value} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  <ImageIcon size={13} /> View
                </a>
              )}
              <button type="button" onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors">
                <RefreshCw size={13} /> Replace
              </button>
              <button type="button" onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
                <X size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="block w-full text-left p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-600/10 flex items-center justify-center">
              {uploading ? <Loader2 size={18} className="animate-spin text-brand-600" /> : <UploadCloud size={18} className="text-brand-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                {uploading ? `Uploading... ${progress}%` : (hint || "Click to upload or drag & drop a file here. Supports images & PDF (max 10MB)")}
              </p>
            </div>
          </div>
        </button>
      )}

      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] as File)} />
    </div>
  );
}
