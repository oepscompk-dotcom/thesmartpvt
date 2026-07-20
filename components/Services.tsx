"use client";

import {
  Smartphone,
  ArrowRightLeft,
  Cpu,
  Users,
  Package,
  Calculator,
} from "lucide-react";

const services = [
  {
    icon: Smartphone,
    title: "SIM Distribution",
    description: "Enterprise-grade SIM management with real-time tracking and activation workflows.",
    features: ["Bulk Activation", "Real-time Status", "Auto Assignment"],
  },
  {
    icon: ArrowRightLeft,
    title: "MNP Services",
    description: "Seamless Mobile Number Portability across all networks with automated processing.",
    features: ["Auto Processing", "Network Integration", "Status Tracking"],
  },
  {
    icon: Cpu,
    title: "Device Management",
    description: "Complete IMEI tracking and device lifecycle management for your entire fleet.",
    features: ["IMEI Tracking", "Device Registry", "Warranty Management"],
  },
  {
    icon: Users,
    title: "Workforce Management",
    description: "GPS-enabled attendance, payroll integration, and field team monitoring.",
    features: ["GPS Attendance", "Team Monitoring", "Performance Tracking"],
  },
  {
    icon: Package,
    title: "Inventory Control",
    description: "Real-time SIM and equipment inventory tracking across all franchise locations.",
    features: ["Stock Tracking", "Auto Reorder", "Multi-location"],
  },
  {
    icon: Calculator,
    title: "Accounting",
    description: "Comprehensive financial management with automated invoicing and reporting.",
    features: ["Auto Invoicing", "Financial Reports", "Tax Compliance"],
  },
];

export default function Services() {
  return (
    <section id="solutions" className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sky/5 rounded-full blur-3xl translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            <Package size={14} />
            Our Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            Complete Telecom <span className="text-brand-gold">Solutions</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            End-to-end enterprise solutions designed for multi-franchise telecom operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-brand-gold/20 transition-all duration-500 hover:transform hover:scale-105"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-navy via-brand-sky to-brand-gold rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-navy/5 text-brand-navy mb-6 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all duration-300">
                <service.icon size={24} />
              </div>

              <h3 className="text-xl font-bold text-brand-navy mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg group-hover:bg-brand-navy/5 group-hover:text-brand-navy transition-all"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
