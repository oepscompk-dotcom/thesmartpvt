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

export default function CookiePolicyPage() {
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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A2647] mb-4">Cookie Policy</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FFFB63] to-[#F1B308] mx-auto rounded-full mb-6" />
          <p className="text-gray-500 text-lg">THE SMART Pvt. Ltd.</p>
          <p className="text-[#F1B308] font-medium italic mt-1">A Step Towards a New Horizon</p>
          <p className="text-gray-400 text-sm mt-4">Effective Date: January 1, 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A2647] via-[#FFFB63] to-[#0A2647] rounded-t-3xl" />

          <Section num="1" title="What Are Cookies">
            <p>Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.</p>
          </Section>

          <Section num="2" title="How We Use Cookies">
            <p>THE SMART Pvt. Ltd. uses cookies for the following purposes:</p>
            <BulletList items={["To maintain your login session and keep you authenticated", "To remember your preferences and settings", "To analyze website traffic and usage patterns", "To improve website performance and user experience", "To enhance security and prevent fraud", "To provide personalized content and recommendations"]} />
          </Section>

          <Section num="3" title="Types of Cookies We Use">
            <SubTitle>Essential Cookies</SubTitle>
            <p>These cookies are necessary for the website to function properly. They enable core features such as authentication, security, and session management.</p>
            <SubTitle>Performance Cookies</SubTitle>
            <p>These cookies collect information about how visitors use our website, such as which pages are visited most often. This data helps us optimize website performance.</p>
            <SubTitle>Functional Cookies</SubTitle>
            <p>These cookies allow the website to remember choices you make, such as your language preference or region, to provide enhanced and personalized features.</p>
            <SubTitle>Analytics Cookies</SubTitle>
            <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
          </Section>

          <Section num="4" title="Specific Cookies We Use">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0A2647] text-white">
                    <th className="px-4 py-3 text-left rounded-tl-xl">Cookie</th>
                    <th className="px-4 py-3 text-left">Purpose</th>
                    <th className="px-4 py-3 text-left rounded-tr-xl">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-[#0A2647]">session_id</td>
                    <td className="px-4 py-3 text-gray-600">Maintains user login session</td>
                    <td className="px-4 py-3 text-gray-600">Session</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#0A2647]">auth_token</td>
                    <td className="px-4 py-3 text-gray-600">Authentication security</td>
                    <td className="px-4 py-3 text-gray-600">30 days</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-[#0A2647]">preferences</td>
                    <td className="px-4 py-3 text-gray-600">Stores user preferences</td>
                    <td className="px-4 py-3 text-gray-600">1 year</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#0A2647]">analytics_id</td>
                    <td className="px-4 py-3 text-gray-600">Website usage analytics</td>
                    <td className="px-4 py-3 text-gray-600">2 years</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-[#0A2647]">csrf_token</td>
                    <td className="px-4 py-3 text-gray-600">Security protection</td>
                    <td className="px-4 py-3 text-gray-600">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section num="5" title="Third-Party Cookies">
            <p>We may allow third-party services to set cookies on your device for:</p>
            <BulletList items={["Analytics services (e.g., Google Analytics)", "Payment processing security", "Customer support chat functionality", "Social media integration"]} />
            <p>These third-party services have their own privacy and cookie policies.</p>
          </Section>

          <Section num="6" title="Managing Cookies">
            <p>You can control and manage cookies in several ways:</p>
            <SubTitle>Browser Settings</SubTitle>
            <p>Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites. Refer to your browser&apos;s help section for instructions.</p>
            <SubTitle>Opt-Out Links</SubTitle>
            <BulletList items={["Google Analytics: tools.google.com/dlpage/gaoptout", "Browser-specific instructions in Settings > Privacy"]} />
            <SubTitle>Disabling Cookies</SubTitle>
            <p>Note that disabling certain cookies may impact the functionality of our website and prevent you from accessing some features.</p>
          </Section>

          <Section num="7" title="localStorage and SessionStorage">
            <p>In addition to cookies, our ERP platform uses browser storage technologies:</p>
            <BulletList items={["localStorage: Persists your preferences and settings across sessions", "sessionStorage: Maintains data for the duration of your browser session"]} />
            <p>These technologies help our platform function efficiently and remember your preferences.</p>
          </Section>

          <Section num="8" title="Mobile Device Identifiers">
            <p>When accessing our services via mobile devices, we may collect:</p>
            <BulletList items={["Device identifiers for security purposes", "Push notification tokens (with your consent)", "Location data (for attendance features, with your consent)"]} />
          </Section>

          <Section num="9" title="Changes to This Cookie Policy">
            <p>THE SMART Pvt. Ltd. may update this Cookie Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated effective date.</p>
          </Section>

          <Section num="10" title="Contact Us">
            <p>If you have questions about our use of cookies, please contact us:</p>
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

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-[#0A2647] mt-6 mb-2">{children}</h3>;
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
