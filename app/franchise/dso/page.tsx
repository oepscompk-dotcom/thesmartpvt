"use client";
export const dynamic = "force-dynamic";

import { useState, useMemo, Fragment } from "react";
import {
  Plus, Search, Edit, Trash2, Eye, X, Save, Users, ArrowRight,
  Filter, FileText, DollarSign, Download, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2, Upload, Calculator, TrendingUp, Wallet,
  ChevronDown, ChevronUp, Printer, Smartphone,
} from "lucide-react";
import { useFranchiseData, DSO, genId, genUsername, genPassword } from "@/lib/FranchiseDataContext";
import { useDSOData } from "@/lib/DSODataContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

type Tab = "all" | "documents" | "salary" | "inactive";

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-50 text-green-700 border border-green-200",
  Inactive: "bg-amber-50 text-amber-700 border border-amber-200",
  Suspended: "bg-red-50 text-red-700 border border-red-200",
  Resigned: "bg-purple-50 text-purple-700 border border-purple-200",
};

const SALARY_FIELDS: { key: string; label: string; field: keyof DSO; type?: string }[] = [
  { key: "salary", label: "Basic Salary", field: "salary" },
  { key: "fuelAllowance", label: "Fuel Allow.", field: "fuelAllowance" },
  { key: "mobileAllowance", label: "Mobile Allow.", field: "mobileAllowance" },
  { key: "dailyAllowance", label: "Daily Allow.", field: "dailyAllowance" },
  { key: "newSimCommission", label: "New SIM Comm.", field: "newSimCommission", type: "commission" },
  { key: "newSimBvs", label: "New SIM-BVS", field: "newSimBvs", type: "commission" },
  { key: "newSimFca", label: "New SIM-FCA", field: "newSimFca", type: "commission" },
  { key: "newSimIfca", label: "New SIM-IFCA", field: "newSimIfca", type: "commission" },
  { key: "mnpCommission", label: "MNP Comm.", field: "mnpCommission", type: "commission" },
  { key: "mnpBvs", label: "MNP-BVS", field: "mnpBvs", type: "commission" },
  { key: "mnpFca", label: "MNP-FCA", field: "mnpFca", type: "commission" },
  { key: "mnpIfca", label: "MNP-IFCA", field: "mnpIfca", type: "commission" },
  { key: "replacementCommission", label: "Replace Comm.", field: "replacementCommission", type: "commission" },
  { key: "replacementBvs", label: "Repl-BVS", field: "replacementBvs", type: "commission" },
  { key: "replacementFca", label: "Repl-FCA", field: "replacementFca", type: "commission" },
  { key: "replacementIfca", label: "Repl-IFCA", field: "replacementIfca", type: "commission" },
  { key: "bynCommission", label: "BYN Comm.", field: "bynCommission", type: "commission" },
  { key: "bynBvs", label: "BYN-BVS", field: "bynBvs", type: "commission" },
  { key: "bynFca", label: "BYN-FCA", field: "bynFca", type: "commission" },
  { key: "bynIfca", label: "BYN-IFCA", field: "bynIfca", type: "commission" },
  { key: "hikeCommission", label: "Hike Comm.", field: "hikeCommission", type: "commission" },
  { key: "otherCommission", label: "Other Comm.", field: "otherCommission", type: "commission" },
  { key: "targetBonus", label: "Target Bonus", field: "targetBonus" },
  { key: "bonus", label: "Bonus", field: "bonus" },
  { key: "advanceSalary", label: "Advance Salary", field: "advanceSalary", type: "deduction" },
  { key: "loanDeduction", label: "Loan Deduction", field: "loanDeduction", type: "deduction" },
  { key: "otherDeduction", label: "Other Deduction", field: "otherDeduction", type: "deduction" },
];

const DOC_FIELDS: { key: string; label: string; path: (d: DSO) => string | undefined }[] = [
  { key: "cnicFront", label: "CNIC Front", path: (d) => d.documents?.cnicFront },
  { key: "cnicBack", label: "CNIC Back", path: (d) => d.documents?.cnicBack },
  { key: "photo", label: "Photo", path: (d) => d.photo },
  { key: "eduCert", label: "Edu Cert", path: (d) => d.documents?.educationalCert },
  { key: "expCert", label: "Exp Cert", path: (d) => d.documents?.experienceCert },
  { key: "agreement", label: "Agreement", path: (d) => d.agreements?.agreementPdf },
  { key: "stampPaper", label: "Stamp Paper", path: (d) => d.agreements?.stampPaperCopy },
  { key: "guarantor", label: "Guarantor", path: (d) => d.guarantor?.guaranteeLetter },
];

