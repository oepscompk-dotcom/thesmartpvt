"use client";

import { useEffect, useRef, useState } from "react";
import {
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  Wifi,
} from "lucide-react";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    "SIM Distribution",
    "Device Management",
    "Workforce Management",
    "Inventory",
    "Payroll",
    "Accounting",
    "Franchise Operations",
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen bg-hero-gradient overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-brand-sky/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">
                Enterprise Telecom Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-6">
              THE SMART
              <span className="text-gradient block">ERP</span>
            </h1>

            <h2 className="text-xl sm:text-2xl text-white/90 font-semibold mb-8">
              Multi-Franchise Telecom Distribution Platform
            </h2>

            <div className="mb-8">
              <p className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">
                Manage:
              </p>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, i) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-lg text-white/90 text-sm"
                  >
                    <svg
                      className="w-4 h-4 text-brand-gold flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-brand-gold/80 text-lg font-medium mb-8 italic">
              &ldquo;Smart Distribution &bull; Smart Inventory &bull; Smart
              Finance &bull; Smart Growth&rdquo;
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#login"
                className="px-8 py-4 bg-gold-gradient text-brand-navy font-bold text-lg rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105 text-center"
              >
                Franchise Login
              </a>
              <a
                href="#demo"
                className="px-8 py-4 border-2 border-brand-gold/40 text-white font-bold text-lg rounded-xl hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300 text-center"
              >
                Request Demo
              </a>
            </div>
          </div>

          {/* Right - Dashboard Preview */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="glass-card rounded-2xl p-6 sm:p-8 relative">
              <div className="absolute -top-3 -right-3 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">
                  Dashboard Overview
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-white/60 text-xs">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  {
                    icon: Activity,
                    label: "Total Activations",
                    value: "1,247",
                    change: "+12.5%",
                    color: "text-green-400",
                  },
                  {
                    icon: Users,
                    label: "Active Franchises",
                    value: "120+",
                    change: "+8.2%",
                    color: "text-brand-sky",
                  },
                  {
                    icon: BarChart3,
                    label: "Today's Attendance",
                    value: "847",
                    change: "94.2%",
                    color: "text-brand-gold",
                  },
                  {
                    icon: TrendingUp,
                    label: "Revenue",
                    value: "PKR 2.4M",
                    change: "+15.3%",
                    color: "text-green-400",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 rounded-xl p-4 border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon size={16} className={stat.color} />
                      <span className="text-white/50 text-xs">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-white font-bold text-xl">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Chart Mock */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60 text-sm">Revenue Trend</span>
                  <span className="text-brand-gold text-xs">This Month</span>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background:
                            i === 10
                              ? "linear-gradient(to top, #FFFB63, #FDE408)"
                              : "rgba(77, 168, 218, 0.3)",
                        }}
                      />
                    )
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                    <span key={m} className="text-white/30 text-[10px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute -top-4 -left-4 animate-float">
                <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                  <Shield size={14} className="text-brand-gold" />
                  <span className="text-white text-xs font-medium">Secure</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-float delay-1000">
                <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                  <Wifi size={14} className="text-green-400" />
                  <span className="text-white text-xs font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
