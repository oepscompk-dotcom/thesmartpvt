"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen, ArrowLeft, Plus, ArrowRightLeft, Repeat, Hash,
  Smartphone, CheckCircle2, Clock, AlertTriangle, ChevronRight,
  ChevronDown, ChevronUp, Fingerprint, PhoneCall, Wifi, Shield,
  ClipboardCheck, Eye, User, CreditCard, FileText, ArrowRight,
  Phone, Mail, MapPin, Calendar, Target, Zap, Star, Info
} from "lucide-react";

type Section = "overview" | "new-sim" | "mnp" | "replacement" | "byn" | "verification";

const steps = {
  "new-sim": {
    title: "New SIM Activation",
    icon: Plus,
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
    textColor: "text-blue-600",
    steps: [
      { step: 1, title: "Open Activation Page", desc: "Tap the Activate button on dashboard, then select New SIM Activation from the dropdown menu.", icon: Smartphone, detail: "The activation form opens with SIM type pre-selected as New." },
      { step: 2, title: "Enter Customer Details", desc: "Fill in customer name, mobile number, CNIC number, and address.", icon: User, detail: "All fields marked with * are mandatory. CNIC must be 13 digits." },
      { step: 3, title: "Select SIM Card", desc: "Choose an available SIM from the dropdown. SIMs with status In Stock are shown.", icon: CreditCard, detail: "Only SIMs available in stock will appear. Each SIM is uniquely identified by SIM Number." },
      { step: 4, title: "Select Device (Optional)", desc: "If a device is being issued with the SIM, select it from the device list.", icon: Smartphone, detail: "Device selection is optional. Only In Stock devices appear in the list." },
      { step: 5, title: "Select Package", desc: "Choose the activation package and tariff plan for the customer.", icon: FileText, detail: "Package selection determines the initial balance and activation bonus." },
      { step: 6, title: "Review & Submit", desc: "Review all details, then tap Submit Activation to complete.", icon: CheckCircle2, detail: "After submission, the SIM status changes to Activated. You can track it on the dashboard." },
    ],
    flowDiagram: ["Dashboard", "New SIM Form", "Customer Details", "SIM Selection", "Package Selection", "Submit", "Activation Complete"]
  },
  "mnp": {
    title: "MNP Process",
    icon: ArrowRightLeft,
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
    light: "bg-purple-50",
    textColor: "text-purple-600",
    steps: [
      { step: 1, title: "Open MNP Page", desc: "Tap Activate → MNP Process from the dashboard.", icon: Smartphone, detail: "MNP (Mobile Number Portability) transfers a number from another network." },
      { step: 2, title: "Enter Porting Details", desc: "Enter customer name, current number, current network, and CNIC.", icon: User, detail: "Select the customer's current network (Jazz, Telenor, Ufone, Zong)." },
      { step: 3, title: "Upload Documents", desc: "Upload CNIC front/back images and the MNP request form.", icon: FileText, detail: "Documents are required for MNP approval. Files must be under 5MB each." },
      { step: 4, title: "Select New SIM", desc: "Choose an HLR SIM from stock for the ported number.", icon: CreditCard, detail: "MNP uses HLR (Home Location Register) SIMs, not new SIMs." },
      { step: 5, title: "Submit MNP Request", desc: "Submit the request. Status will show as Pending MNP approval.", icon: Clock, detail: "MNP typically takes 3-7 working days. Track status on the dashboard." },
      { step: 6, title: "MNP Completion", desc: "Once approved, the number transfers to your network automatically.", icon: CheckCircle2, detail: "The customer can now use the number on the new network." },
    ],
    flowDiagram: ["Dashboard", "MNP Form", "Porting Details", "Document Upload", "SIM Selection", "Submit Request", "MNP Processing", "Transfer Complete"]
  },
  "replacement": {
    title: "SIM Replacement",
    icon: Repeat,
    color: "orange",
    gradient: "from-orange-500 to-orange-600",
    light: "bg-orange-50",
    textColor: "text-orange-600",
    steps: [
      { step: 1, title: "Open Replacement Page", desc: "Tap Activate → SIM Replacement from the dashboard.", icon: Smartphone, detail: "SIM replacement is for damaged, lost, or stolen SIMs." },
      { step: 2, title: "Enter Customer Details", desc: "Enter customer name, existing number, CNIC, and reason for replacement.", icon: User, detail: "Select the reason: Damaged, Lost, Stolen, or Defective." },
      { step: 3, title: "Select Replacement SIM", desc: "Choose a new HLR SIM from stock to replace the old one.", icon: CreditCard, detail: "The old SIM will be deactivated automatically after replacement." },
      { step: 4, title: "Verify Identity", desc: "Verify customer identity using CNIC and biometric if available.", icon: Fingerprint, detail: "Biometric verification is recommended for security." },
      { step: 5, title: "Submit Replacement", desc: "Submit the replacement request. Old SIM deactivates immediately.", icon: CheckCircle2, detail: "The customer receives a new SIM with the same number." },
      { step: 6, title: "Confirmation", desc: "Customer receives confirmation SMS on the new SIM.", icon: Phone, detail: "Replacement is instant. Customer can start using the new SIM right away." },
    ],
    flowDiagram: ["Dashboard", "Replacement Form", "Customer Details", "SIM Selection", "Identity Verification", "Submit", "Replacement Complete"]
  },
  "byn": {
    title: "BYN Registration",
    icon: Hash,
    color: "teal",
    gradient: "from-teal-500 to-teal-600",
    light: "bg-teal-50",
    textColor: "text-teal-600",
    steps: [
      { step: 1, title: "Open BYN Page", desc: "Tap Activate → BYN Registration from the dashboard.", icon: Smartphone, detail: "BYN (Bring Your Number) registers a new device on the network." },
      { step: 2, title: "Enter Device Details", desc: "Enter device IMEI, brand, model, and customer information.", icon: Smartphone, detail: "IMEI must be 15 digits. The system auto-detects brand and model." },
      { step: 3, title: "Select SIM for BYN", desc: "Choose the SIM card that will be used with this device.", icon: CreditCard, detail: "The SIM must be active and in stock for BYN registration." },
      { step: 4, title: "Enter Network Info", desc: "Select network operator and enter any required authorization codes.", icon: Wifi, detail: "BYN links the device IMEI to the SIM for network registration." },
      { step: 5, title: "Submit BYN Request", desc: "Submit the BYN registration. Device will be registered on the network.", icon: CheckCircle2, detail: "BYN registration is usually instant. Device can make calls immediately." },
      { step: 6, title: "Registration Complete", desc: "Device is registered. Customer can now use the device with the SIM.", icon: Star, detail: "The device IMEI is now linked to the network and SIM." },
    ],
    flowDiagram: ["Dashboard", "BYN Form", "Device Details", "SIM Selection", "Network Info", "Submit", "Registration Complete"]
  }
};

