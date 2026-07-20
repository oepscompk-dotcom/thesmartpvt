"use client";

import { MapPin, Building, Award, TrendingUp } from "lucide-react";

const franchises = [
  {
    city: "Rawalpindi",
    code: "NRWP",
    staff: 120,
    activations: "5,200+",
  },
  {
    city: "Lahore",
    code: "LHR",
    staff: 180,
    activations: "8,400+",
  },
  {
    city: "Karachi",
    code: "KHI",
    staff: 250,
    activations: "12,000+",
  },
  {
    city: "Islamabad",
    code: "ISB",
    staff: 95,
    activations: "4,100+",
  },
  {
    city: "Faisalabad",
    code: "FSD",
    staff: 85,
    activations: "3,600+",
  },
  {
    city: "Multan",
    code: "MUL",
    staff: 70,
    activations: "2,800+",
  },
];

export default function Franchises() {
  return (
    <section id="franchises" className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            <Building size={14} />
            Our Network
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            Franchise <span className="text-brand-gold">Network</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Expanding across Pakistan with 120+ franchise locations
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {franchises.map((franchise) => (
            <div
              key={franchise.code}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-100 hover:border-brand-gold/20 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy">{franchise.city}</h3>
                    <span className="text-gray-400 text-xs font-mono">
                      {franchise.code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 text-xs">Staff</span>
                  <p className="font-bold text-brand-navy">{franchise.staff}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Activations</span>
                  <p className="font-bold text-brand-navy">{franchise.activations}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
