"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, type LucideIcon } from "lucide-react";

export interface UserMenuLink {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  danger?: boolean;
  unread?: number;
}

interface UserMenuProps {
  name: string;
  id: string;
  links: UserMenuLink[];
}

export default function UserMenu({ name, id, links }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const initials = (name || "U").split(" ").slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-gray-100"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white shadow-sm">
          {initials}
        </span>
        <span className="hidden text-left md:block">
          <span className="block max-w-[160px] truncate text-sm font-bold text-slate-900">{name}</span>
          <span className="block max-w-[160px] truncate text-[11px] text-slate-500">{id}</span>
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3 md:hidden">
            <p className="truncate text-sm font-bold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">{id}</p>
          </div>
          {links.map((link, i) => (
            <div key={link.label}>
              {link.href ? (
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    link.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <link.icon size={16} className={link.danger ? "text-red-500" : "text-slate-400"} />
                  <span className="flex-1">{link.label}</span>
                  {!!link.unread && link.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {link.unread}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    link.onClick?.();
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    i === links.length - 1 ? "border-t border-slate-100" : ""
                  } ${link.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <link.icon size={16} className={link.danger ? "text-red-500" : "text-slate-400"} />
                  {link.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}