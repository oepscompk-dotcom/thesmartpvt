"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: ReactNode;
  color: string;
}

export default function StatsCard({ title, value, change, changeType = "neutral", icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
            changeType === "up" ? "text-green-600 bg-green-50" :
            changeType === "down" ? "text-red-600 bg-red-50" :
            "text-gray-500 bg-gray-50"
          }`}>
            {changeType === "up" ? "+" : ""}{change}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-gray-500 text-sm">{title}</p>
    </div>
  );
}
