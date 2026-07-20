"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiLoad, apiLoadById, apiSave, apiUpdate, apiDelete } from "@/lib/api";

export interface Company {
  id: string;
  name: string;
  owner: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  province: string;
  status: string;
  password: string;
  franchiseCount: number;
  createdAt: string;
  agreementStart?: string;
  agreementEnd?: string;
}

export interface Franchise {
  id: string;
  name: string;
  owner: string;
  cnic: string;
  mobile: string;
  email: string;
  province: string;
  city: string;
  package: string;
  status: string;
  agreementStart: string;
  agreementEnd: string;
  dsm: number;
  dso: number;
  password: string;
  companyId: string;
  network: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  franchise: string;
  status: string;
  joining: string;
  attendance: number;
  performance: number;
  mobile: string;
  email: string;
}

export interface Payment {
  id: string;
  franchise: string;
  amount: string;
  method: string;
  date: string;
  status: string;
  package: string;
}

export interface Subscription {
  name: string;
  price: string;
  period: string;
  features: string[];
  franchises: number;
  color: string;
  popular?: boolean;
}

export interface CMSPage {
  title: string;
  status: string;
  updated: string;
  content: string;
}

export interface Notification {
  title: string;
  message: string;
  type: string;
  time: string;
  read: boolean;
}

export interface AuditLog {
  time: string;
  user: string;
  action: string;
  detail: string;
  type: string;
}

export interface HeaderNavLink {
  name: string;
  href: string;
  visible: boolean;
}

export interface FooterLinkColumn {
  title: string;
  links: string[];
}

export interface FooterBottomLink {
  text: string;
  href: string;
}

export interface HeaderSettings {
  navLinks: HeaderNavLink[];
  tagline: string;
  ctaText: string;
  ctaLink: string;
  ctaVisible: boolean;
}

export interface FooterSettings {
  description: string;
  features: string[];
  linkColumns: FooterLinkColumn[];
  showCenterLogo: boolean;
  centerLogo: string;
  centerLogoSize: string;
  bottomLinks: FooterBottomLink[];
  copyrightText: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  gradient: string;
}

export interface HomepageStat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

export interface HomepageService {
  title: string;
  description: string;
  features: string[];
  icon: string;
}

export interface HomepageFeature {
  title: string;
  description: string;
  icon: string;
}

export interface HomepageSection {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
}

export interface HomepageContent {
  hero: {
    slides: HeroSlide[];
    autoPlay: boolean;
    interval: number;
  };
  stats: {
    section: HomepageSection;
    items: HomepageStat[];
  };
  solutions: {
    section: HomepageSection;
    items: HomepageService[];
  };
  features: {
    section: HomepageSection;
    items: HomepageFeature[];
  };
  franchises: {
    section: HomepageSection;
    description: string;
  };
  about: {
    section: HomepageSection;
    description: string;
    items: { title: string; description: string }[];
  };
  contact: {
    section: HomepageSection;
    email: string;
    phone: string;
    address: string;
  };
  cta: {
    title: string;
    description: string;
    primaryText: string;
    primaryLink: string;
    secondaryText: string;
    secondaryLink: string;
  };
}

export interface Settings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  smsApiKey: string;
  whatsappApiKey: string;
  paymentGatewayKey: string;
  adminName: string;
  adminEmail: string;
  adminMobile: string;
  logo: string;
  headerLogo: string;
  footerLogo: string;
  favicon: string;
  header: HeaderSettings;
  footer: FooterSettings;
  homepage: HomepageContent;
}

