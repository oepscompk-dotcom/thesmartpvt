"use client";

import { useEffect, useState } from "react";
import { Wifi, Shield, Database, Activity } from "lucide-react";

interface StatusItem {
  label: string;
  status: "online" | "offline" | "syncing";
  icon: React.ReactNode;
}

export default function SystemStatus() {
  const [items, setItems] = useState<StatusItem[]>([
    { label: "API", status: "online", icon: <Wifi className="w-3 h-3" /> },
    { label: "Auth", status: "online", icon: <Shield className="w-3 h-3" /> },
    { label: "DB", status: "online", icon: <Database className="w-3 h-3" /> },
    { label: "Sync", status: "online", icon: <Activity className="w-3 h-3" /> },
  ]);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-white/50">
          <span className={`w-1.5 h-1.5 rounded-full ${
            item.status === "online" ? "bg-green-500" :
            item.status === "syncing" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
          }`} />
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
