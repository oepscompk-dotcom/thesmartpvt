"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Wallet as WalletIcon, Plus, ArrowDown, ArrowUp, X, Search, Smartphone, User,
  Check, CheckSquare, Square, Landmark, Receipt, CheckCircle2, AlertTriangle, Package, Trash2, LayoutGrid, List, Edit, Save, RotateCcw, Inbox,
} from "lucide-react";
import { useFranchiseData, type StaffWalletPayment } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

type Tab = "package" | "loan";

const PAGE_SIZE = 8;

const PAKISTAN_BANKS = [
  "Abhi Microfinance Bank", "Al Baraka Bank Pakistan", "Allied Bank Limited (ABL)", "APNA Microfinance Bank",
  "ASA Microfinance Bank", "Askari Bank", "Bank Al Habib", "Bank Alfalah", "BankIslami Pakistan",
  "Bank Makramah Limited", "Bank of China Pakistan", "Bank of Khyber", "Citi Bank Pakistan",
  "Dubai Islamic Bank Pakistan", "Easypaisa", "Easypaisa Digital Bank", "Faysal Bank", "FINCA Microfinance Bank",
  "Finja", "First Women Bank", "Habib Bank Limited (HBL)", "Habib Metropolitan Bank",
  "Industrial and Commercial Bank of China (ICBC) Pakistan", "JS Bank", "JazzCash", "Khushhali Microfinance Bank",
  "MCB Bank", "MCB Islamic Bank", "Meezan Bank", "Mobilink Bank", "National Bank of Pakistan (NBP)",
  "NayaPay", "NRSP Microfinance Bank", "OPay", "Raqami Islamic Digital Bank", "SadaPay", "Sindh Bank",
  "Soneri Bank", "Standard Chartered Bank Pakistan", "The Bank of Punjab (BOP)", "United Bank Limited (UBL)",
  "U Microfinance Bank", "Zarai Taraqiati Bank Limited (ZTBL)", "Zindigi",
];