const verificationSteps = [
  {
    title: "BVS (Biometric Verification System)",
    icon: Fingerprint,
    color: "amber",
    steps: [
      "Open Pending BVS from DSO menu",
      "View list of activations pending BVS",
      "Select activation(s) to verify",
      "Perform biometric scan on customer device",
      "System validates fingerprint against NADRA",
      "If matched → BVS status changes to Completed",
      "If failed → Mark for manual verification",
    ]
  },
  {
    title: "FCA (Fingerprint Confirmation Agent)",
    icon: PhoneCall,
    color: "blue",
    steps: [
      "Open Pending FCA from DSO menu",
      "View activations with BVS Completed but FCA Pending",
      "Select activation for FCA verification",
      "Agent performs fingerprint confirmation",
      "System sends confirmation to network operator",
      "FCA status changes to Completed",
      "Activation moves to IFCA pending stage",
    ]
  },
  {
    title: "IFCA (International FCA)",
    icon: Wifi,
    color: "purple",
    steps: [
      "Open Pending IFCA from DSO menu",
      "View activations with FCA Completed but IFCA Pending",
      "Select activation for IFCA verification",
      "System performs international verification check",
      "Network confirms activation validity",
      "IFCA status changes to Completed",
      "Activation status changes to Completed",
    ]
  },
];

