"use client";

import { Building2, User, Smartphone } from "lucide-react";

const portals = [
  {
    icon: Building2,
    title: "Franchise Admin",
    description: "Complete franchise management portal",
    features: ["Employees", "Inventory", "Payroll", "Reports"],
    buttonText: "Admin Login",
    gradient: "from-brand-gold/20 to-brand-gold/5",
    borderColor: "border-brand-gold/20 hover:border-brand-gold/40",
    iconBg: "bg-brand-gold/10",
    iconColor: "text-brand-gold",
    buttonBg: "bg-gold-gradient text-brand-navy hover:shadow-glow",
  },
  {
    icon: User,
    title: "DSM Portal",
    description: "District Sales Manager dashboard",
    features: ["Team", "Targets", "Attendance"],
    buttonText: "DSM Login",
    gradient: "from-brand-sky/20 to-brand-sky/5",
    borderColor: "border-brand-sky/20 hover:border-brand-sky/40",
    iconBg: "bg-brand-sky/10",
    iconColor: "text-brand-sky",
    buttonBg: "bg-brand-sky/20 text-white hover:bg-brand-sky/30 border border-brand-sky/30",
  },
  {
    icon: Smartphone,
    title: "DSO Portal",
    description: "Field operations and activation portal",
    features: ["Activations", "MNP", "Attendance"],
    buttonText: "DSO Login",
    gradient: "from-green-500/20 to-green-500/5",
    borderColor: "border-green-500/20 hover:border-green-500/40",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
    buttonBg: "bg-green-500/20 text-white hover:bg-green-500/30 border border-green-500/30",
  },
];

export default function LoginPortal() {
  return (
    <section id="login" className="relative py-24 bg-brand-navy overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Login <span className="text-gradient">Portals</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Access your dedicated portal based on your role
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {portals.map((portal) => (
            <div
              key={portal.title}
              className={`relative group rounded-2xl border ${portal.borderColor} bg-gradient-to-b ${portal.gradient} backdrop-blur-sm p-8 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-xl`}
            >
              <div className="absolute inset-0 rounded-2xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${portal.iconBg} ${portal.iconColor} mb-6 transition-transform duration-300 group-hover:scale-110`}
                >
                  <portal.icon size={28} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {portal.title}
                </h3>
                <p className="text-white/50 text-sm mb-6">
                  {portal.description}
                </p>

                <div className="space-y-3 mb-8">
                  {portal.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-white/70"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/60" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${portal.buttonBg}`}
                >
                  {portal.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Franchise ID Login Flow */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-8 sm:p-10 text-center border border-brand-gold/10">
            <h3 className="text-2xl font-bold text-white mb-2">
              Franchise ID Login
            </h3>
            <p className="text-white/50 text-sm mb-8">
              Enter your franchise code to continue
            </p>

            <div className="relative max-w-md mx-auto mb-6">
              <input
                type="text"
                placeholder="Enter Franchise ID"
                defaultValue="NRWP-1217"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg text-center font-mono tracking-widest placeholder:text-white/30 focus:outline-none focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 transition-all"
              />
            </div>

            <button className="px-10 py-3.5 bg-gold-gradient text-brand-navy font-bold rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105">
              Continue
            </button>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="text-white/30 text-xs">Examples:</span>
              {["NRWP-1217", "LHR-1005", "KHI-2201"].map((id) => (
                <span
                  key={id}
                  className="text-brand-gold/60 text-xs font-mono cursor-pointer hover:text-brand-gold transition-colors"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
