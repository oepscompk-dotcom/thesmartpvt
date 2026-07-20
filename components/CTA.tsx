"use client";

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-cta-gradient" />
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />

      <div className="absolute top-10 left-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-sky/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
          Ready to Digitize Your{" "}
          <span className="text-gradient">Telecom Business?</span>
        </h2>
        <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
          Join 120+ franchises already using THE SMART ERP to streamline their
          telecom distribution operations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-10 py-4 bg-gold-gradient text-brand-navy font-bold text-lg rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105">
            Start Now
          </button>
          <button className="px-10 py-4 border-2 border-brand-gold/40 text-white font-bold text-lg rounded-xl hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300">
            Book Demo
          </button>
        </div>
      </div>
    </section>
  );
}