function PhoneMockup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{title}</p>
      <div className="relative w-[280px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
        <div className="bg-white rounded-[2rem] overflow-hidden min-h-[500px]">
          <div className="bg-[#0A2647] text-white px-4 py-3 pt-8">
            <p className="text-[10px] text-white/60">THE SMART ERP</p>
            <p className="text-sm font-bold">{title}</p>
          </div>
          <div className="p-3 space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, placeholder, icon: Icon }: { label: string; placeholder: string; icon: any }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-gray-600">{label} *</label>
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
        <Icon size={12} className="text-gray-400" />
        <span className="text-[10px] text-gray-400">{placeholder}</span>
      </div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-1.5 rounded-full flex-1 ${i < current ? "bg-blue-500" : "bg-gray-200"}`} />
      ))}
    </div>
  );
}

export default function DSOGuidelinePage() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedVerification, setExpandedVerification] = useState<number | null>(null);

  const navItems: { key: Section; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BookOpen },
    { key: "new-sim", label: "New SIM", icon: Plus },
    { key: "mnp", label: "MNP Process", icon: ArrowRightLeft },
    { key: "replacement", label: "Replacement", icon: Repeat },
    { key: "byn", label: "BYN", icon: Hash },
    { key: "verification", label: "Verification", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A2647] via-[#144272] to-[#205295] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dso/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black flex items-center gap-2">
                <BookOpen size={20} /> DSO Guideline & Instructions
              </h1>
              <p className="text-white/60 text-xs mt-0.5">Complete guide for using THE SMART ERP DSO Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setExpandedStep(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeSection === item.key
                    ? "bg-[#0A2647] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ═══════════ OVERVIEW ═══════════ */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-black text-gray-900 mb-2">Welcome to DSO Portal</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                As a Distribution Sales Officer (DSO), you are responsible for SIM activations, device management, and retailer support. This guide will walk you through every feature of the DSO portal.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Activation Types", value: "4", icon: Zap, color: "text-blue-600 bg-blue-50" },
                { label: "Verification Steps", value: "3", icon: Shield, color: "text-amber-600 bg-amber-50" },
                { label: "SIM Types", value: "2", icon: CreditCard, color: "text-green-600 bg-green-50" },
                { label: "Networks", value: "4", icon: Wifi, color: "text-purple-600 bg-purple-50" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon size={18} />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Activation Flow Overview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <Target size={16} className="text-[#C8A951]" /> Activation Flow Overview
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {["Dashboard", "Select Type", "Fill Form", "Select SIM", "Submit", "Track Status", "Verification"].map((step, i, arr) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-[#0A2647] text-white flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-[10px] font-medium text-gray-600 text-center w-16">{step}</span>
                    </div>
                    {i < arr.length - 1 && <ArrowRight size={14} className="text-gray-300 mb-4" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Card Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "new-sim" as Section, title: "New SIM Activation", desc: "Activate new SIM cards for customers", icon: Plus, color: "blue" },
                { key: "mnp" as Section, title: "MNP Process", desc: "Transfer numbers from other networks", icon: ArrowRightLeft, color: "purple" },
                { key: "replacement" as Section, title: "SIM Replacement", desc: "Replace damaged or lost SIMs", icon: Repeat, color: "orange" },
                { key: "byn" as Section, title: "BYN Registration", desc: "Register devices on the network", icon: Hash, color: "teal" },
              ].map((card) => (
                <button
                  key={card.key}
                  onClick={() => setActiveSection(card.key)}
                  className={`bg-white rounded-2xl border border-gray-200 p-5 text-left hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-${card.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <card.icon size={22} className={`text-${card.color}-600`} />
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 mt-1" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 mt-3">{card.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{card.desc}</p>
                </button>
              ))}
            </div>

            {/* Verification Overview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={16} className="text-amber-500" /> Verification Process Overview
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {["Activation", "BVS Check", "FCA Confirm", "IFCA Verify", "Completed"].map((step, i, arr) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-10 h-10 rounded-xl ${i < arr.length - 1 ? "bg-amber-500" : "bg-green-500"} text-white flex items-center justify-center text-xs font-bold`}>
                        {i < arr.length - 1 ? <Fingerprint size={16} /> : <CheckCircle2 size={16} />}
                      </div>
                      <span className="text-[10px] font-medium text-gray-600 text-center w-16">{step}</span>
                    </div>
                    {i < arr.length - 1 && <ArrowRight size={14} className="text-gray-300 mb-4" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ ACTIVATION PAGES ═══════════ */}
        {activeSection !== "overview" && activeSection !== "verification" && steps[activeSection] && (
          <div className="space-y-6">
            {(() => {
              const data = steps[activeSection];
              return (
                <>
                  {/* Title */}
                  <div className={`bg-gradient-to-r ${data.gradient} rounded-2xl p-6 text-white`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <data.icon size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black">{data.title}</h2>
                        <p className="text-white/70 text-xs mt-0.5">Step-by-step procedure guide</p>
                      </div>
                    </div>
                  </div>

                  {/* Flow Diagram */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-[#C8A951]" /> Process Flow
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {data.flowDiagram.map((step, i, arr) => (
                        <div key={step} className="flex items-center gap-2">
                          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${i === arr.length - 1 ? "bg-green-50 text-green-700" : `${data.light} ${data.textColor}`}`}>
                            {step}
                          </div>
                          {i < arr.length - 1 && <ArrowRight size={12} className="text-gray-300" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Steps + Phone Mockup */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Steps */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-gray-900">Step-by-Step Procedure</h3>
                      {data.steps.map((s) => (
                        <div
                          key={s.step}
                          className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${expandedStep === s.step ? "shadow-lg border-blue-200" : "hover:shadow-md"}`}
                        >
                          <button
                            onClick={() => setExpandedStep(expandedStep === s.step ? null : s.step)}
                            className="w-full flex items-center gap-3 p-4 text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg ${data.light} ${data.textColor} flex items-center justify-center text-xs font-bold shrink-0`}>
                              {s.step}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900">{s.title}</p>
                              <p className="text-gray-500 text-xs truncate">{s.desc}</p>
                            </div>
                            {expandedStep === s.step ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                          </button>
                          {expandedStep === s.step && (
                            <div className="px-4 pb-4 pt-0">
                              <div className={`p-3 rounded-lg ${data.light} border border-${data.color}-100`}>
                                <p className={`text-xs ${data.textColor} leading-relaxed`}>{s.detail}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Phone Mockup */}
                    <div className="flex justify-center lg:sticky lg:top-20 lg:self-start">
                      <PhoneMockup title={data.title}>
                        <StepIndicator current={expandedStep || 1} total={6} />
                        {data.steps.map((s) => (
                          <div
                            key={s.step}
                            className={`rounded-lg p-2.5 border transition-all ${
                              expandedStep === s.step
                                ? `border-${data.color}-300 bg-${data.color}-50`
                                : "border-gray-100 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                expandedStep === s.step
                                  ? `${data.textColor} bg-white`
                                  : "text-gray-400 bg-gray-100"
                              }`}>
                                {expandedStep === s.step ? <CheckCircle2 size={12} /> : s.step}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-gray-900">{s.title}</p>
                                <p className="text-[9px] text-gray-400 truncate">{s.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-2">
                          <div className={`w-full py-2 rounded-lg text-center text-[10px] font-bold text-white ${
                            expandedStep === 6 ? "bg-green-500" : "bg-gray-300"
                          }`}>
                            {expandedStep === 6 ? "✓ Submit Activation" : "Complete all steps"}
                          </div>
                        </div>
                      </PhoneMockup>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ═══════════ VERIFICATION ═══════════ */}
        {activeSection === "verification" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black">Verification Process</h2>
                  <p className="text-white/70 text-xs mt-0.5">BVS → FCA → IFCA verification workflow</p>
                </div>
              </div>
            </div>

            {/* Verification Flow */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4">Complete Verification Pipeline</h3>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { label: "Activation", color: "bg-blue-500", icon: Smartphone },
                  { label: "BVS", color: "bg-amber-500", icon: Fingerprint },
                  { label: "FCA", color: "bg-blue-500", icon: PhoneCall },
                  { label: "IFCA", color: "bg-purple-500", icon: Wifi },
                  { label: "Completed", color: "bg-green-500", icon: CheckCircle2 },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-12 h-12 rounded-xl ${step.color} text-white flex items-center justify-center`}>
                        <step.icon size={20} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{step.label}</span>
                    </div>
                    {i < arr.length - 1 && <ArrowRight size={16} className="text-gray-300 mb-5" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {verificationSteps.map((v, vi) => (
                  <div
                    key={v.title}
                    className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${expandedVerification === vi ? "shadow-lg" : "hover:shadow-md"}`}
                  >
                    <button
                      onClick={() => setExpandedVerification(expandedVerification === vi ? null : vi)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-${v.color}-50 text-${v.color}-600 flex items-center justify-center shrink-0`}>
                        <v.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{v.title}</p>
                        <p className="text-gray-400 text-xs">{v.steps.length} steps</p>
                      </div>
                      {expandedVerification === vi ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>
                    {expandedVerification === vi && (
                      <div className="px-4 pb-4 space-y-2">
                        {v.steps.map((step, si) => (
                          <div key={si} className="flex items-start gap-2.5">
                            <div className={`w-5 h-5 rounded-full bg-${v.color}-100 text-${v.color}-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5`}>
                              {si + 1}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Phone Mockup for Verification */}
              <div className="flex justify-center lg:sticky lg:top-20 lg:self-start">
                <PhoneMockup title="Verification">
                  <div className="space-y-2">
                    <StepIndicator current={expandedVerification !== null ? expandedVerification + 1 : 1} total={3} />
                    {verificationSteps.map((v, vi) => (
                      <div
                        key={v.title}
                        className={`rounded-lg p-2.5 border transition-all ${
                          expandedVerification === vi
                            ? `border-${v.color}-300 bg-${v.color}-50`
                            : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            expandedVerification === vi
                              ? `text-${v.color}-600 bg-white`
                              : "text-gray-400 bg-gray-100"
                          }`}>
                            {expandedVerification === vi ? <CheckCircle2 size={12} /> : <v.icon size={10} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-900">{v.title.split("(")[0].trim()}</p>
                            <p className="text-[9px] text-gray-400">{v.steps.length} steps</p>
                          </div>
                        </div>
                        {expandedVerification === vi && (
                          <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200 ml-3">
                            {v.steps.slice(0, 4).map((step, si) => (
                              <div key={si} className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded-full bg-${v.color}-100 flex items-center justify-center`}>
                                  <div className={`w-1.5 h-1.5 rounded-full bg-${v.color}-500`} />
                                </div>
                                <p className="text-[8px] text-gray-600 truncate">{step}</p>
                              </div>
                            ))}
                            <p className="text-[8px] text-gray-400 pl-4">+{v.steps.length - 4} more steps</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-2 bg-green-50 rounded-lg text-center">
                    <p className="text-[9px] font-bold text-green-700">✓ All verifications passed</p>
                    <p className="text-[8px] text-green-500">Activation Completed</p>
                  </div>
                </PhoneMockup>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