export default function DSOPage() {
  const { auth, dso, dsms, addDSO, updateDSO, deleteDSO } = useFranchiseData();
  const { activations, importVerifications } = useDSOData();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [viewDSO, setViewDSO] = useState<DSO | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const [salaryEdits, setSalaryEdits] = useState<Record<string, Partial<DSO>>>({});

  const applyFilters = (list: DSO[]) => {
    let result = list;
    if (statusFilter !== "All") {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          (d.employeeCode && d.employeeCode.toLowerCase().includes(q)) ||
          (d.mobile && d.mobile.includes(q))
      );
    }
    if (dateFrom) {
      result = result.filter((d) => d.joiningDate >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((d) => d.joiningDate <= dateTo);
    }
    return result;
  };

  const allFiltered = applyFilters(dso);
  const activeDSO = allFiltered.filter((d) => d.status === "Active");
  const inactiveDSO = allFiltered.filter((d) => d.status === "Inactive" || d.status === "Resigned");
  const suspendedDSO = allFiltered.filter((d) => d.status === "Suspended");

  const tabList: DSO[] =
    activeTab === "inactive"
      ? inactiveDSO
      : activeTab === "all"
      ? allFiltered
      : allFiltered;

  const totalPages = Math.max(1, Math.ceil(tabList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = tabList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const openEdit = (d: DSO) => {
    router.push("/franchise/dso/create?edit=" + d.id);
  };

  const handleDelete = (id: string) => {
    deleteDSO(id);
    setShowDelete(null);
  };

  const downloadSalarySlip = (emp: DSO, monthVal?: string) => {
    const m = monthVal || new Date().toISOString().slice(0, 7);
    const empActivations = activations.filter((a) => a.dsoId === emp.id && a.createdAt?.slice(0, 7) === m && a.status === "Completed");
    const pick = (impV: string | undefined, actV: string) =>
      impV === "1" ? "1" : actV === "0" ? "0" : impV === "0" ? "0" : "X";
    const actBvs = (a: any) => a.bvsStatus === "Completed" ? "0" : "X";
    const actFca = (a: any) => a.fcaStatus === "Completed" ? "0" : "X";
    const actIfca = (a: any) => a.ifcaStatus === "Completed" ? "0" : "X";
    let newSimBvs = 0, newSimFca = 0, newSimIfca = 0;
    let mnpBvs = 0, mnpFca = 0, mnpIfca = 0;
    let replBvs = 0, replFca = 0, replIfca = 0;
    let bynBvs = 0, bynFca = 0, bynIfca = 0;
    let bvsCount = 0, fcaCount = 0, ifcaCount = 0;
    let newSimCount = 0, mnpCount = 0, replCount = 0, bynCount = 0;
    empActivations.forEach((a) => {
      const iv = importVerifications?.[a.simNumber];
      const bv = pick(iv?.bvs, actBvs(a));
      const fc = pick(iv?.fca, actFca(a));
      const ic = pick(iv?.ifca, actIfca(a));
      if (bv === "1") bvsCount++;
      if (fc === "1") fcaCount++;
      if (ic === "1") ifcaCount++;
      if (a.type === "New SIM") {
        newSimCount++;
        if (bv === "1") newSimBvs++;
        if (fc === "1") newSimFca++;
        if (ic === "1") newSimIfca++;
      } else if (a.type === "MNP") {
        mnpCount++;
        if (bv === "1") mnpBvs++;
        if (fc === "1") mnpFca++;
        if (ic === "1") mnpIfca++;
      } else if (a.type === "Replacement") {
        replCount++;
        if (bv === "1") replBvs++;
        if (fc === "1") replFca++;
        if (ic === "1") replIfca++;
      } else if (a.type === "BYN") {
        bynCount++;
        if (bv === "1") bynBvs++;
        if (fc === "1") bynFca++;
        if (ic === "1") bynIfca++;
      }
    });
    const v = (f: string) => (emp[f as keyof DSO] as number) || 0;
    const basic = v("salary");
    const fuel = v("fuelAllowance"), mobile = v("mobileAllowance"), daily = v("dailyAllowance"), residence = v("residenceAllowance");
    const totalAllow = fuel + mobile + daily + residence;
    const newSimComm = newSimBvs * v("newSimBvs") + newSimFca * v("newSimFca") + newSimIfca * v("newSimIfca");
    const mnpComm = mnpBvs * v("mnpBvs") + mnpFca * v("mnpFca") + mnpIfca * v("mnpIfca");
    const replComm = replBvs * v("replacementBvs") + replFca * v("replacementFca") + replIfca * v("replacementIfca");
    const bynComm = bynBvs * v("bynBvs") + bynFca * v("bynFca") + bynIfca * v("bynIfca");
    const hike = v("hikeCommission"), other = v("otherCommission");
    const totalComm = newSimComm + mnpComm + replComm + bynComm + hike + other;
    const targetBonus = v("targetBonus"), perfBonus = v("bonus");
    const advance = v("advanceSalary"), loan = v("loanDeduction"), otherDed = v("otherDeduction");
    const totalDed = advance + loan + otherDed;
    const gross = basic + totalAllow + totalComm + targetBonus + perfBonus;
    const netPay = gross - totalDed;

    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB");
    const timeStr = now.toLocaleTimeString();
    const monthName = new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const slipId = `SLIP-${emp.id}-${m.replace("-", "")}`;
    const initial = (emp.name || "E").charAt(0).toUpperCase();

    printWin.document.write(`<!DOCTYPE html>
<html><head><title>Salary Slip - ${emp.name} - ${monthName}</title>
<style>
  @page { size: A4; margin: 8mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: #eef1f5; padding: 20px; color: #1e293b; font-size: 11px; line-height: 1.5; }
  .slip { max-width: 190mm; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.06); overflow: hidden; position: relative; }
  .top-accent { height: 4px; background: linear-gradient(90deg, #C8A951 0%, #e0c46a 50%, #C8A951 100%); }
  .header { padding: 24px 32px 16px; text-align: center; position: relative; }
  .header .company { font-size: 20px; font-weight: 800; color: #0A2647; letter-spacing: 2px; }
  .header .company span { color: #C8A951; }
  .header .tagline { font-size: 8px; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase; margin-top: 2px; }
  .header .divider-line { width: 50px; height: 2px; background: #C8A951; margin: 10px auto; }
  .header .slip-title { font-size: 15px; font-weight: 700; color: #1e293b; }
  .header .slip-period { font-size: 10px; color: #64748b; margin-top: 2px; }
  .header .slip-ref { position: absolute; top: 24px; right: 32px; font-size: 8px; color: #94a3b8; text-align: right; }
  .emp-section { display: flex; align-items: center; padding: 18px 32px; background: #f8fafc; border-top: 1px solid #e8ecf0; border-bottom: 1px solid #e8ecf0; }
  .emp-avatar { width: 44px; height: 44px; border-radius: 50%; background: #0A2647; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; margin-right: 14px; flex-shrink: 0; }
  .emp-info { flex: 1; }
  .emp-info .name { font-size: 14px; font-weight: 700; color: #0A2647; }
  .emp-info .meta { font-size: 10px; color: #64748b; margin-top: 2px; }
  .emp-info .meta span { margin-right: 14px; }
  .emp-badge { text-align: right; flex-shrink: 0; }
  .emp-badge .role { font-size: 10px; font-weight: 600; color: #fff; background: #0A2647; padding: 3px 12px; border-radius: 20px; display: inline-block; }
  .emp-badge .status { font-size: 9px; color: #64748b; margin-top: 3px; }
  .content { padding: 0 32px; }
  .section-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 18px 0 8px; display: flex; align-items: center; gap: 8px; }
  .section-label::after { content: ''; flex: 1; height: 1px; background: #e8ecf0; }
  table { width: 100%; border-collapse: collapse; }
  table td { padding: 5px 8px; border-bottom: 1px solid #f0f2f5; }
  .row-label { color: #475569; }
  .row-value { text-align: right; font-weight: 500; color: #1e293b; }
  .row-sub { padding-left: 20px !important; font-size: 10px; color: #64748b; }
  .row-sub .act-badge { display: inline-block; padding: 0 5px; border-radius: 3px; font-size: 9px; font-weight: 600; margin-right: 3px; }
  .act-blue { background: #dbeafe; color: #1e40af; }
  .act-purple { background: #f3e8ff; color: #6b21a8; }
  .act-orange { background: #fef3c7; color: #92400e; }
  .act-teal { background: #ccfbf1; color: #0f766e; }
  .row-alt { background: #fafbfc; }
  .row-divider td { padding: 0 !important; height: 6px; border-bottom: none; }
  .row-group-title { font-weight: 600; color: #0A2647; font-size: 10px; padding: 8px 8px 4px !important; background: #f1f5f9; border-bottom: none !important; }
  .row-total td { font-weight: 700; border-top: 2px solid #0A2647; background: #f0f4ff !important; }
  .row-total .row-value { color: #0A2647; }
  .row-deduction .row-value { color: #dc2626; }
  .row-ded-total td { font-weight: 700; border-top: 2px solid #dc2626; background: #fef2f2 !important; }
  .row-ded-total .row-value { color: #dc2626; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
  .summary-card { background: #f8fafc; border: 1px solid #e8ecf0; border-radius: 8px; padding: 12px 14px; }
  .summary-card .sc-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-card .sc-value { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px; }
  .net-pay-box { margin: 16px 0; background: linear-gradient(135deg, #0A2647 0%, #1a4a7a 100%); border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .net-pay-box .np-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .net-pay-box .np-amount { font-size: 22px; font-weight: 800; color: #C8A951; }
  .net-pay-box .np-sub { font-size: 8px; color: #64748b; }
  .amt-words { background: #f0f4ff; border-left: 3px solid #C8A951; padding: 10px 16px; margin: 12px 0; font-size: 10px; color: #475569; border-radius: 0 6px 6px 0; }
  .barcode-wrap { text-align: center; padding: 8px 0 4px; }
  .barcode-wrap canvas { display: inline-block; background: #fff; }
  .barcode-wrap .bcode-id { font-size: 9px; color: #94a3b8; letter-spacing: 1px; font-family: 'Courier New', monospace; margin-top: 2px; }
  .footer { text-align: center; padding: 12px 32px 16px; border-top: 1px solid #e8ecf0; margin-top: 8px; }
  .footer p { font-size: 8px; color: #94a3b8; margin: 1px 0; }
  .no-print { padding: 14px 32px 0; text-align: right; }
  .no-print button { padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; margin-left: 8px; transition: opacity 0.2s; }
  .no-print button:hover { opacity: 0.9; }
  .btn-print { background: #0A2647; color: #fff; }
  .btn-close { background: #e2e8f0; color: #475569; }
  @media print { body { background: #fff; padding: 0; } .no-print { display: none; } .slip { box-shadow: none; border-radius: 0; } .top-accent { height: 3px; } }
</style></head>
<body>
<div class="slip">
  <div class="top-accent"></div>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">Print Salary Slip</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
  <div class="header">
    <div class="slip-ref">Ref: ${slipId}</div>
    <div class="company">THE SMART <span>ERP</span></div>
    <div class="tagline">Enterprise Telecom Distribution Platform</div>
    <div class="divider-line"></div>
    <div class="slip-title">Salary Slip</div>
    <div class="slip-period">${monthName}</div>
  </div>
  <div class="emp-section">
    <div class="emp-avatar">${initial}</div>
    <div class="emp-info">
      <div class="name">${emp.name}</div>
      <div class="meta">
        <span>ID: ${emp.id}</span>
        <span>CNIC: ${emp.cnic || "—"}</span>
        ${emp.fatherName ? "<span>S/o " + emp.fatherName + "</span>" : ""}
      </div>
    </div>
    <div class="emp-badge">
      <div class="role">DSO</div>
      <div class="status">${emp.status || "Active"}</div>
    </div>
  </div>
  <div class="content">
    <div class="section-label">Earnings</div>
    <table>
      <tr><td class="row-label">Basic Salary</td><td class="row-value">PKR ${basic.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label row-sub">Fuel Allowance</td><td class="row-value">PKR ${fuel.toLocaleString()}</td></tr>
      <tr><td class="row-label row-sub">Mobile Allowance</td><td class="row-value">PKR ${mobile.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label row-sub">Daily Allowance</td><td class="row-value">PKR ${daily.toLocaleString()}</td></tr>
      <tr><td class="row-label row-sub">Residence Allowance</td><td class="row-value">PKR ${residence.toLocaleString()}</td></tr>
      <tr class="row-total"><td class="row-label">Total Allowances</td><td class="row-value">PKR ${totalAllow.toLocaleString()}</td></tr>
      <tr class="row-divider"><td colspan="2"></td></tr>
      <tr><td class="row-label">New SIM <span style="font-size:9px;color:#94a3b8;">BVS(${newSimBvs}×${v("newSimBvs")})+FCA(${newSimFca}×${v("newSimFca")})+IFCA(${newSimIfca}×${v("newSimIfca")})</span></td><td class="row-value">PKR ${newSimComm.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">MNP <span style="font-size:9px;color:#94a3b8;">BVS(${mnpBvs}×${v("mnpBvs")})+FCA(${mnpFca}×${v("mnpFca")})+IFCA(${mnpIfca}×${v("mnpIfca")})</span></td><td class="row-value">PKR ${mnpComm.toLocaleString()}</td></tr>
      <tr><td class="row-label">Replacement <span style="font-size:9px;color:#94a3b8;">BVS(${replBvs}×${v("replacementBvs")})+FCA(${replFca}×${v("replacementFca")})+IFCA(${replIfca}×${v("replacementIfca")})</span></td><td class="row-value">PKR ${replComm.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">BYN <span style="font-size:9px;color:#94a3b8;">BVS(${bynBvs}×${v("bynBvs")})+FCA(${bynFca}×${v("bynFca")})+IFCA(${bynIfca}×${v("bynIfca")})</span></td><td class="row-value">PKR ${bynComm.toLocaleString()}</td></tr>
      <tr><td class="row-label row-sub">Hike Commission</td><td class="row-value">PKR ${hike.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label row-sub">Other Commission</td><td class="row-value">PKR ${other.toLocaleString()}</td></tr>
      <tr class="row-total"><td class="row-label">Total Commission</td><td class="row-value">PKR ${totalComm.toLocaleString()}</td></tr>
      <tr class="row-divider"><td colspan="2"></td></tr>
      <tr><td class="row-label">Target Bonus</td><td class="row-value">PKR ${targetBonus.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">Performance Bonus</td><td class="row-value">PKR ${perfBonus.toLocaleString()}</td></tr>
      <tr class="row-total"><td class="row-label">Gross Earnings</td><td class="row-value">PKR ${gross.toLocaleString()}</td></tr>
    </table>
    <div class="section-label">Deductions</div>
    <table>
      <tr><td class="row-label">Advance Salary</td><td class="row-value row-deduction">PKR ${advance.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">Loan Deduction</td><td class="row-value row-deduction">PKR ${loan.toLocaleString()}</td></tr>
      <tr><td class="row-label">Other Deduction</td><td class="row-value row-deduction">PKR ${otherDed.toLocaleString()}</td></tr>
      <tr class="row-ded-total"><td class="row-label">Total Deductions</td><td class="row-value">PKR ${totalDed.toLocaleString()}</td></tr>
    </table>
    <div class="summary-grid">
      <div class="summary-card"><div class="sc-label">Total Activations</div><div class="sc-value">${newSimCount + mnpCount + replCount + bynCount}  |  BVS:${bvsCount}  FCA:${fcaCount}  IFCA:${ifcaCount}</div></div>
      <div class="summary-card"><div class="sc-label">Gross Pay</div><div class="sc-value">PKR ${gross.toLocaleString()}</div></div>
    </div>
    <div class="net-pay-box">
      <div><div class="np-label">Net Payable</div><div class="np-sub">After all allowances &amp; deductions</div></div>
      <div class="np-amount">PKR ${netPay.toLocaleString()}</div>
    </div>
    <div class="amt-words" id="amtWords"><strong>Amount in Words:</strong> Rupees — Only</div>
    <div class="barcode-wrap">
      <canvas id="barcode"></canvas>
      <div class="bcode-id">${slipId}</div>
    </div>
  </div>
  <div class="footer">
    <p>This is a computer-generated salary slip for the period of ${monthName}.</p>
    <p>Generated: ${dateStr} at ${timeStr} &bull; THE SMART ERP Payroll System &bull; Pakistan</p>
  </div>
</div>
<script>
function numberToWords(n) {
  if (n === 0) return "Zero";
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const fn = (num) => {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num/10)] + (num%10 ? " " + a[num%10] : "");
    if (num < 1000) return a[Math.floor(num/100)] + " Hundred" + (num%100 ? " and " + fn(num%100) : "");
    if (num < 100000) return fn(Math.floor(num/1000)) + " Thousand" + (num%1000 ? " " + fn(num%1000) : "");
    if (num < 10000000) return fn(Math.floor(num/100000)) + " Lakh" + (num%100000 ? " " + fn(num%100000) : "");
    return fn(Math.floor(num/10000000)) + " Crore" + (num%10000000 ? " " + fn(num%10000000) : "");
  };
  return fn(Math.round(n));
}
document.getElementById('amtWords').innerHTML = '<strong>Amount in Words:</strong> Rupees ' + numberToWords(${netPay}) + ' Only';
(function() {
  var c = document.getElementById('barcode');
  if (!c) return;
  var ctx = c.getContext('2d');
  c.width = 280; c.height = 44;
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,c.width,c.height);
  var txt = '${slipId}';
  var x = 10;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(5, 4, 3, 36);
  for (var i = 0; i < txt.length; i++) {
    var code = txt.charCodeAt(i).toString(2).padStart(8, '0');
    for (var j = 0; j < code.length; j++) {
      var w = code[j] === '1' ? 2.2 : 1.2;
      if (code[j] === '1') { ctx.fillRect(x, 5, w, 34); }
      x += w + 0.4;
    }
    x += 1.5;
  }
  ctx.fillRect(x + 2, 4, 3, 36);
})();
<\/script>
</body></html>`);
    printWin.document.close();
  };

  const getSalaryValue = (d: DSO, field: string): number => {
    if (salaryEdits[d.id] && salaryEdits[d.id]![field as keyof DSO] !== undefined) {
      return salaryEdits[d.id]![field as keyof DSO] as number;
    }
    return (d[field as keyof DSO] as number) || 0;
  };

  const updateSalaryField = (dsoId: string, field: string, value: number) => {
    setSalaryEdits((prev) => ({
      ...prev,
      [dsoId]: { ...(prev[dsoId] || {}), [field]: value },
    }));
  };

  const saveSalaryRow = (d: DSO) => {
    const edits = salaryEdits[d.id];
    if (edits) {
      updateDSO(d.id, { ...d, ...edits });
      setSalaryEdits((prev) => {
        const next = { ...prev };
        delete next[d.id];
        return next;
      });
    }
  };

  const getDocCount = (d: DSO) => {
    let uploaded = 0;
    let total = DOC_FIELDS.length;
    for (const f of DOC_FIELDS) {
      if (f.path(d)) uploaded++;
    }
    return { uploaded, total };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">DSO Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage Direct Sales Officers</p>
        </div>
        <Link
          href="/franchise/dso/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105"
        >
          <Plus size={16} /> Register DSO <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Users size={18} />}
          label="Total DSOs"
          value={allFiltered.length}
          color="bg-[#0A2647]"
          textWhite
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Active"
          value={activeDSO.length}
          color="bg-green-500"
          textWhite
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Inactive"
          value={inactiveDSO.length}
          color="bg-amber-500"
          textWhite
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Suspended"
          value={suspendedDSO.length}
          color="bg-red-500"
          textWhite
        />
      </div>

      <div className="flex flex-wrap gap-2 bg-white rounded-2xl border border-gray-200 p-2">
        {(["all", "documents", "salary", "inactive"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-[#0A2647] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab === "all" && "All DSOs"}
            {tab === "documents" && <span className="inline-flex items-center gap-1"><FileText size={14} /> Documents</span>}
            {tab === "salary" && <span className="inline-flex items-center gap-1"><DollarSign size={14} /> Salary</span>}
            {tab === "inactive" && "Inactive"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, ID, code, mobile..."
              className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#0A2647]/50"
              placeholder="From"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#0A2647]/50"
              placeholder="To"
            />
          </div>
        </div>

        {activeTab !== "salary" && activeTab !== "documents" && (
          <div className="flex flex-wrap gap-2">
            {["All", "Active", "Inactive", "Suspended"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  statusFilter === s
                    ? "bg-[#0A2647] text-white border-[#0A2647]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#0A2647]/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {activeTab !== "salary" && activeTab !== "documents" && (
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs">
              Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, tabList.length)}–{Math.min(safePage * PAGE_SIZE, tabList.length)} of {tabList.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-gray-700 px-2">
                {safePage}/{totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {activeTab === "all" && (
        <AllDSOTab
          data={paged}
          search={search}
          onView={setViewDSO}
          onEdit={openEdit}
          onDelete={setShowDelete}
          onDownloadSlip={downloadSalarySlip}
        />
      )}

      {activeTab === "documents" && (
        <DocumentsTab
          data={applyFilters(dso)}
          search={search}
          getDocCount={getDocCount}
          onView={setViewDSO}
        />
      )}

      {activeTab === "salary" && (
        <SalaryTab
          data={applyFilters(dso)}
          search={search}
          salaryEdits={salaryEdits}
          getSalaryValue={getSalaryValue}
          updateSalaryField={updateSalaryField}
          saveSalaryRow={saveSalaryRow}
          onDownloadSlip={downloadSalarySlip}
        />
      )}

      {activeTab === "inactive" && (
        <InactiveTab
          data={paged}
          search={search}
          onView={setViewDSO}
          onEdit={openEdit}
          onDelete={setShowDelete}
        />
      )}

      {viewDSO && <ViewModal dso={viewDSO} onClose={() => setViewDSO(null)} />}

      {showDelete && (
        <DeleteModal
          id={showDelete}
          onConfirm={() => handleDelete(showDelete)}
          onCancel={() => setShowDelete(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  textWhite,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  textWhite: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center ${textWhite ? "text-white" : "text-white"}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-900 text-xl font-black">{value}</p>
        <p className="text-gray-500 text-xs font-medium">{label}</p>
      </div>
    </div>
  );
}

function AllDSOTab({
  data,
  search,
  onView,
  onEdit,
  onDelete,
  onDownloadSlip,
}: {
  data: DSO[];
  search: string;
  onView: (d: DSO) => void;
  onEdit: (d: DSO) => void;
  onDelete: (id: string) => void;
  onDownloadSlip: (d: DSO) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Sr.No</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Employee</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Mobile</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Assigned DSM</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Salary</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
              <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, idx) => (
              <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-[10px] font-black">
                    {idx + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-xs font-bold overflow-hidden flex-shrink-0">
                      {d.photo ? (
                        <img src={d.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        d.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">{d.name}</p>
                      <p className="text-gray-400 text-xs font-mono truncate">
                        {d.id}
                        {d.employeeCode ? ` · ${d.employeeCode}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">{d.mobile || "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-sm font-mono">{d.assignedDSM || "—"}</td>
                <td className="px-4 py-3 hidden xl:table-cell text-gray-600 text-sm">
                  PKR {(d.salary || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[d.status] || "bg-gray-50 text-gray-600"}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onView(d)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => onEdit(d)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => onDownloadSlip(d)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Download Salary Slip">
                      <Download size={14} />
                    </button>
                    <button onClick={() => onDelete(d.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Users size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No DSOs found</p>
        </div>
      )}
    </div>
  );
}

function DocumentsTab({
  data,
  search,
  getDocCount,
  onView,
}: {
  data: DSO[];
  search: string;
  getDocCount: (d: DSO) => { uploaded: number; total: number };
  onView: (d: DSO) => void;
}) {
  return (
    <div className="space-y-3">
      {data.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-12 text-center">
          <FileText size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No DSOs found</p>
        </div>
      )}
      {data.map((d) => {
        const { uploaded, total } = getDocCount(d);
        const missing = total - uploaded;
        const complete = uploaded === total;
        return (
          <div key={d.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A2647] flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {d.photo ? (
                    <img src={d.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    d.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  )}
                </div>
                <div>
                  <p className="text-gray-900 text-sm font-bold">{d.name}</p>
                  <p className="text-gray-400 text-xs font-mono">{d.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${complete ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {uploaded}/{total} Uploaded
                </div>
                {missing > 0 && (
                  <div className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700">
                    {missing} Missing
                  </div>
                )}
                <button
                  onClick={() => onView(d)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {DOC_FIELDS.map((f) => {
                const hasDoc = !!f.path(d);
                return (
                  <div
                    key={f.key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                      hasDoc
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    {hasDoc ? <CheckCircle2 size={12} /> : <X size={12} />}
                    {f.label}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SalaryTab({
  data,
  search,
  salaryEdits,
  getSalaryValue,
  updateSalaryField,
  saveSalaryRow,
  onDownloadSlip,
}: {
  data: DSO[];
  search: string;
  salaryEdits: Record<string, Partial<DSO>>;
  getSalaryValue: (d: DSO, field: string) => number;
  updateSalaryField: (dsoId: string, field: string, value: number) => void;
  saveSalaryRow: (d: DSO) => void;
  onDownloadSlip?: (d: DSO, month?: string) => void;
}) {
  const { activations, importVerifications } = useDSOData();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [calcMonth, setCalcMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showFormula, setShowFormula] = useState(false);

  const getActivationsForDSO = (dsoId: string, month: string) => {
    const dsoActivations = activations.filter((a) => {
      const aMonth = a.createdAt?.slice(0, 7);
      return a.dsoId === dsoId && aMonth === month && a.status === "Completed";
    });
    const pick = (impV: string | undefined, actV: string) =>
      impV === "1" ? "1" : actV === "0" ? "0" : impV === "0" ? "0" : "X";
    const actBvs = (a: any) => a.bvsStatus === "Completed" ? "0" : "X";
    const actFca = (a: any) => a.fcaStatus === "Completed" ? "0" : "X";
    const actIfca = (a: any) => a.ifcaStatus === "Completed" ? "0" : "X";
    let newSimBvs = 0, newSimFca = 0, newSimIfca = 0;
    let mnpBvs = 0, mnpFca = 0, mnpIfca = 0;
    let replBvs = 0, replFca = 0, replIfca = 0;
    let bynBvs = 0, bynFca = 0, bynIfca = 0;
    let bvsCount = 0, fcaCount = 0, ifcaCount = 0;
    dsoActivations.forEach((a) => {
      const iv = importVerifications?.[a.simNumber];
      const bv = pick(iv?.bvs, actBvs(a));
      const fc = pick(iv?.fca, actFca(a));
      const ic = pick(iv?.ifca, actIfca(a));
      if (bv === "1") bvsCount++;
      if (fc === "1") fcaCount++;
      if (ic === "1") ifcaCount++;
      if (a.type === "New SIM") {
        if (bv === "1") newSimBvs++;
        if (fc === "1") newSimFca++;
        if (ic === "1") newSimIfca++;
      } else if (a.type === "MNP") {
        if (bv === "1") mnpBvs++;
        if (fc === "1") mnpFca++;
        if (ic === "1") mnpIfca++;
      } else if (a.type === "Replacement") {
        if (bv === "1") replBvs++;
        if (fc === "1") replFca++;
        if (ic === "1") replIfca++;
      } else if (a.type === "BYN") {
        if (bv === "1") bynBvs++;
        if (fc === "1") bynFca++;
        if (ic === "1") bynIfca++;
      }
    });
    return {
      newSIM: dsoActivations.filter((a) => a.type === "New SIM").length,
      mnp: dsoActivations.filter((a) => a.type === "MNP").length,
      replacement: dsoActivations.filter((a) => a.type === "Replacement").length,
      byn: dsoActivations.filter((a) => a.type === "BYN").length,
      total: dsoActivations.length,
      bvs: bvsCount, fca: fcaCount, ifca: ifcaCount,
      newSimBvs, newSimFca, newSimIfca,
      mnpBvs, mnpFca, mnpIfca,
      replBvs, replFca, replIfca,
      bynBvs, bynFca, bynIfca,
    };
  };

  const calcEarnings = (d: DSO, acts: ReturnType<typeof getActivationsForDSO>) => {
    const v = (f: string) => getSalaryValue(d, f);
    const basic = v("salary");
    const fuel = v("fuelAllowance");
    const mobile = v("mobileAllowance");
    const daily = v("dailyAllowance");
    const residence = v("residenceAllowance");
    const newSimComm = acts.newSimBvs * v("newSimBvs") + acts.newSimFca * v("newSimFca") + acts.newSimIfca * v("newSimIfca");
    const mnpComm = acts.mnpBvs * v("mnpBvs") + acts.mnpFca * v("mnpFca") + acts.mnpIfca * v("mnpIfca");
    const replComm = acts.replBvs * v("replacementBvs") + acts.replFca * v("replacementFca") + acts.replIfca * v("replacementIfca");
    const bynComm = acts.bynBvs * v("bynBvs") + acts.bynFca * v("bynFca") + acts.bynIfca * v("bynIfca");
    const hikeComm = v("hikeCommission");
    const otherComm = v("otherCommission");
    const targetBonus = v("targetBonus");
    const bonus = v("bonus");
    const totalCommission = newSimComm + mnpComm + replComm + bynComm + hikeComm + otherComm;
    const totalAllowances = fuel + mobile + daily + residence;
    const grossEarnings = basic + totalAllowances + totalCommission + targetBonus + bonus;
    const advance = v("advanceSalary");
    const loan = v("loanDeduction");
    const otherDed = v("otherDeduction");
    const totalDeductions = advance + loan + otherDed;
    const netSalary = grossEarnings - totalDeductions;
    return { basic, fuel, mobile, daily, newSimComm, mnpComm, replComm, bynComm, hikeComm, otherComm, totalCommission, totalAllowances, targetBonus, bonus, grossEarnings, advance, loan, otherDed, totalDeductions, netSalary, acts };
  };

  const totalStats = useMemo(() => {
    let totalBasic = 0, totalCommission = 0, totalGross = 0, totalNet = 0;
    data.forEach((d) => {
      const acts = getActivationsForDSO(d.id, calcMonth);
      const e = calcEarnings(d, acts);
      totalBasic += e.basic;
      totalCommission += e.totalCommission;
      totalGross += e.grossEarnings;
      totalNet += e.netSalary;
    });
    return { totalBasic, totalCommission, totalGross, totalNet };
  }, [data, calcMonth, activations, importVerifications]);

  const filtered = data.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Formula Info Banner */}
      <div className="bg-gradient-to-r from-[#0A2647] to-[#144272] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Salary Formula</h3>
              <p className="text-white/60 text-xs">Net = Basic + Allowances + Commissions + Bonuses − Deductions</p>
            </div>
          </div>
          <button onClick={() => setShowFormula(!showFormula)} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium hover:bg-white/20 transition-all">
            {showFormula ? "Hide" : "Show"} Formula
          </button>
        </div>
        {showFormula && (
          <div className="bg-white/5 rounded-xl p-4 mt-3 space-y-2 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-white/50">Basic Salary</span><p className="font-bold">Fixed monthly</p></div>
              <div><span className="text-white/50">Allowances</span><p className="font-bold">Fuel + Mobile + Daily</p></div>
              <div><span className="text-white/50">Commissions</span><p className="font-bold">Per activation × rate</p></div>
              <div><span className="text-white/50">Deductions</span><p className="font-bold">Advance + Loan + Other</p></div>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <p className="text-white/50">Commission Types:</p>
              <p className="font-bold">New SIM × rate + MNP × rate + Replacement × rate + BYN × rate + Hike + Other</p>
            </div>
          </div>
        )}
      </div>

      {/* Month Selector + Summary Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-gray-500 text-xs font-medium">Calculation Month:</label>
            <input type="month" value={calcMonth} onChange={(e) => setCalcMonth(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          <p className="text-gray-400 text-xs">{filtered.length} DSOs</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Basic", value: totalStats.totalBasic, color: "text-[#0A2647]" },
            { label: "Total Commissions", value: totalStats.totalCommission, color: "text-green-600" },
            { label: "Total Gross", value: totalStats.totalGross, color: "text-blue-600" },
            { label: "Total Net Pay", value: totalStats.totalNet, color: "text-[#C8A951]" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-[10px] font-medium uppercase">{s.label}</p>
              <p className={`${s.color} text-lg font-black mt-0.5`}>PKR {s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">DSO</th>
                <th className="text-right px-3 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Basic</th>
                <th className="text-right px-3 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Allow.</th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">
                  <div className="flex flex-col items-center">
                    <span>Activations</span>
                    <span className="text-[9px] text-gray-400 font-normal">Tot|BVS|FCA|IFCA</span>
                  </div>
                </th>
                <th className="text-right px-3 py-3 text-gray-500 text-xs font-medium uppercase hidden 2xl:table-cell">Commission</th>
                <th className="text-right px-3 py-3 text-gray-500 text-xs font-medium uppercase hidden 2xl:table-cell">Bonuses</th>
                <th className="text-right px-3 py-3 text-gray-500 text-xs font-medium uppercase hidden 2xl:table-cell">Deductions</th>
                <th className="text-right px-3 py-3 text-gray-500 text-xs font-medium uppercase font-bold">Net Pay</th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">Slip</th>
                <th className="text-center px-3 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const isEditing = !!salaryEdits[d.id];
                const isExpanded = expandedRow === d.id;
                const acts = getActivationsForDSO(d.id, calcMonth);
                const e = calcEarnings(d, acts);
                return (
                  <Fragment key={d.id}>
                    <tr className={`border-b border-gray-50 transition-colors ${isEditing ? "bg-blue-50/30" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{d.name}</p>
                          <p className="text-gray-400 text-xs font-mono">{d.id}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right hidden lg:table-cell">
                        {isEditing ? (
                          <input type="number" value={getSalaryValue(d, "salary")}
                            onChange={(ev) => updateSalaryField(d.id, "salary", Number(ev.target.value))}
                            className="w-24 text-right px-2 py-1.5 rounded-lg text-xs font-medium border border-[#0A2647]/30 text-gray-900 focus:outline-none focus:border-[#0A2647] focus:ring-1 focus:ring-[#0A2647]/10" />
                        ) : (
                          <span className="text-gray-700 text-xs font-medium">PKR {(e.basic).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right hidden xl:table-cell">
                        <span className="text-gray-600 text-xs">{e.totalAllowances.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-2 text-center hidden xl:table-cell">
                        <div className="flex items-center justify-center gap-1 text-[10px]">
                          <span className="px-1.5 py-0.5 bg-gray-900 text-white rounded font-bold" title="Total">{acts.total}</span>
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold" title="BVS">{acts.bvs}</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold" title="FCA">{acts.fca}</span>
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-bold" title="IFCA">{acts.ifca}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right hidden 2xl:table-cell">
                        <span className="text-green-600 text-xs font-medium">PKR {e.totalCommission.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-2 text-right hidden 2xl:table-cell">
                        <span className="text-blue-600 text-xs font-medium">PKR {(e.targetBonus + e.bonus).toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-2 text-right hidden 2xl:table-cell">
                        <span className="text-red-500 text-xs font-medium">PKR {e.totalDeductions.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-gray-900 text-sm font-black">PKR {e.netSalary.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => onDownloadSlip?.(d, calcMonth)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Download Salary Slip">
                          <Download size={14} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <button onClick={() => saveSalaryRow(d)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all" title="Save">
                              <Save size={14} />
                            </button>
                          ) : (
                            <button onClick={() => { updateSalaryField(d.id, "salary", d.salary || 0); }} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-gray-100 rounded-lg transition-all" title="Edit Salary">
                              <Edit size={14} />
                            </button>
                          )}
                          <button onClick={() => setExpandedRow(isExpanded ? null : d.id)} className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-gray-100 rounded-lg transition-all" title="Commission Settings">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50/80">
                        <td colSpan={10} className="px-4 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Commission Rates */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                <DollarSign size={14} className="text-[#C8A951]" /> Commission Rates
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: "New SIM-BVS (Rs.)", field: "newSimBvs", color: "blue" },
                                  { label: "New SIM-FCA (Rs.)", field: "newSimFca", color: "indigo" },
                                  { label: "New SIM-IFCA (Rs.)", field: "newSimIfca", color: "violet" },
                                  { label: "MNP-BVS (Rs.)", field: "mnpBvs", color: "green" },
                                  { label: "MNP-FCA (Rs.)", field: "mnpFca", color: "emerald" },
                                  { label: "MNP-IFCA (Rs.)", field: "mnpIfca", color: "teal" },
                                  { label: "Repl-BVS (Rs.)", field: "replacementBvs", color: "amber" },
                                  { label: "Repl-FCA (Rs.)", field: "replacementFca", color: "orange" },
                                  { label: "Repl-IFCA (Rs.)", field: "replacementIfca", color: "yellow" },
                                  { label: "BYN-BVS (Rs.)", field: "bynBvs", color: "purple" },
                                  { label: "BYN-FCA (Rs.)", field: "bynFca", color: "fuchsia" },
                                  { label: "BYN-IFCA (Rs.)", field: "bynIfca", color: "pink" },
                                  { label: "Hike Commission (Rs.)", field: "hikeCommission", color: "pink" },
                                  { label: "Other Commission (Rs.)", field: "otherCommission", color: "gray" },
                                ].map((f) => (
                                  <div key={f.field}>
                                    <label className="block text-gray-500 text-[10px] font-medium mb-1">{f.label}</label>
                                    <input type="number" value={getSalaryValue(d, f.field)}
                                      onChange={(ev) => updateSalaryField(d.id, f.field, Number(ev.target.value))}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Allowances & Bonuses */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Wallet size={14} className="text-green-500" /> Allowances & Bonuses
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: "Fuel Allowance (Rs.)", field: "fuelAllowance" },
                                  { label: "Mobile Allowance (Rs.)", field: "mobileAllowance" },
                                  { label: "Daily Allowance (Rs.)", field: "dailyAllowance" },
                                  { label: "Residence Allowance (Rs.)", field: "residenceAllowance" },
                                  { label: "Target Bonus (Rs.)", field: "targetBonus" },
                                  { label: "Performance Bonus (Rs.)", field: "bonus" },
                                ].map((f) => (
                                  <div key={f.field}>
                                    <label className="block text-gray-500 text-[10px] font-medium mb-1">{f.label}</label>
                                    <input type="number" value={getSalaryValue(d, f.field)}
                                      onChange={(ev) => updateSalaryField(d.id, f.field, Number(ev.target.value))}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Deductions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} className="text-red-500" /> Deductions
                              </h4>
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { label: "Advance Salary (Rs.)", field: "advanceSalary" },
                                  { label: "Loan Deduction (Rs.)", field: "loanDeduction" },
                                  { label: "Other Deduction (Rs.)", field: "otherDeduction" },
                                ].map((f) => (
                                  <div key={f.field}>
                                    <label className="block text-gray-500 text-[10px] font-medium mb-1">{f.label}</label>
                                    <input type="number" value={getSalaryValue(d, f.field)}
                                      onChange={(ev) => updateSalaryField(d.id, f.field, Number(ev.target.value))}
                                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Earnings Breakdown */}
                            <div className="bg-gradient-to-br from-[#0A2647] to-[#144272] rounded-xl p-4 text-white">
                              <h4 className="font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                <TrendingUp size={14} /> Earnings Breakdown — {calcMonth}
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-white/60">Basic Salary</span><span className="font-medium">PKR {e.basic.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-white/60">Allowances</span><span className="font-medium">PKR {e.totalAllowances.toLocaleString()}</span></div>
                                <div className="border-t border-white/10 pt-2">
                                  <div className="flex justify-between"><span className="text-white/60">New SIM</span><span className="font-medium text-green-300">PKR {e.newSimComm.toLocaleString()}</span></div>
                                  <div className="flex justify-between pl-3 text-[10px]"><span className="text-white/40">BVS({acts.newSimBvs}×{getSalaryValue(d, "newSimBvs")}) + FCA({acts.newSimFca}×{getSalaryValue(d, "newSimFca")}) + IFCA({acts.newSimIfca}×{getSalaryValue(d, "newSimIfca")})</span></div>
                                  <div className="flex justify-between"><span className="text-white/60">MNP</span><span className="font-medium text-green-300">PKR {e.mnpComm.toLocaleString()}</span></div>
                                  <div className="flex justify-between pl-3 text-[10px]"><span className="text-white/40">BVS({acts.mnpBvs}×{getSalaryValue(d, "mnpBvs")}) + FCA({acts.mnpFca}×{getSalaryValue(d, "mnpFca")}) + IFCA({acts.mnpIfca}×{getSalaryValue(d, "mnpIfca")})</span></div>
                                  <div className="flex justify-between"><span className="text-white/60">Replacement</span><span className="font-medium text-green-300">PKR {e.replComm.toLocaleString()}</span></div>
                                  <div className="flex justify-between pl-3 text-[10px]"><span className="text-white/40">BVS({acts.replBvs}×{getSalaryValue(d, "replacementBvs")}) + FCA({acts.replFca}×{getSalaryValue(d, "replacementFca")}) + IFCA({acts.replIfca}×{getSalaryValue(d, "replacementIfca")})</span></div>
                                  <div className="flex justify-between"><span className="text-white/60">BYN</span><span className="font-medium text-green-300">PKR {e.bynComm.toLocaleString()}</span></div>
                                  <div className="flex justify-between pl-3 text-[10px]"><span className="text-white/40">BVS({acts.bynBvs}×{getSalaryValue(d, "bynBvs")}) + FCA({acts.bynFca}×{getSalaryValue(d, "bynFca")}) + IFCA({acts.bynIfca}×{getSalaryValue(d, "bynIfca")})</span></div>
                                  <div className="flex justify-between"><span className="text-white/60">Hike + Other</span><span className="font-medium text-green-300">PKR {(e.hikeComm + e.otherComm).toLocaleString()}</span></div>
                                </div>
                                <div className="border-t border-white/10 pt-2">
                                  <div className="flex justify-between"><span className="text-white/60">Bonuses</span><span className="font-medium">PKR {(e.targetBonus + e.bonus).toLocaleString()}</span></div>
                                  <div className="flex justify-between text-red-300"><span>Deductions</span><span className="font-medium">-PKR {e.totalDeductions.toLocaleString()}</span></div>
                                </div>
                                <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                                  <span className="font-bold">Net Salary</span>
                                  <span className="font-black text-[#C8A951]">PKR {e.netSalary.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <DollarSign size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No DSOs found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InactiveTab({
  data,
  search,
  onView,
  onEdit,
  onDelete,
}: {
  data: DSO[];
  search: string;
  onView: (d: DSO) => void;
  onEdit: (d: DSO) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-600" />
        <p className="text-amber-800 text-sm font-bold">Inactive / Resigned DSOs — {data.length} found</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Sr.No</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Employee</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Mobile</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Assigned DSM</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Salary</th>
              <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
              <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, idx) => (
              <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#0A2647]/10 text-[#0A2647] text-[10px] font-black">
                    {idx + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold overflow-hidden flex-shrink-0">
                      {d.photo ? (
                        <img src={d.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        d.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">{d.name}</p>
                      <p className="text-gray-400 text-xs font-mono truncate">
                        {d.id}
                        {d.employeeCode ? ` · ${d.employeeCode}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">{d.mobile || "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-sm font-mono">{d.assignedDSM || "—"}</td>
                <td className="px-4 py-3 hidden xl:table-cell text-gray-600 text-sm">
                  PKR {(d.salary || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[d.status] || "bg-gray-50 text-gray-600"}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onView(d)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => onEdit(d)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => onDelete(d.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="px-6 py-12 text-center">
          <CheckCircle2 size={32} className="text-green-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No inactive or resigned DSOs</p>
        </div>
      )}
    </div>
  );
}

function ViewModal({ dso, onClose }: { dso: DSO; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-gray-900 font-bold">DSO Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#0A2647] flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
              {dso.photo ? (
                <img src={dso.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                dso.name.charAt(0)
              )}
            </div>
            <div>
              <p className="text-gray-900 font-bold text-lg">{dso.name}</p>
              <p className="text-gray-500 text-xs font-mono">
                {dso.id}
                {dso.employeeCode ? ` · ${dso.employeeCode}` : ""}
              </p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium mt-1 inline-block ${STATUS_COLORS[dso.status] || ""}`}>
                {dso.status}
              </span>
            </div>
          </div>

          <Section title="Personal Information">
            <InfoRow label="Father Name" value={dso.fatherName} />
            <InfoRow label="CNIC" value={dso.cnic} />
            <InfoRow label="Mobile" value={dso.mobile} />
            {dso.email && <InfoRow label="Email" value={dso.email} />}
            {dso.dob && <InfoRow label="Date of Birth" value={dso.dob} />}
            {dso.gender && <InfoRow label="Gender" value={dso.gender} />}
            {dso.maritalStatus && <InfoRow label="Marital Status" value={dso.maritalStatus} />}
            {dso.nationality && <InfoRow label="Nationality" value={dso.nationality} />}
          </Section>

          <Section title="Login Credentials">
            <InfoRow label="User ID" value={dso.username} />
            <InfoRow label="Password" value={dso.password} />
            <div className="mt-3">
              <button
                onClick={() => {
                  const phone = (dso.whatsapp || dso.mobile).replace(/\D/g, "");
                  const msg = `*THE SMART ERP - Account Credentials*\n\nDear ${dso.name},\n\nYour DSO account has been created successfully. Please find your login credentials below:\n\n🆔 User ID: ${dso.username}\n🔑 Password: ${dso.password}\n\n🔗 Login Portal: https://thesmartpvt.com/dso-login\n\n⚠️ *IMPORTANT SECURITY NOTICE:*\n• Do NOT share your ID or password with anyone\n• THE SMART will NEVER ask for your password\n• Change your password after first login\n• Keep your credentials confidential\n\nThank you,\nTHE SMART ERP Team`;
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share via WhatsApp
              </button>
            </div>
          </Section>

          <Section title="Employment">
            <InfoRow label="Assigned DSM" value={dso.assignedDSM} />
            {dso.designation && <InfoRow label="Designation" value={dso.designation} />}
            {dso.employmentType && <InfoRow label="Employment Type" value={dso.employmentType} />}
            <InfoRow label="Joining Date" value={formatDateDDMMYYYY(dso.joiningDate)} />
            <InfoRow label="Retailer ID" value={dso.retailerId} />
          </Section>

          <Section title="Salary & Compensation">
            <InfoRow label="Basic Salary" value={`PKR ${(dso.salary || 0).toLocaleString()}`} />
            {dso.fuelAllowance ? <InfoRow label="Fuel Allowance" value={`PKR ${(dso.fuelAllowance || 0).toLocaleString()}`} /> : null}
            {dso.mobileAllowance ? <InfoRow label="Mobile Allowance" value={`PKR ${(dso.mobileAllowance || 0).toLocaleString()}`} /> : null}
            {dso.dailyAllowance ? <InfoRow label="Daily Allowance" value={`PKR ${(dso.dailyAllowance || 0).toLocaleString()}`} /> : null}
            {dso.commission ? <InfoRow label="Commission" value={`${dso.commission}%`} /> : null}
            {dso.mnpCommission ? <InfoRow label="MNP Commission" value={`${dso.mnpCommission}%`} /> : null}
            {dso.replacementCommission ? <InfoRow label="Replacement Commission" value={`${dso.replacementCommission}%`} /> : null}
            {dso.bonus ? <InfoRow label="Bonus" value={`PKR ${(dso.bonus || 0).toLocaleString()}`} /> : null}
          </Section>

          {dso.bankName && (
            <Section title="Bank Details">
              <InfoRow label="Bank" value={dso.bankName} />
              {dso.accountTitle && <InfoRow label="Account Title" value={dso.accountTitle} />}
              {dso.accountNumber && <InfoRow label="Account Number" value={dso.accountNumber} />}
              {dso.iban && <InfoRow label="IBAN" value={dso.iban} />}
            </Section>
          )}

          {dso.address && (
            <Section title="Address">
              <InfoRow label="Address" value={dso.address} />
              {dso.city && <InfoRow label="City" value={dso.city} />}
              {dso.province && <InfoRow label="Province" value={dso.province} />}
              {dso.area && <InfoRow label="Area" value={dso.area} />}
            </Section>
          )}

          {(dso.documents?.cnicFront || dso.documents?.cnicBack || dso.documents?.photo || dso.agreements?.agreementPdf || dso.guarantor?.name) && (
            <Section title="Documents & Guarantor">
              {dso.documents?.cnicFront && <InfoRow label="CNIC Front" value="Uploaded" />}
              {dso.documents?.cnicBack && <InfoRow label="CNIC Back" value="Uploaded" />}
              {dso.documents?.photo && <InfoRow label="Photo" value="Uploaded" />}
              {dso.agreements?.agreementNumber && <InfoRow label="Agreement #" value={dso.agreements.agreementNumber} />}
              {dso.agreements?.stampNumber && <InfoRow label="Stamp #" value={dso.agreements.stampNumber} />}
              {dso.guarantor?.name && <InfoRow label="Guarantor" value={dso.guarantor.name} />}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  id,
  onConfirm,
  onCancel,
}: {
  id: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-600" />
        </div>
        <h3 className="text-gray-900 font-bold mb-2">Delete DSO?</h3>
        <p className="text-gray-500 text-sm mb-6">
          DSO <span className="font-mono font-medium">{id}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-2">{title}</h4>
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
