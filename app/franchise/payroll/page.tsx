"use client";

import { useState, useMemo } from "react";
import {
  DollarSign, Plus, Trash2, X, Save, CheckSquare, Square, Check,
  Calendar, Users, UserCheck, Search, ChevronDown, Wallet, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Zap, ArrowRight, Filter, Printer,
} from "lucide-react";
import { useFranchiseData, PayrollRecord, DSO, DSM } from "@/lib/FranchiseDataContext";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

type Tab = "generate" | "list";

export default function PayrollPage() {
  const { auth, payroll, dsms, dso, addPayroll, updatePayroll, deletePayroll, addExpense, settleStaffWalletPayments, simSales } = useFranchiseData();
  const { activations, importVerifications } = useDSOData();

  const [tab, setTab] = useState<Tab>("generate");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "DSM" | "DSO">("All");
  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedPayroll, setSelectedPayroll] = useState<string[]>([]);

  const allEmployees = useMemo(() => {
    const emps: { id: string; name: string; role: "DSM" | "DSO"; data: DSM | DSO }[] = [];
    dsms.forEach((d) => emps.push({ id: d.id, name: d.name, role: "DSM", data: d }));
    dso.forEach((d) => emps.push({ id: d.id, name: d.name, role: "DSO", data: d }));
    return emps;
  }, [dsms, dso]);

  const filteredEmployees = useMemo(() => {
    let list = allEmployees;
    if (roleFilter !== "All") list = list.filter((e) => e.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }
    return list;
  }, [allEmployees, roleFilter, search]);

  const filteredPayroll = useMemo(() => {
    let list = payroll.filter((p) => p.month === month);
    if (roleFilter !== "All") list = list.filter((p) => p.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.employeeName.toLowerCase().includes(q) || p.employeeId.toLowerCase().includes(q));
    }
    return list;
  }, [payroll, month, roleFilter, search]);

  const monthPayrollExists = useMemo(() => {
    return new Set(payroll.filter((p) => p.month === month).map((p) => p.employeeId));
  }, [payroll, month]);

  const getActivations = (empId: string, m: string) => {
    const acts = activations.filter((a) => {
      const aMonth = a.createdAt?.slice(0, 7);
      return a.dsoId === empId && aMonth === m && a.status === "Completed";
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
    acts.forEach((a) => {
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
      newSIM: acts.filter((a) => a.type === "New SIM").length,
      mnp: acts.filter((a) => a.type === "MNP").length,
      replacement: acts.filter((a) => a.type === "Replacement").length,
      byn: acts.filter((a) => a.type === "BYN").length,
      total: acts.length,
      bvs: bvsCount, fca: fcaCount, ifca: ifcaCount,
      newSimBvs, newSimFca, newSimIfca,
      mnpBvs, mnpFca, mnpIfca,
      replBvs, replFca, replIfca,
      bynBvs, bynFca, bynIfca,
    };
  };

  const calcPayroll = (emp: { id: string; name: string; role: "DSM" | "DSO"; data: DSM | DSO }) => {
    const d = emp.data;
    const acts = getActivations(emp.id, month);
    const basic = d.salary || 0;
    const fuel = d.fuelAllowance || 0;
    const mobile = d.mobileAllowance || 0;
    const daily = d.dailyAllowance || 0;
    const residence = d.residenceAllowance || 0;
    const totalAllowances = fuel + mobile + daily + residence;

    const newSimComm = acts.newSimBvs * (d.newSimBvs || 0) + acts.newSimFca * (d.newSimFca || 0) + acts.newSimIfca * (d.newSimIfca || 0);
    const mnpComm = acts.mnpBvs * (d.mnpBvs || 0) + acts.mnpFca * (d.mnpFca || 0) + acts.mnpIfca * (d.mnpIfca || 0);
    const replComm = acts.replBvs * (d.replacementBvs || 0) + acts.replFca * (d.replacementFca || 0) + acts.replIfca * (d.replacementIfca || 0);
    const bynComm = acts.bynBvs * (d.bynBvs || 0) + acts.bynFca * (d.bynFca || 0) + acts.bynIfca * (d.bynIfca || 0);
    const hike = d.hikeCommission || 0;
    const other = d.otherCommission || 0;
    const totalCommission = newSimComm + mnpComm + replComm + bynComm + hike + other;

    const targetBonus = d.targetBonus || 0;
    const perfBonus = d.bonus || 0;

    const advance = d.advanceSalary || 0;
    const loan = d.loanDeduction || 0;
    const otherDed = d.otherDeduction || 0;
    const collectionDed = simSales.filter((s) => s.staffId === emp.id && s.collectionStatus === "Pending" && s.saleDate.slice(0, 7) === month).reduce((sum, s) => sum + s.collectionAmount, 0);
    const totalDeductions = advance + loan + otherDed + collectionDed;

    const gross = basic + totalAllowances + totalCommission + targetBonus + perfBonus;
    const netPay = gross - totalDeductions;

    return {
      basic, fuel, mobile, daily, residence, totalAllowances,
      newSimCount: acts.newSIM, newSimRate: (d.newSimBvs || 0) + (d.newSimFca || 0) + (d.newSimIfca || 0), newSimComm,
      newSimBvsRate: d.newSimBvs || 0, newSimBvsCommission: acts.newSimBvs * (d.newSimBvs || 0),
      newSimFcaRate: d.newSimFca || 0, newSimFcaCommission: acts.newSimFca * (d.newSimFca || 0),
      newSimIfcaRate: d.newSimIfca || 0, newSimIfcaCommission: acts.newSimIfca * (d.newSimIfca || 0),
      mnpCount: acts.mnp, mnpRate: (d.mnpBvs || 0) + (d.mnpFca || 0) + (d.mnpIfca || 0), mnpComm,
      mnpBvsRate: d.mnpBvs || 0, mnpBvsCommission: acts.mnpBvs * (d.mnpBvs || 0),
      mnpFcaRate: d.mnpFca || 0, mnpFcaCommission: acts.mnpFca * (d.mnpFca || 0),
      mnpIfcaRate: d.mnpIfca || 0, mnpIfcaCommission: acts.mnpIfca * (d.mnpIfca || 0),
      replacementCount: acts.replacement, replacementRate: (d.replacementBvs || 0) + (d.replacementFca || 0) + (d.replacementIfca || 0), replComm,
      replacementBvsRate: d.replacementBvs || 0, replacementBvsCommission: acts.replBvs * (d.replacementBvs || 0),
      replacementFcaRate: d.replacementFca || 0, replacementFcaCommission: acts.replFca * (d.replacementFca || 0),
      replacementIfcaRate: d.replacementIfca || 0, replacementIfcaCommission: acts.replIfca * (d.replacementIfca || 0),
      bynCount: acts.byn, bynRate: (d.bynBvs || 0) + (d.bynFca || 0) + (d.bynIfca || 0), bynComm,
      bynBvsRate: d.bynBvs || 0, bynBvsCommission: acts.bynBvs * (d.bynBvs || 0),
      bynFcaRate: d.bynFca || 0, bynFcaCommission: acts.bynFca * (d.bynFca || 0),
      bynIfcaRate: d.bynIfca || 0, bynIfcaCommission: acts.bynIfca * (d.bynIfca || 0),
      bvsCount: acts.bvs, fcaCount: acts.fca, ifcaCount: acts.ifca,
      totalActivations: acts.total,
      hike, other, totalCommission,
      targetBonus, perfBonus,
      advance, loan, otherDed, collectionDed, totalDeductions,
      gross, netPay,
    };
  };

  const handleGenerate = () => {
    const emps = selectedEmps.length > 0
      ? allEmployees.filter((e) => selectedEmps.includes(e.id))
      : filteredEmployees;

    emps.forEach((emp) => {
      if (monthPayrollExists.has(emp.id)) return;
      const calc = calcPayroll(emp);
      const record: PayrollRecord = {
        id: `PAY-${Date.now()}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        month,
        basicSalary: calc.basic,
        fuelAllowance: calc.fuel,
        mobileAllowance: calc.mobile,
        dailyAllowance: calc.daily,
        residenceAllowance: calc.residence,
        totalAllowances: calc.totalAllowances,
        newSimCount: calc.newSimCount, newSimRate: calc.newSimRate, newSimCommission: calc.newSimComm,
        newSimBvsRate: calc.newSimBvsRate, newSimBvsCommission: calc.newSimBvsCommission,
        newSimFcaRate: calc.newSimFcaRate, newSimFcaCommission: calc.newSimFcaCommission,
        newSimIfcaRate: calc.newSimIfcaRate, newSimIfcaCommission: calc.newSimIfcaCommission,
        mnpCount: calc.mnpCount, mnpRate: calc.mnpRate, mnpCommission: calc.mnpComm,
        mnpBvsRate: calc.mnpBvsRate, mnpBvsCommission: calc.mnpBvsCommission,
        mnpFcaRate: calc.mnpFcaRate, mnpFcaCommission: calc.mnpFcaCommission,
        mnpIfcaRate: calc.mnpIfcaRate, mnpIfcaCommission: calc.mnpIfcaCommission,
        replacementCount: calc.replacementCount, replacementRate: calc.replacementRate, replacementCommission: calc.replComm,
        replacementBvsRate: calc.replacementBvsRate, replacementBvsCommission: calc.replacementBvsCommission,
        replacementFcaRate: calc.replacementFcaRate, replacementFcaCommission: calc.replacementFcaCommission,
        replacementIfcaRate: calc.replacementIfcaRate, replacementIfcaCommission: calc.replacementIfcaCommission,
        bynCount: calc.bynCount, bynRate: calc.bynRate, bynCommission: calc.bynComm,
        bynBvsRate: calc.bynBvsRate, bynBvsCommission: calc.bynBvsCommission,
        bynFcaRate: calc.bynFcaRate, bynFcaCommission: calc.bynFcaCommission,
        bynIfcaRate: calc.bynIfcaRate, bynIfcaCommission: calc.bynIfcaCommission,
        hikeCommission: calc.hike, otherCommission: calc.other,
        totalCommission: calc.totalCommission,
        targetBonus: calc.targetBonus, performanceBonus: calc.perfBonus,
        advanceSalary: calc.advance, loanDeduction: calc.loan, otherDeduction: calc.otherDed, collectionDeduction: calc.collectionDed,
        totalDeductions: calc.totalDeductions,
        netPay: calc.netPay,
        paid: false, status: "Unpaid",
        franchiseId: auth.franchiseId,
      };
      addPayroll(record);
    });
    setSelectedEmps([]);
    setSelectAll(false);
    setTab("list");
  };

  const handleMarkPaid = async (ids: string[]) => {
    const today = new Date().toISOString().split("T")[0];
    for (const id of ids) {
      const rec = payroll.find((p) => p.id === id);
      if (rec && !rec.paid) {
        await updatePayroll(id, { ...rec, paid: true, status: "Paid", paidDate: today });
        await addExpense({
          id: `EXP-PAY-${Date.now()}-${rec.employeeId}`,
          type: "Salary",
          category: "Payroll",
          amount: rec.netPay || 0,
          date: today,
          description: `Salary paid to ${rec.employeeName} (${rec.role}) for ${rec.month}`,
          note: `Payroll ID: ${rec.id}`,
          franchiseId: auth.franchiseId,
        });
        await settleStaffWalletPayments(rec.employeeId, rec.role, rec.month);
      }
    }
    setSelectedPayroll([]);
  };

  const handlePrintPayroll = () => {
    const monthLabel = month || "All";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB");
    const timeStr = now.toLocaleTimeString();

    const rows = filteredPayroll.map((p) => {
      const n = p.newSimCount || 0;
      const m = p.mnpCount || 0;
      const r = p.replacementCount || 0;
      const b = p.bynCount || 0;
      const totalActivations = n + m + r + b;
      return `<tr>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;font-weight:500;color:#1a1a1a;">${p.employeeName || "â€”"}<br/><span style="font-size:8px;color:#888;font-weight:400;">${p.employeeId || ""}</span></td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;"><span style="background:${p.role === "DSO" ? "#d1fae5" : "#dbeafe"};color:${p.role === "DSO" ? "#065f46" : "#1e40af"};padding:2px 8px;border-radius:10px;font-weight:600;font-size:8px;">${p.role || "â€”"}</span></td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;font-weight:500;">${(p.basicSalary || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.fuelAllowance || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.mobileAllowance || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.dailyAllowance || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.residenceAllowance || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;font-weight:600;color:#0A2647;">${(p.totalAllowances || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:center;">
          <span style="display:inline-block;background:#dbeafe;color:#1e40af;padding:1px 4px;border-radius:3px;margin:1px 0;font-weight:600;">New: ${n}</span><br/>
          <span style="display:inline-block;background:#fce7f3;color:#9d174d;padding:1px 4px;border-radius:3px;margin:1px 0;font-weight:600;">MNP: ${m}</span><br/>
          <span style="display:inline-block;background:#fef3c7;color:#92400e;padding:1px 4px;border-radius:3px;margin:1px 0;font-weight:600;">Repl: ${r}</span><br/>
          <span style="display:inline-block;background:#ede9fe;color:#5b21b6;padding:1px 4px;border-radius:3px;margin:1px 0;font-weight:600;">BYN: ${b}</span><br/>
          <span style="font-weight:700;color:#1a1a1a;font-size:9px;">${totalActivations}</span>
        </td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.newSimCommission || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.mnpCommission || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.replacementCommission || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.bynCommission || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.hikeCommission || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">${(p.otherCommission || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;font-weight:600;color:#059669;">${(p.totalCommission || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;color:#2563eb;font-weight:500;">${(p.targetBonus || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;color:#2563eb;font-weight:500;">${(p.performanceBonus || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#dc2626;">${(p.advanceSalary || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#dc2626;">${(p.loanDeduction || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#dc2626;">${(p.otherDeduction || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;font-weight:600;color:#dc2626;">${(p.totalDeductions || 0).toLocaleString()}</td>
        <td style="padding:6px 10px;border:1px solid #d0d5dd;font-size:11px;text-align:right;font-weight:700;background:#eff6ff;color:#0A2647;">PKR ${(p.netPay || 0).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;"><span style="background:${p.paid ? "#d1fae5" : "#fee2e2"};color:${p.paid ? "#065f46" : "#dc2626"};padding:2px 8px;border-radius:10px;font-weight:600;font-size:8px;">${p.paid ? "Paid" : "Unpaid"}</span></td>
      </tr>`;
    }).join("");

    const totalBasic = filteredPayroll.reduce((s, p) => s + (p.basicSalary || 0), 0);
    const totalAllow = filteredPayroll.reduce((s, p) => s + (p.totalAllowances || 0), 0);
    const totalComm = filteredPayroll.reduce((s, p) => s + (p.totalCommission || 0), 0);
    const totalBonus = filteredPayroll.reduce((s, p) => s + (p.targetBonus || 0) + (p.performanceBonus || 0), 0);
    const totalDed = filteredPayroll.reduce((s, p) => s + (p.totalDeductions || 0), 0);
    const totalNet = filteredPayroll.reduce((s, p) => s + (p.netPay || 0), 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Payroll Detail - ${monthLabel}</title>
      <style>
        @page { size: A4 landscape; margin: 6mm; }
        body { font-family: 'Satoshi', sans-serif; color: #1a1a1a; padding: 0; margin: 0; background: #f8fafc; }
        .report-header { background: linear-gradient(135deg, #0A2647 0%, #144272 100%); color: #fff; padding: 16px 22px; border-radius: 0; margin-bottom: 14px; }
        .report-header h1 { font-size: 18px; margin: 0; font-weight: 800; letter-spacing: 0.5px; }
        .report-header .meta { font-size: 10px; color: #94a3b8; margin-top: 4px; }
        .report-header .meta span { margin-right: 18px; }
        .summary-bar { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .summary-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; text-align: center; flex: 1; min-width: 70px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .summary-item .val { font-size: 12px; font-weight: 700; color: #0A2647; }
        .summary-item .lbl { font-size: 7px; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 1px; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        th { background: #0A2647; color: #fff; padding: 6px 6px; text-align: center; font-size: 7px; font-weight: 700; border: 1px solid #1a3a5c; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.2px; }
        td { padding: 4px 6px; border: 1px solid #e2e8f0; text-align: center; font-size: 9px; }
        .right { text-align: right; }
        .left { text-align: left; }
        .totals-row td { font-weight: 700; background: #f1f5f9; border-top: 2px solid #0A2647; font-size: 9px; }
        .grand-net td { font-weight: 800; background: #eff6ff; font-size: 11px; color: #0A2647; border-top: 3px solid #0A2647; }
        .footer { margin-top: 12px; font-size: 8px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        .no-print { text-align: right; margin-bottom: 8px; }
        .no-print button { padding: 7px 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; margin-left: 8px; }
        .no-print .btn-print { background: #0A2647; color: #fff; }
        .no-print .btn-close { background: #e2e8f0; color: #475569; }
        @media print { .no-print { display: none; } body { background: #fff; } }
      </style>
      </head>
      <body>
        <div class="no-print"><button class="btn-print" onclick="window.print()">ðŸ–¨ Print</button><button class="btn-close" onclick="window.close()">âœ• Close</button></div>
        <div class="report-header">
          <h1>Payroll Detail Report</h1>
          <div class="meta">
            <span>Period: ${monthLabel}</span><span>Records: ${filteredPayroll.length}</span>
            <span>Paid: ${filteredPayroll.filter(p => p.paid).length}</span>
            <span>Unpaid: ${filteredPayroll.filter(p => !p.paid).length}</span>
            <span>Generated: ${dateStr} ${timeStr}</span>
          </div>
        </div>
        <div class="summary-bar">
          <div class="summary-item"><div class="val">${filteredPayroll.length}</div><div class="lbl">Records</div></div>
          <div class="summary-item"><div class="val">PKR ${totalBasic.toLocaleString()}</div><div class="lbl">Total Basic</div></div>
          <div class="summary-item"><div class="val">PKR ${totalAllow.toLocaleString()}</div><div class="lbl">Total Allowances</div></div>
          <div class="summary-item"><div class="val">PKR ${totalComm.toLocaleString()}</div><div class="lbl">Total Commission</div></div>
          <div class="summary-item"><div class="val">PKR ${totalDed.toLocaleString()}</div><div class="lbl">Total Deductions</div></div>
          <div class="summary-item"><div class="val">PKR ${totalNet.toLocaleString()}</div><div class="lbl">Total Net Pay</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th rowspan="2">Employee</th><th rowspan="2">Role</th>
              <th colspan="5">Allowances (PKR)</th><th rowspan="2">Total<br/>Allow.</th>
              <th rowspan="2">Activations<br/><span style="font-weight:400;font-size:6px;">New|MNP|Repl|BYN</span></th>
              <th colspan="6">Commissions (PKR)</th><th rowspan="2">Total<br/>Comm.</th>
              <th colspan="2">Bonuses</th><th colspan="3">Deductions</th><th rowspan="2">Total<br/>Ded.</th>
              <th rowspan="2">Net Pay</th><th rowspan="2">Status</th>
            </tr><tr>
              <th style="font-size:7px;">Basic</th><th style="font-size:7px;">Fuel</th><th style="font-size:7px;">Mobile</th><th style="font-size:7px;">Daily</th><th style="font-size:7px;">Res.</th>
              <th style="font-size:7px;">New SIM</th><th style="font-size:7px;">MNP</th><th style="font-size:7px;">Repl.</th><th style="font-size:7px;">BYN</th><th style="font-size:7px;">Hike</th><th style="font-size:7px;">Other</th>
              <th style="font-size:7px;">Target</th><th style="font-size:7px;">Perf.</th><th style="font-size:7px;">Advance</th><th style="font-size:7px;">Loan</th><th style="font-size:7px;">Other</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="2" class="left">TOTAL (${filteredPayroll.length})</td>
              <td class="right">PKR ${totalBasic.toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.fuelAllowance || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.mobileAllowance || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.dailyAllowance || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.residenceAllowance || 0), 0).toLocaleString()}</td>
              <td class="right">PKR ${totalAllow.toLocaleString()}</td>
              <td>â€”</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.newSimCommission || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.mnpCommission || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.replacementCommission || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.bynCommission || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.hikeCommission || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.otherCommission || 0), 0).toLocaleString()}</td>
              <td class="right">PKR ${totalComm.toLocaleString()}</td>
              <td class="right">PKR ${filteredPayroll.reduce((s,p) => s + (p.targetBonus || 0), 0).toLocaleString()}</td>
              <td class="right">PKR ${filteredPayroll.reduce((s,p) => s + (p.performanceBonus || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.advanceSalary || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.loanDeduction || 0), 0).toLocaleString()}</td>
              <td class="right">${filteredPayroll.reduce((s,p) => s + (p.otherDeduction || 0), 0).toLocaleString()}</td>
              <td class="right">PKR ${totalDed.toLocaleString()}</td>
              <td class="right" style="background:#eff6ff;font-size:11px;color:#0A2647;">PKR ${totalNet.toLocaleString()}</td>
              <td>â€”</td>
            </tr>
          </tfoot>
        </table>
        <div class="footer">THE SMART ERP â€” Payroll System | Generated on ${dateStr} at ${timeStr}</div>
      </body></html>
    `);
    printWindow.document.close();
  };

  const toggleSelectAllPayroll = () => {
    if (selectedPayroll.length === filteredPayroll.filter((p) => !p.paid).length) {
      setSelectedPayroll([]);
    } else {
      setSelectedPayroll(filteredPayroll.filter((p) => !p.paid).map((p) => p.id));
    }
  };

  const stats = useMemo(() => {
    const total = filteredPayroll.reduce((s, p) => s + (p.netPay || 0), 0);
    const paid = filteredPayroll.filter((p) => p.paid);
    const unpaid = filteredPayroll.filter((p) => !p.paid);
    return {
      totalPay: total,
      paidCount: paid.length,
      unpaidCount: unpaid.length,
      paidAmount: paid.reduce((s, p) => s + (p.netPay || 0), 0),
      unpaidAmount: unpaid.reduce((s, p) => s + (p.netPay || 0), 0),
    };
  }, [filteredPayroll]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Payroll Management</h1>
          <p className="text-gray-500 text-sm mt-1">Auto-generate salary with commission calculations</p>
        </div>
        <div className="flex gap-2">
          {tab === "list" && selectedPayroll.length > 0 && (
            <button onClick={() => handleMarkPaid(selectedPayroll)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-md transition-all hover:scale-105">
              <Check size={16} /> Mark Paid ({selectedPayroll.length})
            </button>
          )}
          {tab === "list" && filteredPayroll.length > 0 && (
            <button onClick={handlePrintPayroll}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8A951] text-[#0A2647] font-bold text-sm rounded-xl hover:bg-[#d4b560] shadow-md transition-all hover:scale-105">
              <Printer size={16} /> Print / Export
            </button>
          )}
          <button onClick={() => setTab(tab === "generate" ? "list" : "generate")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
            {tab === "generate" ? <><ListIcon /> View Payroll</> : <><Zap size={16} /> Generate Payroll</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Pay", value: `PKR ${stats.totalPay.toLocaleString()}`, icon: DollarSign, color: "bg-[#0A2647]" },
          { label: "Total Records", value: filteredPayroll.length, icon: Users, color: "bg-blue-500" },
          { label: "Paid", value: stats.paidCount, icon: CheckCircle2, color: "bg-green-500" },
          { label: "Unpaid", value: stats.unpaidCount, icon: Clock, color: "bg-red-500" },
          { label: "Unpaid Amount", value: `PKR ${stats.unpaidAmount.toLocaleString()}`, icon: AlertTriangle, color: "bg-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-medium">{s.label}</p>
              <p className="text-gray-900 text-sm font-black">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["All", "DSM", "DSO"] as const).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${roleFilter === r ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all">
            <Search size={16} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
          </div>
        </div>
      </div>

      {/* Generate Tab */}
      {tab === "generate" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#0A2647] to-[#144272] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Auto-Generate Payroll</h3>
                <p className="text-white/60 text-xs">Select employees and generate salary with auto-calculated commissions</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button onClick={() => {
                if (selectAll) { setSelectedEmps([]); setSelectAll(false); }
                else { setSelectedEmps(filteredEmployees.map((e) => e.id)); setSelectAll(true); }
              }}
                className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-all">
                {selectAll ? "Deselect All" : `Select All (${filteredEmployees.length})`}
              </button>
              <button onClick={handleGenerate}
                disabled={selectedEmps.length === 0 && !filteredEmployees.length}
                className="px-6 py-2 bg-[#C8A951] text-[#0A2647] rounded-xl text-xs font-black hover:bg-[#d4b560] transition-all disabled:opacity-50 inline-flex items-center gap-2">
                <Zap size={14} /> Generate Payroll
                {selectedEmps.length > 0 ? ` (${selectedEmps.length} selected)` : ` (${filteredEmployees.length} employees)`}
              </button>
            </div>
          </div>

          {/* Employee Selection List */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 w-10">
                      <button onClick={() => {
                        if (selectAll) { setSelectedEmps([]); setSelectAll(false); }
                        else { setSelectedEmps(filteredEmployees.map((e) => e.id)); setSelectAll(true); }
                      }} className="text-gray-400 hover:text-[#0A2647]">
                        {selectAll ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} />}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Employee</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Role</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Basic</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Allow.</th>
                    <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Activations</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Commission</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Deductions</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase font-bold">Net Pay</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => {
                    const isSelected = selectedEmps.includes(emp.id);
                    const exists = monthPayrollExists.has(emp.id);
                    const calc = calcPayroll(emp);
                    return (
                      <tr key={emp.id} className={`border-b border-gray-50 transition-colors ${isSelected ? "bg-blue-50" : exists ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}>
                        <td className="px-4 py-3">
                          <button onClick={() => {
                            if (exists) return;
                            setSelectedEmps((p) => p.includes(emp.id) ? p.filter((i) => i !== emp.id) : [...p, emp.id]);
                          }} className="text-gray-400 hover:text-[#0A2647]" disabled={exists}>
                            {isSelected ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900 text-sm font-medium">{emp.name}</p>
                          <p className="text-gray-400 text-xs font-mono">{emp.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${emp.role === "DSM" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{emp.role}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 text-xs hidden md:table-cell">PKR {calc.basic.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-600 text-xs hidden lg:table-cell">PKR {calc.totalAllowances.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <div className="flex items-center justify-center gap-1 text-[10px]">
                            <span className="px-1.5 py-0.5 bg-gray-900 text-white rounded font-bold" title="Total">{calc.totalActivations}</span>
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold" title="BVS">{calc.bvsCount}</span>
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold" title="FCA">{calc.fcaCount}</span>
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-bold" title="IFCA">{calc.ifcaCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 text-xs font-medium hidden xl:table-cell">PKR {calc.totalCommission.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-500 text-xs hidden xl:table-cell">PKR {calc.totalDeductions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-gray-900 text-sm font-black">PKR {calc.netPay.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          {exists ? (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500">Already Generated</span>
                          ) : isSelected ? (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-700">Selected</span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-700">Ready</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredEmployees.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Users size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No employees found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List Tab */}
      {tab === "list" && (
        <div className="space-y-4">
          {/* Bulk Actions */}
          {selectedPayroll.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="text-green-700 text-sm font-medium">{selectedPayroll.length} selected</span>
              <button onClick={() => handleMarkPaid(selectedPayroll)}
                className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 inline-flex items-center gap-1">
                <Check size={12} /> Mark as Paid
              </button>
              <button onClick={() => setSelectedPayroll([])} className="text-green-600 hover:text-green-800 text-xs">Clear</button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleSelectAllPayroll} className="text-gray-400 hover:text-[#0A2647]">
                        {selectedPayroll.length === filteredPayroll.filter((p) => !p.paid).length && filteredPayroll.filter((p) => !p.paid).length > 0
                          ? <CheckSquare size={18} className="text-[#0A2647]" />
                          : <Square size={18} />}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Employee</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Basic</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Allow.</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Commission</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Bonuses</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Deductions</th>
                    <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase font-bold">Net Pay</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Status</th>
                    <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.map((p) => {
                    const isExpanded = expandedRow === p.id;
                    const isSelected = selectedPayroll.includes(p.id);
                    return (
                      <Fragment key={p.id}>
                        <tr className={`border-b border-gray-50 transition-colors ${isSelected ? "bg-green-50/50" : "hover:bg-gray-50"}`}>
                          <td className="px-4 py-3">
                            {!p.paid && (
                              <button onClick={() => setSelectedPayroll((prev) => prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id])}
                                className="text-gray-400 hover:text-[#0A2647]">
                                {isSelected ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} />}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900 text-sm font-medium">{p.employeeName}</p>
                              <p className="text-gray-400 text-xs font-mono">{p.employeeId} Â· {p.role}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 text-xs hidden md:table-cell">PKR {(p.basicSalary || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-gray-600 text-xs hidden lg:table-cell">PKR {(p.totalAllowances || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-green-600 text-xs font-medium hidden lg:table-cell">PKR {(p.totalCommission || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-blue-600 text-xs hidden xl:table-cell">PKR {((p.targetBonus || 0) + (p.performanceBonus || 0)).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-red-500 text-xs hidden xl:table-cell">PKR {(p.totalDeductions || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-gray-900 text-sm font-black">PKR {(p.netPay || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${p.paid ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                              {p.paid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {!p.paid && (
                                <button onClick={() => handleMarkPaid([p.id])}
                                  className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all" title="Mark Paid">
                                  <Check size={14} />
                                </button>
                              )}
                              <button onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                                className="p-2 text-gray-400 hover:text-[#0A2647] hover:bg-gray-100 rounded-lg transition-all" title="Details">
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                              <button onClick={() => deletePayroll(p.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-gray-50/80">
                            <td colSpan={10} className="px-4 py-4">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Allowances */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Wallet size={14} className="text-green-500" /> Allowances
                                  </h4>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-500">Basic Salary</span><span className="font-medium">PKR {(p.basicSalary || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Fuel</span><span className="font-medium">PKR {(p.fuelAllowance || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Mobile</span><span className="font-medium">PKR {(p.mobileAllowance || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Daily</span><span className="font-medium">PKR {(p.dailyAllowance || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Residence</span><span className="font-medium">PKR {(p.residenceAllowance || 0).toLocaleString()}</span></div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold"><span>Total Allowances</span><span>PKR {(p.totalAllowances || 0).toLocaleString()}</span></div>
                                  </div>
                                </div>

                                {/* Commissions */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <TrendingUp size={14} className="text-blue-500" /> Commissions
                                  </h4>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-500">New SIM ({p.newSimCount || 0} Ã— Rs.{p.newSimRate || 0})</span><span className="font-medium text-green-600">PKR {(p.newSimCommission || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">MNP ({p.mnpCount || 0} Ã— Rs.{p.mnpRate || 0})</span><span className="font-medium text-green-600">PKR {(p.mnpCommission || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Replace ({p.replacementCount || 0} Ã— Rs.{p.replacementRate || 0})</span><span className="font-medium text-green-600">PKR {(p.replacementCommission || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">BYN ({p.bynCount || 0} Ã— Rs.{p.bynRate || 0})</span><span className="font-medium text-green-600">PKR {(p.bynCommission || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Hike + Other</span><span className="font-medium text-green-600">PKR {((p.hikeCommission || 0) + (p.otherCommission || 0)).toLocaleString()}</span></div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold"><span>Total Commission</span><span className="text-green-600">PKR {(p.totalCommission || 0).toLocaleString()}</span></div>
                                  </div>
                                </div>

                                {/* Bonuses & Deductions */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <DollarSign size={14} className="text-[#C8A951]" /> Bonuses & Deductions
                                  </h4>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-500">Target Bonus</span><span className="font-medium text-blue-600">PKR {(p.targetBonus || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Performance Bonus</span><span className="font-medium text-blue-600">PKR {(p.performanceBonus || 0).toLocaleString()}</span></div>
                                    <div className="border-t border-gray-200 pt-2">
                                      <div className="flex justify-between text-red-500"><span>Advance Salary</span><span>-PKR {(p.advanceSalary || 0).toLocaleString()}</span></div>
                                      <div className="flex justify-between text-red-500"><span>Loan Deduction</span><span>-PKR {(p.loanDeduction || 0).toLocaleString()}</span></div>
                                      <div className="flex justify-between text-red-500"><span>Other Deduction</span><span>-PKR {(p.otherDeduction || 0).toLocaleString()}</span></div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold"><span>Total Deductions</span><span className="text-red-500">-PKR {(p.totalDeductions || 0).toLocaleString()}</span></div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black">
                                      <span>Net Pay</span>
                                      <span className="text-[#0A2647]">PKR {(p.netPay || 0).toLocaleString()}</span>
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
            {filteredPayroll.length === 0 && (
              <div className="px-6 py-12 text-center">
                <DollarSign size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No payroll records for this month</p>
                <button onClick={() => setTab("generate")} className="mt-3 px-4 py-2 bg-[#0A2647] text-white text-xs font-bold rounded-xl hover:bg-[#144272] inline-flex items-center gap-2">
                  <Zap size={14} /> Generate Payroll
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

import { Fragment } from "react";
import { ChevronUp } from "lucide-react";
