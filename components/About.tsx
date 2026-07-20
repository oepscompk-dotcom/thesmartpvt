"use client";

import { Award, Users, Target, Shield } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="relative py-24 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-6">
              <Award size={14} />
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-6">
              Pakistan&apos;s Leading{" "}
              <span className="text-brand-gold">Telecom ERP</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              THE SMART ERP is an enterprise-grade SaaS platform built
              specifically for multi-franchise telecom distribution operations.
              We help businesses streamline SIM distribution, device management,
              workforce operations, and financial management from a single
              unified platform.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Our platform serves 120+ franchises across Pakistan with 890+ field
              staff managing 48,000+ SIM activations and 2,400+ device
              transactions monthly.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Users, title: "890+", label: "Field Staff" },
                { icon: Target, title: "48K+", label: "Activations" },
                { icon: Shield, title: "99.9%", label: "Uptime" },
                { icon: Award, title: "5+", label: "Years Experience" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-navy/5 flex items-center justify-center text-brand-navy">
                    <stat.icon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy">{stat.title}</p>
                    <span className="text-gray-400 text-sm">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-brand-navy rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-noise" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />

              <div className="relative">
                <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
                <p className="text-white/70 leading-relaxed mb-8">
                  To empower telecom businesses with intelligent, scalable, and
                  secure technology solutions that drive growth, efficiency, and
                  digital transformation across Pakistan.
                </p>

                <div className="space-y-4">
                  {[
                    "Enterprise-grade security",
                    "Real-time analytics & reporting",
                    "Multi-location management",
                    "Automated workflows",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-brand-gold"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-white/80 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
