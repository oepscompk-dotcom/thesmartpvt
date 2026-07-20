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

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ScrollToTop />

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <BackToHome />
          <span className="text-[#0A2647] font-black text-lg">THE SMART</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C8A951]/5 rounded-full blur-3xl -z-10" />
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2647]/5 rounded-full mb-6">
            <div className="w-2 h-2 bg-[#C8A951] rounded-full" />
            <span className="text-[#0A2647] text-sm font-medium">Legal Document</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A2647] mb-4">Privacy Policy</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#C8A951] to-[#B8960E] mx-auto rounded-full mb-6" />
          <p className="text-gray-500 text-lg">THE SMART Pvt. Ltd.</p>
          <p className="text-[#C8A951] font-medium italic mt-1">A Step Towards a New Horizon</p>
          <p className="text-gray-400 text-sm mt-4">Effective Date: January 1, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A2647] via-[#C8A951] to-[#0A2647] rounded-t-3xl" />

          {/* 1. Introduction */}
          <Section num="1" title="Introduction">
            <p>THE SMART Pvt. Ltd. (&quot;THE SMART&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting the personal information of our customers, employees, franchise partners, and website visitors.</p>
            <p>This Privacy Policy explains how we collect, use, store, and protect your information when you use our website, ERP platform, workforce management system, mobile applications, and telecom services.</p>
            <p>By accessing or using our services, you agree to this Privacy Policy.</p>
          </Section>

          {/* 2. Information We Collect */}
          <Section num="2" title="Information We Collect">
            <p>We may collect the following information:</p>
            <SubTitle>Personal Information</SubTitle>
            <BulletList items={["Full Name", "CNIC Number", "Mobile Number", "Email Address", "Residential Address", "Profile Photograph"]} />
            <SubTitle>Employee Information</SubTitle>
            <BulletList items={["Employee ID", "Attendance Records", "Device Assignments", "Performance Records", "Payroll Information"]} />
            <SubTitle>Franchise Information</SubTitle>
            <BulletList items={["Franchise ID", "Business Information", "Billing Information", "Subscription Information"]} />
            <SubTitle>Device Information</SubTitle>
            <BulletList items={["Device ID", "IMEI Number", "BVS Number", "Device Usage Information"]} />
            <SubTitle>Technical Information</SubTitle>
            <BulletList items={["IP Address", "Browser Information", "Login Activity", "Device Information", "GPS Location (for attendance purposes)"]} />
          </Section>

          {/* 3. How We Use Information */}
          <Section num="3" title="How We Use Information">
            <p>Your information may be used for:</p>
            <BulletList items={["SIM activation services", "Workforce management", "Attendance verification", "Device management", "Customer support", "Payroll processing", "Performance monitoring", "Security and fraud prevention", "Reporting and analytics", "Regulatory compliance"]} />
          </Section>

          {/* 4. GPS and Attendance Data */}
          <Section num="4" title="GPS and Attendance Data">
            <p>For employees using the workforce management system:</p>
            <BulletList items={["GPS location may be collected during attendance.", "Check-in and check-out information may be recorded.", "Attendance data is used solely for business operations.", "Only authorized management personnel can access attendance information."]} />
          </Section>

          {/* 5. SIM Registration Services */}
          <Section num="5" title="SIM Registration Services">
            <p>THE SMART Pvt. Ltd. provides telecom-related services, including:</p>
            <BulletList items={["New SIM activations", "MNP services", "SIM replacement services", "BYN services", "Enterprise telecom solutions"]} />
            <p>Customer information collected during these processes is handled in accordance with applicable laws and regulatory requirements.</p>
          </Section>

          {/* 6. Information Sharing */}
          <Section num="6" title="Information Sharing">
            <p>We do not sell or rent personal information.</p>
            <p>Information may be shared with:</p>
            <BulletList items={["Authorized telecom operators.", "Government authorities when legally required.", "Regulatory authorities.", "Authorized franchise partners.", "Service providers supporting our operations."]} />
          </Section>

          {/* 7. Network Partners */}
          <Section num="7" title="Network Partners">
            <p>THE SMART Pvt. Ltd. works with leading telecom operators, including:</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Telenor", "Ufone", "Jazz", "Warid", "Zong", "SCO"].map((n) => (
                <span key={n} className="px-4 py-2 bg-gradient-to-r from-[#0A2647] to-[#144272] text-white text-sm font-medium rounded-xl">{n}</span>
              ))}
            </div>
          </Section>

          {/* 8. Affiliations and Compliance */}
          <Section num="8" title="Affiliations and Compliance">
            <p>THE SMART Pvt. Ltd. operates in compliance with applicable laws and regulations and maintains affiliations or registrations with relevant authorities, including:</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["FBR", "SECP", "IPO Pakistan", "Government of Pakistan"].map((a) => (
                <span key={a} className="px-4 py-2 bg-gradient-to-r from-[#C8A951] to-[#B8960E] text-[#0A2647] text-sm font-semibold rounded-xl">{a}</span>
              ))}
            </div>
          </Section>

          {/* 9. Data Security */}
          <Section num="9" title="Data Security">
            <p>We implement appropriate security measures to protect information, including:</p>
            <BulletList items={["Encrypted passwords", "Role-based access controls", "Secure authentication", "Audit logs", "Data backups", "System monitoring"]} />
          </Section>

          {/* 10. Cookies */}
          <Section num="10" title="Cookies">
            <p>Our website may use cookies to:</p>
            <BulletList items={["Improve user experience.", "Maintain login sessions.", "Analyze website traffic.", "Enhance security."]} />
            <p>Users may disable cookies through their browser settings.</p>
          </Section>

          {/* 11. Data Retention */}
          <Section num="11" title="Data Retention">
            <p>Information is retained only for as long as necessary to:</p>
            <BulletList items={["Provide services.", "Meet legal obligations.", "Maintain business records.", "Conduct audits and compliance reviews."]} />
          </Section>

          {/* 12. User Rights */}
          <Section num="12" title="User Rights">
            <p>Users may request:</p>
            <BulletList items={["Access to their information.", "Correction of inaccurate information.", "Password changes.", "Profile updates."]} />
            <p>Certain records may be retained as required by law or business regulations.</p>
          </Section>

          {/* 13. Third-Party Services */}
          <Section num="13" title="Third-Party Services">
            <p>Our services may integrate with:</p>
            <BulletList items={["SMS gateways", "Email services", "Payment gateways", "Telecom operator systems", "Cloud hosting providers"]} />
            <p>These services may have their own privacy policies.</p>
          </Section>

          {/* 14. Changes to This Policy */}
          <Section num="14" title="Changes to This Policy">
            <p>THE SMART Pvt. Ltd. may update this Privacy Policy from time to time. Updated versions will be published on our website.</p>
          </Section>

          {/* 15. Contact Us */}
          <Section num="15" title="Contact Us">
            <p>If you have any questions regarding this Privacy Policy, please contact us:</p>
            <div className="mt-4 p-6 bg-gradient-to-br from-[#0A2647] to-[#144272] rounded-2xl text-white">
              <p className="font-bold text-lg">THE SMART Pvt. Ltd.</p>
              <p className="text-[#C8A951] text-sm italic mb-3">A Step Towards a New Horizon</p>
              <div className="space-y-1 text-sm text-white/80">
                <p>Website: <span className="text-[#C8A951] font-medium">www.thesmart.com.pk</span></p>
                <p>Email: <span className="text-[#C8A951] font-medium">hello@thesmart.com.pk</span></p>
              </div>
            </div>
          </Section>
        </div>

        {/* Bottom Back to Home */}
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
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8A951] to-[#B8960E] text-[#0A2647] font-black text-sm flex items-center justify-center flex-shrink-0">{num}</span>
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
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8A951] mt-2 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
