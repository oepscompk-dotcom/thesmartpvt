"use client";

import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: BottomNavItem[];
  color?: string;
}

export default function BottomNav({ items, color = "#0A2647" }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="relative bg-white"
        style={{
          boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center gap-1 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ease-in-out"
                style={{
                  backgroundColor: active ? `${color}12` : "transparent",
                }}
              >
                {/* Active indicator dot */}
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: active ? "6px" : "0px",
                    height: active ? "6px" : "0px",
                    backgroundColor: active ? color : "transparent",
                    opacity: active ? 1 : 0,
                  }}
                />

                {/* Icon */}
                <span
                  className="flex items-center justify-center transition-all duration-300 ease-in-out"
                  style={{
                    color: active ? color : "#9CA3AF",
                  }}
                >
                  <item.icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.6}
                    className="transition-all duration-300 ease-in-out group-hover:scale-110"
                  />
                </span>

                {/* Label */}
                <span
                  className="text-[10px] font-medium leading-tight text-center transition-colors duration-300 ease-in-out"
                  style={{
                    color: active ? color : "#9CA3AF",
                  }}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
