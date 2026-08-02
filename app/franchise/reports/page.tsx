"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText, Download, BarChart3, Users, Smartphone, DollarSign, Calendar, Clock, Target, Wallet, TrendingUp, TrendingDown, Eye, Printer, Search, Filter, X, ChevronDown, ChevronUp, CreditCard, Briefcase, ClipboardList, PieChart, Activity } from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

type TabId = "overview" | "hr" | "sales" | "inventory" | "finance";
type ReportView = "table" | "preview";

export default function ReportsPage() {
  const { dsms, dso, devices, sims, attendance, targets, wallet, payroll, expenses, accounts, equipment, equipmentIssueRecords, bankAccounts, issueRecords, notifications, settings, auth } = useFranchiseData();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const allStaff = useMemo(() => {
    const s: { id: string; name: string; role: string; mobile: string; email: string; cnic: string; status: string; joinDate: string; salary: number; fatherName: string; assignedDSM?: string }[] = [];
    dso.forEach((d) => s.push({ id: d.id, name: d.name, role: "DSO", mobile: d.mobile, email: d.email || "", cnic: d.cnic, status: d.status, joinDate: d.joiningDate, salary: d.salary, fatherName: d.fatherName, assignedDSM: d.assignedDSM || "" }));
    dsms.forEach((d) => s.push({ id: d.id, name: d.name, role: "DSM", mobile: d.mobile, email: d.email || "", cnic: d.cnic, status: d.status, joinDate: d.joiningDate, salary: d.salary, fatherName: d.fatherName }));
    return s;
  }, [dso, dsms]);

  const filteredStaff = useMemo(() => {
    return allStaff.filter((s) => {
      if (roleFilter !== "All" && s.role !== roleFilter) return false;
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase()) && !s.mobile.includes(search)) return false;
      return true;
    });
  }, [allStaff, roleFilter, statusFilter, search]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      if (dateFrom && a.date < dateFrom) return false;
      if (dateTo && a.date > dateTo) return false;
      if (roleFilter !== "All" && a.role !== roleFilter) return false;
      if (search && !a.employeeName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [attendance, dateFrom, dateTo, roleFilter, search]);

  const filteredPayroll = useMemo(() => {
    return payroll.filter((p) => {
      if (dateFrom && p.month && p.month < dateFrom.slice(0, 7)) return false;
      if (dateTo && p.month && p.month > dateTo.slice(0, 7)) return false;
      if (roleFilter !== "All" && p.role !== roleFilter) return false;
      if (search && !p.employeeName?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [payroll, dateFrom, dateTo, roleFilter, search]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (search && !e.description?.toLowerCase().includes(search.toLowerCase()) && !e.category?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo, search]);

  const filteredSIMs = useMemo(() => {
    return sims.filter((s) => {
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      if (search && !s.simNumber.includes(search) && !s.network.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [sims, statusFilter, search]);

  const handlePrint = (title: string, contentHtml: string) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const now = new Date();
    const franchiseName = settings.franchiseName || auth.franchiseName || "THE SMART ERP";
    const ownerLine = settings.ownerName ? `Owner: ${settings.ownerName}` : "";
    const contactParts = [settings.phone, settings.email].filter(Boolean).join(" &bull; ");
    const addressParts = settings.address || "";
    win.document.write(`<!DOCTYPE html>
<html><head><title>${title}</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 0; margin: 0; background: #f8fafc; }
  .header { background: linear-gradient(135deg, #0A2647 0%, #144272 100%); color: #fff; padding: 16px 22px; margin-bottom: 14px; }
  .header h1 { font-size: 18px; margin: 0; font-weight: 800; }
  .header .owner { font-size: 11px; color: #cbd5e1; margin-top: 2px; }
  .header .meta { font-size: 10px; color: #94a3b8; margin-top: 4px; }
  .summary-bar { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .summary-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 14px; text-align: center; flex: 1; min-width: 80px; }
  .summary-item .val { font-size: 13px; font-weight: 700; color: #0A2647; }
  .summary-item .lbl { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; background: #fff; border-radius: 6px; overflow: hidden; }
  th { background: #0A2647; color: #fff; padding: 6px 8px; text-align: center; font-size: 8px; font-weight: 700; border: 1px solid #1a3a5c; text-transform: uppercase; }
  td { padding: 5px 8px; border: 1px solid #e2e8f0; text-align: center; font-size: 9px; }
  .right { text-align: right; }
  .left { text-align: left; }
  .totals-row td { font-weight: 700; background: #f1f5f9; border-top: 2px solid #0A2647; }
  .footer { margin-top: 12px; font-size: 8px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
  .no-print { text-align: right; margin-bottom: 8px; }
  .no-print button { padding: 7px 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px; margin-left: 8px; }
  .no-print .btn-print { background: #0A2647; color: #fff; }
  .no-print .btn-close { background: #e2e8f0; color: #475569; }
  @media print { .no-print { display: none; } body { background: #fff; } }
</style></head>
<body>
  <div class="no-print"><button class="btn-print" onclick="window.print()">Print</button><button class="btn-close" onclick="window.close()">Close</button></div>
  <div class="header">
    <h1>${franchiseName}</h1>
    ${ownerLine ? `<div class="owner">${ownerLine}</div>` : ""}
    <div class="meta">${title} | Generated: ${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString()}</div>
  </div>
  ${contentHtml}
  <div class="footer">${franchiseName}${contactParts ? ` &bull; ${contactParts}` : ""}${addressParts ? ` &bull; ${addressParts}` : ""} &bull; ${title}</div>
</body></html>`);
    win.document.close();
  };

  const handleCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = keys.join(",") + "\n" + data.map((r) => keys.map((k) => {
      const v = r[k];
      if (v === null || v === undefined) return "";
      if (typeof v === "object") return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
      return String(v).includes(",") ? `"${v}"` : v;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const [exportOpen, setExportOpen] = useState(false);

  const getExportData = () => {
    const franchiseName = settings.franchiseName || auth.franchiseName || "THE SMART ERP";
    const ownerName = settings.ownerName || "";
    const phone = settings.phone || "";
    const email = settings.email || "";
    const address = settings.address || "";

    const header = (label: string) =>
      `<div style="text-align:center;margin-bottom:14px;font-family:Arial,sans-serif">
        <h1 style="font-size:18px;font-weight:700;color:#222;margin:0 0 2px">${franchiseName}</h1>
        ${ownerName ? `<p style="font-size:12px;color:#555;margin:0 0 2px">Owner: ${ownerName}</p>` : ""}
        <h2 style="font-size:14px;font-weight:600;color:#555;margin:4px 0 2px">${label}</h2>
        <p style="font-size:11px;color:#888;margin:0">Generated: ${new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</p>
      </div>`;
    const footer = () =>
      `<div style="text-align:center;margin-top:14px;font-size:10px;color:#999;font-family:Arial,sans-serif;border-top:1px solid #ddd;padding-top:8px">
        ${franchiseName}${phone || email ? ` &bull; ${[phone, email].filter(Boolean).join(" Â· ")}` : ""}${address ? ` &bull; ${address}` : ""} &bull; ${new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
      </div>`;
    const wrapTable = (headers: string[], rows: (string | number)[][], label: string) => {
      const hr = headers.map((h) => `<th style="border:1px solid #999;padding:8px 10px;background:#333;color:#fff;font-size:11px;font-weight:700;font-family:Arial,sans-serif;text-align:left">${h}</th>`).join("");
      const rr = rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #ccc;padding:6px 10px;color:#333;font-size:11px;font-family:Arial,sans-serif">${String(c)}</td>`).join("")}</tr>`).join("");
      return `${header(label)}<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif"><thead>${hr}</thead><tbody>${rr}</tbody></table>${footer()}`;
    };

    if (activeTab === "hr") {
      if (selectedReport === "attendance") {
        const headers = ["Employee", "Role", "Date", "Check In", "Check Out", "Status"];
        const rows = filteredAttendance.map((a) => [a.employeeName, a.role, formatDateDDMMYYYY(a.date), a.checkIn || "â€”", a.checkOut || "â€”", a.status]);
        return { headers, rows, title: "Attendance Report", wrapTable };
      }
      if (selectedReport === "payroll") {
        const headers = ["Employee", "Role", "Month", "Basic", "Allowances", "Commission", "Deductions", "Net Pay", "Status"];
        const rows = filteredPayroll.map((p) => [p.employeeName || "â€”", p.role || "â€”", p.month || "â€”", p.basicSalary || 0, p.totalAllowances || 0, p.totalCommission || 0, p.totalDeductions || 0, p.netPay || 0, p.paid ? "Paid" : "Unpaid"]);
        return { headers, rows, title: "Payroll Report", wrapTable };
      }
      const headers = ["Employee", "ID", "Role", "Mobile", "CNIC", "Joining Date", "Salary", "Status"];
      const rows = filteredStaff.map((s) => [s.name, s.id, s.role, s.mobile, s.cnic, formatDateDDMMYYYY(s.joinDate), s.salary, s.status]);
      return { headers, rows, title: "Staff Directory Report", wrapTable };
    }
    if (activeTab === "inventory") {
      if (selectedReport === "devices") {
        const headers = ["BVS #", "Brand/Model", "IMEI", "Retailer ID", "Status", "Assigned To"];
        const rows = devices.map((d) => [d.bvsNumber, `${d.brand} ${d.model}`.trim(), d.imei, d.retailerId, d.status, d.assignedDSO || "â€”"]);
        return { headers, rows, title: "Devices Report", wrapTable };
      }
      if (selectedReport === "equipment") {
        const headers = ["Item Name", "Price", "Condition", "Status", "Assigned To"];
        const rows = equipment.map((e) => [e.name, e.price || 0, e.condition, e.status, e.assignedTo || "â€”"]);
        return { headers, rows, title: "Equipment Report", wrapTable };
      }
      const headers = ["SIM Number", "Network", "ICCID", "Type", "Status", "Receive Date", "Issued To"];
      const rows = filteredSIMs.map((s) => [s.simNumber, s.network, s.iccid, s.type, s.status, s.receiveDate ? formatDateDDMMYYYY(s.receiveDate) : "", s.issuedToName || "â€”"]);
      return { headers, rows, title: "SIM Inventory Report", wrapTable };
    }
    if (activeTab === "finance") {
      if (selectedReport === "expenses") {
        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const rows = filteredExpenses.map((e) => [formatDateDDMMYYYY(e.date), e.description || e.note || "â€”", e.category || "Other", e.type || "â€”", e.amount]);
        return { headers, rows, title: "Expenses Report", wrapTable };
      }
      if (selectedReport === "cashflow") {
        return { headers: ["Date", "Category", "Amount", "Type"], rows: accounts.filter((a) => a.date >= dateFrom && a.date <= dateTo).map((a) => [formatDateDDMMYYYY(a.date), a.category, a.amount, a.type]), title: "Cash Flow Report", wrapTable };
      }
      if (selectedReport === "accounts") {
        const headers = ["Date", "Description", "Category", "Debit", "Credit"];
        const rows = accounts.filter((a) => a.date >= dateFrom && a.date <= dateTo).map((a) => [formatDateDDMMYYYY(a.date), a.description, a.category, a.type === "expense" ? a.amount : "â€”", a.type === "income" ? a.amount : "â€”"]);
        return { headers, rows, title: "Account Ledger Report", wrapTable };
      }
      if (selectedReport === "payroll") {
        const headers = ["Employee", "Role", "Month", "Basic", "Allowances", "Commission", "Deductions", "Net Pay", "Status"];
        const rows = filteredPayroll.map((p) => [p.employeeName || "â€”", p.role || "â€”", p.month || "â€”", p.basicSalary || 0, p.totalAllowances || 0, p.totalCommission || 0, p.totalDeductions || 0, p.netPay || 0, p.paid ? "Paid" : "Unpaid"]);
        return { headers, rows, title: "Payroll Report", wrapTable };
      }
      const headers = ["Date", "Note", "Amount", "Type"];
      const rows = wallet.filter((w) => w.date >= dateFrom && w.date <= dateTo).map((w) => [formatDateDDMMYYYY(w.date), w.note || w.remarks || "â€”", w.amount, w.type]);
      return { headers, rows, title: "Wallet Transactions", wrapTable };
    }
    if (activeTab === "sales") {
      if (selectedReport === "targets") {
        const headers = ["Employee", "Role", "Period", "Daily Target", "Monthly", "Achieved", "%"];
        const rows = targets.map((t) => [t.employeeName, t.role, t.period, t.dailyTarget, t.monthlyTarget, t.achieved, t.monthlyTarget > 0 ? Math.round((t.achieved / t.monthlyTarget) * 100) + "%" : "0%"]);
        return { headers, rows, title: "Targets Report", wrapTable };
      }
      const headers = ["DSO Name", "ID", "Status", "SIM Commission", "Total Salary"];
      const rows = dso.map((d) => [d.name, d.id, d.status, d.commission || 0, d.salary || 0]);
      return { headers, rows, title: "Sales Report", wrapTable };
    }
    const headers = ["Franchise Name", "DSOs", "DSMs", "Staff", "SIMs", "Devices", "Wallet (PKR)"];
    const rows = [[franchiseName, String(dso.length), String(dsms.length), String(allStaff.length), String(sims.length), String(devices.length), String(wallet.reduce((s, w) => s + w.amount, 0))]];
    return { headers, rows, title: "Overview Report", wrapTable };
  };

  const exportCSV = () => {
    const data = getExportData();
    if (!data) return;
    const csv = data.headers.join(",") + "\n" + data.rows.map((r) => r.map((c) => String(c).includes(",") ? `"${c}"` : c).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${activeTab}-report-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLS = () => {
    const data = getExportData();
    if (!data) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${data.title}</title></head><body>${data.wrapTable(data.headers, data.rows, data.title)}</body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${activeTab}-report-${new Date().toISOString().split("T")[0]}.xls`; link.click(); URL.revokeObjectURL(link.href);
  };

  const exportPDF = () => {
    const data = getExportData();
    if (!data) return;
    const win = window.open("", "_blank");
    if (!win) { window.print(); return; }
    const franchiseName = settings.franchiseName || auth.franchiseName || "THE SMART ERP";
    const ownerLine = settings.ownerName ? `<p style="font-size:12px;color:#555;margin:2px 0">Owner: ${settings.ownerName}</p>` : "";
    const contactParts = [settings.phone, settings.email].filter(Boolean).join(" &bull; ");
    const addressParts = settings.address || "";
    const date = new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const hr = data.headers.map((h) => `<th style="border:1px solid #999;padding:8px 10px;background:#333;color:#fff;font-size:11px;font-weight:700;text-align:left">${h}</th>`).join("");
    const rr = data.rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #ccc;padding:6px 10px;color:#333;font-size:11px">${String(c)}</td>`).join("")}</tr>`).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>${data.title}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family:Arial,sans-serif; margin:0; padding:20px; color:#333; }
        .print-header { text-align:center; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:12px; }
        .print-header h1 { font-size:20px; font-weight:700; color:#000; margin:0 0 4px; }
        .print-header p { font-size:11px; color:#888; margin:0; }
        table { border-collapse:collapse; width:100%; margin-top:12px; }
        th, td { border:1px solid #ccc; padding:7px 10px; font-size:11px; text-align:left; }
        th { background:#333; color:#fff; font-weight:700; }
        td { color:#333; }
        tr:nth-child(even) td { background:#f5f5f5; }
        .print-footer { text-align:center; margin-top:20px; font-size:10px; color:#999; border-top:1px solid #ddd; padding-top:8px; }
      </style></head><body>
      <div class="print-header">
        <h1>${franchiseName}</h1>
        ${ownerLine}
        <p>${data.title} â€” Generated: ${date}</p>
      </div>
      <table><thead><tr>${hr}</tr></thead><tbody>${rr}</tbody></table>
      <div class="print-footer">${franchiseName}${contactParts ? ` &bull; ${contactParts}` : ""}${addressParts ? ` &bull; ${addressParts}` : ""} &bull; ${date.split(",")[0]}</div>
      <script>window.onload=function(){window.print();window.close();}<\/script>
    </body></html>`);
    win.document.close();
  };

  const tabs: { id: TabId; label: string; icon: any; count?: number }[] = [
    { id: "overview", label: "Overview", icon: PieChart },
    { id: "hr", label: "HR", icon: Users, count: allStaff.length },
    { id: "sales", label: "Sales", icon: TrendingUp },
    { id: "inventory", label: "Inventory", icon: Briefcase },
    { id: "finance", label: "Finance", icon: DollarSign },
  ];

  const netCashFlow = useMemo(() => {
    const totalIncome = accounts.filter((a) => a.type === "income" && a.date >= dateFrom && a.date <= dateTo).reduce((s, a) => s + a.amount, 0);
    const totalExpense = accounts.filter((a) => a.type === "expense" && a.date >= dateFrom && a.date <= dateTo).reduce((s, a) => s + a.amount, 0);
    const walletIncome = wallet.filter((w) => w.date >= dateFrom && w.date <= dateTo && w.type === "Deposit").reduce((s, w) => s + w.amount, 0);
    const walletExpense = wallet.filter((w) => w.date >= dateFrom && w.date <= dateTo && w.type === "Withdrawal").reduce((s, w) => s + w.amount, 0);
    return { totalIncome, totalExpense, net: totalIncome - totalExpense, walletIncome, walletExpense, walletNet: walletIncome - walletExpense };
  }, [accounts, wallet, dateFrom, dateTo]);

  const staffStatusCounts = useMemo(() => {
    const active = allStaff.filter((s) => s.status === "Active").length;
    const inactive = allStaff.filter((s) => s.status !== "Active").length;
    return { active, inactive, total: allStaff.length };
  }, [allStaff]);

  const simStatusCounts = useMemo(() => {
    const inStock = sims.filter((s) => s.status === "In Stock" || s.status === "Available").length;
    const issued = sims.filter((s) => s.status === "Issued").length;
    const activated = sims.filter((s) => s.status === "Activated" || s.status === "Active").length;
    return { inStock, issued, activated, total: sims.length };
  }, [sims]);

  const attendanceStats = useMemo(() => {
    const present = filteredAttendance.filter((a) => a.status === "Present").length;
    const absent = filteredAttendance.filter((a) => a.status === "Absent").length;
    const late = filteredAttendance.filter((a) => a.status === "Late").length;
    const leave = filteredAttendance.filter((a) => a.status === "Leave").length;
    return { present, absent, late, leave, total: filteredAttendance.length };
  }, [filteredAttendance]);

  const payrollStats = useMemo(() => {
    const totalNet = filteredPayroll.reduce((s, p) => s + (p.netPay || 0), 0);
    const paid = filteredPayroll.filter((p) => p.paid).length;
    const unpaid = filteredPayroll.filter((p) => !p.paid).length;
    const totalPaid = filteredPayroll.filter((p) => p.paid).reduce((s, p) => s + (p.netPay || 0), 0);
    return { totalNet, paid, unpaid, totalPaid };
  }, [filteredPayroll]);

  const expenseStats = useMemo(() => {
    const total = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const byCategory: Record<string, number> = {};
    filteredExpenses.forEach((e) => { const c = e.category || "Other"; byCategory[c] = (byCategory[c] || 0) + e.amount; });
    return { total, byCategory };
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Comprehensive reports, analytics & exports</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <Calendar size={14} className="text-gray-400" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-0 p-0 w-28 focus:outline-none text-gray-700" />
            <span className="text-gray-300">â€”</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-0 p-0 w-28 focus:outline-none text-gray-700" />
          </div>
          <div className="relative no-print">
            <button onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white rounded-xl text-sm font-medium hover:bg-[#0A2647]/90 transition-all">
              <Download size={14} /> Export
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
                  <button onClick={() => { exportCSV(); setExportOpen(false); }} className="w-full px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"><FileText size={14} className="text-green-600" /> CSV</button>
                  <button onClick={() => { exportXLS(); setExportOpen(false); }} className="w-full px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"><Download size={14} className="text-green-600" /> XLS (Excel)</button>
                  <button onClick={() => { exportPDF(); setExportOpen(false); }} className="w-full px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"><Printer size={14} className="text-red-600" /> PDF</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.id ? "bg-[#0A2647] text-white shadow-lg" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
            <t.icon size={16} />
            {t.label}
            {t.count !== undefined && <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === t.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Users size={20} className="text-blue-600" /></div>
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">HR</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{staffStatusCounts.active}</p>
              <p className="text-gray-500 text-xs">Active Staff <span className="text-gray-400">/ {staffStatusCounts.total} total</span></p>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${staffStatusCounts.total ? (staffStatusCounts.active / staffStatusCounts.total) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><TrendingUp size={20} className="text-green-600" /></div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Sales</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{dso.length + dsms.length}</p>
              <p className="text-gray-500 text-xs">Total Sales Staff <span className="text-gray-400">(DSO + DSM)</span></p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Smartphone size={20} className="text-purple-600" /></div>
                <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">Inventory</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{simStatusCounts.total}</p>
              <p className="text-gray-500 text-xs">SIMs <span className="text-gray-400">/ {devices.length} Devices</span></p>
              <div className="flex gap-1 mt-3">
                <div className="h-2 flex-1 bg-green-200 rounded-l-full" style={{ flex: simStatusCounts.inStock }} />
                <div className="h-2 flex-1 bg-yellow-200" style={{ flex: simStatusCounts.issued }} />
                <div className="h-2 flex-1 bg-blue-400 rounded-r-full" style={{ flex: simStatusCounts.activated }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>{simStatusCounts.inStock} Stock</span>
                <span>{simStatusCounts.issued} Issued</span>
                <span>{simStatusCounts.activated} Active</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><DollarSign size={20} className="text-amber-600" /></div>
                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">Finance</span>
              </div>
              <p className="text-2xl font-black text-gray-900">PKR {netCashFlow.net.toLocaleString()}</p>
              <p className="text-gray-500 text-xs">Net Cash Flow <span className={netCashFlow.net >= 0 ? "text-green-600" : "text-red-600"}>({dateFrom} to {dateTo})</span></p>
              <div className="flex gap-3 mt-3 text-xs">
                <span className="flex items-center gap-1 text-green-600"><TrendingUp size={12} /> PKR {netCashFlow.totalIncome.toLocaleString()}</span>
                <span className="flex items-center gap-1 text-red-600"><TrendingDown size={12} /> PKR {netCashFlow.totalExpense.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Staff Overview */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Users size={16} className="text-[#0A2647]" /> Staff Overview</h3>
                <button onClick={() => { setActiveTab("hr"); setSelectedReport("staff"); }} className="text-xs text-[#0A2647] font-medium hover:underline">View Details â†’</button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-blue-600">{dso.length}</p>
                    <p className="text-gray-500 text-xs mt-1">DSOs</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-indigo-600">{dsms.length}</p>
                    <p className="text-gray-500 text-xs mt-1">DSMs</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {allStaff.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${s.role === "DSO" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"} flex items-center justify-center text-xs font-bold`}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.id} Â· {s.role}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Attendance */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Clock size={16} className="text-[#0A2647]" /> Today&apos;s Attendance</h3>
                <button onClick={() => { setActiveTab("hr"); setSelectedReport("attendance"); }} className="text-xs text-[#0A2647] font-medium hover:underline">View All â†’</button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-green-600">{attendance.filter((a) => a.status === "Present" && a.date === new Date().toISOString().slice(0, 10)).length}</p>
                    <p className="text-gray-500 text-[10px]">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-red-600">{attendance.filter((a) => a.status === "Absent" && a.date === new Date().toISOString().slice(0, 10)).length}</p>
                    <p className="text-gray-500 text-[10px]">Absent</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-yellow-600">{attendance.filter((a) => a.status === "Late" && a.date === new Date().toISOString().slice(0, 10)).length}</p>
                    <p className="text-gray-500 text-[10px]">Late</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-blue-600">{attendance.filter((a) => a.status === "Leave" && a.date === new Date().toISOString().slice(0, 10)).length}</p>
                    <p className="text-gray-500 text-[10px]">Leave</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {attendance.filter((a) => a.date === new Date().toISOString().slice(0, 10)).slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-700">{a.employeeName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{a.checkIn || "â€”"} - {a.checkOut || "â€”"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "Present" ? "bg-green-50 text-green-700" : a.status === "Late" ? "bg-yellow-50 text-yellow-700" : a.status === "Leave" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {attendance.filter((a) => a.date === new Date().toISOString().slice(0, 10)).length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No attendance records for today</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><BarChart3 size={16} className="text-[#0A2647]" /> Quick Reports Access</h3>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Staff Directory", tab: "hr" as TabId, id: "staff", icon: Users, bg: "bg-blue-50", tx: "text-blue-600", count: allStaff.length },
                { label: "Attendance Report", tab: "hr" as TabId, id: "attendance", icon: Clock, bg: "bg-cyan-50", tx: "text-cyan-600", count: attendance.length },
                { label: "Payroll Summary", tab: "hr" as TabId, id: "payroll", icon: DollarSign, bg: "bg-green-50", tx: "text-green-600", count: payroll.length },
                { label: "SIM Stock Report", tab: "inventory" as TabId, id: "sims", icon: Smartphone, bg: "bg-purple-50", tx: "text-purple-600", count: sims.length },
                { label: "Expense Report", tab: "finance" as TabId, id: "expenses", icon: FileText, bg: "bg-red-50", tx: "text-red-600", count: expenses.length },
                { label: "Activation Report", tab: "sales" as TabId, id: "activations", icon: Activity, bg: "bg-orange-50", tx: "text-orange-600", count: 0 },
                { label: "Equipment Status", tab: "inventory" as TabId, id: "equipment", icon: Briefcase, bg: "bg-indigo-50", tx: "text-indigo-600", count: equipment.length },
                { label: "Cash Flow", tab: "finance" as TabId, id: "cashflow", icon: Wallet, bg: "bg-amber-50", tx: "text-amber-600", count: 0 },
              ].map((r) => (
                <button key={r.label} onClick={() => { setActiveTab(r.tab); setSelectedReport(r.id); }}
                  className="p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all text-left">
                  <div className={`w-9 h-9 rounded-lg ${r.bg} flex items-center justify-center mb-2`}>
                    <r.icon size={18} className={r.tx} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.count} records</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== HR TAB ===== */}
      {activeTab === "hr" && (
        <div className="space-y-6">
          {/* HR Sub-tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "staff", label: "Staff Directory", icon: Users },
              { id: "attendance", label: "Attendance", icon: Clock },
              { id: "payroll", label: "Payroll", icon: DollarSign },
            ].map((st) => (
              <button key={st.id} onClick={() => setSelectedReport(st.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedReport === st.id ? "bg-[#0A2647] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                <st.icon size={15} /> {st.label}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
              <Search size={15} className="text-gray-400" />
              <input placeholder="Search name, ID, mobile..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-0 p-0 text-sm focus:outline-none w-full text-gray-700 placeholder:text-gray-400" />
              {search && <X size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearch("")} />}
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none">
              <option value="All">All Roles</option>
              <option value="DSO">DSO</option>
              <option value="DSM">DSM</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button onClick={() => handleCSV(selectedReport === "payroll" ? filteredPayroll : selectedReport === "attendance" ? filteredAttendance : filteredStaff, `${selectedReport}-report`)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white rounded-xl text-sm font-medium hover:bg-[#0A2647]/90 transition-all">
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Staff Directory */}
          {selectedReport === "staff" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-gray-900 font-bold text-sm">Staff Directory</h3>
                <span className="text-xs text-gray-400">{filteredStaff.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="text-left px-4 py-3 font-medium">Employee</th>
                      <th className="text-left px-4 py-3 font-medium">ID</th>
                      <th className="text-left px-4 py-3 font-medium">Role</th>
                      <th className="text-left px-4 py-3 font-medium">Mobile</th>
                      <th className="text-left px-4 py-3 font-medium">CNIC</th>
                      <th className="text-left px-4 py-3 font-medium">Joining Date</th>
                      <th className="text-left px-4 py-3 font-medium">Salary</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStaff.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${s.role === "DSO" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"} flex items-center justify-center text-xs font-bold`}>
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{s.name}</p>
                              <p className="text-xs text-gray-400">{s.fatherName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{s.id}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.role === "DSO" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>{s.role}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{s.mobile}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{s.cnic}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDateDDMMYYYY(s.joinDate)}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">PKR {s.salary.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                    {filteredStaff.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No staff records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">Showing {filteredStaff.length} of {allStaff.length} employees</span>
                <button onClick={() => {
                  const rows = filteredStaff.map((s) => `<tr>
                    <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;">${s.name}</td>
                    <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${s.id}</td>
                    <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${s.role}</td>
                    <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;">${s.mobile}</td>
                    <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;">${s.cnic}</td>
                    <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;">${formatDateDDMMYYYY(s.joinDate)}</td>
                    <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;">PKR ${s.salary.toLocaleString()}</td>
                    <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${s.status}</td>
                  </tr>`).join("");
                  const totalSalary = filteredStaff.reduce((t, s) => t + s.salary, 0);
                  handlePrint("Staff Directory Report", `
                    <div class="summary-bar">
                      <div class="summary-item"><div class="val">${filteredStaff.length}</div><div class="lbl">Employees</div></div>
                      <div class="summary-item"><div class="val">${filteredStaff.filter(s => s.status === "Active").length}</div><div class="lbl">Active</div></div>
                      <div class="summary-item"><div class="val">PKR ${totalSalary.toLocaleString()}</div><div class="lbl">Total Salary</div></div>
                    </div>
                    <table>
                      <thead><tr><th>Name</th><th>ID</th><th>Role</th><th>Mobile</th><th>CNIC</th><th>Joining</th><th>Salary</th><th>Status</th></tr></thead>
                      <tbody>${rows}</tbody>
                    </table>`);
                }} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all">
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>
          )}

          {/* Attendance Report */}
          {selectedReport === "attendance" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-xl font-black text-gray-900">{attendanceStats.total}</p>
                  <p className="text-gray-500 text-xs">Total Records</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                  <p className="text-xl font-black text-green-600">{attendanceStats.present}</p>
                  <p className="text-green-600/70 text-xs">Present</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
                  <p className="text-xl font-black text-red-600">{attendanceStats.absent}</p>
                  <p className="text-red-600/70 text-xs">Absent</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-center">
                  <p className="text-xl font-black text-yellow-600">{attendanceStats.late}</p>
                  <p className="text-yellow-600/70 text-xs">Late</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-xl font-black text-blue-600">{attendanceStats.leave}</p>
                  <p className="text-blue-600/70 text-xs">Leave</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm">Attendance Records</h3>
                  <span className="text-xs text-gray-400">{filteredAttendance.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="text-left px-4 py-3 font-medium">Employee</th>
                        <th className="text-left px-4 py-3 font-medium">Role</th>
                        <th className="text-left px-4 py-3 font-medium">Date</th>
                        <th className="text-left px-4 py-3 font-medium">Check In</th>
                        <th className="text-left px-4 py-3 font-medium">Check Out</th>
                        <th className="text-center px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAttendance.slice(0, 100).map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{a.employeeName}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.role === "DSO" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>{a.role}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{formatDateDDMMYYYY(a.date)}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{a.checkIn || "â€”"}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{a.checkOut || "â€”"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              a.status === "Present" ? "bg-green-50 text-green-700" :
                              a.status === "Late" ? "bg-yellow-50 text-yellow-700" :
                              a.status === "Leave" ? "bg-blue-50 text-blue-700" :
                              "bg-red-50 text-red-700"
                            }`}>{a.status}</span>
                          </td>
                        </tr>
                      ))}
                      {filteredAttendance.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No attendance records found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Showing {Math.min(filteredAttendance.length, 100)} of {filteredAttendance.length} records</span>
                  <button onClick={() => {
                    const rows = filteredAttendance.map((a) => `<tr>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;">${a.employeeName}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${a.role}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${formatDateDDMMYYYY(a.date)}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;">${a.checkIn || "â€”"}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;">${a.checkOut || "â€”"}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${a.status}</td>
                    </tr>`).join("");
                    handlePrint("Attendance Report", `
                      <div class="summary-bar">
                        <div class="summary-item"><div class="val">${attendanceStats.total}</div><div class="lbl">Total</div></div>
                        <div class="summary-item"><div class="val">${attendanceStats.present}</div><div class="lbl">Present</div></div>
                        <div class="summary-item"><div class="val">${attendanceStats.absent}</div><div class="lbl">Absent</div></div>
                        <div class="summary-item"><div class="val">${attendanceStats.late}</div><div class="lbl">Late</div></div>
                        <div class="summary-item"><div class="val">${attendanceStats.leave}</div><div class="lbl">Leave</div></div>
                      </div>
                      <table>
                        <thead><tr><th>Employee</th><th>Role</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
                        <tbody>${rows}</tbody>
                      </table>`);
                  }} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100">
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Payroll Report */}
          {selectedReport === "payroll" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-xl font-black text-gray-900">{filteredPayroll.length}</p>
                  <p className="text-gray-500 text-xs">Payroll Records</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-xl font-black text-blue-600">PKR {payrollStats.totalNet.toLocaleString()}</p>
                  <p className="text-blue-600/70 text-xs">Total Net Pay</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                  <p className="text-xl font-black text-green-600">{payrollStats.paid}</p>
                  <p className="text-green-600/70 text-xs">Paid</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
                  <p className="text-xl font-black text-red-600">{payrollStats.unpaid}</p>
                  <p className="text-red-600/70 text-xs">Unpaid</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm">Payroll Records</h3>
                  <span className="text-xs text-gray-400">{filteredPayroll.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="text-left px-4 py-3 font-medium">Employee</th>
                        <th className="text-left px-4 py-3 font-medium">Role</th>
                        <th className="text-left px-4 py-3 font-medium">Month</th>
                        <th className="text-right px-4 py-3 font-medium">Basic</th>
                        <th className="text-right px-4 py-3 font-medium">Allowances</th>
                        <th className="text-right px-4 py-3 font-medium">Commission</th>
                        <th className="text-right px-4 py-3 font-medium">Deductions</th>
                        <th className="text-right px-4 py-3 font-medium">Net Pay</th>
                        <th className="text-center px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPayroll.map((p) => (
                        <>
                          <tr key={p.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}>
                            <td className="px-4 py-3 font-medium text-gray-900">{p.employeeName || "â€”"}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.role === "DSO" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>{p.role}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{p.month}</td>
                            <td className="px-4 py-3 text-right text-gray-900 font-medium">PKR {(p.basicSalary || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-gray-600">PKR {(p.totalAllowances || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-green-600 font-medium">PKR {(p.totalCommission || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-red-600">PKR {(p.totalDeductions || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-gray-900 font-bold">PKR {(p.netPay || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.paid ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                {p.paid ? "Paid" : "Unpaid"}
                              </span>
                            </td>
                          </tr>
                          {expandedRow === p.id && (
                            <tr key={`${p.id}-expanded`}>
                              <td colSpan={9} className="px-6 py-4 bg-gray-50/50">
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                                  <div><p className="text-gray-400 mb-1">Fuel Allowance</p><p className="font-medium">PKR {(p.fuelAllowance || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Mobile Allowance</p><p className="font-medium">PKR {(p.mobileAllowance || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Daily Allowance</p><p className="font-medium">PKR {(p.dailyAllowance || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Residence Allowance</p><p className="font-medium">PKR {(p.residenceAllowance || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Target Bonus</p><p className="font-medium">PKR {(p.targetBonus || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Perf. Bonus</p><p className="font-medium">PKR {(p.performanceBonus || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Advance Salary</p><p className="font-medium text-red-600">-PKR {(p.advanceSalary || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Loan Deduction</p><p className="font-medium text-red-600">-PKR {(p.loanDeduction || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Other Deduction</p><p className="font-medium text-red-600">-PKR {(p.otherDeduction || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">New SIM</p><p className="font-medium">{p.newSimCount || 0} Ã— PKR {(p.newSimRate || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">MNP</p><p className="font-medium">{p.mnpCount || 0} Ã— PKR {(p.mnpRate || 0).toLocaleString()}</p></div>
                                  <div><p className="text-gray-400 mb-1">Replacement</p><p className="font-medium">{p.replacementCount || 0} Ã— PKR {(p.replacementRate || 0).toLocaleString()}</p></div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                      {filteredPayroll.length === 0 && (
                        <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No payroll records found</td></tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold text-sm">
                        <td colSpan={3} className="px-4 py-3 text-gray-700">Totals ({filteredPayroll.length})</td>
                        <td className="px-4 py-3 text-right text-gray-900">PKR {filteredPayroll.reduce((s, p) => s + (p.basicSalary || 0), 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-900">PKR {filteredPayroll.reduce((s, p) => s + (p.totalAllowances || 0), 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-700">PKR {filteredPayroll.reduce((s, p) => s + (p.totalCommission || 0), 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-700">PKR {filteredPayroll.reduce((s, p) => s + (p.totalDeductions || 0), 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-900 font-bold">PKR {payrollStats.totalNet.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Total Paid: PKR {payrollStats.totalPaid.toLocaleString()}</span>
                  <button onClick={() => {
                    const rows = filteredPayroll.map((p) => `<tr>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;">${p.employeeName || "â€”"}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${p.role || "â€”"}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${p.month || "â€”"}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;">PKR ${(p.basicSalary || 0).toLocaleString()}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;">PKR ${(p.totalAllowances || 0).toLocaleString()}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;">PKR ${(p.totalCommission || 0).toLocaleString()}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:right;">PKR ${(p.totalDeductions || 0).toLocaleString()}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:10px;text-align:right;font-weight:bold;">PKR ${(p.netPay || 0).toLocaleString()}</td>
                      <td style="padding:5px 8px;border:1px solid #d0d5dd;font-size:9px;text-align:center;">${p.paid ? "Paid" : "Unpaid"}</td>
                    </tr>`).join("");
                    handlePrint("Payroll Report", `
                      <div class="summary-bar">
                        <div class="summary-item"><div class="val">${filteredPayroll.length}</div><div class="lbl">Records</div></div>
                        <div class="summary-item"><div class="val">PKR ${payrollStats.totalNet.toLocaleString()}</div><div class="lbl">Total Net Pay</div></div>
                        <div class="summary-item"><div class="val">${payrollStats.paid}</div><div class="lbl">Paid</div></div>
                        <div class="summary-item"><div class="val">${payrollStats.unpaid}</div><div class="lbl">Unpaid</div></div>
                      </div>
                      <table>
                        <thead><tr><th>Employee</th><th>Role</th><th>Month</th><th>Basic</th><th>Allow.</th><th>Comm.</th><th>Ded.</th><th>Net Pay</th><th>Status</th></tr></thead>
                        <tbody>${rows}</tbody>
                        <tfoot>
                          <tr class="totals-row">
                            <td colspan="3">TOTAL</td>
                            <td class="right">PKR ${filteredPayroll.reduce((s, p) => s + (p.basicSalary || 0), 0).toLocaleString()}</td>
                            <td class="right">PKR ${filteredPayroll.reduce((s, p) => s + (p.totalAllowances || 0), 0).toLocaleString()}</td>
                            <td class="right">PKR ${filteredPayroll.reduce((s, p) => s + (p.totalCommission || 0), 0).toLocaleString()}</td>
                            <td class="right">PKR ${filteredPayroll.reduce((s, p) => s + (p.totalDeductions || 0), 0).toLocaleString()}</td>
                            <td class="right">PKR ${payrollStats.totalNet.toLocaleString()}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>`);
                  }} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100">
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== SALES TAB ===== */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "activations", label: "Activations", icon: Activity },
              { id: "performance", label: "DSO Performance", icon: TrendingUp },
              { id: "targets", label: "Targets", icon: Target },
            ].map((st) => (
              <button key={st.id} onClick={() => setSelectedReport(st.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedReport === st.id ? "bg-[#0A2647] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                <st.icon size={15} /> {st.label}
              </button>
            ))}
          </div>

          {selectedReport === "activations" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm">Activation Summary</h3>
                <p className="text-gray-400 text-xs mt-1">Activations from DSO portal (across all months)</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                    <p className="text-2xl font-black text-blue-600">{dso.length}</p>
                    <p className="text-blue-600/70 text-xs mt-1">Total DSOs</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                    <p className="text-2xl font-black text-green-600">{devices.length}</p>
                    <p className="text-green-600/70 text-xs mt-1">BVN Devices</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                    <p className="text-2xl font-black text-purple-600">{sims.filter((s) => s.status === "Activated" || s.status === "Active").length}</p>
                    <p className="text-purple-600/70 text-xs mt-1">Activated SIMs</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                    <p className="text-2xl font-black text-amber-600">{targets.length}</p>
                    <p className="text-amber-600/70 text-xs mt-1">Active Targets</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="text-left px-4 py-3 font-medium">DSO Name</th>
                        <th className="text-left px-4 py-3 font-medium">ID</th>
                        <th className="text-center px-4 py-3 font-medium">Status</th>
                        <th className="text-right px-4 py-3 font-medium">SIM Commission</th>
                        <th className="text-right px-4 py-3 font-medium">Total Salary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dso.filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase())).map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs font-mono">{d.id}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{d.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">PKR {(d.commission || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-gray-900 font-medium">PKR {(d.salary || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedReport === "performance" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm">DSO Performance Ranking</h3>
                <p className="text-gray-400 text-xs mt-1">Ranked by salary & commission data</p>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  {dso.sort((a, b) => (b.salary + b.commission) - (a.salary + a.commission)).map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-all border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"}`}>
                          #{i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.id} Â· {d.assignedDSM ? `Reports to ${d.assignedDSM}` : "Unassigned"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">PKR {(d.salary + d.commission).toLocaleString()}</p>
                          <p className="text-xs text-gray-400">Total Compensation</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{d.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedReport === "targets" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm">Targets Overview</h3>
                <p className="text-gray-400 text-xs mt-1">{targets.length} target records</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="text-left px-4 py-3 font-medium">Employee</th>
                      <th className="text-left px-4 py-3 font-medium">Role</th>
                      <th className="text-left px-4 py-3 font-medium">Period</th>
                      <th className="text-right px-4 py-3 font-medium">Daily Target</th>
                      <th className="text-right px-4 py-3 font-medium">Monthly</th>
                      <th className="text-right px-4 py-3 font-medium">Achieved</th>
                      <th className="text-center px-4 py-3 font-medium">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {targets.map((t) => {
                      const pct = t.monthlyTarget > 0 ? Math.round((t.achieved / t.monthlyTarget) * 100) : 0;
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{t.employeeName}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.role === "DSO" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>{t.role}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{t.period}</td>
                          <td className="px-4 py-3 text-right text-gray-900 font-medium">{t.dailyTarget}</td>
                          <td className="px-4 py-3 text-right text-gray-900 font-medium">{t.monthlyTarget}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">{t.achieved}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct >= 100 ? "bg-green-500" : pct >= 75 ? "bg-blue-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                              <span className="text-xs font-medium text-gray-500">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {targets.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No target records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== INVENTORY TAB ===== */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "sims", label: "SIM Stock", icon: Smartphone },
              { id: "devices", label: "Devices", icon: CreditCard },
              { id: "equipment", label: "Equipment", icon: Briefcase },
            ].map((st) => (
              <button key={st.id} onClick={() => setSelectedReport(st.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedReport === st.id ? "bg-[#0A2647] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                <st.icon size={15} /> {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
              <Search size={15} className="text-gray-400" />
              <input placeholder="Search SIM number, network..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-0 p-0 text-sm focus:outline-none w-full text-gray-700 placeholder:text-gray-400" />
              {search && <X size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearch("")} />}
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none">
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Issued">Issued</option>
              <option value="Activated">Activated</option>
            </select>
            <button onClick={() => handleCSV(selectedReport === "sims" ? filteredSIMs : selectedReport === "devices" ? devices : equipment, `${selectedReport}-report`)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A2647] text-white rounded-xl text-sm font-medium hover:bg-[#0A2647]/90">
              <Download size={14} /> CSV
            </button>
          </div>

          {selectedReport === "sims" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-xl font-black text-gray-900">{simStatusCounts.total}</p>
                  <p className="text-gray-500 text-xs">Total SIMs</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                  <p className="text-xl font-black text-green-600">{simStatusCounts.inStock}</p>
                  <p className="text-green-600/70 text-xs">In Stock</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-center">
                  <p className="text-xl font-black text-yellow-600">{simStatusCounts.issued}</p>
                  <p className="text-yellow-600/70 text-xs">Issued</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-xl font-black text-blue-600">{simStatusCounts.activated}</p>
                  <p className="text-blue-600/70 text-xs">Activated</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm">SIM Inventory Report</h3>
                  <span className="text-xs text-gray-400">{filteredSIMs.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="text-left px-4 py-3 font-medium">SIM Number</th>
                        <th className="text-left px-4 py-3 font-medium">Network</th>
                        <th className="text-left px-4 py-3 font-medium">ICCID</th>
                        <th className="text-left px-4 py-3 font-medium">Type</th>
                        <th className="text-center px-4 py-3 font-medium">Status</th>
                        <th className="text-left px-4 py-3 font-medium">Receive Date</th>
                        <th className="text-left px-4 py-3 font-medium">Issued To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredSIMs.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{s.simNumber}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              s.network === "Jazz" ? "bg-red-50 text-red-700" :
                              s.network === "Zong" ? "bg-green-50 text-green-700" :
                              s.network === "Ufone" ? "bg-green-100 text-green-800" :
                              s.network === "Telenor" ? "bg-blue-50 text-blue-700" :
                              "bg-gray-50 text-gray-600"
                            }`}>{s.network}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs font-mono">{s.iccid || "â€”"}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s.type || "â€”"}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              s.status === "In Stock" || s.status === "Available" ? "bg-green-50 text-green-700" :
                              s.status === "Issued" ? "bg-yellow-50 text-yellow-700" :
                              s.status === "Activated" || s.status === "Active" ? "bg-blue-50 text-blue-700" :
                              "bg-gray-50 text-gray-600"
                            }`}>{s.status}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{s.receiveDate ? formatDateDDMMYYYY(s.receiveDate) : "â€”"}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{s.issuedToName || "â€”"}</td>
                        </tr>
                      ))}
                      {filteredSIMs.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No SIM records found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {selectedReport === "devices" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm">Device Inventory</h3>
                <p className="text-gray-400 text-xs mt-1">{devices.length} total devices</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 border-b border-gray-100">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-gray-900">{devices.filter((d) => d.status === "In Stock").length}</p>
                  <p className="text-gray-500 text-xs">In Stock</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-yellow-600">{devices.filter((d) => d.status === "Issued").length}</p>
                  <p className="text-yellow-600/70 text-xs">Issued</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-blue-600">{devices.filter((d) => d.status === "Active" || d.status === "Activated").length}</p>
                  <p className="text-blue-600/70 text-xs">Active</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-red-600">{devices.filter((d) => d.status === "Damaged" || d.status === "Lost").length}</p>
                  <p className="text-red-600/70 text-xs">Damaged/Lost</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="text-left px-4 py-3 font-medium">BVS #</th>
                      <th className="text-left px-4 py-3 font-medium">Brand/Model</th>
                      <th className="text-left px-4 py-3 font-medium">IMEI</th>
                      <th className="text-left px-4 py-3 font-medium">Retailer ID</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {devices.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{d.bvsNumber}</td>
                        <td className="px-4 py-3 text-gray-700">{d.brand} {d.model}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{d.imei}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{d.retailerId || "â€”"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            d.status === "In Stock" ? "bg-green-50 text-green-700" :
                            d.status === "Issued" ? "bg-yellow-50 text-yellow-700" :
                            d.status === "Active" ? "bg-blue-50 text-blue-700" :
                            "bg-red-50 text-red-700"
                          }`}>{d.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{d.assignedDSO || "â€”"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReport === "equipment" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm">Equipment & Assets Report</h3>
                <p className="text-gray-400 text-xs mt-1">{equipment.length} items Â· {equipmentIssueRecords.length} issue records</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-5 border-b border-gray-100">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-gray-900">{equipment.length}</p>
                  <p className="text-gray-500 text-xs">Total Items</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-green-600">{equipment.filter((e) => e.status === "In Stock" || e.status === "Available").length}</p>
                  <p className="text-green-600/70 text-xs">Available</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-yellow-600">{equipmentIssueRecords.filter((r) => r.status !== "Returned").length}</p>
                  <p className="text-yellow-600/70 text-xs">Currently Issued</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="text-left px-4 py-3 font-medium">Item Name</th>
                      <th className="text-right px-4 py-3 font-medium">Price</th>
                      <th className="text-left px-4 py-3 font-medium">Condition</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {equipment.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                        <td className="px-4 py-3 text-right text-gray-900">PKR {(e.price || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${e.condition === "New" ? "bg-green-50 text-green-700" : e.condition === "Good" ? "bg-blue-50 text-blue-700" : "bg-yellow-50 text-yellow-700"}`}>{e.condition}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${e.status === "In Stock" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{e.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{e.assignedTo || "â€”"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== FINANCE TAB ===== */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "expenses", label: "Expenses", icon: FileText },
              { id: "cashflow", label: "Cash Flow", icon: Wallet },
              { id: "accounts", label: "Ledger", icon: ClipboardList },
              { id: "bank", label: "Bank Accounts", icon: CreditCard },
            ].map((st) => (
              <button key={st.id} onClick={() => setSelectedReport(st.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedReport === st.id ? "bg-[#0A2647] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                <st.icon size={15} /> {st.label}
              </button>
            ))}
          </div>

          {selectedReport === "expenses" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-xl font-black text-gray-900">{filteredExpenses.length}</p>
                  <p className="text-gray-500 text-xs">Total Records</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
                  <p className="text-xl font-black text-red-600">PKR {expenseStats.total.toLocaleString()}</p>
                  <p className="text-red-600/70 text-xs">Total Expense</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-xl font-black text-blue-600">{Object.keys(expenseStats.byCategory).length}</p>
                  <p className="text-blue-600/70 text-xs">Categories</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-center">
                  <p className="text-xl font-black text-amber-600">PKR {expenseStats.total > 0 ? Object.values(expenseStats.byCategory).reduce((max, v) => Math.max(max, v), 0).toLocaleString() : 0}</p>
                  <p className="text-amber-600/70 text-xs">Highest Category</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-gray-900 font-bold text-sm">Expense Records</h3>
                  <span className="text-xs text-gray-400">{filteredExpenses.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="text-left px-4 py-3 font-medium">Date</th>
                        <th className="text-left px-4 py-3 font-medium">Description</th>
                        <th className="text-left px-4 py-3 font-medium">Category</th>
                        <th className="text-left px-4 py-3 font-medium">Type</th>
                        <th className="text-right px-4 py-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredExpenses.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-500 text-xs">{formatDateDDMMYYYY(e.date)}</td>
                          <td className="px-4 py-3 text-gray-900 font-medium">{e.description || e.note || "â€”"}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{e.category || "Other"}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{e.type || "â€”"}</td>
                          <td className="px-4 py-3 text-right text-red-600 font-semibold">-PKR {e.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No expense records found</td></tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold text-sm">
                        <td colSpan={4} className="px-4 py-3 text-gray-700">Total Expenses</td>
                        <td className="px-4 py-3 text-right text-red-700">-PKR {expenseStats.total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}

          {selectedReport === "cashflow" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                  <p className="text-xl font-black text-green-600">PKR {netCashFlow.totalIncome.toLocaleString()}</p>
                  <p className="text-green-600/70 text-xs">Total Income</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
                  <p className="text-xl font-black text-red-600">PKR {netCashFlow.totalExpense.toLocaleString()}</p>
                  <p className="text-red-600/70 text-xs">Total Expense</p>
                </div>
                <div className={`rounded-xl p-4 border text-center ${netCashFlow.net >= 0 ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100"}`}>
                  <p className={`text-xl font-black ${netCashFlow.net >= 0 ? "text-blue-600" : "text-red-600"}`}>PKR {netCashFlow.net.toLocaleString()}</p>
                  <p className={`${netCashFlow.net >= 0 ? "text-blue-600/70" : "text-red-600/70"} text-xs`}>Net Cash Flow</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                  <p className="text-xl font-black text-purple-600">{accounts.length}</p>
                  <p className="text-purple-600/70 text-xs">Ledger Entries</p>
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Ledger Entries */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-gray-900 font-bold text-sm">Account Ledger</h3>
                    <span className="text-xs text-gray-400">{accounts.length} entries</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                          <th className="text-left px-4 py-3 font-medium">Date</th>
                          <th className="text-left px-4 py-3 font-medium">Category</th>
                          <th className="text-right px-4 py-3 font-medium">Amount</th>
                          <th className="text-center px-4 py-3 font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {accounts.filter((a) => a.date >= dateFrom && a.date <= dateTo).map((a) => (
                          <tr key={a.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-gray-500 text-xs">{formatDateDDMMYYYY(a.date)}</td>
                            <td className="px-4 py-3 text-gray-900 font-medium">{a.category}</td>
                            <td className={`px-4 py-3 text-right font-semibold ${a.type === "income" ? "text-green-600" : "text-red-600"}`}>
                              {a.type === "income" ? "+" : "-"}PKR {a.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.type === "income" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{a.type}</span>
                            </td>
                          </tr>
                        ))}
                        {accounts.length === 0 && (
                          <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No ledger entries</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Wallet Transactions */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-gray-900 font-bold text-sm">Wallet Activity</h3>
                    <span className="text-xs text-gray-400">{wallet.length} transactions</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                          <th className="text-left px-4 py-3 font-medium">Date</th>
                          <th className="text-left px-4 py-3 font-medium">Note</th>
                          <th className="text-right px-4 py-3 font-medium">Amount</th>
                          <th className="text-center px-4 py-3 font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {wallet.filter((w) => w.date >= dateFrom && w.date <= dateTo).map((w) => (
                          <tr key={w.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-gray-500 text-xs">{formatDateDDMMYYYY(w.date)}</td>
                            <td className="px-4 py-3 text-gray-900 font-medium text-sm">{w.note || w.remarks || "â€”"}</td>
                            <td className={`px-4 py-3 text-right font-semibold ${w.type === "Deposit" || w.type === "Credit" ? "text-green-600" : "text-red-600"}`}>
                              {w.type === "Deposit" || w.type === "Credit" ? "+" : "-"}PKR {w.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.type === "Deposit" || w.type === "Credit" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{w.type}</span>
                            </td>
                          </tr>
                        ))}
                        {wallet.length === 0 && (
                          <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No wallet transactions</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedReport === "accounts" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm">Full Account Ledger</h3>
                <p className="text-gray-400 text-xs mt-1">All income & expense entries</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">Description</th>
                      <th className="text-left px-4 py-3 font-medium">Category</th>
                      <th className="text-right px-4 py-3 font-medium">Debit</th>
                      <th className="text-right px-4 py-3 font-medium">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {accounts.filter((a) => a.date >= dateFrom && a.date <= dateTo).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDateDDMMYYYY(a.date)}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{a.description}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{a.category}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">{a.type === "expense" ? `PKR ${a.amount.toLocaleString()}` : "â€”"}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">{a.type === "income" ? `PKR ${a.amount.toLocaleString()}` : "â€”"}</td>
                      </tr>
                    ))}
                    {accounts.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No ledger entries found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReport === "bank" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm">Bank Accounts</h3>
                <p className="text-gray-400 text-xs mt-1">{bankAccounts.length} accounts</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
                {bankAccounts.map((b) => (
                  <div key={b.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <CreditCard size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{b.name}</p>
                        <p className="text-xs text-gray-500">{b.type}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">PKR {b.balance.toLocaleString()}</p>
                    <p className="text-xs font-mono text-gray-500">{b.accountNumber}</p>
                    <div className="mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${b.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
                {bankAccounts.length === 0 && (
                  <div className="col-span-3 text-center py-10 text-gray-400 text-sm">No bank accounts configured</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
