"use client";

import { useState, useMemo } from "react";
import {
  Wallet as WalletIcon, Plus, ArrowDown, ArrowUp, X, Search, Smartphone, User,
  Check, CheckSquare, Square, Landmark, Receipt, CheckCircle2, AlertTriangle, Package,
} from "lucide-react";
import { useFranchiseData } from "@/lib/FranchiseDataContext";
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
  const { auth, wallet, dso, dsms, sims, staffWalletPayments, sendStaffWalletPayment } = useFranchiseData();
  const [tab, setTab] = useState<Tab>("package");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"Package" | "Loan" | "Advance">("Package");
  const [sending, setSending] = useState(false);

  // Shared form state
  const [role, setRole] = useState<"DSO" | "DSM">("DSO");
  const [staffId, setStaffId] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  // Package specific
  const [simSearch, setSimSearch] = useState("");
  const [simId, setSimId] = useState("");
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

  const staffList = role === "DSO" ? dso : dsms;
  const selectedStaff = staffList.find((s) => s.id === staffId);
  const selectedSim = sims.find((s) => s.id === simId);

  const packagePayments = staffWalletPayments.filter((p) => p.type === "Package");
  const loanPayments = staffWalletPayments.filter((p) => p.type !== "Package");
  const outstandingLoans = loanPayments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);

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

  const resetForm = () => {
    setRole("DSO");
    setStaffId("");
    setAmount(0);
    setNote("");
    setSimSearch("");
    setSimId("");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">Issue SIM package amounts and manage loan/advance payments</p>
        </div>
        <button onClick={() => openModal(tab === "package" ? "Package" : "Loan")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2647] text-white font-bold text-sm rounded-xl hover:bg-[#144272] shadow-md transition-all hover:scale-105">
          <Plus size={16} /> {tab === "package" ? "Issue Package Amount" : "Send Loan / Advance"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabButton("package", "SIM Package", <Smartphone size={14} />)}
        {tabButton("loan", "Loan / Advance", <Receipt size={14} />)}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Payment ID</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Issued To</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">SIM / ICCID</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                  <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...packagePayments].reverse().map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                    <td className="px-6 py-4 text-right font-bold text-sm text-green-600">PKR {p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2"><Receipt size={16} className="text-[#0A2647]" /> Loan / Advance Payments</h3>
              <p className="text-gray-400 text-xs mt-0.5">Personal-need payments deducted from salary on payout</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">Outstanding: PKR {outstandingLoans.toLocaleString()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Payment ID</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Paid To</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Type</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Payment Detail</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Date</th>
                  <th className="text-right px-6 py-4 text-gray-500 text-xs font-medium uppercase">Amount</th>
                  <th className="text-left px-6 py-4 text-gray-500 text-xs font-medium uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...loanPayments].reverse().map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                    <td className="px-6 py-4 text-right font-bold text-sm text-green-600">PKR {p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${p.status === "Deducted" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {p.status === "Deducted" ? "Deducted from Salary" : "Paid / Pending"}
                      </span>
                      {p.settledMonth && <p className="text-[10px] text-gray-400 mt-1">{p.settledMonth}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loanPayments.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Receipt size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No loan/advance payments yet</p>
              <p className="text-gray-300 text-xs mt-1">Send loan/advance payments which will be deducted when salary is paid</p>
            </div>
          )}
        </div>
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
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {staffList.filter((p) => p.status === "Active").map((p) => (
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
                  {staffList.filter((p) => p.status === "Active").length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No active {role} found</p>
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
                          className="bg-transparent text-gray-900 text-sm focus:outline-none w-full appearance-none cursor-pointer">
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
    </div>
  );
}
