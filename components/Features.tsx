"use client";

import {
  Check,
  Building,
  MapPin,
  Smartphone,
  CreditCard,
  Wallet,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Building,
    title: "Multi-Franchise SaaS",
    description: "Manage multiple franchises from a single centralized platform.",
  },
  {
    icon: MapPin,
    title: "GPS Attendance",
    description: "Real-time GPS-based attendance tracking for field staff.",
  },
  {
    icon: Smartphone,
    title: "Device Tracking",
    description: "Complete IMEI-based device tracking and management system.",
  },
  {
    icon: CreditCard,
    title: "Smart Payroll",
    description: "Automated payroll processing with attendance integration.",
  },
  {
    icon: Wallet,
    title: "Wallet System",
    description: "Digital wallet for franchise operations and transactions.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Reports",
    description: "Live analytics and comprehensive business intelligence reports.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 bg-brand-navy overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-brand-gold text-sm font-medium mb-4">
            <Check size={14} />
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Powerful <span className="text-gradient">Features</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything you need to manage your telecom distribution business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group glass-card rounded-2xl p-8 border border-white/5 hover:border-brand-gold/20 transition-all duration-500 hover:transform hover:scale-105"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-6 group-hover:bg-brand-gold/20 transition-all duration-300 group-hover:scale-110">
                <feature.icon size={24} />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-brand-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Learn more</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