interface DataContextType {
  franchises: Franchise[];
  companies: Company[];
  employees: Employee[];
  payments: Payment[];
  subscriptions: Subscription[];
  cmsPages: CMSPage[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: Settings;

  addFranchise: (f: Franchise) => void;
  updateFranchise: (id: string, f: Franchise) => void;
  deleteFranchise: (id: string) => void;

  addCompany: (c: Company) => void;
  updateCompany: (id: string, c: Company) => void;
  deleteCompany: (id: string) => void;

  addPayment: (p: Payment) => void;
  updatePayment: (id: string, p: Payment) => void;
  deletePayment: (id: string) => void;

  updateSubscription: (index: number, s: Subscription) => void;

  addCMSPage: (p: CMSPage) => void;
  updateCMSPage: (title: string, p: CMSPage) => void;
  deleteCMSPage: (title: string) => void;

  sendNotification: (n: Notification) => void;
  markNotificationRead: (index: number) => void;
  deleteNotification: (index: number) => void;
  clearAllNotifications: () => void;

  updateSettings: (s: Settings) => void;

  addAuditLog: (log: AuditLog) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultFranchises: Franchise[] = [];

const defaultEmployees: Employee[] = [];

const defaultPayments: Payment[] = [];

const defaultSubscriptions: Subscription[] = [
  { name: "Monthly Package", price: "3000", period: "/month", features: ["Up to 5 DSOs", "Basic Reports", "SMS Alerts", "Email Support"], franchises: 0, color: "from-[#0EA5E9] to-[#0057FF]" },
  { name: "Six Month Package", price: "15000", period: "/6 months", features: ["Up to 15 DSOs", "Advanced Reports", "SMS + WhatsApp", "Priority Support", "API Access"], franchises: 0, color: "from-[#C8A951] to-[#B8960E]", popular: true },
  { name: "Annual Package", price: "25000", period: "/year", features: ["Unlimited DSOs", "Full Analytics", "All Channels", "24/7 Support", "Full API", "Custom Branding"], franchises: 0, color: "from-green-500 to-green-600" },
];

const defaultCompanies: Company[] = [];

const defaultCMSPages: CMSPage[] = [
  { title: "Homepage", status: "Draft", updated: "", content: "" },
  { title: "Services", status: "Draft", updated: "", content: "" },
  { title: "About Us", status: "Draft", updated: "", content: "" },
  { title: "Contact", status: "Draft", updated: "", content: "" },
  { title: "Privacy Policy", status: "Draft", updated: "", content: "" },
  { title: "Terms of Service", status: "Draft", updated: "", content: "" },
];

const defaultNotifications: Notification[] = [];

const defaultAuditLogs: AuditLog[] = [];

const defaultSettings: Settings = {
  companyName: "THE SMART Pvt. Ltd.",
  email: "info@thesmartpvt.com",
  phone: "+92 51 123 4567",
  address: "Islamabad, Pakistan",
  smsApiKey: "",
  whatsappApiKey: "",
  paymentGatewayKey: "",
  adminName: "Super Admin",
  adminEmail: "admin@thesmart.pk",
  adminMobile: "+92 300 0000000",
  logo: "",
  headerLogo: "",
  footerLogo: "",
  favicon: "",
  header: {
    navLinks: [
      { name: "Home", href: "#home", visible: true },
      { name: "Solutions", href: "#solutions", visible: true },
      { name: "Features", href: "#features", visible: true },
      { name: "Franchises", href: "#franchises", visible: true },
      { name: "About", href: "#about", visible: true },
      { name: "Contact", href: "#contact", visible: true },
    ],
    tagline: "A Step Towards a New Horizon",
    ctaText: "Franchise Login",
    ctaLink: "#login",
    ctaVisible: true,
  },
  footer: {
    description: "A Step Towards a New Horizon. Enterprise SaaS platform for multi-franchise telecom distribution management.",
    features: ["Smart Distribution", "Smart Inventory", "Smart Finance", "Smart Growth"],
    linkColumns: [
      { title: "Solutions", links: ["SIM Distribution", "MNP Services", "Device Management", "Workforce Management"] },
      { title: "Quick Links", links: ["Home", "About Us", "Features", "Contact"] },
      { title: "Support", links: ["Help Center", "Documentation", "API Reference", "Status Page"] },
    ],
    showCenterLogo: true,
    centerLogo: "",
    centerLogoSize: "48",
    bottomLinks: [
      { text: "Privacy Policy", href: "/privacy-policy" },
      { text: "Terms of Service", href: "/terms-of-service" },
      { text: "Cookie Policy", href: "/cookie-policy" },
    ],
    copyrightText: "All Rights Reserved.",
  },
  homepage: {
    hero: {
      autoPlay: true,
      interval: 5000,
      slides: [
        {
          id: "slide-1",
          badge: "Enterprise Telecom Platform",
          title: "THE SMART",
          titleHighlight: "ERP",
          subtitle: "Multi-Franchise Telecom Distribution Platform",
          description: "Complete enterprise solution for managing multi-franchise telecom distribution operations with real-time analytics and automation.",
          features: ["SIM Distribution", "Device Management", "Workforce Management", "Inventory", "Payroll", "Accounting", "Franchise Operations"],
          ctaText: "Franchise Login",
          ctaLink: "#login",
          ctaSecondaryText: "Request Demo",
          ctaSecondaryLink: "#demo",
          gradient: "from-[#0A2647] via-[#144272] to-[#0A2647]",
        },
        {
          id: "slide-2",
          badge: "Smart Distribution",
          title: "DISTRIBUTION",
          titleHighlight: "MADE SMART",
          subtitle: "End-to-End SIM & Device Management",
          description: "Automate your entire distribution network with real-time tracking, smart assignments, and comprehensive analytics.",
          features: ["Bulk Activation", "Real-time Tracking", "Auto Assignment", "Network Integration", "Status Monitoring", "Report Generation", "Smart Analytics"],
          ctaText: "Get Started",
          ctaLink: "#login",
          ctaSecondaryText: "Learn More",
          ctaSecondaryLink: "#solutions",
          gradient: "from-[#0F172A] via-[#1E3A5F] to-[#0F172A]",
        },
        {
          id: "slide-3",
          badge: "Field Operations",
          title: "FIELD",
          titleHighlight: "OPERATIONS",
          subtitle: "GPS-Enabled Workforce Management",
          description: "Monitor your field staff with GPS attendance, real-time tracking, performance analytics, and automated payroll integration.",
          features: ["GPS Attendance", "Team Monitoring", "Performance Tracking", "Payroll Integration", "Route Optimization", "Task Assignment", "Live Dashboard"],
          ctaText: "Explore Features",
          ctaLink: "#features",
          ctaSecondaryText: "Contact Us",
          ctaSecondaryLink: "#contact",
          gradient: "from-[#0A1628] via-[#1A365D] to-[#0A1628]",
        },
        {
          id: "slide-4",
          badge: "Analytics & Reports",
          title: "REAL-TIME",
          titleHighlight: "ANALYTICS",
          subtitle: "Comprehensive Business Intelligence",
          description: "Gain deep insights into your franchise operations with live dashboards, custom reports, and predictive analytics.",
          features: ["Live Dashboards", "Custom Reports", "Predictive Analytics", "Revenue Tracking", "Performance Metrics", "Trend Analysis", "Export Tools"],
          ctaText: "View Reports",
          ctaLink: "#demo",
          ctaSecondaryText: "Request Demo",
          ctaSecondaryLink: "#contact",
          gradient: "from-[#0D1B2A] via-[#1B2838] to-[#0D1B2A]",
        },
      ],
    },
    stats: {
      section: {
        badge: "Our Impact",
        title: "Trusted by",
        titleHighlight: "120+ Franchises",
        description: "Powering telecom distribution across Pakistan",
      },
      items: [
        { value: 48000, suffix: "+", label: "SIM Activations", icon: "smartphone" },
        { value: 890, suffix: "+", label: "Field Staff", icon: "users" },
        { value: 120, suffix: "+", label: "Franchises", icon: "building" },
        { value: 2400, suffix: "+", label: "Devices", icon: "monitor" },
      ],
    },
    solutions: {
      section: {
        badge: "Our Solutions",
        title: "Complete Telecom",
        titleHighlight: "Solutions",
        description: "End-to-end enterprise solutions designed for multi-franchise telecom operations",
      },
      items: [
        { title: "SIM Distribution", description: "Enterprise-grade SIM management with real-time tracking and activation workflows.", features: ["Bulk Activation", "Real-time Status", "Auto Assignment"], icon: "smartphone" },
        { title: "MNP Services", description: "Seamless Mobile Number Portability across all networks with automated processing.", features: ["Auto Processing", "Network Integration", "Status Tracking"], icon: "arrow-left-right" },
        { title: "Device Management", description: "Complete IMEI tracking and device lifecycle management for your entire fleet.", features: ["IMEI Tracking", "Device Registry", "Warranty Management"], icon: "cpu" },
        { title: "Workforce Management", description: "GPS-enabled attendance, payroll integration, and field team monitoring.", features: ["GPS Attendance", "Team Monitoring", "Performance Tracking"], icon: "users" },
        { title: "Inventory Control", description: "Real-time SIM and equipment inventory tracking across all franchise locations.", features: ["Stock Tracking", "Auto Reorder", "Multi-location"], icon: "package" },
        { title: "Accounting", description: "Comprehensive financial management with automated invoicing and reporting.", features: ["Auto Invoicing", "Financial Reports", "Tax Compliance"], icon: "calculator" },
      ],
    },
    features: {
      section: {
        badge: "Features",
        title: "Powerful",
        titleHighlight: "Features",
        description: "Everything you need to manage your franchise empire",
      },
      items: [
        { title: "Multi-Franchise SaaS", description: "Manage multiple franchises from a single centralized platform.", icon: "building" },
        { title: "GPS Attendance", description: "Real-time GPS-based attendance tracking for field staff.", icon: "map-pin" },
        { title: "Device Tracking", description: "Complete IMEI-based device tracking and management system.", icon: "smartphone" },
        { title: "Smart Payroll", description: "Automated payroll processing with attendance integration.", icon: "credit-card" },
        { title: "Wallet System", description: "Digital wallet for franchise operations and transactions.", icon: "wallet" },
        { title: "Real-Time Reports", description: "Live analytics and comprehensive business intelligence reports.", icon: "bar-chart" },
      ],
    },
    franchises: {
      section: {
        badge: "Franchises",
        title: "Our",
        titleHighlight: "Franchises",
        description: "Join Pakistan's leading telecom distribution network",
      },
      description: "We are partnered with leading franchises across Pakistan to deliver exceptional telecom distribution services.",
    },
    about: {
      section: {
        badge: "About Us",
        title: "About",
        titleHighlight: "THE SMART",
        description: "Pakistan's leading telecom distribution management platform",
      },
      description: "THE SMART Pvt. Ltd. is a pioneering technology company dedicated to revolutionizing telecom distribution in Pakistan. Our enterprise SaaS platform empowers franchises with cutting-edge tools for managing their operations efficiently.",
      items: [
        { title: "Our Mission", description: "To empower telecom franchises with innovative technology solutions that drive growth and efficiency." },
        { title: "Our Vision", description: "To become Pakistan's most trusted platform for telecom distribution management." },
        { title: "Our Values", description: "Innovation, integrity, and commitment to excellence in everything we do." },
      ],
    },
    contact: {
      section: {
        badge: "Contact Us",
        title: "Get In",
        titleHighlight: "Touch",
        description: "Ready to transform your franchise operations?",
      },
      email: "info@thesmartpvt.com",
      phone: "+92 51 123 4567",
      address: "Islamabad, Pakistan",
    },
    cta: {
      title: "Ready to Transform Your Franchise?",
      description: "Join 120+ franchises already using THE SMART ERP to streamline their operations.",
      primaryText: "Get Started Now",
      primaryLink: "#login",
      secondaryText: "Contact Sales",
      secondaryLink: "#contact",
    },
  },
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>(defaultFranchises);
  const [companies, setCompanies] = useState<Company[]>(defaultCompanies);
  const [employees] = useState<Employee[]>(defaultEmployees);
  const [payments, setPayments] = useState<Payment[]>(defaultPayments);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(defaultSubscriptions);
  const [cmsPages, setCMSPages] = useState<CMSPage[]>(defaultCMSPages);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(defaultAuditLogs);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    (async () => {
      try {
        const [companiesData, franchisesData, employees, payments, subscriptions, cmsPages, notifications, auditLogs, settingsRecord] = await Promise.all([
          apiLoad("company"),
          apiLoad("franchise"),
          apiLoad("employee"),
          apiLoad("payment"),
          apiLoad("subscription"),
          apiLoad("cmsPage"),
          apiLoad("adminNotification"),
          apiLoad("auditLog"),
          apiLoadById("adminSettings", "admin-settings"),
        ]);

        if (Array.isArray(franchisesData) && franchisesData.length) setFranchises(franchisesData);
        if (Array.isArray(companiesData) && companiesData.length) setCompanies(companiesData);
        if (Array.isArray(payments) && payments.length) setPayments(payments);
        if (Array.isArray(subscriptions) && subscriptions.length) setSubscriptions(subscriptions);
        if (Array.isArray(cmsPages) && cmsPages.length) setCMSPages(cmsPages);
        if (Array.isArray(notifications) && notifications.length) setNotifications(notifications);
        if (Array.isArray(auditLogs) && auditLogs.length) setAuditLogs(auditLogs);

        if (settingsRecord?.data) {
          const parsed = typeof settingsRecord.data === "string" ? JSON.parse(settingsRecord.data) : settingsRecord.data;
          setSettings({
            ...defaultSettings,
            ...parsed,
            header: { ...defaultSettings.header, ...parsed.header },
            footer: { ...defaultSettings.footer, ...parsed.footer },
            homepage: { ...defaultSettings.homepage, ...parsed.homepage },
          });
        }

        if (settingsRecord?.homepage) {
          const hp = typeof settingsRecord.homepage === "string" ? JSON.parse(settingsRecord.homepage) : settingsRecord.homepage;
          setSettings((prev) => ({ ...prev, homepage: { ...defaultSettings.homepage, ...hp } }));
        }

        if (settingsRecord?.header) {
          const hdr = typeof settingsRecord.header === "string" ? JSON.parse(settingsRecord.header) : settingsRecord.header;
          setSettings((prev) => ({ ...prev, header: { ...defaultSettings.header, ...hdr } }));
        }

        if (settingsRecord?.footer) {
          const ftr = typeof settingsRecord.footer === "string" ? JSON.parse(settingsRecord.footer) : settingsRecord.footer;
          setSettings((prev) => ({ ...prev, footer: { ...defaultSettings.footer, ...ftr } }));
        }
      } catch (e) {
        console.error("Failed to load data from API", e);
      } finally {
        setMounted(true);
      }
    })();
  }, []);

