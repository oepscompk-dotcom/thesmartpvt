"use client";

import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="relative py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            <Mail size={14} />
            Contact Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            Get In <span className="text-brand-gold">Touch</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ready to transform your telecom business? Let&apos;s talk.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-bold text-brand-navy mb-1">Office Address</h3>
                <p className="text-gray-600 text-sm">
                  The Smart Pvt. Ltd.
                  <br />
                  Islamabad, Pakistan
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy flex-shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-brand-navy mb-1">Phone</h3>
                <p className="text-gray-600 text-sm">+92 51 123 4567</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy flex-shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-bold text-brand-navy mb-1">Email</h3>
                <p className="text-gray-600 text-sm">info@thesmartpvt.com</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your project..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 transition-all resize-none"
                />
              </div>

              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navy-light transition-all duration-300 hover:scale-105"
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
