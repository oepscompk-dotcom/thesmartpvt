"use client";

import { Smartphone, MapPin, QrCode, Wallet, Bell } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "GPS Tracking",
    description: "Real-time location tracking for field staff",
  },
  {
    icon: QrCode,
    title: "QR Scanner",
    description: "Instant SIM and device scanning via QR codes",
  },
  {
    icon: Smartphone,
    title: "Attendance",
    description: "One-tap check-in with geo-verification",
  },
  {
    icon: Wallet,
    title: "Wallet",
    description: "Digital wallet for expenses and commissions",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Push notifications for tasks and updates",
  },
];

export default function MobileApp() {
  return (
    <section className="relative py-24 bg-brand-navy overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-brand-gold text-sm font-medium mb-6">
              <Smartphone size={14} />
              Mobile App
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
              Field Operations{" "}
              <span className="text-gradient">Anywhere</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Empower your field staff with a powerful mobile application for
              on-the-go operations, real-time tracking, and instant reporting.
            </p>

            <div className="space-y-6 mb-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold flex-shrink-0 group-hover:bg-brand-gold/20 transition-all">
                    <feature.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/50 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl text-brand-navy font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                <span className="text-2xl">▶</span>
                <div className="text-left">
                  <span className="block text-[10px] text-gray-500 leading-none">
                    GET IT ON
                  </span>
                  <span className="block text-sm font-semibold">Google Play</span>
                </div>
              </button>
              <button className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl text-brand-navy font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                <span className="text-2xl"></span>
                <div className="text-left">
                  <span className="block text-[10px] text-gray-500 leading-none">
                    Download on the
                  </span>
                  <span className="block text-sm font-semibold">App Store</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="w-72 h-[520px] bg-brand-navy-dark rounded-[3rem] border-4 border-gray-700 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-brand-navy-dark rounded-b-2xl z-10" />

                <div className="bg-gradient-to-b from-brand-navy to-brand-navy-light h-full p-6 pt-12">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-brand-navy font-black text-2xl">S</span>
                    </div>
                    <span className="text-white font-bold text-sm">THE SMART ERP</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: "Activations", value: "342", color: "bg-green-500/20 text-green-400" },
                      { label: "Attendance", value: "94%", color: "bg-brand-gold/20 text-brand-gold" },
                      { label: "MNP", value: "87", color: "bg-brand-sky/20 text-brand-sky" },
                      { label: "Revenue", value: "2.4M", color: "bg-brand-gold/20 text-brand-gold" },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-xl p-3 ${item.color.split(" ")[0]}`}>
                        <span className={`text-xs ${item.color.split(" ")[1]}`}>
                          {item.label}
                        </span>
                        <p className={`text-lg font-bold ${item.color.split(" ")[1]}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <span className="text-white/60 text-xs">Today&apos;s Tasks</span>
                    <div className="mt-2 space-y-2">
                      {["SIM Delivery - Sector 5", "New Activation", "MNP Transfer"].map(
                        (task, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                i === 0
                                  ? "bg-green-400"
                                  : i === 1
                                  ? "bg-brand-gold"
                                  : "bg-brand-sky"
                              }`}
                            />
                            <span className="text-white/80 text-xs">{task}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-around pt-4 border-t border-white/10">
                    {["Home", "Tasks", "Scan", "Wallet", "More"].map(
                      (tab, i) => (
                        <div key={tab} className="flex flex-col items-center gap-1">
                          <div
                            className={`w-6 h-6 rounded-md ${
                              i === 0 ? "bg-brand-gold/20" : "bg-transparent"
                            }`}
                          />
                          <span
                            className={`text-[9px] ${
                              i === 0 ? "text-brand-gold" : "text-white/40"
                            }`}
                          >
                            {tab}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-sky/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
