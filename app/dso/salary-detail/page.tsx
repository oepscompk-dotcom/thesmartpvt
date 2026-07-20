"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDSOData } from "@/lib/DSODataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import {
  DollarSign, Calendar, Smartphone, ArrowRightLeft, Repeat, Hash,
  TrendingUp, TrendingDown, Wallet, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, ArrowLeft, Download
} from "lucide-react";

export default function DSOSalaryDetailPage() {
  const { activations, auth, hydrated } = useDSOData();
  const router = useRouter();

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salaryData, setSalaryData] = useState<Record<string, number>>({});
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("smart-erp-franchise-dso");
      if (raw) {
        const list = JSON.parse(raw);
        const me = list.find((d: any) => d.id === auth.dsoId);
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
  }, [auth.dsoId]);

  const allMonths = useMemo(() => {
    const months = new Set<string>();
    activations.forEach((a) => {
      if (a.createdAt) months.add(a.createdAt.slice(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [activations]);

  const getActivationsForMonth = (m: string) => {
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

  const calcPayroll = (m: string) => {
    const basic = salaryData.salary || 0;
    const fuel = salaryData.fuelAllowance || 0;
    const mobile = salaryData.mobileAllowance || 0;
    const daily = salaryData.dailyAllowance || 0;
    const residence = salaryData.residenceAllowance || 0;
    const totalAllowances = fuel + mobile + daily + residence;

    const acts = getActivationsForMonth(m);
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
    const name = auth.dsoName || "DSO";
    const id = auth.dsoId || "--";
    const slipId = `SLIP-${id}-${selectedMonth.replace("-", "")}`;
    const initial = name.charAt(0).toUpperCase();

    win.document.write(`<!DOCTYPE html>
<html><head><title>Salary Slip - ${name} - ${monthName}</title>
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
      <div class="name">${name}</div>
      <div class="meta">
        <span>ID: ${id}</span>
        <span>Role: DSO</span>
      </div>
    </div>
    <div class="emp-badge">
      <div class="role">DSO</div>
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
      <tr><td class="row-label">New SIM <span class="act-badge act-blue">${c.newSimCount} act.</span><span style="font-size:9px;color:#94a3b8;margin-left:4px;">× Rs.${c.newSimRate}</span></td><td class="row-value">PKR ${c.newSimComm.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">MNP <span class="act-badge act-purple">${c.mnpCount} act.</span><span style="font-size:9px;color:#94a3b8;margin-left:4px;">× Rs.${c.mnpRate}</span></td><td class="row-value">PKR ${c.mnpComm.toLocaleString()}</td></tr>
      <tr><td class="row-label">Replacement <span class="act-badge act-orange">${c.replacementCount} act.</span><span style="font-size:9px;color:#94a3b8;margin-left:4px;">× Rs.${c.replacementRate}</span></td><td class="row-value">PKR ${c.replComm.toLocaleString()}</td></tr>
      <tr class="row-alt"><td class="row-label">BYN <span class="act-badge act-teal">${c.bynCount} act.</span><span style="font-size:9px;color:#94a3b8;margin-left:4px;">× Rs.${c.bynRate}</span></td><td class="row-value">PKR ${c.bynComm.toLocaleString()}</td></tr>
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
      <div class="summary-card"><div class="sc-label">Total Activations</div><div class="sc-value">${c.totalActs}</div></div>
      <div class="summary-card"><div class="sc-label">Gross Pay</div><div class="sc-value">PKR ${c.gross.toLocaleString()}</div></div>
    </div>
    <div class="net-pay-box">
      <div><div class="np-label">Net Payable</div><div class="np-sub">After all allowances &amp; deductions</div></div>
      <div class="np-amount">PKR ${c.netPay.toLocaleString()}</div>
    </div>
    <div class="amt-words" id="amtWords"><strong>Amount in Words:</strong> Rupees — Only</div>
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
        <div className="text-center"><div className="animate-spin w-8 h-8 border-4 border-[#0A2647] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-gray-500">Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dso/dashboard")} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Salary Detail</h1>
            <p className="text-gray-500 text-sm mt-1">Month-wise salary breakdown &amp; payslips</p>
          </div>
        </div>
        <button onClick={downloadSlip}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C8A951] text-[#0A2647] font-bold text-sm rounded-xl hover:bg-[#d4b560] shadow-md transition-all">
          <Download size={14} /> Download Slip
        </button>
      </div>

      {/* Month Selector + Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0A2647]/50" />
          </div>
          <div className="flex flex-wrap gap-2">
            {allMonths.slice(0, 6).map((m) => {
              const label = new Date(m + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" });
              return (
                <button key={m} onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMonth === m ? "bg-[#0A2647] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Mini activations summary */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold">
            <Smartphone size={12} /> {currentPayroll.newSimCount} New
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-bold">
            <ArrowRightLeft size={12} /> {currentPayroll.mnpCount} MNP
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg font-bold">
            <Repeat size={12} /> {currentPayroll.replacementCount} Repl.
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 text-teal-700 rounded-lg font-bold">
            <Hash size={12} /> {currentPayroll.bynCount} BYN
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg font-bold">
            <CheckCircle2 size={12} /> {currentPayroll.totalActs} Total
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0A2647]/10 text-[#0A2647] rounded-lg font-bold">
            <DollarSign size={12} /> Net: PKR {currentPayroll.netPay.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Basic Salary", value: `PKR ${currentPayroll.basic.toLocaleString()}`, icon: DollarSign, color: "bg-[#0A2647]" },
          { label: "Allowances", value: `PKR ${currentPayroll.totalAllowances.toLocaleString()}`, icon: Wallet, color: "bg-green-500" },
          { label: "Commission", value: `PKR ${currentPayroll.totalCommission.toLocaleString()}`, icon: TrendingUp, color: "bg-purple-500" },
          { label: "Bonuses", value: `PKR ${(currentPayroll.targetBonus + currentPayroll.perfBonus).toLocaleString()}`, icon: TrendingUp, color: "bg-blue-500" },
          { label: "Deductions", value: `-PKR ${currentPayroll.totalDeductions.toLocaleString()}`, icon: AlertTriangle, color: "bg-red-500" },
          { label: "Net Pay", value: `PKR ${currentPayroll.netPay.toLocaleString()}`, icon: CheckCircle2, color: "bg-[#C8A951]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3">
            <div className={`w-8 h-8 rounded-xl ${s.color} flex items-center justify-center mb-2`}>
              <s.icon size={14} className="text-white" />
            </div>
            <p className="text-gray-400 text-[10px] font-medium">{s.label}</p>
            <p className="text-gray-900 text-sm font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Earnings & Allowances */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-[#0A2647]" /> Earnings
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">Basic Salary</span>
              <span className="font-bold text-gray-900">PKR {currentPayroll.basic.toLocaleString()}</span>
            </div>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-3 mb-1">Allowances</div>
            {currentPayroll.fuel > 0 && <div className="flex justify-between py-1"><span className="text-gray-500">Fuel</span><span>PKR {currentPayroll.fuel.toLocaleString()}</span></div>}
            {currentPayroll.mobile > 0 && <div className="flex justify-between py-1"><span className="text-gray-500">Mobile</span><span>PKR {currentPayroll.mobile.toLocaleString()}</span></div>}
            {currentPayroll.daily > 0 && <div className="flex justify-between py-1"><span className="text-gray-500">Daily</span><span>PKR {currentPayroll.daily.toLocaleString()}</span></div>}
            {currentPayroll.residence > 0 && <div className="flex justify-between py-1"><span className="text-gray-500">Residence</span><span>PKR {currentPayroll.residence.toLocaleString()}</span></div>}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
              <span>Total Allowances</span>
              <span>PKR {currentPayroll.totalAllowances.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-500" /> Commission
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">New SIM <span className="text-blue-500 font-bold">({currentPayroll.newSimCount})</span> × Rs.{currentPayroll.newSimRate}</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.newSimComm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">MNP <span className="text-purple-500 font-bold">({currentPayroll.mnpCount})</span> × Rs.{currentPayroll.mnpRate}</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.mnpComm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">Replacement <span className="text-orange-500 font-bold">({currentPayroll.replacementCount})</span> × Rs.{currentPayroll.replacementRate}</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.replComm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">BYN <span className="text-teal-500 font-bold">({currentPayroll.bynCount})</span> × Rs.{currentPayroll.bynRate}</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.bynComm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">Hike Commission</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.hike.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">Other Commission</span>
              <span className="font-medium text-green-600">PKR {currentPayroll.other.toLocaleString()}</span>
            </div>
            <div className="pt-2 flex justify-between font-bold">
              <span>Total Commission</span>
              <span className="text-green-600">PKR {currentPayroll.totalCommission.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Bonuses & Deductions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-gray-900 font-bold text-sm mb-4 flex items-center gap-2">
            <Wallet size={16} className="text-[#C8A951]" /> Bonuses &amp; Deductions
          </h3>
          <div className="space-y-3 text-sm">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Bonuses</div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">Target Bonus</span>
              <span className="font-medium text-blue-600">PKR {currentPayroll.targetBonus.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500">Performance Bonus</span>
              <span className="font-medium text-blue-600">PKR {currentPayroll.perfBonus.toLocaleString()}</span>
            </div>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-3 mb-1">Deductions</div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Advance Salary</span>
              <span className="text-red-500">-PKR {currentPayroll.advance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Loan Deduction</span>
              <span className="text-red-500">-PKR {currentPayroll.loan.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Other Deduction</span>
              <span className="text-red-500">-PKR {currentPayroll.otherDed.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-red-500 font-bold">
              <span>Total Deductions</span>
              <span>-PKR {currentPayroll.totalDeductions.toLocaleString()}</span>
            </div>
          </div>
          {/* Net Pay Card */}
          <div className="mt-5 p-4 bg-gradient-to-r from-[#0A2647] to-[#144272] rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs">Gross Pay</p>
                <p className="text-lg font-bold">PKR {currentPayroll.gross.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs">Net Payable</p>
                <p className="text-xl font-black text-[#C8A951]">PKR {currentPayroll.netPay.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month-wise History */}
      {allMonths.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">
              <Calendar size={16} className="text-[#0A2647]" /> Salary History
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {allMonths.map((m) => {
              const c = calcPayroll(m);
              const isExpanded = expandedMonth === m;
              const label = new Date(m + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
              return (
                <div key={m}>
                  <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedMonth(isExpanded ? null : m)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0A2647]/10 flex items-center justify-center">
                        <Calendar size={16} className="text-[#0A2647]" />
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm font-bold">{label}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1"><Smartphone size={10} />{c.newSimCount}</span>
                          <span className="flex items-center gap-1"><ArrowRightLeft size={10} />{c.mnpCount}</span>
                          <span className="flex items-center gap-1"><Repeat size={10} />{c.replacementCount}</span>
                          <span className="flex items-center gap-1"><Hash size={10} />{c.bynCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 font-black">PKR {c.netPay.toLocaleString()}</span>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-400">Basic</p>
                          <p className="text-gray-900 font-bold">PKR {c.basic.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-400">Allowances</p>
                          <p className="text-gray-900 font-bold">PKR {c.totalAllowances.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-400">Commission</p>
                          <p className="text-green-600 font-bold">PKR {c.totalCommission.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-400">Net Pay</p>
                          <p className="text-[#0A2647] font-black">PKR {c.netPay.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
