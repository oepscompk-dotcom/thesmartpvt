"use client";

import { useState, useEffect, useCallback } from "react";
import { useData } from "@/lib/DataContext";
import {
  Smartphone, ArrowLeftRight, Cpu, Users, Package, Calculator,
  Building, MapPin, CreditCard, Wallet, BarChart3, Monitor,
  ChevronLeft, ChevronRight, ArrowRight, Phone, Mail, MapPinIcon,
  Zap, Shield, Globe, TrendingUp, Star, CheckCircle
} from "lucide-react";
import { useCompanyLogo } from "@/lib/useCompanyLogo";

const iconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={24} />,
  "arrow-left-right": <ArrowLeftRight size={24} />,
  cpu: <Cpu size={24} />,
  users: <Users size={24} />,
  package: <Package size={24} />,
  calculator: <Calculator size={24} />,
  building: <Building size={24} />,
  "map-pin": <MapPin size={24} />,
  "credit-card": <CreditCard size={24} />,
  wallet: <Wallet size={24} />,
  "bar-chart": <BarChart3 size={24} />,
  monitor: <Monitor size={24} />,
};

const sectionIds = ["home", "solutions", "features", "franchises", "about", "contact"];
const sectionIcons = [
  <svg key="home" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  <svg key="solutions" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  <svg key="features" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  <svg key="franchises" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  <svg key="about" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key="contact" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
];

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, start: () => setStarted(true) };
}

