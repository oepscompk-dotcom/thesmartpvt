"use client";

import {
  Activity,
  ArrowRightLeft,
  Users,
  TrendingUp,
  IndianRupee,
  Package,
} from "lucide-react";

const dashboardCards = [
  {
    icon: Activity,
    title: "Today's Activations",
    value: "342",
    change: "+18%",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: ArrowRightLeft,
    title: "MNP Requests",
    value: "87",
    change: "+12%",
    color: "text-brand-sky",
    bg: "bg-brand-sky/10",
  },
  {
    icon: Users,
    title: "Attendance",
    value: "94.2%",
    change: "Active",
    color: "text-brand-gold",
    bg: "bg-brand-gold/10",
  },
  {
    icon: TrendingUp,
    title: "Revenue",
    value: "PKR 2.4M",
    change: "+15.3%",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: IndianRupee,
    title: "Collections",
    value: "PKR 1.8M",
    change: "+9.7%",
    color: "text-brand-sky",
    bg: "bg-brand-sky/10",
  },
  {
    icon: Package,
    title: "Inventory",
    value: "12,450",
    change: "In Stock",
    color: "text-brand-gold",
    bg: "bg-brand-gold/10",
  },
];

export default function DashboardPreview() {
  return (
    <section className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            <Activity size={14} />
            Dashboard
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            Real-Time <span className="text-brand-gold">Analytics</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Monitor your entire telecom operations from a single dashboard
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {dashboardCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}
                >
                  <card.icon size={18} />
                </div>
                <span className="text-gray-500 text-xs sm:text-sm font-medium">
                  {card.title}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl sm:text-3xl font-black text-brand-navy">
                  {card.value}
                </span>
                <span className={`text-xs font-medium ${card.color}`}>
                  {card.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-brand-navy">
                Activations Overview
              </h3>
              <span className="text-gray-400 text-sm">Last 12 months</span>
            </div>
            <div className="flex items-end gap-3 h-48">
              {[35, 55, 40, 70, 45, 85, 60, 75, 50, 90, 65, 80].map(
                (h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg transition-all duration-700 hover:opacity-80"
                      style={{
                        height: `${h}%`,
                        background:
                          i === 10
                            ? "linear-gradient(to top, #0A2647, #205295)"
                            : i === 11
                            ? "linear-gradient(to top, #FFFB63, #FDE408)"
                            : "linear-gradient(to top, #144272, #205295)",
                      }}
                    />
                  </div>
                )
              )}
            </div>
            <div className="flex justify-between mt-3">
              {[
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
              ].map((m) => (
                <span key={m} className="text-gray-400 text-[10px] sm:text-xs">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-brand-navy">
                Revenue Distribution
              </h3>
              <span className="text-gray-400 text-sm">This Quarter</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0A2647"
                    strokeWidth="12"
                    strokeDasharray="100.53 150.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#FFFB63"
                    strokeWidth="12"
                    strokeDasharray="62.83 188.5"
                    strokeDashoffset="-100.53"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#4DA8DA"
                    strokeWidth="12"
                    strokeDasharray="50.27 201.06"
                    strokeDashoffset="-163.36"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-black text-brand-navy">
                      100%
                    </span>
                    <span className="block text-gray-400 text-xs">
                      Total Revenue
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              {[
                { label: "SIM Sales", color: "bg-brand-navy", pct: "40%" },
                { label: "Devices", color: "bg-brand-gold", pct: "25%" },
                { label: "MNP", color: "bg-brand-sky", pct: "20%" },
                { label: "Other", color: "bg-gray-200", pct: "15%" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-gray-600 text-sm">
                    {item.label} ({item.pct})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
