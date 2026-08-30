"use client";

import { ArrowLeft, ArrowUp } from "lucide-react";

function BackToHome() {
  return (
    <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-semibold text-sm rounded-xl hover:bg-[#144272] transition-all duration-300 hover:scale-105 shadow-lg">
      <ArrowLeft size={16} /> Back to Home
    </a>
  );
}

function ScrollToTop() {
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-8 right-8 w-12 h-12 bg-[#0A2647] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#144272] transition-all duration-300 hover:scale-110 z-50">
      <ArrowUp size={20} />
    </button>
  );
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ScrollToTop />

      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <BackToHome />
          <span className="text-[#0A2647] font-black text-lg">THE SMART</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFFB63]/5 rounded-full blur-3xl -z-10" />
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2647]/5 rounded-full mb-6">
            <div className="w-2 h-2 bg-[#FFFB63] rounded-full" />
            <span className="text-[#0A2647] text-sm font-medium">Legal Document</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A2647] mb-4">Terms of Service</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FFFB63] to-[#F1B308] mx-auto rounded-full mb-6" />
          <p className="text-gray-500 text-lg">THE SMART Pvt. Ltd.</p>
          <p className="text-[#F1B308] font-medium italic mt-1">A Step Towards a New Horizon</p>
          <p className="text-gray-400 text-sm mt-4">Effective Date: January 1, 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A2647] via-[#FFFB63] to-[#0A2647] rounded-t-3xl" />

          <Section num="1" title="Acceptance of Terms">
            <p>By accessing or using the THE SMART ERP platform, website, mobile applications, and related services (collectively, &quot;Services&quot;), you agree to be bound by these Terms of Service.</p>
            <p>If you do not agree to these terms, please do not use our Services.</p>
          </Section>

          <Section num="2" title="Description of Services">
            <p>THE SMART Pvt. Ltd. provides enterprise SaaS solutions for multi-franchise telecom distribution management, including:</p>
            <BulletList items={["SIM distribution and activation management", "MNP (Mobile Number Portability) services", "Device lifecycle management", "Workforce management with GPS attendance", "Payroll and financial management", "Real-time analytics and reporting", "Franchise operations management"]} />
          </Section>

          <Section num="3" title="Eligibility">
            <p>Our Services are designed for:</p>
            <BulletList items={["Authorized franchise operators", "Registered employees and field staff", "Enterprise clients and partners"]} />
            <p>You must be at least 18 years of age and have the legal capacity to enter into binding agreements.</p>
          </Section>

          <Section num="4" title="Account Registration">
            <p>To access certain features, you must:</p>
            <BulletList items={["Provide accurate and complete registration information", "Create secure login credentials", "Maintain the confidentiality of your account", "Notify us immediately of any unauthorized access"]} />
            <p>You are responsible for all activities that occur under your account.</p>
          </Section>

          <Section num="5" title="Acceptable Use">
            <p>You agree to use our Services only for lawful purposes and in accordance with these Terms. You shall not:</p>
            <BulletList items={["Violate any applicable laws or regulations", "Infringe upon the rights of others", "Attempt to gain unauthorized access to our systems", "Use our Services for fraudulent or malicious activities", "Interfere with or disrupt our Services", "Share your account credentials with unauthorized parties"]} />
          </Section>

          <Section num="6" title="Subscription and Payment">
            <BulletList items={["Subscription fees are as specified in your franchise agreement", "Payments are non-refundable unless otherwise stated", "We reserve the right to modify pricing with 30 days notice", "Late payments may result in service suspension"]} />
          </Section>

          <Section num="7" title="Intellectual Property">
            <p>All content, features, and functionality of our Services are owned by THE SMART Pvt. Ltd. and are protected by copyright, trademark, and other intellectual property laws.</p>
            <p>You may not reproduce, distribute, modify, or create derivative works without our express written permission.</p>
          </Section>

          <Section num="8" title="Data and Privacy">
            <p>Your use of our Services is also governed by our Privacy Policy. By using our Services, you consent to the collection and use of information as described in our Privacy Policy.</p>
          </Section>

          <Section num="9" title="Confidentiality">
            <p>Both parties agree to maintain the confidentiality of proprietary information shared during the course of using our Services. This includes:</p>
            <BulletList items={["Business strategies and operations", "Customer data and records", "Financial information", "Technical specifications and trade secrets"]} />
          </Section>

          <Section num="10" title="Service Availability">
            <p>We strive to maintain high availability of our Services but do not guarantee uninterrupted access. We may temporarily suspend services for:</p>
            <BulletList items={["Scheduled maintenance", "System upgrades", "Emergency repairs", "Force majeure events"]} />
          </Section>

          <Section num="11" title="Limitation of Liability">
            <p>THE SMART Pvt. Ltd. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:</p>
            <BulletList items={["Use or inability to use our Services", "Unauthorized access to your data", "Errors or omissions in content", "Third-party actions or services"]} />
          </Section>

          <Section num="12" title="Indemnification">
            <p>You agree to indemnify and hold harmless THE SMART Pvt. Ltd., its officers, directors, employees, and agents from any claims, losses, or damages arising from your use of our Services or violation of these Terms.</p>
          </Section>

          <Section num="13" title="Termination">
            <p>We may terminate or suspend your access to our Services at any time, with or without cause, with or without notice. Upon termination:</p>
            <BulletList items={["Your right to use our Services ceases immediately", "We may delete your account and data", "Outstanding payments remain due"]} />
          </Section>

          <Section num="14" title="Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes shall be resolved in the courts of Islamabad, Pakistan.</p>
          </Section>

          <Section num="15" title="Changes to Terms">
            <p>THE SMART Pvt. Ltd. reserves the right to modify these Terms at any time. Continued use of our Services after changes constitutes acceptance of the modified Terms.</p>
          </Section>

          <Section num="16" title="Contact Us">
            <p>For questions about these Terms of Service, contact us:</p>
            <div className="mt-4 p-6 bg-gradient-to-br from-[#0A2647] to-[#144272] rounded-2xl text-white">
              <p className="font-bold text-lg">THE SMART Pvt. Ltd.</p>
              <p className="text-[#F1B308] text-sm italic mb-3">A Step Towards a New Horizon</p>
              <div className="space-y-1 text-sm text-white/80">
                <p>Website: <span className="text-[#F1B308] font-medium">www.thesmart.com.pk</span></p>
                <p>Email: <span className="text-[#F1B308] font-medium">hello@thesmart.com.pk</span></p>
              </div>
            </div>
          </Section>
        </div>

        <div className="text-center mt-12">
          <BackToHome />
        </div>
      </div>
    </main>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFFB63] to-[#F1B308] text-[#0A2647] font-black text-sm flex items-center justify-center flex-shrink-0">{num}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0A2647]">{title}</h2>
      </div>
      <div className="pl-[52px] text-gray-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFB63] mt-2 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