export default function WalletPage() {
  const { auth, wallet, dso, dsms, sims, staffWalletPayments, sendStaffWalletPayment, deleteStaffWalletPayment, updateStaffWalletPayment, paymentRequests, receiveStaffPaymentRequest, resetWallet } = useFranchiseData();
  const [tab, setTab] = useState<Tab>("package");
  const [view, setView] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"Package" | "Loan" | "Advance">("Package");
  const [sending, setSending] = useState(false);
  const [receivingId, setReceivingId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingPayment, setEditingPayment] = useState<StaffWalletPayment | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const patchEdit = (patch: Partial<StaffWalletPayment>) => setEditingPayment((p) => (p ? { ...p, ...patch } : p));

  // Shared form state
  const [role, setRole] = useState<"DSO" | "DSM">("DSO");
  const [staffId, setStaffId] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  // Package specific
  const [simSearch, setSimSearch] = useState("");
  const [simId, setSimId] = useState("");
  // Staff search
  const [staffSearch, setStaffSearch] = useState("");
  // Loan/Advance specific
  const [paymentType, setPaymentType] = useState<"Loan" | "Advance">("Loan");
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  const balance = wallet.reduce((sum, w) => w.type === "Deposit" ? sum + w.amount : sum - w.amount, 0);
  const deposits = wallet.filter((w) => w.type === "Deposit").reduce((s, w) => s + w.amount, 0);
  const withdrawals = wallet.filter((w) => w.type === "Withdrawal").reduce((s, w) => s + w.amount, 0);
  const walletBalanceAt = (date: string, ownAmount: number) => {
    const upTo = wallet.filter((w) => w.date <= date);
    return upTo.reduce((s, w) => (w.type === "Deposit" ? s + w.amount : s - w.amount), 0) + ownAmount;
  };

  const staffList = role === "DSO" ? dso : dsms;
  const selectedStaff = staffList.find((s) => s.id === staffId);
  const selectedSim = sims.find((s) => s.id === simId);

  const packagePayments = staffWalletPayments.filter((p) => p.type === "Package");
  const loanPayments = staffWalletPayments.filter((p) => p.type !== "Package");
  const outstandingLoans = loanPayments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pendingRequests = paymentRequests.filter((r) => r.status === "Pending");

  const currentRows = tab === "package" ? packagePayments : loanPayments;
  const allSelected = currentRows.length > 0 && currentRows.every((p) => selectedIds.includes(p.id));
  const toggleSelect = (id: string) => setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : currentRows.map((p) => p.id));
  const handleDeleteOne = async (id: string) => {
    if (!confirm("Delete this payment record?")) return;
    await deleteStaffWalletPayment(id);
    setSelectedIds((p) => p.filter((x) => x !== id));
  };
  const handleBulkDelete = async () => {
    if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} selected payment record(s)?`)) return;
    await Promise.all(selectedIds.map((id) => deleteStaffWalletPayment(id)));
    setSelectedIds([]);
  };
  const handleResetWallet = async () => {
    if (!confirm("Reset wallet? This permanently deletes ALL deposit and withdrawal history. Balance, Total Deposits and Total Issued will restart from 0.")) return;
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await resetWallet();
  };

  const handleReceive = async (requestId: string) => {
    if (receivingId) return;
    setReceivingId(requestId);
    try {
      await receiveStaffPaymentRequest(requestId);
    } catch (e) {
      console.error("Failed to mark received:", e);
      alert("Failed to mark payment received. Please try again.");
    } finally {
      setReceivingId("");
    }
  };

  const simResults = useMemo(() => {
    if (!simSearch.trim()) return sims;
    const q = simSearch.toLowerCase();
    return sims.filter((s) =>
      (s.iccid || "").toLowerCase().includes(q) ||
      (s.simNumber || "").toLowerCase().includes(q) ||
      (s.network || "").toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [sims, simSearch]);

  const activeStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    return staffList.filter((p) => p.status === "Active" && (!q || `${p.name} ${p.id} ${p.mobile || ""}`.toLowerCase().includes(q)));
  }, [staffList, staffSearch]);

  useEffect(() => { setPage(1); }, [tab]);

  const pageCount = Math.max(1, Math.ceil(currentRows.length / PAGE_SIZE));
  const pagedRows = currentRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetForm = () => {
    setRole("DSO");
    setStaffId("");
    setAmount(0);
    setNote("");
    setSimSearch("");
    setSimId("");
    setStaffSearch("");
    setPaymentType("Loan");
    setAccountNumber("");
    setBank("");
    setAccountTitle("");
    setTransactionId("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
  };

  const openModal = (type: "Package" | "Loan" | "Advance") => {
    setModalType(type);
    resetForm();
    setShowModal(true);
  };

  const handleSend = async () => {
    if (!staffId || amount <= 0) return;
    const staff = (role === "DSO" ? dso : dsms).find((s) => s.id === staffId);
    if (!staff) return;
    setSending(true);
    try {
      await sendStaffWalletPayment({
        role,
        staffId,
        staffName: staff.name,
        type: modalType,
        simId: modalType === "Package" ? simId : undefined,
        iccid: modalType === "Package" ? selectedSim?.iccid : undefined,
        simNumber: modalType === "Package" ? selectedSim?.simNumber : undefined,
        network: modalType === "Package" ? selectedSim?.network : undefined,
        amount,
        note: note || undefined,
        accountNumber: accountNumber || undefined,
        bank: bank || undefined,
        accountTitle: accountTitle || undefined,
        transactionId: transactionId || undefined,
        paymentDate,
      });
      setShowModal(false);
      resetForm();
    } catch (e) {
      console.error("Failed to send payment:", e);
      alert("Failed to send payment. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const paymentCard = (p: any) => {
    const isPackage = p.type === "Package";
    const st = p.status === "Deducted" ? "positive" : "warning";
    const stLabel = p.status === "Deducted" ? "Deducted" : (p.status || (isPackage ? "Paid" : "Outstanding"));
    return (
      <div key={p.id} className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md min-w-0 ${selectedIds.includes(p.id) ? "border-brand-600 ring-1 ring-brand-600/20" : "border-slate-200"}`}>
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${isPackage ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
              {isPackage ? <Smartphone size={18} /> : p.type === "Advance" ? <WalletIcon size={18} /> : <Landmark size={18} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{isPackage ? "SIM Package Issue" : `${p.type} Payment`}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{p.id}</p>
            </div>
          </div>
          <StatusPill label={stLabel} tone={st} />
        </div>
        <div className="space-y-2.5 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50"><User size={13} className="text-brand-600" /></div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{p.staffName}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{p.staffId} · {p.role}</p>
            </div>
          </div>
          {isPackage ? (
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50"><Package size={13} className="text-blue-600" /></div>
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-medium text-foreground">{p.iccid || p.simNumber || p.simId || "\u2014"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{p.network || ""}{p.simNumber && p.iccid ? ` · ${p.simNumber}` : ""}</p>
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-50"><Landmark size={13} className="text-green-600" /></div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{p.bank || p.accountTitle || p.transactionId || p.accountNumber || "Cash"}</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">{[p.accountNumber, p.transactionId].filter(Boolean).join(" · ") || (p.note || "\u2014")}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-muted-foreground">Date</p>
              <p className="text-xs font-medium text-foreground">{formatDateDDMMYYYY(p.paymentDate)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-muted-foreground">Original Balance</p>
              <p className="text-xs font-bold text-foreground">PKR {walletBalanceAt(p.paymentDate, p.amount).toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] text-muted-foreground">Value</p>
              <p className="text-xs font-black text-green-600">PKR {p.amount.toLocaleString()}</p>
            </div>
          </div>
          {p.note && <p className="truncate text-xs text-muted-foreground">Note: {p.note}</p>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="h-4 w-4 cursor-pointer accent-brand-600" />
            <span className="text-xs text-muted-foreground">Select</span>
          </label>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEditingPayment(p)}>
              <Edit size={12} /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteOne(p.id)}>
              <Trash2 size={12} /> Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    { label: "Balance", value: `PKR ${balance.toLocaleString()}`, icon: WalletIcon, iconClass: "text-green-600 bg-green-50" },
    { label: "Total Deposits", value: `PKR ${deposits.toLocaleString()}`, icon: ArrowDown, iconClass: "text-green-600 bg-green-50" },
    { label: "Total Issued", value: `PKR ${withdrawals.toLocaleString()}`, icon: ArrowUp, iconClass: "text-red-600 bg-red-50" },
    { label: "Outstanding Loans", value: `PKR ${outstandingLoans.toLocaleString()}`, icon: AlertTriangle, iconClass: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[{ label: "Franchise", href: "/franchise" }, { label: "Wallet" }]}
        title="Wallet"
        description="Issue SIM package amounts and manage loan/advance payments"
        actions={
          <>
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleResetWallet}>
              <RotateCcw size={15} /> Reset
            </Button>
            <Button onClick={() => openModal(tab === "package" ? "Package" : "Loan")}>
              <Plus size={16} /> {tab === "package" ? "Issue Package Amount" : "Send Loan / Advance"}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={tab === "package" ? "primary" : "outline"} onClick={() => setTab("package")}>
          <Smartphone size={14} /> SIM Package
        </Button>
        <Button variant={tab === "loan" ? "primary" : "outline"} onClick={() => setTab("loan")}>
          <Receipt size={14} /> Loan / Advance
        </Button>
        <div className="ml-auto flex rounded-lg border border-slate-200 bg-white p-1">
          <button onClick={() => setView("table")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${view === "table" ? "bg-brand-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
            <List size={14} /> Table
          </button>
          <button onClick={() => setView("cards")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${view === "cards" ? "bg-brand-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
            <LayoutGrid size={14} /> Cards
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconClass={s.iconClass} />
        ))}
      </div>

      {tab === "package" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle>SIM Package Issues</CardTitle>
            <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">{packagePayments.length} Issue(s)</span>
          </CardHeader>
          <CardContent className="pt-4">
            {view === "cards" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...pagedRows].reverse().map((p) => paymentCard(p))}
              </div>
            )}
            {view === "table" && (<div className="overflow-x-auto">
              {selectedIds.length > 0 && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/60 px-4 py-2.5">
                  <p className="text-sm font-medium text-red-700">{selectedIds.length} selected</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>Clear</Button>
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete}><Trash2 size={12} /> Delete Selected</Button>
                  </div>
                </div>
              )}
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="w-10 px-3 py-3 text-center">
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer accent-brand-600" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Issued To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">SIM / ICCID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Balance</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...pagedRows].reverse().map((p) => (
                    <tr key={p.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${selectedIds.includes(p.id) ? "bg-brand-50" : ""}`}>
                      <td className="px-3 py-4 text-center">
                        <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="h-4 w-4 cursor-pointer accent-brand-600" />
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-medium text-foreground">{p.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50"><User size={13} className="text-brand-600" /></div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.staffName}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{p.staffId} &middot; {p.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50"><Package size={13} className="text-blue-600" /></div>
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs font-medium text-foreground">{p.iccid || p.simNumber || p.simId || "\u2014"}</p>
                            <p className="text-[10px] text-muted-foreground">{p.network || ""} {p.simNumber && p.iccid ? `&middot; ${p.simNumber}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{formatDateDDMMYYYY(p.paymentDate)}</td>
                      <td className="px-4 py-4 text-right text-sm font-bold text-foreground">PKR {walletBalanceAt(p.paymentDate, p.amount).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right text-sm font-bold text-green-600">PKR {p.amount.toLocaleString()}</td>
                      <td className="px-3 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setEditingPayment(p)} className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 transition-colors hover:bg-indigo-100" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteOne(p.id)} className="rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>)}
            {view === "table" && <Pagination page={page} totalPages={pageCount} onChange={setPage} />}
            {currentRows.length === 0 && (
              <EmptyState icon={Inbox} title="No package amounts issued yet" description="Issue package amounts against SIM/ICCID to credit DSO/DSM wallets" />
            )}
          </CardContent>
        </Card>
      )}

      {tab === "loan" && (
        <>
          {pendingRequests.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber-600" /> Pending Payment Requests</CardTitle>
                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{pendingRequests.length} Pending</span>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 pt-4">
                {[...pendingRequests].reverse().map((r) => (
                  <div key={r.id} className="flex flex-col gap-4 py-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
                        {r.paymentType === "Advance" ? <WalletIcon size={16} className="text-purple-600" /> : <Landmark size={16} className="text-purple-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{r.staffName} <span className="text-xs font-normal text-muted-foreground">({r.role})</span></p>
                        <p className="text-xs text-muted-foreground">{r.paymentType} Repayment &middot; {formatDateDDMMYYYY(r.paymentDate)} &middot; <span className="font-mono">{r.paymentId}</span></p>
                        {r.bank && <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.bank}{r.accountNumber ? ` \u00b7 ${r.accountNumber}` : ""}{r.transactionId ? ` \u00b7 Txn: ${r.transactionId}` : ""}</p>}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-black text-foreground">PKR {r.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Receiving</p>
                      </div>
                      <Button onClick={() => handleReceive(r.id)} disabled={!!receivingId}>
                        <CheckCircle2 size={14} /> {receivingId === r.id ? "Verifying..." : "Mark Received"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="flex items-center gap-2"><Receipt size={16} /> Loan / Advance Payments</CardTitle>
              <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Outstanding: PKR {outstandingLoans.toLocaleString()}</span>
            </CardHeader>
            <CardContent className="pt-4">
              {view === "cards" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[...pagedRows].reverse().map((p) => paymentCard(p))}
                </div>
              )}
              {view === "table" && (<div className="overflow-x-auto">
                {selectedIds.length > 0 && (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/60 px-4 py-2.5">
                    <p className="text-sm font-medium text-red-700">{selectedIds.length} selected</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>Clear</Button>
                      <Button size="sm" variant="destructive" onClick={handleBulkDelete}><Trash2 size={12} /> Delete Selected</Button>
                    </div>
                  </div>
                )}
                <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="w-10 px-3 py-3 text-center">
                        <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer accent-brand-600" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Paid To</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment Detail</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Balance</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                      <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...pagedRows].reverse().map((p) => (
                      <tr key={p.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${selectedIds.includes(p.id) ? "bg-brand-50" : ""}`}>
                        <td className="px-3 py-4 text-center">
                          <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="h-4 w-4 cursor-pointer accent-brand-600" />
                        </td>
                        <td className="px-4 py-4 font-mono text-sm font-medium text-foreground">{p.id}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50"><User size={13} className="text-brand-600" /></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.staffName}</p>
                              <p className="font-mono text-[10px] text-muted-foreground">{p.staffId} &middot; {p.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusPill label={p.type} tone={p.type === "Advance" ? "accent" : "neutral"} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-50"><Landmark size={13} className="text-green-600" /></div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-foreground">{p.bank || p.accountTitle || p.transactionId || p.accountNumber || "Cash"}</p>
                              <p className="truncate font-mono text-[10px] text-muted-foreground">
                                {[p.accountNumber, p.transactionId].filter(Boolean).join(" \u00b7 ") || (p.note || "\u2014")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{formatDateDDMMYYYY(p.paymentDate)}</td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-foreground">PKR {walletBalanceAt(p.paymentDate, p.amount).toLocaleString()}</td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-green-600">PKR {p.amount.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <StatusPill label={p.status === "Deducted" ? "Deducted from Salary" : "Paid / Pending"} tone={p.status === "Deducted" ? "positive" : "warning"} />
                          {p.settledMonth && <p className="mt-1 text-[10px] text-muted-foreground">{p.settledMonth}</p>}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setEditingPayment(p)} className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 transition-colors hover:bg-indigo-100" title="Edit"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteOne(p.id)} className="rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>)}
              {view === "table" && <Pagination page={page} totalPages={pageCount} onChange={setPage} />}
              {currentRows.length === 0 && (
                <EmptyState icon={Receipt} title="No loan/advance payments yet" description="Send loan/advance payments which will be deducted when salary is paid" />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Send Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  {modalType === "Package" ? <Smartphone size={18} className="text-green-600" /> : <Receipt size={18} className="text-green-600" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{modalType === "Package" ? "Issue Package Amount" : `Send ${modalType} Payment`}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Credit to {modalType === "Package" ? "wallet against SIM reference" : "wallet as personal advance/loan"}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Select Type &amp; Person</label>
                <div className="mb-3 grid grid-cols-2 gap-3">
                  {(["DSO", "DSM"] as const).map((t) => (
                    <button key={t} onClick={() => { setRole(t); setStaffId(""); }}
                      className={`rounded-xl border-2 p-3 text-left transition-all ${role === t ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${role === t ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                          {t === "DSO" ? <Smartphone size={14} /> : <User size={14} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{t}</p>
                          <p className="text-[10px] text-muted-foreground">{t === "DSO" ? "Sales Officer" : "Sales Manager"}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mb-2">
                  <SearchInput
                    placeholder={`Search ${role} by name, ID or mobile...`}
                    value={staffSearch}
                    onChange={(v) => setStaffSearch(v)}
                  />
                </div>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {activeStaff.map((p) => (
                    <button key={p.id} onClick={() => setStaffId(p.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${staffId === p.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{p.id} &middot; {p.mobile}</p>
                      </div>
                      {staffId === p.id && <Check size={16} className="flex-shrink-0 text-brand-600" />}
                    </button>
                  ))}
                  {activeStaff.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">{staffSearch ? `No ${role} matches "${staffSearch}"` : `No active ${role} found`}</p>
                  )}
                </div>
              </div>

              {modalType === "Package" && (
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">SIM / ICCID Reference</label>
                  <div className="mb-2">
                    <SearchInput
                      placeholder="Search by ICCID, SIM number or network..."
                      value={simSearch}
                      onChange={(v) => setSimSearch(v)}
                    />
                  </div>
                  <div className="max-h-44 space-y-2 overflow-y-auto">
                    {simResults.slice(0, 50).map((s) => (
                      <button key={s.id} onClick={() => setSimId(s.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${simId === s.id ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="flex-shrink-0">
                          {simId === s.id ? <CheckSquare size={18} className="text-brand-600" /> : <Square size={18} className="text-slate-300" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-mono text-sm font-medium text-foreground">{s.iccid || s.id}</p>
                            <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${s.network === "Jazz" ? "bg-red-50 text-red-600" : s.network === "Telenor" ? "bg-blue-50 text-blue-600" : s.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{s.network}</span>
                          </div>
                          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{s.simNumber} &middot; {s.status}</p>
                        </div>
                      </button>
                    ))}
                    {simResults.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No SIMs match your search</p>}
                  </div>
                </div>
              )}

              {modalType !== "Package" && (
                <>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Payment Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Loan", "Advance"] as const).map((t) => (
                        <button key={t} onClick={() => setPaymentType(t)}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${paymentType === t ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex items-center gap-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${paymentType === t ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                              {t === "Loan" ? <Landmark size={14} /> : <WalletIcon size={14} />}
                            </div>
                            <p className="text-xs font-bold text-foreground">{t}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bank</label>
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                        <Landmark size={15} className="text-muted-foreground" />
                        <select value={bank} onChange={(e) => setBank(e.target.value)}
                          className="w-full cursor-pointer appearance-none bg-transparent pl-1 text-sm text-foreground focus:outline-none">
                          <option value="">Select Bank</option>
                          {PAKISTAN_BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <input type="text" value={accountTitle} onChange={(e) => setAccountTitle(e.target.value)} placeholder="Account Title"
                        className="h-8 flex-1 rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Account Number / IBAN (Optional)</label>
                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter account number or IBAN"
                      className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Transaction ID (Optional)</label>
                    <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. TID-83920"
                      className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount (PKR)</label>
                  <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="0"
                    className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Note</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={modalType === "Package" ? "e.g. Jazz package load" : "e.g. family emergency"}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
              </div>

              {modalType !== "Package" && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">{modalType === "Advance" ? "Advance Salary" : "Loan"} deduction</p>
                      <p className="mt-1 text-xs text-blue-600">This {modalType === "Advance" ? "advance" : "loan"} will be added as a deduction when salary is generated and removed once salary is paid.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <div className="flex-1" />
              <Button onClick={handleSend} disabled={!staffId || amount <= 0 || sending || (modalType === "Package" && !simId)}>
                <CheckCircle2 size={14} /> {sending ? "Sending..." : modalType === "Package" ? "Issue Amount" : "Send Payment"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setEditingPayment(null)}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Edit {editingPayment.type === "Package" ? "Package" : editingPayment.type === "Advance" ? "Advance Payment" : "Loan Payment"}</h3>
                <p className="font-mono text-xs text-muted-foreground">{editingPayment.id}</p>
              </div>
              <button onClick={() => setEditingPayment(null)} className="rounded-lg bg-slate-100 p-1.5 text-muted-foreground transition-colors hover:bg-slate-200 hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{editingPayment.staffName.slice(0, 1)}</div>
                <div>
                  <p className="text-sm font-bold text-foreground">{editingPayment.staffName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{editingPayment.staffId} &middot; {editingPayment.role} &middot; {editingPayment.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount (PKR)</label>
                  <input type="number" value={editingPayment.amount ?? ""} onChange={(e) => patchEdit({ amount: Number(e.target.value) })} min={0}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date</label>
                  <input type="date" value={editingPayment.paymentDate || ""} onChange={(e) => patchEdit({ paymentDate: e.target.value })}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                </div>
              </div>

              {editingPayment.type === "Package" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">SIM / ICCID</label>
                  <input type="text" value={editingPayment.iccid || editingPayment.simNumber || editingPayment.simId || ""} onChange={(e) => patchEdit({ iccid: e.target.value })}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bank</label>
                    <input type="text" value={editingPayment.bank || ""} onChange={(e) => patchEdit({ bank: e.target.value })}
                      className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Account Title</label>
                    <input type="text" value={editingPayment.accountTitle || ""} onChange={(e) => patchEdit({ accountTitle: e.target.value })}
                      className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Account Number</label>
                    <input type="text" value={editingPayment.accountNumber || ""} onChange={(e) => patchEdit({ accountNumber: e.target.value })}
                      className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Transaction ID</label>
                    <input type="text" value={editingPayment.transactionId || ""} onChange={(e) => patchEdit({ transactionId: e.target.value })}
                      className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Note</label>
                <input type="text" value={editingPayment.note || ""} onChange={(e) => patchEdit({ note: e.target.value })}
                  className="h-8 w-full rounded-lg border border-slate-200 bg-background px-2 text-sm text-foreground outline-none transition-colors focus:border-brand-500" />
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="secondary" onClick={() => setEditingPayment(null)}>Cancel</Button>
              <div className="flex-1" />
              <Button onClick={async () => {
                if (!editingPayment || savingEdit) return;
                setSavingEdit(true);
                try {
                  await updateStaffWalletPayment(editingPayment.id, {
                    amount: editingPayment.amount,
                    paymentDate: editingPayment.paymentDate,
                    iccid: editingPayment.iccid,
                    bank: editingPayment.bank,
                    accountTitle: editingPayment.accountTitle,
                    accountNumber: editingPayment.accountNumber,
                    transactionId: editingPayment.transactionId,
                    note: editingPayment.note,
                  });
                  setEditingPayment(null);
                } catch (e) { console.error(e); alert("Failed to update payment. Please try again."); }
                setSavingEdit(false);
              }} disabled={!editingPayment || editingPayment.amount <= 0 || savingEdit}>
                <Save size={14} /> {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