  const now = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };

  const addAuditLog = async (log: AuditLog) => {
    await apiSave("auditLog", log);
    setAuditLogs((prev) => [log, ...prev]);
  };

  const addFranchise = async (f: Franchise) => {
    await apiSave("franchise", f);
    setFranchises((prev) => [...prev, f]);
    await addAuditLog({ time: now(), user: "Super Admin", action: "Franchise Added", detail: `New franchise ${f.id} - ${f.name}`, type: "update" });
  };

  const updateFranchise = async (id: string, f: Franchise) => {
    await apiUpdate("franchise", id, f);
    setFranchises((prev) => prev.map((item) => (item.id === id ? f : item)));
    await addAuditLog({ time: now(), user: "Super Admin", action: "Franchise Updated", detail: `Modified franchise ${id}`, type: "update" });
  };

  const deleteFranchise = async (id: string) => {
    await apiDelete("franchise", id);
    setFranchises((prev) => prev.filter((item) => item.id !== id));
    await addAuditLog({ time: now(), user: "Super Admin", action: "Franchise Deleted", detail: `Deleted franchise ${id}`, type: "update" });
  };

  const addCompany = async (c: Company) => {
    await apiSave("company", c);
    setCompanies((prev) => [...prev, c]);
    await addAuditLog({ time: now(), user: "Super Admin", action: "Company Added", detail: `New company ${c.id} - ${c.name}`, type: "update" });
  };

  const updateCompany = async (id: string, c: Company) => {
    await apiUpdate("company", id, c);
    setCompanies((prev) => prev.map((item) => (item.id === id ? c : item)));
    await addAuditLog({ time: now(), user: "Super Admin", action: "Company Updated", detail: `Modified company ${id}`, type: "update" });
  };

  const deleteCompany = async (id: string) => {
    await apiDelete("company", id);
    setCompanies((prev) => prev.filter((item) => item.id !== id));
    await addAuditLog({ time: now(), user: "Super Admin", action: "Company Deleted", detail: `Deleted company ${id}`, type: "update" });
  };

  const addPayment = async (p: Payment) => {
    await apiSave("payment", p);
    setPayments((prev) => [p, ...prev]);
    await addAuditLog({ time: now(), user: "Super Admin", action: "Payment Created", detail: `Invoice ${p.id} - ${p.amount}`, type: "payment" });
  };

  const updatePayment = async (id: string, p: Payment) => {
    await apiUpdate("payment", id, p);
    setPayments((prev) => prev.map((item) => (item.id === id ? p : item)));
    await addAuditLog({ time: now(), user: "Super Admin", action: "Payment Updated", detail: `Modified invoice ${id}`, type: "payment" });
  };

  const deletePayment = async (id: string) => {
    await apiDelete("payment", id);
    setPayments((prev) => prev.filter((item) => item.id !== id));
    await addAuditLog({ time: now(), user: "Super Admin", action: "Payment Deleted", detail: `Deleted invoice ${id}`, type: "payment" });
  };

  const updateSubscription = async (index: number, s: Subscription) => {
    setSubscriptions((prev) => {
      const updated = prev.map((item, i) => (i === index ? s : item));
      apiSave("subscription", { id: String(index), ...s });
      return updated;
    });
    await addAuditLog({ time: now(), user: "Super Admin", action: "Subscription Updated", detail: `Modified package ${s.name}`, type: "update" });
  };

  const addCMSPage = async (p: CMSPage) => {
    await apiSave("cmsPage", p);
    setCMSPages((prev) => [...prev, p]);
    await addAuditLog({ time: now(), user: "Super Admin", action: "CMS Page Added", detail: `New page: ${p.title}`, type: "update" });
  };

  const updateCMSPage = async (title: string, p: CMSPage) => {
    await apiUpdate("cmsPage", title, p);
    setCMSPages((prev) => prev.map((item) => (item.title === title ? p : item)));
    await addAuditLog({ time: now(), user: "Super Admin", action: "CMS Page Updated", detail: `Modified page: ${p.title}`, type: "update" });
  };

  const deleteCMSPage = async (title: string) => {
    await apiDelete("cmsPage", title);
    setCMSPages((prev) => prev.filter((item) => item.title !== title));
    await addAuditLog({ time: now(), user: "Super Admin", action: "CMS Page Deleted", detail: `Deleted page: ${title}`, type: "update" });
  };

  const sendNotification = async (n: Notification) => {
    await apiSave("adminNotification", n);
    setNotifications((prev) => [n, ...prev]);
    await addAuditLog({ time: now(), user: "Super Admin", action: "Notification Sent", detail: `To: ${n.title}`, type: "system" });
  };

  const markNotificationRead = (index: number) => {
    setNotifications((prev) => prev.map((n, i) => (i === index ? { ...n, read: true } : n)));
  };

  const deleteNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = async (s: Settings) => {
    await apiUpdate("adminSettings", "admin-settings", {
      data: JSON.stringify(s),
      header: JSON.stringify(s.header),
      footer: JSON.stringify(s.footer),
      homepage: JSON.stringify(s.homepage),
    });
    setSettings(s);
    await addAuditLog({ time: now(), user: "Super Admin", action: "Settings Updated", detail: "System settings modified", type: "update" });
  };

  return (
    <DataContext.Provider value={{
      franchises, companies, employees, payments, subscriptions, cmsPages, notifications, auditLogs, settings,
      addFranchise, updateFranchise, deleteFranchise,
      addCompany, updateCompany, deleteCompany,
      addPayment, updatePayment, deletePayment,
      updateSubscription,
      addCMSPage, updateCMSPage, deleteCMSPage,
      sendNotification, markNotificationRead, deleteNotification, clearAllNotifications,
      updateSettings, addAuditLog,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}
