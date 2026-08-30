"use client";

import { useState, useEffect, useMemo } from "react";
import { useDSMData } from "@/lib/DSMDataContext";
import { apiLoadById } from "@/lib/api";
import {
  DollarSign, Calendar, Smartphone, ArrowRightLeft, Repeat, Hash,
  TrendingUp, TrendingDown, Wallet, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Download, Users
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { QuickChip } from "@/components/ui/Badge";

export default function DSMSalaryDetailPage() {
  const { activations, dsos, auth, hydrated } = useDSMData();

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salaryData, setSalaryData] = useState<Record<string, number>>({});
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const dsmId = auth.dsmId || "DSM-NRWP-001";

  useEffect(() => {
    (async () => {
      try {
        const authData = await apiLoadById("franchiseData", "dsm-auth");
        if (authData?.data) {
          const parsed = JSON.parse(authData.data);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          const me = list.find((d: any) => d.id === dsmId);
          if (me) {
            const fields = ["salary","fuelAllowance","mobileAllowance","dailyAllowance","residenceAllowance",
              "newSimCommission","mnpCommission","replacementCommission","bynCommission","hikeCommission",
              "otherCommission","targetBonus","bonus","advanceSalary","loanDeduction","otherDeduction"];
            const obj: Record<string, number> = {};
            fields.forEach((f) => { obj[f] = me[f] || 0; });
            setSalaryData(obj);
          }
        }
      } catch {}
    })();
  }, [dsmId]);

  const allMonths = useMemo(() => {
    const months = new Set<string>();
    activations.forEach((a) => {
      if (a.createdAt) months.add(a.createdAt.slice(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [activations]);

  const getTeamActivationsForMonth = (m: string) => {
    const monthActs = activations.filter((a) => {
      const aMonth = a.createdAt?.slice(0, 7);
      return aMonth === m && a.status === "Completed";
    });
    return {
      newSIM: monthActs.filter((a) => a.type === "New SIM").length,
      mnp: monthActs.filter((a) => a.type === "MNP").length,
      replacement: monthActs.filter((a) => a.type === "Replacement").length,
      byn: monthActs.filter((a) => a.type === "BYN").length,
      total: monthActs.length,
    };
  };

  const getDSOPerformanceForMonth = (m: string) => {
    return dsos.map((d) => {
      const dsoActs = activations.filter((a) => a.dsoId === d.id && a.createdAt?.slice(0, 7) === m && a.status === "Completed");
      return {
        id: d.id,
        name: d.name,
        activations: dsoActs.length,
        newSIM: dsoActs.filter((a) => a.type === "New SIM").length,
        mnp: dsoActs.filter((a) => a.type === "MNP").length,
        replacement: dsoActs.filter((a) => a.type === "Replacement").length,
        byn: dsoActs.filter((a) => a.type === "BYN").length,
      };
    }).sort((a, b) => b.activations - a.activations);
  };

  const calcPayroll = (m: string) => {
    const basic = salaryData.salary || 0;
    const fuel = salaryData.fuelAllowance || 0;
    const mobile = salaryData.mobileAllowance || 0;
    const daily = salaryData.dailyAllowance || 0;
    const residence = salaryData.residenceAllowance || 0;
    const totalAllowances = fuel + mobile + daily + residence;

    const acts = getTeamActivationsForMonth(m);
    const newSimComm = acts.newSIM * (salaryData.newSimCommission || 0);
    const mnpComm = acts.mnp * (salaryData.mnpCommission || 0);
    const replComm = acts.replacement * (salaryData.replacementCommission || 0);
    const bynComm = acts.byn * (salaryData.bynCommission || 0);
    const hike = salaryData.hikeCommission || 0;
    const other = salaryData.otherCommission || 0;
    const totalCommission = newSimComm + mnpComm + replComm + bynComm + hike + other;

    const targetBonus = salaryData.targetBonus || 0;
    const perfBonus = salaryData.bonus || 0;
    const gross = basic + totalAllowances + totalCommission + targetBonus + perfBonus;

    const advance = salaryData.advanceSalary || 0;
    const loan = salaryData.loanDeduction || 0;
    const otherDed = salaryData.otherDeduction || 0;
    const totalDeductions = advance + loan + otherDed;
    const netPay = gross - totalDeductions;

    return {
      basic, fuel, mobile, daily, residence, totalAllowances,
      newSimCount: acts.newSIM, newSimRate: salaryData.newSimCommission || 0, newSimComm,
      mnpCount: acts.mnp, mnpRate: salaryData.mnpCommission || 0, mnpComm,
      replacementCount: acts.replacement, replacementRate: salaryData.replacementCommission || 0, replComm,
      bynCount: acts.byn, bynRate: salaryData.bynCommission || 0, bynComm,
      hike, other, totalCommission,
      targetBonus, perfBonus,
      advance, loan, otherDed, totalDeductions,
      gross, netPay, totalActs: acts.total,
    };
  };

  const currentPayroll = useMemo(() => calcPayroll(selectedMonth), [selectedMonth, salaryData, activations]);
  const dsoPerformance = useMemo(() => getDSOPerformanceForMonth(selectedMonth), [selectedMonth, dsos, activations]);

  const downloadSlip = () => {
    const c = currentPayroll;
    const numberToWords = (n: number): string => {
      if (n === 0) return "Zero";
      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      const convert = (num: number): string => {
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
        if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + convert(num % 100) : "");
        if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
        if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
        return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
      };
      return convert(Math.round(n));
    };

    const win = window.open("", "_blank");
    if (!win) return;
    const now = new Date();
    const ds = now.toLocaleDateString("en-GB");
    const ts = now.toLocaleTimeString();
    const monthName = new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const name = auth.dsmName || "DSM";
    const id = auth.dsmId || "--";
    const slipId = `SLIP-${id}-${selectedMonth.replace("-", "")}`;
    const initial = name.charAt(0).toUpperCase();

    win.document.write(`<!DOCTYPE html>
<html><head><title>Salary Slip - ${name} - ${monthName}</title>
<style>
  @page { size: A4; margin: 8mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Satoshi', sans-serif; background: #eef1f5; padding: 20px; color: #1e293b; font-size: 11px; line-height: 1.5; }
  .slip { max-width: 190mm; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.06); overflow: hidden; position: relative; }
  .top-accent { height: 4px; background: linear-gradient(90deg, #2D28CD 0%, #5A54FF 50%, #2D28CD 100%); }
  .header { padding: 24px 32px 16px; text-align: center; position: relative; }
  .header .company { font-size: 20px; font-weight: 800; color: #2D28CD; letter-spacing: 2px; }
  .header .company span { color: #0F172A; }
  .header .tagline { font-size: 8px; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase; margin-top: 2px; }
  .header .divider-line { width: 50px; height: 2px; background: #2D28CD; margin: 10px auto; }
  .header .slip-title { font-size: 15px; font-weight: 700; color: #1e293b; }
  .header .slip-period { font-size: 10px; color: #64748b; margin-top: 2px; }
  .header .slip-ref { position: absolute; top: 24px; right: 32px; font-size: 8px; color: #94a3b8; text-align: right; }
  .emp-section { display: flex; align-items: center; padding: 18px 32px; background: #f8fafc; border-top: 1px solid #e8ecf0; border-bottom: 1px solid #e8ecf0; }
  .emp-avatar { width: 44px; height: 44px; border-radius: 50%; background: #2D28CD; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; margin-right: 14px; flex-shrink: 0; }
  .emp-info { flex: 1; }
  .emp-info .name { font-size: 14px; font-weight: 700; color: #2D28CD; }
  .emp-info .meta { font-size: 10px; color: #64748b; margin-top: 2px; }
  .emp-info .meta span { margin-right: 14px; }
  .emp-badge { text-align: right; flex-shrink: 0; }
  .emp-badge .role { font-size: 10px; font-weight: 600; color: #fff; background: #2D28CD; padding: 3px 12px; border-radius: 20px; display: inline-block; }
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
  .row-total td { font-weight: 700; border-top: 2px solid #2D28CD; background: #eef5ff !important; }
  .row-total .row-value { color: #2D28CD; }
  .row-deduction .row-value { color: #dc2626; }
  .row-ded-total td { font-weight: 700; border-top: 2px solid #dc2626; background: #fef2f2 !important; }
  .row-ded-total .row-value { color: #dc2626; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
  .summary-card { background: #f8fafc; border: 1px solid #e8ecf0; border-radius: 8px; padding: 12px 14px; }
  .summary-card .sc-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-card .sc-value { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px; }
  .net-pay-box { margin: 16px 0; background: linear-gradient(135deg, #2D28CD 0%, #241F95 100%); border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .net-pay-box .np-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .net-pay-box .np-amount { font-size: 22px; font-weight: 800; color: #fff; }
  .net-pay-box .np-sub { font-size: 8px; color: #94a3b8; }
  .amt-words { background: #eef5ff; border-left: 3px solid #2D28CD; padding: 10px 16px; margin: 12px 0; font-size: 10px; color: #475569; border-radius: 0 6px 6px 0; }
  .barcode-wrap { text-align: center; padding: 8px 0 4px; }
  .barcode-wrap canvas { display: inline-block; background: #fff; }
  .barcode-wrap .bcode-id { font-size: 9px; color: #94a3b8; letter-spacing: 1px; font-family: 'Satoshi', monospace; margin-top: 2px; }
  .footer { text-align: center; padding: 12px 32px 16px; border-top: 1px solid #e8ecf0; margin-top: 8px; }
  .footer p { font-size: 8px; color: #94a3b8; margin: 1px 0; }
  .no-print { padding: 14px 32px 0; text-align: right; }
  .no-print button { padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; margin-left: 8px; transition: opacity 0.2s; }
  .no-print button:hover { opacity: 0.9; }
  .btn-print { background: #2D28CD; color: #fff; }
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
      <div class="name">${name}</div>
      <div class="meta">
        <span>ID: ${id}</span>
        <span>Role: DSM</span>
      </div>
    </div>
    <div class="emp-badge">
      <div class="role">DSM</div>
    </div>
  </div>
  <div class="content">
    <div class="section-label">Earnings</div>
    <table>
      <tr><td class="row-label">Basic Salary</td><td class="row-value">PKR ${c.basic.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label row-sub">Fuel Allowance</td><td class="row-value">PKR ${c.fuel.toLocaleString()}</td></tr>
      <tr><td class="row-label row-sub">Mobile Allowance</td><td class="row-value">PKR ${c.mobile.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label row-sub">Daily Allowance</td><td class="row-value">PKR ${c.daily.toLocaleString()}</td></tr>
      <tr><td class="row-label row-sub">Residence Allowance</td><td class="row-value">PKR ${c.residence.toLocaleString()}</td></tr>
      <tr class="row-total"><td class="row-label">Total Allowances</td><td class="row-value">PKR ${c.totalAllowances.toLocaleString()}</td></tr>
      <tr class="row-divider"><td colspan="2"></td></tr>
      <tr><td class="row-label">New SIM <span class="act-badge act-blue">${c.newSimCount} act.</span><span style="font-size:9px;color:#94a3b8;margin-left:4px;">Ã— Rs.${c.newSimRate}</span></td><td class="row-value">PKR ${c.newSimComm.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">MNP <span class="act-badge act-purple">${c.mnpCount} act.</span><span style="font-size:9px;color:#94a3b8;margin-left:4px;">Ã— Rs.${c.mnpRate}</span></td><td class="row-value">PKR ${c.mnpComm.toLocaleString()}</td></tr>
      <tr><td class="row-label">Replacement <span class="act-badge act-orange">${c.replacementCount} act.</span><span style="font-size:9px;color:#94a3b8;margin-left:4px;">Ã— Rs.${c.replacementRate}</span></td><td class="row-value">PKR ${c.replComm.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">BYN <span class="act-badge act-teal">${c.bynCount} act.</span><span style="font-size:9px;color:#94a3b8;margin-left:4px;">Ã— Rs.${c.bynRate}</span></td><td class="row-value">PKR ${c.bynComm.toLocaleString()}</td></tr>
      <tr><td class="row-label row-sub">Hike Commission</td><td class="row-value">PKR ${c.hike.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label row-sub">Other Commission</td><td class="row-value">PKR ${c.other.toLocaleString()}</td></tr>
      <tr class="row-total"><td class="row-label">Total Commission</td><td class="row-value">PKR ${c.totalCommission.toLocaleString()}</td></tr>
      <tr class="row-divider"><td colspan="2"></td></tr>
      <tr><td class="row-label">Target Bonus</td><td class="row-value">PKR ${c.targetBonus.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">Performance Bonus</td><td class="row-value">PKR ${c.perfBonus.toLocaleString()}</td></tr>
      <tr class="row-total"><td class="row-label">Gross Earnings</td><td class="row-value">PKR ${c.gross.toLocaleString()}</td></tr>
    </table>
    <div class="section-label">Deductions</div>
    <table>
      <tr><td class="row-label">Advance Salary</td><td class="row-value row-deduction">PKR ${c.advance.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">Loan Deduction</td><td class="row-value row-deduction">PKR ${c.loan.toLocaleString()}</td></tr>
      <tr><td class="row-label">Other Deduction</td><td class="row-value row-deduction">PKR ${c.otherDed.toLocaleString()}</td></tr>
      <tr class="row-ded-total"><td class="row-label">Total Deductions</td><td class="row-value">PKR ${c.totalDeductions.toLocaleString()}</td></tr>
    </table>
    <div class="summary-grid">
      <div class="summary-card"><div class="sc-label">Team Activations</div><div class="sc-value">${c.totalActs}</div></div>
      <div class="summary-card"><div class="sc-label">Gross Pay</div><div class="sc-value">PKR ${c.gross.toLocaleString()}</div></div>
    </div>
    <div class="net-pay-box">
      <div><div class="np-label">Net Payable</div><div class="np-sub">After all allowances &amp; deductions</div></div>
      <div class="np-amount">PKR ${c.netPay.toLocaleString()}</div>
    </div>
    <div class="amt-words" id="amtWords"><strong>Amount in Words:</strong> Rupees â€” Only</div>
    <div class="barcode-wrap">
      <canvas id="barcode"></canvas>
      <div class="bcode-id">${slipId}</div>
    </div>
  </div>
  <div class="footer">
    <p>This is a computer-generated salary slip for the period of ${monthName}.</p>
    <p>Generated: ${ds} at ${ts} &bull; THE SMART ERP Payroll System &bull; Pakistan</p>
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
document.getElementById('amtWords').innerHTML = '<strong>Amount in Words:</strong> Rupees ' + numberToWords(${c.netPay}) + ' Only';
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
    win.document.close();
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center"><div className="animate-spin w-8 h-8 border-4 border-[#2D28CD] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-gray-500">Loading...</p></div>
      </div>
    );
  }

return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "DSM" }, { label: "Salary" }, { label: "Salary Detail" }]}
        title="Salary Detail"
        description="Month-wise salary breakdown &amp; payslips"
        actions={
          <button onClick={downloadSlip}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFFB63] px-4 py-2 text-sm font-bold text-[#0A2647] shadow-sm transition-colors hover:bg-[#F1B308]">
            <Download className="h-4 w-4" /> Download Slip
          </button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-brand-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {allMonths.slice(0, 6).map((m) => {
              const label = new Date(m + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" });
              return (
                <QuickChip key={m} label={label} active={selectedMonth === m} onClick={() => setSelectedMonth(m)} />
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 px-5 pb-5 text-xs">
          <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 font-bold text-blue-700">
            <Smartphone className="h-3 w-3" /> {currentPayroll.newSimCount} New
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1.5 font-bold text-purple-700">
            <ArrowRightLeft className="h-3 w-3" /> {currentPayroll.mnpCount} MNP
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 font-bold text-orange-700">
            <Repeat className="h-3 w-3" /> {currentPayroll.replacementCount} Repl.
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 font-bold text-teal-700">
            <Hash className="h-3 w-3" /> {currentPayroll.bynCount} BYN
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 font-bold text-green-700">
            <CheckCircle2 className="h-3 w-3" /> {currentPayroll.totalActs} Team Acts
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 font-bold text-brand-700">
            <DollarSign className="h-3 w-3" /> Net: PKR {currentPayroll.netPay.toLocaleString()}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Basic Salary" value={`PKR ${currentPayroll.basic.toLocaleString()}`} icon={DollarSign} iconClass="bg-brand-50 text-brand-600" />
        <StatCard label="Allowances" value={`PKR ${currentPayroll.totalAllowances.toLocaleString()}`} icon={Wallet} iconClass="bg-green-50 text-green-600" />
        <StatCard label="Commission" value={`PKR ${currentPayroll.totalCommission.toLocaleString()}`} icon={TrendingUp} iconClass="bg-purple-50 text-purple-600" />
        <StatCard label="Bonuses" value={`PKR ${(currentPayroll.targetBonus + currentPayroll.perfBonus).toLocaleString()}`} icon={TrendingUp} iconClass="bg-blue-50 text-blue-600" />
        <StatCard label="Deductions" value={`-PKR ${currentPayroll.totalDeductions.toLocaleString()}`} icon={AlertTriangle} iconClass="bg-red-50 text-red-600" />
        <StatCard label="Net Pay" value={`PKR ${currentPayroll.netPay.toLocaleString()}`} icon={CheckCircle2} iconClass="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold mb-4 text-foreground">
            <DollarSign className="h-4 w-4 text-brand-600" /> Earnings
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">Basic Salary</span>
              <span className="font-bold text-foreground">PKR {currentPayroll.basic.toLocaleString()}</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-3 mb-1">Allowances</div>
            {currentPayroll.fuel > 0 && <div className="flex justify-between py-1"><span className="text-muted-foreground">Fuel</span><span>PKR {currentPayroll.fuel.toLocaleString()}</span></div>}
            {currentPayroll.mobile > 0 && <div className="flex justify-between py-1"><span className="text-muted-foreground">Mobile</span><span>PKR {currentPayroll.mobile.toLocaleString()}</span></div>}
            {currentPayroll.daily > 0 && <div className="flex justify-between py-1"><span className="text-muted-foreground">Daily</span><span>PKR {currentPayroll.daily.toLocaleString()}</span></div>}
            {currentPayroll.residence > 0 && <div className="flex justify-between py-1"><span className="text-muted-foreground">Residence</span><span>PKR {currentPayroll.residence.toLocaleString()}</span></div>}
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
              <span>Total Allowances</span>
              <span>PKR {currentPayroll.totalAllowances.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold mb-4 text-foreground">
            <TrendingUp className="h-4 w-4 text-purple-500" /> Commission (Team)
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">New SIM <span className="font-bold text-blue-500">({currentPayroll.newSimCount})</span> &times; Rs.{currentPayroll.newSimRate}</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.newSimComm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">MNP <span className="font-bold text-purple-500">({currentPayroll.mnpCount})</span> &times; Rs.{currentPayroll.mnpRate}</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.mnpComm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">Replacement <span className="font-bold text-orange-500">({currentPayroll.replacementCount})</span> &times; Rs.{currentPayroll.replacementRate}</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.replComm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">BYN <span className="font-bold text-teal-500">({currentPayroll.bynCount})</span> &times; Rs.{currentPayroll.bynRate}</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.bynComm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">Hike Commission</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.hike.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">Other Commission</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.other.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 font-bold">
              <span>Total Commission</span>
              <span className="text-green-600">PKR {currentPayroll.totalCommission.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold mb-4 text-foreground">
            <Wallet className="h-4 w-4 text-[#F1B308]" /> Bonuses &amp; Deductions
          </h3>
          <div className="space-y-3 text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Bonuses</div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">Target Bonus</span>
              <span className="font-medium text-blue-600">PKR {currentPayroll.targetBonus.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1.5">
              <span className="text-muted-foreground">Performance Bonus</span>
              <span className="font-medium text-blue-600">PKR {currentPayroll.perfBonus.toLocaleString()}</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-3 mb-1">Deductions</div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Advance Salary</span>
              <span className="text-red-500">-PKR {currentPayroll.advance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Loan Deduction</span>
              <span className="text-red-500">-PKR {currentPayroll.loan.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Other Deduction</span>
              <span className="text-red-500">-PKR {currentPayroll.otherDed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-red-500">
              <span>Total Deductions</span>
              <span>-PKR {currentPayroll.totalDeductions.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-gradient-to-r from-brand-600 to-[#241F95] p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70">Gross Pay</p>
                <p className="text-lg font-bold">PKR {currentPayroll.gross.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">Net Payable</p>
                <p className="text-xl font-black text-[#F1B308]">PKR {currentPayroll.netPay.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {dsoPerformance.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Users className="h-4 w-4 text-brand-600" /> DSO Team Performance &mdash; {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">DSO</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">New SIM</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">MNP</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">Repl.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">BYN</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase font-bold text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {dsoPerformance.map((d, i) => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-[#FFFB63] text-[#0A2647]" : i === 1 ? "bg-slate-400 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-brand-600 text-white"}`}>{i + 1}</div>
                        <span className="font-medium text-foreground">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{d.newSIM}</td>
                    <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{d.mnp}</td>
                    <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{d.replacement}</td>
                    <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell">{d.byn}</td>
                    <td className="px-4 py-3 text-center font-bold text-brand-600">{d.activations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {allMonths.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Calendar className="h-4 w-4 text-brand-600" /> Salary History
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {allMonths.map((m) => {
              const c = calcPayroll(m);
              const isExpanded = expandedMonth === m;
              const label = new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
              return (
                <div key={m}>
                  <div className="flex items-center justify-between px-6 py-3 cursor-pointer transition-colors hover:bg-slate-50"
                    onClick={() => setExpandedMonth(isExpanded ? null : m)}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                        <Calendar className="h-4 w-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{label}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Smartphone className="h-2.5 w-2.5" />{c.newSimCount}</span>
                          <span className="flex items-center gap-1"><ArrowRightLeft className="h-2.5 w-2.5" />{c.mnpCount}</span>
                          <span className="flex items-center gap-1"><Repeat className="h-2.5 w-2.5" />{c.replacementCount}</span>
                          <span className="flex items-center gap-1"><Hash className="h-2.5 w-2.5" />{c.bynCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-foreground">PKR {c.netPay.toLocaleString()}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-muted-foreground">Basic</p>
                          <p className="font-bold text-foreground">PKR {c.basic.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-muted-foreground">Allowances</p>
                          <p className="font-bold text-foreground">PKR {c.totalAllowances.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-muted-foreground">Commission</p>
                          <p className="font-bold text-green-600">PKR {c.totalCommission.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-muted-foreground">Net Pay</p>
                          <p className="font-black text-brand-600">PKR {c.netPay.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}