function HeroSlider({ slides, autoPlay, interval }: { slides: any[]; autoPlay: boolean; interval: number }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(true);
  const [textKey, setTextKey] = useState(0);

  const goTo = useCallback((index: number) => {
    setAnimating(false);
    setTimeout(() => {
      setCurrent(index);
      setTextKey((k) => k + 1);
      setAnimating(true);
    }, 100);
  }, []);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next, slides.length]);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {slides.map((s, i) => (
        <div key={s.id} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient || "from-[#0A2647] via-[#144272] to-[#0A2647]"}`} />
          <div className="absolute inset-0 bg-noise" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-brand-sky/5 rounded-full blur-3xl" />
        </div>
      ))}

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          <div key={textKey} className={`transition-all duration-700 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">{slide.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-6">
              {slide.title}
              <span className="text-gradient block">{slide.titleHighlight}</span>
            </h1>

            <h2 className="text-xl sm:text-2xl text-white/90 font-semibold mb-4">{slide.subtitle}</h2>
            <p className="text-white/60 text-base mb-8 max-w-lg">{slide.description}</p>

            <div className="mb-8">
              <p className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wider">Manage:</p>
              <div className="flex flex-wrap gap-2">
                {slide.features.map((f: string) => (
                  <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-lg text-white/90 text-sm">
                    <CheckCircle size={14} className="text-brand-gold flex-shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href={slide.ctaLink} className="px-8 py-4 bg-gold-gradient text-brand-navy font-bold text-lg rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105 text-center">
                {slide.ctaText}
              </a>
              <a href={slide.ctaSecondaryLink} className="px-8 py-4 border-2 border-brand-gold/40 text-white font-bold text-lg rounded-xl hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300 text-center">
                {slide.ctaSecondaryText}
              </a>
            </div>
          </div>

          <div key={`dash-${textKey}`} className={`transition-all duration-700 delay-300 ${animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="glass-card rounded-2xl p-6 sm:p-8 relative">
              <div className="absolute -top-3 -right-3 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Dashboard Overview</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/60 text-xs">Live</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: <Zap size={16} className="text-green-400" />, label: "Activations", value: "1,247", change: "+12.5%", color: "text-green-400" },
                  { icon: <Users size={16} className="text-brand-sky" />, label: "Franchises", value: "120+", change: "+8.2%", color: "text-brand-sky" },
                  { icon: <BarChart3 size={16} className="text-brand-gold" />, label: "Attendance", value: "847", change: "94.2%", color: "text-brand-gold" },
                  { icon: <TrendingUp size={16} className="text-green-400" />, label: "Revenue", value: "PKR 2.4M", change: "+15.3%", color: "text-green-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      {stat.icon}
                      <span className="text-white/50 text-xs">{stat.label}</span>
                    </div>
                    <p className="text-white font-bold text-xl">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60 text-sm">Revenue Trend</span>
                  <span className="text-brand-gold text-xs">This Month</span>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md transition-all duration-500" style={{ height: `${h}%`, background: i === 10 ? "linear-gradient(to top, #C8A951, #D4BC6A)" : "rgba(77, 168, 218, 0.3)" }} />
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -left-4 animate-float">
                <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                  <Shield size={14} className="text-brand-gold" />
                  <span className="text-white text-xs font-medium">Secure</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-float delay-1000">
                <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                  <Globe size={14} className="text-green-400" />
                  <span className="text-white text-xs font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        <button onClick={prev} className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-brand-gold" : "w-2 bg-white/30 hover:bg-white/50"}`} />
          ))}
        </div>
        <button onClick={next} className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function SectionNav() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      for (const id of [...sectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-1.5">
      {sectionIds.map((id, i) => (
        <a key={id} href={`#${id}`} title={id.charAt(0).toUpperCase() + id.slice(1)} className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${active === id ? "bg-brand-gold text-brand-navy shadow-lg scale-125" : "glass text-white/60 hover:text-white hover:bg-white/10"}`}>
          {sectionIcons[i]}
        </a>
      ))}
    </div>
  );
}

function StatItem({ stat, visible }: { stat: any; visible: boolean }) {
  const { count, start } = useCountUp(stat.value, 2500);
  useEffect(() => { if (visible) start(); }, [visible, start]);
  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gold/10 text-brand-gold mb-4 group-hover:bg-brand-gold/20 transition-all duration-300 group-hover:scale-110">
        {iconMap[stat.icon] || <Star size={32} />}
      </div>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2">
        {count.toLocaleString()}<span className="text-brand-gold">{stat.suffix}</span>
      </div>
      <p className="text-white/50 text-sm sm:text-base font-medium">{stat.label}</p>
    </div>
  );
}

function StatsSection({ data }: { data: any }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
      obs.observe(node);
      return () => obs.disconnect();
    }
  }, []);

  return (
    <section className="relative bg-brand-navy-dark py-20 overflow-hidden" ref={sectionRef}>
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {data.items.map((stat: any, i: number) => (
            <StatItem key={i} stat={stat} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionsSection({ data }: { data: any }) {
  return (
    <section id="solutions" className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-sky/5 rounded-full blur-3xl translate-y-1/2" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            <Package size={14} />
            {data.section.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            {data.section.title} <span className="text-brand-gold">{data.section.titleHighlight}</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{data.section.description}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((service: any, i: number) => (
            <div key={i} className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-brand-gold/20 transition-all duration-500 hover:transform hover:scale-105">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-navy via-brand-sky to-brand-gold rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-navy/5 text-brand-navy mb-6 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all duration-300">
                {iconMap[service.icon] || <Star size={24} />}
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.features.map((f: string) => (
                  <span key={f} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg group-hover:bg-brand-navy/5 group-hover:text-brand-navy transition-all">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ data }: { data: any }) {
  return (
    <section id="features" className="relative py-24 bg-brand-navy overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-brand-gold text-sm font-medium mb-4">
            <Zap size={14} />
            {data.section.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            {data.section.title} <span className="text-gradient">{data.section.titleHighlight}</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">{data.section.description}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((feature: any, i: number) => (
            <div key={i} className="group glass-card rounded-2xl p-8 hover:bg-white/10 transition-all duration-500">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-gold/10 text-brand-gold mb-6 group-hover:scale-110 transition-all duration-300">
                {iconMap[feature.icon] || <Star size={24} />}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection({ data }: { data: any }) {
  return (
    <section id="about" className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            <Building size={14} />
            {data.section.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            {data.section.title} <span className="text-brand-gold">{data.section.titleHighlight}</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{data.section.description}</p>
        </div>
        <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">{data.description}</p>
        <div className="grid md:grid-cols-3 gap-8">
          {data.items.map((item: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-4">
                {[<Star key={0} size={24} />, <Shield key={1} size={24} />, <Globe key={2} size={24} />][i]}
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ data }: { data: any }) {
  return (
    <section id="contact" className="relative py-24 bg-brand-navy overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-brand-gold text-sm font-medium mb-4">
            <Mail size={14} />
            {data.section.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            {data.section.title} <span className="text-gradient">{data.section.titleHighlight}</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">{data.section.description}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto mb-4">
              <Mail size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">Email</h3>
            <p className="text-white/60 text-sm">{data.email}</p>
          </div>
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto mb-4">
              <Phone size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">Phone</h3>
            <p className="text-white/60 text-sm">{data.phone}</p>
          </div>
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mx-auto mb-4">
              <MapPinIcon size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">Address</h3>
            <p className="text-white/60 text-sm">{data.address}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ data }: { data: any }) {
  return (
    <section className="relative py-24 bg-brand-navy-dark overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">{data.title}</h2>
        <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">{data.description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={data.primaryLink} className="px-8 py-4 bg-gold-gradient text-brand-navy font-bold text-lg rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105">
            {data.primaryText}
          </a>
          <a href={data.secondaryLink} className="px-8 py-4 border-2 border-brand-gold/40 text-white font-bold text-lg rounded-xl hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300">
            {data.secondaryText}
          </a>
        </div>
      </div>
    </section>
  );
}

function LoginPortalSection() {
  const portals = [
    { title: "Franchise Admin", desc: "Manage your franchise operations", icon: <Building size={28} />, href: "/franchise-admin", color: "from-[#C8A951] to-[#B8960E]" },
    { title: "DSO Dashboard", desc: "Field operations & sales", icon: <MapPin size={28} />, href: "/dso-login", color: "from-[#0057FF] to-[#0041CC]" },
    { title: "DSM Dashboard", desc: "Team management & performance", icon: <Users size={28} />, href: "/dsm-login", color: "from-green-500 to-green-600" },
  ];

  return (
    <section id="login" className="relative py-24 bg-white overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            <Shield size={14} />
            Secure Access
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            Choose Your <span className="text-brand-gold">Portal</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Select your role to access the appropriate dashboard</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {portals.map((portal) => (
            <a key={portal.title} href={portal.href} className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${portal.color}`} />
              <div className="absolute inset-0 bg-noise" />
              <div className="relative p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                  {portal.icon}
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{portal.title}</h3>
                <p className="text-white/70 text-sm mb-6">{portal.desc}</p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white font-semibold text-sm group-hover:bg-white/20 transition-all">
                  Login <ArrowRight size={16} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FranchisesSection({ data, franchises }: { data: any; franchises: any[] }) {
  return (
    <section id="franchises" className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            <Building size={14} />
            {data.section.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            {data.section.title} <span className="text-brand-gold">{data.section.titleHighlight}</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{data.section.description}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {franchises.filter((f) => f.status === "Active").slice(0, 6).map((f) => (
            <div key={f.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy font-bold">{f.id.slice(0, 2)}</div>
                <div>
                  <h4 className="font-bold text-brand-navy">{f.name}</h4>
                  <p className="text-gray-500 text-xs">{f.city}, {f.province}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600"><strong className="text-brand-navy">{f.dsm}</strong> DSM</span>
                <span className="text-gray-600"><strong className="text-brand-navy">{f.dso}</strong> DSO</span>
                <span className="ml-auto px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-lg">{f.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Homepage() {
  const { settings, franchises } = useData();
  const hp = settings.homepage;

  return (
    <main className="min-h-screen">
      <SectionNav />
      <section id="home">
        <HeroSlider slides={hp.hero.slides} autoPlay={hp.hero.autoPlay} interval={hp.hero.interval} />
      </section>
      <LoginPortalSection />
      <StatsSection data={hp.stats} />
      <SolutionsSection data={hp.solutions} />
      <FeaturesSection data={hp.features} />
      <FranchisesSection data={hp.franchises} franchises={franchises} />
      <AboutSection data={hp.about} />
      <ContactSection data={hp.contact} />
      <CTASection data={hp.cta} />
    </main>
  );
}
