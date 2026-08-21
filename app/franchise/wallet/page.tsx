"use client";

import { useState, useMemo } from "react";
import {
  Wallet as WalletIcon, Plus, ArrowDown, ArrowUp, X, Search, Smartphone, User,
  Check, CheckSquare, Square, Landmark, Receipt, CheckCircle2, AlertTriangle, Package, Trash2, LayoutGrid, List, Edit, Save, RotateCcw,
} from "lucide-react";
import { useFranchiseData, type StaffWalletPayment } from "@/lib/FranchiseDataContext";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";

type Tab = "package" | "loan";

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

  const tabButton = (t: Tab, label: string, icon: any) => (
    <button onClick={() => setTab(t)}
      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? "bg-[#0A2647] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
      {icon} {label}
    </button>
  );

  const viewButton = (v: "table" | "cards", label: string, icon: any) => (
    <button onClick={() => setView(v)}
      className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${view === v ? "bg-[#0A2647] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
      {icon} {label}
    </button>
  );

  const paymentCard = (p: any, isPackage: boolean) => {
    const isLoan = p.type !== "Package";
    const st = p.status === "Deducted" ? { label: "Deducted", cls: "bg-green-50 text-green-700 border-green-200" } : { label: p.status || (isLoan ? "Outstanding" : "Paid"), cls: "bg-amber-50 text-amber-700 border-amber-200" };
    return (
      <div key={p.id} className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden min-w-0 ${selectedIds.includes(p.id) ? "border-[#0A2647] ring-1 ring-[#0A2647]/20" : ""}`}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${isPackage ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
              {isPackage ? <Smartphone size={18} /> : p.type === "Advance" ? <WalletIcon size={18} /> : <Landmark size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 text-sm font-bold truncate">{isPackage ? "SIM Package Issue" : `${p.type} Payment`}</p>
              <p className="text-gray-400 text-[10px] font-mono truncate">{p.id}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border shrink-0 whitespace-nowrap ${st.cls}`}>{st.label}</span>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0A2647]/10 flex items-center justify-center shrink-0"><User size={13} className="text-[#0A2647]" /></div>
            <div className="min-w-0">
              <p className="text-gray-900 text-sm font-medium truncate">{p.staffName}</p>
              <p className="text-gray-400 text-[10px] font-mono truncate">{p.staffId} · {p.role}</p>
            </div>
          </div>
          {isPackage ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Package size={13} className="text-blue-600" /></div>
              <div className="min-w-0">
                <p className="text-gray-900 text-xs font-mono font-medium truncate">{p.iccid || p.simNumber || p.simId || "\u2014"}</p>
                <p className="text-gray-400 text-[10px] truncate">{p.network || ""}{p.simNumber && p.iccid ? ` · ${p.simNumber}` : ""}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0"><Landmark size={13} className="text-green-600" /></div>
              <div className="min-w-0">
                <p className="text-gray-900 text-xs font-medium truncate">{p.bank || p.accountTitle || p.transactionId || p.accountNumber || "Cash"}</p>
                <p className="text-gray-400 text-[10px] font-mono truncate">{[p.accountNumber, p.transactionId].filter(Boolean).join(" · ") || (p.note || "\u2014")}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400">Date</p>
              <p className="text-xs font-medium text-gray-900">{formatDateDDMMYYYY(p.paymentDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400">Original Balance</p>
              <p className="text-xs font-bold text-gray-900">PKR {walletBalanceAt(p.paymentDate, p.amount).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400">Value</p>
              <p className="text-xs font-black text-green-600">PKR {p.amount.toLocaleString()}</p>
            </div>
          </div>
          {p.note && <p className="text-xs text-gray-500 truncate">Note: {p.note}</p>}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 accent-[#0A2647] cursor-pointer" />
            <span className="text-xs text-gray-500">Select</span>
          </label>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditingPayment(p)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors inline-flex items-center gap-1">
              <Edit size={12} /> Edit
            </button>
            <button onClick={() => handleDeleteOne(p.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-1">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">Issue SIM package amounts and manage loan/advance payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleResetWallet}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-all">
            <RotateCcw size={15} /> Reset
          </button>
          <button onClick={() => openModal(tab === "package" ? "Package" : "Loan")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
            <Plus size={16} /> {tab === "package" ? "Issue Package Amount" : "Send Loan / Advance"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabButton("package", "SIM Package", <Smartphone size={14} />)}
        {tabButton("loan", "Loan / Advance", <Receipt size={14} />)}
        <div className="ml-auto flex bg-white rounded-xl border border-gray-200 p-1">
          {viewButton("table", "Table", <List size={14} />)}
          {viewButton("cards", "Cards", <LayoutGrid size={14} />)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><WalletIcon size={18} /></div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">PKR {balance.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Balance</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-2"><ArrowDown size={18} /></div>
          <p className="text-2xl sm:text-3xl font-black text-green-600">PKR {deposits.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Deposits</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-2"><ArrowUp size={18} /></div>
          <p className="text-2xl sm:text-3xl font-black text-red-600">PKR {withdrawals.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Total Issued</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-2"><AlertTriangle size={18} /></div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">PKR {outstandingLoans.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Outstanding Loans</p>
        </div>
      </div>

      {/* Tab: SIM Package */}
      {tab === "package" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Smartphone size={16} className="text-[#0A2647]" /> SIM Package Issues</h3>
              <p className="text-gray-400 text-xs mt-0.5">Amounts issued to DSO/DSM wallets against SIM/ICCID reference</p>
            </div>
            <span className="px-2.5 py-1 bg-[#0A2647]/10 text-[#0A2647] rounded-lg text-xs font-bold">{packagePayments.length} Issue(s)</span>
          </div>
          {view === "cards" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
              {[...packagePayments].reverse().map((p) => paymentCard(p, true))}
            </div>
          )}
          {view === "table" && (<div className="overflow-x-auto">
            {selectedIds.length > 0 && (
              <div className="px-6 py-2.5 border-b border-red-100 bg-red-50/60 flex items-center justify-between gap-3">
                <p className="text-red-700 text-sm font-medium">{selectedIds.length} selected</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-medium border border-gray-200 hover:bg-gray-50">Clear</button>
                  <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 inline-flex items-center gap-1">
                    <Trash2 size={12} /> Delete Selected
                  </button>
                </div>
              </div>
            )}
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-center px-3 py-4 text-gray-500 text-xs font-medium uppercase w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#0A2647] cursor-pointer" />
                  </th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Payment ID</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Issued To</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">SIM / ICCID</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                  <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Balance</th>
                  <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Amount</th>
                  <th className="text-center px-4 py-4 text-gray-500 text-xs font-medium uppercase w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...packagePayments].reverse().map((p) => (
                  <tr key={p.id} className={`border-b border-gray-50 transition-colors ${selectedIds.includes(p.id) ? "bg-[#0A2647]/5" : "hover:bg-gray-50"}`}>
                    <td className="px-3 py-4 text-center">
                      <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 accent-[#0A2647] cursor-pointer" />
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-900 text-sm font-medium">{p.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0A2647]/10 flex items-center justify-center"><User size={13} className="text-[#0A2647]" /></div>
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{p.staffName}</p>
                          <p className="text-gray-400 text-[10px] font-mono">{p.staffId} &middot; {p.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Package size={13} className="text-blue-600" /></div>
                        <div className="min-w-0">
                          <p className="text-gray-900 text-xs font-mono font-medium truncate">{p.iccid || p.simNumber || p.simId || "\u2014"}</p>
                          <p className="text-gray-400 text-[10px]">{p.network || ""} {p.simNumber && p.iccid ? `&middot; ${p.simNumber}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{formatDateDDMMYYYY(p.paymentDate)}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">PKR {walletBalanceAt(p.paymentDate, p.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-green-600">PKR {p.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setEditingPayment(p)} className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors mx-auto" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteOne(p.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors mx-auto" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>)}
          {packagePayments.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Smartphone size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No package amounts issued yet</p>
              <p className="text-gray-300 text-xs mt-1">Issue package amounts against SIM/ICCID to credit DSO/DSM wallets</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Loan / Advance */}
      {tab === "loan" && (
        <>
          {/* Pending Payment Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><AlertTriangle size={16} className="text-amber-600" /> Pending Payment Requests</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Verify received amount then mark as received to clear the loan/advance</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">{pendingRequests.length} Pending</span>
              </div>
              <div className="divide-y divide-gray-50">
                {[...pendingRequests].reverse().map((r) => (
                  <div key={r.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        {r.paymentType === "Advance" ? <WalletIcon size={16} className="text-purple-600" /> : <Landmark size={16} className="text-purple-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{r.staffName} <span className="text-gray-400 text-xs font-normal">({r.role})</span></p>
                        <p className="text-gray-400 text-xs">{r.paymentType} Repayment &middot; {formatDateDDMMYYYY(r.paymentDate)} &middot; <span className="font-mono">{r.paymentId}</span></p>
                        {r.bank && <p className="text-gray-500 text-xs mt-0.5 truncate">{r.bank}{r.accountNumber ? ` \u00b7 ${r.accountNumber}` : ""}{r.transactionId ? ` \u00b7 Txn: ${r.transactionId}` : ""}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">PKR {r.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">Receiving</p>
                      </div>
                      <button onClick={() => handleReceive(r.id)} disabled={!!receivingId}
                        className="px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2">
                        <CheckCircle2 size={14} /> {receivingId === r.id ? "Verifying..." : "Mark Received"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Receipt size={16} className="text-[#0A2647]" /> Loan / Advance Payments</h3>
              <p className="text-gray-400 text-xs mt-0.5">Personal-need payments deducted from salary on payout</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">Outstanding: PKR {outstandingLoans.toLocaleString()}</span>
          </div>
          {view === "cards" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
              {[...loanPayments].reverse().map((p) => paymentCard(p, false))}
            </div>
          )}
          {view === "table" && (<div className="overflow-x-auto">
            {selectedIds.length > 0 && (
              <div className="px-6 py-2.5 border-b border-red-100 bg-red-50/60 flex items-center justify-between gap-3">
                <p className="text-red-700 text-sm font-medium">{selectedIds.length} selected</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 rounded-lg bg-white text-gray-700 text-xs font-medium border border-gray-200 hover:bg-gray-50">Clear</button>
                  <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 inline-flex items-center gap-1">
                    <Trash2 size={12} /> Delete Selected
                  </button>
                </div>
              </div>
            )}
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-center px-3 py-4 text-gray-500 text-xs font-medium uppercase w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-[#0A2647] cursor-pointer" />
                  </th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Payment ID</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Paid To</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Type</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Payment Detail</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                  <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Balance</th>
                  <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Amount</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                  <th className="text-center px-4 py-4 text-gray-500 text-xs font-medium uppercase w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...loanPayments].reverse().map((p) => (
                  <tr key={p.id} className={`border-b border-gray-50 transition-colors ${selectedIds.includes(p.id) ? "bg-[#0A2647]/5" : "hover:bg-gray-50"}`}>
                    <td className="px-3 py-4 text-center">
                      <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 accent-[#0A2647] cursor-pointer" />
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-900 text-sm font-medium">{p.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#0A2647]/10 flex items-center justify-center"><User size={13} className="text-[#0A2647]" /></div>
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{p.staffName}</p>
                          <p className="text-gray-400 text-[10px] font-mono">{p.staffId} &middot; {p.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${p.type === "Advance" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{p.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0"><Landmark size={13} className="text-green-600" /></div>
                        <div className="min-w-0">
                          <p className="text-gray-900 text-xs font-medium truncate">{p.bank || p.accountTitle || p.transactionId || p.accountNumber || "Cash"}</p>
                          <p className="text-gray-400 text-[10px] font-mono truncate">
                            {[p.accountNumber, p.transactionId].filter(Boolean).join(" \u00b7 ") || (p.note || "\u2014")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{formatDateDDMMYYYY(p.paymentDate)}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">PKR {walletBalanceAt(p.paymentDate, p.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-green-600">PKR {p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${p.status === "Deducted" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {p.status === "Deducted" ? "Deducted from Salary" : "Paid / Pending"}
                      </span>
                      {p.settledMonth && <p className="text-[10px] text-gray-400 mt-1">{p.settledMonth}</p>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setEditingPayment(p)} className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors mx-auto" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteOne(p.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors mx-auto" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>)}
          {loanPayments.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Receipt size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No loan/advance payments yet</p>
              <p className="text-gray-300 text-xs mt-1">Send loan/advance payments which will be deducted when salary is paid</p>
            </div>
          )}
        </div>
        </>
      )}

      {/* Send Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  {modalType === "Package" ? <Smartphone size={18} className="text-green-600" /> : <Receipt size={18} className="text-green-600" />}
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">{modalType === "Package" ? "Issue Package Amount" : `Send ${modalType} Payment`}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Credit to {modalType === "Package" ? "wallet against SIM reference" : "wallet as personal advance/loan"}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Role + Staff */}
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-2">Select Type &amp; Person</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {(["DSO", "DSM"] as const).map((t) => (
                    <button key={t} onClick={() => { setRole(t); setStaffId(""); }}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${role === t ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === t ? "bg-[#0A2647] text-white" : "bg-gray-100 text-gray-500"}`}>
                          {t === "DSO" ? <Smartphone size={14} /> : <User size={14} />}
                        </div>
                        <div>
                          <p className="text-gray-900 text-xs font-bold">{t}</p>
                          <p className="text-gray-400 text-[10px]">{t === "DSO" ? "Sales Officer" : "Sales Manager"}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all mb-2">
                  <Search size={16} className="text-gray-400" />
                  <input type="text" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)}
                    placeholder={`Search ${role} by name, ID or mobile...`}
                    className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
                  {staffSearch && <button onClick={() => setStaffSearch("")} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeStaff.map((p) => (
                    <button key={p.id} onClick={() => setStaffId(p.id)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${staffId === p.id ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{p.name}</p>
                        <p className="text-gray-400 text-xs font-mono">{p.id} &middot; {p.mobile}</p>
                      </div>
                      {staffId === p.id && <Check size={16} className="text-[#0A2647] flex-shrink-0" />}
                    </button>
                  ))}
                  {activeStaff.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">{staffSearch ? `No ${role} matches "${staffSearch}"` : `No active ${role} found`}</p>
                  )}
                </div>
              </div>

              {/* Package: SIM reference */}
              {modalType === "Package" && (
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-2">SIM / ICCID Reference</label>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-[#0A2647]/30 focus-within:ring-2 focus-within:ring-[#0A2647]/10 transition-all mb-2">
                    <Search size={16} className="text-gray-400" />
                    <input type="text" value={simSearch} onChange={(e) => setSimSearch(e.target.value)}
                      placeholder="Search by ICCID, SIM number or network..."
                      className="bg-transparent text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none w-full" />
                    {simSearch && <button onClick={() => setSimSearch("")} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>}
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {simResults.slice(0, 50).map((s) => (
                      <button key={s.id} onClick={() => setSimId(s.id)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${simId === s.id ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                        <div className="flex-shrink-0">
                          {simId === s.id ? <CheckSquare size={18} className="text-[#0A2647]" /> : <Square size={18} className="text-gray-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 text-sm font-mono font-medium truncate">{s.iccid || s.id}</p>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${s.network === "Jazz" ? "bg-red-50 text-red-600" : s.network === "Telenor" ? "bg-blue-50 text-blue-600" : s.network === "Ufone" ? "bg-green-50 text-green-600" : "bg-cyan-50 text-cyan-600"}`}>{s.network}</span>
                          </div>
                          <p className="text-gray-400 text-xs font-mono mt-0.5 truncate">{s.simNumber} &middot; {s.status}</p>
                        </div>
                      </button>
                    ))}
                    {simResults.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No SIMs match your search</p>}
                  </div>
                </div>
              )}

              {/* Loan/Advance: type + payment detail */}
              {modalType !== "Package" && (
                <>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-2">Payment Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Loan", "Advance"] as const).map((t) => (
                        <button key={t} onClick={() => setPaymentType(t)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${paymentType === t ? "border-[#0A2647] bg-[#0A2647]/5" : "border-gray-200 hover:border-gray-300"}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentType === t ? "bg-[#0A2647] text-white" : "bg-gray-100 text-gray-500"}`}>
                              {t === "Loan" ? <Landmark size={14} /> : <WalletIcon size={14} />}
                            </div>
                            <p className="text-gray-900 text-xs font-bold">{t}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Bank</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex-1">
                        <Landmark size={16} className="text-gray-400" />
                        <select value={bank} onChange={(e) => setBank(e.target.value)}
                          className="bg-transparent text-gray-900 text-sm focus:outline-none w-full appearance-none cursor-pointer pl-1">
                          <option value="">Select Bank</option>
                          {PAKISTAN_BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <input type="text" value={accountTitle} onChange={(e) => setAccountTitle(e.target.value)} placeholder="Account Title"
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Account Number / IBAN (Optional)</label>
                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter account number or IBAN"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Transaction ID (Optional)</label>
                    <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. TID-83920"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                  </div>
                </>
              )}

              {/* Amount + Date + Note */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Amount (PKR)</label>
                  <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="0"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Date</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Note</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={modalType === "Package" ? "e.g. Jazz package load" : "e.g. family emergency"}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>

              {modalType !== "Package" && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 text-sm font-medium">{modalType === "Advance" ? "Advance Salary" : "Loan"} deduction</p>
                      <p className="text-blue-600 text-xs mt-1">This {modalType === "Advance" ? "advance" : "loan"} will be added as a deduction when salary is generated and removed once salary is paid.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <div className="flex-1" />
              <button onClick={handleSend} disabled={!staffId || amount <= 0 || sending || (modalType === "Package" && !simId)}
                className="px-6 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <CheckCircle2 size={14} /> {sending ? "Sending..." : modalType === "Package" ? "Issue Amount" : "Send Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingPayment(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Edit {editingPayment.type === "Package" ? "Package" : editingPayment.type === "Advance" ? "Advance Payment" : "Loan Payment"}</h3>
                <p className="text-xs text-gray-400 font-mono">{editingPayment.id}</p>
              </div>
              <button onClick={() => setEditingPayment(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-[#0A2647] flex items-center justify-center text-white font-bold">{editingPayment.staffName.slice(0, 1)}</div>
                <div>
                  <p className="text-gray-900 text-sm font-bold">{editingPayment.staffName}</p>
                  <p className="text-gray-400 text-xs font-mono">{editingPayment.staffId} &middot; {editingPayment.role} &middot; {editingPayment.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Amount (PKR)</label>
                  <input type="number" value={editingPayment.amount ?? ""} onChange={(e) => patchEdit({ amount: Number(e.target.value) })} min={0}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">Date</label>
                  <input type="date" value={editingPayment.paymentDate || ""} onChange={(e) => patchEdit({ paymentDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              </div>

              {editingPayment.type === "Package" ? (
                <div>
                  <label className="block text-gray-500 text-xs font-medium mb-1.5">SIM / ICCID</label>
                  <input type="text" value={editingPayment.iccid || editingPayment.simNumber || editingPayment.simId || ""} onChange={(e) => patchEdit({ iccid: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Bank</label>
                    <input type="text" value={editingPayment.bank || ""} onChange={(e) => patchEdit({ bank: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Account Title</label>
                    <input type="text" value={editingPayment.accountTitle || ""} onChange={(e) => patchEdit({ accountTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Account Number</label>
                    <input type="text" value={editingPayment.accountNumber || ""} onChange={(e) => patchEdit({ accountNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs font-medium mb-1.5">Transaction ID</label>
                    <input type="text" value={editingPayment.transactionId || ""} onChange={(e) => patchEdit({ transactionId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-500 text-xs font-medium mb-1.5">Note</label>
                <input type="text" value={editingPayment.note || ""} onChange={(e) => patchEdit({ note: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#0A2647]/50" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditingPayment(null)} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200">Cancel</button>
              <div className="flex-1" />
              <button onClick={async () => {
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
              }} disabled={!editingPayment || editingPayment.amount <= 0 || savingEdit}
                className="px-6 py-2.5 bg-[#0A2647] text-white text-sm font-bold rounded-xl hover:bg-[#144272] inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Save size={14} /> {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
