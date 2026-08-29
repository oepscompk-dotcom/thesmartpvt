"use client";

import { useState, useMemo, Fragment } from "react";
import {
  Search, Calendar, Users, DollarSign, Wallet, TrendingUp,
  AlertTriangle, CheckCircle2, Printer, ChevronDown, ChevronUp,
  Filter, ArrowRight, X, Check,
} from "lucide-react";
import { useFranchiseData, DSO, DSM } from "@/lib/FranchiseDataContext";
import { useDSOData } from "@/lib/DSODataContext";
import Link from "next/link";

export default function SalaryDetailPage() {
  const { dso, dsms } = useFranchiseData();
  const { activations, importVerifications } = useDSOData();

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [roleFilter, setRoleFilter] = useState<"All" | "DSO" | "DSM">("All");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const allEmployees = useMemo(() => {
    const emps: { id: string; name: string; role: "DSO" | "DSM"; data: DSO | DSM }[] = [];
    dso.forEach((d) => emps.push({ id: d.id, name: d.name, role: "DSO", data: d }));
    dsms.forEach((d) => emps.push({ id: d.id, name: d.name, role: "DSM", data: d }));
    return emps;
  }, [dso, dsms]);

  const getActivationsForDSO = (empId: string, m: string) => {
    const empActs = activations.filter((a) => {
      const aMonth = a.createdAt?.slice(0, 7);
      return a.dsoId === empId && aMonth === m && a.status === "Completed";
    });
    return {
      all: empActs,
      newSIM: empActs.filter((a) => a.type === "New SIM").length,
      mnp: empActs.filter((a) => a.type === "MNP").length,
      replacement: empActs.filter((a) => a.type === "Replacement").length,
      byn: empActs.filter((a) => a.type === "BYN").length,
      total: empActs.length,
    };
  };

  const getVal = (emp: { id: string; role: string; data: DSO | DSM }, field: string): number => {
    return (emp.data as any)[field] || 0;
  };

  const calcPayroll = (emp: { id: string; role: string; data: DSO | DSM }) => {
    const basic = getVal(emp, "salary");
    const fuel = getVal(emp, "fuelAllowance");
    const mobile = getVal(emp, "mobileAllowance");
    const daily = getVal(emp, "dailyAllowance");
    const residence = getVal(emp, "residenceAllowance");
    const totalAllowances = fuel + mobile + daily + residence;

    const acts = getActivationsForDSO(emp.id, month);

    let newSimBvsCount = 0, newSimFcaCount = 0, newSimIfcaCount = 0;
    let mnpBvsCount = 0, mnpFcaCount = 0, mnpIfcaCount = 0;
    let replacementBvsCount = 0, replacementFcaCount = 0, replacementIfcaCount = 0;
    let bynBvsCount = 0, bynFcaCount = 0, bynIfcaCount = 0;

    acts.all.forEach((a) => {
      const iv = importVerifications[a.simNumber];
      const actBvs = a.bvsStatus === "Completed" ? "0" : "X";
      const actFca = a.fcaStatus === "Completed" ? "0" : "X";
      const actIfca = a.ifcaStatus === "Completed" ? "0" : "X";
      const pick = (impV: string | undefined, actV: string) =>
        impV === "1" ? "1" : actV === "0" ? "0" : impV === "0" ? "0" : "X";
      const bvs = pick(iv?.bvs, actBvs);
      const fca = pick(iv?.fca, actFca);
      const ifca = pick(iv?.ifca, actIfca);

      if (a.type === "New SIM") {
        if (bvs === "1") newSimBvsCount++;
        if (fca === "1") newSimFcaCount++;
        if (ifca === "1") newSimIfcaCount++;
      } else if (a.type === "MNP") {
        if (bvs === "1") mnpBvsCount++;
        if (fca === "1") mnpFcaCount++;
        if (ifca === "1") mnpIfcaCount++;
      } else if (a.type === "Replacement") {
        if (bvs === "1") replacementBvsCount++;
        if (fca === "1") replacementFcaCount++;
        if (ifca === "1") replacementIfcaCount++;
      } else if (a.type === "BYN") {
        if (bvs === "1") bynBvsCount++;
        if (fca === "1") bynFcaCount++;
        if (ifca === "1") bynIfcaCount++;
      }
    });

    const newSimBvsRate = getVal(emp, "newSimBvs");
    const newSimFcaRate = getVal(emp, "newSimFca");
    const newSimIfcaRate = getVal(emp, "newSimIfca");
    const mnpBvsRate = getVal(emp, "mnpBvs");
    const mnpFcaRate = getVal(emp, "mnpFca");
    const mnpIfcaRate = getVal(emp, "mnpIfca");
    const replacementBvsRate = getVal(emp, "replacementBvs");
    const replacementFcaRate = getVal(emp, "replacementFca");
    const replacementIfcaRate = getVal(emp, "replacementIfca");
    const bynBvsRate = getVal(emp, "bynBvs");
    const bynFcaRate = getVal(emp, "bynFca");
    const bynIfcaRate = getVal(emp, "bynIfca");

    const newSimBvsComm = newSimBvsCount * newSimBvsRate;
    const newSimFcaComm = newSimFcaCount * newSimFcaRate;
    const newSimIfcaComm = newSimIfcaCount * newSimIfcaRate;
    const newSimComm = newSimBvsComm + newSimFcaComm + newSimIfcaComm;

    const mnpBvsComm = mnpBvsCount * mnpBvsRate;
    const mnpFcaComm = mnpFcaCount * mnpFcaRate;
    const mnpIfcaComm = mnpIfcaCount * mnpIfcaRate;
    const mnpComm = mnpBvsComm + mnpFcaComm + mnpIfcaComm;

    const replacementBvsComm = replacementBvsCount * replacementBvsRate;
    const replacementFcaComm = replacementFcaCount * replacementFcaRate;
    const replacementIfcaComm = replacementIfcaCount * replacementIfcaRate;
    const replComm = replacementBvsComm + replacementFcaComm + replacementIfcaComm;

    const bynBvsComm = bynBvsCount * bynBvsRate;
    const bynFcaComm = bynFcaCount * bynFcaRate;
    const bynIfcaComm = bynIfcaCount * bynIfcaRate;
    const bynComm = bynBvsComm + bynFcaComm + bynIfcaComm;

    const hike = getVal(emp, "hikeCommission");
    const other = getVal(emp, "otherCommission");
    const totalCommission = newSimComm + mnpComm + replComm + bynComm + hike + other;

    const targetBonus = getVal(emp, "targetBonus");
    const perfBonus = getVal(emp, "bonus");
    const gross = basic + totalAllowances + totalCommission + targetBonus + perfBonus;

    const advance = getVal(emp, "advanceSalary");
    const loan = getVal(emp, "loanDeduction");
    const otherDed = getVal(emp, "otherDeduction");
    const totalDeductions = advance + loan + otherDed;
    const netPay = gross - totalDeductions;

    const newSimRate = newSimBvsRate + newSimFcaRate + newSimIfcaRate;
    const mnpRate = mnpBvsRate + mnpFcaRate + mnpIfcaRate;
    const replacementRate = replacementBvsRate + replacementFcaRate + replacementIfcaRate;
    const bynRate = bynBvsRate + bynFcaRate + bynIfcaRate;

    return {
      basic, fuel, mobile, daily, residence, totalAllowances,
      newSimCount: acts.newSIM, newSimRate, newSimComm,
      newSimBvsCount, newSimBvsRate, newSimBvsComm,
      newSimFcaCount, newSimFcaRate, newSimFcaComm,
      newSimIfcaCount, newSimIfcaRate, newSimIfcaComm,
      mnpCount: acts.mnp, mnpRate, mnpComm,
      mnpBvsCount, mnpBvsRate, mnpBvsComm,
      mnpFcaCount, mnpFcaRate, mnpFcaComm,
      mnpIfcaCount, mnpIfcaRate, mnpIfcaComm,
      replacementCount: acts.replacement, replacementRate, replComm,
      replacementBvsCount, replacementBvsRate, replacementBvsComm,
      replacementFcaCount, replacementFcaRate, replacementFcaComm,
      replacementIfcaCount, replacementIfcaRate, replacementIfcaComm,
      bynCount: acts.byn, bynRate, bynComm,
      bynBvsCount, bynBvsRate, bynBvsComm,
      bynFcaCount, bynFcaRate, bynFcaComm,
      bynIfcaCount, bynIfcaRate, bynIfcaComm,
      hike, other, totalCommission,
      targetBonus, perfBonus,
      advance, loan, otherDed, totalDeductions,
      gross, netPay,
    };
  };

  const filtered = useMemo(() => {
    let list = allEmployees;
    if (roleFilter !== "All") list = list.filter((e) => e.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
    }
    return list;
  }, [allEmployees, roleFilter, search]);

  const totals = useMemo(() => {
    let basic = 0, allow = 0, comm = 0, bonus = 0, ded = 0, net = 0;
    filtered.forEach((e) => {
      const c = calcPayroll(e);
      basic += c.basic;
      allow += c.totalAllowances;
      comm += c.totalCommission;
      bonus += c.targetBonus + c.perfBonus;
      ded += c.totalDeductions;
      net += c.netPay;
    });
    return { basic, allow, comm, bonus, ded, net, count: filtered.length };
  }, [filtered, month, activations, importVerifications]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB");
    const timeStr = now.toLocaleTimeString();

    const rows = filtered.map((emp) => {
      const c = calcPayroll(emp);
      const totalActivations = c.newSimCount + c.mnpCount + c.replacementCount + c.bynCount;
      return `<tr>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;font-weight:500;color:#1a1a1a;">${emp.name}<br/><span style="font-size:8px;color:#888;font-weight:400;">${emp.id}</span></td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;"><span style="background:${emp.role === "DSO" ? "#d1fae5" : "#dbeafe"};color:${emp.role === "DSO" ? "#065f46" : "#1e40af"};padding:2px 8px;border-radius:10px;font-weight:600;font-size:8px;">${emp.role}</span></td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;font-weight:500;">${c.basic.toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">
          F:${c.fuel.toLocaleString()}<br/>M:${c.mobile.toLocaleString()}<br/>D:${c.daily.toLocaleString()}<br/>R:${c.residence.toLocaleString()}<br/><span style="font-weight:600;color:#1a1a1a;font-size:9px;">${c.totalAllowances.toLocaleString()}</span>
        </td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:center;">
          <span style="display:inline-block;background:#dbeafe;color:#1e40af;padding:1px 4px;border-radius:3px;margin:1px 0;font-weight:600;">New: ${c.newSimCount}</span><br/>
          <span style="display:inline-block;background:#fce7f3;color:#9d174d;padding:1px 4px;border-radius:3px;margin:1px 0;font-weight:600;">MNP: ${c.mnpCount}</span><br/>
          <span style="display:inline-block;background:#fef3c7;color:#92400e;padding:1px 4px;border-radius:3px;margin:1px 0;font-weight:600;">Repl: ${c.replacementCount}</span><br/>
          <span style="display:inline-block;background:#ede9fe;color:#5b21b6;padding:1px 4px;border-radius:3px;margin:1px 0;font-weight:600;">BYN: ${c.bynCount}</span><br/>
          <span style="font-weight:700;color:#1a1a1a;font-size:9px;">${totalActivations}</span>
        </td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#555;">
          NS-BVS:${c.newSimBvsComm.toLocaleString()} NS-FCA:${c.newSimFcaComm.toLocaleString()} NS-IFCA:${c.newSimIfcaComm.toLocaleString()}<br/>
          MNP-BVS:${c.mnpBvsComm.toLocaleString()} MNP-FCA:${c.mnpFcaComm.toLocaleString()} MNP-IFCA:${c.mnpIfcaComm.toLocaleString()}<br/>
          Rep-BVS:${c.replacementBvsComm.toLocaleString()} Rep-FCA:${c.replacementFcaComm.toLocaleString()} Rep-IFCA:${c.replacementIfcaComm.toLocaleString()}<br/>
          BYN-BVS:${c.bynBvsComm.toLocaleString()} BYN-FCA:${c.bynFcaComm.toLocaleString()} BYN-IFCA:${c.bynIfcaComm.toLocaleString()}<br/>
          HK:${c.hike.toLocaleString()} Oth:${c.other.toLocaleString()}<br/><span style="font-weight:600;color:#059669;font-size:9px;">${c.totalCommission.toLocaleString()}</span>
        </td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;color:#2563eb;font-weight:500;">${(c.targetBonus + c.perfBonus).toLocaleString()}</td>
        <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:8px;text-align:right;color:#dc2626;">
          Adv:${c.advance.toLocaleString()}<br/>Loan:${c.loan.toLocaleString()}<br/>Oth:${c.otherDed.toLocaleString()}<br/><span style="font-weight:600;font-size:9px;">${c.totalDeductions.toLocaleString()}</span>
        </td>
        <td style="padding:6px 8px;border:1px solid #d0d5dd;font-size:11px;text-align:right;font-weight:700;background:#eff6ff;color:#0A2647;">PKR ${c.netPay.toLocaleString()}</td>
      </tr>`;
    }).join("");

    const totalAct = filtered.reduce((s, e) => {
      const c = calcPayroll(e);
      return s + c.newSimCount + c.mnpCount + c.replacementCount + c.bynCount;
    }, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Salary Detail - ${month}</title>
      <style>
        @page { size: A4 landscape; margin: 8mm; }
        body { font-family: 'Satoshi', sans-serif; color: #1a1a1a; padding: 0; margin: 0; background: #f8fafc; }
        .report-header { background: linear-gradient(135deg, #0A2647 0%, #144272 100%); color: #fff; padding: 18px 24px; border-radius: 0; margin-bottom: 16px; }
        .report-header h1 { font-size: 20px; margin: 0; font-weight: 800; letter-spacing: 0.5px; }
        .report-header .meta { font-size: 10px; color: #94a3b8; margin-top: 4px; }
        .report-header .meta span { margin-right: 20px; }
        .summary-bar { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
        .summary-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; text-align: center; flex: 1; min-width: 80px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .summary-item .val { font-size: 13px; font-weight: 700; color: #0A2647; }
        .summary-item .lbl { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        th { background: #0A2647; color: #fff; padding: 7px 8px; text-align: center; font-size: 8px; font-weight: 700; border: 1px solid #1a3a5c; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.3px; }
        td { padding: 5px 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 9px; }
        .right { text-align: right; }
        .left { text-align: left; }
        .totals-row td { font-weight: 700; background: #f1f5f9; border-top: 2px solid #0A2647; font-size: 10px; }
        .grand-net td { font-weight: 800; background: #eff6ff; font-size: 12px; color: #0A2647; border-top: 3px solid #0A2647; }
        .footer { margin-top: 14px; font-size: 8px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        .no-print { text-align: right; margin-bottom: 10px; }
        .no-print button { padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; margin-left: 8px; }
        .no-print .btn-print { background: #0A2647; color: #fff; }
        .no-print .btn-close { background: #e2e8f0; color: #475569; }
        @media print { .no-print { display: none; } body { background: #fff; } }
      </style>
      </head>
      <body>
        <div class="no-print"><button class="btn-print" onclick="window.print()">ðŸ–¨ Print</button><button class="btn-close" onclick="window.close()">âœ• Close</button></div>
        <div class="report-header">
          <h1>Salary Detail Report</h1>
          <div class="meta">
            <span>Period: ${month}</span><span>Employees: ${filtered.length}</span>
            <span>Role: ${roleFilter}</span><span>Generated: ${dateStr} ${timeStr}</span>
          </div>
        </div>
        <div class="summary-bar">
          <div class="summary-item"><div class="val">${filtered.length}</div><div class="lbl">Employees</div></div>
          <div class="summary-item"><div class="val">PKR ${totals.basic.toLocaleString()}</div><div class="lbl">Total Basic</div></div>
          <div class="summary-item"><div class="val">PKR ${totals.allow.toLocaleString()}</div><div class="lbl">Total Allowances</div></div>
          <div class="summary-item"><div class="val">PKR ${totals.comm.toLocaleString()}</div><div class="lbl">Total Commission</div></div>
          <div class="summary-item"><div class="val">PKR ${totals.ded.toLocaleString()}</div><div class="lbl">Total Deductions</div></div>
          <div class="summary-item"><div class="val">PKR ${totals.net.toLocaleString()}</div><div class="lbl">Total Net Pay</div></div>
        </div>
        <table>
          <thead><tr>
            <th rowspan="2">Employee</th><th rowspan="2">Role</th>
            <th rowspan="2">Basic Salary</th>
            <th rowspan="2">Allowances<br/><span style="font-weight:400;font-size:7px;">F | M | D | R</span></th>
            <th rowspan="2">Activations<br/><span style="font-weight:400;font-size:7px;">New SIM | MNP | Repl. | BYN</span></th>
            <th rowspan="2">Commission<br/><span style="font-weight:400;font-size:7px;">NS | MNP | Rep | BYN | H | O</span></th>
            <th rowspan="2">Bonuses</th>
            <th rowspan="2">Deductions<br/><span style="font-weight:400;font-size:7px;">Adv | Loan | Oth</span></th>
            <th rowspan="2">Net Pay</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="2" class="left">TOTAL (${filtered.length} employees)</td>
              <td class="right">PKR ${totals.basic.toLocaleString()}</td>
              <td class="right">PKR ${totals.allow.toLocaleString()}</td>
              <td class="right">${totalAct}</td>
              <td class="right">PKR ${totals.comm.toLocaleString()}</td>
              <td class="right">PKR ${totals.bonus.toLocaleString()}</td>
              <td class="right">PKR ${totals.ded.toLocaleString()}</td>
              <td class="right" style="font-size:11px;">PKR ${totals.net.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div class="footer">THE SMART ERP â€” Payroll System | Generated on ${dateStr} at ${timeStr}</div>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Salary Detail</h1>
          <p className="text-gray-500 text-sm mt-1">Monthly salary breakdown for all employees</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/franchise/payroll"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all">
            <DollarSign size={14} /> Payroll
          </Link>
          <button onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C8A951] text-[#0A2647] font-bold text-sm rounded-xl hover:bg-[#d4b560] shadow-md transition-all">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: "Employees", value: totals.count, icon: Users, color: "bg-[#0A2647]" },
          { label: "Total Basic", value: `PKR ${totals.basic.toLocaleString()}`, icon: DollarSign, color: "bg-blue-500" },
          { label: "Total Allowances", value: `PKR ${totals.allow.toLocaleString()}`, icon: Wallet, color: "bg-green-500" },
          { label: "Total Commission", value: `PKR ${totals.comm.toLocaleString()}`, icon: TrendingUp, color: "bg-purple-500" },
          { label: "Total Deductions", value: `PKR ${totals.ded.toLocaleString()}`, icon: AlertTriangle, color: "bg-red-500" },
          { label: "Total Net Pay", value: `PKR ${totals.net.toLocaleString()}`, icon: CheckCircle2, color: "bg-[#C8A951]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-medium">{s.label}</p>
              <p className="text-gray-900 text-xs font-black">{s.value}</p>
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
            {(["All", "DSO", "DSM"] as const).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${roleFilter === r ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-200"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-[#0A2647]/30 transition-all">
            <Search size={16} className="text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 text-xs font-medium uppercase">Employee</th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase">Role</th>
                <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden md:table-cell">Basic</th>
                <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Allow.</th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden lg:table-cell">Activations</th>
                <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Commission</th>
                <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Bonuses</th>
                <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase hidden xl:table-cell">Deductions</th>
                <th className="text-right px-4 py-3 text-gray-500 text-xs font-medium uppercase font-bold">Net Pay</th>
                <th className="text-center px-4 py-3 text-gray-500 text-xs font-medium uppercase">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const isExpanded = expandedRow === emp.id;
                const c = calcPayroll(emp);
                return (
                  <Fragment key={emp.id}>
                    <tr className={`border-b border-gray-50 transition-colors ${isExpanded ? "bg-blue-50/30" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${emp.role === "DSM" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"} flex items-center justify-center text-xs font-bold`}>
                            {emp.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-gray-900 text-sm font-medium">{emp.name}</p>
                            <p className="text-gray-400 text-xs font-mono">{emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${emp.role === "DSM" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{emp.role}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 text-xs hidden md:table-cell">PKR {c.basic.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-600 text-xs hidden lg:table-cell">PKR {c.totalAllowances.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1 text-[10px]">
                          <span className="px-1.5 py-0.5 bg-gray-900 text-white rounded font-bold" title="Total">{c.newSimCount + c.mnpCount + c.replacementCount + c.bynCount}</span>
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold" title="BVS">{c.newSimBvsCount + c.mnpBvsCount + c.replacementBvsCount + c.bynBvsCount}</span>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold" title="FCA">{c.newSimFcaCount + c.mnpFcaCount + c.replacementFcaCount + c.bynFcaCount}</span>
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-bold" title="IFCA">{c.newSimIfcaCount + c.mnpIfcaCount + c.replacementIfcaCount + c.bynIfcaCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 text-xs font-medium hidden xl:table-cell">PKR {c.totalCommission.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-blue-600 text-xs hidden xl:table-cell">PKR {(c.targetBonus + c.perfBonus).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-500 text-xs hidden xl:table-cell">PKR {c.totalDeductions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-900 text-sm font-black">PKR {c.netPay.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setExpandedRow(isExpanded ? null : emp.id)}
                          className="p-1.5 text-gray-400 hover:text-[#0A2647] hover:bg-gray-100 rounded-lg transition-all">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
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
                                <div className="flex justify-between"><span className="text-gray-500">Basic Salary</span><span className="font-medium">PKR {c.basic.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Fuel</span><span className="font-medium">PKR {c.fuel.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Mobile</span><span className="font-medium">PKR {c.mobile.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Daily</span><span className="font-medium">PKR {c.daily.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Residence</span><span className="font-medium">PKR {c.residence.toLocaleString()}</span></div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold"><span>Total Allowances</span><span>PKR {c.totalAllowances.toLocaleString()}</span></div>
                              </div>
                            </div>
                            {/* Commissions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                <TrendingUp size={14} className="text-blue-500" /> Commissions
                              </h4>
                              <div className="space-y-2 text-xs">
                                {c.newSimCount > 0 && (
                                  <>
                                    <div className="flex justify-between"><span className="text-gray-500">New SIM ({c.newSimCount})</span><span className="font-medium text-green-600">PKR {c.newSimComm.toLocaleString()}</span></div>
                                    {c.newSimBvsCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">BVS ({c.newSimBvsCount} Ã— Rs.{c.newSimBvsRate})</span><span className="text-green-600">PKR {c.newSimBvsComm.toLocaleString()}</span></div>}
                                    {c.newSimFcaCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">FCA ({c.newSimFcaCount} Ã— Rs.{c.newSimFcaRate})</span><span className="text-green-600">PKR {c.newSimFcaComm.toLocaleString()}</span></div>}
                                    {c.newSimIfcaCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">IFCA ({c.newSimIfcaCount} Ã— Rs.{c.newSimIfcaRate})</span><span className="text-green-600">PKR {c.newSimIfcaComm.toLocaleString()}</span></div>}
                                  </>
                                )}
                                {c.mnpCount > 0 && (
                                  <>
                                    <div className="flex justify-between"><span className="text-gray-500">MNP ({c.mnpCount})</span><span className="font-medium text-green-600">PKR {c.mnpComm.toLocaleString()}</span></div>
                                    {c.mnpBvsCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">BVS ({c.mnpBvsCount} Ã— Rs.{c.mnpBvsRate})</span><span className="text-green-600">PKR {c.mnpBvsComm.toLocaleString()}</span></div>}
                                    {c.mnpFcaCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">FCA ({c.mnpFcaCount} Ã— Rs.{c.mnpFcaRate})</span><span className="text-green-600">PKR {c.mnpFcaComm.toLocaleString()}</span></div>}
                                    {c.mnpIfcaCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">IFCA ({c.mnpIfcaCount} Ã— Rs.{c.mnpIfcaRate})</span><span className="text-green-600">PKR {c.mnpIfcaComm.toLocaleString()}</span></div>}
                                  </>
                                )}
                                {c.replacementCount > 0 && (
                                  <>
                                    <div className="flex justify-between"><span className="text-gray-500">Replace ({c.replacementCount})</span><span className="font-medium text-green-600">PKR {c.replComm.toLocaleString()}</span></div>
                                    {c.replacementBvsCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">BVS ({c.replacementBvsCount} Ã— Rs.{c.replacementBvsRate})</span><span className="text-green-600">PKR {c.replacementBvsComm.toLocaleString()}</span></div>}
                                    {c.replacementFcaCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">FCA ({c.replacementFcaCount} Ã— Rs.{c.replacementFcaRate})</span><span className="text-green-600">PKR {c.replacementFcaComm.toLocaleString()}</span></div>}
                                    {c.replacementIfcaCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">IFCA ({c.replacementIfcaCount} Ã— Rs.{c.replacementIfcaRate})</span><span className="text-green-600">PKR {c.replacementIfcaComm.toLocaleString()}</span></div>}
                                  </>
                                )}
                                {c.bynCount > 0 && (
                                  <>
                                    <div className="flex justify-between"><span className="text-gray-500">BYN ({c.bynCount})</span><span className="font-medium text-green-600">PKR {c.bynComm.toLocaleString()}</span></div>
                                    {c.bynBvsCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">BVS ({c.bynBvsCount} Ã— Rs.{c.bynBvsRate})</span><span className="text-green-600">PKR {c.bynBvsComm.toLocaleString()}</span></div>}
                                    {c.bynFcaCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">FCA ({c.bynFcaCount} Ã— Rs.{c.bynFcaRate})</span><span className="text-green-600">PKR {c.bynFcaComm.toLocaleString()}</span></div>}
                                    {c.bynIfcaCount > 0 && <div className="flex justify-between pl-4"><span className="text-gray-400">IFCA ({c.bynIfcaCount} Ã— Rs.{c.bynIfcaRate})</span><span className="text-green-600">PKR {c.bynIfcaComm.toLocaleString()}</span></div>}
                                  </>
                                )}
                                <div className="flex justify-between"><span className="text-gray-500">Hike + Other</span><span className="font-medium text-green-600">PKR {(c.hike + c.other).toLocaleString()}</span></div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold"><span>Total Commission</span><span className="text-green-600">PKR {c.totalCommission.toLocaleString()}</span></div>
                              </div>
                            </div>
                            {/* Bonuses & Deductions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                <DollarSign size={14} className="text-[#C8A951]" /> Bonuses & Deductions
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-gray-500">Target Bonus</span><span className="font-medium text-blue-600">PKR {(c.targetBonus).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Performance Bonus</span><span className="font-medium text-blue-600">PKR {(c.perfBonus).toLocaleString()}</span></div>
                                <div className="border-t border-gray-200 pt-2">
                                  <div className="flex justify-between text-red-500"><span>Advance Salary</span><span>-PKR {c.advance.toLocaleString()}</span></div>
                                  <div className="flex justify-between text-red-500"><span>Loan Deduction</span><span>-PKR {c.loan.toLocaleString()}</span></div>
                                  <div className="flex justify-between text-red-500"><span>Other Deduction</span><span>-PKR {c.otherDed.toLocaleString()}</span></div>
                                </div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold"><span>Total Deductions</span><span className="text-red-500">-PKR {c.totalDeductions.toLocaleString()}</span></div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black">
                                  <span>Net Pay</span>
                                  <span className="text-[#0A2647]">PKR {c.netPay.toLocaleString()}</span>
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
            <Users size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
}
